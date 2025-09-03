"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useWeb3AuthConnect } from "@web3auth/modal/react";
import { useSolanaWallet } from "@web3auth/modal/react/solana";
import { MERCHANDISE_CATALOG } from "@/lib/merchandise";
import { formatJuzAmount, getUserJuzBalance } from "@/lib/juz-token";
import { PublicKey } from "@solana/web3.js";

export default function MarketplacePage() {
  const { isConnected } = useWeb3AuthConnect();
  const { accounts } = useSolanaWallet();
  const pubkey = accounts?.[0] || null;

  const [juzBalance, setJuzBalance] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [redeeming, setRedeeming] = useState<string | null>(null);

  useEffect(() => {
    const fetchJuzBalance = async () => {
      if (pubkey && isConnected) {
        setBalanceLoading(true);
        try {
          const publicKey = new PublicKey(pubkey);
          const balance = await getUserJuzBalance(publicKey);
          setJuzBalance(balance);
        } catch (error) {
          console.error("Error fetching JUZ balance:", error);
          // Fallback to localStorage balance if blockchain fails
          const localBalances = localStorage.getItem("r2e_balances");
          const balanceMap = localBalances ? JSON.parse(localBalances) : {};
          setJuzBalance(balanceMap[pubkey] || 0);
        } finally {
          setBalanceLoading(false);
        }
      } else {
        setJuzBalance(0);
      }
    };

    fetchJuzBalance();
  }, [pubkey, isConnected]);

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
      // Removed setMockJuzBalance call as it's not needed with real blockchain balance

      alert(`Successfully redeemed! Transaction ID: redemption_${Date.now()}`);
    } catch (error) {
      alert("Redemption failed. Please try again.");
    } finally {
      setRedeeming(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-10 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold">
              JUZ Marketplace 🛍️
            </h1>
            <p className="text-sm text-white/60">
              Redeem your reading rewards for Islamic merchandise
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-white/60">Your Balance</div>
            <div className="text-2xl font-bold text-green-400">
              {isConnected ? formatJuzAmount(juzBalance) : "0.00"} JUZ
            </div>
            <div className="text-xs text-white/50">
              {isConnected
                ? `${pubkey?.slice(0, 4)}...${pubkey?.slice(-4)}`
                : "Not connected"}
            </div>
          </div>
        </div>

        {/* Connection Notice */}
        {!isConnected && (
          <div className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-4">
            <div className="flex items-center gap-2">
              <span className="text-orange-400">⚠️</span>
              <div>
                <div className="font-medium text-orange-400">
                  Wallet Not Connected
                </div>
                <div className="text-sm text-orange-300">
                  Connect your wallet to view your JUZ balance and redeem items.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="flex gap-2 p-1 bg-white/5 rounded-lg w-fit">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 text-sm rounded-md transition-colors capitalize ${
                selectedCategory === category
                  ? "bg-white text-black"
                  : "hover:bg-white/10"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Merchandise Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const affordable = juzBalance >= item.price;
            const priceInJuz = formatJuzAmount(item.price);

            return (
              <div
                key={item.id}
                className="rounded-xl border border-white/10 bg-white/5 p-4"
              >
                {/* Item Image Placeholder */}
                <div className="aspect-square rounded-lg bg-white/10 mb-4 flex items-center justify-center">
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
                          ? "bg-purple-500/20 text-purple-300"
                          : item.category === "physical"
                          ? "bg-blue-500/20 text-blue-300"
                          : "bg-green-500/20 text-green-300"
                      }`}
                    >
                      {item.category}
                    </span>
                  </div>

                  <p className="text-sm text-white/70 line-clamp-2">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <div className="text-lg font-bold">{priceInJuz} JUZ</div>
                      {item.stock < 100 && (
                        <div className="text-xs text-orange-400">
                          Only {item.stock} left
                        </div>
                      )}
                      {item.shipping && (
                        <div className="text-xs text-white/50">+ shipping</div>
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
                          ? "bg-white/10 text-white/40 cursor-not-allowed"
                          : redeeming === item.id
                          ? "bg-yellow-500/20 text-yellow-300"
                          : "bg-white text-black hover:bg-white/90"
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
            <div className="text-sm text-white/60">
              Try selecting a different category
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
