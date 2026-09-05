"use client";

import { useEffect, useState } from "react";
import { formatElapsed } from "../../episodes/[id]/execute/execute-client";

type SessionData = {
  episodeTitle: string;
  host: { name: string } | null;
  activeSegmentIndex: number;
  totalSegments: number;
  activeSegment: {
    title: string;
    talkingPoints: string;
    estimatedMinutes: number;
    segmentStartedAt: string;
  } | null;
  guestQuestions: { id: string; content: string }[];
};

type FetchState = "connecting" | "live" | "not_found" | "expired" | "disconnected";

const POLL_INTERVAL_MS = 4000;

export function TvDisplayClient({ code }: { code: string }) {
  const [state, setState] = useState<FetchState>("connecting");
  const [data, setData] = useState<SessionData | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const response = await fetch(`/api/tv/session/${code}`, { cache: "no-store" });
        if (cancelled) return;
        if (response.status === 404) {
          setState("not_found");
          return;
        }
        if (response.status === 410) {
          setState("expired");
          return;
        }
        if (!response.ok) {
          setState((current) => (current === "connecting" ? "disconnected" : current));
          return;
        }
        const json = (await response.json()) as SessionData;
        setData(json);
        setState("live");
      } catch {
        if (!cancelled) setState((current) => (current === "connecting" ? "disconnected" : current));
      }
    }

    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [code]);

  useEffect(() => {
    if (!data?.activeSegment) return;
    const startedAt = new Date(data.activeSegment.segmentStartedAt).getTime();
    const tick = () => setElapsedMs(Date.now() - startedAt);
    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [data?.activeSegment?.segmentStartedAt]);

  if (state === "not_found" || state === "expired") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-8 text-center text-slate-50">
        <p className="text-2xl">
          {state === "expired"
            ? "Kode ini sudah kedaluwarsa. Minta kode baru dari operator."
            : "Kode tidak ditemukan. Periksa kembali kode yang dimasukkan."}
        </p>
      </main>
    );
  }

  if (state === "connecting" || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-8 text-center text-slate-400">
        <p className="text-2xl">Menyambungkan...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-8 py-12 text-lg leading-relaxed text-slate-50 md:px-16 md:py-16">
      {state === "disconnected" && (
        <p className="fixed right-4 top-4 z-10 rounded-lg border border-amber-700 bg-amber-950/80 px-4 py-2 text-sm text-amber-300 backdrop-blur">
          Koneksi terputus, mencoba lagi...
        </p>
      )}

      <p className="mb-0 text-base text-slate-500">{data.episodeTitle}</p>
      <p className="mt-1 text-base text-slate-500">
        {data.host && <>Host: {data.host.name} · </>}
        {data.totalSegments > 0
          ? `Segmen ${data.activeSegmentIndex + 1} dari ${data.totalSegments}`
          : "Belum ada segmen rundown"}
      </p>

      {data.activeSegment ? (
        <>
          <h1 className="my-4 text-3xl font-bold text-slate-50 md:text-4xl">{data.activeSegment.title}</h1>
          <p className="my-4 font-mono text-6xl font-semibold tabular-nums text-emerald-400 md:text-7xl">
            {formatElapsed(elapsedMs)}
          </p>
          <p className="mb-8 max-w-3xl whitespace-pre-wrap text-xl text-slate-100 md:text-2xl">
            {data.activeSegment.talkingPoints}
          </p>
        </>
      ) : (
        <p className="mt-4 text-slate-400">
          Menunggu operator memulai Mode Eksekusi di episode ini.
        </p>
      )}

      {data.guestQuestions.length > 0 && (
        <div className="mt-4 max-w-2xl">
          <h2 className="mb-3 text-sm uppercase tracking-wide text-slate-500">Pertanyaan Narasumber</h2>
          <ol className="list-decimal space-y-2 pl-6 text-base text-slate-200">
            {data.guestQuestions.map((question) => (
              <li key={question.id} className="whitespace-pre-wrap">
                {question.content}
              </li>
            ))}
          </ol>
        </div>
      )}
    </main>
  );
}
