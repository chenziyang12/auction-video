import {mkdir} from 'node:fs/promises';
import path from 'node:path';

const projectRoot = path.resolve('.');
const configuredStorageDir = process.env.STORAGE_DIR?.trim();

// 本地开发保持原目录；Docker 通过 STORAGE_DIR/OUTPUT_DIR 切换到持久化挂载目录。
export const runtimePaths = {
  projectRoot,
  publicDir: path.join(projectRoot, 'public'),
  storageDir: configuredStorageDir ? path.resolve(configuredStorageDir) : projectRoot,
  jdDataFile: configuredStorageDir
    ? path.join(path.resolve(configuredStorageDir), 'jd-items.json')
    : path.join(projectRoot, 'src', 'data', 'jd-demo.json'),
  jdImageDir: configuredStorageDir
    ? path.join(path.resolve(configuredStorageDir), 'jd')
    : path.join(projectRoot, 'public', 'jd'),
  generatedDir: configuredStorageDir
    ? path.join(path.resolve(configuredStorageDir), 'generated')
    : path.join(projectRoot, 'public', 'generated'),
  tempDir: configuredStorageDir
    ? path.join(path.resolve(configuredStorageDir), 'tmp')
    : path.join(projectRoot, '.tmp'),
  outputDir: path.resolve(process.env.OUTPUT_DIR?.trim() || 'out'),
} as const;

export const resolvePublicAssetPath = (relativePath: string): string => {
  const normalized = relativePath.replaceAll('\\', '/');
  if (normalized.startsWith('jd/')) return path.join(runtimePaths.jdImageDir, normalized.slice(3));
  if (normalized.startsWith('generated/')) return path.join(runtimePaths.generatedDir, normalized.slice(10));
  return path.join(runtimePaths.publicDir, ...normalized.split('/'));
};

// 服务和脚本启动时统一创建运行目录，避免首次挂载空卷时报错。
export const ensureRuntimeDirectories = async (): Promise<void> => {
  await Promise.all([
    mkdir(path.dirname(runtimePaths.jdDataFile), {recursive: true}),
    mkdir(runtimePaths.jdImageDir, {recursive: true}),
    mkdir(path.join(runtimePaths.generatedDir, 'tts'), {recursive: true}),
    mkdir(runtimePaths.tempDir, {recursive: true}),
    mkdir(runtimePaths.outputDir, {recursive: true}),
  ]);
};
