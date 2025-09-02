"use client";

import HeaderSection from "@/components/HeaderSection";
import Footer from "@/components/Footer";
import SolanaDemo from "@/components/SolanaDemo";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:py-10 space-y-6">
        <HeaderSection />

        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Quran Card */}
          <div className="rounded-xl border border-black/10 bg-white p-6 shadow-sm flex flex-col">
            <div className="text-4xl mb-3">📖</div>
            <h2 className="text-xl font-semibold">Baca Quran</h2>
            <p className="text-sm text-black/70 mt-1 flex-1">
              Mulai membaca Al-Qur'an dengan tampilan bersih dan nyaman.
              Dapatkan JUZ token untuk setiap menit membaca.
            </p>
            <div className="mt-auto pt-4">
              <Link
                href="/quran"
                className="inline-flex items-center rounded-md border border-black px-4 py-2 text-sm font-medium hover:bg-black hover:text-white transition-colors"
              >
                Mulai Membaca
              </Link>
            </div>
          </div>

          {/* Marketplace Card */}
          <div className="rounded-xl border border-black/10 bg-gradient-to-br from-purple-50 to-blue-50 p-6 shadow-sm flex flex-col">
            <div className="text-4xl mb-3">🛍️</div>
            <h2 className="text-xl font-semibold">JUZ Marketplace</h2>
            <p className="text-sm text-black/70 mt-1 flex-1">
              Tukarkan JUZ token dengan merchandise Islami, NFT digital, dan
              donasi amal.
            </p>
            <div className="mt-auto pt-4">
              <Link
                href="/marketplace"
                className="inline-flex items-center rounded-md bg-black text-white px-4 py-2 text-sm font-medium hover:bg-black/80 transition-colors"
              >
                Lihat Marketplace
              </Link>
            </div>
          </div>

          {/* Leaderboard Card */}
          <div className="rounded-xl border border-black/10 bg-gradient-to-br from-yellow-50 to-orange-50 p-6 shadow-sm flex flex-col">
            <div className="text-4xl mb-3">🏆</div>
            <h2 className="text-xl font-semibold">Leaderboard</h2>
            <p className="text-sm text-black/70 mt-1 flex-1">
              Lihat ranking pembaca Al-Qur'an dan raih NFT achievement untuk
              pencapaian terbaik.
            </p>
            <div className="mt-auto pt-4">
              <Link
                href="/leaderboard"
                className="inline-flex items-center rounded-md border border-orange-600 text-orange-600 px-4 py-2 text-sm font-medium hover:bg-orange-600 hover:text-white transition-colors"
              >
                Lihat Ranking
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="rounded-xl border border-black/10 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">
            🚀 Cara Kerja Read-to-Earn
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-black/5">
              <div className="text-3xl mb-2">📖</div>
              <div className="font-medium">1. Baca Quran</div>
              <div className="text-sm text-black/60">
                Minimal 1 menit per halaman
              </div>
            </div>
            <div className="text-center p-4 rounded-lg bg-black/5">
              <div className="text-3xl mb-2">🪙</div>
              <div className="font-medium">2. Dapatkan JUZ</div>
              <div className="text-sm text-black/60">
                1 JUZ per menit + bonus
              </div>
            </div>
            <div className="text-center p-4 rounded-lg bg-black/5">
              <div className="text-3xl mb-2">🎨</div>
              <div className="font-medium">3. Raih NFT</div>
              <div className="text-sm text-black/60">Achievement milestone</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-black/5">
              <div className="text-3xl mb-2">🛍️</div>
              <div className="font-medium">4. Tukar Hadiah</div>
              <div className="text-sm text-black/60">Merchandise & donasi</div>
            </div>
          </div>
        </section>

        {/* Solana Demo */}
        <SolanaDemo />

        {/* Overview Juzly */}
        <section className="rounded-xl border border-black/10 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Mengapa Juzly?</h2>
          <ul className="mt-3 space-y-2 text-sm text-black/80 list-disc pl-5">
            <li>
              <strong>Read-to-Earn</strong> — dapatkan JUZ token dan NFT untuk
              setiap aktivitas membaca Al-Qur'an.
            </li>
            <li>
              <strong>Blockchain Solana</strong> — teknologi Web3 dengan biaya
              transaksi rendah dan kecepatan tinggi.
            </li>
            <li>
              <strong>Marketplace Islami</strong> — tukar token dengan
              merchandise bertemakan Islam dan donasi amal.
            </li>
            <li>
              <strong>Minimalis & cepat</strong> — fokus pada baca, antarmuka
              hitam-putih yang ringan.
            </li>
            <li>
              <strong>Waktu sholat akurat</strong> — berbasis geolokasi dan zona
              waktu perangkat.
            </li>
            <li>
              <strong>Privasi duluan</strong> — tanpa pelacakan, hanya
              permintaan API publik.
            </li>
          </ul>
        </section>
      </main>

      <Footer />
    </div>
  );
}
