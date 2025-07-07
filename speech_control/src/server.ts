import express from "express";
import http from "http";
import path from "path";
import { Server } from "socket.io";
import { fromContainerMetadata, fromIni } from "@aws-sdk/credential-providers";
import cors from "cors";
import { NovaSonicBidirectionalStreamClient } from "./client";
import { Buffer } from "node:buffer";
import getUuid from "uuid-by-string";
import { ToolHandler } from "./services/tools";
import { McpManager } from "./services/mcp-manager";
import { ToolProcessor } from "./prompt";
import { Actions } from "./consts";

// Configure AWS credentials
const AWS_PROFILE_NAME = process.env.AWS_PROFILE || "default";
const isInCloud = process.env.IsInCloud || false;

// Create Express app and HTTP server
const app = express();

// Enable CORS with specific options
const corsOptions = {
  origin: "http://localhost:3001",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "Access-Control-Allow-Origin",
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Methods",
    "Access-Control-Allow-Credentials",
  ],
  exposedHeaders: ["Access-Control-Allow-Origin"],
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

// Handle OPTIONS preflight requests
app.options("*", cors(corsOptions));
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3001",
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
  },
  allowEIO3: true,
  transports: ["websocket", "polling"],
});

// Create ToolHandler
const toolHandler = new ToolHandler();

// Create MCP manager
const mcpManager = new McpManager(toolHandler);

// Track MCP initialization status
let mcpInitialized = false;

// Initialize MCP servers asynchronously
(async () => {
  try {
    console.log("Initializing MCP servers...");
    await mcpManager.initializeServers();
    mcpInitialized = true;
    console.log("MCP servers initialization complete");
  } catch (error) {
    console.error("Failed to initialize MCP servers:", error);
    mcpInitialized = true; // Set to true even on error to prevent blocking
  }
})();

// Create the AWS Bedrock client
const bedrockClient = new NovaSonicBidirectionalStreamClient({
  requestHandlerConfig: {
    maxConcurrentStreams: 10,
  },
  clientConfig: {
    region: process.env.AWS_BEDROCK_REGION || "us-east-1",
    credentials: isInCloud
      ? fromContainerMetadata()
      : fromIni({ profile: AWS_PROFILE_NAME }),
  },
  toolHandler: toolHandler, // Pass the toolHandler to the client
});

// Periodically check for and close inactive sessions (every minute)
// Sessions with no activity for over 5 minutes will be force closed
setInterval(() => {
  console.log("Session cleanup check");
  const now = Date.now();

  // Check all active sessions
  bedrockClient.getActiveSessions().forEach((sessionId) => {
    const lastActivity = bedrockClient.getLastActivityTime(sessionId);

    // If no activity for 5 minutes, force close
    if (now - lastActivity > 5 * 60 * 1000) {
      console.log(
        `Closing inactive session ${sessionId} after 5 minutes of inactivity`
      );
      try {
        bedrockClient.forceCloseSession(sessionId);
      } catch (error) {
        console.error(
          `Error force closing inactive session ${sessionId}:`,
          error
        );
      }
    }
  });
}, 60000);

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "../public")));

