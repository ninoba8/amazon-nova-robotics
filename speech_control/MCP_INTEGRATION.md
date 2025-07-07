# MCP Integration in Speech Control WebApp

## Overview

The speech_control webapp has been enhanced with Model Context Protocol (MCP) capabilities, based on the implementation from the sample-nova-sonic-mcp project. This integration allows the speech control system to connect to external MCP servers and use their tools for extended functionality.

## Features Added

### 1. MCP Server Management

- **McpManager**: Manages connections to multiple MCP servers
- **McpConfigLoader**: Loads and manages MCP server configurations
- **ToolHandler**: Handles tool execution for both MCP tools and existing robot actions

### 2. Enhanced Tool System

- Seamless integration between existing robot tools and MCP tools
- Automatic tool registration from connected MCP servers
- Support for different transport types (stdio, streamable HTTP)

### 3. Configuration Support

- JSON-based MCP server configuration
- Auto-approval settings for specific tools
- Environment variable support
- Server disable/enable functionality

### 4. API Endpoints

- `/api/mcp/status` - Get MCP server status and available tools
- `/api/mcp/reload` - Reload MCP configuration
- `/api/tools` - List all available tools (robot + MCP)

## Configuration

### MCP Configuration File (`mcp_config.json`)

```json
{
  "mcpServers": {
    "github.com/executeautomation/mcp-playwright": {
      "disabled": false,
      "command": "npx",
      "args": ["-y", "@executeautomation/playwright-mcp-server"]
    },
    "github.com/modelcontextprotocol/servers/tree/main/src/filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/workspaces/amazon-nova-robotics"
      ],
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

### Configuration Options

- **command**: The command to run the MCP server
- **args**: Arguments for the command
- **disabled**: Whether to skip this server during initialization
- **autoApprove**: List of tool names that don't require user approval
- **env**: Environment variables for the server process
- **transportType**: Transport protocol ("stdio", "sse", "streamable_http")
- **baseUrl**: Base URL for HTTP transport
- **headers**: HTTP headers for HTTP transport

## Architecture

### Key Components

1. **ToolHandler** (`src/services/tools.ts`)

   - Manages both MCP tools and built-in tools
   - Provides unified interface for tool execution
   - Handles tool registration and deregistration

2. **McpManager** (`src/services/mcp-manager.ts`)

   - Manages connections to MCP servers
   - Handles server lifecycle (connect, disconnect, reload)
   - Provides server status and tool information

3. **McpConfigLoader** (`src/services/mcp-config.ts`)

   - Loads configuration from various sources
   - Supports configuration merging and saving
   - Handles environment variable overrides

4. **Enhanced ToolProcessor** (`src/prompt.ts`)
   - Updated to work with both robot actions and MCP tools
   - Provides fallback mechanism for unknown tools
   - Integrates with the ToolHandler

### Integration Points

1. **Client Integration**

   - NovaSonicBidirectionalStreamClient accepts ToolHandler in configuration
   - ToolProcessor uses ToolHandler for MCP tool execution

2. **Server Integration**
   - MCP services are initialized on server startup
   - Graceful shutdown handles MCP server disconnection
   - CORS configuration allows cross-origin requests

## Usage

### Starting the Server

The MCP servers are automatically initialized when the speech control server starts:

```bash
npm run dev
```

### Checking MCP Status

```bash
curl http://localhost:3000/api/mcp/status
```

### Reloading Configuration

```bash
curl -X POST http://localhost:3000/api/mcp/reload
```

## Dependencies Added

- `@modelcontextprotocol/sdk`: MCP SDK for client connections
- `cors`: CORS support for API endpoints

## Error Handling

- Graceful degradation when MCP servers are unavailable
- Automatic cleanup of resources on server shutdown
- Fallback to built-in tools when MCP tools fail
- Comprehensive error logging

## Supported Transport Types

1. **STDIO**: Direct process communication
2. **Streamable HTTP**: HTTP-based communication for cloud services
3. **SSE**: Server-Sent Events (implemented but not actively used)

## Future Enhancements

- Real-time MCP server health monitoring
- Dynamic server addition/removal via API
- Tool-specific permission management
- Enhanced logging and debugging capabilities
- WebSocket notifications for MCP events
