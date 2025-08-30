"use client";

import { useEffect, useMemo, useState } from "react";

type Timings = {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
};

function formatWeekdayEN(date: Date) {
  return new Intl.DateTimeFormat("en-US", { weekday: "long" })
    .format(date)
    .toUpperCase();
}

function formatWeekdayAR(date: Date) {
  try {
    return new Intl.DateTimeFormat("ar-SA", { weekday: "long" }).format(date);
  } catch {
    return "";
  }
}

function formatGregorianEN(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function formatHijriEN(date: Date) {
  const locales = [
    "en-GB-u-ca-islamic",
    "en-US-u-ca-islamic",
    "ar-SA-u-ca-islamic",
  ] as const;
  for (const loc of locales) {
    try {
      return new Intl.DateTimeFormat(loc, {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date);
    } catch {}
  }
  return "-";
}

function parseTimeToDate(time: string, base: Date) {
  const match = time.match(/(\d{1,2}):(\d{2})/);
  if (!match) return null;
  const [_, hStr, mStr] = match;
  const d = new Date(base);
  d.setHours(parseInt(hStr, 10), parseInt(mStr, 10), 0, 0);
  return d;
}

function diffToHMSLabel(ms: number) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = Math.floor(totalSec % 60);
  const parts = [] as string[];
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(" ") + " left";
}

export default function HeaderSection() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [place, setPlace] = useState<string>("");
  const [timings, setTimings] = useState<Timings | null>(null);
  const [nowTick, setNowTick] = useState<Date>(new Date());
  const todayStatic = useMemo(() => new Date(), []);

  // Request location once
  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoords(c);
      },
      () => {
        setCoords(null);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 300000 }
    );
  }, []);

  // Reverse geocode (best-effort)
  useEffect(() => {
    const run = async () => {
      if (!coords) return;
      try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.lat}&lon=${coords.lng}`;
        const res = await fetch(url, {
          headers: { Accept: "application/json" },
        });
        const data = await res.json();
        const city =
          data?.address?.city || data?.address?.town || data?.address?.village;
        const state = data?.address?.state;
        const display = [city, state].filter(Boolean).join(", ");
        setPlace(
          display || `${coords.lat.toFixed(3)}, ${coords.lng.toFixed(3)}`
        );
      } catch {
        setPlace(`${coords.lat.toFixed(3)}, ${coords.lng.toFixed(3)}`);
      }
    };
    run();
  }, [coords]);

  // Fetch timings
  useEffect(() => {
    const fetchTimings = async (lat: number, lng: number) => {
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const url = `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=2&school=0&timezonestring=${encodeURIComponent(
          tz
        )}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data?.data?.timings) {
          const t: Timings = data.data.timings;
          setTimings({
            Fajr: t.Fajr,
            Dhuhr: t.Dhuhr,
            Asr: t.Asr,
            Maghrib: t.Maghrib,
            Isha: t.Isha,
          });
        }
      } catch {}
    };
    if (coords) fetchTimings(coords.lat, coords.lng);
  }, [coords]);

  // Tick every second
  useEffect(() => {
    const id = setInterval(() => setNowTick(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const nextPrayer = useMemo(() => {
    if (!timings) return null;
    const order: Array<keyof Timings> = [
      "Fajr",
      "Dhuhr",
      "Asr",
      "Maghrib",
      "Isha",
    ];
    const today = new Date();
    let candidateName: keyof Timings | null = null;
    let candidateTime: Date | null = null;

    for (const name of order) {
      const t = parseTimeToDate(timings[name], today);
      if (!t) continue;
      if (t.getTime() > nowTick.getTime()) {
        candidateName = name;
        candidateTime = t;
        break;
      }
    }
    if (!candidateTime) {
      const fajr = parseTimeToDate(timings.Fajr, today);
      if (fajr) {
        fajr.setDate(fajr.getDate() + 1);
        candidateName = "Fajr";
        candidateTime = fajr;
      }
    }
    if (!candidateTime || !candidateName) return null;
    return {
      name: candidateName,
      time: candidateTime,
      remainingMs: candidateTime.getTime() - nowTick.getTime(),
    };
  }, [timings, nowTick]);

  const weekdayEN = formatWeekdayEN(todayStatic);
  const weekdayAR = formatWeekdayAR(todayStatic);
  const greg = formatGregorianEN(todayStatic);
  const hijri = formatHijriEN(todayStatic);

  return (
    <section className="rounded-2xl border border-black/10 bg-white text-black p-4 sm:p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xl sm:text-2xl font-bold tracking-wide">
            {weekdayEN} <span className="opacity-70">/ {weekdayAR}</span>
          </div>
          <div className="text-sm sm:text-base opacity-90 mt-1">
            {greg} <span className="opacity-60">/ {hijri}</span>
          </div>
        </div>
        <div className="text-xs sm:text-sm opacity-80 flex items-center gap-1">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden
          >
            <path d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
          </svg>
          <span className="truncate max-w-[200px] sm:max-w-[280px]">
            {place ||
              (coords
                ? `${coords.lat.toFixed(3)}, ${coords.lng.toFixed(3)}`
                : "-")}
          </span>
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-black/5 p-3 sm:p-4">
        <div className="text-xs opacity-80">Next prayer</div>
        {nextPrayer ? (
          <div className="mt-1 flex items-center justify-between">
            <div className="text-base sm:text-lg font-semibold">
              {nextPrayer.name}{" "}
              <span className="opacity-80">
                •{" "}
                {nextPrayer.time.toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div className="text-xs sm:text-sm opacity-80">
              {diffToHMSLabel(nextPrayer.remainingMs)}
            </div>
          </div>
        ) : (
          <div className="mt-1 text-sm opacity-80">
            Waiting for location/schedule...
          </div>
        )}
      </div>
    </section>
  );
}
