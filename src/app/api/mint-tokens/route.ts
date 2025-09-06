import { NextRequest, NextResponse } from 'next/server';
import { Connection, Keypair, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { getOrCreateAssociatedTokenAccount, mintTo, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { getJuzMintAddress, parseJuzTokenAmount } from '@/lib/deployment-config';

// Load mint authority keypair from environment variable or file system
async function loadMintAuthority(): Promise<Keypair> {
  try {
    console.log('🔍 Loading mint authority...');
    
    // First try to load from environment variable (for production)
    const privateKeyEnv = process.env.SOLANA_PRIVATE_KEY;
    console.log('🔍 Environment variable SOLANA_PRIVATE_KEY exists:', !!privateKeyEnv);
    console.log('🔍 Environment variable length:', privateKeyEnv?.length || 0);
    
    if (privateKeyEnv) {
      console.log('🔍 Using environment variable for mint authority');
      try {
        // Validate that it's a proper JSON array format
        if (!privateKeyEnv.startsWith('[') || !privateKeyEnv.endsWith(']')) {
          throw new Error('Private key must be a JSON array format: [1,2,3,...]');
        }
        
        console.log('🔍 Parsing private key JSON...');
        const parsedArray = JSON.parse(privateKeyEnv);
        
        // Validate it's an array
        if (!Array.isArray(parsedArray)) {
          throw new Error('Private key must be an array of numbers');
        }
        
        // Validate array length (should be 64 bytes for Solana)
        if (parsedArray.length !== 64) {
          throw new Error(`Private key array must be 64 bytes, got ${parsedArray.length}`);
        }
        
        // Validate all elements are numbers between 0-255
        for (let i = 0; i < parsedArray.length; i++) {
          const byte = parsedArray[i];
          if (typeof byte !== 'number' || byte < 0 || byte > 255 || !Number.isInteger(byte)) {
            throw new Error(`Invalid byte at index ${i}: ${byte}. Must be integer 0-255`);
          }
        }
        
        console.log('🔍 Converting to Uint8Array...');
        const secretKey = new Uint8Array(parsedArray);
        console.log('🔍 Secret key length:', secretKey.length);
        
        console.log('🔍 Creating keypair from secret key...');
        const keypair = Keypair.fromSecretKey(secretKey);
        
        // Validate keypair was created successfully
        if (!keypair || !keypair.publicKey) {
          throw new Error('Failed to create valid keypair from secret key');
        }
        
        console.log('✅ Successfully loaded keypair from environment');
        console.log('🔑 Public key:', keypair.publicKey?.toString() || 'undefined');
        return keypair;
      } catch (envError) {
        console.error('❌ Error parsing environment variable:', envError);
        console.error('❌ Raw environment variable:', privateKeyEnv?.substring(0, 50) + '...');
        throw new Error(`Failed to parse SOLANA_PRIVATE_KEY: ${envError instanceof Error ? envError.message : envError}`);
      }
    }

    // Fallback to local file system (for development)
    console.log('🔍 Falling back to local file system');
    const fs = await import('fs');
    const os = await import('os');
    const path = await import('path');
    
    const keypairPath = process.env.SOLANA_KEYPAIR_PATH || 
      path.join(os.homedir(), '.config/solana/id.json');
    
    console.log('🔍 Keypair path:', keypairPath);
    
    try {
      // Check if file exists
      if (!fs.existsSync(keypairPath)) {
        throw new Error(`Keypair file does not exist: ${keypairPath}`);
      }
      
      console.log('🔍 Reading keypair file...');
      const fileContent = fs.readFileSync(keypairPath, 'utf8');
      console.log('🔍 File content length:', fileContent.length);
      
      const parsedArray = JSON.parse(fileContent);
      
      // Validate it's an array
      if (!Array.isArray(parsedArray)) {
        throw new Error('Keypair file must contain an array of numbers');
      }
      
      // Validate array length
      if (parsedArray.length !== 64) {
        throw new Error(`Keypair file array must be 64 bytes, got ${parsedArray.length}`);
      }
      
      const secretKey = new Uint8Array(parsedArray);
      console.log('🔍 Secret key length from file:', secretKey.length);
      
      const keypair = Keypair.fromSecretKey(secretKey);
      
      // Validate keypair
      if (!keypair || !keypair.publicKey) {
        throw new Error('Failed to create valid keypair from file');
      }
      
      console.log('✅ Successfully loaded keypair from file');
      console.log('🔑 Public key:', keypair.publicKey?.toString() || 'undefined');
      return keypair;
    } catch (fileError) {
      console.error('❌ Error reading keypair file:', fileError);
      throw new Error(`Failed to read keypair file: ${fileError instanceof Error ? fileError.message : fileError}`);
    }
  } catch (error) {
    console.error('❌ FULL ERROR in loadMintAuthority:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      error: error,
      env_exists: !!process.env.SOLANA_PRIVATE_KEY,
      env_length: process.env.SOLANA_PRIVATE_KEY?.length || 0
    });
    throw new Error(`Failed to load mint authority: ${error instanceof Error ? error.message : error}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting mint tokens API call');
    
    const { userWallet, amount } = await request.json();
    console.log('📝 Request data:', { userWallet, amount });

    // Validate inputs
    if (!userWallet || !amount || amount <= 0) {
      console.error('❌ Invalid parameters:', { userWallet, amount });
      return NextResponse.json(
        { error: 'Invalid parameters' },
        { status: 400 }
      );
    }

    // Setup connection
    console.log('🔗 Setting up Solana connection...');
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    console.log('✅ Connection established');
    
    // Load mint authority
    console.log('🔑 Loading mint authority...');
    const mintAuthority = await loadMintAuthority();
    if (!mintAuthority || !mintAuthority.publicKey) {
      console.error('❌ Mint authority is null or missing publicKey');
      throw new Error('Failed to load mint authority keypair');
    }
    console.log('🔑 Mint Authority:', mintAuthority.publicKey?.toString() || 'undefined');

    // Get mint address
    console.log('🪙 Getting mint address...');
    const mintAddress = getJuzMintAddress();
    if (!mintAddress) {
      console.error('❌ Mint address is null');
      throw new Error('Failed to get mint address');
    }
    console.log('🪙 Mint Address:', mintAddress?.toString() || 'undefined');

    // Convert user wallet string to PublicKey
    console.log('👤 Converting user wallet to PublicKey...');
    if (!userWallet || typeof userWallet !== 'string') {
      throw new Error('Invalid user wallet address');
    }
    const userPublicKey = new PublicKey(userWallet);
    console.log('👤 User Wallet:', userPublicKey?.toString() || 'undefined');

    // Get or create user's token account
    console.log('📦 Getting or creating user token account...');
    const userTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      mintAuthority, // Mint authority pays for account creation
      mintAddress,
      userPublicKey
    );

    if (!userTokenAccount || !userTokenAccount.address) {
      console.error('❌ User token account is null or missing address');
      throw new Error('Failed to create or get user token account');
    }
    console.log('📦 User Token Account:', userTokenAccount.address?.toString() || 'undefined');

    // Convert amount to token units with proper decimals
    console.log('💰 Converting amount to token units...');
    const tokenAmount = parseJuzTokenAmount(amount);
    console.log(`💰 Minting ${amount} JUZ (${tokenAmount} units) to user`);

    // Mint tokens to user - THIS IS REAL BLOCKCHAIN TRANSACTION
    console.log('⛓️ Starting blockchain minting transaction...');
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

    if (!signature) {
      console.error('❌ Minting transaction returned null signature');
      throw new Error('Minting transaction failed - no signature returned');
    }

    console.log('✅ REAL MINTING SUCCESS! Transaction:', signature);

    // Return success response
    const response = {
      success: true,
      signature,
      amount,
      tokenAmount,
      userTokenAccount: userTokenAccount.address?.toString() || 'undefined',
      mintAddress: mintAddress?.toString() || 'undefined',
      explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
      message: `Successfully minted ${amount} JUZ tokens to your wallet!`
    };
    
    console.log('📤 Returning success response:', response);
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ FULL ERROR in POST /api/mint-tokens:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      error: error,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json(
      { 
        error: 'Minting failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Also handle GET for testing
export async function GET() {
  try {
    console.log('🔍 GET /api/mint-tokens - Testing API readiness');
    
    const mintAuthority = await loadMintAuthority();
    if (!mintAuthority || !mintAuthority.publicKey) {
      console.error('❌ Mint authority is null or missing publicKey in GET');
      throw new Error('Failed to load mint authority keypair');
    }
    
    const mintAddress = getJuzMintAddress();
    if (!mintAddress) {
      console.error('❌ Mint address is null in GET');
      throw new Error('Failed to get mint address');
    }
    
    const response = {
      status: 'JUZ Token Minting API Ready',
      mintAddress: mintAddress?.toString() || 'undefined',
      mintAuthority: mintAuthority.publicKey?.toString() || 'undefined',
      network: 'devnet',
      ready: true,
      timestamp: new Date().toISOString()
    };
    
    console.log('✅ API is ready:', response);
    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ FULL ERROR in GET /api/mint-tokens:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      error: error,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json(
      { 
        error: 'API not ready', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
