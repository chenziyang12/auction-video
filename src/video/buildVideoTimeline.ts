import {createHash} from 'node:crypto';
import {mkdir, readFile, stat, writeFile} from 'node:fs/promises';
import path from 'node:path';
import type {AuctionItem} from '../data/types';
import {buildAuctionNarration, buildIntroNarration, OUTRO_NARRATION} from '../narration/buildNarration';
import {buildSubtitleCues} from '../subtitles/buildSubtitleCues';
import {EdgeTtsProvider} from '../tts';
import {ttsConfig} from '../tts/config';
import type {TtsResult} from '../tts/types';
import {calculateSceneFrames} from '../timeline/duration';
import type {VideoSegment, VideoTimeline} from '../timeline/types';
import {getRegionTitle} from '../utils/region';
import {runtimePaths} from '../config/runtimePaths';

const fps = 30;
const cacheDir = path.join(runtimePaths.generatedDir, 'tts');
const provider = new EdgeTtsProvider();

// TTS 缓存键包含声音配置和文案，重复生成相同标的时直接复用音频。
const synthesizeCached = async (text: string): Promise<TtsResult> => {
  const hash = createHash('sha256')
    .update(JSON.stringify({cacheVersion: 2, ...ttsConfig, text}))
    .digest('hex')
    .slice(0, 20);
  const audioPath = path.join(cacheDir, `${hash}.mp3`);
  const metadataPath = path.join(cacheDir, `${hash}.json`);

  try {
    const cached = JSON.parse(await readFile(metadataPath, 'utf8')) as TtsResult;
    if ((await stat(audioPath)).size > 0 && cached.durationSeconds > 0 && cached.boundaries.length > 0) {
      return {...cached, audioPath};
    }
  } catch {
    // 缓存缺失或不完整时重新生成。
  }

  const result = await provider.synthesize({text, outputPath: audioPath});
  await writeFile(metadataPath, JSON.stringify({...result, audioPath}, null, 2));
  return result;
};

// 将用户选中的标的转换为现有 AuctionDailyVoice 所需的时间轴。
export const buildVideoTimeline = async (items: AuctionItem[]): Promise<VideoTimeline> => {
  await mkdir(cacheDir, {recursive: true});
  const definitions = [
    {id: 'intro', type: 'intro' as const, text: buildIntroNarration(getRegionTitle(items), items.length)},
    ...items.map((item, index) => ({
      id: `item-${String(index + 1).padStart(3, '0')}`,
      type: 'auction-item' as const,
      text: buildAuctionNarration(item, index),
      item,
    })),
    {id: 'outro', type: 'outro' as const, text: OUTRO_NARRATION},
  ];
  const segments: VideoSegment[] = [];

  for (const definition of definitions) {
    const result = await synthesizeCached(definition.text);
    const audioSrc = path.posix.join('generated', 'tts', path.basename(result.audioPath));
    segments.push({
      id: definition.id,
      type: definition.type,
      narration: definition.text,
      audioSrc,
      audioDurationSeconds: result.durationSeconds,
      durationInFrames: calculateSceneFrames(result.durationSeconds, fps, definition.type),
      subtitles: buildSubtitleCues(result.boundaries),
      boundaryCount: result.boundaries.length,
      item: 'item' in definition ? definition.item : undefined,
    });
  }

  return {fps, segments, totalFrames: segments.reduce((sum, segment) => sum + segment.durationInFrames, 0)};
};
