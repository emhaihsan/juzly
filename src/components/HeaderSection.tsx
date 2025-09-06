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
  const [, hStr, mStr] = match;
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
      () => setCoords(null),
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
    <section className="border border-white/10 bg-black text-white p-6">
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1">
          <div className="text-2xl font-bold tracking-wider mb-2">
            {weekdayEN}{" "}
            <span className="text-white/40 font-mono text-lg">
              / {weekdayAR}
            </span>
          </div>
          <div className="text-sm text-white/80 font-mono">{greg}</div>
          <div className="text-xs text-white/60 mt-1 font-mono">{hijri}</div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 text-xs text-white/60 mb-2">
            <div className="w-2 h-2 border border-white/30 rounded-full"></div>
            <span className="font-mono uppercase tracking-wider">LOCATION</span>
          </div>
          <div className="text-sm text-white/80 font-mono max-w-[200px] text-right">
            {place ||
              (coords
                ? `${coords.lat.toFixed(3)}, ${coords.lng.toFixed(3)}`
                : "---")}
          </div>
        </div>
      </div>

      <div className="mt-6 border border-white/10 bg-white/5 p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 bg-white rounded-full"></div>
          <div className="text-xs text-white/60 font-mono uppercase tracking-wider">
            NEXT PRAYER
          </div>
        </div>
        {nextPrayer ? (
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-bold tracking-wide">
                {nextPrayer.name.toUpperCase()}
              </div>
              <div className="text-sm text-white/80 font-mono">
                {nextPrayer.time.toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-white/60 font-mono uppercase">
                TIME LEFT
              </div>
              <div className="text-sm text-white/80 font-mono">
                {diffToHMSLabel(nextPrayer.remainingMs)}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-white/60 font-mono">
            WAITING FOR LOCATION DATA...
          </div>
        )}
      </div>
    </section>
  );
}
