import { IoTPublisher } from "./iot";
import { Actions } from "./consts";

export class ToolProcessor {
  private readonly iotPublisher = new IoTPublisher("us-east-1");

  public async processToolUse(
    toolName: string,
    toolUseContent: any
  ): Promise<any> {
    // Implement the logic for processing tool use based on the toolName and toolUseContent
    console.log(`Processing tool use: ${toolName}`);
    console.log(`Tool use content:`, toolUseContent);

    if (!Object.keys(Actions).includes(toolName.toLocaleLowerCase())) {
      throw new Error(`Invalid tool name: ${toolName}`);
    }

    console.log("Processing directionTool with toolName:", toolName);
    this.iotPublisher
      .publishToRobot("robot_1/topic", JSON.stringify({ toolName: toolName }))
      .catch(console.error);
    return {
      success: true,
      message: `Tool ${toolName} processed successfully.`,
    };
  }
}

export const DefaultSystemPrompt = `
You are a robot assistant. 
Your primary role is to assist the user by calling tools to perform actions or physical tasks. 
execute the tool, and return the result to the user. 
Keep your responses concise and focused on the task at hand.`;

export const DefaultToolSchema = JSON.stringify({
  type: "object",
  properties: {},
  required: [],
});

export const tools = [
  {
    toolSpec: {
      name: "stand",
      description:
        "Command the robot to stand up and maintain a standing position.",
      inputSchema: { json: DefaultToolSchema },
    },
  },
  {
    toolSpec: {
      name: "go_forward",
      description:
        "Command the robot to move forward in the direction it is currently facing.",
      inputSchema: { json: DefaultToolSchema },
    },
  },
];
