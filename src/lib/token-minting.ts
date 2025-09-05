import { Connection, PublicKey, Keypair, clusterApiUrl } from '@solana/web3.js';
import { 
  getOrCreateAssociatedTokenAccount, 
  mintTo,
  TOKEN_PROGRAM_ID 
} from '@solana/spl-token';
import { getJuzMintAddress } from './deployment-config';

// Connection to Solana devnet
const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

/**
 * Mint JUZ tokens to user wallet (for reading rewards)
 * This requires mint authority private key - should be called from secure backend
 */
export async function mintJuzTokensToUser(
  userPublicKey: PublicKey,
  amount: number, // Amount in JUZ tokens (e.g., 5.5)
  mintAuthorityKeypair: Keypair
): Promise<{
  success: boolean;
  signature?: string;
  error?: string;
  tokenAccount?: string;
}> {
  try {
    console.log(`🪙 Minting ${amount} JUZ tokens to user:`, userPublicKey.toString());

    const mintAddress = getJuzMintAddress();
    
    // Get or create user's token account
    const userTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      mintAuthorityKeypair, // Mint authority pays for account creation
      mintAddress,
      userPublicKey
    );

    console.log('✅ User token account:', userTokenAccount.address.toString());

    // Convert amount to token units (with 6 decimals)
    const tokenAmount = Math.floor(amount * Math.pow(10, 6));
    
    // Mint tokens to user
    const signature = await mintTo(
      connection,
      mintAuthorityKeypair,
      mintAddress,
      userTokenAccount.address,
      mintAuthorityKeypair.publicKey,
      tokenAmount,
      [],
      undefined,
      TOKEN_PROGRAM_ID
    );

    console.log('✅ Tokens minted! Transaction:', signature);
    console.log(`📊 Minted ${amount} JUZ tokens (${tokenAmount} units)`);

    return {
      success: true,
      signature,
      tokenAccount: userTokenAccount.address.toString()
    };

  } catch (error) {
    console.error('❌ Token minting failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown minting error'
    };
  }
}

/**
 * Simulate reading rewards (for demo - in production this would be backend API)
 * This creates a mock minting process that shows what would happen
 */
export async function simulateReadingReward(
  userPublicKey: PublicKey,
  rewardAmount: number,
  activity: string
): Promise<{
  success: boolean;
  message: string;
  amount: number;
  activity: string;
}> {
  try {
    console.log(`🎉 Simulating reading reward: ${rewardAmount} JUZ for ${activity}`);
    
    // In production, this would:
    // 1. Verify reading activity on backend
    // 2. Call mintJuzTokensToUser with mint authority
    // 3. Update user's reading progress
    // 4. Record transaction in database
    
    // For now, we simulate the process
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    
    return {
      success: true,
      message: `Congratulations! You earned ${rewardAmount} JUZ tokens for ${activity}`,
      amount: rewardAmount,
      activity
    };
    
  } catch (error) {
    return {
      success: false,
      message: 'Failed to process reward',
      amount: 0,
      activity
    };
  }
}

/**
 * Backend service for minting tokens (example implementation)
 * This would run on your server with access to mint authority private key
 */
export class JuzTokenMintingService {
  private mintAuthority: Keypair;
  
  constructor(mintAuthoritySecretKey: Uint8Array) {
    this.mintAuthority = Keypair.fromSecretKey(mintAuthoritySecretKey);
  }
  
  async processReadingReward(
    userWallet: string,
    timeSpentMinutes: number,
    pageNumber: number,
    streakDays: number = 0
  ): Promise<{ success: boolean; signature?: string; amount?: number; error?: string }> {
    try {
      const userPublicKey = new PublicKey(userWallet);
      
      // Calculate reward amount
      let rewardAmount = timeSpentMinutes * 1; // 1 JUZ per minute
      rewardAmount += 0.5; // Page completion bonus
      
      // Special page bonuses
      if (pageNumber === 1) rewardAmount += 2; // Al-Fatihah
      if (pageNumber === 2) rewardAmount += 1.5; // Al-Baqarah start
      if (pageNumber === 604) rewardAmount += 5; // Quran completion
      
      // Streak multiplier
      let multiplier = 1;
      if (streakDays >= 30) multiplier = 2.0;
      else if (streakDays >= 14) multiplier = 1.5;
      else if (streakDays >= 7) multiplier = 1.2;
      
      const finalAmount = rewardAmount * multiplier;
      
      // Mint tokens to user
      const result = await mintJuzTokensToUser(
        userPublicKey,
        finalAmount,
        this.mintAuthority
      );
      
      return {
        success: result.success,
        signature: result.signature,
        amount: finalAmount,
        error: result.error
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Service error'
      };
    }
  }
}
