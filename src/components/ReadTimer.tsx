"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useWeb3AuthConnect } from "@web3auth/modal/react";
import { useSolanaWallet } from "@web3auth/modal/react/solana";
import Link from "next/link";

const LS_PROGRESS_PREFIX = "r2e_progress_"; // per day
const LS_BALANCES = "r2e_balances"; // map pubkey->points
const LS_HISTORY = "r2e_history"; // array of {ts, minutes, page, note}
const LS_PAGES_READ = "r2e_pages_read"; // map pubkey->array of completed pages
const LS_WEEKLY_PROGRESS = "r2e_weekly_progress"; // weekly reading tracking
const LS_MONTHLY_PROGRESS = "r2e_monthly_progress"; // monthly reading tracking

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${(d.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
}

function getWeekKey() {
  const d = new Date();
  const year = d.getFullYear();
  const week = Math.ceil(
    (d.getTime() - new Date(year, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000)
  );
  return `${year}-W${week}`;
}

function getMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`;
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

function getPagesRead(pubkey: string): number[] {
  const raw = localStorage.getItem(LS_PAGES_READ);
  const map = raw ? (JSON.parse(raw) as Record<string, number[]>) : {};
  return map[pubkey] || [];
}

function addPageRead(pubkey: string, page: number) {
  const raw = localStorage.getItem(LS_PAGES_READ);
  const map = raw ? (JSON.parse(raw) as Record<string, number[]>) : {};
  if (!map[pubkey]) map[pubkey] = [];
  if (!map[pubkey].includes(page)) {
    map[pubkey].push(page);
    localStorage.setItem(LS_PAGES_READ, JSON.stringify(map));
  }
}

function updateWeeklyProgress(pubkey: string, pages: number) {
  const weekKey = getWeekKey();
  const raw = localStorage.getItem(LS_WEEKLY_PROGRESS);
  const map = raw
    ? (JSON.parse(raw) as Record<string, Record<string, number>>)
    : {};
  if (!map[weekKey]) map[weekKey] = {};
  map[weekKey][pubkey] = (map[weekKey][pubkey] || 0) + pages;
  localStorage.setItem(LS_WEEKLY_PROGRESS, JSON.stringify(map));
}

function updateMonthlyProgress(pubkey: string, pages: number) {
  const monthKey = getMonthKey();
  const raw = localStorage.getItem(LS_MONTHLY_PROGRESS);
  const map = raw
    ? (JSON.parse(raw) as Record<string, Record<string, number>>)
    : {};
  if (!map[monthKey]) map[monthKey] = {};
  map[monthKey][pubkey] = (map[monthKey][pubkey] || 0) + pages;
  localStorage.setItem(LS_MONTHLY_PROGRESS, JSON.stringify(map));
}

function pushHistory(entry: {
  ts: number;
  minutes: number;
  page: number;
  note?: string;
  nftEligible?: boolean;
}) {
  const raw = localStorage.getItem(LS_HISTORY);
  const arr = raw ? (JSON.parse(raw) as any[]) : [];
  arr.unshift(entry);
  localStorage.setItem(LS_HISTORY, JSON.stringify(arr.slice(0, 100)));
}

export default function ReadTimer({ page }: { page: number }) {
  const [seconds, setSeconds] = useState(0);
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [pageCompleted, setPageCompleted] = useState(false);
  const lastInteract = useRef<number>(Date.now());
  const visible = useRef<boolean>(true);
  const intersection = useRef<number>(1);

  // Use real Web3Auth wallet context
  const { isConnected } = useWeb3AuthConnect();
  const { accounts } = useSolanaWallet();
  const pubkey = accounts?.[0] || null;

  // Special rules for pages 1-2 vs 3+
  const isSpecialPage = page <= 2;
  const minReadingTime = isSpecialPage ? 30 : 60; // 30s for pages 1-2, 60s for others

  const canAccumulate = useCallback(() => {
    const fresh = Date.now() - lastInteract.current < 60_000; // interacted in last 60s
    return visible.current && intersection.current >= 0.7 && fresh;
  }, []);

  // Check if page can be claimed (allow multiple times per day)
  useEffect(() => {
    // Remove the page completion check - allow repeat reading for rewards
    setPageCompleted(false);
    setClaimed(false);
  }, [pubkey, page]);

  // Reset timer when page changes - allow fresh start each time
  useEffect(() => {
    setSeconds(0);
    setClaimed(false);
    setPageCompleted(false);
  }, [page, pubkey]);

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
      if (!canAccumulate()) return;
      const next = seconds + 1;
      setSeconds(next);
    }, 1000);
    return () => clearInterval(id);
  }, [seconds, canAccumulate]);

  const minutes = Math.floor(seconds / 60);
  const secondsPart = seconds % 60;

  const doClaim = async () => {
    if (!isConnected || !pubkey) {
      alert("Please connect your wallet first.");
      return;
    }
    if (seconds < minReadingTime) {
      alert(`Minimum ${minReadingTime} seconds required to claim this page.`);
      return;
    }
    if (claimed) {
      alert(
        "This page session has already been claimed. Read another page or refresh to read again."
      );
      return;
    }

    setClaiming(true);
    try {
      const current = getBalance(pubkey);
      // Reading reward: 1 JUZ token per minute of reading
      const timeReward = Math.floor((seconds / 60) * 1_000_000); // 1 JUZ per minute

      // Page completion bonus
      const pageBonus = 500_000; // 0.5 JUZ for completing any page

      // Special page bonuses
      let specialBonus = 0;
      if (page === 1) specialBonus = 2_000_000; // 2 JUZ bonus for Al-Fatihah
      if (page === 2) specialBonus = 1_500_000; // 1.5 JUZ bonus for start of Al-Baqarah
      if (page === 604) specialBonus = 5_000_000; // 5 JUZ bonus for completing Quran

      const totalReward = timeReward + pageBonus + specialBonus;
      setBalance(pubkey, current + totalReward);
      setClaimed(true);
      setPageCompleted(true);

      // Track this reading session (not permanent page completion)
      const pagesRead = getPagesRead(pubkey);
      addPageRead(pubkey, page); // Track for statistics
      updateWeeklyProgress(pubkey, 1);
      updateMonthlyProgress(pubkey, 1);

      // Check for NFT eligibility (every 10 pages read)
      const totalPagesReadThisSession = pagesRead.length + 1;
      const isNftEligible =
        totalPagesReadThisSession > 0 && totalPagesReadThisSession % 10 === 0;

      pushHistory({
        ts: Date.now(),
        minutes: Math.floor(seconds / 60),
        page,
        note: `reading-session-${totalReward}`,
        nftEligible: isNftEligible,
      });

      if (isNftEligible) {
        alert(
          `🎁 NFT Reward Available! You've completed ${totalPagesReadThisSession} reading sessions and earned a special NFT!`
        );
      }

      alert(
        `🎉 Reading Rewards Earned!\n\n` +
          `⏱️ Time Reward: ${(timeReward / 1_000_000).toFixed(2)} JUZ\n` +
          `📄 Page Bonus: ${(pageBonus / 1_000_000).toFixed(2)} JUZ\n` +
          `⭐ Special Bonus: ${(specialBonus / 1_000_000).toFixed(2)} JUZ\n` +
          `💰 Total: ${(totalReward / 1_000_000).toFixed(2)} JUZ tokens\n\n` +
          `Go to Rewards page to mint these tokens to blockchain!`
      );
    } finally {
      setClaiming(false);
    }
  };

  const progressToComplete = Math.max(0, minReadingTime - seconds);

  return (
    <div ref={containerRef} className="rounded-md border border-black/10 p-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium">
            Read to Earn {pageCompleted && "✅"}
          </div>
          <div className="text-xs text-black/60">
            Page {page} • Min: {minReadingTime}s • Reward:{" "}
            {(
              (Math.floor(1_000_000 / 20) +
                (page === 1 ? 100_000 : page === 604 ? 1_000_000 : 0)) /
              1_000_000
            ).toFixed(3)}{" "}
            JUZ
          </div>
        </div>
        <div className="text-sm font-mono">
          {minutes.toString().padStart(2, "0")}:
          {secondsPart.toString().padStart(2, "0")}
        </div>
      </div>

      {/* Progress bar for page completion */}
      <div className="mt-2 h-2 w-full rounded bg-black/10 overflow-hidden">
        <div
          className={`h-full transition-colors ${
            pageCompleted ? "bg-green-500" : "bg-black"
          }`}
          style={{
            width: `${Math.min(100, (seconds / minReadingTime) * 100)}%`,
          }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-black/60">
        <div>
          {!pageCompleted && progressToComplete > 0
            ? `${progressToComplete}s remaining to complete`
            : pageCompleted
            ? "Page completed! Continue to next page."
            : "Ready to claim!"}
        </div>
        <div>
          {isConnected && pubkey
            ? `${pubkey.slice(0, 4)}...${pubkey.slice(-4)}`
            : "Wallet not connected"}
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          onClick={doClaim}
          disabled={claiming || !isConnected || !pubkey || claimed}
          className="rounded-md border border-black px-3 py-1.5 text-sm hover:bg-black hover:text-white disabled:opacity-50 transition-colors"
        >
          {claiming
            ? "Claiming..."
            : claimed
            ? "Claimed This Session"
            : seconds >= minReadingTime
            ? "Claim JUZ Rewards"
            : `Read ${Math.ceil(
                (minReadingTime - seconds) / 60
              )}+ min to claim`}
        </button>
        <Link
          href="/rewards"
          className="rounded-md border border-blue-600 text-blue-600 px-3 py-1.5 text-sm hover:bg-blue-600 hover:text-white transition-colors"
        >
          My Rewards ({(getBalance(pubkey || "") / 1_000_000).toFixed(1)} JUZ)
        </Link>
      </div>
    </div>
  );
}
