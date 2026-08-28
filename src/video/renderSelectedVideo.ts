import {randomUUID} from 'node:crypto';
import {mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {ensureRuntimeDirectories, runtimePaths} from '../config/runtimePaths';
import type {AuctionItem} from '../data/types';
import {buildVideoTimeline} from './buildVideoTimeline';
import {runRemotion} from './remotionCli';

export const VIDEO_TEMPLATES = [
  {id: 'default', name: '今日拍卖精选'},
  {id: 'high-value', name: '高价值标的'},
  {id: 'simple', name: '简洁资讯'},
] as const;

export type VideoTemplateId = typeof VIDEO_TEMPLATES[number]['id'];
export type RenderStage = '准备数据' | '生成语音' | '渲染视频' | '完成';

// 三个 MVP 模板暂时复用同一 composition，templateId 保留为后续扩展入口。
export const renderSelectedVideo = async ({
  items,
  templateId,
  onStage,
}: {
  items: AuctionItem[];
  templateId: VideoTemplateId;
  onStage: (stage: RenderStage) => void;
}): Promise<string> => {
  onStage('准备数据');
  const jobId = `${new Date().toISOString().replace(/[:.]/g, '-')}-${randomUUID().slice(0, 8)}`;
  const outputFile = `auction-${jobId}.mp4`;
  const propsFile = path.join(runtimePaths.tempDir, 'web', `${jobId}.json`);

  onStage('生成语音');
  await ensureRuntimeDirectories();
  const timeline = await buildVideoTimeline(items);
  await mkdir(path.dirname(propsFile), {recursive: true});
  await writeFile(propsFile, JSON.stringify({timeline, templateId}, null, 2));

  onStage('渲染视频');
  const args = [
    'render',
    'src/remotion/index.ts',
    'AuctionDailyVoice',
    path.join(runtimePaths.outputDir, outputFile),
    '--codec=h264',
    `--props=${propsFile}`,
  ];
  await runRemotion(args);
  onStage('完成');
  return outputFile;
};
