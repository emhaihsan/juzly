import ReadTimer from "@/components/ReadTimer";
import NavigationButtons from "@/components/NavigationButtons";

interface Props {
  params: Promise<{ page: string }>;
}

const API_BASE = "https://api.alquran.cloud/v1";

async function fetchUthmaniPage(page: number) {
  const url = `${API_BASE}/page/${page}/quran-uthmani`;
  const res = await fetch(url, { next: { revalidate: 600 } });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  const json = await res.json();
  if (!json?.data?.ayahs) throw new Error("Unexpected API response");
  return json.data as {
    number: number;
    ayahs: Array<{
      number: number;
      text: string;
      surah: { number: number };
      numberInSurah: number;
      page: number;
    }>;
    edition: { identifier: string };
  };
}

export async function generateMetadata({ params }: Props) {
  const { page } = await params;
  const pageNum = Number(page) || 1;
  return { title: `Juzly - Mushaf Page ${pageNum}` };
}

export default async function MushafPage({ params }: Props) {
  const { page } = await params;
  const pageNum = Math.max(1, Math.min(604, Number(page) || 1));

  let data: Awaited<ReturnType<typeof fetchUthmaniPage>> | null = null;
  let error: string | null = null;

  try {
    data = await fetchUthmaniPage(pageNum);
  } catch (e: unknown) {
    error = e instanceof Error ? e.message : "Failed to fetch page";
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-black text-white">
        <main className="mx-auto max-w-6xl px-4 py-6 sm:py-10 space-y-6">
          <h1 className="text-2xl sm:text-3xl font-semibold">Mushaf</h1>
          <p className="text-sm text-white/70">
            Page {pageNum} • quran-uthmani
          </p>
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        </main>
      </div>
    );
  }

  const items = data.ayahs.map((a) => ({
    key: `${a.surah.number}:${a.numberInSurah}`,
    ar: a.text,
  }));

  const prev = pageNum > 1 ? pageNum - 1 : null;
  const next = pageNum < 604 ? pageNum + 1 : null;

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-10 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold">
              Page {pageNum}
            </h1>
            <p className="text-sm text-white/70">
              Mushaf Uthmani <span className="mx-2">•</span>
              <span className="font-[var(--font-amiri)] text-base text-white/80">
                مصحف عثماني
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ReadTimer page={pageNum} />
          </div>
        </div>
        <div className="space-y-4">
          {items.map((v) => (
            <div
              key={v.key + v.ar}
              className="rounded-lg border border-white/10 bg-white/5 p-4"
            >
              <div className="text-right text-xl leading-relaxed font-[var(--font-amiri)]">
                {v.ar}
              </div>
              <div className="text-xs text-white/50 mt-1">Ayah {v.key}</div>
            </div>
          ))}
        </div>
        <NavigationButtons
          currentPage={pageNum}
          prevPage={prev}
          nextPage={next}
        />
      </main>
    </div>
  );
}
