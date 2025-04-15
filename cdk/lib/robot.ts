import * as s3 from "aws-cdk-lib/aws-s3";
import { ThingWithCert } from "cdk-iot-core-certificates-v3";
import { Construct } from "constructs";

export interface RobotProps {
  readonly robotName: string;
  readonly saveFileBucket: s3.IBucket;
}

export class Robot extends Construct {
  public readonly thingWithCert: ThingWithCert;
  constructor(scope: Construct, id: string, props: RobotProps) {
    super(scope, id);
    this.thingWithCert = new ThingWithCert(
      this,
      "MyThing",
      {
        // The name of the thing
        thingName: props.robotName,
        // Whether to save the certificate and private key to the SSM Parameter Store
        saveToParamStore: false,
        // The prefix to use for the SSM Parameter Store parameters
        paramPrefix: "test",
        // The bucket to save the certificate and private key to
        // Both files are saved at `{thingName}/{thingName}.private.key` and `{thingName}/{thingName}.cert.pem`
        // If not provided, the certificate and private key will not be saved
        saveFileBucket: props.saveFileBucket,
      }
    );
  }
}
