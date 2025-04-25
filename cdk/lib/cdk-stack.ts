import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { RoboticConstruct } from "./robot";
import { SpeechControlWebConstruct } from "./speech-web";
import { TextControlWebConstruct } from "./text-web";

export class AmazonNovaRoboticCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const numberOfRobots = 7; // Number of robots
    const thingNames = Array.from(
      { length: numberOfRobots },
      (_, i) => `robot_${i + 1}`
    );
    const roboticConstruct = new RoboticConstruct(this, "RoboticConstruct", {
      thingNames: thingNames,
    });
    const webConstruct = new SpeechControlWebConstruct(this, "WebConstruct");

    const textControlWebConstruct = new TextControlWebConstruct(
      this,
      "TextControlWebConstruct"
    );

    new cdk.CfnOutput(this, "speechUrl", {
      description: "The URL of the Speech Control Web",
      value: "https://" + webConstruct.serviceUrl,
    });

    new cdk.CfnOutput(this, "textUrl", {
      description: "The URL of the Text Control Web",
      value: textControlWebConstruct.serviceUrl,
    });

    new cdk.CfnOutput(this, "RobotDataBucketName", {
      value: roboticConstruct.bucket.bucketName,
      description: "The name of the S3 bucket for storing robot data",
    });
  }
}
