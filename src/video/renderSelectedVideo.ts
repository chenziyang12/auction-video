import {spawn} from 'node:child_process';
import {randomUUID} from 'node:crypto';
import {access, mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import type {AuctionItem} from '../data/types';
import {buildVideoTimeline} from './buildVideoTimeline';

export const VIDEO_TEMPLATES = [
  {id: 'default', name: '今日拍卖精选'},
  {id: 'high-value', name: '高价值标的'},
  {id: 'simple', name: '简洁资讯'},
] as const;

export type VideoTemplateId = typeof VIDEO_TEMPLATES[number]['id'];
export type RenderStage = '准备数据' | '生成语音' | '渲染视频' | '完成';

const findBrowserExecutable = async (): Promise<string | undefined> => {
  const candidates = [
    process.env.REMOTION_BROWSER_EXECUTABLE,
    process.platform === 'win32' ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' : undefined,
    process.platform === 'win32' ? 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe' : undefined,
  ].filter((candidate): candidate is string => Boolean(candidate));

  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // 当前候选不存在时继续检查下一个。
    }
  }
  return undefined;
};

const runRemotion = async (args: string[]): Promise<void> => {
  const cli = path.resolve('node_modules', '@remotion', 'cli', 'remotion-cli.js');
  // 直接通过 Node 启动 CLI，避免 Windows shell 拆分带空格的浏览器路径。
  const child = spawn(process.execPath, [cli, ...args], {stdio: 'inherit'});
  const code = await new Promise<number | null>((resolve, reject) => {
    child.on('exit', resolve);
    child.on('error', reject);
  });
  if (code !== 0) throw new Error(`Remotion render 失败，退出码 ${code}`);
};

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
  const propsFile = path.resolve('.tmp', 'web', `${jobId}.json`);

  onStage('生成语音');
  const timeline = await buildVideoTimeline(items);
  await mkdir(path.dirname(propsFile), {recursive: true});
  await mkdir(path.resolve('out'), {recursive: true});
  await writeFile(propsFile, JSON.stringify({timeline, templateId}, null, 2));

  onStage('渲染视频');
  const args = [
    'render',
    'src/remotion/index.ts',
    'AuctionDailyVoice',
    path.join('out', outputFile),
    '--codec=h264',
    `--props=${propsFile}`,
  ];
  const browserExecutable = await findBrowserExecutable();
  if (browserExecutable) args.push(`--browser-executable=${browserExecutable}`);
  await runRemotion(args);
  onStage('完成');
  return outputFile;
};
