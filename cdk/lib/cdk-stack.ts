import { Stack, CfnOutput, RemovalPolicy } from "aws-cdk-lib";
import { Construct } from "constructs";
import { RestApi, LambdaIntegration } from "aws-cdk-lib/aws-apigateway";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { Table, AttributeType } from "aws-cdk-lib/aws-dynamodb";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

interface ResourceConfig {
  path: string;
  functionName: string;
  handlerPath: string;
}

export class CdkStack extends Stack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Create the DynamoDB table
    const table = new Table(this, "Table", {
      partitionKey: {
        name: "pk",
        type: AttributeType.STRING,
      },
      tableName: "cdk",
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const createLambdaFunction = (config: ResourceConfig) =>
      new NodejsFunction(this, config.functionName, {
        entry: `${__dirname}/../../functions/${config.handlerPath}`,
        environment: { DYNAMODB_TABLE: table.tableName },
        runtime: Runtime.NODEJS_18_X,
      });

    const resourceConfigs: ResourceConfig[] = [
      {
        path: "list",
        functionName: "listFunction",
        handlerPath: "list/handler.ts",
      },
      {
        path: "add",
        functionName: "addFunction",
        handlerPath: "add/handler.ts",
      },
    ];

    const api = new RestApi(this, "api", {
      restApiName: "cdk",
    });

    resourceConfigs.forEach((config) => {
      const lambdaFunction = createLambdaFunction(config);
      const integration = new LambdaIntegration(lambdaFunction);

      const resource = api.root.addResource(config.path);
      resource.addMethod("GET", integration);

      // Grant the Lambda function permission to access the table
      table.grantReadWriteData(lambdaFunction);
    });

    resourceConfigs.forEach(
      (config) =>
        new CfnOutput(this, `${config.path}Endpoint`, {
          value: api.urlForPath(`/${config.path}`),
        })
    );
  }
}