// Socket.IO connection handler
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Create a unique session ID for this client
  const sessionId = getUuid(socket.id);

  try {
    // Check if MCP is initialized before creating session
    if (!mcpInitialized) {
      console.warn(
        `Creating session ${sessionId} before MCP initialization is complete. MCP tools may not be available initially.`
      );
    }

    // Create session with the new API
    const session = bedrockClient.createStreamSession(sessionId, {
      clientConfig: { region: process.env.AWS_BEDROCK_REGION || "us-east-1" },
    });
    bedrockClient.initiateSession(sessionId);

    setInterval(() => {
      const connectionCount = Object.keys(io.sockets.sockets).length;
      console.log(`Active socket connections: ${connectionCount}`);
    }, 60000);

    // Set up event handlers
    session.onEvent("contentStart", (data) => {
      console.log("contentStart:", data);
      socket.emit("contentStart", data);
    });

    session.onEvent("textOutput", (data) => {
      console.log("Text output:", data);
      socket.emit("textOutput", data);
    });

    session.onEvent("audioOutput", (data) => {
      // console.log("Audio output received, sending to client");
      socket.emit("audioOutput", data);
    });

    session.onEvent("error", (data) => {
      console.error("Error in session:", data);
      socket.emit("error", data);
    });

    session.onEvent("toolUse", (data) => {
      console.log("Tool use detected:", data.toolName);
      socket.emit("toolUse", data);
    });

    session.onEvent("toolResult", (data) => {
      console.log("Tool result received");
      socket.emit("toolResult", data);
    });

    session.onEvent("contentEnd", (data) => {
      console.log("Content end received: ", data);
      socket.emit("contentEnd", data);
    });

    session.onEvent("streamComplete", () => {
      console.log("Stream completed for client:", socket.id);
      socket.emit("streamComplete");
    });

    // Simplified audioInput handler without rate limiting
    socket.on("audioInput", async (audioData) => {
      try {
        // Convert base64 string to Buffer
        const audioBuffer =
          typeof audioData === "string"
            ? Buffer.from(audioData, "base64")
            : Buffer.from(audioData);

        // Stream the audio
        await session.streamAudio(audioBuffer);
      } catch (error) {
        console.error("Error processing audio:", error);
        socket.emit("error", {
          message: "Error processing audio",
          details: error instanceof Error ? error.message : String(error),
        });
      }
    });

    socket.on("promptStart", async () => {
      try {
        console.log("Prompt start received");
        await session.setupPromptStart();
      } catch (error) {
        console.error("Error processing prompt start:", error);
        socket.emit("error", {
          message: "Error processing prompt start",
          details: error instanceof Error ? error.message : String(error),
        });
      }
    });

    socket.on("systemPrompt", async (data) => {
      try {
        console.log("System prompt received");
        await session.setupSystemPrompt(undefined, undefined);
      } catch (error) {
        console.error("Error processing system prompt:", error);
        socket.emit("error", {
          message: "Error processing system prompt",
          details: error instanceof Error ? error.message : String(error),
        });
      }
    });

    socket.on("robot", async (data) => {
      // Accept either a string or array from the client
      let robots = Array.isArray(data) ? data : [data];
      console.log("robot(s) received:", robots);
      session.setupRobot(robots);
      socket.emit("robot received", robots);
    });

    socket.on("audioStart", async (data) => {
      try {
        console.log("Audio start received", data);
        await session.setupStartAudio();
      } catch (error) {
        console.error("Error processing audio start:", error);
        socket.emit("error", {
          message: "Error processing audio start",
          details: error instanceof Error ? error.message : String(error),
        });
      }
    });

    socket.on("stopAudio", async () => {
      try {
        console.log("Stop audio requested, beginning proper shutdown sequence");

        // Chain the closing sequence
        await Promise.all([
          session
            .endAudioContent()
            .then(() => session.endPrompt())
            .then(() => session.close())
            .then(() => console.log("Session cleanup complete")),
        ]);
      } catch (error) {
        console.error("Error processing streaming end events:", error);
        socket.emit("error", {
          message: "Error processing streaming end events",
          details: error instanceof Error ? error.message : String(error),
        });
      }
    });

    // Handle disconnection
    socket.on("disconnect", async () => {
      console.log("Client disconnected abruptly:", socket.id);

      if (bedrockClient.isSessionActive(sessionId)) {
        try {
          console.log(
            `Beginning cleanup for abruptly disconnected session: ${socket.id}`
          );

          // Add explicit timeouts to avoid hanging promises
          const cleanupPromise = Promise.race([
            (async () => {
              await session.endAudioContent();
              await session.endPrompt();
              await session.close();
            })(),
            new Promise((_, reject) =>
              setTimeout(
                () => reject(new Error("Session cleanup timeout")),
                3000
              )
            ),
          ]);

          await cleanupPromise;
          console.log(
            `Successfully cleaned up session after abrupt disconnect: ${socket.id}`
          );
        } catch (error) {
          console.error(
            `Error cleaning up session after disconnect: ${socket.id}`,
            error
          );
          try {
            bedrockClient.forceCloseSession(sessionId);
            console.log(`Force closed session: ${sessionId}`);
          } catch (e) {
            console.error(
              `Failed even force close for session: ${sessionId}`,
              e
            );
          }
        } finally {
          // Make sure socket is fully closed in all cases
          if (socket.connected) {
            socket.disconnect(true);
          }
        }
      }
    });
  } catch (error) {
    console.error("Error creating session:", error);
    socket.emit("error", {
      message: "Failed to initialize session",
      details: error instanceof Error ? error.message : String(error),
    });
    socket.disconnect();
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// MCP management endpoints
app.get("/api/mcp/status", (req, res) => {
  try {
    const status = mcpManager.getServerStatus();
    const connectedServers = mcpManager.getConnectedServers();
    const tools = mcpManager.getAllTools();

    res.json({
      status: "ok",
      connectedServers,
      serverStatus: status,
      toolCount: tools.length,
      tools: tools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        serverName: tool.serverName,
      })),
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

app.post("/api/mcp/reload", async (req, res) => {
  try {
    await mcpManager.reloadConfiguration();
    res.json({
      status: "ok",
      message: "MCP configuration reloaded successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

app.get("/api/tools", (req, res) => {
  try {
    const mcpTools = Array.from(toolHandler.getMcpTools().values());
    res.json({
      status: "ok",
      tools: mcpTools.map((tool) => ({
        name: tool.serverName,
        description: tool.description,
        serverName: tool.serverName,
        isAutoApproved: tool.isAutoApproved,
      })),
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

// Debug endpoint to check available tools for AI model
app.get("/api/debug/tools", (req, res) => {
  try {
    // Create a temporary tool processor to get available tools
    const tempToolProcessor = new ToolProcessor(toolHandler);
    const allTools = tempToolProcessor.getAllAvailableTools();

    res.json({
      status: "ok",
      totalTools: allTools.length,
      robotTools: allTools.filter((t: any) => !t.toolSpec.name.includes("/"))
        .length,
      mcpTools: allTools.filter(
        (t: any) =>
          t.toolSpec.name.includes("/") ||
          !Object.keys(Actions).includes(t.toolSpec.name.toLowerCase())
      ).length,
      tools: allTools.map((tool: any) => ({
        name: tool.toolSpec.name,
        description: tool.toolSpec.description,
        hasInputSchema: !!tool.toolSpec.inputSchema,
        type: Object.keys(Actions).includes(tool.toolSpec.name.toLowerCase())
          ? "robot"
          : "mcp",
      })),
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(
    `Open http://localhost:${PORT} in your browser to access the application`
  );
});

process.on("SIGINT", async () => {
  console.log("Shutting down server...");

  const forceExitTimer = setTimeout(() => {
    console.error("Forcing server shutdown after timeout");
    process.exit(1);
  }, 10000); // Increased timeout for MCP cleanup

  try {
    // First disconnect from all MCP servers
    console.log("Disconnecting from MCP servers...");
    await mcpManager.disconnectFromAllServers();
    console.log("MCP servers disconnected");

    // Then close Socket.IO server which manages WebSocket connections
    await new Promise((resolve) => io.close(resolve));
    console.log("Socket.IO server closed");

    // Then close all active sessions
    const activeSessions = bedrockClient.getActiveSessions();
    console.log(`Closing ${activeSessions.length} active sessions...`);

    await Promise.all(
      activeSessions.map(async (sessionId) => {
        try {
          await bedrockClient.closeSession(sessionId);
          console.log(`Closed session ${sessionId} during shutdown`);
        } catch (error) {
          console.error(
            `Error closing session ${sessionId} during shutdown:`,
            error
          );
          bedrockClient.forceCloseSession(sessionId);
        }
      })
    );

    // Now close the HTTP server with a promise
    await new Promise((resolve) => server.close(resolve));
    clearTimeout(forceExitTimer);
    console.log("Server shut down");
    process.exit(0);
  } catch (error) {
    console.error("Error during server shutdown:", error);
    process.exit(1);
  }
});
