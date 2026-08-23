import type {AuctionItem} from '../data/types';

const cleanProvince = (value: string): string => value.trim().replace(/(?:壮族|回族|维吾尔)?自治区$|特别行政区$|省$|市$/u, '');
const cleanCity = (value: string): string => value.trim().replace(/自治州$|地区$|市$|盟$/u, '');
const cleanDistrict = (value: string): string => value.trim().replace(/市辖区$|自治县$|区$|县$|市$/u, '');
const unique = (values: Array<string | undefined>): string[] => [...new Set(values.filter((value): value is string => Boolean(value?.trim())))];

export const getRegionTitle = (items: AuctionItem[]): string => {
  const cities = unique(items.map((item) => item.city));
  if (cities.length === 1 && items.every((item) => item.city === cities[0])) return `${cleanCity(cities[0])}今日拍卖`;
  const provinces = unique(items.map((item) => item.province));
  if (provinces.length === 1 && items.every((item) => item.province === provinces[0])) return `${cleanProvince(provinces[0])}今日拍卖`;
  return '今日拍卖精选';
};

export const formatAuctionLocation = (item: AuctionItem): string => {
  const city = item.city ? cleanCity(item.city) : undefined;
  const district = item.district ? cleanDistrict(item.district) : undefined;
  const parts = unique([city, district]).filter((part) => part !== cleanProvince(item.province ?? ''));
  if (parts.length) return parts.join(' · ');
  return item.province ? cleanProvince(item.province) : '位置以公告为准';
};
