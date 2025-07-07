import axios from "axios";
import https from "https";

// Define MCP tool handler function type
export type McpToolHandler = (toolUseContent: any) => Promise<any>;

// MCP tool information
export interface McpToolInfo {
  handler: McpToolHandler;
  serverName: string;
  description: string;
  isAutoApproved: boolean;
  inputSchema?: any; // Add input schema for tool specification
  toolName: string; // Add actual tool name
}

/**
 * Tool handler class
 * Responsible for handling various tool calls and responses
 */
export class ToolHandler {
  // Store MCP tool information
  private mcpTools: Map<string, McpToolInfo> = new Map();

  /**
   * Process tool use
   * @param toolName Tool name
   * @param toolUseContent Tool use content
   */
  public async processToolUse(
    toolName: string,
    toolUseContent: object
  ): Promise<Object> {
    // Check if it's an MCP tool
    if (this.mcpTools.has(toolName)) {
      console.log(`Processing MCP tool call: ${toolName}`);
      const toolInfo = this.mcpTools.get(toolName);
      if (toolInfo) {
        try {
          return await toolInfo.handler(toolUseContent);
        } catch (error) {
          console.error(`MCP tool ${toolName} call failed:`, String(error));
          throw new Error(
            `MCP tool ${toolName} call failed: ${
              error instanceof Error ? error.message : String(error)
            }`
          );
        }
      }
    }

    // Handle built-in tools (weather, etc.)
    switch (toolName) {
      case "get_weather":
        return this.handleWeatherTool(toolUseContent);
      case "search_web":
        return this.handleWebSearchTool(toolUseContent);
      default:
        console.warn(`Unknown tool: ${toolName}`);
        return {
          success: false,
          error: `Unknown tool: ${toolName}`,
        };
    }
  }

  /**
   * Register MCP tool
   * @param toolName Tool name
   * @param toolInfo Tool information
   */
  public registerMcpTool(toolName: string, toolInfo: McpToolInfo): void {
    console.log(
      `Registering MCP tool: ${toolName} from server: ${toolInfo.serverName}`
    );
    this.mcpTools.set(toolName, toolInfo);
  }

  /**
   * Unregister MCP tool
   * @param toolName Tool name
   */
  public unregisterMcpTool(toolName: string): void {
    console.log(`Unregistering MCP tool: ${toolName}`);
    this.mcpTools.delete(toolName);
  }

  /**
   * Get all registered MCP tools
   */
  public getMcpTools(): Map<string, McpToolInfo> {
    return new Map(this.mcpTools);
  }

  /**
   * Check if tool is auto-approved
   * @param toolName Tool name
   */
  public isToolAutoApproved(toolName: string): boolean {
    const toolInfo = this.mcpTools.get(toolName);
    return toolInfo?.isAutoApproved ?? false;
  }

  /**
   * Handle weather tool (built-in example)
   */
  private async handleWeatherTool(toolUseContent: any): Promise<any> {
    try {
      console.log("Processing weather tool request:", toolUseContent);

      const { location } = toolUseContent;
      if (!location) {
        return {
          success: false,
          error: "Location parameter is required",
        };
      }

      // Mock weather data - in real implementation, call actual weather API
      const mockWeatherData = {
        location,
        temperature: "22°C",
        condition: "Sunny",
        humidity: "65%",
        windSpeed: "10 km/h",
      };

      return {
        success: true,
        data: mockWeatherData,
        message: `Weather information for ${location}`,
      };
    } catch (error) {
      console.error("Weather tool error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Handle web search tool (built-in example)
   */
  private async handleWebSearchTool(toolUseContent: any): Promise<any> {
    try {
      console.log("Processing web search tool request:", toolUseContent);

      const { query, maxResults = 5 } = toolUseContent;
      if (!query) {
        return {
          success: false,
          error: "Query parameter is required",
        };
      }

      // Mock search results - in real implementation, call actual search API
      const mockSearchResults = [
        {
          title: `Search result for "${query}"`,
          url: `https://example.com/search?q=${encodeURIComponent(query)}`,
          snippet: `This is a mock search result for the query: ${query}`,
        },
      ];

      return {
        success: true,
        data: {
          query,
          results: mockSearchResults.slice(0, maxResults),
          totalResults: mockSearchResults.length,
        },
        message: `Found ${mockSearchResults.length} results for "${query}"`,
      };
    } catch (error) {
      console.error("Web search tool error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Clear all MCP tools
   */
  public clearMcpTools(): void {
    console.log("Clearing all MCP tools");
    this.mcpTools.clear();
  }

  /**
   * Get tool count
   */
  public getToolCount(): number {
    return this.mcpTools.size;
  }

  /**
   * Get tools by server name
   */
  public getToolsByServer(serverName: string): Map<string, McpToolInfo> {
    const serverTools = new Map<string, McpToolInfo>();
    for (const [toolName, toolInfo] of this.mcpTools) {
      if (toolInfo.serverName === serverName) {
        serverTools.set(toolName, toolInfo);
      }
    }
    return serverTools;
  }
}
