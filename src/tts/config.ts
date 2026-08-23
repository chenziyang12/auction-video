export const ttsConfig = {
  voice: process.env.TTS_VOICE ?? 'zh-CN-YunyangNeural',
  rate: process.env.TTS_RATE ?? '+5%',
  volume: process.env.TTS_VOLUME ?? '+0%',
  pitch: process.env.TTS_PITCH ?? '+0Hz',
} as const;
