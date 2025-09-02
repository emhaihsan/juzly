import { Connection, PublicKey, clusterApiUrl, Keypair } from '@solana/web3.js';
import { 
  createMint, 
  getOrCreateAssociatedTokenAccount, 
  mintTo, 
  transfer,
  getAccount,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID
} from '@solana/spl-token';

// JUZ Token Configuration
export const JUZ_TOKEN_CONFIG = {
  name: 'Juzly Reading Token',
  symbol: 'JUZ',
  decimals: 6,
  description: 'Reward token for reading the Holy Quran on Juzly platform',
  image: 'https://arweave.net/juz-token-logo.png'
};

// Reading reward rates (JUZ tokens per activity)
export const READING_REWARDS = {
  // Base reading rewards
  PER_MINUTE_READING: 1_000_000, // 1 JUZ per minute (with 6 decimals)
  PAGE_COMPLETION_BONUS: 500_000, // 0.5 JUZ bonus for completing a page
  
  // Streak bonuses (multipliers)
  DAILY_STREAK_BONUS: {
    7: 1.2,   // 20% bonus for 7-day streak
    14: 1.5,  // 50% bonus for 14-day streak
    30: 2.0,  // 100% bonus for 30-day streak
  },
  
  // Special page bonuses
  SPECIAL_PAGES: {
    1: 2_000_000,    // 2 JUZ for Al-Fatihah (page 1)
    2: 1_500_000,    // 1.5 JUZ for start of Al-Baqarah
    604: 5_000_000,  // 5 JUZ for completing Quran (last page)
  },
  
  // Achievement bonuses
  ACHIEVEMENT_BONUS: {
    first_week: 10_000_000,      // 10 JUZ
    monthly_reader: 25_000_000,  // 25 JUZ
    century_club: 100_000_000,   // 100 JUZ
    diamond_reader: 300_000_000, // 300 JUZ
    quran_complete: 1_000_000_000, // 1000 JUZ
  },
  
  // Leaderboard rewards (weekly/monthly)
  LEADERBOARD_REWARDS: {
    weekly: [50_000_000, 30_000_000, 20_000_000], // Top 3: 50, 30, 20 JUZ
    monthly: [200_000_000, 150_000_000, 100_000_000], // Top 3: 200, 150, 100 JUZ
  }
};

// Merchandise catalog with JUZ token prices
export const MERCHANDISE_CATALOG = [
  {
    id: 'tasbih_digital',
    name: 'Digital Tasbih Counter NFT',
    description: 'Beautiful digital tasbih counter with Islamic patterns',
    price: 50_000_000, // 50 JUZ
    category: 'digital',
    image: 'https://arweave.net/tasbih-nft.png',
    stock: 1000
  },
  {
    id: 'quran_bookmark',
    name: 'Premium Quran Bookmark',
    description: 'Physical bookmark with Ayatul Kursi calligraphy',
    price: 25_000_000, // 25 JUZ
    category: 'physical',
    image: 'https://arweave.net/bookmark.png',
    stock: 500,
    shipping: true
  },
  {
    id: 'prayer_mat_nft',
    name: 'Virtual Prayer Mat Collection',
    description: 'Collectible prayer mat designs from around the world',
    price: 75_000_000, // 75 JUZ
    category: 'digital',
    image: 'https://arweave.net/prayer-mat-nft.png',
    stock: 100
  },
  {
    id: 'islamic_calendar',
    name: 'Hijri Calendar 2025',
    description: 'Beautiful Islamic calendar with daily Quran verses',
    price: 40_000_000, // 40 JUZ
    category: 'physical',
    image: 'https://arweave.net/calendar.png',
    stock: 200,
    shipping: true
  },
  {
    id: 'donation_voucher',
    name: 'Charity Donation Voucher',
    description: 'Donate to verified Islamic charities',
    price: 10_000_000, // 10 JUZ (minimum)
    category: 'charity',
    image: 'https://arweave.net/donation.png',
    stock: 9999,
    customAmount: true
  }
];

export class JuzTokenManager {
  private connection: Connection;
  private mintAddress: PublicKey | null = null;
  private mintAuthority: Keypair | null = null;

  constructor(rpcUrl?: string) {
    this.connection = new Connection(rpcUrl || clusterApiUrl('devnet'));
  }

  // Initialize JUZ token mint (one-time setup)
  async initializeToken(payer: Keypair): Promise<PublicKey> {
    try {
      // Create mint authority (in production, use a PDA)
      this.mintAuthority = Keypair.generate();
      
      // Create the token mint
      this.mintAddress = await createMint(
        this.connection,
        payer,
        this.mintAuthority.publicKey,
        null, // No freeze authority
        JUZ_TOKEN_CONFIG.decimals,
        undefined,
        undefined,
        TOKEN_PROGRAM_ID
      );

      console.log(`JUZ Token mint created: ${this.mintAddress.toString()}`);
      return this.mintAddress;
    } catch (error) {
      console.error('Error initializing JUZ token:', error);
      throw error;
    }
  }

  // Set existing mint address (for already deployed token)
  setMintAddress(mintAddress: string, mintAuthority?: Keypair) {
    this.mintAddress = new PublicKey(mintAddress);
    this.mintAuthority = mintAuthority || null;
  }

