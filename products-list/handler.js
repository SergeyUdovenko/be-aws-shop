'use strict';
const { DynamoDBClient, GetItemCommand, PutItemCommand, ScanCommand } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const { randomUUID  } = require("crypto");
const client = new DynamoDBClient({ region: "eu-central-1" });

const getItems = async (tableName) => {
  const scan = new ScanCommand({
    TableName: tableName,
  });
  const response = await client.send(scan)
  return response.Items.map((item) => unmarshall(item));
}

const getItem = async (id) => {
  const getItemCommand = new GetItemCommand({
    TableName: process.env.products,
    Key: marshall({ id })
  });
  const response = await client.send(getItemCommand)
  return unmarshall(response.Item)
}

const getItemFromStock = async (product_id) => {
  const getItemCommand = new GetItemCommand({
    TableName: process.env.stocks,
    Key: marshall({ product_id })
  });
  const response = await client.send(getItemCommand)
  return unmarshall(response.Item)
}

module.exports.getProducts = async (event) => {
  try {
    const productsFormProductsTable = await getItems(process.env.products);

    const productsFormStockTable = await getItems(process.env.stocks);

    const response = productsFormProductsTable.map(product => {
      return {
        ...product,
        stock: productsFormStockTable.find(stock => stock.product_id = product.id).count || 0
      }
    })
    return {
      statusCode: 200,
      body: JSON.stringify(
        response,
        null,
        2
      ),
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify(e.message)
    }
  }
};

module.exports.productsById = async (event) => {
  if (!event.pathParameters?.productId) {
    return {
      statusCode: 400,
      body: JSON.stringify(
        {
          message: `product id required`
        },
        null,
        2
      ),
    }
  }
  const id = event.pathParameters?.productId;
  const product = await getItem(id)

  const stockInfo = await getItemFromStock(id)
  return product ? {
    statusCode: 200,
    body: JSON.stringify(
      {
        ...product,
        stock: stockInfo.count || 0
      },
      null,
      2
    ),
  } : {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: `product with id ${id} not found`
      },
      null,
      2
    ),
  };



  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};
const validateBody = (body) => {
  const { title } = body;
  if (!title) {
    return {
      statusCode: 400,
      body: JSON.stringify("title required"),
    }
  }
}

module.exports.createProduct = async (event) => {
  const requestBody = JSON.parse(event.body);
  validateBody(requestBody);
  const id = randomUUID();

  const { title, cost, description, stock } = requestBody;
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
      cost: Number(cost) || 0,
      description: description || ""
    }),
  };

  const putProductCommand = new PutItemCommand(putProductParams);
  await client.send(putStockCommand);
  await client.send(putProductCommand);

  return {
    statusCode: 200,
    body: JSON.stringify("Item created successfully."),
  };
}