"use client";

import Navbar from "@/components/Navbar";
import HeaderSection from "@/components/HeaderSection";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <Navbar />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:py-10 space-y-6">
        <HeaderSection />

        <section className="grid gap-6 sm:grid-cols-2">
          {/* Quran Card */}
          <div className="rounded-xl border border-black/10 bg-white p-6 shadow-sm flex flex-col">
            <h2 className="text-xl font-semibold">Baca Quran</h2>
            <p className="text-sm text-black/70 mt-1">
              Mulai membaca Al-Qur'an dengan tampilan bersih dan nyaman.
            </p>
            <div className="mt-auto pt-4">
              <Link
                href="/quran"
                className="inline-flex items-center rounded-md border border-black px-4 py-2 text-sm font-medium hover:bg-black hover:text-white transition-colors"
              >
                Masuk ke menu
              </Link>
            </div>
          </div>

          {/* Donation Card */}
          <div className="rounded-xl border border-black/10 bg-white p-6 shadow-sm flex flex-col">
            <h2 className="text-xl font-semibold">On-chain Donation</h2>
            <p className="text-sm text-black/70 mt-1">Coming soon.</p>
            <div className="mt-auto pt-4">
              <button
                disabled
                className="inline-flex items-center rounded-md border border-black/20 bg-black/5 text-black/50 px-4 py-2 text-sm font-medium cursor-not-allowed"
              >
                Segera hadir
              </button>
            </div>
          </div>
        </section>

        {/* Overview Juzly */}
        <section className="rounded-xl border border-black/10 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Mengapa Juzly?</h2>
          <ul className="mt-3 space-y-2 text-sm text-black/80 list-disc pl-5">
            <li>
              <strong>Minimalis & cepat</strong> — fokus pada baca, antarmuka
              hitam-putih yang ringan.
            </li>
            <li>
              <strong>Waktu sholat akurat</strong> — berbasis geolokasi dan zona
              waktu perangkat.
            </li>
            <li>
              <strong>Baca per halaman</strong> — dukung tampilan Mushaf per
              halaman dan terjemahan.
            </li>
            <li>
              <strong>Privasi duluan</strong> — tanpa pelacakan, hanya
              permintaan API publik.
            </li>
            <li>
              <strong>Modular</strong> — komponen rapi, mudah dikembangkan
              (donasi on-chain segera).
            </li>
          </ul>
        </section>
      </main>

      <Footer />
    </div>
  );
}
