import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Metaplex, keypairIdentity, bundlrStorage } from '@metaplex-foundation/js';

// Achievement NFT Types
export type AchievementType = 
  | 'first_week'      // 7 pages
  | 'monthly_reader'  // 30 pages  
  | 'century_club'    // 100 pages
  | 'diamond_reader'  // 300 pages
  | 'quran_complete'  // 604 pages
  | 'weekly_top3'     // Top 3 weekly
  | 'monthly_top3';   // Top 3 monthly

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

// NFT Metadata Templates
export const ACHIEVEMENT_METADATA: Record<AchievementType, Omit<NFTMetadata, 'image'>> = {
  first_week: {
    name: "First Week Achievement",
    description: "Completed reading 7 pages of the Holy Quran in your first week on Juzly",
    attributes: [
      { trait_type: "Achievement", value: "First Week" },
      { trait_type: "Pages Required", value: 7 },
      { trait_type: "Rarity", value: "Bronze" },
      { trait_type: "Category", value: "Milestone" }
    ]
  },
  monthly_reader: {
    name: "Monthly Reader Achievement", 
    description: "Dedicated reader who completed 30 pages of the Holy Quran",
    attributes: [
      { trait_type: "Achievement", value: "Monthly Reader" },
      { trait_type: "Pages Required", value: 30 },
      { trait_type: "Rarity", value: "Silver" },
      { trait_type: "Category", value: "Milestone" }
    ]
  },
  century_club: {
    name: "Century Club Achievement",
    description: "Elite reader who completed 100 pages of the Holy Quran",
    attributes: [
      { trait_type: "Achievement", value: "Century Club" },
      { trait_type: "Pages Required", value: 100 },
      { trait_type: "Rarity", value: "Gold" },
      { trait_type: "Category", value: "Milestone" }
    ]
  },
  diamond_reader: {
    name: "Diamond Reader Achievement",
    description: "Exceptional reader who completed 300 pages of the Holy Quran",
    attributes: [
      { trait_type: "Achievement", value: "Diamond Reader" },
      { trait_type: "Pages Required", value: 300 },
      { trait_type: "Rarity", value: "Diamond" },
      { trait_type: "Category", value: "Milestone" }
    ]
  },
  quran_complete: {
    name: "Quran Completion Achievement",
    description: "Legendary achievement for completing all 604 pages of the Holy Quran",
    attributes: [
      { trait_type: "Achievement", value: "Quran Complete" },
      { trait_type: "Pages Required", value: 604 },
      { trait_type: "Rarity", value: "Legendary" },
      { trait_type: "Category", value: "Completion" }
    ]
  },
  weekly_top3: {
    name: "Weekly Top 3 Achievement",
    description: "Ranked in top 3 readers for the week",
    attributes: [
      { trait_type: "Achievement", value: "Weekly Top 3" },
      { trait_type: "Rarity", value: "Special" },
      { trait_type: "Category", value: "Ranking" },
      { trait_type: "Period", value: "Weekly" }
    ]
  },
  monthly_top3: {
    name: "Monthly Top 3 Achievement", 
    description: "Ranked in top 3 readers for the month",
    attributes: [
      { trait_type: "Achievement", value: "Monthly Top 3" },
      { trait_type: "Rarity", value: "Special" },
      { trait_type: "Category", value: "Ranking" },
      { trait_type: "Period", value: "Monthly" }
    ]
  }
};

// NFT Image URLs (placeholder - replace with actual hosted images)
export const ACHIEVEMENT_IMAGES: Record<AchievementType, string> = {
  first_week: "https://arweave.net/juzly-first-week-nft.png",
  monthly_reader: "https://arweave.net/juzly-monthly-reader-nft.png", 
  century_club: "https://arweave.net/juzly-century-club-nft.png",
  diamond_reader: "https://arweave.net/juzly-diamond-reader-nft.png",
  quran_complete: "https://arweave.net/juzly-quran-complete-nft.png",
  weekly_top3: "https://arweave.net/juzly-weekly-top3-nft.png",
  monthly_top3: "https://arweave.net/juzly-monthly-top3-nft.png"
};

export class JuzlyNFTManager {
  private connection: Connection;
  private metaplex: Metaplex;

  constructor(rpcUrl?: string) {
    this.connection = new Connection(rpcUrl || clusterApiUrl('devnet'));
    this.metaplex = Metaplex.make(this.connection)
      .use(bundlrStorage({
        address: 'https://devnet.bundlr.network',
        providerUrl: rpcUrl || clusterApiUrl('devnet'),
        timeout: 60000,
      }));
  }

  // Set wallet for transactions
  setWallet(wallet: any) {
    this.metaplex.use(keypairIdentity(wallet));
  }

