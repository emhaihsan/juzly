"use client";

import HeaderSection from "@/components/HeaderSection";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:py-10 space-y-6">
        <HeaderSection />

        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Quran Card */}
          <div className="rounded-xl border border-black/10 bg-white p-6 shadow-sm flex flex-col">
            <div className="text-4xl mb-3">📖</div>
            <h2 className="text-xl font-semibold">Read Quran</h2>
            <p className="text-sm text-black/70 mt-1 flex-1">
              Start reading the Holy Quran with a clean and comfortable
              interface. Earn JUZ tokens for every page you read.
            </p>
            <div className="mt-auto pt-4">
              <Link
                href="/quran"
                className="inline-flex items-center rounded-md border border-black px-4 py-2 text-sm font-medium hover:bg-black hover:text-white transition-colors"
              >
                Start Reading
              </Link>
            </div>
          </div>

          {/* Marketplace Card */}
          <div className="rounded-xl border border-black/10 bg-gradient-to-br from-purple-50 to-blue-50 p-6 shadow-sm flex flex-col">
            <div className="text-4xl mb-3">🛍️</div>
            <h2 className="text-xl font-semibold">JUZ Marketplace</h2>
            <p className="text-sm text-black/70 mt-1 flex-1">
              Exchange JUZ tokens for Islamic merchandise, digital NFTs, and
              charitable donations.
            </p>
            <div className="mt-auto pt-4">
              <Link
                href="/marketplace"
                className="inline-flex items-center rounded-md bg-black text-white px-4 py-2 text-sm font-medium hover:bg-black/80 transition-colors"
              >
                View Marketplace
              </Link>
            </div>
          </div>

          {/* Leaderboard Card */}
          <div className="rounded-xl border border-black/10 bg-gradient-to-br from-yellow-50 to-orange-50 p-6 shadow-sm flex flex-col">
            <div className="text-4xl mb-3">🏆</div>
            <h2 className="text-xl font-semibold">Leaderboard</h2>
            <p className="text-sm text-black/70 mt-1 flex-1">
              View Quran reading rankings and earn NFT achievements for your
              best accomplishments.
            </p>
            <div className="mt-auto pt-4">
              <Link
                href="/leaderboard"
                className="inline-flex items-center rounded-md border border-orange-600 text-orange-600 px-4 py-2 text-sm font-medium hover:bg-orange-600 hover:text-white transition-colors"
              >
                View Rankings
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="rounded-xl border border-black/10 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">
            🚀 How Read-to-Earn Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-black/5">
              <div className="text-3xl mb-2">📖</div>
              <div className="font-medium">1. Read Quran</div>
              <div className="text-sm text-black/60">
                Minimum 1 minute per page
              </div>
            </div>
            <div className="text-center p-4 rounded-lg bg-black/5">
              <div className="text-3xl mb-2">🪙</div>
              <div className="font-medium">2. Earn JUZ</div>
              <div className="text-sm text-black/60">
                1/20 JUZ per page + bonuses
              </div>
            </div>
            <div className="text-center p-4 rounded-lg bg-black/5">
              <div className="text-3xl mb-2">🎨</div>
              <div className="font-medium">3. Get NFTs</div>
              <div className="text-sm text-black/60">
                Achievement milestones
              </div>
            </div>
            <div className="text-center p-4 rounded-lg bg-black/5">
              <div className="text-3xl mb-2">🛍️</div>
              <div className="font-medium">4. Exchange Rewards</div>
              <div className="text-sm text-black/60">
                Merchandise & donations
              </div>
            </div>
          </div>
        </section>

        {/* Solana Pay Donation Section */}
        <section className="rounded-xl border border-black/10 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                💝 Solana Pay Donations
                <span className="text-xs bg-emerald-500 text-white px-2 py-1 rounded-full">
                  NEW
                </span>
              </h2>
              <p className="text-sm text-black/70 mt-1">
                Make charitable donations using Solana Pay QR codes - seamless,
                fast, and transparent
              </p>
            </div>
            <div className="text-4xl">📱</div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 rounded-lg bg-white/50">
              <div className="text-2xl mb-1">⚡</div>
              <div className="text-sm font-medium">Instant QR</div>
              <div className="text-xs text-black/60">
                Generate payment codes
              </div>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/50">
              <div className="text-2xl mb-1">🔒</div>
              <div className="text-sm font-medium">Secure</div>
              <div className="text-xs text-black/60">Web3Auth protected</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/50">
              <div className="text-2xl mb-1">🌍</div>
              <div className="text-sm font-medium">Global</div>
              <div className="text-xs text-black/60">
                Support Islamic causes
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-black/60">
              <p className="mb-1">
                <strong>Featured Organizations:</strong> Juzly Development,
                Education for All, Humanitarian Aid
              </p>
              <p className="text-xs">
                "The believer's shade on the Day of Resurrection will be their
                charity" - Prophet Muhammad ﷺ
              </p>
            </div>
            <Link
              href="/donation"
              className="ml-4 inline-flex items-center rounded-md bg-emerald-600 text-white px-6 py-3 text-sm font-medium hover:bg-emerald-700 transition-colors"
            >
              Make Donation →
            </Link>
          </div>
        </section>

        {/* Overview Juzly */}
        <section className="rounded-xl border border-black/10 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Why Juzly?</h2>
          <ul className="mt-3 space-y-2 text-sm text-black/80 list-disc pl-5">
            <li>
              <strong>Read-to-Earn</strong> — earn JUZ tokens and NFTs for every
              Quran reading activity.
            </li>
            <li>
              <strong>Solana Blockchain</strong> — Web3 technology with low
              transaction costs and high speed.
            </li>
            <li>
              <strong>Islamic Marketplace</strong> — exchange tokens for
              Islamic-themed merchandise and charitable donations.
            </li>
            <li>
              <strong>Minimalist & Fast</strong> — focused on reading with a
              lightweight black-and-white interface.
            </li>
            <li>
              <strong>Accurate Prayer Times</strong> — based on geolocation and
              device timezone.
            </li>
            <li>
              <strong>Privacy First</strong> — no tracking, only public API
              requests.
            </li>
          </ul>
        </section>
      </main>

      <Footer />
    </div>
  );
}
