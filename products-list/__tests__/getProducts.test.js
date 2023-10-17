const { getProducts } = require('./handler');
const productsList = { products: [{
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
},] };

describe('getProducts', () => {
  it('should return a 200 status code and the products list', async () => {
    const event = {pathParameters: {id: "1"}};

    const response = await getProducts(event);

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual(productsList);
  });
});