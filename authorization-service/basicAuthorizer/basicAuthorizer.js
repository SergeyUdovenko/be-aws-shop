const { config } = require('dotenv');

config();

const generatePolicy = (principalId, effect = 'Deny', resource) => ({
  principalId,
  policyDocument: {
    Version: '2012-10-17',
    Statement: [
      {
        Action: 'execute-api:Invoke',
        Effect: effect,
        Resource: resource,
      },
    ],
  },
});

const basicAuthorizer = async (event) => {
  console.log('Basic Authorizer | Event:', event);

  try {
    const authorizationToken = event.headers?.authorization;

    if (!authorizationToken) {
      console.log('Basic Authorizer | Unauthorized (No token provided)');
      return generatePolicy('user', 'Deny', event.routeArn);
    }

    const encodedCreds = authorizationToken.split(' ')[1];
    const userCreds = Buffer.from(encodedCreds, 'base64').toString().split(':');
    const username = userCreds[0];
    const password = userCreds[1];

    const isAuthorized = username === process.env.USERNAME && password === process.env.TEST_PASSWORD;

    if (isAuthorized) {
      console.log('Basic Authorizer | Authorized');
      return generatePolicy(username, 'Allow', event.routeArn);
    } else {
      console.log('Basic Authorizer | Unauthorized (Invalid credentials)');
      return generatePolicy('user', 'Deny', event.routeArn);
    }
  } catch (error) {
    console.error('Basic Authorizer | Error:', error);
    return generatePolicy('user', 'Deny', event.routeArn);
  }
};

module.exports.handler = async (event) => {
  try {
    const authResponse = await basicAuthorizer(event);
    console.log('Basic Authorizer | Auth Response:', authResponse);
    return authResponse;
  } catch (error) {
    console.error('Basic Authorizer | Error:', error);
    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: event.routeArn,
          },
        ],
      },
    };
  }
};