import { PutItemCommand, UpdateItemCommand, QueryCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall }from "@aws-sdk/util-dynamodb";
import { ddbClient }  from "./ddbClient.js";
import {v4 as uuidv4} from "uuid"

import AWS from 'aws-sdk';
const cognito = new AWS.CognitoIdentityServiceProvider();



export const handler = async (event, context, callback) => {
let body;

try{
       body = await userCreation(event)
       
       console.log("ALL OK")
       return event  
        
} catch (error) {
    console.log(error);
    
    const params = {
    UserPoolId: 'us-east-1_8zNNpg8Ps',
    Username: event.request.userAttributes.sub
  };
     try {
         
    await cognito.adminDeleteUser(params).promise();
    console.log(`Successfully deleted user ${params.Username}`);
  } catch (err) {
    console.error(`Error deleting user ${params.Username}: ${err}`);
    throw err;
  }
    
const customError = {
      status: 400, // or any other HTTP status code you want to use
      message: error.toString()
    };
    return callback(JSON.stringify(customError));
}
}


const userCreation = async(event) => {
    const { sub, email, name, family_name } = event.request.userAttributes;


    const isLocal = event.request.userAttributes['custom:isLocal']
    
    if(isLocal != 'true'){
    const postItem = {
        userId: sub,
        email : email,
        name : name,
        family_name : family_name,
   }
   
    const params = {
         TableName: process.env.DYNAMODB_USERS_NAME,
         Item: marshall(postItem || {})
     };

     const createResult = await ddbClient.send(new PutItemCommand(params));

    }
    else {
        const type = event.request.userAttributes['custom:type']
        const city = event.request.userAttributes['custom:city']
        
        let settings = event.request.userAttributes['custom:settings']
                
        settings = JSON.parse(settings)
       
        const {timePeriod, close, open, maxPers} = settings;
        
        var customSettings = ''
        
        const {pauseStart, pauseStop} = settings;
        
        const timePeriod2 = settings.timePeriod
        
        if(timePeriod == null || close == null || open == null || maxPers == null || isNaN(timePeriod) || isNaN(close) || isNaN(open) || isNaN(maxPers)){
            throw new Error('Wrong or empty fields')
        }

        if(maxPers <= 0 || maxPers > 2000)
            throw new Error("Maximum number of persons is wrong")

        if(close > open)
            throw new Error("Closing time must be greater than opening time")
        
        if(pauseStart == null || pauseStop == null || pauseStart == undefined || pauseStop == undefined){
            //NO HAY BREAK
            customSettings = {
                timePeriod: timePeriod,
                close: close,
                open : open,
                peoplePerPeriod : maxPers
            }
        }
        else if(0 < pauseStart < pauseStop > 0) {
            customSettings = {
                timePeriod: timePeriod,
                pauseStart: pauseStart,
                pauseStop : pauseStop,
                close: close,
                open : open,
                peoplePerPeriod : maxPers
            }
        }
        else {
            throw new Error('Empty or wrong fields')
        }
        
         const postItem = {
        localId: sub,
        email : email,
        name : name,
        family_name : family_name,
        city: city,
        type : type,
        settings : customSettings
   }
   
    const params = {
         TableName: process.env.DYNAMODB_LOCALS_NAME,
         Item: marshall(postItem || {})
     };
     
    const createResult = await ddbClient.send(new PutItemCommand(params));

    }
}
