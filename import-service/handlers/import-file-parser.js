import AWS from "aws-sdk";
import { S3Client, GetObjectCommand, CopyObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import csvParser from "csv-parser";
import { Bucket, region } from '../constants/constants.js';
import { config } from 'dotenv';

const s3 = new S3Client({ region: region });
const sqsClient = new AWS.SQS();

config();
export const importFileParser = async (event) => {
  console.log("event", event)
  for (const record of event.Records) {
    const sourceKey = record.s3.object.key;
    const destinationKey = sourceKey.replace('uploaded/', 'parsed/');
    const getObjectParams = {
      Bucket: Bucket,
      Key: sourceKey,
    };

    const copyObjectParams = {
      Bucket: Bucket,
      CopySource: `${Bucket}/${sourceKey}`,
      Key: destinationKey,
    };

    try {
      const { Body } = await s3.send(new GetObjectCommand(getObjectParams));
      const s3Stream = Body;
      const results = [];
      s3Stream
        .pipe(csvParser())
        .on('data', (row) => {
          console.log('Parsed data:', row);
          results.push(row)
        })
        .on('end', async () => {
          // Copy the object to the 'parsed' folder
          console.log("results====", results)
          await s3.send(new CopyObjectCommand(copyObjectParams));
          for (const result of results) {
            await sqsClient
              .sendMessage({
                QueueUrl: process.env.SQS_URL,
                MessageBody: JSON.stringify(result),
              })
              .promise();
          }
          await s3.send(new DeleteObjectCommand(getObjectParams));
        })
        .on('error', error => {
          reject(error);
        });
    } catch (error) {
      console.error('Error processing S3 object:', error);
    }
  }
}