"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const WALLET_KEY = "mock_wallet_pubkey";
const LS_PROGRESS_PREFIX = "r2e_progress_"; // per day
const LS_BALANCES = "r2e_balances"; // map pubkey->points
const LS_HISTORY = "r2e_history"; // array of {ts, minutes, page, note}

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${(d.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
}

function getProgress(): number {
  const raw = localStorage.getItem(LS_PROGRESS_PREFIX + todayKey());
  return raw ? Number(raw) || 0 : 0;
}
function setProgress(v: number) {
  localStorage.setItem(LS_PROGRESS_PREFIX + todayKey(), String(v));
}

function getBalance(pubkey: string): number {
  const raw = localStorage.getItem(LS_BALANCES);
  const map = raw ? (JSON.parse(raw) as Record<string, number>) : {};
  return map[pubkey] || 0;
}
function setBalance(pubkey: string, val: number) {
  const raw = localStorage.getItem(LS_BALANCES);
  const map = raw ? (JSON.parse(raw) as Record<string, number>) : {};
  map[pubkey] = val;
  localStorage.setItem(LS_BALANCES, JSON.stringify(map));
}

function pushHistory(entry: {
  ts: number;
  minutes: number;
  page: number;
  note?: string;
}) {
  const raw = localStorage.getItem(LS_HISTORY);
  const arr = raw ? (JSON.parse(raw) as any[]) : [];
  arr.unshift(entry);
  localStorage.setItem(LS_HISTORY, JSON.stringify(arr.slice(0, 100)));
}

export default function ReadTimer({ page }: { page: number }) {
  const [seconds, setSeconds] = useState(0);
  const [pubkey, setPubkey] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(0);
  const lastInteract = useRef<number>(Date.now());
  const visible = useRef<boolean>(true);
  const intersection = useRef<number>(1);

  const capPerDaySec = 20 * 60; // 20 minutes cap
  const canAccumulate = useCallback(() => {
    const fresh = Date.now() - lastInteract.current < 60_000; // interacted in last 60s
    return visible.current && intersection.current >= 0.7 && fresh;
  }, []);

  // Load initial progress & wallet
  useEffect(() => {
    setSeconds(getProgress());
    const k = localStorage.getItem(WALLET_KEY);
    if (k) setPubkey(k);
  }, []);

  // Track visibility
  useEffect(() => {
    const onVis = () => {
      visible.current = !document.hidden;
    };
    document.addEventListener("visibilitychange", onVis);
    onVis();
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // Track interactions
  useEffect(() => {
    const bump = () => (lastInteract.current = Date.now());
    window.addEventListener("click", bump);
    window.addEventListener("keydown", bump);
    window.addEventListener("scroll", bump);
    bump();
    return () => {
      window.removeEventListener("click", bump);
      window.removeEventListener("keydown", bump);
      window.removeEventListener("scroll", bump);
    };
  }, []);

  // Intersection of the reading area (whole page)
  const containerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        intersection.current = entries[0]?.intersectionRatio ?? 0;
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Timer loop
  useEffect(() => {
    const id = setInterval(() => {
      if (seconds >= capPerDaySec) return;
      if (!canAccumulate()) return;
      const next = seconds + 1;
      setSeconds(next);
      setProgress(next);
    }, 1000);
    return () => clearInterval(id);
  }, [seconds, canAccumulate]);

  const minutes = Math.floor(seconds / 60);
  const secondsPart = seconds % 60;
  const progressPct = Math.min(100, Math.round((seconds / capPerDaySec) * 100));

  const doClaim = async () => {
    if (!pubkey) {
      alert("Connect wallet terlebih dahulu (mock).");
      return;
    }
    if (seconds < 60) {
      alert("Minimal 1 menit untuk klaim.");
      return;
    }
    setClaiming(true);
    try {
      const availableMinutes = Math.floor(seconds / 60) - claimed;
      if (availableMinutes <= 0) {
        alert("Tidak ada menit baru untuk diklaim.");
        return;
      }
      const current = getBalance(pubkey);
      const toAdd = availableMinutes; // 1 poin per menit
      setBalance(pubkey, current + toAdd);
      setClaimed(claimed + availableMinutes);
      pushHistory({
        ts: Date.now(),
        minutes: availableMinutes,
        page,
        note: "mock-claim",
      });
    } finally {
      setClaiming(false);
    }
  };

  const capLeft = Math.max(0, capPerDaySec - seconds);
  const capLeftMin = Math.floor(capLeft / 60);

  return (
    <div ref={containerRef} className="rounded-md border border-black/10 p-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium">Read to Earn (mock)</div>
          <div className="text-xs text-black/60">
            Halaman {page} • Batas harian: 20 menit
          </div>
        </div>
        <div className="text-sm font-mono">
          {minutes.toString().padStart(2, "0")}:
          {secondsPart.toString().padStart(2, "0")}
        </div>
      </div>
      <div className="mt-2 h-2 w-full rounded bg-black/10 overflow-hidden">
        <div className="h-full bg-black" style={{ width: `${progressPct}%` }} />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-black/60">
        <div>Tersisa hari ini: ~{capLeftMin} menit</div>
        <div>
          {pubkey
            ? `Wallet: ${pubkey.slice(0, 4)}...${pubkey.slice(-4)}`
            : "Wallet belum tersambung"}
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          onClick={doClaim}
          disabled={claiming}
          className="rounded-md border border-black px-3 py-1.5 text-sm hover:bg-black hover:text-white disabled:opacity-50"
        >
          {claiming ? "Claiming..." : "Claim Poin (mock)"}
        </button>
        <a
          href="/rewards"
          className="rounded-md border border-black px-3 py-1.5 text-sm hover:bg-black hover:text-white"
        >
          Lihat Reward
        </a>
      </div>
    </div>
  );
}
