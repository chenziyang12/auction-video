import type {AuctionItem} from '../data/types';
import {formatAuctionPrice} from '../utils/price';

export const normalizeJdImageUrl = (input: unknown): string | null => {
  if (typeof input !== 'string' || !input.trim()) return null;
  const value = input.trim();
  if (/^https:\/\//i.test(value)) return value;
  if (/^\/\//.test(value)) return `https:${value}`;
  if (/^jfs\//i.test(value)) return `https://img12.360buyimg.com/n1/${value}`;
  return null;
};

export const cleanAuctionTitle = (title: string): string => title
  .replace(/关于|依法拍卖|司法拍卖|第一次拍卖|第二次拍卖|变卖|标的物|公告/g, ' ')
  .replace(/[：:]{2,}/g, '：').replace(/\s+/g, ' ').trim();

type UnknownRecord = Record<string, unknown>;
const isRecord = (value: unknown): value is UnknownRecord => typeof value === 'object' && value !== null && !Array.isArray(value);
const productKeys = ['title', 'productName', 'productImage', 'currentPrice', 'productId', 'province', 'city'];

export const findProductArrays = (root: unknown): UnknownRecord[][] => {
  const candidates: UnknownRecord[][] = [];
  const visit = (value: unknown): void => {
    if (Array.isArray(value)) {
      const records = value.filter(isRecord);
      if (records.length && records.some((record) => productKeys.some((key) => key in record))) candidates.push(records);
      value.forEach(visit);
    } else if (isRecord(value)) Object.values(value).forEach(visit);
  };
  visit(root);
  return candidates.sort((a, b) => score(b) - score(a));
};

const score = (items: UnknownRecord[]): number => items.length * 5 + items.slice(0, 10).reduce((sum, item) => sum + productKeys.filter((key) => item[key] != null).length, 0);
const text = (value: unknown): string | undefined => typeof value === 'string' && value.trim() ? value.trim() : typeof value === 'number' ? String(value) : undefined;

export type NormalizedJdItem = AuctionItem & {remoteImage: string; rawPriceFields: PriceInput};
type PriceInput = {currentPriceCN?: unknown; currentPriceStr?: unknown; currentPrice?: unknown};

export const normalizeJdItem = (item: UnknownRecord): NormalizedJdItem | null => {
  const id = text(item.productId) ?? text(item.skuId) ?? text(item.id);
  const rawTitle = text(item.title) ?? text(item.productName);
  const remoteImage = normalizeJdImageUrl(item.productImage);
  if (!id || !rawTitle || !remoteImage) return null;
  return {id, title: cleanAuctionTitle(rawTitle) || rawTitle, image: `jd/${id}/cover.jpg`, remoteImage, price: formatAuctionPrice(item), province: text(item.province), city: text(item.city), district: text(item.district), address: text(item.productAddress), category: text(item.category), startTime: text(item.startTime), endTime: text(item.endTime), source: 'JD', rawPriceFields: {currentPriceCN:item.currentPriceCN,currentPriceStr:item.currentPriceStr,currentPrice:item.currentPrice}};
};
