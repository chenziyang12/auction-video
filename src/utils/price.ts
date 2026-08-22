type PriceInput = {currentPriceCN?: unknown; currentPriceStr?: unknown; currentPrice?: unknown};

export const formatAuctionPrice = (item: PriceInput): string | null => {
  for (const value of [item.currentPriceCN, item.currentPriceStr, item.currentPrice]) {
    if (typeof value === 'string' && value.trim() && Number(value) !== 0) return value.trim();
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) return `${value}元`;
  }
  return null;
};

