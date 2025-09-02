const {
  Connection,
  Keypair,
  PublicKey,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
} = require("@solana/web3.js");
const {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
} = require("@solana/spl-token");
const fs = require("fs");
const path = require("path");

// Configuration
const DEVNET_RPC = clusterApiUrl("devnet");
const DECIMALS = 6; // JUZ token will have 6 decimal places
const INITIAL_SUPPLY = 1000000; // 1M JUZ tokens for testing

async function deployJuzToken() {
  console.log("🚀 Deploying JUZ Token on Solana Devnet...\n");

  // Connect to devnet
  const connection = new Connection(DEVNET_RPC, "confirmed");
  console.log("✅ Connected to Solana Devnet");

  // Generate or load mint authority keypair
  let mintAuthority;
  const keyPath = path.join(__dirname, "juz-mint-authority.json");

  if (fs.existsSync(keyPath)) {
    console.log("📁 Loading existing mint authority keypair...");
    const secretKey = JSON.parse(fs.readFileSync(keyPath, "utf8"));
    mintAuthority = Keypair.fromSecretKey(Uint8Array.from(secretKey));
  } else {
    console.log("🔑 Generating new mint authority keypair...");
    mintAuthority = Keypair.generate();
    fs.writeFileSync(
      keyPath,
      JSON.stringify(Array.from(mintAuthority.secretKey))
    );
    console.log(`💾 Saved mint authority to: ${keyPath}`);
  }

  console.log(`🏦 Mint Authority: ${mintAuthority.publicKey.toString()}`);

  // Check/request airdrop for mint authority
  const balance = await connection.getBalance(mintAuthority.publicKey);
  console.log(`💰 Current balance: ${balance / LAMPORTS_PER_SOL} SOL`);

  if (balance < 0.1 * LAMPORTS_PER_SOL) {
    console.log("💸 Requesting airdrop...");
    try {
      const signature = await connection.requestAirdrop(
        mintAuthority.publicKey,
        2 * LAMPORTS_PER_SOL
      );
      await connection.confirmTransaction(signature);
      console.log("✅ Airdrop successful!");
    } catch (error) {
      console.log(
        "⚠️ Airdrop failed - you may need to manually fund the wallet"
      );
      console.log("Address:", mintAuthority.publicKey.toString());
    }
  }

  try {
    // Create the JUZ token mint
    console.log("\n🪙 Creating JUZ token mint...");
    const mintAddress = await createMint(
      connection,
      mintAuthority, // Payer
      mintAuthority.publicKey, // Mint authority
      mintAuthority.publicKey, // Freeze authority (optional)
      DECIMALS // Decimals
    );

    console.log(`✅ JUZ Token Mint Created: ${mintAddress.toString()}`);

    // Create associated token account for mint authority
    console.log("\n💼 Creating token account for mint authority...");
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      mintAuthority,
      mintAddress,
      mintAuthority.publicKey
    );

    console.log(`✅ Token Account: ${tokenAccount.address.toString()}`);

    // Mint initial supply
    console.log(
      `\n⚡ Minting initial supply of ${INITIAL_SUPPLY} JUZ tokens...`
    );
    const mintTx = await mintTo(
      connection,
      mintAuthority,
      mintAddress,
      tokenAccount.address,
      mintAuthority.publicKey,
      INITIAL_SUPPLY * Math.pow(10, DECIMALS) // Convert to smallest units
    );

    console.log(`✅ Minted tokens! Transaction: ${mintTx}`);

    // Save deployment info
    const deploymentInfo = {
      network: "devnet",
      mintAddress: mintAddress.toString(),
      mintAuthority: mintAuthority.publicKey.toString(),
      decimals: DECIMALS,
      initialSupply: INITIAL_SUPPLY,
      tokenAccount: tokenAccount.address.toString(),
      deployedAt: new Date().toISOString(),
      rpcEndpoint: DEVNET_RPC,
    };

    const infoPath = path.join(__dirname, "juz-deployment-info.json");
    fs.writeFileSync(infoPath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`\n📄 Deployment info saved to: ${infoPath}`);

    // Generate environment variable
    console.log("\n🔧 Environment Variables for your .env file:");
    console.log(`NEXT_PUBLIC_JUZ_TOKEN_MINT_ADDRESS=${mintAddress.toString()}`);
    console.log(
      `JUZ_MINT_AUTHORITY_PRIVATE_KEY=${JSON.stringify(
        Array.from(mintAuthority.secretKey)
      )}`
    );

    console.log("\n✅ JUZ Token deployment complete!");
    console.log("\n📋 Summary:");
    console.log(`   Token Mint: ${mintAddress.toString()}`);
    console.log(`   Decimals: ${DECIMALS}`);
    console.log(`   Initial Supply: ${INITIAL_SUPPLY} JUZ`);
    console.log(`   Network: Solana Devnet`);
    console.log(
      `   Explorer: https://explorer.solana.com/address/${mintAddress.toString()}?cluster=devnet`
    );
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

// Run deployment
deployJuzToken()
  .then(() => {
    console.log("\n🎉 Deployment script completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Deployment script failed:", error);
    process.exit(1);
  });
