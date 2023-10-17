'use strict';
const productsList = {products: [{
  description: "Short Product Description1",
  id: "1",
  price: 24,
  title: "ProductOne",
},
{
  description: "Short Product Description7",
  id: "2",
  price: 15,
  title: "ProductTitle",
},
{
  description: "Short Product Description2",
  id: "3",
  price: 23,
  title: "Product",
},
{
  description: "Short Product Description4",
  id: "4",
  price: 15,
  title: "ProductTest",
},
{
  description: "Short Product Descriptio1",
  id: "5",
  price: 23,
  title: "Product2",
},]}

module.exports.getProducts = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      productsList,
      null,
      2
    ),
  };
};

module.exports.productsById = async (event) => {
  const product = productsList.products.find(({ id }) => id === event.pathParameters?.productId);
  if(!event.pathParameters?.productId) {
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
  return product ? {
    statusCode: 200,
    body: JSON.stringify(
      {
        ...product
      },
      null,
      2
    ),
  } : {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: `product with id ${event.pathParameters.productId} not found`
      },
      null,
      2
    ),
  };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};
