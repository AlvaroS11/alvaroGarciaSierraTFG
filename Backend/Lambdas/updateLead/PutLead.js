import { UpdateItemCommand, QueryCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { ddbClient } from "./ddbClient.js";


export const handler = async (event) => {
    let body;

    try {
        console.log(event)
        const requestBody = JSON.parse(event.body);
        const allowedLead = requestBody.allow;
        const accepted = requestBody.accepted
        console.log(accepted)

        console.log(allowedLead)

        console.log("*******")


        //AUTHENTICATE
        //IF USER:: => accepted = false (NO PUEDE ACEPTAR EL LEAD EL USUARIO)       principalId: 'user',

        //CHECK LEAD IS FROM USER
        console.log(event)


        if (accepted == true && event.requestContext.authorizer.principalId == "user") {

            return {
                statusCode: 300,
                body: JSON.stringify({ message: 'Unauthorized' })
            };

        }
        //if (event.requestContext.authorizer.sub == requestBody.sub || event.requestContext.authorizer.sub == requestBody.)

        if (requestBody.user != null) {
            if (allowedLead && requestBody.sub != null) {
                if (event.requestContext.authorizer.principalId == "user" && requestBody.sub == event.requestContext.authorizer.sub) {
                    //AUTH USER
                    console.log("PASA USER")
                    body = await denyLeadUser(event)
                }
                else {
                    return {
                        statusCode: 300,
                        body: JSON.stringify({
                            message: "Unauthorized",
                            errorMsg: "Unauthorized",
                            errorStac: "Unauthorized"
                        })
                    }
                }
            }

            else {
                return {
                    statusCode: 300,
                    body: JSON.stringify({
                        message: "Unauthorized",
                        errorMsg: "Unauthorized",
                        errorStac: "Unauthorized"
                    })
                }

            }
        }
        else if (allowedLead) {
            //AUTH LOCAL
            if (event.requestContext.authorizer.principalId == "local" && event.requestContext.authorizer.sub == requestBody.localId) {
                console.log("PASA LOCAL")
                console.log(accepted)
                body = await denyAcceptLead(event)
            }
            else {
                return {
                    statusCode: 300,
                    body: JSON.stringify({
                        message: "Unauthorized",
                        errorMsg: "Unauthorized",
                        errorStac: "Unauthorized"
                    })
                }
            }
        }
        else {
            //  body = await updateLead(event);
            console.log("NO HACE NADA?")
        }
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*", // Required for CORS support to work
                "Access-Control-Allow-Credentials": true, // Required for cookies, authorization headers with HTTPS
                "Access-Control-Allow-Methods": "*",
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
const updateLead = async (event) => {
    try {
        //ADD USER AUTH
        //ONLY ALLOW SELECTED ATTRIBUTES
        const requestBody = JSON.parse(event.body);
        const objKeys = Object.keys(requestBody);
        console.log(`updateLead function. requestBody : "${requestBody}", objKeys : "${objKeys}`);
        const params = {
            TableName: process.env.DYNAMDOB_LEADS_NAME,
            Key: marshall({ id: event.pathParameters.id }),
            UpdateExpression: `SET ${objKeys.map((_, index) => `#key${index} = :value${index}`).join(', ')}`,
            ExpressionAttributeNames: objKeys.reduce((acc, key, index) => ({
                ...acc,
                [`#key${index}`]: key,
            }), {}),
            ExpressionAttributeValues: marshall(objKeys.reduce((acc, key, index) => ({
                ...acc,
                [`:value${index}`]: requestBody[key],
            }), {})),
        };

        const updateResult = await ddbClient.send(new UpdateItemCommand(params));
        console.log(updateResult);
        return updateResult;
    }
    catch (e) {
        console.log(e);
        throw e;
    }
}

const denyAcceptLead = async (event) => {
    //TO DO
    console.log("LLEGA DENY-ACCEPT")
    const requestBody = JSON.parse(event.body);
    const id = event.pathParameters.id;
    const accepted = requestBody.accepted

    const localId = requestBody.localId



    console.log("**")
    console.log(accepted)
    console.log(id)
    console.log("id")
    console.log(event.pathParameters.id)
    var params = ''
    if (accepted == true) {
        params = {

            TableName: process.env.DYNAMDOB_LEADS_NAME,
            Key: {
                id: { S: id }
            }, // marshall({id: id}),
            UpdateExpression: "SET accepted= :val, replied= :rep",
            ExpressionAttributeValues: {
                ':val': { BOOL: true },
                ':rep': { BOOL: true },
                ':local_value': { S: localId }


            },
            ConditionExpression: 'localId = :local_value',

        }
    }
    else if (accepted == false) {

        const localId = requestBody.localId
        const day = requestBody.day
        console.log(localId, day)

        if (localId == null || day == null) {
            throw new Error("Invalid fields")
        }





        //COGEMOS INFORMACION DE LOS TIEMPOS DEL LOCAL/DAY
        const paramsGet = {
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
        const { Items } = await ddbClient.send(new QueryCommand(paramsGet));



        //QUITAMOS EL TIEMPO QUE ESTABA EN EL EVENTO
        var Values = Items.map((item) => unmarshall(item))[0];

        console.log(Values)
        if (Values == null) {
            throw new Error('Event not found')
        }

        if (requestBody.hasOwnProperty("custom")) {

            const indexToDelete = Values.times.findIndex(obj => obj.localId === localId && obj.day === day);

            if (indexToDelete !== -1) {
                Values.times.splice(indexToDelete, 1);
            }
            
             const paramsUpd = {
            TableName: process.env.DYNAMODB_TIMES_NAME,
            Key: {
                localId: { S: localId },
                day: { S: day }
            },
            UpdateExpression: "SET times= :rep",
            ExpressionAttributeValues: {
                ':rep': { L: marshall(Values.times) }
            }
        }
        
            const createResult = await ddbClient.send(new UpdateItemCommand(paramsUpd));

        }
    
    else{

        for (var i = 0; i < Values.times.length; i++) {
            console.log("!!!!!!!!!!!!")
            console.log(Values.times[i])
            if (Values.times[i].leadId == id) {
                //IF IT FINDS, MEANS FREETIME EXISTS
                var valIndex = Values.freeTimes.findIndex(element => element.time == Values.times[i].start)
                if (valIndex != -1) {
                    console.log(Values.freeTimes[valIndex].toString())
                    console.log(JSON.stringify(Values.freeTimes[valIndex]))
                    var val = {
                        time: Number(Values.times[i].start),
                        spaces: Values.freeTimes[valIndex].spaces + 1
                    }
                    //Values.freeTimes.push(Number(Values.times[i].start))
                    Values.freeTimes[valIndex] = val

                }
                //IF DOES NOT FIND IT, IT MEANS WE SHALL CREATE ANOTHER FREETIME WITH SPACE = 1
                else {
                    var val = {
                        time: Number(Values.times[i].start),
                        spaces: 1
                    }

                    Values.freeTimes.push(val)
                }
                Values.times.splice(i, 1);
            }
        }



        console.log(Values)
        const paramsUpd = {
            TableName: process.env.DYNAMODB_TIMES_NAME,
            Key: {
                localId: { S: localId },
                day: { S: day }
            },
            UpdateExpression: "SET freeTimes= :val, times= :rep",
            ExpressionAttributeValues: {


                ':val': { L: marshall(Values.freeTimes, { convertEmptyValues: true }) }, //hay que meterlo como numeros
                ':rep': { L: marshall(Values.times) }
            }
        }

        console.log("Before Upd")



        const createResult = await ddbClient.send(new UpdateItemCommand(paramsUpd));
}
        //

        params = {
            TableName: process.env.DYNAMDOB_LEADS_NAME,
            Key: {
                id: { S: id }
            }, // marshall({id: id}),
            UpdateExpression: "SET accepted= :val, replied= :rep",
            ExpressionAttributeValues: {
                ':val': { BOOL: false },
                ':rep': { BOOL: true }
            },
            //
            ConditionExpression: 'attribute_exists(id)'

        }
    }
    else {
        throw new Error('Invalid fields')
    }

    const updateResult = await ddbClient.send(new UpdateItemCommand(params));





    console.log("1111")
    console.log(updateResult)
    return updateResult

}

const denyLeadUser = async (event) => {

    const requestBody = JSON.parse(event.body);
    const id = event.pathParameters.id;
    const accepted = requestBody.accepted
    const sub = requestBody.sub

    if (accepted == false) {
        const localId = requestBody.localId
        const day = requestBody.day
        console.log(localId, day)


        if (day == null) {
            throw new Error("Invalid fields")
        }
        
          if (requestBody.hasOwnProperty("custom")) {

               const params = {
            TableName: process.env.DYNAMDOB_LEADS_NAME,
            Key: {
                id: { S: id }
            }, // marshall({id: id}),
            UpdateExpression: "SET accepted= :val, replied= :rep",
            ExpressionAttributeValues: {
                ':val': { BOOL: false },
                ':rep': { BOOL: true },
                ':sub': { S: sub }
            },
            ExpressionAttributeNames: {
                '#sub': 'sub'
            },
            //
            ConditionExpression: 'attribute_exists(id) AND #sub = :sub'

        }
        const updateResult = await ddbClient.send(new UpdateItemCommand(params));
            
          }
          else{

     if (localId == null) {
            throw new Error("Invalid fields")
        }

        //COGEMOS INFORMACION DE LOS TIEMPOS DEL LOCAL/DAY
        const paramsGet = {
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
        const { Items } = await ddbClient.send(new QueryCommand(paramsGet));



        //QUITAMOS EL TIEMPO QUE ESTABA EN EL EVENTO
        var Values = Items.map((item) => unmarshall(item))[0];

        console.log(Values)

        for (var i = 0; i < Values.times.length; i++) {
            console.log("!!!!!!!!!!!!")
            console.log(Values.times[i])
            if (Values.times[i].leadId == id) {
                //IF IT FINDS, MEANS FREETIME EXISTS
                var valIndex = Values.freeTimes.findIndex(element => element.time == Values.times[i].start)
                if (valIndex != -1) {
                    console.log(Values.freeTimes[valIndex].toString())
                    console.log(JSON.stringify(Values.freeTimes[valIndex]))
                    var val = {
                        time: Number(Values.times[i].start),
                        spaces: Values.freeTimes[valIndex].spaces + 1
                    }
                    //Values.freeTimes.push(Number(Values.times[i].start))
                    Values.freeTimes[valIndex] = val

                }
                //IF DOES NOT FIND IT, IT MEANS WE SHALL CREATE ANOTHER FREETIME WITH SPACE = 1
                else {
                    var val = {
                        time: Number(Values.times[i].start),
                        spaces: 1
                    }

                    Values.freeTimes.push(val)
                }
                Values.times.splice(i, 1);
            }
        }
        /*    const paramsUpd = {
                TableName: process.env.DYNAMDOB_TIMES_NAME,
                Item: marshall(Values || {})
            };
            */



        console.log(Values)
        const paramsUpd = {
            TableName: process.env.DYNAMODB_TIMES_NAME,
            Key: {
                localId: { S: localId },
                day: { S: day }
            },
            UpdateExpression: "SET freeTimes= :val, times= :rep",
            ExpressionAttributeValues: {


                ':val': { L: marshall(Values.freeTimes, { convertEmptyValues: true }) }, //hay que meterlo como numeros
                ':rep': { L: marshall(Values.times) }
            }
        }

        console.log("Before Upd")


        //const createResult = await ddbClient.send(new UpdateItemCommand(paramsUpd));

        //ABAJO DE UPDATE LEAD


        //PRIMERO ESTO PARA VER QUE EL SUB ES EL MISMO QUE EL SUB DEL LEAD Y DESPUES UPDATEAR

        const params = {
            TableName: process.env.DYNAMDOB_LEADS_NAME,
            Key: {
                id: { S: id }
            }, // marshall({id: id}),
            UpdateExpression: "SET accepted= :val, replied= :rep",
            ExpressionAttributeValues: {
                ':val': { BOOL: false },
                ':rep': { BOOL: true },
                ':sub': { S: sub }
            },
            ExpressionAttributeNames: {
                '#sub': 'sub'
            },
            //
            ConditionExpression: 'attribute_exists(id) AND #sub = :sub'

        }
        const updateResult = await ddbClient.send(new UpdateItemCommand(params));
        const updateLeadDayResult = await ddbClient.send(new UpdateItemCommand(paramsUpd));
        console.log(updateResult)
        console.log(updateLeadDayResult)
        return updateResult
    }
    }
    else {
        throw new Error('Invalid fields')
    }

}
