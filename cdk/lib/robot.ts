import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import { ThingWithCert } from "cdk-iot-core-certificates-v3";

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
  }
}
