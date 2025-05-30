import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import { ThingWithCert } from "cdk-iot-core-certificates-v3";
import * as iam from "aws-cdk-lib/aws-iam";

export interface RoboticConstructProps {
  thingNames: string[];
}

export class RoboticConstruct extends Construct {
  public readonly bucket: s3.IBucket;

  constructor(scope: Construct, id: string, props: RoboticConstructProps) {
    super(scope, id);

    // Example S3 bucket creation
    this.bucket = new s3.Bucket(this, "RoboticBucket", {
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const sources: s3deploy.ISource[] = [];

    props.thingNames.forEach((thingName, index) => {
      const { certPem, privKey } = new ThingWithCert(this, `Thing${index}`, {
        thingName,
        saveToParamStore: false,
      });
      sources.push(
        s3deploy.Source.data(`${thingName}/${thingName}.cert.pem`, certPem),
        s3deploy.Source.data(`${thingName}/${thingName}.private.key`, privKey)
      );
    });

    // Example S3 deployment
    new s3deploy.BucketDeployment(this, "DeployFiles", {
      sources,
      destinationBucket: this.bucket,
    });

    // Create an IAM user for IoT robot access
    const iotUser = new iam.User(this, "IoTRobotUser", {
      userName: "IoTRobotUser",
    });

    iotUser.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["iot:Connect"],
        resources: [`arn:aws:iot:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:*`],
      })
    );
    // Attach fine-grained IoT permissions for each device
    for (const thingName of props.thingNames) {
      iotUser.addToPolicy(
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ["iot:Publish", "iot:Subscribe", "iot:Receive"],
          resources: [
            `arn:aws:iot:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:topic/device/${thingName}/*`,
            `arn:aws:iot:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:topicfilter/device/${thingName}/*`,
          ],
        })
      );
    }

    // Create access key for the IoT user
    const iotAccessKey = new iam.CfnAccessKey(this, "IoTRobotUserAccessKey", {
      userName: iotUser.userName,
    });

    // Output the access key and secret
    new cdk.CfnOutput(this, "IoTRobotUserName", {
      key: "IoTRobotUserName",
      value: iotUser.userName,
      description: "IAM user for IoT robot access.",
    });
    new cdk.CfnOutput(this, "IoTRobotAccessKeyId", {
      key: "IoTRobotAccessKeyId",
      value: iotAccessKey.ref,
      description: "Access Key ID for IoT robot user.",
    });
    new cdk.CfnOutput(this, "IoTRobotSecretAccessKey", {
      key: "IoTRobotSecretAccessKey",
      value: iotAccessKey.attrSecretAccessKey,
      description: "Secret Access Key for IoT robot user.",
    });
  }
}
