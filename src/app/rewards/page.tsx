"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useWeb3AuthConnect } from "@web3auth/modal/react";
import { useSolanaWallet } from "@web3auth/modal/react/solana";
import { PublicKey } from "@solana/web3.js";
import { getUserJuzBalance } from "@/lib/juz-token";

const LS_BALANCES = "r2e_balances";
const LS_MINTING_HISTORY = "r2e_minting_history"; // Track actual blockchain mints

// Notification component for successful minting
function MintingNotification({
  transaction,
  amount,
  explorerUrl,
  onClose,
}: {
  transaction: string;
  amount: number;
  explorerUrl: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm bg-green-500/20 border border-green-500/50 rounded-lg p-4 text-white shadow-lg">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="text-green-400 text-xl">🎉</div>
          <div className="font-semibold">Minting Successful!</div>
        </div>
        <button
          onClick={onClose}
          className="text-white/60 hover:text-white text-lg leading-none"
        >
          ×
        </button>
      </div>
      <div className="space-y-2 text-sm">
        <div>
          <span className="text-white/80">Amount:</span>{" "}
          <span className="font-semibold text-green-400">{amount} JUZ</span>
        </div>
        <div>
          <span className="text-white/80">Transaction:</span>
          <div className="font-mono text-xs text-white/90 break-all">
            {transaction}
          </div>
        </div>
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 bg-green-500 hover:bg-green-400 text-black px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
        >
          View on Explorer 🔗
        </a>
      </div>
    </div>
  );
}

function useBalance(pubkey: string | null) {
  const [bal, setBal] = useState<number>(0);
  const refresh = useCallback(() => {
    const raw = localStorage.getItem(LS_BALANCES);
    const map = raw ? (JSON.parse(raw) as Record<string, number>) : {};
    setBal(pubkey ? map[pubkey] || 0 : 0);
  }, [pubkey]);
  useEffect(() => {
    refresh();
  }, [pubkey, refresh]);
  return { bal, refresh };
}

// Track minting history
function getMintingHistory(): Array<{
  tx: string;
  amount: number;
  ts: number;
}> {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(LS_MINTING_HISTORY);
  return raw ? JSON.parse(raw) : [];
}

function addMintingRecord(record: { tx: string; amount: number; ts: number }) {
  if (typeof window === "undefined") return;
  const history = getMintingHistory();
  history.unshift(record);
  localStorage.setItem(
    LS_MINTING_HISTORY,
    JSON.stringify(history.slice(0, 50))
  ); // Keep last 50
}

