const {
  Connection,
  Keypair,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
} = require("@solana/web3.js");
const {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} = require("@solana/spl-token");
const fs = require("fs");
const os = require("os");
const path = require("path");

// Helper to load an existing Solana CLI keypair
function loadKeypairFromFile(filePath) {
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.join(os.homedir(), filePath.replace(/^~/, ""));
  const secretKey = Uint8Array.from(
    JSON.parse(fs.readFileSync(absolutePath, "utf8"))
  );
  return Keypair.fromSecretKey(secretKey);
}

// Path to your Solana CLI keypair (default: ~/.config/solana/id.json)
const SOLANA_KEYPAIR_PATH =
  process.env.SOLANA_KEYPAIR_PATH ||
  path.join(os.homedir(), ".config/solana/id.json");

// Load existing keypair
const mintAuthority = loadKeypairFromFile(SOLANA_KEYPAIR_PATH);

// Solana devnet connection
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

async function deployJuzToken() {
  console.log("🚀 Starting JUZ Token deployment on Solana Devnet...\n");

  try {
    // Step 1: Use existing mint authority keypair
    console.log("📝 Step 1: Using existing mint authority keypair...");
    console.log(
      "✅ Mint Authority Public Key:",
      mintAuthority.publicKey.toString()
    );

    // Step 2: Check SOL balance
    console.log("\n💰 Step 2: Checking SOL balance for deployment...");
    const balance = await connection.getBalance(mintAuthority.publicKey);
    console.log("💰 Current balance:", balance / LAMPORTS_PER_SOL, "SOL");
    if (balance < 0.05 * LAMPORTS_PER_SOL) {
      console.warn(
        "⚠️ Insufficient SOL! You need at least ~0.05 SOL in the mint authority wallet to deploy the token."
      );
      console.warn(
        "Send devnet SOL to:",
        mintAuthority.publicKey.toString(),
        "\nYou can use https://solfaucet.com/"
      );
      process.exit(1);
    }

    // Step 3: Create JUZ token mint
    console.log("\n🪙 Step 3: Creating JUZ token mint...");
    const mint = await createMint(
      connection,
      mintAuthority, // Payer
      mintAuthority.publicKey, // Mint authority
      null, // Freeze authority (none)
      6 // Decimals
    );

    console.log("✅ JUZ Token Mint created!");
    console.log("🔗 Mint Address:", mint.toString());

    // Step 4: Create associated token account for mint authority
    console.log("\n💼 Step 4: Creating token account for mint authority...");
    const mintAuthorityTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      mintAuthority,
      mint,
      mintAuthority.publicKey
    );

    console.log(
      "✅ Token account created:",
      mintAuthorityTokenAccount.address.toString()
    );

    // Step 5: Token mint created with 0 initial supply
    console.log("\n✅ Step 5: Token mint created with 0 initial supply");
    console.log(
      "📋 Tokens will only be minted when distributing rewards to users"
    );

    // Step 6: Save configuration
    console.log("\n💾 Step 6: Saving deployment configuration...");

    const deploymentConfig = {
      network: "devnet",
      mintAddress: mint.toString(),
      mintAuthority: mintAuthority.publicKey.toString(),
      deploymentTime: new Date().toISOString(),
      initialSupply: 0, // Start with 0 supply
      decimals: 6,
      explorer: `https://explorer.solana.com/address/${mint.toString()}?cluster=devnet`,
    };

    // Save deployment config
    fs.writeFileSync(
      "juz-deployment-config.json",
      JSON.stringify(deploymentConfig, null, 2)
    );

    console.log("\n🎉 JUZ Token Deployment Complete!");
    console.log("=".repeat(50));
    console.log("📋 Deployment Summary:");
    console.log("• Mint Address:", mint.toString());
    console.log("• Network: Solana Devnet");
    console.log("• Initial Supply: 0 JUZ (rewards-only minting)");
    console.log("• Decimals: 6");
    console.log("• Explorer:", deploymentConfig.explorer);
    console.log("=".repeat(50));

    console.log("\n📝 Next Steps:");
    console.log("1. Add NEXT_PUBLIC_JUZ_TOKEN_MINT_ADDRESS to your .env.local");
    console.log(
      "2. Keep your Solana keypair file secure (DO NOT commit to git)"
    );
    console.log("3. Test wallet connection and token operations");

    console.log("\n🔧 Environment Variable:");
    console.log(`NEXT_PUBLIC_JUZ_TOKEN_MINT_ADDRESS=${mint.toString()}`);
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

// Run deployment
deployJuzToken();
