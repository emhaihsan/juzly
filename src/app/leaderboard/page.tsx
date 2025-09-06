"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSolanaWallet } from "@web3auth/modal/react/solana";

const LS_BALANCES = "r2e_balances";
const LS_PAGES_READ = "r2e_pages_read";
const LS_WEEKLY_PROGRESS = "r2e_weekly_progress";
const LS_MONTHLY_PROGRESS = "r2e_monthly_progress";

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

function readBalances(): Record<string, number> {
  const raw = localStorage.getItem(LS_BALANCES);
  return raw ? (JSON.parse(raw) as Record<string, number>) : {};
}

function readPagesRead(): Record<string, number[]> {
  const raw = localStorage.getItem(LS_PAGES_READ);
  return raw ? (JSON.parse(raw) as Record<string, number[]>) : {};
}

function readWeeklyProgress(): Record<string, number> {
  const weekKey = getWeekKey();
  const raw = localStorage.getItem(LS_WEEKLY_PROGRESS);
  const data = raw
    ? (JSON.parse(raw) as Record<string, Record<string, number>>)
    : {};
  return data[weekKey] || {};
}

function readMonthlyProgress(): Record<string, number> {
  const monthKey = getMonthKey();
  const raw = localStorage.getItem(LS_MONTHLY_PROGRESS);
  const data = raw
    ? (JSON.parse(raw) as Record<string, Record<string, number>>)
    : {};
  return data[monthKey] || {};
}

function getNFTAchievements(pagesRead: number): string[] {
  const achievements = [];
  if (pagesRead >= 7) achievements.push("🥉 First Week");
  if (pagesRead >= 30) achievements.push("🥈 Monthly Reader");
  if (pagesRead >= 100) achievements.push("🥇 Century Club");
  if (pagesRead >= 300) achievements.push("💎 Diamond Reader");
  if (pagesRead >= 604) achievements.push("👑 Quran Complete");
  return achievements;
}

