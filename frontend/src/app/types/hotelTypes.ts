export type HotelAvailability = 'available' | 'unknown';

export type Hotel = {
  name: string;
  price_per_night: string;
  currency: string;
  availability: HotelAvailability;
  rating: number | null;
  reviews_count: number | null;
  highlights: string[];
  url: string;
};

export type HotelMeta = {
  city: string;
  kind: 'hotels';
  date: null;
  date_range: string | null;
  language: string;
};

export type HotelPayload = {
  meta: HotelMeta;
  hotels: Hotel[];
};
