import { Connection, PublicKey, clusterApiUrl, Keypair } from '@solana/web3.js';
import { 
  createMint, 
  getOrCreateAssociatedTokenAccount, 
  mintTo, 
  transfer,
  getAccount,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress
} from '@solana/spl-token';
import { 
  getJuzMintAddress, 
  getJuzDecimals, 
  formatJuzTokenAmount, 
  parseJuzTokenAmount,
  JUZ_DEPLOYMENT_CONFIG 
} from './deployment-config';

// JUZ Token Configuration using deployed token
export const JUZ_TOKEN_CONFIG = {
  name: 'Juzly Reading Token',
  symbol: 'JUZ',
  decimals: getJuzDecimals(),
  description: 'Reward token for reading the Holy Quran on Juzly platform',
  image: 'https://arweave.net/juz-token-logo.png',
  mintAddress: getJuzMintAddress().toString(),
  explorer: JUZ_DEPLOYMENT_CONFIG.explorer
};

// Reading reward rates (JUZ tokens per activity)
export const READING_REWARDS = {
  // Base reading rewards
  PER_MINUTE_READING: parseJuzTokenAmount(1), // 1 JUZ per minute
  PAGE_COMPLETION_BONUS: parseJuzTokenAmount(0.5), // 0.5 JUZ bonus for completing a page
  
  // Streak bonuses (multipliers)
  DAILY_STREAK_BONUS: {
    7: 1.2,   // 20% bonus for 7-day streak
    14: 1.5,  // 50% bonus for 14-day streak
    30: 2.0,  // 100% bonus for 30-day streak
  },
  
  // Special page bonuses
  SPECIAL_PAGES: {
    1: parseJuzTokenAmount(2),    // 2 JUZ for Al-Fatihah (page 1)
    2: parseJuzTokenAmount(1.5),  // 1.5 JUZ for start of Al-Baqarah
    604: parseJuzTokenAmount(5),  // 5 JUZ for completing Quran (last page)
  },
  
  // Achievement bonuses
  ACHIEVEMENT_BONUS: {
    first_week: parseJuzTokenAmount(10),      // 10 JUZ
    monthly_reader: parseJuzTokenAmount(25),  // 25 JUZ
    century_club: parseJuzTokenAmount(100),   // 100 JUZ
    diamond_reader: parseJuzTokenAmount(300), // 300 JUZ
    quran_complete: parseJuzTokenAmount(1000), // 1000 JUZ
  },
  
  // Leaderboard rewards (weekly)
  LEADERBOARD_WEEKLY: {
    1: parseJuzTokenAmount(50),   // 1st place: 50 JUZ
    2: parseJuzTokenAmount(30),   // 2nd place: 30 JUZ
    3: parseJuzTokenAmount(20),   // 3rd place: 20 JUZ
    top10: parseJuzTokenAmount(5) // Top 10: 5 JUZ
  }
};

// Connection to Solana devnet
export const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

// JUZ Token mint public key from deployment
export const juzTokenMint = getJuzMintAddress();

/**
 * Get user's JUZ token balance
 */
export async function getUserJuzBalance(userPublicKey: PublicKey): Promise<number> {
  try {
    const tokenAccountAddress = await getAssociatedTokenAddress(
      juzTokenMint,
      userPublicKey,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    const tokenAccount = await getAccount(connection, tokenAccountAddress);
    return formatJuzTokenAmount(Number(tokenAccount.amount));
  } catch (error) {
    console.log('User has no JUZ token account yet:', error);
    return 0;
  }
}

/**
 * Create token account for user if it doesn't exist
 */
export async function createUserTokenAccount(
  userPublicKey: PublicKey,
  payerKeypair: Keypair
): Promise<PublicKey> {
  const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payerKeypair,
    juzTokenMint,
    userPublicKey
  );

  return tokenAccount.address;
}

/**
 * Check if user has JUZ token account
 */
export async function userHasJuzTokenAccount(userPublicKey: PublicKey): Promise<boolean> {
  try {
    const tokenAccountAddress = await getAssociatedTokenAddress(
      juzTokenMint,
      userPublicKey,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    await getAccount(connection, tokenAccountAddress);
    return true;
  } catch {
    return false;
  }
}

/**
 * Calculate reading rewards based on time spent and page
 */
export function calculateReadingRewards(
  timeSpentMinutes: number, 
  pageNumber: number,
  streakDays: number = 0
): number {
  let baseReward = timeSpentMinutes * READING_REWARDS.PER_MINUTE_READING;
  
  // Add page completion bonus
  baseReward += READING_REWARDS.PAGE_COMPLETION_BONUS;
  
  // Add special page bonus if applicable (type-safe property access)
  const specialPageReward = READING_REWARDS.SPECIAL_PAGES[pageNumber as keyof typeof READING_REWARDS.SPECIAL_PAGES];
  if (specialPageReward) {
    baseReward += specialPageReward;
  }
  
  // Apply streak multiplier
  let streakMultiplier = 1;
  if (streakDays >= 30) {
    streakMultiplier = READING_REWARDS.DAILY_STREAK_BONUS[30];
  } else if (streakDays >= 14) {
    streakMultiplier = READING_REWARDS.DAILY_STREAK_BONUS[14];
  } else if (streakDays >= 7) {
    streakMultiplier = READING_REWARDS.DAILY_STREAK_BONUS[7];
  }
  
  return Math.floor(baseReward * streakMultiplier);
}

/**
 * Format JUZ token amount for display
 */
export function formatJuzAmount(rawAmount: number): string {
  const displayAmount = formatJuzTokenAmount(rawAmount);
  return displayAmount.toFixed(2);
}

/**
 * Parse JUZ display amount to raw token units
 */
export function parseJuzAmount(juzAmount: number): number {
  return parseJuzTokenAmount(juzAmount);
}

// Export deployment config for components
export { JUZ_DEPLOYMENT_CONFIG } from './deployment-config';
