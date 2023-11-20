import AWS from "aws-sdk";
import { Bucket } from "../constants/constants.js";

const s3 = new AWS.S3({ signatureVersion: 'v4' });

export const importProductsFile = async (event) => {
  let statusCode = 200;
  let body;
  const fileName = event.queryStringParameters.name;

  try {
    const command = {
      Bucket,
      Key: `uploaded/${fileName}`,
      Expires: 60,
      ContentType: 'text/csv',

    };
    body = await s3.getSignedUrlPromise('putObject', params);;
  } catch (err) {
    console.log(err);
    statusCode = 500;
    body = "Error getting SignedUrl";
  }
  return {
    statusCode,
    headers: {
      'content-type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
      'Access-Control-Allow-Methods': 'OPTIONS, GET, PUT',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
    body,
  };
}