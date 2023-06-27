import { PutItemCommand, UpdateItemCommand, QueryCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { ddbClient } from "./ddbClient.js";
import { v4 as uuidv4 } from "uuid"


export const handler = async (event) => {
    let body;

    try {
        const requestBody = JSON.parse(event.body);
        const { type, start, end, localId, name, title, accepted, hours, custom, sub } = requestBody;

        if (sub == null) {
            return {
                statusCode: 300,
                body: JSON.stringify({ message: 'Unauthorized' })
            };

        }


        //CHECK ID AUTH
        if (sub != event.requestContext.authorizer.sub) {
            return {
                statusCode: 300,
                body: JSON.stringify({ message: 'Unauthorized' })
            };

        }

        if (custom) {
            if (!start || !end || !title) { // !id
                return {
                    statusCode: 400,
                    body: JSON.stringify({ message: 'Missing parameters' })
                };
            }

            body = await addCustomLead(event)
            return {
                statusCode: 302,
                headers: {
                    "Access-Control-Allow-Origin": "*", // Required for CORS support to work
                    "Access-Control-Allow-Credentials": true, // Required for cookies, authorization headers with HTTPS
                    "Location": 'https://zdn41z77wc.execute-api.us-east-1.amazonaws.com/Prod/lead/' + body
                },
                body: JSON.stringify({
                    message: `Succesfully finished operation "${event.httpMethod}"`,
                    body: body
                })
            };
        }
        else {


            if (!type || !start || !end || !localId || !hours) { // !id // 
                //console.log()
                console.log("MISSING PARAMETERS")
                console.log(requestBody)
                return {
                    statusCode: 400,
                    body: JSON.stringify({ message: 'Missing parameters' })
                };
            }

            body = await createLead(event);
            return {
                statusCode: 302,
                headers: {
                    "Access-Control-Allow-Origin": "*", // Required for CORS support to work
                    "Access-Control-Allow-Credentials": true, // Required for cookies, authorization headers with HTTPS
                    "Location": 'https://zdn41z77wc.execute-api.us-east-1.amazonaws.com/Prod/lead/' + body
                },
                body: JSON.stringify({
                    message: `Succesfully finished operation "${event.httpMethod}"`,
                    body: body
                })
            };
        }

    } catch (error) {
        console.log("ERROR")
        console.log(error);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*", // Required for CORS support to work
                "Access-Control-Allow-Credentials": true, // Required for cookies, authorization headers with HTTPS
            },
            body: JSON.stringify({
                message: "Failed to perform operation",
                errorMsg: error.message,
                errorStac: error.stack
            })
        }
    }
}

const createLead = async (event) => {
    try {

        console.log(`createLead function. event : "${event}"`);
        const requestBody = JSON.parse(event.body)
        const { type, start, end, localId, name, title, accepted, hours, custom, sub, userName } = requestBody;

        const leadRequest = { type, start, end, localId, name, title, accepted, hours, custom, sub, userName }
        const leadId = uuidv4();
        leadRequest.id = leadId;


        const day = formatDate(leadRequest.start)

        //// Si la hora pedida está en FreeTimes, quitar de FreeTimes y añadir en times

        const timesDay = await getTimes(leadRequest.localId, day)
        const timesArr = timesDay.freeTimes
        console.log(timesArr.includes(Number(leadRequest.hours)))

        //if(timesArr.includes(Number(leadRequest.hours))){
        var foundEl = timesArr.find(element => element.time == (Number(leadRequest.hours)))
        if (timesArr.find(element => element.time == (Number(leadRequest.hours)))) {
            if (foundEl.spaces < 1) {
                throw new Error('This time range is full')
            }
            if (leadRequest?.start) {
                const onlyTime = leadRequest.start.split(' ')
                const hourMin = onlyTime[1].split(':')
                const hours = Number(hourMin[0] * 60) + Number(hourMin[1])
                if (hours != leadRequest.hours) {
                    throw new Error("Invalid start time");

                }
            }

            const toModify = timesArr.find(element => element.time == (Number(leadRequest.hours)))
            const index = timesArr.indexOf(toModify)
            if (toModify == undefined) {
                throw new Error('Invalid data')
            }

            toModify.spaces -= 1
            if (toModify.spaces == 0) {
                timesArr.splice(index, 1)
            }
            else {
                timesArr[index].spaces = toModify.spaces
            }



            const timesAr = marshall(timesArr)

            const paramsUpd = {
                TableName: process.env.DYNAMODB_TIMES_NAME,

                Key: {
                    //  localId: data.localId,
                    localId: { S: leadRequest.localId },
                    day: { S: day }
                },
                UpdateExpression: 'SET times = list_append(if_not_exists(times, :empty_list), :i), freeTimes = :newFree',

                ExpressionAttributeValues: {

                    ':empty_list': {
                        'L': []
                    },
                    ':i': {
                        'L': [
                            {
                                'M': {
                                    'leadId': {
                                        'S': leadId
                                    },
                                    'start': {
                                        'S': leadRequest.hours
                                    }
                                }
                            }
                        ]
                    },
                    ":newFree": {
                        "L": timesAr
                    }
                },
                ReturnValues: 'UPDATED_NEW',
            }
            var updateResult = ''
            try {
                updateResult = await ddbClient.send(new UpdateItemCommand(paramsUpd))
            } catch (e) {
                console.log(e)
                throw new Error(e)
            }

            //CREACION LEAD
            //si el lead lo ha creado un local, accepted = true

            if (event.requestContext.authorizer.principalId === "local")
                leadRequest.accepted = true;

            else
                leadRequest.accepted = false;


            const params = {
                TableName: process.env.DYNAMDOB_LEADS_NAME,
                Item: marshall(leadRequest || {}, { removeUndefinedValues: true })
            };

            const createResult = await ddbClient.send(new PutItemCommand(params));
            //UPDATE TIMES && FREETIMES FROM LEADSDAY
            return leadId + "/" + leadRequest.sub

        }
        else {
            throw new Error('Invalid Data')
        }
    }
    catch (e) {
        console.log(e);
        throw e;
    }
}


