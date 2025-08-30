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
    <div className="mx-auto max-w-5xl px-4 py-6 sm:py-10 space-y-6">
      <h1 className="text-2xl sm:text-3xl font-semibold">Mushaf</h1>
      <p className="text-sm text-black/70">
        Pilih Juz untuk mulai membaca dari halaman awal Juz tersebut (format
        Mushaf Pojok).
      </p>

      <section className="rounded-xl border border-black/10 bg-white p-4 sm:p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Pilih Juz</h2>
        <p className="text-sm text-black/70 mt-1">
          Klik salah satu Juz di bawah ini.
        </p>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {juzList.map(({ juz, start }) => (
            <Link
              key={juz}
              href={`/quran/mushaf/${start}`}
              className="flex items-center justify-between rounded-md border border-black px-3 py-2 text-sm hover:bg-black hover:text-white transition-colors"
            >
              <span>Juz {juz}</span>
              <span className="text-xs opacity-70">Hal. {start}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-black/10 bg-white p-4 sm:p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Mulai cepat</h2>
        <p className="text-sm text-black/70 mt-1">Buka dari halaman 1.</p>
        <div className="mt-3">
          <Link
            href="/quran/mushaf/1"
            className="inline-flex items-center rounded-md border border-black px-4 py-2 text-sm font-medium hover:bg-black hover:text-white transition-colors"
          >
            Buka Halaman 1
          </Link>
        </div>
      </section>
    </div>
  );
}
