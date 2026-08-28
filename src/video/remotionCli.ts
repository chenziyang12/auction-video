import {spawn} from 'node:child_process';
import {access} from 'node:fs/promises';
import path from 'node:path';

const findBrowserExecutable = async (): Promise<string | undefined> => {
  const candidates = [
    process.env.REMOTION_BROWSER_EXECUTABLE,
    process.env.BROWSER_EXECUTABLE,
    process.platform === 'win32' && process.env.PROGRAMFILES
      ? path.join(process.env.PROGRAMFILES, 'Google', 'Chrome', 'Application', 'chrome.exe')
      : undefined,
    process.platform === 'win32' && process.env['PROGRAMFILES(X86)']
      ? path.join(process.env['PROGRAMFILES(X86)'], 'Microsoft', 'Edge', 'Application', 'msedge.exe')
      : undefined,
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
