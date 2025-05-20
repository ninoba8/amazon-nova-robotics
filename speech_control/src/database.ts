import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument} from "@aws-sdk/lib-dynamodb";

export interface RobotData {
  id: string;
  [key: string]: any;
}

export class Database {
  private dynamoClient: DynamoDB;
  private robotTable: DynamoDBDocument;
  private tableName: string;

  constructor() {
    // Initialize DynamoDB client
    this.dynamoClient = new DynamoDB({});
    this.robotTable = DynamoDBDocument.from(this.dynamoClient);
    this.tableName = process.env.ROBOT_TABLE || "ROBOT_TABLE";
  }

  /**
   * Get a robot by its ID
   */
  async getRobot(robotId: string): Promise<RobotData | null> {
    const response = await this.robotTable.get({
      TableName: this.tableName,
      Key: { id: robotId }
    });
    
    return response.Item as RobotData || null;
  }

}