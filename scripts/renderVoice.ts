import {access} from 'node:fs/promises';
import path from 'node:path';
import {ensureRuntimeDirectories, runtimePaths} from '../src/config/runtimePaths';
import {runRemotion} from '../src/video/remotionCli';

const main = async () => {
  const mode = process.argv[2];
  if (mode !== 'demo' && mode !== 'jd') throw new Error('Usage: renderVoice.ts demo|jd');
  await ensureRuntimeDirectories();
  const propsFile = path.join(runtimePaths.tempDir, 'narration', `${mode}.json`);
  try {
    await access(propsFile);
  } catch {
    throw new Error(`请先执行 npm run voice:${mode}`);
  }
  const outputFile = mode === 'demo' ? 'demo-voice.mp4' : 'jd-voice.mp4';
  await runRemotion([
    'render',
    'src/remotion/index.ts',
    'AuctionDailyVoice',
    path.join(runtimePaths.outputDir, outputFile),
    '--codec=h264',
    `--props=${propsFile}`,
  ]);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
