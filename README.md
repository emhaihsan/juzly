# 🌙 Juzly - Read-to-Earn Islamic Platform

> Revolutionary blockchain platform connecting Islamic spirituality with Web3 rewards

## ✨ Overview

Juzly is an innovative read-to-earn platform that rewards users with JUZ tokens for reading the Holy Quran. Built on Solana blockchain with Web3Auth integration, it combines Islamic spirituality with modern Web3 technology to create a meaningful and rewarding reading experience.

## 🚀 Features

- **📖 Quran Reading**: Clean, distraction-free interface for reading the Holy Quran
- **🪙 JUZ Token Rewards**: Earn blockchain tokens for completed reading sessions
- **⏱️ Smart Reading Timer**: Enforces minimum reading times (30s-60s per page)
- **🏆 Active Leaderboard**: Weekly, monthly, and all-time rankings
- **🎨 NFT Achievements**: Milestone NFTs for reading accomplishments
- **🛍️ Marketplace**: Redeem JUZ tokens for Islamic merchandise
- **🔗 Web3 Integration**: Solana wallet connectivity via Web3Auth

## 🎯 Reward System

### Reading Rewards

- **Per Page**: 0.050000 JUZ (1/20 token per page)
- **Time Requirements**: 30 seconds (pages 1-2), 60 seconds (pages 3+)
- **Full Juz**: 1.000 JUZ for completing 20 pages
- **Special Bonuses**: +0.5 - 1.0 JUZ for Al-Fatihah & completion
- **Daily Limit**: 20 minutes maximum per day

### NFT Achievements

- 🥉 **First Week**: 7 pages read
- 🥈 **Monthly Reader**: 30 pages read
- 🥇 **Century Club**: 100 pages read
- 💎 **Diamond Reader**: 300 pages read
- 👑 **Quran Complete**: 604 pages read
- 🏆 **Top Rankings**: Weekly/Monthly Top 3

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Blockchain**: Solana (Devnet)
- **Wallet**: Web3Auth Modal
- **Token Standard**: SPL Token (JUZ)
- **NFTs**: Metaplex Token Metadata
- **API**: Al-Quran Cloud API

## 🏁 Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/emhaihsan/juzly.git
cd juzly

# Install dependencies
npm install
# or
yarn install
# or
pnpm install

# Run development server
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── leaderboard/       # Active leaderboard with rankings
│   ├── marketplace/       # JUZ token redemption store
│   ├── quran/            # Quran reading interface
│   │   └── mushaf/       # Individual page reader
│   └── rewards/          # User rewards dashboard
├── components/            # Reusable React components
│   └── providers/        # Web3Auth providers
└── lib/                  # Utility functions and configs
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_WEB3AUTH_CLIENT_ID=your_web3auth_client_id
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
```

### Web3Auth Setup

1. Create account at [Web3Auth Dashboard](https://dashboard.web3auth.io/)
2. Create new project for Solana
3. Add your domain to allowed origins
4. Copy Client ID to environment variables

## 🎮 Usage

1. **Connect Wallet**: Use Web3Auth to connect Solana wallet
2. **Start Reading**: Navigate to Quran section and select Juz/page
3. **Earn Rewards**: Complete reading sessions to earn JUZ tokens
4. **Check Rankings**: View your position on active leaderboard
5. **Redeem Rewards**: Use marketplace to exchange tokens for merchandise
6. **Collect NFTs**: Achieve milestones to earn special NFTs

## 🏆 Hackathon Information

Built for the **MetaMask Embedded Wallets Dev Cook-Off** hackathon, demonstrating:

- Innovative Web3 use case in Islamic tech
- Comprehensive read-to-earn mechanics
- Real blockchain token rewards
- NFT achievement system
- Active community leaderboards

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Al-Quran Cloud API](https://alquran.cloud/) for Quran text data
- [Web3Auth](https://web3auth.io/) for seamless wallet integration
- [Solana Labs](https://solanalabs.com/) for blockchain infrastructure
- [Metaplex](https://www.metaplex.com/) for NFT standards

---

**Made with ❤️ for the global Muslim community**
