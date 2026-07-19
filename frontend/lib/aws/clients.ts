// Server-side AWS SDK singletons. Import only from API routes / server code.

import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider"
import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb"
import { S3Client } from "@aws-sdk/client-s3"
import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime"
import { AWS_REGION } from "./config"

// Vercel reserves AWS_* env names in some setups; support APP_AWS_* fallbacks.
const credentials =
  process.env.APP_AWS_ACCESS_KEY_ID && process.env.APP_AWS_SECRET_ACCESS_KEY
    ? {
        accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY,
      }
    : undefined

let _cognito: CognitoIdentityProviderClient | null = null
let _ddb: DynamoDBDocumentClient | null = null
let _s3: S3Client | null = null
let _bedrock: BedrockRuntimeClient | null = null

export function cognito() {
  if (!_cognito) _cognito = new CognitoIdentityProviderClient({ region: AWS_REGION, credentials })
  return _cognito
}

export function ddb() {
  if (!_ddb) {
    _ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: AWS_REGION, credentials }), {
      marshallOptions: { removeUndefinedValues: true },
    })
  }
  return _ddb
}

export function s3() {
  if (!_s3) _s3 = new S3Client({ region: AWS_REGION, credentials })
  return _s3
}

export function bedrock() {
  if (!_bedrock) _bedrock = new BedrockRuntimeClient({ region: AWS_REGION, credentials })
  return _bedrock
}
