import { UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall }from "@aws-sdk/util-dynamodb";
import { ddbClient }  from "./ddbClient.js";


export const handler = async (event) => {
let body;
const allowedFields = ['userId', 'name', 'surname', 'phone', 'email'];


try{
    const requestBody = JSON.parse(event.body);
     const {name, surname, phone, email, userId} = requestBody;
     console.log(requestBody)
     console.log(event)
     if(!userId || (event.requestContext.authorizer.sub != userId)){
         //Authentication
         return {
      statusCode: 500,
      body: JSON.stringify({ message: `Forbidden` })
    };
         
     }
     
     if(email && !isValidEmail(email)){
         throw new Error('Invalid email')
     }
     
  if (phone && !isPhoneNumberValid(phone)) {
      console.log("Invalid phone")
            throw new Error('Invalid phone number');
        }
     
    const objKeys = Object.keys(requestBody);
    

    if(!name){
          return {
      statusCode: 300,
      body: JSON.stringify({ message: `Name cannot be null` })
    };
    }

 
     const additionalFields = objKeys.filter(key => !allowedFields.includes(key));
    if (additionalFields.length > 0) {
      return {
      statusCode: 400,
      body: JSON.stringify({ message: `Invalid fields: ${additionalFields.join(', ')}` })
    };
     }
    body = await updateUser(event);
        return {
            statusCode: 200, 
            headers: {
      "Access-Control-Allow-Origin": "*", // Required for CORS support to work
      "Access-Control-Allow-Credentials": true, // Required for cookies, authorization headers with HTTPS
 //     "Access-Control-Allow-Methods": "OPTIONS, PUT, GET, POST, DELETE",
  //    "Access-Control-Allow-Headers": "Content-Type",


    },
            body: JSON.stringify({
                message: `Succesfully finished operation "${event.httpMethod}"`,
                body: body
            })
        };    
} catch (error) {
    console.log(error);
    return{
        statusCode: 500,
         body: JSON.stringify({
            message: "Failed to perform operation",
            errorMsg: error.message,
            errorStac: error.stack
         })
    }
}
}
const updateUser = async (event) => {
    try {
        const requestBody = JSON.parse(event.body);
        const userId = requestBody.userId;
        delete requestBody.userId;
        const objKeys = Object.keys(requestBody);
        console.log(`updateUser function. requestBody : "${requestBody}", objKeys : "${objKeys}`);
        const params = {
            TableName: process.env.DYNAMDOB_USERS_NAME,
           // Key: marshall({ id: event.pathParameters.id}),
            Key: marshall({ userId: userId}),
            UpdateExpression : `SET ${objKeys.map((_, index) => `#key${index} = :value${index}`).join(', ')}`,
            ExpressionAttributeNames: objKeys.reduce((acc, key, index) => ({
                ...acc,
                [`#key${index}`]: key,
            }), {}),
            ExpressionAttributeValues: marshall(objKeys.reduce((acc, key, index) => ({
                ...acc,
                [`:value${index}`]: requestBody[key],
            }), {})),
            ConditionExpression : 'attribute_exists(userId)'
        };

        const updateResult = await ddbClient.send(new UpdateItemCommand(params));
        console.log("^^^^")
        console.log(updateResult);
        return updateResult;
    }
    catch(e){
        console.log(e);
        throw e;
    }
}


function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isPhoneNumberValid(phoneNumber) {
  const phoneNumberRegex = /^\d{10}$/; // A regex for a 10-digit phone number
  const phoneNumberRegex1 = /^\d{11}$/; // A regex for a 10-digit phone number
  const phoneNumberRegex2 = /^\d{9}$/; // A regex for a 10-digit phone number


    return (phoneNumberRegex.test(phoneNumber) || phoneNumberRegex1.test(phoneNumber) || phoneNumberRegex2.test(phoneNumber));}
