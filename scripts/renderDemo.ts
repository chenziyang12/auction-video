import path from 'node:path';
import {ensureRuntimeDirectories, runtimePaths} from '../src/config/runtimePaths';
import {runRemotion} from '../src/video/remotionCli';

const main = async () => {
  await ensureRuntimeDirectories();
  await runRemotion([
    'render',
    'src/remotion/index.ts',
    'AuctionDaily',
    path.join(runtimePaths.outputDir, 'demo.mp4'),
    '--codec=h264',
  ]);
};

main().catch((error) => {
  console.error('失败原因：', error);
  process.exitCode = 1;
});
