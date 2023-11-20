import AWS from "aws-sdk";
import { marshall } from "@aws-sdk/util-dynamodb";
import { randomUUID } from "crypto";

const client = new AWS.DynamoDB.DocumentClient();

export const catalogBatchProcess = async (event) => {

	const snsClient = new AWS.SNS();
	const newRecords = event.Records.map(record => JSON.parse(record.body));

	for (const record of newRecords) {
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
		await client.put(putStockCommand);
		await client.put(putProductCommand);
	}

	const snsParams = {
		Subject: 'Product Created', Message: 'Products successfully created!', TopicArn: process.env.SNS_ARN
	};
	await snsClient.publish(snsParams);
}