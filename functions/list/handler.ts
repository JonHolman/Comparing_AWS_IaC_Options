import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";

export const handler = async () => {
    const client = new DynamoDBClient({});

    const results = await client.send(
      new ScanCommand({ TableName: process.env.DYNAMODB_TABLE })
    );

    return {
      statusCode: 200,
      body: JSON.stringify(results.Items),
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    };
};
