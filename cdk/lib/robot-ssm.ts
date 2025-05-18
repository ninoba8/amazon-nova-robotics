import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as cr from "aws-cdk-lib/custom-resources";
import path = require("path");

export interface RobotSsmConstructProps {
  thingNames: string[];
}

export class RobotSsmConstruct extends Construct {
  constructor(scope: Construct, id: string, props: RobotSsmConstructProps) {
    super(scope, id);

    const ssmServiceRole = new iam.Role(this, "SSMServiceRole", {      
      roleName: "RobotSSMServiceRole",
      assumedBy: new iam.ServicePrincipal("ssm.amazonaws.com", {
        conditions: {
          StringEquals: {
            "aws:SourceAccount": cdk.Aws.ACCOUNT_ID,
          },
          ArnEquals: {
            "aws:SourceArn": `arn:aws:ssm:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:*`,
          },
        },
      }),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "AmazonSSMManagedInstanceCore"
        ),
      ],
    });

    const functionRole = new iam.Role(this, "FunctionRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaBasicExecutionRole"
        ),
      ],
      inlinePolicies: {
        LambdaFunctionPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                "iam:PassRole",
                "ssm:CreateActivation",
                "ssm:DeleteActivation",
              ],
              resources: ["*"],
            }),
          ],
        }),
      },
    });

    const lambdaFunction = new lambda.Function(this, "Function", {
      description: "Lambda function to create SSM activation",
      code: lambda.Code.fromAsset(path.join(__dirname, "function/ssm_custom_resources"), {
      bundling: {
        image: lambda.Runtime.PYTHON_3_10.bundlingImage,
        command: [
        "bash", "-c", 
        "pip install -r requirements.txt -t /asset-output && cp -au . /asset-output"
        ],
      },
      }),
      handler: "index.lambda_handler",
      runtime: lambda.Runtime.PYTHON_3_10,
      environment: {
      REGION: cdk.Aws.REGION,
      SSM_SERVICE_ROLE: ssmServiceRole.roleName,
      },
      role: functionRole,
      timeout: cdk.Duration.seconds(30),
    });

    for (let thingName of props.thingNames) {
      const customResource = new cdk.CustomResource(
        this,
        `SsmCustomResource${thingName}`,
        {
          serviceToken: lambdaFunction.functionArn,
          properties: {
            ThingName: thingName,
          }
        }
      );

      new cdk.CfnOutput(this, `ActivationIdOutput${thingName}`, {   
        key: `ActivationIdOutput${thingName}`,    
        value: customResource.getAttString("ActivationId"),
        description: `The Activation ID created by the SSM activation for robot ${thingName}.`,
      });

      new cdk.CfnOutput(this, `ActivationCodeOutput${thingName}`, {
        key: `ActivationCodeOutput${thingName}`,
        value: customResource.getAttString("ActivationCode"),
        description: `The Activation Code created by the SSM activation for robot ${thingName}}.`,
      });
    }
  }
}
