
var serverlessSDK = require('./serverless_sdk/index.js');
serverlessSDK = new serverlessSDK({
  orgId: 'serhii1udovenko',
  applicationName: 'products-list',
  appUid: '6vfTBkQtQV8kr5cF4g',
  orgUid: '21301a65-01a2-4501-8896-9ce2e78f9754',
  deploymentUid: 'fd73be66-6fa5-4f37-bd3f-8b3ddce95a33',
  serviceName: 'authorization-service',
  shouldLogMeta: true,
  shouldCompressLogs: true,
  disableAwsSpans: false,
  disableHttpSpans: false,
  stageName: 'dev',
  serverlessPlatformStage: 'prod',
  devModeEnabled: false,
  accessKey: null,
  pluginVersion: '7.1.0',
  disableFrameworksInstrumentation: false
});

const handlerWrapperArgs = { functionName: 'authorization-service-dev-basicAuthorizer', timeout: 6 };

try {
  const userHandler = require('./basicAuthorizer/basicAuthorizer.js');
  module.exports.handler = serverlessSDK.handler(userHandler.handler, handlerWrapperArgs);
} catch (error) {
  module.exports.handler = serverlessSDK.handler(() => { throw error }, handlerWrapperArgs);
}