export default function LeaderboardPage() {
  const { accounts } = useSolanaWallet();
  const pubkey = accounts?.[0] || null;

  const [view, setView] = useState<"all-time" | "weekly" | "monthly">("weekly");
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [pagesRead, setPagesRead] = useState<Record<string, number[]>>({});
  const [weeklyProgress, setWeeklyProgress] = useState<Record<string, number>>(
    {}
  );
  const [monthlyProgress, setMonthlyProgress] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    const loadData = () => {
      const bal = readBalances();
      const pages = readPagesRead();
      const weekly = readWeeklyProgress();
      const monthly = readMonthlyProgress();

      // Ensure demo data for hackathon
      if (Object.keys(bal).length < 5) {
        const demoUsers = [
          {
            id: "DemoAhmad123",
            tokens: Math.floor(1_000_000 * 0.15),
            pages: 90,
            weekly: 15,
            monthly: 45,
          },
          {
            id: "DemoFatima456",
            tokens: Math.floor(1_000_000 * 0.12),
            pages: 72,
            weekly: 12,
            monthly: 36,
          },
          {
            id: "DemoUmar789",
            tokens: Math.floor(1_000_000 * 0.1),
            pages: 60,
            weekly: 10,
            monthly: 30,
          },
          {
            id: "DemoAisha012",
            tokens: Math.floor(1_000_000 * 0.08),
            pages: 48,
            weekly: 8,
            monthly: 24,
          },
          {
            id: "DemoAli345",
            tokens: Math.floor(1_000_000 * 0.06),
            pages: 36,
            weekly: 6,
            monthly: 18,
          },
        ];

        demoUsers.forEach((user) => {
          if (!bal[user.id]) {
            bal[user.id] = user.tokens;
            pages[user.id] = Array.from(
              { length: user.pages },
              (_, i) => i + 1
            );
            weekly[user.id] = user.weekly;
            monthly[user.id] = user.monthly;
          }
        });

        localStorage.setItem(LS_BALANCES, JSON.stringify(bal));
        localStorage.setItem(LS_PAGES_READ, JSON.stringify(pages));
        localStorage.setItem(
          LS_WEEKLY_PROGRESS,
          JSON.stringify({ [getWeekKey()]: weekly })
        );
        localStorage.setItem(
          LS_MONTHLY_PROGRESS,
          JSON.stringify({ [getMonthKey()]: monthly })
        );
      }

      setBalances(bal);
      setPagesRead(pages);
      setWeeklyProgress(weekly);
      setMonthlyProgress(monthly);
    };

    loadData();
    const interval = setInterval(loadData, 5000); // Refresh every 5 seconds for active leaderboard
    return () => clearInterval(interval);
  }, []);

  const leaderboardData = useMemo(() => {
    let data: Array<{
      user: string;
      score: number;
      pages: number;
      achievements: string[];
      juzTokens: number;
    }> = [];

    if (view === "weekly") {
      data = Object.entries(weeklyProgress).map(([user, pages]) => ({
        user,
        score: pages,
        pages: pagesRead[user]?.length || 0,
        achievements: getNFTAchievements(pagesRead[user]?.length || 0),
        juzTokens: balances[user] || 0,
      }));
    } else if (view === "monthly") {
      data = Object.entries(monthlyProgress).map(([user, pages]) => ({
        user,
        score: pages,
        pages: pagesRead[user]?.length || 0,
        achievements: getNFTAchievements(pagesRead[user]?.length || 0),
        juzTokens: balances[user] || 0,
      }));
    } else {
      data = Object.entries(balances).map(([user, tokens]) => ({
        user,
        score: Math.floor((tokens / 1_000_000) * 20), // Convert tokens to page equivalent for sorting
        pages: pagesRead[user]?.length || 0,
        achievements: getNFTAchievements(pagesRead[user]?.length || 0),
        juzTokens: tokens,
      }));
    }

    return data.sort((a, b) => b.score - a.score).slice(0, 20);
  }, [view, balances, pagesRead, weeklyProgress, monthlyProgress]);

  const myRank = useMemo(() => {
    if (!pubkey) return null;
    const index = leaderboardData.findIndex((item) => item.user === pubkey);
    return index >= 0 ? index + 1 : null;
  }, [leaderboardData, pubkey]);

  const getScoreLabel = () => {
    switch (view) {
      case "weekly":
        return "Pages This Week";
      case "monthly":
        return "Pages This Month";
      default:
        return "JUZ Tokens";
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-10 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold">
              Active Leaderboard 🏆
            </h1>
            <p className="text-sm text-white/60">
              Live rankings • Updates every 5 seconds
              {myRank && ` • Your rank: #${myRank}`}
            </p>
          </div>
          <Link
            href="/rewards"
            className="inline-flex items-center rounded-md border border-white/30 px-3 py-1.5 text-sm hover:bg-white hover:text-black transition-colors"
          >
            My Rewards
          </Link>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 p-1 bg-white/5 rounded-lg w-fit">
          {(["weekly", "monthly", "all-time"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors capitalize ${
                view === v ? "bg-white text-black" : "hover:bg-white/10"
              }`}
            >
              {v === "all-time" ? "All Time" : v}
            </button>
          ))}
        </div>

        {/* Current Period Info */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm text-white/60">
            {view === "weekly" && `Current Week: ${getWeekKey()}`}
            {view === "monthly" && `Current Month: ${getMonthKey()}`}
            {view === "all-time" &&
              "All-time rankings based on JUZ token earnings (1 token = 20 pages)"}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 sm:p-6">
          <div className="grid grid-cols-12 text-xs font-medium uppercase text-white/60 mb-4">
            <div className="col-span-1">Rank</div>
            <div className="col-span-3">User</div>
            <div className="col-span-2 text-center">{getScoreLabel()}</div>
            <div className="col-span-2 text-center">JUZ Tokens</div>
            <div className="col-span-1 text-center">Pages</div>
            <div className="col-span-3 text-center">NFT Achievements</div>
          </div>

          <div className="divide-y divide-white/10">
            {leaderboardData.map((item, idx) => (
              <div
                key={item.user + idx}
                className={`grid grid-cols-12 py-3 text-sm ${
                  pubkey && item.user === pubkey
                    ? "bg-yellow-500/10 border-l-4 border-yellow-400 pl-2"
                    : ""
                }`}
              >
                <div className="col-span-1 font-semibold">
                  {idx === 0 && "🥇"}
                  {idx === 1 && "🥈"}
                  {idx === 2 && "🥉"}
                  {idx > 2 && `#${idx + 1}`}
                </div>
                <div className="col-span-3 font-mono text-xs">
                  {item.user.slice(0, 8)}...{item.user.slice(-6)}
                  {pubkey && item.user === pubkey && (
                    <span className="ml-2 text-yellow-400 font-normal">
                      (You)
                    </span>
                  )}
                </div>
                <div className="col-span-2 text-center font-semibold">
                  {view === "all-time"
                    ? (item.juzTokens / 1_000_000).toFixed(3)
                    : item.score}
                </div>
                <div className="col-span-2 text-center text-green-400 font-medium">
                  {(item.juzTokens / 1_000_000).toFixed(3)}
                </div>
                <div className="col-span-1 text-center text-white/70">
                  {item.pages}
                </div>
                <div className="col-span-3 text-center text-xs">
                  {item.achievements.length > 0 ? (
                    <div className="flex flex-wrap gap-1 justify-center">
                      {item.achievements.slice(0, 2).map((achievement, i) => (
                        <span
                          key={i}
                          className="bg-white/10 px-1.5 py-0.5 rounded text-xs"
                        >
                          {achievement}
                        </span>
                      ))}
                      {item.achievements.length > 2 && (
                        <span className="text-white/50">
                          +{item.achievements.length - 2}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-white/40">-</span>
                  )}
                </div>
              </div>
            ))}

            {leaderboardData.length === 0 && (
              <div className="py-8 text-center text-white/60">
                No data for this period.
              </div>
            )}
          </div>
        </div>

        {/* Motivation Section */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-3">
            🌱 Motivation & Reflection
          </h2>
          <div className="space-y-4 text-sm">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="font-medium mb-1">Faith in Action</div>
              <div className="text-white/80">
                Our hands are the tools Allah has given us to make a positive
                impact. Every small action done for the sake of faith multiplies
                in reward, both in this world and the next.
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="font-medium mb-1">The Gift of Guidance</div>
              <div className="text-white/80">
                The Quran is not just a book to be read&mdash;it&apos;s a light
                to live by. Embracing its teachings and striving to embody them
                transforms our lives and those around us.
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="font-medium mb-1">Continuous Growth</div>
              <div className="text-white/80">
                Every day is a new opportunity to learn, give, and grow. Let’s
                be motivated to take even one step closer to our Creator,
                knowing that every sincere effort is valued.
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action Section */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-3">
            🤲 Make Your Faith Meaningful
          </h2>
          <div className="space-y-4 text-sm">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="font-medium mb-1">Start Today</div>
              <div className="text-white/80">
                Whether it’s reading a single verse, helping someone in need, or
                reflecting upon your blessings, the journey to betterment begins
                now—right in your hands.
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="font-medium mb-1">Empower Your Community</div>
              <div className="text-white/80">
                Share knowledge, inspire others, and build a legacy of goodness.
                Together, we can uplift hearts and strengthen our connection to
                faith.
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="font-medium mb-1">Remember Your Purpose</div>
              <div className="text-white/80">
                Our ultimate goal is to seek the pleasure of Allah. Make each
                action intentional and let your hands be a means of positive
                change, compassion, and remembrance.
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
