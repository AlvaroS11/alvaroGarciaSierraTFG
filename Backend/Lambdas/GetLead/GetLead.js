import { GetItemCommand, ScanCommand, QueryCommand, } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { ddbClient } from "./ddbClient.js";


export const handler = async (event) => {
    console.log("request:", JSON.stringify(event, undefined, 2))
    let body;

    try {
        //else
        if (event.pathParameters.id != null && (event.pathParameters.sub == null || event.pathParameters.sub == undefined)) {
            if (event.requestContext.authorizer.sub != event.pathParameters.id)
                throw new Error("Forbidden")

            body = await getLeadsByUser(event.pathParameters.id)
        }

        else if (event.pathParameters.id != null && event.pathParameters.sub != null) {
            if (event.requestContext.authorizer.sub != event.pathParameters.sub)
                throw new Error("Forbidden")
            body = await getLead(event.pathParameters.id, event);
        }

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

const getLead = async (leadId, event) => {
    try {
        const params = {
            TableName: process.env.DYNAMODB_LEADS_NAME,
            Key: marshall({ id: leadId })
        }
        const { Item } = await ddbClient.send(new GetItemCommand(params));
        return { Item } ? unmarshall(Item) : {}
    }
    catch (e) {
        console.log(e)
        throw e
    }
}

const getLeadsByUser = async (sub) => {

    try {
        const params = {
            FilterExpression: "#sub =:val",
            ExpressionAttributeNames: {
                '#sub': 'sub'
            },
            ExpressionAttributeValues: {
                ":val": { S: sub }
            },
            TableName: process.env.DYNAMODB_LEADS_NAME
        };
        const { Items } = await ddbClient.send(new ScanCommand(params));

        console.log(Items);

        var leadsArr = Items.map((item) => unmarshall(item));

        for (var i = 0; i < leadsArr.length; i++) {
            console.log(leadsArr[i])
            if (leadsArr[i].accepted == false && leadsArr[i].replied == true) {
                leadsArr.splice(i, 1);
                i--
            }
        }
        return leadsArr

    }

    catch (error) {
        console.log(error)
        throw new Error(error)
    }
}


const getLeadsByOwner = async (event) => {
    console.log(JSON.parse(event.body));
    try {
        const requestBody = JSON.parse(event.body);
        const owner = requestBody.owner;
        console.log("GET BY OWNER")
        const params = {
            IndexName: "owner-index",
            KeyConditionExpression: "#O = :owner",
            //FilterExpression: "contains (#O, :owner)",
            ExpressionAttributeValues: {
                ":owner": { S: owner }
            },
            ExpressionAttributeNames: {
                "#O": "owner"
            },
            TableName: process.env.DYNAMODB_LEADS_NAME
        };
        const { Items } = await ddbClient.send(new QueryCommand(params));

        return Items.map((item) => unmarshall(item));
    }
    catch (e) {
        console.error(e);
        throw e;
    }
}
/*
const getAllLeads = async () => {
    console.log("getAllLeads")

    try {
        const params = {
            TableName: process.env.DYNAMODB_LEADS_NAME,
        }
        const { Items } = await ddbClient.send(new ScanCommand(params));

        console.log(Items)
        return { Items } ? Items.map((item) => unmarshall(item)): {}
    }
    catch (e) {
        console.log(e)
        throw e
    }
}
*/