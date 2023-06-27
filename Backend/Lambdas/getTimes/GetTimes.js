import { QueryCommand, GetItemCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall, marshall } from "@aws-sdk/util-dynamodb";
import { ddbClient } from "./ddbClient.js";


export const handler = async (event) => {
    console.log("request:", JSON.stringify(event, undefined, 2))
    let body;

    //TODOS YA SEAN LOCALES O USUARIOS PUEDEN PASAR POR ESO NO SE HACE NINGUNA COMPROBACION (SI PASAN AUTH PUEDEN ACCEDER)

    try {
        if (event.pathParameters.local != null && event.pathParameters.day != null && event.pathParameters.local != undefined && event.pathParameters.day != undefined && !isNotDateFormat(event.pathParameters.day)) {
            body = await getLocalTimes(event.pathParameters.local, event.pathParameters.day)


            if (body === undefined) {
                body = await createDayLeads(event.pathParameters.local, event.pathParameters.day)
            }

            return {
                statusCode: 200,
                headers: {
                    "Access-Control-Allow-Origin": "*", // Required for CORS support to work
                    "Access-Control-Allow-Credentials": true, // Required for cookies, authorization headers with HTTPS
                },
                body: JSON.stringify({
                    message: `Succesfully finished operation Get TimesDay`,
                    body: body
                })
            };
        }

        else {
            //
            return {
                statusCode: 200,
                headers: {
                    "Access-Control-Allow-Origin": "*", // Required for CORS support to work
                    "Access-Control-Allow-Credentials": true, // Required for cookies, authorization headers with HTTPS
                },
                body: JSON.stringify({
                    message: `No coge body "${event.httpMethod}"`,
                    body: null
                })
            };

        }
        //CREATE TIME LEAD: LEADID - DAY
        // GET TIME PERIOD FROM LOCAL


    } catch (error) {
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

const getLocalTimes = async (localId, day) => {
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
            TableName: process.env.DYNAMODB_TIMES_NAME
        };
        const { Items } = await ddbClient.send(new QueryCommand(params));


        const Values = Items.map((item) => unmarshall(item))[0];
        return Values
    }
    catch (e) {
        console.error(e);
        throw e;
    }
}

const createDayLeads = async (localId, day) => {
    try {
        const settings = await getLocalSettings(localId, day)

        const freeTimes = createDefTimes(settings.settings)

        const data = {
            localId: localId,
            day: day,
            freeTimes: freeTimes
        }

        //CREATE NEW DAYLEADS

        const params = {
            TableName: process.env.DYNAMODB_TIMES_NAME,
            Item: marshall(data || {})
        };
        const createResult = await ddbClient.send(new PutItemCommand(params));
        return data
    }
    catch (e) {
        console.error(e);
        throw e;
    }
}



const getLocalSettings = async (localId, day) => {
    try {
        const params = {
            KeyConditionExpression: "#O = :localId",
            ExpressionAttributeValues: {
                ":localId": { S: localId }
            },
            ExpressionAttributeNames: {
                "#O": "localId"
            },
            TableName: process.env.DYNAMODB_LOCALS_NAME
        };
        const { Items } = await ddbClient.send(new QueryCommand(params));

        return Items.map((item) => unmarshall(item))[0];


    } catch (e) {
        console.error(e);
        throw e;
    }
}




const createDefTimes = (settings) => {
    const freeTimes = []
    var periods = 0
    var firstPeriodEnd = 0
    console.log(settings)

    if (settings.pauseStart != undefined) {
        firstPeriodEnd = settings.pauseStart;
        periods = 2
    }
    else {
        firstPeriodEnd = settings.close
    }

    /*for(var i = Number(settings.open); i < firstPeriodEnd; i = i + Number(settings.timePeriod)){
        freeTimes.push(i)
        console.log(i)
    }*/

    /*if(periods == 2){
         for(var i = Number(settings.pauseStop); i < Number(settings.close); i = i + Number(settings.timePeriod)){
          freeTimes.push(i)
    }
    }*/

    if (settings.peoplePerPeriod == null)
        settings.peoplePerPeriod = 1;

    for (var i = Number(settings.open); i < firstPeriodEnd; i = i + Number(settings.timePeriod)) {
        var timesPerson = {
            time: i,
            spaces: settings.peoplePerPeriod
        }
        freeTimes.push(timesPerson)
        console.log(i)
    }

    if (periods == 2) {
        for (var i = Number(settings.pauseStop); i < Number(settings.close); i = i + Number(settings.timePeriod)) {
            var timesPerson = {
                time: i,
                spaces: settings.peoplePerPeriod
            }
            freeTimes.push(timesPerson)
            //freeTimes.push(i)
        }
    }



    console.log("freeTimes " + freeTimes)
    return freeTimes
}

function isNotDateFormat(str) {
    // Check if string matches the regex pattern for yyyy-mm-dd
    return !/^\d{4}-\d{2}-\d{2}$/.test(str);
}
