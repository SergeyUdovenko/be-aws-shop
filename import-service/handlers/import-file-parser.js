const { S3Client, GetObjectCommand, CopyObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { SQSClient, SendMessageCommand } = require('@aws-sdk/client-sqs');

const csvParser = require("csv-parser");
const { region, Bucket } = require('../constants/constants.js');

const s3 = new S3Client({ region });
const sqsClient = new SQSClient({ region });

module.exports.importFileParser = async (event) => {

  for (const record of event.Records) {
    const s3Object = record.s3.object;
    const sourceKey = s3Object.key;
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
      const s3Stream = s3.send(new GetObjectCommand(getObjectParams));
      const results = [];
      s3Stream
        .pipe(csvParser())
        .on('data', (row) => {
          console.log('Parsed data:', row);
          results.push(row)
        })
        .on('end', async () => {
          // Copy the object to the 'parsed' folder

          await s3.send(new CopyObjectCommand(copyObjectParams));
          // Delete the original object from the 'uploaded' folder
          await s3.send(new DeleteObjectCommand(getObjectParams));
          for (const result of results) {
            const sqsParams = { QueueUrl: process.env.SQS_URL, MessageBody: JSON.stringify(result) };
            await sqsClient.send(new SendMessageCommand(sqsParams));
          }
        });
    } catch (error) {
      console.error('Error processing S3 object:', error);
    }
  }
}