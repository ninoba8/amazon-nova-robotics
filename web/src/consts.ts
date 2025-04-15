import { AudioType, AudioMediaType, TextMediaType } from "./types";

export const DefaultInferenceConfiguration = {
  maxTokens: 1024,
  topP: 0.9,
  temperature: 0.7,
};

export const DefaultAudioInputConfiguration = {
  audioType: "SPEECH" as AudioType,
  encoding: "base64",
  mediaType: "audio/lpcm" as AudioMediaType,
  sampleRateHertz: 16000,
  sampleSizeBits: 16,
  channelCount: 1,
};

export const DefaultToolSchema = JSON.stringify({
  "type": "object",
  "properties": {},
  "required": []
});


export const DirectionToolSchema = JSON.stringify({
  "type": "object",
  "properties": {
    "direction": {
      "type": "string",
      "description": "The direction to go, e.g. 'left', 'right', 'straight', 'back'."
    },
    "steps": {
      "type": "integer",
      "description": "The number of steps to take in the given direction."    
    }
  },
  "required": ["direction", "steps"]
});

export const HandToolSchema = JSON.stringify({
  "type": "object",
  "properties": {
    "hand": {
      "type": "string",
      "description": "The direction to go, e.g. 'left', 'right'."
    },
    "movement": {
      "type": "string",
      "description": "The movement to make, e.g. 'up', 'down', 'wave'."    
    }
  },
  "required": ["hand", "movement"]
});



export const DefaultTextConfiguration = { mediaType: "text/plain" as TextMediaType };

export const DefaultSystemPrompt = "You are a robot. The user and you will engage in a spoken " +
  "dialog exchanging the transcripts of a natural real-time conversation. Keep your responses short, " +
  "generally two or three sentences for chatty scenarios. Use tools to handle physical tasks that require";

export const DefaultAudioOutputConfiguration = {
  ...DefaultAudioInputConfiguration,
  sampleRateHertz: 24000,
  voiceId: "tiffany",
};
