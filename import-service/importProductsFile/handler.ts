import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const s3 = new AWS.S3();

  const name = event.queryStringParameters?.name;

  if (!name) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Name parameter is missing in the query string' }),
    };
  }

  const key = `uploaded/${name}`;

  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: key,
    Expires: 60, // URL expiration time in seconds
  };

  try {
    const signedUrl = await s3.getSignedUrlPromise('putObject', params);

    return {
      statusCode: 200,
      body: JSON.stringify({ signedUrl }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to generate Signed URL', error }),
    };
  }
};