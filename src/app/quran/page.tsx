"use client";

import Link from "next/link";
import { useState } from "react";

function getJuzStartPage(juz: number): number {
  if (juz <= 1) return 1; // Juz 1 starts at page 1
  if (juz >= 30) return 1 + 21 + 28 * 20; // start of Juz 30
  // Juz 2..29: pages before = 21 (Juz1) + (juz-2)*20
  return 1 + 21 + (juz - 2) * 20;
}

export default function QuranIndexPage() {
  const [goToJuz, setGoToJuz] = useState("");
  const [goToPage, setGoToPage] = useState("");

  const juzList = Array.from({ length: 30 }, (_, i) => {
    const juz = i + 1;
    const start = getJuzStartPage(juz);
    return { juz, start };
  });

  const handleGoToJuz = () => {
    const juzNum = parseInt(goToJuz);
    if (juzNum >= 1 && juzNum <= 30) {
      const startPage = getJuzStartPage(juzNum);
      window.location.href = `/quran/mushaf/${startPage}`;
    }
  };

  const handleGoToPage = () => {
    const pageNum = parseInt(goToPage);
    if (pageNum >= 1 && pageNum <= 604) {
      window.location.href = `/quran/mushaf/${pageNum}`;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-semibold">📖 Holy Quran</h1>
          <p className="text-white/70 max-w-2xl mx-auto">
            Choose a Juz or page to start reading the Holy Quran and earn JUZ
            tokens as rewards.
          </p>
        </div>

        {/* Go To Navigation */}
        <section className="border border-white/10 bg-white/5 p-6 rounded-xl">
          <h2 className="text-xl font-semibold mb-4">
            🎯 Go To Specific Location
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="block text-sm font-medium">
                Go to Juz (1-30)
              </label>
              <div className="flex gap-3">
                <input
                  type="number"
                  placeholder="Enter Juz number"
                  value={goToJuz}
                  onChange={(e) => setGoToJuz(e.target.value)}
                  className="flex-1 px-4 py-2 border border-white/30 rounded-lg bg-black text-white placeholder-white/40 focus:ring-2 focus:ring-white focus:border-transparent"
                  min="1"
                  max="30"
                />
                <button
                  onClick={handleGoToJuz}
                  disabled={
                    !goToJuz || parseInt(goToJuz) < 1 || parseInt(goToJuz) > 30
                  }
                  className="px-6 py-2 bg-white text-black rounded-lg hover:bg-white/90 disabled:opacity-50 transition-colors"
                >
                  Go
                </button>
              </div>
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-medium">
                Go to Page (1-604)
              </label>
              <div className="flex gap-3">
                <input
                  type="number"
                  placeholder="Enter page number"
                  value={goToPage}
                  onChange={(e) => setGoToPage(e.target.value)}
                  className="flex-1 px-4 py-2 border border-white/30 rounded-lg bg-black text-white placeholder-white/40 focus:ring-2 focus:ring-white focus:border-transparent"
                  min="1"
                  max="604"
                />
                <button
                  onClick={handleGoToPage}
                  disabled={
                    !goToPage ||
                    parseInt(goToPage) < 1 ||
                    parseInt(goToPage) > 604
                  }
                  className="px-6 py-2 bg-white text-black rounded-lg hover:bg-white/90 disabled:opacity-50 transition-colors"
                >
                  Go
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Start Options */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/quran/mushaf/1"
            className="rounded-xl border border-white/10 bg-white/5 p-6 hover:border-white/30 hover:bg-white/10 transition-all group"
          >
            <div className="text-3xl mb-3">🌟</div>
            <h3 className="text-lg font-semibold mb-2">Start from Beginning</h3>
            <p className="text-sm text-white/70 mb-4">
              Read from Al-Fatihah (Page 1) and get bonus 0.1 JUZ tokens.
            </p>
            <div className="text-sm font-medium text-white/90 group-hover:text-white">
              Start Reading →
            </div>
          </Link>

          <Link
            href="/quran/mushaf/302"
            className="rounded-xl border border-white/10 bg-white/5 p-6 hover:border-white/30 hover:bg-white/10 transition-all group"
          >
            <div className="text-3xl mb-3">📍</div>
            <h3 className="text-lg font-semibold mb-2">Juz 16 (Middle)</h3>
            <p className="text-sm text-white/70 mb-4">
              Start from the middle of the Quran, perfect for regular readers.
            </p>
            <div className="text-sm font-medium text-white/90 group-hover:text-white">
              Read Juz 16 →
            </div>
          </Link>

          <Link
            href="/quran/mushaf/582"
            className="rounded-xl border border-white/10 bg-white/5 p-6 hover:border-white/30 hover:bg-white/10 transition-all group"
          >
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="text-lg font-semibold mb-2">Juz 30 (End)</h3>
            <p className="text-sm text-white/70 mb-4">
              Read familiar short chapters, easy for beginners.
            </p>
            <div className="text-sm font-medium text-white/90 group-hover:text-white">
              Read Juz 30 →
            </div>
          </Link>
        </section>

        {/* All Juz Selection */}
        <section className="rounded-xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Choose Juz (1-30)</h2>
            <div className="text-sm text-white/60">
              Click to start from the first page of Juz
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {juzList.map(({ juz, start }) => (
              <Link
                key={juz}
                href={`/quran/mushaf/${start}`}
                className="flex flex-col items-center justify-center rounded-lg border border-white/10 p-4 text-center hover:bg-white hover:text-black transition-colors group"
              >
                <div className="text-lg font-bold mb-1">Juz {juz}</div>
                <div className="text-xs opacity-70">Page {start}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* Reading Tips */}
        <section className="rounded-xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold mb-3">💡 Reading Tips</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>
                  Begin with sincere intention (niyyah) for Allah’s sake
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>
                  Start by seeking refuge (isti&apos;adhah) and saying Bismillah
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>
                  Read with correct pronunciation (tajweed) and take your time
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-blue-400">📖</span>
                <span>Reflect on the meanings and ponder the message</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-purple-400">🕰️</span>
                <span>
                  Set a regular routine, even if you read a small portion daily
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-orange-400">🧼</span>
                <span>
                  Make sure you are in a state of physical cleanliness (wudu)
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
