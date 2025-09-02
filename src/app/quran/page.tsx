import Link from "next/link";

export const metadata = {
  title: "Juzly - Mushaf",
};

function getJuzStartPage(juz: number): number {
  if (juz <= 1) return 1; // Juz 1 starts at page 1
  if (juz >= 30) return 1 + 21 + 28 * 20; // start of Juz 30
  // Juz 2..29: pages before = 21 (Juz1) + (juz-2)*20
  return 1 + 21 + (juz - 2) * 20;
}

export default async function QuranIndexPage() {
  const juzList = Array.from({ length: 30 }, (_, i) => {
    const juz = i + 1;
    const start = getJuzStartPage(juz);
    return { juz, start };
  });

  return (
    <div className="min-h-screen bg-white text-black">
      <main className="mx-auto max-w-5xl px-4 py-6 sm:py-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-semibold">
            📖 Mushaf Al-Qur'an
          </h1>
          <p className="text-black/70 max-w-2xl mx-auto">
            Pilih Juz atau halaman untuk mulai membaca Al-Qur'an dan dapatkan
            JUZ token sebagai reward.
          </p>
        </div>

        {/* Quick Start Options */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/quran/mushaf/1"
            className="rounded-xl border border-black/10 bg-gradient-to-br from-green-50 to-emerald-50 p-6 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="text-3xl mb-3">🌟</div>
            <h3 className="text-lg font-semibold mb-2">Mulai dari Awal</h3>
            <p className="text-sm text-black/70 mb-4">
              Baca dari Al-Fatihah (Halaman 1) dan dapatkan bonus 2 JUZ token.
            </p>
            <div className="text-sm font-medium text-green-700 group-hover:text-green-800">
              Mulai Membaca →
            </div>
          </Link>

          <Link
            href="/quran/mushaf/302"
            className="rounded-xl border border-black/10 bg-gradient-to-br from-blue-50 to-sky-50 p-6 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="text-3xl mb-3">📍</div>
            <h3 className="text-lg font-semibold mb-2">Juz 16 (Tengah)</h3>
            <p className="text-sm text-black/70 mb-4">
              Mulai dari pertengahan Al-Qur'an, cocok untuk pembaca reguler.
            </p>
            <div className="text-sm font-medium text-blue-700 group-hover:text-blue-800">
              Baca Juz 16 →
            </div>
          </Link>

          <Link
            href="/quran/mushaf/582"
            className="rounded-xl border border-black/10 bg-gradient-to-br from-purple-50 to-violet-50 p-6 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="text-lg font-semibold mb-2">Juz 30 (Akhir)</h3>
            <p className="text-sm text-black/70 mb-4">
              Baca surat-surat pendek yang familiar, mudah untuk pemula.
            </p>
            <div className="text-sm font-medium text-purple-700 group-hover:text-purple-800">
              Baca Juz 30 →
            </div>
          </Link>
        </section>

        {/* All Juz Selection */}
        <section className="rounded-xl border border-black/10 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Pilih Juz (1-30)</h2>
            <div className="text-sm text-black/60">
              Klik untuk mulai dari halaman pertama Juz
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {juzList.map(({ juz, start }) => (
              <Link
                key={juz}
                href={`/quran/mushaf/${start}`}
                className="flex flex-col items-center justify-center rounded-lg border border-black/10 p-4 text-center hover:bg-black hover:text-white transition-colors group"
              >
                <div className="text-lg font-bold mb-1">Juz {juz}</div>
                <div className="text-xs opacity-70">Hal. {start}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* Reading Tips */}
        <section className="rounded-xl border border-black/10 bg-gradient-to-r from-orange-50 to-yellow-50 p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-3">💡 Tips Membaca</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Minimal 1 menit per halaman untuk mendapat reward</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Halaman 1-2 hanya butuh 30 detik</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Dapatkan 1/604 JUZ token per halaman selesai</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-blue-600">🎁</span>
                <span>Bonus 0.5 JUZ untuk Al-Fatihah (halaman 1)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-purple-600">🏆</span>
                <span>NFT achievement untuk milestone tertentu</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-orange-600">🔥</span>
                <span>Tidak ada batas waktu - baca sepuasnya!</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
