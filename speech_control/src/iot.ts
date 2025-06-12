import {
  IoTDataPlaneClient,
  PublishCommand,
} from "@aws-sdk/client-iot-data-plane";

export class IoTPublisher {
  private client: IoTDataPlaneClient;

  constructor(region: string) {
    this.client = new IoTDataPlaneClient({ region });
  }

  public async publishToRobot(topic: string, message: string): Promise<void> {
    try {
      const command = new PublishCommand({
        topic,
        payload: Buffer.from(message),
        qos: 1,
      });
      await this.client.send(command);
      console.log(
        `Message published to topic: ${topic} with message: ${message}`
      );
    } catch (error) {
      console.error(`Failed to publish message: ${error}`);
      throw error;
    }
  }
}

// Example usage
// const publisher = new IoTPublisher("us-east-1");
// publisher.publishToRobot("robot_1/topic",JSON.stringify({message:"hello"})).catch(console.error);
