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
  const { accounts } = useSolanaWallet();
  const pubkey = accounts?.[0] || null;

  const [canClaim, setCanClaim] = useState(false);

  // Check for pending rewards
  useEffect(() => {
    if (pubkey) {
      const balance = getBalance(pubkey);
      setCanClaim(balance > 0);
    }
  }, [pubkey, currentPage]);

  // Refresh rewards periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (pubkey) {
        const balance = getBalance(pubkey);
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
            ? "border-white/30 hover:bg-white hover:text-black"
            : "border-white/20 text-white/40 cursor-not-allowed pointer-events-none"
        }`}
      >
        ← Prev
      </Link>

      {/* Next Button - Enhanced with Claim Status */}
      {nextPage ? (
        canClaim ? (
          <Link
            href={`/quran/mushaf/${nextPage}`}
            className="inline-flex items-center rounded-md border border-white/30 bg-white/10 text-white px-4 py-1.5 text-sm font-medium hover:bg-white hover:text-black transition-colors"
          >
            Claim & Next →
          </Link>
        ) : (
          <Link
            href={`/quran/mushaf/${nextPage}`}
            className="inline-flex items-center rounded-md border border-white/30 px-3 py-1.5 text-sm hover:bg-white hover:text-black transition-colors"
          >
            Next →
          </Link>
        )
      ) : (
        <div className="inline-flex items-center rounded-md border border-white/20 text-white/40 px-3 py-1.5 text-sm cursor-not-allowed">
          {canClaim ? (
            <Link
              href="/rewards"
              className="text-white hover:text-white/80 font-medium"
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
