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