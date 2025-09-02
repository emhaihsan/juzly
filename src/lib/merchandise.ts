import { parseJuzTokenAmount } from './deployment-config';

// Merchandise catalog with JUZ token prices using deployed token
export const MERCHANDISE_CATALOG = [
  {
    id: 'tasbih_digital',
    name: 'Digital Tasbih Counter NFT',
    description: 'Beautiful digital tasbih counter with Islamic patterns',
    price: parseJuzTokenAmount(50), // 50 JUZ
    category: 'digital',
    image: 'https://arweave.net/tasbih-nft.png',
    stock: 1000
  },
  {
    id: 'quran_bookmark',
    name: 'Premium Quran Bookmark',
    description: 'Physical bookmark with Ayatul Kursi calligraphy',
    price: parseJuzTokenAmount(25), // 25 JUZ
    category: 'physical',
    image: 'https://arweave.net/bookmark.png',
    stock: 500,
    shipping: true
  },
  {
    id: 'prayer_mat_nft',
    name: 'Virtual Prayer Mat Collection',
    description: 'Collectible prayer mat designs from around the world',
    price: parseJuzTokenAmount(75), // 75 JUZ
    category: 'digital',
    image: 'https://arweave.net/prayer-mat-nft.png',
    stock: 100
  },
  {
    id: 'islamic_calendar',
    name: 'Hijri Calendar 2025',
    description: 'Beautiful Islamic calendar with daily Quran verses',
    price: parseJuzTokenAmount(40), // 40 JUZ
    category: 'physical',
    image: 'https://arweave.net/calendar.png',
    stock: 200,
    shipping: true
  },
  {
    id: 'donation_voucher',
    name: 'Charity Donation Voucher',
    description: 'Donate to verified Islamic charities',
    price: parseJuzTokenAmount(10), // 10 JUZ (minimum)
    category: 'charity',
    image: 'https://arweave.net/donation.png',
    stock: 9999,
    customAmount: true
  }
];

export interface MerchandiseItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'digital' | 'physical' | 'charity';
  image: string;
  stock: number;
  shipping?: boolean;
  customAmount?: boolean;
}

export type MerchandiseItemWithAffordability = MerchandiseItem & {
  affordable: boolean;
  priceInJuz: number;
};
