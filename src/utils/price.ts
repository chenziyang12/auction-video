type PriceInput = {currentPriceCN?: unknown; currentPriceStr?: unknown; currentPrice?: unknown};

const trimDecimal = (value: number): string => value.toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');

export const formatCurrencyCn = (yuan: number): string | null => {
  if (!Number.isFinite(yuan) || yuan <= 0) return null;
  if (yuan >= 100_000_000) return `${trimDecimal(yuan / 100_000_000)}亿`;
  if (yuan >= 10_000) return `${trimDecimal(yuan / 10_000)}万`;
  return `¥${Math.round(yuan).toLocaleString('en-US')}`;
};

const formatPriceString = (input: string): string | null => {
  const value = input.replace(/\s+/g, '').replace(/,/g, '');
  const match = value.match(/^¥?([0-9]+(?:\.[0-9]+)?)(万|亿)?元?$/);
  if (!match) return value || null;
  const amount = Number(match[1]);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  const unit = match[2];
  if (unit === '万' || unit === '亿') return `${trimDecimal(amount)}${unit}`;
  return formatCurrencyCn(amount);
};

export const formatAuctionPrice = (item: PriceInput): string | null => {
  for (const value of [item.currentPriceCN, item.currentPriceStr, item.currentPrice]) {
    if (typeof value === 'string' && value.trim()) {
      const formatted = formatPriceString(value);
      if (formatted) return formatted;
    }
    if (typeof value === 'number') {
      const formatted = formatCurrencyCn(value);
      if (formatted) return formatted;
    }
  }
  return null;
};
