export type ContentType = "AUDIO" | "TEXT" | "TOOL";
export type AudioType = "SPEECH";
export type AudioMediaType = "audio/lpcm";
export type TextMediaType = "text/plain" | "application/json";

export interface InferenceConfig {
  readonly maxTokens: number;
  readonly topP: number;
  readonly temperature: number;
}

export interface AudioConfiguration {
  readonly audioType: AudioType;
  readonly mediaType: AudioMediaType;
  readonly sampleRateHertz: number;
  readonly sampleSizeBits: number;
  readonly channelCount: number;
  readonly encoding: string;
  readonly voiceId?: string;
}

export interface TextConfiguration {
  readonly mediaType: TextMediaType;
}

export interface ToolConfiguration {
  readonly toolUseId: string;
  readonly type: "TEXT";
  readonly textInputConfiguration: {
    readonly mediaType: "text/plain";
  };
}

// MCP server configuration interface
export interface McpServerConfig {
  command: string;
  args: string[];
  env?: Record<string, string>;
  autoApprove?: string[];
  disabled?: boolean;
  transportType?: "stdio" | "sse" | "streamable_http";
  sseUrl?: string; // for SSE transport type
  baseUrl?: string; // for streamable http transport type
  headers?: Record<string, string>; // for streamable http transport type
  token?: string; // for authentication
}

// MCP configuration file interface
export interface McpConfig {
  mcpServers: Record<string, McpServerConfig>;
}

// MCP tool interface
export interface McpTool {
  name: string;
  description?: string;
  inputSchema: any;
  serverName: string; // server name for identifying during calls
}
