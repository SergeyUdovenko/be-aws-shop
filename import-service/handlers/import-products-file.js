const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } =  require("@aws-sdk/s3-request-presigner");
const { region, Bucket } =  require("../constants/constants.js");

const s3Client = new S3Client({
  region,
});

module.exports.importProductsFile = async (event) => {
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