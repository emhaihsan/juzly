"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useWeb3AuthConnect } from "@web3auth/modal/react";
import { useSolanaWallet } from "@web3auth/modal/react/solana";

const LS_BALANCES = "r2e_balances";

function getBalance(pubkey: string): number {
  const raw = localStorage.getItem(LS_BALANCES);
  const map = raw ? (JSON.parse(raw) as Record<string, number>) : {};
  return map[pubkey] || 0;
}

interface Props {
  currentPage: number;
  prevPage: number | null;
  nextPage: number | null;
}

export default function NavigationButtons({
  currentPage,
  prevPage,
  nextPage,
}: Props) {
  const { isConnected } = useWeb3AuthConnect();
  const { accounts } = useSolanaWallet();
  const pubkey = accounts?.[0] || null;

  const [pendingRewards, setPendingRewards] = useState(0);
  const [canClaim, setCanClaim] = useState(false);

  // Check for pending rewards
  useEffect(() => {
    if (pubkey) {
      const balance = getBalance(pubkey);
      setPendingRewards(balance);
      setCanClaim(balance > 0);
    }
  }, [pubkey, currentPage]);

  // Refresh rewards periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (pubkey) {
        const balance = getBalance(pubkey);
        setPendingRewards(balance);
        setCanClaim(balance > 0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [pubkey]);

  return (
    <div className="flex items-center gap-2">
      {/* Previous Button */}
      <Link
        href={prevPage ? `/quran/mushaf/${prevPage}` : "#"}
        className={`inline-flex items-center rounded-md border px-3 py-1.5 text-sm transition-colors ${
          prevPage
            ? "border-black hover:bg-black hover:text-white"
            : "border-black/20 text-black/40 cursor-not-allowed pointer-events-none"
        }`}
      >
        ← Prev
      </Link>

      {/* Rewards Status */}
      {isConnected && pubkey && canClaim && (
        <Link
          href="/rewards"
          className="inline-flex items-center rounded-md border border-orange-500 bg-orange-50 text-orange-700 px-3 py-1.5 text-xs font-medium hover:bg-orange-100 transition-colors"
        >
          💰 {(pendingRewards / 1_000_000).toFixed(1)} JUZ to mint
        </Link>
      )}

      {/* Next Button - Enhanced with Claim Status */}
      {nextPage ? (
        canClaim ? (
          <Link
            href={`/quran/mushaf/${nextPage}`}
            className="inline-flex items-center rounded-md border border-green-600 bg-green-50 text-green-700 px-4 py-1.5 text-sm font-medium hover:bg-green-600 hover:text-white transition-colors"
          >
            Next & Claim More →
            <span className="ml-1 text-xs">
              ({(pendingRewards / 1_000_000).toFixed(1)} JUZ)
            </span>
          </Link>
        ) : (
          <Link
            href={`/quran/mushaf/${nextPage}`}
            className="inline-flex items-center rounded-md border border-black px-3 py-1.5 text-sm hover:bg-black hover:text-white transition-colors"
          >
            Next →
          </Link>
        )
      ) : (
        <div className="inline-flex items-center rounded-md border border-black/20 text-black/40 px-3 py-1.5 text-sm cursor-not-allowed">
          {canClaim ? (
            <Link
              href="/rewards"
              className="text-green-600 hover:text-green-800 font-medium"
            >
              🎉 Quran Complete! Claim Rewards
            </Link>
          ) : (
            "Quran Complete"
          )}
        </div>
      )}
    </div>
  );
}
