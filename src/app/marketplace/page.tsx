"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useWeb3AuthConnect } from "@web3auth/modal/react";
import { useSolanaWallet } from "@web3auth/modal/react/solana";
import { MERCHANDISE_CATALOG, formatJuzAmount } from "@/lib/juz-token";

// Mock JUZ balance for demo (in production, fetch from blockchain)
function getMockJuzBalance(pubkey: string): number {
  const saved = localStorage.getItem(`juz_balance_${pubkey}`);
  return saved ? parseInt(saved) : 150_000_000; // 150 JUZ default
}

function setMockJuzBalance(pubkey: string, amount: number) {
  localStorage.setItem(`juz_balance_${pubkey}`, amount.toString());
}

export default function MarketplacePage() {
  const { isConnected } = useWeb3AuthConnect();
  const { accounts } = useSolanaWallet();
  const pubkey = accounts?.[0] || null;

  const [juzBalance, setJuzBalance] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [redeeming, setRedeeming] = useState<string | null>(null);

  useEffect(() => {
    if (pubkey) {
      setJuzBalance(getMockJuzBalance(pubkey));
    }
  }, [pubkey]);

  const categories = ["all", "digital", "physical", "charity"];

  const filteredItems = MERCHANDISE_CATALOG.filter(
    (item) => selectedCategory === "all" || item.category === selectedCategory
  );

  const handleRedeem = async (itemId: string, price: number) => {
    if (!pubkey || !isConnected) {
      alert("Please connect your wallet first");
      return;
    }

    if (juzBalance < price) {
      alert("Insufficient JUZ tokens");
      return;
    }

    setRedeeming(itemId);

    try {
      // Simulate redemption process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const newBalance = juzBalance - price;
      setJuzBalance(newBalance);
      setMockJuzBalance(pubkey, newBalance);

      alert(`Successfully redeemed! Transaction ID: redemption_${Date.now()}`);
    } catch (error) {
      alert("Redemption failed. Please try again.");
    } finally {
      setRedeeming(null);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-10 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold">
              JUZ Marketplace 🛍️
            </h1>
            <p className="text-sm text-black/60">
              Redeem your reading rewards for Islamic merchandise
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-black/60">Your Balance</div>
            <div className="text-2xl font-bold text-green-600">
              {isConnected ? formatJuzAmount(juzBalance) : "0.00"} JUZ
            </div>
            <div className="text-xs text-black/50">
              {isConnected
                ? `${pubkey?.slice(0, 4)}...${pubkey?.slice(-4)}`
                : "Not connected"}
            </div>
          </div>
        </div>

        {/* Connection Notice */}
        {!isConnected && (
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
            <div className="flex items-center gap-2">
              <span className="text-orange-600">⚠️</span>
              <div>
                <div className="font-medium text-orange-800">
                  Wallet Not Connected
                </div>
                <div className="text-sm text-orange-700">
                  Connect your wallet to view your JUZ balance and redeem items.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="flex gap-2 p-1 bg-black/5 rounded-lg w-fit">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 text-sm rounded-md transition-colors capitalize ${
                selectedCategory === category
                  ? "bg-black text-white"
                  : "hover:bg-black/10"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* How It Works */}
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">
            💡 How JUZ Tokens Work
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="bg-white/50 rounded-lg p-3">
              <div className="font-medium text-blue-800">📖 Read Quran</div>
              <div className="text-blue-700">Earn 1 JUZ per minute</div>
            </div>
            <div className="bg-white/50 rounded-lg p-3">
              <div className="font-medium text-blue-800">✅ Complete Pages</div>
              <div className="text-blue-700">Get 0.5 JUZ bonus</div>
            </div>
            <div className="bg-white/50 rounded-lg p-3">
              <div className="font-medium text-blue-800">🔥 Daily Streaks</div>
              <div className="text-blue-700">Up to 2x multiplier</div>
            </div>
            <div className="bg-white/50 rounded-lg p-3">
              <div className="font-medium text-blue-800">🛍️ Redeem Items</div>
              <div className="text-blue-700">Exchange for merchandise</div>
            </div>
          </div>
        </div>

        {/* Merchandise Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const affordable = juzBalance >= item.price;
            const priceInJuz = formatJuzAmount(item.price);

            return (
              <div
                key={item.id}
                className="rounded-xl border border-black/10 bg-white p-4 shadow-sm"
              >
                {/* Item Image Placeholder */}
                <div className="aspect-square rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 mb-4 flex items-center justify-center">
                  <div className="text-4xl">
                    {item.category === "digital" && "🎨"}
                    {item.category === "physical" && "📦"}
                    {item.category === "charity" && "❤️"}
                  </div>
                </div>

                {/* Item Details */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-lg leading-tight">
                      {item.name}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.category === "digital"
                          ? "bg-purple-100 text-purple-800"
                          : item.category === "physical"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {item.category}
                    </span>
                  </div>

                  <p className="text-sm text-black/70 line-clamp-2">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <div className="text-lg font-bold">{priceInJuz} JUZ</div>
                      {item.stock < 100 && (
                        <div className="text-xs text-orange-600">
                          Only {item.stock} left
                        </div>
                      )}
                      {item.shipping && (
                        <div className="text-xs text-black/50">+ shipping</div>
                      )}
                    </div>

                    <button
                      onClick={() => handleRedeem(item.id, item.price)}
                      disabled={
                        !isConnected ||
                        !affordable ||
                        redeeming === item.id ||
                        item.stock === 0
                      }
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        !isConnected || !affordable || item.stock === 0
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : redeeming === item.id
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-black text-white hover:bg-black/80"
                      }`}
                    >
                      {redeeming === item.id
                        ? "Redeeming..."
                        : item.stock === 0
                        ? "Out of Stock"
                        : !isConnected
                        ? "Connect Wallet"
                        : !affordable
                        ? "Insufficient JUZ"
                        : "Redeem"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <div className="text-lg font-medium">No items found</div>
            <div className="text-sm text-black/60">
              Try selecting a different category
            </div>
          </div>
        )}

        {/* Footer Links */}
        <div className="flex justify-center gap-4 pt-8">
          <Link
            href="/rewards"
            className="inline-flex items-center rounded-md border border-black px-4 py-2 text-sm hover:bg-black hover:text-white transition-colors"
          >
            View My Rewards
          </Link>
          <Link
            href="/leaderboard"
            className="inline-flex items-center rounded-md border border-black px-4 py-2 text-sm hover:bg-black hover:text-white transition-colors"
          >
            Leaderboard
          </Link>
          <Link
            href="/quran"
            className="inline-flex items-center rounded-md border border-black px-4 py-2 text-sm hover:bg-black hover:text-white transition-colors"
          >
            Start Reading
          </Link>
        </div>
      </main>
    </div>
  );
}
