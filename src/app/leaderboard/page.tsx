"use client";
import { useEffect, useMemo, useState } from "react";

const LS_BALANCES = "r2e_balances";
const WALLET_KEY = "mock_wallet_pubkey";

function readBalances(): Record<string, number> {
  const raw = localStorage.getItem(LS_BALANCES);
  return raw ? (JSON.parse(raw) as Record<string, number>) : {};
}

export default function LeaderboardPage() {
  const [balances, setBalances] = useState<Record<string, number>>({});

  useEffect(() => {
    const map = readBalances();
    // Ensure at least 5 mock users for demo
    if (Object.keys(map).length < 5) {
      const ensure = { ...map };
      const base = [50, 40, 35, 20, 10];
      for (let i = 0; i < 5; i++) {
        const id = `DemoUser${i + 1}${Math.random().toString(36).slice(2, 6)}`;
        ensure[id] = base[i] + Math.floor(Math.random() * 10);
      }
      localStorage.setItem(LS_BALANCES, JSON.stringify(ensure));
      setBalances(ensure);
    } else {
      setBalances(map);
    }
  }, []);

  const rows = useMemo(() => {
    return Object.entries(balances)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);
  }, [balances]);

  const me =
    typeof window !== "undefined" ? localStorage.getItem(WALLET_KEY) : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-semibold">
          Leaderboard (mock)
        </h1>
        <a
          href="/rewards"
          className="inline-flex items-center rounded-md border border-black px-3 py-1.5 text-sm hover:bg-black hover:text-white"
        >
          Rewards
        </a>
      </div>

      <div className="rounded-xl border border-black/10 bg-white p-4 sm:p-6 shadow-sm">
        <div className="grid grid-cols-6 text-xs font-medium uppercase text-black/60">
          <div className="col-span-1">Rank</div>
          <div className="col-span-3">User</div>
          <div className="col-span-2 text-right">Points</div>
        </div>
        <div className="mt-2 divide-y">
          {rows.map(([user, pts], idx) => (
            <div
              key={user + idx}
              className={`grid grid-cols-6 py-2 text-sm ${
                me && user === me ? "bg-black/5" : ""
              }`}
            >
              <div className="col-span-1">#{idx + 1}</div>
              <div className="col-span-3 font-mono">
                {user.slice(0, 6)}...{user.slice(-6)}
              </div>
              <div className="col-span-2 text-right font-semibold">{pts}</div>
            </div>
          ))}
          {rows.length === 0 && (
            <div className="py-4 text-sm text-black/60">Belum ada data.</div>
          )}
        </div>
      </div>
    </div>
  );
}
