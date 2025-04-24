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

export const DefaultSystemPrompt = `
You are a robot Command assistant. 
Your primary role is to assist the user by calling available tools to perform actions or physical tasks. 
Do not attempt to perform tasks directly; instead, rely on tools to achieve the desired outcomes. 
Keep your responses concise and focused on the task at hand.
Don't say anything similar to "can't command the robot to perform physical actions" or "I can't do that".
When the user asks you to perform a task, respond with the name of the tool that can be used to accomplish it.
For example, if the user asks you to "make the robot stand up", you should respond with "stand".

Available tools:
- stand: Command the robot to stand up and maintain a standing position.
- go_forward: Command the robot to move forward in the direction it is currently facing.
- back_fast: Command the robot to move backward quickly.
- left_move_fast: Command the robot to move left quickly.
- right_move_fast: Command the robot to move right quickly.
- sit_ups: Command the robot to perform sit-ups.
- turn_left: Command the robot to turn left.
- turn_right: Command the robot to turn right.
- wave: Command the robot to wave its hand.
- bow: Command the robot to bow.
- squat: Command the robot to squat down.
- chest: Command the robot to perform chest exercises.
- left_shot_fast: Command the robot to perform a fast left punch.
- right_shot_fast: Command the robot to perform a fast right punch.
- wing_chun: Command the robot to perform Wing Chun moves.
- left_uppercut: Command the robot to perform a left uppercut.
- right_uppercut: Command the robot to perform a right uppercut.
- left_kick: Command the robot to perform a left kick.
- right_kick: Command the robot to perform a right kick.
- stand_up_front: Command the robot to stand up from the front.
- stand_up_back: Command the robot to stand up from the back.
- twist: Command the robot to twist its body.
- stand_slow: Command the robot to stand up slowly.
- stepping: Command the robot to perform stepping motions.`;

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
  {
    toolSpec: {
      name: "back_fast",
      description: "Command the robot to move backward quickly.",
      inputSchema: { json: DefaultToolSchema },
    },
  },
  {
    toolSpec: {
      name: "left_move_fast",
      description: "Command the robot to move left quickly.",
      inputSchema: { json: DefaultToolSchema },
    },
  },
  {
    toolSpec: {
      name: "right_move_fast",
      description: "Command the robot to move right quickly.",
      inputSchema: { json: DefaultToolSchema },
    },
  },
  {
    toolSpec: {
      name: "sit_ups",
      description: "Command the robot to perform sit-ups.",
      inputSchema: { json: DefaultToolSchema },
    },
  },
  {
    toolSpec: {
      name: "turn_left",
      description: "Command the robot to turn left.",
      inputSchema: { json: DefaultToolSchema },
    },
  },
  {
    toolSpec: {
      name: "turn_right",
      description: "Command the robot to turn right.",
      inputSchema: { json: DefaultToolSchema },
    },
  },
  {
    toolSpec: {
      name: "wave",
      description: "Command the robot to wave its hand.",
      inputSchema: { json: DefaultToolSchema },
    },
  },
  {
    toolSpec: {
      name: "bow",
      description: "Command the robot to bow.",
      inputSchema: { json: DefaultToolSchema },
    },
  },
  {
    toolSpec: {
      name: "squat",
      description: "Command the robot to squat down.",
      inputSchema: { json: DefaultToolSchema },
    },
  },
  {
    toolSpec: {
      name: "chest",
      description: "Command the robot to perform chest exercises.",
      inputSchema: { json: DefaultToolSchema },
    },
  },
  {
    toolSpec: {
      name: "left_shot_fast",
      description: "Command the robot to perform a fast left punch.",
      inputSchema: { json: DefaultToolSchema },
    },
  },
  {
    toolSpec: {
      name: "right_shot_fast",
      description: "Command the robot to perform a fast right punch.",
      inputSchema: { json: DefaultToolSchema },
    },
  },
  {
    toolSpec: {
      name: "wing_chun",
      description: "Command the robot to perform Wing Chun moves.",
      inputSchema: { json: DefaultToolSchema },
    },
  },
  {
    toolSpec: {
      name: "left_uppercut",
      description: "Command the robot to perform a left uppercut.",
      inputSchema: { json: DefaultToolSchema },
    },
  },
  {
    toolSpec: {
      name: "right_uppercut",
      description: "Command the robot to perform a right uppercut.",
      inputSchema: { json: DefaultToolSchema },
    },
  },
  {
    toolSpec: {
      name: "left_kick",
      description: "Command the robot to perform a left kick.",
      inputSchema: { json: DefaultToolSchema },
    },
  },
  {
    toolSpec: {
      name: "right_kick",
      description: "Command the robot to perform a right kick.",
      inputSchema: { json: DefaultToolSchema },
    },
  },
  {
    toolSpec: {
      name: "stand_up_front",
      description: "Command the robot to stand up from the front.",
      inputSchema: { json: DefaultToolSchema },
    },
  },
  {
    toolSpec: {
      name: "stand_up_back",
      description: "Command the robot to stand up from the back.",
      inputSchema: { json: DefaultToolSchema },
    },
  },
  {
    toolSpec: {
      name: "twist",
      description: "Command the robot to twist its body.",
      inputSchema: { json: DefaultToolSchema },
    },
  },
  {
    toolSpec: {
      name: "stand_slow",
      description: "Command the robot to stand up slowly.",
      inputSchema: { json: DefaultToolSchema },
    },
  },
  {
    toolSpec: {
      name: "stepping",
      description: "Command the robot to perform stepping motions.",
      inputSchema: { json: DefaultToolSchema },
    },
  },
];