  // Get or create user's JUZ token account
  async getUserTokenAccount(userPublicKey: PublicKey) {
    if (!this.mintAddress) {
      throw new Error('Token mint not initialized');
    }

    return await getOrCreateAssociatedTokenAccount(
      this.connection,
      userPublicKey, // This should be a Keypair in practice
      this.mintAddress,
      userPublicKey
    );
  }

  // Get user's JUZ token balance
  async getUserBalance(userPublicKey: PublicKey): Promise<number> {
    try {
      const tokenAccount = await this.getUserTokenAccount(userPublicKey);
      const accountInfo = await getAccount(this.connection, tokenAccount.address);
      return Number(accountInfo.amount);
    } catch (error) {
      console.error('Error getting user balance:', error);
      return 0;
    }
  }

  // Mint JUZ tokens for reading activity
  async mintReadingReward(
    userPublicKey: PublicKey,
    rewardType: keyof typeof READING_REWARDS,
    amount?: number,
    multiplier: number = 1
  ) {
    if (!this.mintAddress || !this.mintAuthority) {
      throw new Error('Token mint not initialized');
    }

    try {
      const userTokenAccount = await this.getUserTokenAccount(userPublicKey);
      
      let rewardAmount: number;
      if (amount) {
        rewardAmount = amount;
      } else if (rewardType in READING_REWARDS) {
        rewardAmount = (READING_REWARDS as any)[rewardType];
      } else {
        throw new Error(`Unknown reward type: ${rewardType}`);
      }

      const finalAmount = Math.floor(rewardAmount * multiplier);

      await mintTo(
        this.connection,
        this.mintAuthority, // This should be the payer in practice
        this.mintAddress,
        userTokenAccount.address,
        this.mintAuthority,
        finalAmount
      );

      return {
        success: true,
        amount: finalAmount,
        userTokenAccount: userTokenAccount.address.toString(),
      };
    } catch (error) {
      console.error('Error minting reading reward:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Calculate reading rewards based on activity
  calculateReadingReward(
    minutesRead: number,
    pagesCompleted: number[],
    streakDays: number,
    achievements: string[] = []
  ): number {
    let totalReward = 0;

    // Base reading reward
    totalReward += minutesRead * READING_REWARDS.PER_MINUTE_READING;

    // Page completion bonuses
    pagesCompleted.forEach(page => {
      totalReward += READING_REWARDS.PAGE_COMPLETION_BONUS;
      
      // Special page bonuses
      if (page in READING_REWARDS.SPECIAL_PAGES) {
        totalReward += (READING_REWARDS.SPECIAL_PAGES as any)[page];
      }
    });

    // Streak multiplier
    let streakMultiplier = 1;
    if (streakDays >= 30) streakMultiplier = READING_REWARDS.DAILY_STREAK_BONUS[30];
    else if (streakDays >= 14) streakMultiplier = READING_REWARDS.DAILY_STREAK_BONUS[14];
    else if (streakDays >= 7) streakMultiplier = READING_REWARDS.DAILY_STREAK_BONUS[7];

    totalReward *= streakMultiplier;

    // Achievement bonuses
    achievements.forEach(achievement => {
      if (achievement in READING_REWARDS.ACHIEVEMENT_BONUS) {
        totalReward += (READING_REWARDS.ACHIEVEMENT_BONUS as any)[achievement];
      }
    });

    return Math.floor(totalReward);
  }

  // Redeem merchandise with JUZ tokens
  async redeemMerchandise(
    userPublicKey: PublicKey,
    merchandiseId: string,
    quantity: number = 1,
    customAmount?: number
  ) {
    const item = MERCHANDISE_CATALOG.find(m => m.id === merchandiseId);
    if (!item) {
      throw new Error('Merchandise not found');
    }

    const userBalance = await this.getUserBalance(userPublicKey);
    const totalCost = customAmount || (item.price * quantity);

    if (userBalance < totalCost) {
      throw new Error('Insufficient JUZ token balance');
    }

    if (!item.customAmount && item.stock < quantity) {
      throw new Error('Insufficient stock');
    }

    try {
      // In a real implementation, you would:
      // 1. Burn/transfer tokens from user
      // 2. Update merchandise stock
      // 3. Create redemption record
      // 4. Trigger fulfillment process

      return {
        success: true,
        transactionId: `redemption_${Date.now()}`,
        item: item.name,
        quantity,
        cost: totalCost,
        remainingBalance: userBalance - totalCost,
      };
    } catch (error) {
      console.error('Error redeeming merchandise:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Get merchandise catalog with user's affordability
  async getMerchandiseCatalog(userPublicKey?: PublicKey) {
    const userBalance = userPublicKey ? await this.getUserBalance(userPublicKey) : 0;

    return MERCHANDISE_CATALOG.map(item => ({
      ...item,
      affordable: userBalance >= item.price,
      priceInJuz: item.price / 1_000_000, // Convert to human-readable JUZ
    }));
  }
}

// Helper functions for formatting
export function formatJuzAmount(amount: number): string {
  return (amount / 1_000_000).toFixed(2);
}

export function parseJuzAmount(juzAmount: number): number {
  return Math.floor(juzAmount * 1_000_000);
}
