export type AuctionItem = {
  id: string;
  title: string;
  image: string;
  price: string | null;
  province?: string;
  city?: string;
  district?: string;
  address?: string;
  category?: string;
  startTime?: number | string;
  endTime?: number | string;
  source: 'DEMO' | 'JD';
};
