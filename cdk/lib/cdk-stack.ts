import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from "aws-cdk-lib/aws-s3";
import { Robot } from './robot';


export class AmazonNovaRoboticCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    // Create an S3 bucket for storing robot data
    const robotDataBucket = new s3.Bucket(this, 'RobotDataBucket', {
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Automatically delete bucket during stack deletion
      autoDeleteObjects: true, // Automatically delete objects in the bucket during stack deletion
    });

    for (let i = 0; i < 5; i++) {
      new Robot(this, `Robot${i}`, {
        robotName: `Robot${i}`,
        saveFileBucket: robotDataBucket,
      });
    }

    // output the bucket name
    new cdk.CfnOutput(this, 'RobotDataBucketName', {
      value: robotDataBucket.bucketName,
      description: 'The name of the S3 bucket for storing robot data',      
    });   

  }
}
