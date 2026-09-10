import {spawn} from 'node:child_process';
import path from 'node:path';
import {findBrowserExecutable} from '../utils/browserExecutable';

// 直接通过 Node 启动 CLI，兼容 Windows 空格路径和 Linux 容器路径。
export const runRemotion = async (args: string[]): Promise<void> => {
  const cli = path.resolve('node_modules', '@remotion', 'cli', 'remotion-cli.js');
  const browserExecutable = await findBrowserExecutable();
  const renderArgs = browserExecutable ? [...args, `--browser-executable=${browserExecutable}`] : args;
  const child = spawn(process.execPath, [cli, ...renderArgs], {stdio: 'inherit'});
  const code = await new Promise<number | null>((resolve, reject) => {
    child.on('exit', resolve);
    child.on('error', reject);
  });
  if (code !== 0) throw new Error(`Remotion render 失败，退出码 ${code}`);
};
