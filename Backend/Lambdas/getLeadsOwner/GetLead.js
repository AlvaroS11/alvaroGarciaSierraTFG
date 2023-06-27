import { QueryCommand, GetItemCommand, BatchGetItemCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { ddbClient } from "./ddbClient.js";
import AWS from "aws-sdk"

const lambda = new AWS.Lambda();

var localId, weekStart, pageSize;

export const handler = async (event) => {
    console.log("request:", JSON.stringify(event, undefined, 2))
    let body;
    localId = event.pathParameters.localId;
    weekStart = event.pathParameters.weekStart;
    pageSize = event.pathParameters.pageSize;

    try {
        await authenticateUser(event)
        body = await getLeadsByOwner(event)
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*", // Required for CORS support to work
                "Access-Control-Allow-Credentials": true, // Required for cookies, authorization headers with HTTPS
            },
            body: JSON.stringify({
                message: `Succesfully finished operation "${event.httpMethod}"`,
                body: body
            })
        };
    }
    catch (error) {
        console.log(error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Failed to perform operation",
                errorMsg: error.message,
                errorStac: error.stack
            })
        }
    }
}


async function authenticateUser(event) {

    if (event.requestContext.authorizer.principalId == "local" && event.requestContext.authorizer.sub == localId)
        return true
    else
        throw new Error('User ID does not match request');
}


const getLeadsByOwner = async (event) => {
    try {

        try {
            const result = await getDays(localId, weekStart, pageSize)

            if (result) {

                return await getLeads(result)
            }
            else {
                const payload = {
                    pathParameters: {
                        local: localId,
                        day: weekStart
                    },

                }
                const payloadStr = JSON.stringify(payload)

                //CALL LAMBDA AND TRY AGAIN
                const lambdaParams = {
                    FunctionName: 'getTimes',
                    InvocationType: 'RequestResponse',
                    LogType: 'None',
                    Payload: payloadStr
                }

                const lambdaResponse = await lambda.invoke(lambdaParams).promise()
                const newStartingDay = JSON.parse(lambdaResponse.Payload)
                const day1 = newStartingDay["body"]
                const finalDay = JSON.parse(day1)
                lastKey = finalDay.body.day
                const result = await getDays(localId, weekStart, pageSize, lastKey)
                return await getLeads(result)

            }
        }
        catch (err) {
            console.log(err)
        }
    }
    catch (err) {
        console.error(err);
        return { statusCode: 500, body: 'Error retrieving leads' };
    }

}


function chunkArray(array, chunkSize) {
    const chunks = [];
    let i = 0;
    while (i < array.length) {
        chunks.push(array.slice(i, i + chunkSize));
        i += chunkSize;
    }
    return chunks;
}

async function getDays(localId, weekStart, pageSize) {

    const params = {
        TableName: process.env.DYNAMODB_LEADSDAY_NAME,
        KeyConditionExpression: 'localId = :localId and #day >= :weekStart',
        ExpressionAttributeNames: {
            "#day": "day"

        },
        ExpressionAttributeValues: {
            ":localId": { S: localId },
            ":weekStart": { S: weekStart }

        },
        Limit: Number(pageSize),
        ScanIndexForward: true,
    };

    if (weekStart) {
        params.ExclusiveStartKey = {
            'localId': { S: localId },
            'day': { S: weekStart },
        };
    }

    try {
        const result = await ddbClient.send(new QueryCommand(params));
        return result
    }
    catch (err) {
        console.log(err)
        return false
    }
}

async function getLeads(result) {
    const Items = result.Items
    const lastKey = result.LastEvaluatedKey;
    const hasNextPage = !!lastKey;

    const keys = Items.flatMap(element => {
        element = unmarshall(element)
        const dayItems = element.times ? element.times.map(dayItem => {
            if (Array.isArray(dayItem.leadId)) {
                // Join multiple IDs with a comma separator
                return { id: { S: dayItem.leadId.join(',') } };
            }
            else {
                // Single ID, return as-is
                return { id: { S: dayItem.leadId } };
            }
        })
            : [];

        return dayItems;
    });

    const chunkedKeys = chunkArray(keys, 100); // Split into chunks of 100 items or less

    const promises = chunkedKeys.map(chunk => {
        const params2 = {
            RequestItems: {
                'leads': {
                    Keys: chunk
                }
            }
        };

        return ddbClient.send(new BatchGetItemCommand(params2));
    });

    const results = await Promise.all(promises);


    var leadsMap = results.flatMap(result => result.Responses[process.env.DYNAMODB_LEADS_NAME])
    var leadsArr = leadsMap.map((item) => unmarshall(item))
    for (var i = 0; i < leadsArr.length; i++) {
        if (leadsArr[i].accepted == false && leadsArr[i].replied == true) {
            leadsArr.splice(i, 1);
            i--
        }
    }

    results[0].Responses.leads = leadsArr


    const flattenedResults = results.flatMap(result => result.Responses[process.env.DYNAMODB_LEADS_NAME]);


    const dataToReturn = {
        results: flattenedResults,
        leadsDay: Items.map((item) => unmarshall(item)),
        lastKey: hasNextPage ? lastKey.day : null,
        hasNextPage: hasNextPage
    }

    return dataToReturn;
}