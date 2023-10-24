import type { AWS } from '@serverless/typescript';

const serverlessConfiguration: AWS = {
  service: 'import-service',
  frameworkVersion: '3',
  app: 'products-list',
  org: "serhii1udovenko",
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    stage: 'dev',
    region: 'eu-central-1',
  },
  functions: {
    importProductsFile: {
      handler: 'importProductsFile.handler',
      events: [
        {
          http: {
            path: 'import',
            method: 'post',
            cors: true,
          },
        },
      ],
      // @ts-expect-error: Let's ignore a single compiler
      iamRoleStatements: [
        {
          Effect: 'Allow',
          Action: ['s3:GetObject'],
          Resource: 'arn:aws:s3:::import-service-be/*', 
        },
      ],
      environment: {
        BUCKET_NAME: 'import-service-be', 
      },
    },
    importFileParser: {
      handler: 'importFileParser.handler',
      // @ts-expect-error: Let's ignore a single compiler
      iamRoleStatements: [
        {
          Effect: 'Allow',
          Action: ['s3:GetObject', 's3:PutObject'],
          Resource: 'arn:aws:s3:::import-service-be/*', 
        },
      ],
      events: [
        {
          s3: {
            bucket: 'import-service-be',
            event: 's3:ObjectCreated:*',
            existing: true,
            rules: [
              {
                prefix: 'uploaded/',
              },
            ],
          },
        },
      ],
      environment: {
        BUCKET_NAME: 'import-service-be',
      },
    },
  },
};

module.exports = serverlessConfiguration;