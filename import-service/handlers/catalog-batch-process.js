const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");
const { region } = require('../constants/constants.js') ;
const { DynamoDBClient,  PutItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall } = require("@aws-sdk/util-dynamodb");
const { randomUUID  } = require("crypto");

const client = new DynamoDBClient({ region: region });
module.exports.catalogBatchProcess = async (event) => {
	
  const snsClient = new SNSClient({ region });
  const newRecords = event.Records.map(record => JSON.parse(record.body));
  
  for(const record of newRecords){
    // create products logic here
		const id = randomUUID();
		const { title, price, description, stock } = record;
		const putStockParams = {
			TableName: process.env.stocks,
			Item: marshall({
				product_id: id,
				stock: Number(stock) || 0
			}),
		};

		const putStockCommand = new PutItemCommand(putStockParams);
		const putProductParams = {
			TableName: process.env.products,
			Item: marshall({
				id,
				title,
				price: Number(price) || 0,
				description: description || ""
			}),
		};

		const putProductCommand = new PutItemCommand(putProductParams);
		await client.send(putStockCommand);
		await client.send(putProductCommand);
  }
  
  const snsParams = { Message: 'Products successfully created!', TopicArn: process.env.SNS_ARN };
  await snsClient.send(new PublishCommand(snsParams));
}