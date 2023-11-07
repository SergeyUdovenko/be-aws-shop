const  importProductsFile  = require('./handlers/import-products-file.js');
const  catalogBatchProcess = require('./handlers/catalog-batch-process.js');
const  importFileParser = require('./handlers/import-file-parser.js');

module.exports = {importProductsFile, importFileParser, catalogBatchProcess}