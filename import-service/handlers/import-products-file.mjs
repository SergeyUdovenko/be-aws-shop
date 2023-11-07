import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { region, Bucket } from '../constants/constants';

const s3Client = new S3Client({
  region,
});

async function importProductsFile(event) {
  let statusCode = 200;
  let body;
  const fileName = event.queryStringParameters.name;
  
  try {
    const command = new PutObjectCommand({
      Bucket,
      Key: `uploaded/${fileName}`,
      
    });
    body = await getSignedUrl(s3Client, command, {
      expiresIn: 60,
    }); 
  } catch (err) {
      console.log(err); 
      statusCode = 500;
      body = "Error getting SignedUrl";
  }
  return {
    statusCode,
    body,
  };
}

export {importProductsFile};