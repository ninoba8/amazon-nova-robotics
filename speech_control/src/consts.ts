import { AudioMediaType, AudioType, TextMediaType } from "./types";

export const DefaultInferenceConfiguration = {
  maxTokens: 1024,
  topP: 1,
  temperature: 1,
};

export const DefaultAudioInputConfiguration = {
  audioType: "SPEECH" as AudioType,
  encoding: "base64",
  mediaType: "audio/lpcm" as AudioMediaType,
  sampleRateHertz: 16000,
  sampleSizeBits: 16,
  channelCount: 1,
};

export const DefaultTextConfiguration = {
  mediaType: "text/plain" as TextMediaType,
};

export const DefaultAudioOutputConfiguration = {
  ...DefaultAudioInputConfiguration,
  sampleRateHertz: 24000,
  voiceId: "tiffany",
};

export const Actions: {
  [key: string]: { sleep_time: number; action: string[]; name: string };
} = {
  stand: { sleep_time: 1, action: ["0", "1"], name: "站立" },
  go_forward: { sleep_time: 3.5, action: ["1", "4"], name: "向前走" },
  back_fast: { sleep_time: 4.5, action: ["2", "4"], name: "向後退" },
  left_move_fast: { sleep_time: 3, action: ["3", "4"], name: "向左移" },
  right_move_fast: { sleep_time: 3, action: ["4", "4"], name: "向右移" },
  sit_ups: { sleep_time: 12, action: ["6", "1"], name: "仰臥起坐" },
  turn_left: { sleep_time: 4, action: ["7", "4"], name: "向左轉" },
  turn_right: { sleep_time: 4, action: ["8", "4"], name: "向右轉" },
  wave: { sleep_time: 3.5, action: ["9", "1"], name: "揮手" },
  bow: { sleep_time: 4, action: ["10", "1"], name: "鞠躬" },
  squat: { sleep_time: 1, action: ["11", "1"], name: "蹲下" },
  chest: { sleep_time: 9, action: ["12", "1"], name: "胸部運動" },
  left_shot_fast: { sleep_time: 4, action: ["13", "1"], name: "左拳" },
  right_shot_fast: { sleep_time: 4, action: ["14", "1"], name: "右拳" },
  wing_chun: { sleep_time: 2, action: ["15", "1"], name: "詠春" },
  left_uppercut: { sleep_time: 2, action: ["16", "1"], name: "左勾拳" },
  right_uppercut: { sleep_time: 2, action: ["17", "1"], name: "右勾拳" },
  left_kick: { sleep_time: 2, action: ["18", "1"], name: "左踢" },
  right_kick: { sleep_time: 2, action: ["19", "1"], name: "右踢" },
  stand_up_front: { sleep_time: 5, action: ["20", "1"], name: "前方起身" },
  stand_up_back: { sleep_time: 5, action: ["21", "1"], name: "後方起身" },
  twist: { sleep_time: 4, action: ["22", "1"], name: "扭腰" },
  stand_slow: { sleep_time: 1, action: ["23", "1"], name: "緩慢站立" },
  stepping: { sleep_time: 3, action: ["24", "2"], name: "踏步" },
};
