"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useWeb3AuthConnect } from "@web3auth/modal/react";
import { useSolanaWallet } from "@web3auth/modal/react/solana";

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
  const { accounts } = useSolanaWallet();
  const pubkey = accounts?.[0] || null;

  const { bal, refresh } = useBalance(pubkey);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem(LS_HISTORY);
    setHistory(raw ? (JSON.parse(raw) as any[]) : []);
  }, []);

  return (
    <div className="min-h-screen bg-white text-black">
      <main className="mx-auto max-w-5xl px-4 py-6 sm:py-10 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold">Rewards</h1>
            <p className="text-sm text-black/60">
              Saldo poin dari aktivitas membaca Quran. Integrasi devnet akan
              menyusul.
            </p>
          </div>
          <Link
            href="/leaderboard"
            className="inline-flex items-center rounded-md border border-black px-3 py-1.5 text-sm hover:bg-black hover:text-white transition-colors"
          >
            Leaderboard
          </Link>
        </div>

        <section className="rounded-xl border border-black/10 bg-white p-4 sm:p-6 shadow-sm space-y-2">
          <div className="text-sm">
            <span className="opacity-60">Wallet:</span>{" "}
            {isConnected && pubkey ? (
              <span className="font-mono">
                {pubkey.slice(0, 6)}...{pubkey.slice(-6)}
              </span>
            ) : (
              <span className="italic">
                Belum tersambung (gunakan tombol Connect Wallet di atas)
              </span>
            )}
          </div>
          <div className="text-3xl font-semibold">{bal} pts</div>
          <div className="text-xs text-black/60">
            1 poin ≈ 1 menit aktif membaca
          </div>
          <div>
            <button
              onClick={refresh}
              disabled={!isConnected || !pubkey}
              className="mt-2 rounded-md border border-black px-3 py-1.5 text-sm hover:bg-black hover:text-white transition-colors disabled:opacity-50"
            >
              Refresh
            </button>
          </div>
        </section>

        <section className="rounded-xl border border-black/10 bg-white p-4 sm:p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Riwayat Klaim</h2>
          <div className="mt-3 space-y-2">
            {history.length === 0 && (
              <div className="text-sm text-black/60">Belum ada klaim.</div>
            )}
            {history.map((h, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-md border border-black/10 p-3 text-sm"
              >
                <div>
                  <div className="font-medium">+{h.minutes} pts</div>
                  <div className="text-xs text-black/60">
                    Halaman {h.page} • {new Date(h.ts).toLocaleString()}
                  </div>
                </div>
                <div className="text-xs opacity-60">
                  {h.note || "read-to-earn"}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
