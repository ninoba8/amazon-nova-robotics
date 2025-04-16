export class ToolProcessor {
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
    // if (toolUseContent && typeof toolUseContent.content === "string") {
    //     // Parse the JSON string into an object
    //     console.log(toolUseContent.content);
    //     const parsedContent = JSON.parse(toolUseContent.content);
    //     console.log(`parsedContent ${parsedContent}`);
    //     // Return the parsed content
    //     const direction = toolUseContent.direction;
    //     const steps = toolUseContent.steps;
    //     return {
    //       direction: `moved ${direction} for ${steps} steps.`,
    //     };
    //   }
    //   throw new Error("parsedContent is undefined");

    return { success: true, message: "Direction processed successfully" };
  }

  private processHandTool(content: any): any {
    // if (toolUseContent && typeof toolUseContent.content === "string") {
    //     // Parse the JSON string into an object
    //     const parsedContent = JSON.parse(toolUseContent.content);
    //     console.log(`parsedContent ${parsedContent}`);
    //     // Return the parsed content
    //     const hand = toolUseContent.hand;
    //     const movement = toolUseContent.movement;
    //     return {
    //       hand: `moved ${hand} hand to ${movement}.`,
    //     };
    //   }
    //   throw new Error("parsedContent is undefined");

    // Example implementation for handTool
    console.log("Processing handTool with content:", content);
    return { success: true, message: "Hand movement processed successfully" };
  }
}

export const DefaultSystemPrompt =
  "You are a robot. The user and you will engage in a spoken " +
  "dialog exchanging the transcripts of a natural real-time conversation. Keep your responses short, " +
  "generally two or three sentences for chatty scenarios. Use tools to handle physical tasks that require";

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
      description:
        "The direction to go, e.g. 'left', 'right', 'straight', 'back'.",
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
      description: "The direction to go, e.g. 'left', 'right'.",
    },
    movement: {
      type: "string",
      description: "The movement to make, e.g. 'up', 'down', 'wave'.",
    },
  },
  required: ["hand", "movement"],
});

export const tools = [
  {
    toolSpec: {
      name: "directionTool",
      description:
        "physically walk the direction with the number of steps to take.",
      inputSchema: {
        json: DirectionToolSchema,
      },
    },
  },
  {
    toolSpec: {
      name: "handTool",
      description: "physically move hand and movement",
      inputSchema: {
        json: HandToolSchema,
      },
    },
  },
];
