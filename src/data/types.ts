export type AuctionProperty = {
  id: string;
  title: string;
  image: string;
  price: string | null;
  province?: string;
  city?: string;
  district?: string;
  address?: string;
  endTime?: number | string;
  source: 'DEMO' | 'JD';
};