  // Check if user already has specific achievement NFT
  async hasAchievementNFT(
    userPublicKey: PublicKey, 
    achievementType: AchievementType
  ): Promise<boolean> {
    try {
      const nfts = await this.metaplex.nfts().findAllByOwner({ owner: userPublicKey });
      
      return nfts.some(nft => {
        const metadata = nft.json;
        return metadata?.attributes?.some((attr: any) => 
          attr.trait_type === 'Achievement' && 
          attr.value === ACHIEVEMENT_METADATA[achievementType].attributes[0].value
        );
      });
    } catch (error) {
      console.error('Error checking achievement NFT:', error);
      return false;
    }
  }

  // Mint achievement NFT
  async mintAchievementNFT(
    recipientPublicKey: PublicKey,
    achievementType: AchievementType,
    additionalAttributes?: Array<{ trait_type: string; value: string | number }>
  ) {
    try {
      // Check if user already has this achievement
      const hasAchievement = await this.hasAchievementNFT(recipientPublicKey, achievementType);
      if (hasAchievement) {
        throw new Error('User already has this achievement NFT');
      }

      // Prepare metadata
      const baseMetadata = ACHIEVEMENT_METADATA[achievementType];
      const metadata: NFTMetadata = {
        ...baseMetadata,
        image: ACHIEVEMENT_IMAGES[achievementType],
        attributes: [
          ...baseMetadata.attributes,
          { trait_type: "Minted Date", value: new Date().toISOString() },
          { trait_type: "Platform", value: "Juzly" },
          ...(additionalAttributes || [])
        ]
      };

      // Upload metadata to Arweave
      const { uri } = await this.metaplex.nfts().uploadMetadata(metadata);

      // Create NFT
      const { nft } = await this.metaplex.nfts().create({
        uri,
        name: metadata.name,
        sellerFeeBasisPoints: 0, // No royalties
        symbol: 'JUZLY',
        creators: [
          {
            address: this.metaplex.identity().publicKey,
            share: 100,
          },
        ],
        isMutable: false,
        maxSupply: null,
        tokenOwner: recipientPublicKey,
      });

      return {
        success: true,
        nft,
        metadata,
        mintAddress: nft.address.toString(),
      };
    } catch (error) {
      console.error('Error minting achievement NFT:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Get user's achievement NFTs
  async getUserAchievements(userPublicKey: PublicKey) {
    try {
      const nfts = await this.metaplex.nfts().findAllByOwner({ owner: userPublicKey });
      
      const achievements = nfts.filter(nft => {
        const metadata = nft.json;
        return metadata?.attributes?.some((attr: any) => 
          attr.trait_type === 'Platform' && attr.value === 'Juzly'
        );
      });

      return achievements.map(nft => ({
        mintAddress: nft.address.toString(),
        name: nft.name,
        metadata: nft.json,
        image: nft.json?.image,
      }));
    } catch (error) {
      console.error('Error fetching user achievements:', error);
      return [];
    }
  }

  // Batch mint for weekly/monthly top performers
  async batchMintRankingNFTs(
    recipients: Array<{
      publicKey: PublicKey;
      rank: number;
      period: 'weekly' | 'monthly';
      pagesRead: number;
    }>
  ) {
    const results = [];
    
    for (const recipient of recipients) {
      try {
        const achievementType: AchievementType = 
          recipient.period === 'weekly' ? 'weekly_top3' : 'monthly_top3';
        
        const additionalAttributes = [
          { trait_type: "Rank", value: recipient.rank },
          { trait_type: "Pages Read", value: recipient.pagesRead },
          { trait_type: "Period", value: recipient.period }
        ];

        const result = await this.mintAchievementNFT(
          recipient.publicKey,
          achievementType,
          additionalAttributes
        );

        results.push({
          recipient: recipient.publicKey.toString(),
          rank: recipient.rank,
          ...result
        });
      } catch (error) {
        results.push({
          recipient: recipient.publicKey.toString(),
          rank: recipient.rank,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return results;
  }
}

// Helper function to determine eligible achievements based on pages read
export function getEligibleAchievements(pagesRead: number): AchievementType[] {
  const achievements: AchievementType[] = [];
  
  if (pagesRead >= 7) achievements.push('first_week');
  if (pagesRead >= 30) achievements.push('monthly_reader');
  if (pagesRead >= 100) achievements.push('century_club');
  if (pagesRead >= 300) achievements.push('diamond_reader');
  if (pagesRead >= 604) achievements.push('quran_complete');
  
  return achievements;
}

// Helper function to check if user should receive NFT
export function shouldMintAchievementNFT(
  currentPages: number, 
  previousPages: number
): AchievementType | null {
  const currentAchievements = getEligibleAchievements(currentPages);
  const previousAchievements = getEligibleAchievements(previousPages);
  
  // Find the new achievement (if any)
  const newAchievement = currentAchievements.find(
    achievement => !previousAchievements.includes(achievement)
  );
  
  return newAchievement || null;
}
