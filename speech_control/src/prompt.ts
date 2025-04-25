import { IoTPublisher } from "./iot";
import { Actions } from "./consts";

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

const toolList = [
  {
    name: "stand",
    description:
      "Command the robot to stand up and maintain a standing position.",
  },
  {
    name: "go_forward",
    description:
      "Command the robot to move forward in the direction it is currently facing.",
  },
  {
    name: "back_fast",
    description: "Command the robot to move backward quickly.",
  },
  {
    name: "left_move_fast",
    description: "Command the robot to move left quickly.",
  },
  {
    name: "right_move_fast",
    description: "Command the robot to move right quickly.",
  },
  { name: "sit_ups", description: "Command the robot to perform sit-ups." },
  { name: "turn_left", description: "Command the robot to turn left." },
  { name: "turn_right", description: "Command the robot to turn right." },
  { name: "wave", description: "Command the robot to wave its hand." },
  { name: "bow", description: "Command the robot to bow." },
  { name: "squat", description: "Command the robot to squat down." },
  {
    name: "chest",
    description: "Command the robot to perform chest exercises.",
  },
  {
    name: "left_shot_fast",
    description: "Command the robot to perform a fast left punch.",
  },
  {
    name: "right_shot_fast",
    description: "Command the robot to perform a fast right punch.",
  },
  {
    name: "wing_chun",
    description: "Command the robot to perform Wing Chun moves.",
  },
  {
    name: "left_uppercut",
    description: "Command the robot to perform a left uppercut.",
  },
  {
    name: "right_uppercut",
    description: "Command the robot to perform a right uppercut.",
  },
  {
    name: "left_kick",
    description: "Command the robot to perform a left kick.",
  },
  {
    name: "right_kick",
    description: "Command the robot to perform a right kick.",
  },
  {
    name: "stand_up_front",
    description: "Command the robot to stand up from the front.",
  },
  {
    name: "stand_up_back",
    description: "Command the robot to stand up from the back.",
  },
  { name: "twist", description: "Command the robot to twist its body." },
  { name: "stand_slow", description: "Command the robot to stand up slowly." },
  {
    name: "stepping",
    description: "Command the robot to perform stepping motions.",
  },
  { name: "stop", description: "Command the robot to stop all actions." },
];

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