function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}


const getTimes = async (localId, day) => {
    try {
        const params = {
            //IndexName:"type-index",
            KeyConditionExpression: "#o = :localId and #s= :day",
            ExpressionAttributeNames: {
                "#o": "localId",
                "#s": "day"
            },
            //FilterExpression: "contains (#O, :owner)",
            ExpressionAttributeValues: {
                ":localId": { S: localId },
                ":day": { S: day }

            },
            /*  ExpressionAttributeNames: {
              "#O":"day"
              },*/
            TableName: process.env.DYNAMODB_TIMES_NAME
        };
        const { Items } = await ddbClient.send(new QueryCommand(params));

        return Items.map((item) => unmarshall(item))[0];
    }
    catch (e) {
        console.error(e);
        throw e;
    }
}


const addCustomLead = async (event) => {
    try {

        console.log(`addCustomLead function. event : "${event}"`);

        console.log((event.body))
        console.log(JSON.parse(event.body))

        const data = JSON.parse(event.body);

        if (!data.hasOwnProperty('type') || data.type == "")
            data.type = 'custom'

        const leadRequest = {
            type: data.type,
            start: data.start,
            end: data.end,
            title: data.title,
            description: data.description,
            custom: true,
            accepted: true,
            sub: data.sub,

        }

        const leadId = uuidv4();
        leadRequest.id = leadId;
        console.log(leadRequest)

        const params = {
            TableName: process.env.DYNAMDOB_LEADS_NAME,
            Item: marshall(leadRequest || {})
        };

        const createResult = await ddbClient.send(new PutItemCommand(params));
        const day = formatDate(leadRequest.start)
        if (event.requestContext.authorizer.principalId === "local") {
            const paramsUpd = {
                TableName: process.env.DYNAMODB_TIMES_NAME,

                Key: {
                    localId: { S: event.requestContext.authorizer.sub },
                    day: { S: day }
                },


                UpdateExpression: 'SET times = list_append(if_not_exists(times, :empty_list), :i)',

                //añadir en times (start, leadId)
                ExpressionAttributeValues: {

                    ':empty_list': {
                        'L': []
                    },
                    ':i': {
                        'L': [
                            {
                                'M': {
                                    'leadId': {
                                        'S': leadId
                                    },
                                    'start': {
                                        'S': "custom"
                                        //  'S': leadRequest.hours
                                    }
                                }
                            }
                        ]

                    }

                },
                ReturnValues: 'UPDATED_NEW',

            }
            const updateResult = await ddbClient.send(new UpdateItemCommand(paramsUpd))
        }
        return leadId + "/" + leadRequest.sub

    }

    catch (error) {
        throw error
    }

}
