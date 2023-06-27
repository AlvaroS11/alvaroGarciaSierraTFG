import jsonwebtoken from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

import AWS from 'aws-sdk';
const cognito = new AWS.CognitoIdentityServiceProvider();



export const handler = async (event, context, callback) => {
  try {
    console.log(event)
    await authenticate(event, callback);

  } catch (error) {
    console.error(`Authentication failed: ${error}`);
    callback("Unauthorized")

  }
};



const client = jwksClient({
  jwksUri: 'https://cognito-idp. ' + CognitoUserPool + ' /.well-known/jwks.json'
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    if (err) {
      callback(err)
    }
    var signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

async function authenticate(event, callback) {
  // const token = event.headers.Authorization.split(' ')[1];
  //var token =JSON.parse(event.authorizationToken)

  var token = event.authorizationToken
  const decodedToken = jsonwebtoken.decode(token, { complete: true })
  const kid = decodedToken.header.kid;

  console.log("LLEGA PROMISE")
  return new Promise((resolve, reject) => {
    getKey({ kid }, (err, key) => {
      if (err) {
        reject('Unauthorized');
      }

      jsonwebtoken.verify(token, key, { algorithms: ['RS256'] }, (err, decoded) => {
        if (err) {
          reject('Unauthorized');
        }

        const params = {
          UserPoolId: 'us-east-1_8zNNpg8Ps',
          Username: decoded.sub
        };


        cognito.adminGetUser(params, (err, data) => {
          if (err) {
            console.log("Error at getting user")
            reject('Unauthorized');
          } else {
            try {
              console.log(data)
              console.log(data.UserAttributes)
              const isLocal = data.UserAttributes.find(attr => attr.Name === 'custom:isLocal').Value;

              if (isLocal === "true" && decodedToken.payload['custom:isLocal'] === "true") {
                console.log("IS LOCAL!!")
                //callback(null, generatePolicy('local', 'Allow', event.methodArn));
                callback(null, generatePolicy('local', 'Allow', event.methodArn, decoded.sub));

              }

              else if (isLocal === "false" && decodedToken.payload['custom:isLocal'] === "false") {
                console.log("IS USER!!")
                //  callback(null, generatePolicy('user', 'Allow', event.methodArn));
                callback(null, generatePolicy('user', 'Allow', event.methodArn, decoded.sub));

              }
              else {
                reject('Unauthorized')
              }

            } catch (err) {
              reject('Unauthorized')
            }

          }
          //callback(null, generatePolicy('local', 'Allow', event.methodArn));

        });
      });
    });
  })
}


var generatePolicy = function (principalId, effect, resource, sub) {
  console.log("LLega generatePolicy")
  var authResponse = {};

  authResponse.principalId = principalId;
  if (effect && resource) {
    var policyDocument = {};
    policyDocument.Version = '2012-10-17';
    policyDocument.Statement = [];
    var statementOne = {};
    statementOne.Action = 'execute-api:Invoke';
    statementOne.Effect = effect;
    statementOne.Resource = resource;
    policyDocument.Statement[0] = statementOne;
    authResponse.policyDocument = policyDocument;
  }

  // Optional output with custom properties of the String, Number or Boolean type.
  authResponse.context = {
    "stringKey": "stringval",
    "sub": sub,
    "booleanKey": true
  };
  return authResponse;
}
