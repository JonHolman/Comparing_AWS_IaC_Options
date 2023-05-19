import { Stack, CfnOutput, RemovalPolicy } from "aws-cdk-lib";
import { Construct } from "constructs";
import { RestApi, LambdaIntegration } from "aws-cdk-lib/aws-apigateway";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { Table, AttributeType } from "aws-cdk-lib/aws-dynamodb";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

interface OurFunctionProps {
  api: RestApi;
  table: Table;
  path: string;
}

class OurFunction extends Construct {
  constructor(scope: Construct, id: string, config: OurFunctionProps) {
    super(scope, id);

    const lambdaFunction = new NodejsFunction(this, `${config.path}Function`, {
      entry: `${__dirname}/../../functions/${config.path}/handler.ts`,
      environment: { DYNAMODB_TABLE: config.table.tableName },
      runtime: Runtime.NODEJS_18_X,
    });

    const functionIntegration = new LambdaIntegration(lambdaFunction);

    const resource = config.api.root.addResource(config.path);
    resource.addMethod("GET", functionIntegration);

    // Grant the Lambda function permission to access the DynamoDB table
    config.table.grantReadWriteData(lambdaFunction);

    // Add new API endpoint to the stack outputs
    new CfnOutput(this, `${config.path}Endpoint`, {
      value: config.api.urlForPath(`/${config.path}`),
    });
  }
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

    // Create the API Gateway
    const api = new RestApi(this, "api", {
      restApiName: "cdk",
    });

    // Create the functions with their associated API gateway paths
    new OurFunction(this, "listFunction", {
      api,
      table,
      path: "list",
    });

    new OurFunction(this, "addFunction", {
      api,
      table,
      path: "add",
    });
  }
}
