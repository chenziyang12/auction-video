import type {AuctionItem} from '../data/types';

export type ScoutRules = {
  cities: string[];
  keywords: string[];
  excludeKeywords: string[];
  maxPriceYuan: number | null;
};
export type DealCandidate = {
  item: AuctionItem;
  priceYuan: number | null;
  reasons: string[];
  warnings: string[];
  eligible: boolean;
};

export const DEFAULT_SCOUT_RULES: ScoutRules = {
  cities: [],
  keywords: [],
  excludeKeywords: [],
  maxPriceYuan: null,
};

const normalizeTerms = (value: unknown): string[] | null =>
  Array.isArray(value) && value.length <= 30 &&
  value.every((term) => typeof term === 'string' && term.length <= 60)
    ? [...new Set(value.map((term: string) => term.trim()).filter(Boolean))]
    : null;

export const parseScoutRules = (value: unknown): ScoutRules | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const obj = value as Record<string, unknown>;
  const cities = normalizeTerms(obj.cities);
  const keywords = normalizeTerms(obj.keywords);
  const excludeKeywords = normalizeTerms(obj.excludeKeywords);
  const price = obj.maxPriceYuan;
  if (!cities || !keywords || !excludeKeywords) return null;
  if (price !== null && (typeof price !== 'number' || !Number.isSafeInteger(price) || price < 0 || price > 1_000_000_000_000)) return null;
  return {cities, keywords, excludeKeywords, maxPriceYuan: price as number | null};
};

// 只解析明确标注人民币单位的金额；模糊价格必须人工核对，绝不默认为低价。
export const parsePriceYuan = (value: string | null): number | null => {
  if (!value) return null;
  const cleaned = value.replaceAll(',', '').replaceAll('，', '').replaceAll('￥', '').replaceAll('¥', '').replace(/\s/g, '');
  const match = cleaned.match(/^(?:人民币)?(\d+(?:\.\d+)?)(亿元|万元|万|元)$/);
  if (!match) return null;
  const factor = match[2] === '亿元' ? 100_000_000 : (match[2] === '万元' || match[2] === '万') ? 10_000 : 1;
  const amount = Number(match[1]) * factor;
  return Number.isSafeInteger(amount) && amount >= 0 ? amount : null;
};

export const screenAuctionItems = (items: AuctionItem[], rules: ScoutRules): DealCandidate[] =>
  items.filter((item) => item.source === 'JD').map((item) => {
    const searchable = [item.title, item.category, item.address].filter(Boolean).join(' ').toLowerCase();
    const cityText = [item.city, item.province, item.district].filter(Boolean).join(' ').toLowerCase();
    const priceYuan = parsePriceYuan(item.price);
    const reasons: string[] = [];
    const warnings: string[] = [];
    let eligible = true;
    if (rules.cities.length) {
      if (rules.cities.some((city) => cityText.includes(city.toLowerCase()))) reasons.push('地区符合');
      else eligible = false;
    }
    if (rules.keywords.length) {
      if (rules.keywords.some((word) => searchable.includes(word.toLowerCase()))) reasons.push('命中关注关键词');
      else eligible = false;
    }
    if (rules.excludeKeywords.some((word) => searchable.includes(word.toLowerCase()))) {
      eligible = false;
      warnings.push('命中排除关键词');
    }
    if (priceYuan === null) {
      warnings.push('报价无法可靠解析，需核实');
      if (rules.maxPriceYuan !== null) eligible = false;
    } else if (rules.maxPriceYuan !== null) {
      if (priceYuan <= rules.maxPriceYuan) reasons.push('当前价格在预算内');
      else eligible = false;
    }
    warnings.push('未核验市场成交价、税费、欠费、产权与腾退风险');
    if (eligible) reasons.push('仅通过初筛，并非已确认捡漏');
    return {item, priceYuan, reasons, warnings, eligible};
  });
