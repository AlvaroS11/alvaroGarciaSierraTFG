import { ScanCommand, QueryCommand, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall, marshall } from "@aws-sdk/util-dynamodb";
import { ddbClient } from "./ddbClient.js";


export const handler = async (event) => {
    console.log("request:", JSON.stringify(event, undefined, 2))
    let body;

    try {

        if (event.pathParameters != null) {
            if (event.pathParameters.id != null && event.requestContext.authorizer.sub == event.pathParameters.id) {
                //CALL AUTH LOCAL
                body = await getUser(event.pathParameters.id)
            }
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


const getUser = async (userId) => {
    try {
        console.log(typeof(userId))

        const params = {
            TableName: process.env.DYNAMODB_USERS_NAME,
            Key: marshall({ userId: userId })

        };
        const { Item } = await ddbClient.send(new GetItemCommand(params));
        console.log(Item)
        //return Items.map((item) => unmarshall(item));
        return { Item } ? unmarshall(Item): {}

    }
    catch (error) {
        console.log(error)
        throw new Error('User not found')
    }


}
