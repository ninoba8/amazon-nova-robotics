import fs from "fs";
import path from "path";
import { McpConfig } from "../types";

export class McpConfigLoader {
  private static CONFIG_PATHS = [
    // Project configuration path
    path.join(process.cwd(), "mcp_config.json"),
    // Backend root path configuration
    path.join(__dirname, "../../mcp_config.json"),
    // Environment variable specified configuration path
    process.env.MCP_CONFIG_PATH,
  ];

  /**
   * Load MCP configuration
   */
  static loadConfig(): McpConfig {
    // Default empty configuration
    const defaultConfig: McpConfig = {
      mcpServers: {},
    };

    // Try to load configuration from various possible paths
    for (const configPath of this.CONFIG_PATHS) {
      if (configPath && fs.existsSync(configPath)) {
        try {
          const configContent = fs.readFileSync(configPath, "utf-8");
          const config = JSON.parse(configContent) as McpConfig;
          console.log(`Loaded MCP configuration from ${configPath}`);
          return config;
        } catch (error) {
          console.error(
            `Failed to load MCP configuration file ${configPath}: ${error}`
          );
        }
      }
    }

    console.log(
      "No MCP configuration file found, using default empty configuration"
    );
    return defaultConfig;
  }

  /**
   * Save MCP configuration
   */
  static saveConfig(config: McpConfig, configPath?: string): boolean {
    const savePath = configPath || this.CONFIG_PATHS[0];

    if (!savePath) {
      console.error("No configuration save path specified");
      return false;
    }

    try {
      // Ensure directory exists
      const dir = path.dirname(savePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Write configuration file
      fs.writeFileSync(savePath, JSON.stringify(config, null, 2), "utf-8");
      console.log(`MCP configuration saved to ${savePath}`);
      return true;
    } catch (error) {
      console.error(`Failed to save MCP configuration: ${error}`);
      return false;
    }
  }

  /**
   * Merge configurations
   */
  static mergeConfigs(
    baseConfig: McpConfig,
    overrideConfig: Partial<McpConfig>
  ): McpConfig {
    return {
      mcpServers: {
        ...baseConfig.mcpServers,
        ...overrideConfig.mcpServers,
      },
    };
  }
}
