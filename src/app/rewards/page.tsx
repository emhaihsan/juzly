"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useWeb3AuthConnect } from "@web3auth/modal/react";
import { useSolanaWallet } from "@web3auth/modal/react/solana";
import { PublicKey } from "@solana/web3.js";
import { getUserJuzBalance, formatJuzAmount } from "@/lib/juz-token";
import { simulateReadingReward } from "@/lib/token-minting";

const LS_BALANCES = "r2e_balances";
const LS_HISTORY = "r2e_history";
const LS_MINTING_HISTORY = "r2e_minting_history"; // Track actual blockchain mints

function useBalance(pubkey: string | null) {
  const [bal, setBal] = useState<number>(0);
  const refresh = () => {
    const raw = localStorage.getItem(LS_BALANCES);
    const map = raw ? (JSON.parse(raw) as Record<string, number>) : {};
    setBal(pubkey ? map[pubkey] || 0 : 0);
  };
  useEffect(() => {
    refresh();
  }, [pubkey]);
  return { bal, refresh };
}

// Track minting history
function getMintingHistory(): any[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(LS_MINTING_HISTORY);
  return raw ? JSON.parse(raw) : [];
}

function addMintingRecord(record: any) {
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
  const [mintingHistory, setMintingHistory] = useState<any[]>([]);

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

      if (!response.ok) {
        throw new Error(result.details || result.error || "Minting failed");
      }

      if (result.success) {
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
        const newBalance = await getUserJuzBalance(publicKey);
        setOnChainBalance(newBalance);

        // Add minting record
        addMintingRecord({
          tx: result.signature,
          amount: result.amount,
          ts: new Date().getTime(),
        });
        setMintingHistory(getMintingHistory());

        alert(
          `🎉 REAL BLOCKCHAIN MINTING SUCCESS! 🎉\n\n` +
            `✅ Minted: ${result.amount} JUZ tokens\n` +
            `⛓️ Transaction: ${result.signature.slice(0, 8)}...\n` +
            `🌐 View on Explorer: ${result.explorerUrl}\n\n` +
            `Your tokens are now on Solana blockchain!`
        );
      } else {
        throw new Error("Minting API returned failure");
      }
    } catch (error) {
      console.error("❌ REAL MINTING FAILED:", error);
      alert(
        `❌ Real Blockchain Minting Failed:\n\n${
          error instanceof Error ? error.message : "Unknown error"
        }\n\nPlease check console for details.`
      );
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
    <div className="min-h-screen bg-white text-black">
      <main className="mx-auto max-w-5xl px-4 py-6 sm:py-10 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold">My Rewards</h1>
            <p className="text-sm text-black/60">
              JUZ token rewards from reading the Holy Quran. Earn JUZ tokens for
              every page you read.
            </p>
          </div>
          <Link
            href="/leaderboard"
            className="inline-flex items-center rounded-md border border-black px-3 py-1.5 text-sm hover:bg-black hover:text-white transition-colors"
          >
            Leaderboard
          </Link>
        </div>

        {/* Wallet Status */}
        <section className="rounded-xl border border-black/10 bg-white p-4 sm:p-6 shadow-sm space-y-2">
          <div className="text-sm">
            <span className="opacity-60">Wallet:</span>{" "}
            {isConnected && pubkey ? (
              <span className="font-mono text-green-600">
                {pubkey.slice(0, 6)}...{pubkey.slice(-6)} ✅
              </span>
            ) : (
              <span className="italic text-red-600">
                Not connected (use Connect Wallet button above)
              </span>
            )}
          </div>
          {isConnected && (
            <div className="text-xs text-black/50">
              Connected to Solana Devnet • JUZ Token Mint:
              5sNd52...zkqwU5xKnwZVLRDEoV2bkdQWtzmB
            </div>
          )}
        </section>

        {/* Token Balances */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Local Balance (Pending) */}
          <section className="rounded-xl border border-orange-200 bg-orange-50 p-4 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Pending Rewards</h2>
              <div className="text-orange-600 text-sm">📋 Local</div>
            </div>
            <div className="text-3xl font-semibold">
              {(bal / 1_000_000).toFixed(2)} JUZ
            </div>
            <div className="text-xs text-black/60">
              Reading rewards waiting to be minted to blockchain
            </div>
            <div className="flex gap-2">
              <button
                onClick={refresh}
                disabled={!isConnected || !pubkey}
                className="rounded-md border border-orange-600 text-orange-600 px-3 py-1.5 text-sm hover:bg-orange-600 hover:text-white transition-colors disabled:opacity-50"
              >
                Refresh
              </button>
              <button
                onClick={handleMintTokens}
                disabled={!isConnected || !pubkey || bal <= 0 || minting}
                className="rounded-md bg-orange-600 text-white px-3 py-1.5 text-sm hover:bg-orange-700 transition-colors disabled:opacity-50"
              >
                {minting ? "Minting..." : "Mint to Blockchain"}
              </button>
            </div>
          </section>

          {/* Real On-chain Balance */}
          <section className="rounded-xl border border-green-200 bg-green-50 p-4 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">JUZ Token Balance</h2>
              <div className="text-green-600 text-sm">⛓️ Blockchain</div>
            </div>
            <div className="text-3xl font-semibold">
              {balanceLoading
                ? "Loading..."
                : `${onChainBalance.toFixed(2)} JUZ`}
            </div>
            <div className="text-xs text-black/60">
              Real JUZ tokens in your Solana wallet (Devnet)
            </div>
            <div className="flex gap-2">
              <button
                onClick={refreshOnChainBalance}
                disabled={!isConnected || !pubkey || balanceLoading}
                className="rounded-md border border-green-600 text-green-600 px-3 py-1.5 text-sm hover:bg-green-600 hover:text-white transition-colors disabled:opacity-50"
              >
                {balanceLoading ? "Loading..." : "Refresh"}
              </button>
              <Link
                href="/marketplace"
                className="inline-block rounded-md bg-green-600 text-white px-3 py-1.5 text-sm hover:bg-green-700 transition-colors"
              >
                Use in Marketplace
              </Link>
            </div>
          </section>
        </div>

        {/* Progress Tracker */}
        <section className="rounded-xl border border-black/10 bg-gradient-to-r from-blue-50 to-purple-50 p-4 text-sm">
          <h2 className="text-lg font-semibold mb-3">📊 Reading Progress</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="bg-white/50 rounded-lg p-3">
              <div className="font-medium">Pending Rewards</div>
              <div className="text-lg font-semibold">
                {(bal / 1_000_000).toFixed(2)} JUZ
              </div>
              <div className="text-xs text-black/60">
                Earned from reading sessions
              </div>
            </div>
            <div className="bg-white/50 rounded-lg p-3">
              <div className="font-medium">Blockchain Balance</div>
              <div className="text-lg font-semibold">
                {onChainBalance.toFixed(2)} JUZ
              </div>
              <div className="text-xs text-black/60">Minted to your wallet</div>
            </div>
            <div className="bg-white/50 rounded-lg p-3">
              <div className="font-medium">Total Earned</div>
              <div className="text-lg font-semibold">
                {(bal / 1_000_000 + onChainBalance).toFixed(2)} JUZ
              </div>
              <div className="text-xs text-black/60">
                Pending + Blockchain combined
              </div>
            </div>
          </div>
        </section>

        {/* Minting History */}
        <section className="rounded-xl border border-black/10 bg-white p-4 sm:p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Minting History</h2>
          <div className="mt-3 space-y-2">
            {mintingHistory.length === 0 && (
              <div className="text-sm text-black/60">
                No minting activity yet. Mint your rewards to see them here!
              </div>
            )}
            {mintingHistory.map((h, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-md border border-black/10 p-3 text-sm"
              >
                <div>
                  <div className="font-medium">+{h.amount} JUZ</div>
                  <div className="text-xs text-black/60">
                    Transaction: {h.tx.slice(0, 8)}... •{" "}
                    {new Date(h.ts).toLocaleString()}
                  </div>
                </div>
                <div className="text-xs opacity-60">Minted to Blockchain</div>
              </div>
            ))}
          </div>
        </section>

        {/* Development Note */}
        <section className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm">
          <h3 className="font-semibold text-blue-800 mb-2">
            🔧 Development Note
          </h3>
          <p className="text-blue-700">
            <strong>Real Blockchain Integration:</strong> This rewards page now
            fetches your actual JUZ token balance from Solana blockchain. The
            "Mint to Blockchain" button currently simulates the minting process
            since real token minting requires a secure backend service with mint
            authority access.
          </p>
        </section>
      </main>
    </div>
  );
}
