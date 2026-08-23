export type SpeechBoundary = {text: string; startMs: number; durationMs: number};
export interface TtsResult {audioPath: string; durationSeconds: number; boundaries: SpeechBoundary[]}
export interface TtsProvider {synthesize(options: {text: string; outputPath: string}): Promise<TtsResult>}
