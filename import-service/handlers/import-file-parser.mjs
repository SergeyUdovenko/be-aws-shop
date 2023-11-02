import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import * as csvParser from "csv-parser";
import { region, Bucket } from '../constants/constants';


async function importFileParser(event) {
  const s3 = new S3Client({ region: region }); 

  for (const record of event.Records) {
    const s3Object = record.s3.object;
    const sourceKey = decodeURIComponent(s3Object.key);
    const destinationKey = sourceKey.replace('uploaded/', 'parsed/');

    const getObjectParams = {
      Bucket: Bucket,
      Key: sourceKey,
    };

    const copyObjectParams = {
      Bucket: process.env.BUCKET_NAME,
      CopySource: `${process.env.BUCKET_NAME}/${sourceKey}`,
      Key: destinationKey,
    };

    try {
      const s3Stream = getObject(s3, getObjectParams);

      s3Stream
        .pipe(csvParser())
        .on('data', (row) => {
          console.log('Parsed data:', row);
        })
        .on('end', async () => {
          // Copy the object to the 'parsed' folder
          await s3.send(new CopyObjectCommand(copyObjectParams));
          // Delete the original object from the 'uploaded' folder
          await s3.send(new DeleteObjectCommand(getObjectParams));
        });
    } catch (error) {
      console.error('Error processing S3 object:', error);
    }
  }
}

export { importFileParser };