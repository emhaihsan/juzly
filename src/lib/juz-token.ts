import { Connection, PublicKey, clusterApiUrl, Keypair } from '@solana/web3.js';
import { 
  getOrCreateAssociatedTokenAccount,  
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
  image: '',
  mintAddress: getJuzMintAddress().toString(),
  explorer: JUZ_DEPLOYMENT_CONFIG.explorer
};

// Reading reward rates (JUZ tokens per activity)
export const READING_REWARDS = {
  // Base reading rewards
  PER_PAGE_READING: 0.05, // 0.05 JUZ per page
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
 * Calculate reading rewards based on page completion only
 */
export function calculateReadingRewards(
  timeSpentMinutes: number, 
  pageNumber: number,
  streakDays: number = 0
): number {
  // Simple reward: 0.05 JUZ per page completed
  // Convert to lamports (6 decimals): 0.05 * 1,000,000 = 50,000
  const baseReward = 50_000; // 0.05 JUZ in lamports
  
  return baseReward;
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
