import {mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';

export const downloadJdImage = async (url: string, productId: string): Promise<string> => {
  const targetDir = path.resolve('public', 'jd', productId);
  const target = path.join(targetDir, 'cover.jpg');
  await mkdir(targetDir, {recursive: true});
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetch(url, {signal: controller.signal, headers: {'user-agent': 'Mozilla/5.0'}});
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    await writeFile(target, Buffer.from(await response.arrayBuffer()));
    return target;
  } finally { clearTimeout(timer); }
};

