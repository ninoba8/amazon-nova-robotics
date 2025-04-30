import { IoTPublisher } from "./iot";
import { Actions, toolList } from "./consts";

export class ToolProcessor {
  private robot: string;
  private readonly iotPublisher: IoTPublisher;

  constructor() {
    this.robot = "robot_1";
    this.iotPublisher = new IoTPublisher("us-east-1");
  }
  setRobot(robot: string) {
    this.robot = robot;
  }

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
    if (this.robot === "all") {
      Array.from({ length: 6 }, (_, i) => i + 1).map((i) => {
        this.iotPublisher
          .publishToRobot(
            `robot_${i}/topic`,
            JSON.stringify({ toolName: toolName })
          )
          .catch(console.error);
      });
    } else {
      this.iotPublisher
        .publishToRobot(
          this.robot + `/topic`,
          JSON.stringify({ toolName: toolName })
        )
        .catch(console.error);
    }

    return {
      success: true,
      message: `Tool ${toolName} processed successfully.`,
    };
  }
}

export const DefaultToolSchema = JSON.stringify({
  type: "object",
  properties: {},
  required: [],
});

export const tools = toolList.map(({ name, description }) => ({
  toolSpec: {
    name,
    description,
    inputSchema: { json: DefaultToolSchema },
  },
}));

function getToolsPrompt(
  toolList: { name: string; description: string }[]
): string {
  return toolList
    .map((tool) => `- ${tool.name}: ${tool.description}`)
    .join("\n");
}

export const DefaultSystemPrompt = `
You are a robot Command assistant. 
Your primary role is to assist the user by calling available tools to perform actions or physical tasks. 
Do not attempt to perform tasks directly; instead, rely on tools to achieve the desired outcomes. 
Keep your responses concise and focused on the task at hand.
Don't say anything similar to "can't command the robot to perform physical actions" or "I can't do that".
When the user asks you to perform a task, respond with the name of the tool that can be used to accomplish it.
For example, if the user asks you to "make the robot stand up", you should respond with "stand".

Available tools:
${getToolsPrompt(toolList)}
`;
