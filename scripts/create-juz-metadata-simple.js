const {
  Connection,
  Keypair,
  clusterApiUrl,
  PublicKey,
} = require("@solana/web3.js");
const {
  Metaplex,
  keypairIdentity,
  bundlrStorage,
} = require("@metaplex-foundation/js");
const fs = require("fs");
const os = require("os");
const path = require("path");

// Load existing keypair
function loadKeypairFromFile(filePath) {
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.join(os.homedir(), filePath.replace(/^~/, ""));
  const secretKey = Uint8Array.from(
    JSON.parse(fs.readFileSync(absolutePath, "utf8"))
  );
  return Keypair.fromSecretKey(secretKey);
}

const SOLANA_KEYPAIR_PATH =
  process.env.SOLANA_KEYPAIR_PATH ||
  path.join(os.homedir(), ".config/solana/id.json");
const JUZ_MINT_ADDRESS = "5sNd52LXqZf4qWX5tkqwU5xKnwZVLRDEoV2bkdQWtzmB";

async function createSimpleJuzTokenMetadata() {
  console.log("🏷️ Creating Simple JUZ Token Metadata...\n");

  try {
    // Load mint authority
    const mintAuthority = loadKeypairFromFile(SOLANA_KEYPAIR_PATH);
    console.log("✅ Mint Authority:", mintAuthority.publicKey.toString());

    // Setup connection and Metaplex
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    const metaplex = Metaplex.make(connection).use(
      keypairIdentity(mintAuthority)
    );

    console.log("📝 Token Metadata:");
    console.log("• Name: Juzly");
    console.log("• Symbol: JUZ");
    console.log("• Storage: On-chain only (no external files)");

    console.log("\n🔗 Creating on-chain metadata account...");

    // Create metadata with minimal data - no external URI needed
    const mintAddress = new PublicKey(JUZ_MINT_ADDRESS);

    const { response } = await metaplex.nfts().create({
      mint: mintAddress,
      name: "Juzly",
      symbol: "JUZ",
      uri: "", // Empty URI for simple on-chain storage
      sellerFeeBasisPoints: 0, // No royalties for utility token
      isMutable: true, // Allow future updates
    });

    console.log("✅ Metadata created! Transaction:", response.signature);

    console.log("\n🎉 Simple JUZ Token Metadata Setup Complete!");
    console.log("=".repeat(50));
    console.log("• Token Name: Juzly");
    console.log("• Symbol: JUZ");
    console.log("• Storage: On-chain only");
    console.log("• Cost: ~0.01 SOL");
    console.log("• Mint Address:", JUZ_MINT_ADDRESS);
    console.log("• Transaction:", response.signature);
    console.log(
      "• Explorer:",
      `https://explorer.solana.com/address/${JUZ_MINT_ADDRESS}?cluster=devnet`
    );
    console.log("=".repeat(50));

    console.log(
      "\n⏰ Please wait 1-2 minutes for Solana Explorer to update..."
    );
  } catch (error) {
    console.error("❌ Metadata creation failed:", error);

    if (error.message.includes("Metadata account already exists")) {
      console.log(
        "\n💡 Metadata already exists. Token should show properly on Explorer."
      );
      process.exit(0);
    }

    process.exit(1);
  }
}

// Run metadata creation
createSimpleJuzTokenMetadata();
