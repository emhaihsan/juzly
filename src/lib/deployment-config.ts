import { PublicKey } from '@solana/web3.js';

export interface DeploymentConfig {
  network: 'devnet' | 'mainnet';
  mintAddress: string;
  mintAuthority: string;
  deploymentTime: string;
  initialSupply: number;
  decimals: number;
  explorer: string;
}

// JUZ Token Deployment Configuration
export const JUZ_DEPLOYMENT_CONFIG: DeploymentConfig = {
  "network": "devnet",
  "mintAddress": "qLHj71TYT9udjf25Lo4qAkCEEG12qiCwpQQnU1dojHY",
  "mintAuthority": "CEWxm2fReUAnycavAaM7FuUoFgLJyCFbuyxY8iT8CRAz",
  "deploymentTime": "2025-09-02T05:38:46.261Z",
  "initialSupply": 0,
  "decimals": 6,
  "explorer": "https://explorer.solana.com/address/qLHj71TYT9udjf25Lo4qAkCEEG12qiCwpQQnU1dojHY?cluster=devnet"
}

// Export convenient getters
export const getJuzMintAddress = (): PublicKey => {
  return new PublicKey(JUZ_DEPLOYMENT_CONFIG.mintAddress);
};

export const getMintAuthorityAddress = (): PublicKey => {
  return new PublicKey(JUZ_DEPLOYMENT_CONFIG.mintAuthority);
};

export const getJuzDecimals = (): number => {
  return JUZ_DEPLOYMENT_CONFIG.decimals;
};

export const getTotalSupply = (): number => {
  return JUZ_DEPLOYMENT_CONFIG.initialSupply / Math.pow(10, JUZ_DEPLOYMENT_CONFIG.decimals);
};

export const getExplorerUrl = (): string => {
  return JUZ_DEPLOYMENT_CONFIG.explorer;
};

// Helper function to format token amounts
export const formatJuzTokenAmount = (rawAmount: number): number => {
  return rawAmount / Math.pow(10, JUZ_DEPLOYMENT_CONFIG.decimals);
};

// Helper function to convert display amount to token units
export const parseJuzTokenAmount = (displayAmount: number): number => {
  return Math.floor(displayAmount * Math.pow(10, JUZ_DEPLOYMENT_CONFIG.decimals));
};
