"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useWeb3AuthConnect } from "@web3auth/modal/react";
import { useSolanaWallet } from "@web3auth/modal/react/solana";
import { JuzTokenManager } from "@/lib/juz-token";

const LS_BALANCES = "r2e_balances";
const LS_HISTORY = "r2e_history";

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

export default function RewardsPage() {
  // Use real Web3Auth wallet context
  const { isConnected } = useWeb3AuthConnect();
  const { accounts, connection } = useSolanaWallet();
  const pubkey = accounts?.[0] || null;

  const { bal, refresh } = useBalance(pubkey);
  const [history, setHistory] = useState<any[]>([]);
  const [onChainBalance, setOnChainBalance] = useState<number>(0);
  const [minting, setMinting] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(LS_HISTORY);
    setHistory(raw ? (JSON.parse(raw) as any[]) : []);
  }, []);

  // Fetch on-chain JUZ token balance
  useEffect(() => {
    const fetchOnChainBalance = async () => {
      if (connection && pubkey && isConnected) {
        try {
          // For demo: Skip actual blockchain calls to avoid errors
          // In production, you would have a real mint address
          console.log("Simulating on-chain balance fetch for:", pubkey);
          setOnChainBalance(0); // Demo: Start with 0 balance
        } catch (error) {
          console.error("Error fetching on-chain balance:", error);
        }
      }
    };

    fetchOnChainBalance();
  }, [connection, pubkey, isConnected]);

  const handleMintTokens = async () => {
    if (!connection || !pubkey || !isConnected || bal <= 0) return;

    setMinting(true);
    try {
      // Demo implementation: Simulate minting without actual blockchain calls
      const tokensToMint = bal;

      console.log(`Demo: Would mint ${tokensToMint} JUZ tokens to ${pubkey}`);

      // Simulate successful minting
      setOnChainBalance((prev) => prev + tokensToMint);

      // Clear local balance after "minting"
      const raw = localStorage.getItem(LS_BALANCES);
      const map = raw ? (JSON.parse(raw) as Record<string, number>) : {};
      map[pubkey] = 0;
      localStorage.setItem(LS_BALANCES, JSON.stringify(map));
      refresh();

      alert(
        `✅ Demo: Successfully "minted" ${(tokensToMint / 1_000_000).toFixed(
          3
        )} JUZ tokens!\n\nFor hackathon: This simulates blockchain minting.`
      );
    } catch (error) {
      console.error("Error in demo minting:", error);
      alert("Demo minting failed - check console for details.");
    } finally {
      setMinting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <main className="mx-auto max-w-5xl px-4 py-6 sm:py-10 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold">My Rewards</h1>
            <p className="text-sm text-black/60">
              JUZ token rewards from reading the Holy Quran. 1 full token = 20
              pages read.
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
              <span className="font-mono">
                {pubkey.slice(0, 6)}...{pubkey.slice(-6)}
              </span>
            ) : (
              <span className="italic">
                Not connected (use Connect Wallet button above)
              </span>
            )}
          </div>
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
              {(bal / 1_000_000).toFixed(6)} JUZ
            </div>
            <div className="text-xs text-black/60">
              Rewards not yet minted to blockchain
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

          {/* On-chain Balance */}
          <section className="rounded-xl border border-green-200 bg-green-50 p-4 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">JUZ Token Balance</h2>
              <div className="text-green-600 text-sm">⛓️ On-chain</div>
            </div>
            <div className="text-3xl font-semibold">
              {(onChainBalance / 1_000_000).toFixed(6)} JUZ
            </div>
            <div className="text-xs text-black/60">
              Actual JUZ tokens in your Solana wallet
            </div>
            <Link
              href="/marketplace"
              className="inline-block rounded-md bg-green-600 text-white px-3 py-1.5 text-sm hover:bg-green-700 transition-colors"
            >
              Use in Marketplace
            </Link>
          </section>
        </div>

        {/* Progress Tracker */}
        <section className="rounded-xl border border-black/10 bg-gradient-to-r from-blue-50 to-purple-50 p-4 sm:p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-3">📊 Reading Progress</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="bg-white/50 rounded-lg p-3">
              <div className="font-medium">Current Balance</div>
              <div className="text-lg font-semibold">
                {(bal / 1_000_000).toFixed(6)} JUZ
              </div>
              <div className="text-xs text-black/60">
                {((bal / 1_000_000) * 20).toFixed(1)} pages equivalent
              </div>
            </div>
            <div className="bg-white/50 rounded-lg p-3">
              <div className="font-medium">Progress to 1 JUZ</div>
              <div className="text-lg font-semibold">
                {((bal / 1_000_000) * 100).toFixed(2)}%
              </div>
              <div className="text-xs text-black/60">
                {20 - Math.floor((bal / 1_000_000) * 20)} pages remaining
              </div>
            </div>
            <div className="bg-white/50 rounded-lg p-3">
              <div className="font-medium">Total Earned</div>
              <div className="text-lg font-semibold">
                {((bal + onChainBalance) / 1_000_000).toFixed(6)} JUZ
              </div>
              <div className="text-xs text-black/60">
                Pending + On-chain combined
              </div>
            </div>
          </div>
        </section>

        {/* Reading History */}
        <section className="rounded-xl border border-black/10 bg-white p-4 sm:p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Reading History</h2>
          <div className="mt-3 space-y-2">
            {history.length === 0 && (
              <div className="text-sm text-black/60">
                No reading activity yet.
              </div>
            )}
            {history.map((h, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-md border border-black/10 p-3 text-sm"
              >
                <div>
                  <div className="font-medium">
                    +{((h.minutes * 1_000_000) / 1_000_000).toFixed(6)} JUZ
                  </div>
                  <div className="text-xs text-black/60">
                    Page {h.page} • {new Date(h.ts).toLocaleString()}
                    {h.nftEligible && (
                      <span className="ml-2 text-purple-600">
                        🎁 NFT Eligible
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-xs opacity-60">
                  {h.note || "page-completed"}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
