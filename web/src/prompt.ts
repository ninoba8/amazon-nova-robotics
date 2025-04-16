import { IoTPublisher } from "./iot";

export class ToolProcessor {
  private readonly iotPublisher = new IoTPublisher("us-east-1");

  public async processToolUse(
    toolName: string,
    toolUseContent: any
  ): Promise<any> {
    // Implement the logic for processing tool use based on the toolName and toolUseContent
    console.log(`Processing tool use: ${toolName}`);
    console.log(`Tool use content:`, toolUseContent);

    // Example logic for processing different tools
    switch (toolName) {
      case "directionTool":
        return this.processDirectionTool(toolUseContent);
      case "handTool":
        return this.processHandTool(toolUseContent);
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }

  private processDirectionTool(content: any): any {
    // Example implementation for directionTool
    console.log("Processing directionTool with content:", content);
    this.iotPublisher
      .publishToRobot("robot_1/topic", JSON.stringify(content))
      .catch(console.error);
    return { success: true, message: "Direction processed successfully" };
  }

  private processHandTool(content: any): any {
    console.log("Processing handTool with content:", content);
    this.iotPublisher
      .publishToRobot("robot_1/topic", JSON.stringify(content))
      .catch(console.error);
    return { success: true, message: "Hand movement processed successfully" };
  }
}

export const DefaultSystemPrompt =
  "You are a robot. The user and you will engage in a spoken " +
  "dialog exchanging the transcripts of a natural real-time conversation. Keep your responses short, " +
  "generally two or three sentences for chatty scenarios.";

export const DefaultToolSchema = JSON.stringify({
  type: "object",
  properties: {},
  required: [],
});

export const DirectionToolSchema = JSON.stringify({
  type: "object",
  properties: {
    direction: {
      type: "string",
      enum: ["left", "right", "straight", "back"],
      description: "The direction to go.",
    },
    steps: {
      type: "integer",
      description: "The number of steps to take in the given direction.",
    },
  },
  required: ["direction", "steps"],
});

export const HandToolSchema = JSON.stringify({
  type: "object",
  properties: {
    hand: {
      type: "string",
      enum: ["left", "right"],
      description: "The hand to move.",
    },
    movement: {
      type: "string",
      enum: ["up", "down", "left", "right"],
      description: "The movement to make.",
    },
  },
  required: ["hand", "movement"],
});

export const tools = [
  {
    toolSpec: {
      name: "directionTool",
      description:
        "Allows the robot to physically walk in a specified direction for a given number of steps.",
      inputSchema: {
        json: DirectionToolSchema,
      },
    },
  },
  {
    toolSpec: {
      name: "handTool",
      description:
        "Enables the robot to move its hand in a specified direction.",
      inputSchema: {
        json: HandToolSchema,
      },
    },
  },
];
