import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { RoboticConstruct } from "./construct/robot-iot";
import { SpeechControlWebConstruct } from "./construct/speech-web";
import { TextControlWebConstruct } from "./construct/text-web";
import { RobotSsmConstruct } from "./construct/robot-ssm";
import { DatabaseConstruct } from "./construct/datebase";

export class AmazonNovaRoboticCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const numberOfRobots = 9; // Number of robots
    const thingNames = Array.from(
      { length: numberOfRobots },
      (_, i) => `robot_${i + 1}`
    );
    const droneNames = Array.from({ length: 3 }, (_, i) => `drone_${i + 1}`);
    thingNames.push(...droneNames);
    const roboticConstruct = new RoboticConstruct(this, "RoboticConstruct", {
      thingNames: thingNames,
    });

    const databaseConstruct = new DatabaseConstruct(this, "DatabaseConstruct");

    const webConstruct = new SpeechControlWebConstruct(this, "WebConstruct", {
      database: databaseConstruct,
    });

    const textControlWebConstruct = new TextControlWebConstruct(
      this,
      "TextControlWebConstruct",
      {
        database: databaseConstruct,
      }
    );

    const ssmNames = Array.from(
      { length: numberOfRobots },
      (_, i) => `RaspberryPiRobot${i + 1}`
    );
    new RobotSsmConstruct(this, "RobotSsmConstruct", {
      prefix: "humanoid",
      thingNames: ssmNames,
    });

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
