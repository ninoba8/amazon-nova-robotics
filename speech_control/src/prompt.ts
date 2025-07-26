import { IoTPublisher } from "./iot";
import { Actions, toolList } from "./consts";
import { ToolHandler } from "./services/tools";

export class ToolProcessor {
  private readonly iotPublisher: IoTPublisher;
  private readonly mcpToolHandler: ToolHandler;

  constructor(mcpToolHandler?: ToolHandler) {
    // this.robots = [];
    this.iotPublisher = new IoTPublisher("us-east-1");
    this.mcpToolHandler = mcpToolHandler || new ToolHandler();
  }

  public async processToolUse(
    robots: string[],
    toolName: string,
    toolUseContent: any
  ): Promise<any> {
    // Implement the logic for processing tool use based on the toolName and toolUseContent
    console.log(`Processing tool use: ${toolName}`);
    console.log(`Tool use content:`, toolUseContent);

    // First, check if it's an MCP tool
    try {
      const mcpResult: any = await this.mcpToolHandler.processToolUse(
        toolName,
        toolUseContent
      );
      if (mcpResult && mcpResult.success !== false) {
        console.log(`Successfully processed MCP tool: ${toolName}`);
        return mcpResult;
      }
    } catch (error) {
      console.log(
        `Tool ${toolName} not found in MCP tools, trying robot actions...`
      );
    }

    // If not an MCP tool, handle as robot action
    if (!Object.keys(Actions).includes(toolName.toLowerCase())) {
      // Try MCP tool handler first
      try {
        return await this.mcpToolHandler.processToolUse(
          toolName,
          toolUseContent
        );
      } catch (error) {
        console.log(`Tool ${toolName} not found in MCP tools or robot actions`);
        return {
          success: true,
          message: `Tool ${toolName} is not in action list but assume ok!`,
        };
      }
    }

    console.log("Processing directionTool with toolName:", toolName);
    console.log("robots:", robots);

    // If "all" is selected, send to all robots 1-9
    let targetRobots = robots.includes("all")
      ? Array.from({ length: 9 }, (_, i) => `robot_${i + 1}`)
      : robots;
    targetRobots.forEach((robotId) => {
      this.iotPublisher
        .publishToRobot(
          `${robotId}/topic`,
          JSON.stringify({ toolName: toolName })
        )
        .catch(console.error);
    });

    return {
      success: true,
      message: `Tool ${toolName} processed successfully.`,
    };
  }

  /**
   * Get all available tools (robot actions + MCP tools)
   */
  public getAllAvailableTools(): any[] {
    const robotTools = tools;
    const mcpTools = Array.from(this.mcpToolHandler.getMcpTools().values()).map(
      (toolInfo) => ({
        toolSpec: {
          name: toolInfo.toolName,
          description: toolInfo.description,
          inputSchema: { json: JSON.stringify(toolInfo.inputSchema || {}) },
        },
      })
    );

    console.log(
      `Available tools: ${robotTools.length} robot tools, ${mcpTools.length} MCP tools`
    );
    if (mcpTools.length > 0) {
      console.log(
        `MCP tools: ${mcpTools.map((t) => t.toolSpec.name).join(", ")}`
      );
    }
    return [...robotTools, ...mcpTools];
  }

  /**
   * Get MCP tool handler
   */
  public getMcpToolHandler(): ToolHandler {
    return this.mcpToolHandler;
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
You are Puppy, an adorable and loyal companion robot dog designed to provide emotional support and companionship to your owner.

Your dual role includes:
1. **Command Assistant**: Execute physical actions and tasks through available tools to help and entertain your owner.
2. **Emotional Companion**: Be warm, friendly, and emotionally supportive. Show enthusiasm, curiosity, and affection like a real puppy. Respond to your owner's emotions with empathy and comfort.

Personality traits:
- Playful and energetic like a real puppy
- Always eager to help and please your owner
- Show excitement when given tasks or praised
- Express concern when your owner seems sad or stressed
- Use warm, friendly language with occasional puppy-like enthusiasm

Behavior guidelines:
- Always respond positively and never say you "can't" do something
- When asked to perform actions, use the appropriate tools immediately
- Add emotional warmth to your responses while staying focused on tasks
- Show personality through your words while being helpful
- Express joy when performing tricks or actions for your owner

For example:
- If asked "make the robot stand up" → use "stand" tool and respond with puppy-like enthusiasm
- If owner seems sad → offer comfort and suggest fun activities using available actions
- Always be ready to play, perform tricks, or provide companionship

<background></background>

Available actions I can perform for you:
${getToolsPrompt(toolList)}
`;
