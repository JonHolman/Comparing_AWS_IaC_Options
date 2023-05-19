import { Stack, StackProps, CfnOutput, RemovalPolicy } from "aws-cdk-lib";
import { Construct } from "constructs";
import { RestApi, LambdaIntegration } from "aws-cdk-lib/aws-apigateway";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { Table, AttributeType } from "aws-cdk-lib/aws-dynamodb";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

export class CdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create the DynamoDB table
    const table = new Table(this, "Table", {
      partitionKey: {
        name: "pk",
        type: AttributeType.STRING,
      },
      tableName: "cdk",
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const listFunction = new NodejsFunction(this, "listFunction", {
      entry: `${__dirname}/../../functions/list/handler.ts`,
      environment: { DYNAMODB_TABLE: table.tableName },
      runtime: Runtime.NODEJS_18_X,
    });

    const addFunction = new NodejsFunction(this, "addFunction", {
      entry: `${__dirname}/../../functions/add/handler.ts`,
      environment: { DYNAMODB_TABLE: table.tableName },
      runtime: Runtime.NODEJS_18_X,
    });

    const api = new RestApi(this, "api", {
      restApiName: "cdk",
    });

    const listIntegration = new LambdaIntegration(listFunction);
    const addIntegration = new LambdaIntegration(addFunction);

    const listResource = api.root.addResource("list");
    const listMethod = listResource.addMethod("GET", listIntegration);

    const addResource = api.root.addResource("add");
    const addMethod = addResource.addMethod("GET", addIntegration);

    // Grant the Lambda functions permission to access the table
    table.grantReadData(listFunction);
    table.grantWriteData(addFunction);

    new CfnOutput(this, "listEndpoint", {
      value: api.urlForPath("/list"),
    });
    new CfnOutput(this, "addEndpoint", {
      value: api.urlForPath("/add"),
    });
  }
}
