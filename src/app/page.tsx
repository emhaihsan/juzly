"use client";

import HeaderSection from "@/components/HeaderSection";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-10 space-y-6 flex-1">
        <HeaderSection />
        {/* Hero Section */}
        <section className="text-center py-16">
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center opacity-5">
              <div className="w-96 h-96 border border-white/20 rounded-full"></div>
              <div className="absolute w-64 h-64 border border-white/10 rounded-full"></div>
              <div className="absolute w-32 h-32 border border-white/5 rounded-full"></div>
            </div>
            <div className="relative z-10">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
                READ<span className="text-white/60">.</span>EARN
                <span className="text-white/60">.</span>GROW
              </h1>
              <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto leading-relaxed">
                Earn JUZ tokens by reading the Quran
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/quran"
                  className="group relative overflow-hidden bg-white text-black px-8 py-4 text-lg font-semibold transition-all duration-300 hover:bg-white/90"
                >
                  <span className="relative z-10">Start Reading</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </Link>
              </div>
            </div>
          </div>
        </section>
        {/* Features Grid */}
        <section className="grid md:grid-cols-3 gap-8">
          <div className="group cursor-pointer">
            <div className="border border-white/10 bg-white/5 p-8 h-full transition-all duration-300 hover:border-white/30 hover:bg-white/10">
              <div className="w-12 h-12 border border-white/30 flex items-center justify-center mb-6 group-hover:border-white transition-colors duration-300">
                <span className="text-2xl">📖</span>
              </div>
              <h3 className="text-xl font-bold mb-4">Read Quran</h3>
              <p className="text-white/70 mb-6 leading-relaxed">
                Immerse yourself in the Holy Quran with our clean,
                distraction-free interface designed for focused reading.
              </p>
              <Link
                href="/quran"
                className="inline-flex items-center text-white/90 hover:text-white transition-colors"
              >
                Start Reading →
              </Link>
            </div>
          </div>

          <div className="group cursor-pointer">
            <div className="border border-white/10 bg-white/5 p-8 h-full transition-all duration-300 hover:border-white/30 hover:bg-white/10">
              <div className="w-12 h-12 border border-white/30 flex items-center justify-center mb-6 group-hover:border-white transition-colors duration-300">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-bold mb-4">Earn Rewards</h3>
              <p className="text-white/70 mb-6 leading-relaxed">
                Receive JUZ tokens for every page completed. Build consistent
                reading habits while earning blockchain rewards.
              </p>
              <Link
                href="/rewards"
                className="inline-flex items-center text-white/90 hover:text-white transition-colors"
              >
                View Rewards →
              </Link>
            </div>
          </div>

          <div className="group cursor-pointer">
            <div className="border border-white/10 bg-white/5 p-8 h-full transition-all duration-300 hover:border-white/30 hover:bg-white/10">
              <div className="w-12 h-12 border border-white/30 flex items-center justify-center mb-6 group-hover:border-white transition-colors duration-300">
                <span className="text-2xl">💝</span>
              </div>
              <h3 className="text-xl font-bold mb-4">Give Back</h3>
              <p className="text-white/70 mb-6 leading-relaxed">
                Support Islamic causes with on-chain donations. Powered by
                Solana Pay for seamless, transparent giving.
              </p>
              <Link
                href="/donation"
                className="inline-flex items-center text-white/90 hover:text-white transition-colors"
              >
                Donate Now →
              </Link>
            </div>
          </div>
        </section>
        {/* How It Works */}
        <section className="border border-white/10 bg-white/5 p-8">
          <h2 className="text-3xl font-bold mb-12 text-center">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 border border-white/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="text-lg font-semibold mb-3">Connect Wallet</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Seamless Web3Auth integration with social login support
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 border border-white/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="text-lg font-semibold mb-3">Read Pages</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Minimum 60 seconds per page with active reading validation
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 border border-white/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="text-lg font-semibold mb-3">Earn Tokens</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Receive 0.05 JUZ tokens per completed page automatically
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 border border-white/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold">4</span>
              </div>
              <h3 className="text-lg font-semibold mb-3">Claim Rewards</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Mint tokens to blockchain and unlock NFT achievements
              </p>
            </div>
          </div>
        </section>
        {/* Solana Pay Section */}
        <section className="border border-white/10 bg-white/5 p-8">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-3xl font-bold">On-Chain Donations</h2>
              </div>
              <p className="text-white/80 text-lg mb-6 leading-relaxed">
                Make transparent, instant on-chain donations with QR codes and
                complete the payment in your wallet. Powered by Solana Pay.
              </p>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 border border-white/10">
                  <div className="text-xl mb-2">⚡</div>
                  <div className="text-sm font-medium">Instant</div>
                </div>
                <div className="text-center p-4 border border-white/10">
                  <div className="text-xl mb-2">🔒</div>
                  <div className="text-sm font-medium">Secure</div>
                </div>
                <div className="text-center p-4 border border-white/10">
                  <div className="text-xl mb-2">🌍</div>
                  <div className="text-sm font-medium">Global</div>
                </div>
              </div>
              <Link
                href="/donation"
                className="inline-flex items-center bg-white text-black px-6 py-3 font-semibold hover:bg-white/90 transition-colors"
              >
                Donate On-Chain →
              </Link>
            </div>
            <div className="flex-1 lg:flex-none">
              <div className="w-48 h-48 border border-white/20 flex items-center justify-center mx-auto">
                <span className="text-6xl">📱</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
