import { UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { ddbClient } from "./ddbClient.js";


export const handler = async (event,context, callback) => {
    let body;
    const allowedFields = ['localId', 'name', 'family_name', 'phone', 'email', 'type', 'settings'];


    try {
        
        console.log(event)
        const requestBody = JSON.parse(event.body);
       // const requestBody = event
        const { name, family_name, phone, email, localId, type, settings } = requestBody;
        console.log(requestBody)
        console.log(localId)
        
        if (!localId || (event.requestContext.authorizer.sub != localId)) {  //  || (event.requestContext.authorizer.sub != localId)
            //AUTH 
            return {
                statusCode: 500,
                body: JSON.stringify({ message: `Forbidden` })
            };

        }

        if (email && !isValidEmail(email)) {
            console.log('Invalid email')
            throw new Error('Invalid email')
        }

        if (phone && !isPhoneNumberValid(phone)) {
            throw new Error('Invalid phone number');

        }

        if (!type) {
            console.log('Type needed')
            throw new Error('Type needed');
        }
        
        if(!name){
            throw new Error('Name needed');
    };

    
        if (requestBody.hasOwnProperty('settings')) {
            try{
            if (!areSettingsValid(settings)) {
                console.log('Invalid settings')
                throw new Error('Invalid settings');
            }
            }catch(error){
                throw new Error(error)
            }
        }

        const objKeys = Object.keys(requestBody);

        console.log("PASA PRIMEROS COMP")
        const additionalFields = objKeys.filter(key => !allowedFields.includes(key));
        if (additionalFields.length > 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: `Invalid fields: ${additionalFields.join(', ')}` })
            };
        }
        body = await updateLocal(event);
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
    }
    catch (error) {
        console.log(error);
       // callback("[BadRequest]" + error)
    /*    var myErrorObj = {
        errorType : "InternalServerError",
        httpStatus : 500,
        requestId : context.awsRequestId,
        message : "An unknown error has occurred. Please try again."
        }
            callback(JSON.stringify(myErrorObj));

        */
        
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
const updateLocal = async (event) => {
    try {
        const requestBody = JSON.parse(event.body);
        //const requestBody = event
        const localId = requestBody.localId;
        const type = requestBody.type
        delete requestBody.localId;
        delete requestBody.type
        const objKeys = Object.keys(requestBody);
        console.log(`updateLead function. requestBody : "${requestBody}", objKeys : "${objKeys}`);
        console.log(localId)
        console.log(`event object: ${JSON.stringify(event)}`);


        console.log(`requestBody: ${JSON.stringify(requestBody)}`);
        console.log(`objKeys: ${JSON.stringify(objKeys)}`);


        const params = {
            TableName: process.env.DYNAMDOB_LOCALS_NAME,
            //Key: marshall({ id: event.pathParameters.id}),
            //  Key: marshall({ localId: localId}),
            Key: {
                localId: { S: localId },
                type: { S: type }
            },
            UpdateExpression: `SET ${objKeys.map((_, index) => `#key${index} = :value${index}`).join(', ')}`,
            ExpressionAttributeNames: objKeys.reduce((acc, key, index) => ({
                ...acc,
                [`#key${index}`]: key,
            }), {}),
            /*  ExpressionAttributeValues: marshall(objKeys.reduce((acc, key, index) => ({
                  ...acc,
                  [`:value${index}`]: requestBody[key],
              }), {})),
              */
            ExpressionAttributeValues: marshall(objKeys.reduce((acc, key, index) => ({
                ...acc,
                [`:value${index}`]: requestBody[key],
            }), {})),
            ConditionExpression: 'attribute_exists(localId)'
        };

        console.log(`marshalled params: ${JSON.stringify(marshall(params))}`);
        console.log(`update item command: ${JSON.stringify(new UpdateItemCommand(params))}`);


        const updateResult = await ddbClient.send(new UpdateItemCommand(params));
        console.log(updateResult);
        return updateResult;
    }
    catch (e) {
        console.log(e);
        throw new Error('Invalid data');
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


    return (phoneNumberRegex.test(phoneNumber) || phoneNumberRegex1.test(phoneNumber) || phoneNumberRegex2.test(phoneNumber));
}

function areSettingsValid(settings) {
    //TO DO

    console.log("TESTING SETTINGS")
    console.log(settings)
    console.log(settings == null)


    if (settings == null) {
        throw new Error('Invalid settings');
    }

 
    if (isNaN(settings.close))
        throw new Error('Invalid Settings')
    if (isNaN(settings.open))
        throw new Error('Invalid Settings')
    if (isNaN(settings.timePeriod))
        throw new Error('Invalid Settings')
    if(isNaN(settings.peoplePerPeriod))
        throw new Error('Invalid Settings')
        
    if(settings.peoplePerPeriod <= 0 || settings.peoplePerPeriod > 2000)
        throw new Error('Invalid Settings')


    if (settings.pauseStart) {
        if (isNaN(settings.pauseStart))
            throw new Error('Invalid Settings')
    }
    if (settings.pauseStop) {
        if (isNaN(settings.pauseStop))
            throw new Error('Invalid Settings')
        if(settings.pauseStop < settings.pauseStart)
            throw new Error('Resume time must be after break time')
    }
    
    if(settings.close < settings.open){
        throw new Error('Ending time must be after starting time')
    }
    
    
    const allowedFields = ['close', 'open', 'timePeriod', 'pauseStart', 'pauseStop', 'peoplePerPeriod' ]
     const objKeys = Object.keys(settings);

        console.log("PASA PRIMEROS COMP")
        const additionalFields = objKeys.filter(key => !allowedFields.includes(key));
        if (additionalFields.length > 0) {
            throw new Error('Invalid Settings')
        }
        
    console.log(settings)
    return true


}