export default function RewardsPage() {
  const { isConnected } = useWeb3AuthConnect();
  const { accounts } = useSolanaWallet();
  const pubkey = accounts?.[0] || null;

  const { bal, refresh } = useBalance(pubkey);
  const [onChainBalance, setOnChainBalance] = useState<number>(0);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [minting, setMinting] = useState(false);
  const [mintingHistory, setMintingHistory] = useState<
    Array<{ tx: string; amount: number; ts: number }>
  >([]);
  const [showMintingNotification, setShowMintingNotification] = useState(false);
  const [mintingNotificationData, setMintingNotificationData] = useState<{
    transaction: string;
    amount: number;
    explorerUrl: string;
  } | null>(null);

  useEffect(() => {
    setMintingHistory(getMintingHistory());
  }, []);

  useEffect(() => {
    const fetchRealJuzBalance = async () => {
      if (pubkey && isConnected) {
        setBalanceLoading(true);
        try {
          const publicKey = new PublicKey(pubkey);
          const balance = await getUserJuzBalance(publicKey);
          setOnChainBalance(balance);
          console.log("✅ Real JUZ balance fetched:", balance);
        } catch (error) {
          console.error("❌ Error fetching JUZ balance:", error);
          setOnChainBalance(0);
        } finally {
          setBalanceLoading(false);
        }
      }
    };

    fetchRealJuzBalance();
  }, [pubkey, isConnected]);

  const handleMintTokens = async () => {
    if (!pubkey || !isConnected || bal <= 0) return;

    setMinting(true);
    try {
      const rewardAmount = bal / 1_000_000; // Convert to JUZ tokens

      // Add null check for pubkey before creating PublicKey
      if (!pubkey) {
        throw new Error("Wallet not connected");
      }

      const publicKey = new PublicKey(pubkey);

      console.log(`🪙 REAL MINTING: ${rewardAmount} JUZ tokens to ${pubkey}`);

      // Call REAL minting API - THIS MINTS TO ACTUAL BLOCKCHAIN
      const response = await fetch("/api/mint-tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userWallet: pubkey,
          amount: rewardAmount,
          activity: "Reading rewards claim",
        }),
      });

      const result = await response.json();
      console.log("🔍 API Response:", result);

      if (!response.ok) {
        const errorMessage =
          result?.details || result?.error || "Minting failed";
        console.error("❌ API Error Response:", result);
        throw new Error(errorMessage);
      }

      if (result?.success) {
        console.log("✅ REAL BLOCKCHAIN MINTING SUCCESS!");
        console.log("Transaction:", result.signature);
        console.log("Explorer:", result.explorerUrl);

        // Clear local balance after successful REAL minting
        const raw = localStorage.getItem(LS_BALANCES);
        const map = raw ? (JSON.parse(raw) as Record<string, number>) : {};
        map[pubkey] = 0;
        localStorage.setItem(LS_BALANCES, JSON.stringify(map));
        refresh();

        // Refresh on-chain balance to show new tokens
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for blockchain confirmation
        try {
          const newBalance = await getUserJuzBalance(publicKey);
          setOnChainBalance(newBalance);
        } catch (balanceError) {
          console.warn("⚠️ Failed to refresh balance:", balanceError);
        }

        // Add minting record with null checks
        if (result.signature && result.amount) {
          addMintingRecord({
            tx: result.signature,
            amount: result.amount,
            ts: new Date().getTime(),
          });
          setMintingHistory(getMintingHistory());

          // Set notification data with null checks
          if (result.signature && result.explorerUrl) {
            setMintingNotificationData({
              transaction: result.signature,
              amount: result.amount,
              explorerUrl: result.explorerUrl,
            });
            setShowMintingNotification(true);
          }
        }
      } else {
        throw new Error(result?.message || "Minting API returned failure");
      }
    } catch (error) {
      console.error("❌ REAL MINTING FAILED:", error);

      // Enhanced error message with more context
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      const fullErrorMessage = `❌ Real Blockchain Minting Failed:\n\n${errorMessage}\n\nPlease check console for details.`;

      alert(fullErrorMessage);
    } finally {
      setMinting(false);
    }
  };

  const refreshOnChainBalance = async () => {
    if (!pubkey || !isConnected) return;

    setBalanceLoading(true);
    try {
      const publicKey = new PublicKey(pubkey);
      const balance = await getUserJuzBalance(publicKey);
      setOnChainBalance(balance);
    } catch (error) {
      console.error("Error refreshing balance:", error);
    } finally {
      setBalanceLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {showMintingNotification && mintingNotificationData && (
        <MintingNotification
          transaction={mintingNotificationData.transaction}
          amount={mintingNotificationData.amount}
          explorerUrl={mintingNotificationData.explorerUrl}
          onClose={() => setShowMintingNotification(false)}
        />
      )}
      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-10 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold">My Rewards</h1>
            <p className="text-sm text-white/60">
              JUZ token rewards from reading the Holy Quran. Earn JUZ tokens for
              every page you read.
            </p>
          </div>
          <Link
            href="/leaderboard"
            className="inline-flex items-center rounded-md border border-white/30 px-3 py-1.5 text-sm hover:bg-white hover:text-black transition-colors"
          >
            Leaderboard
          </Link>
        </div>

        {/* Wallet Status */}
        <section className="rounded-xl border border-white/10 bg-white/5 p-4 sm:p-6 space-y-2">
          <div className="text-sm">
            <span className="opacity-60">Wallet:</span>{" "}
            {isConnected && pubkey ? (
              <span className="font-mono text-green-400">
                {pubkey.slice(0, 6)}...{pubkey.slice(-6)} ✅
              </span>
            ) : (
              <span className="italic text-red-400">
                Not connected (use Connect Wallet button above)
              </span>
            )}
          </div>
          {isConnected && (
            <div className="text-xs text-white/50">
              Connected to Solana Devnet • JUZ Token Mint:
              5sNd52...zkqwU5xKnwZVLRDEoV2bkdQWtzmB
            </div>
          )}
        </section>

        {/* Token Balances */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Local Balance (Pending) */}
          <section className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-4 sm:p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Pending Rewards</h2>
              <div className="text-orange-400 text-sm">📋 Local</div>
            </div>
            <div className="text-3xl font-semibold">
              {(bal / 1_000_000).toFixed(2)} JUZ
            </div>
            <div className="text-xs text-white/60">
              Reading rewards waiting to be minted to blockchain
            </div>
            <div className="flex gap-2">
              <button
                onClick={refresh}
                disabled={!isConnected || !pubkey}
                className="rounded-md border border-orange-400 text-orange-400 px-3 py-1.5 text-sm hover:bg-orange-400 hover:text-black transition-colors disabled:opacity-50"
              >
                Refresh
              </button>
              <button
                onClick={handleMintTokens}
                disabled={!isConnected || !pubkey || bal <= 0 || minting}
                className="rounded-md bg-orange-400 text-black px-3 py-1.5 text-sm hover:bg-orange-300 transition-colors disabled:opacity-50"
              >
                {minting ? "Minting..." : "Mint to Blockchain"}
              </button>
            </div>
          </section>

          {/* Real On-chain Balance */}
          <section className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 sm:p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">JUZ Token Balance</h2>
              <div className="text-green-400 text-sm">⛓️ Blockchain</div>
            </div>
            <div className="text-3xl font-semibold">
              {balanceLoading
                ? "Loading..."
                : `${onChainBalance.toFixed(2)} JUZ`}
            </div>
            <div className="text-xs text-white/60">
              Real JUZ tokens in your Solana wallet (Devnet)
            </div>
            <div className="flex gap-2">
              <button
                onClick={refreshOnChainBalance}
                disabled={!isConnected || !pubkey || balanceLoading}
                className="rounded-md border border-green-400 text-green-400 px-3 py-1.5 text-sm hover:bg-green-400 hover:text-black transition-colors disabled:opacity-50"
              >
                {balanceLoading ? "Loading..." : "Refresh"}
              </button>
              <Link
                href="/marketplace"
                className="inline-block rounded-md bg-green-400 text-black px-3 py-1.5 text-sm hover:bg-green-300 transition-colors"
              >
                Use in Marketplace
              </Link>
            </div>
          </section>
        </div>

        {/* Progress Tracker */}
        <section className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm">
          <h2 className="text-lg font-semibold mb-3">📊 Reading Progress</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="font-medium">Pending Rewards</div>
              <div className="text-lg font-semibold">
                {(bal / 1_000_000).toFixed(2)} JUZ
              </div>
              <div className="text-xs text-white/60">
                Earned from reading sessions
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="font-medium">Blockchain Balance</div>
              <div className="text-lg font-semibold">
                {onChainBalance.toFixed(2)} JUZ
              </div>
              <div className="text-xs text-white/60">Minted to your wallet</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="font-medium">Total Earned</div>
              <div className="text-lg font-semibold">
                {(bal / 1_000_000 + onChainBalance).toFixed(2)} JUZ
              </div>
              <div className="text-xs text-white/60">
                Pending + Blockchain combined
              </div>
            </div>
          </div>
        </section>

        {/* Minting History */}
        <section className="rounded-xl border border-white/10 bg-white/5 p-4 sm:p-6">
          <h2 className="text-lg font-semibold">Minting History</h2>
          <div className="mt-3 space-y-2">
            {mintingHistory.length === 0 && (
              <div className="text-sm text-white/60">
                No minting activity yet. Mint your rewards to see them here!
              </div>
            )}
            {mintingHistory.map((h, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-md border border-white/10 bg-white/5 p-3 text-sm"
              >
                <div>
                  <div className="font-medium">+{h.amount} JUZ</div>
                  <div className="text-xs text-white/60">
                    Transaction: {h.tx.slice(0, 8)}... •{" "}
                    {new Date(h.ts).toLocaleString()}
                  </div>
                </div>
                <div className="text-xs opacity-60">Minted to Blockchain</div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
