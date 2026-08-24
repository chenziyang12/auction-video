import {mkdir, readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import type {AuctionItem} from '../data/types';
import {downloadJdImage} from './downloadAssets';
import {fetchAuctionList} from './fetchAuctionList';

const dataFile = path.resolve('src', 'data', 'jd-demo.json');

export const readStoredAuctionItems = async (): Promise<AuctionItem[]> => {
  try {
    const value: unknown = JSON.parse(await readFile(dataFile, 'utf8'));
    return Array.isArray(value) ? value as AuctionItem[] : [];
  } catch {
    return [];
  }
};

// 抓取列表后把图片和数据落到现有本地目录，供页面预览和 Remotion 共用。
export const fetchAndStoreAuctionItems = async (limit = 10): Promise<AuctionItem[]> => {
  const products = await fetchAuctionList(limit);
  const downloaded: AuctionItem[] = [];

  for (const product of products) {
    try {
      await downloadJdImage(product.remoteImage, product.id);
      const {remoteImage: _remoteImage, rawPriceFields: _rawPriceFields, ...localItem} = product;
      downloaded.push(localItem);
    } catch (error) {
      console.warn(`图片下载失败 ${product.id}:`, error instanceof Error ? error.message : error);
    }
  }

  if (!downloaded.length) throw new Error('全部图片下载失败，无法生成视频。');
  await mkdir(path.dirname(dataFile), {recursive: true});
  await writeFile(dataFile, JSON.stringify(downloaded, null, 2));
  return downloaded;
};
