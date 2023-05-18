import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

export const handler = async () => {
  const client = new DynamoDBClient({});

  const timestamp = new Date().toString();

  const results = await client.send(
    new PutItemCommand({
      TableName: process.env.DYNAMODB_TABLE,
      Item: { pk: { S: timestamp } },
    })
  );

  return {
    statusCode: 200,
    body: JSON.stringify("item added"),
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  };
};
