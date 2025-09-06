# 🌙 Juzly - Web3-Based Quran Reading Platform

> Revolutionary read-to-earn Islamic platform built with Web3Auth and Solana blockchain

## 🎯 Project Goals

**Juzly** aims to revolutionize Islamic digital experiences by combining spiritual practice with Web3 technology. Our core mission is to:

- **Incentivize Quran Reading**: Create a reward system that encourages consistent Quran reading habits
- **Bridge Web2 to Web3**: Provide seamless wallet onboarding for users new to blockchain technology
- **Build Islamic Web3 Community**: Foster a global community of Muslims engaging with blockchain technology
- **Demonstrate Real Utility**: Show practical Web3 applications beyond speculation and trading
- **Preserve Islamic Values**: Maintain respect for religious content while innovating with technology

## ✨ Key Features

### 🔗 Web3 Integration

- **Seamless Wallet Connection**: One-click wallet creation and login via Web3Auth
- **Real Token Rewards**: Earn JUZ tokens (SPL tokens) minted directly to your Solana wallet
- **Blockchain Transparency**: All transactions and rewards are verifiable on Solana blockchain
- **Cross-Platform Compatibility**: Works with any Solana-compatible wallet

### 📖 Reading Experience

- **Interactive Quran Reader**: Clean, distraction-free interface for reading Holy Quran
- **Smart Timer System**: Enforces minimum reading times to ensure meaningful engagement
- **Progress Tracking**: Track daily, weekly, and monthly reading progress
- **Achievement System**: Unlock NFT badges for reading milestones

### 🏆 Gamification (Todo)

- **Live Leaderboards**: Weekly, monthly, and all-time rankings
- **Token Economy**: Earn 0.05 JUZ tokens per page completed
- **NFT Achievements**: Special badges for milestones (First Week, Century Club, etc.)
- **Marketplace**: Redeem tokens for Islamic merchandise and digital goods

## 🔐 Web3Auth Integration

**Key Integration Points:**

1. **Wallet Creation**: Users can create Solana wallets using social logins (Google, Facebook, etc.)
2. **Seamless Authentication**: No seed phrases or complex wallet setup required
3. **Transaction Signing**: Automatic transaction signing for token minting and transfers
4. **Balance Management**: Real-time display of both pending rewards and blockchain balances

**Web3Auth Benefits:**

- **User-Friendly**: Familiar social login experience
- **Cross-Platform**: Works on web, mobile, and desktop
- **Developer-Friendly**: Simple SDK integration with comprehensive documentation

### Blockchain Architecture

```
User Reading Session → Local Reward Accumulation → Mint to Blockchain
                                                 ↓
                               Solana SPL Token (JUZ) → User's Wallet
```

## 🚀 Running the Demo

### Prerequisites

- **Node.js 18+** (Download from [nodejs.org](https://nodejs.org/))
- **Package Manager**: npm, yarn, pnpm, or bun
- **Web3Auth Account**: Free account at [Web3Auth Dashboard](https://dashboard.web3auth.io/)

### Step 1: Environment Setup

1. **Clone the repository:**

```bash
git clone https://github.com/emhaihsan/juzly.git
cd juzly
```

2. **Install dependencies:**

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Configure Web3Auth:**

   - Visit [Web3Auth Dashboard](https://dashboard.web3auth.io/)
   - Create a new project
   - Select "Solana" as the blockchain
   - Add `http://localhost:3000` to allowed origins
   - Copy your Client ID

4. **Create environment file:**

```bash
# Create .env.local file
cp .env.example .env.local
```

5. **Add your Web3Auth credentials to `.env.local`:**

```env
NEXT_PUBLIC_WEB3AUTH_CLIENT_ID=your_web3auth_client_id_here
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
```

### Step 2: Run the Application

```bash
# Start development server
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 3: Walkthrough

1. **Connect Wallet**:

   - Click "Connect Wallet" in the top navigation
   - Choose your preferred social login (Google, Facebook, etc.)
   - Web3Auth will create a Solana wallet for you automatically

2. **Start Reading**:

   - Navigate to "Quran" section
   - Select any page to start reading
   - Timer will start automatically (30-60 seconds minimum per page)
   - Complete the reading session to earn rewards

3. **Claim Rewards**:

   - Go to "Rewards" page to see your pending JUZ tokens
   - Click "Mint to Blockchain" to convert local rewards to real tokens
   - Tokens will be minted directly to your Solana wallet

4. **Check Leaderboard (Todo)**:

   - Visit "Leaderboard" to see your ranking
   - View weekly, monthly, and all-time statistics
   - See achievement badges earned by you and other users

5. **Use Marketplace (Todo)**:
   - Browse "Marketplace" for available items
   - Redeem JUZ tokens for Islamic merchandise
   - Transactions are processed on Solana blockchain

### Step 4: Verify on Blockchain

- **View Tokens**: Check your wallet balance in any Solana wallet app
- **Transaction History**: All minting and transfers are visible on [Solscan](https://solscan.io/) (Devnet)
- **Token Details**: JUZ token contract and metadata are verifiable on-chain

## 🛠️ Technical Architecture

### Frontend Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS for responsive design
- **State Management**: React hooks and localStorage

### Blockchain Integration

- **Network**: Solana Devnet (easily switchable to Mainnet)
- **Wallet**: Web3Auth Modal SDK
- **Token Standard**: SPL Token (JUZ)
- **RPC**: Solana Web3.js for blockchain interactions

### Key Components

```
src/
├── app/                    # Next.js pages and API routes
│   ├── api/mint-tokens/   # Token minting API endpoint
│   ├── quran/             # Quran reading interface
│   ├── rewards/           # Rewards dashboard with Web3Auth
│   └── leaderboard/       # Community rankings
├── components/            # Reusable UI components
├── lib/                   # Blockchain utilities and token logic
└── web3authContext.ts     # Web3Auth configuration and providers
```

## 🎮 Features

### Blockchain Integration

- ✅ **Actual Token Minting**: JUZ tokens are real SPL tokens on Solana
- ✅ **Wallet Integration**: Full Web3Auth wallet functionality
- ✅ **Transaction Verification**: All actions are blockchain-verifiable
- ✅ **Cross-Wallet Compatibility**: Works with Phantom, Solflare, etc.

### User Experience

- ✅ **Zero Web3 Knowledge Required**: Social login handles complexity
- ✅ **Instant Onboarding**: No seed phrases or wallet downloads
- ✅ **Real-Time Updates**: Live balance and transaction notifications
- ✅ **Mobile Responsive**: Works on all devices

### Islamic Content Integration

- ✅ **Authentic Quran Text**: Sourced from Al-Quran Cloud API
- ✅ **Respectful Implementation**: Maintains Islamic values and etiquette
- ✅ **Community Building**: Leaderboards foster healthy competition
- ✅ **Educational Value**: Encourages consistent Quran reading

## 📞 Support & Contact

- **GitHub**: [github.com/emhaihsan/juzly](https://github.com/emhaihsan/juzly)
- **Documentation**: This README and inline code comments
- **Issues**: Use GitHub Issues for bug reports and feature requests

## 🙏 Acknowledgments

- **Web3Auth Team**: For providing seamless wallet infrastructure
- **Solana Labs**: For fast and affordable blockchain platform
- **Al-Quran Cloud**: For authentic Quran text API
- **Muslim Developer Community**: For inspiration and feedback

---

**🌙 Made with ❤️ for the global Muslim community and Web3 adoption**
