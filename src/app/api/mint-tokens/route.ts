// Force Node.js runtime for crypto operations
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { Connection, Keypair, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { getOrCreateAssociatedTokenAccount, mintTo, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { getJuzMintAddress, parseJuzTokenAmount } from '@/lib/deployment-config';

// Load mint authority keypair from environment variable or file system
async function loadMintAuthority(): Promise<Keypair> {
  try {
    console.log('🔍 Attempting to load mint authority...');
    
    // Check for base64-encoded private key first (RECOMMENDED FOR PRODUCTION)
    const privateKeyBase64 = process.env.SOLANA_PRIVATE_KEY_BASE64;
    if (privateKeyBase64) {
      console.log('📦 Found SOLANA_PRIVATE_KEY_BASE64, attempting to decode...');
      try {
        // Decode base64 to buffer
        const buffer = Buffer.from(privateKeyBase64, 'base64');
        const secretKey = new Uint8Array(buffer);
        
        if (secretKey.length !== 64) {
          throw new Error(`Invalid key length: ${secretKey.length}, expected 64`);
        }
        
        const keypair = Keypair.fromSecretKey(secretKey);
        console.log('✅ Successfully loaded keypair from base64');
        console.log('🔑 Public Key:', keypair.publicKey.toString());
        return keypair;
      } catch (error) {
        console.error('❌ Failed to decode base64 key:', error);
        throw error;
      }
    }
    
    // Try JSON array format (fallback)
    const privateKeyEnv = process.env.SOLANA_PRIVATE_KEY;
    if (privateKeyEnv) {
      console.log('📦 Found SOLANA_PRIVATE_KEY, attempting to parse JSON array...');
      console.log('🔍 Key preview (first 50 chars):', privateKeyEnv.substring(0, 50));
      
      try {
        // Handle potential string escaping issues
        const cleanedKey = privateKeyEnv.trim();
        const secretKeyArray = JSON.parse(cleanedKey);
        
        if (!Array.isArray(secretKeyArray)) {
          throw new Error('Private key is not an array');
        }
        
        if (secretKeyArray.length !== 64) {
          throw new Error(`Invalid array length: ${secretKeyArray.length}, expected 64`);
        }
        
        const secretKey = new Uint8Array(secretKeyArray);
        const keypair = Keypair.fromSecretKey(secretKey);
        console.log('✅ Successfully loaded keypair from JSON array');
        console.log('🔑 Public Key:', keypair.publicKey.toString());
        return keypair;
      } catch (error) {
        console.error('❌ Failed to parse JSON array:', error);
        throw error;
      }
    }

    // Development fallback - local file system
    console.log('🔍 No production keys found, trying local file system...');
    const fs = await import('fs');
    const os = await import('os');
    const path = await import('path');
    
    const keypairPath = process.env.SOLANA_KEYPAIR_PATH || 
      path.join(os.homedir(), '.config/solana/id.json');
    
    console.log('📂 Reading from:', keypairPath);
    
    const secretKey = Uint8Array.from(
      JSON.parse(fs.readFileSync(keypairPath, 'utf8'))
    );
    const keypair = Keypair.fromSecretKey(secretKey);
    console.log('✅ Successfully loaded keypair from file');
    console.log('🔑 Public Key:', keypair.publicKey.toString());
    return keypair;
  } catch (error) {
    console.error('❌ CRITICAL: Failed to load mint authority');
    console.error('Available env vars:', {
      has_SOLANA_PRIVATE_KEY: !!process.env.SOLANA_PRIVATE_KEY,
      has_SOLANA_PRIVATE_KEY_BASE64: !!process.env.SOLANA_PRIVATE_KEY_BASE64,
      NODE_ENV: process.env.NODE_ENV
    });
    throw new Error(`Failed to load mint authority: ${error}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userWallet, amount } = await request.json();

    // Validate inputs
    if (!userWallet || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid parameters' },
        { status: 400 }
      );
    }

    // Setup connection
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    
    // Load mint authority
    const mintAuthority = await loadMintAuthority();
    console.log('🔑 Mint Authority:', mintAuthority.publicKey.toString());

    // Get mint address
    const mintAddress = getJuzMintAddress();
    console.log('🪙 Mint Address:', mintAddress.toString());

    // Convert user wallet string to PublicKey
    const userPublicKey = new PublicKey(userWallet);
    console.log('👤 User Wallet:', userPublicKey.toString());

    // Get or create user's token account
    const userTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      mintAuthority, // Mint authority pays for account creation
      mintAddress,
      userPublicKey
    );

    console.log('📦 User Token Account:', userTokenAccount.address.toString());

    // Convert amount to token units with proper decimals
    const tokenAmount = parseJuzTokenAmount(amount);
    console.log(`💰 Minting ${amount} JUZ (${tokenAmount} units) to user`);

    // Mint tokens to user - THIS IS REAL BLOCKCHAIN TRANSACTION
    const signature = await mintTo(
      connection,
      mintAuthority,
      mintAddress,
      userTokenAccount.address,
      mintAuthority.publicKey,
      tokenAmount,
      [],
      undefined,
      TOKEN_PROGRAM_ID
    );

    console.log('✅ REAL MINTING SUCCESS! Transaction:', signature);

    // Return success response
    return NextResponse.json({
      success: true,
      signature,
      amount,
      tokenAmount,
      userTokenAccount: userTokenAccount.address.toString(),
      mintAddress: mintAddress.toString(),
      explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
      message: `Successfully minted ${amount} JUZ tokens to your wallet!`
    });

  } catch (error) {
    console.error('❌ REAL MINTING FAILED:', error);
    
    return NextResponse.json(
      { 
        error: 'Minting failed', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Also handle GET for testing
export async function GET() {
  try {
    const mintAuthority = await loadMintAuthority();
    const mintAddress = getJuzMintAddress();
    
    return NextResponse.json({
      status: 'JUZ Token Minting API Ready',
      mintAddress: mintAddress.toString(),
      mintAuthority: mintAuthority.publicKey.toString(),
      network: 'devnet',
      ready: true
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'API not ready', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
