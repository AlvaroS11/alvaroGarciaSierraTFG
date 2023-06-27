import { ScanCommand, QueryCommand, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { ddbClient } from "./ddbClient.js";


export const handler = async (event) => {
    console.log("request:", JSON.stringify(event, undefined, 2))
    let body;

    try {
        if (event.body != null) {
            //  body = await getLocalsByType(event)
        }
        if (event.pathParameters != null) {
            if (event.pathParameters.id != null && event.pathParameters.id == event.requestContext.authorizer.sub) {
                // AUTH LOCAL
                console.log(event.pathParameters.id)
                body = await getLocal(event.pathParameters.id)
            }
            else{
                return {
                    statusCode: 500,
                  body: JSON.stringify({ message: `Forbidden` })

                }
            }
        }

        /* else if(event.pathParameters != null){
             body = await getLead(event.pathParameters.id);
         }
         */
        else {
            body = await getAllLocals();
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
/*
const getLocalsByType = async (event) => {
    console.log(JSON.parse(event.body));
    try{
        const requestBody = JSON.parse(event.body);
        const type = requestBody.type;
        const params = {
            IndexName:"type-index",
            KeyConditionExpression: "#O = :type",
            //FilterExpression: "contains (#O, :owner)",
            ExpressionAttributeValues: {
                ":type": {S: type}
            },
            ExpressionAttributeNames: {
            "#O":"type"
            },
            TableName: process.env.DYNAMODB_LOCALS_NAME
        };
        const {Items} = await ddbClient.send(new QueryCommand(params));

        console.log(Items);
        return Items.map((item) => unmarshall(item));
    }
    catch(e){
    console.error(e);
    throw e;
    }
}*/

const getAllLocals = async () => {
    console.log("getAllLocals")

    try {
        const params = {
            TableName: process.env.DYNAMODB_LOCALS_NAME,
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

const getLocal = async (localId) => {
    try {
        console.log("entra getLocal")
        console.log(typeof(localId))
        /* const params = {   
        
    TableName: process.env.DYNAMODB_LOCALS_NAME,
    
    Key: {
      "localId": { "S": localId }
    }
    
  };
  const response = await ddbClient.send(new GetItemCommand(params));*/

        const params = {
            TableName: process.env.DYNAMODB_LOCALS_NAME,
            KeyConditionExpression: "#localId = :localId",
            ExpressionAttributeNames: {
                "#localId": "localId"
            },
            ExpressionAttributeValues: {
                ":localId": { "S": localId }
            }
        };
        // try {
        const { Items } = await ddbClient.send(new QueryCommand(params));
        console.log(Items)
        return Items.map((item) => unmarshall(item));

        //  } catch (e) {}

        // return {Items} ? Items.map((item) => unmarshall(item)) : {}
    }
    catch (error) {
        console.log(error)
        throw new Error('Local not found')
    }


}
