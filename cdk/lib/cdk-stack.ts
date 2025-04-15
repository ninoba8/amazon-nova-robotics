import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { RoboticConstruct } from "./robot";
import { WebConstruct } from "./web";


export class AmazonNovaRoboticCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const thingNames = ["robot_1", "robot_2", "robot_3", "robot_4", "robot_5"];
    const roboticConstruct = new RoboticConstruct(this, "RoboticConstruct", {
      thingNames: thingNames,
    });
    const webConstruct  =new WebConstruct(this, "WebConstruct");

    new cdk.CfnOutput(this, "url", {
      value: "https://" + webConstruct.serviceUrl,
    });
    // output the bucket name
    new cdk.CfnOutput(this, "RobotDataBucketName", {
      value: roboticConstruct.bucket.bucketName,
      description: "The name of the S3 bucket for storing robot data",
    });
  }
}
