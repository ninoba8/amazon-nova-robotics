import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { RemovalPolicy } from 'aws-cdk-lib';
import { AttributeType, Billing, TableV2 } from 'aws-cdk-lib/aws-dynamodb';


export class DatabaseConstruct extends Construct {
  /**
   * The DynamoDB table instance
   */
  public readonly robotTable: TableV2;

  constructor(scope: Construct, id: string) {
    super(scope, id);
    this.robotTable = new TableV2(this, 'RobotTable', {      
      partitionKey: {
        name: "id",
        type: AttributeType.STRING,
      },
      billing: Billing.onDemand(), // On-demand capacity
      removalPolicy: RemovalPolicy.DESTROY,
      pointInTimeRecovery: false,
    });
    
    new cdk.CfnOutput(this, 'RobotTableName', {
      value: this.robotTable.tableName,
      description: 'The name of the DynamoDB table for robots',      
    });
  }
}
