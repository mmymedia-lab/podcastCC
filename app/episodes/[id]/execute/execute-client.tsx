"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Segment = {
  id: string;
  title: string;
  talkingPoints: string;
  estimatedMinutes: number;
  sessionNote: string | null;
};

type GuestQuestion = {
  id: string;
  content: string;
};

// Exported so it can be covered by a unit test (see formatElapsed.test.ts).
export function formatElapsed(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

const CORNER_BUTTON_CLASS =
  "fixed top-4 z-10 rounded-lg border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm text-slate-300 " +
  "backdrop-blur transition-colors hover:border-slate-500 hover:bg-slate-800 hover:text-slate-50";
const EXIT_LINK_CLASS = `${CORNER_BUTTON_CLASS} right-4`;
const FULLSCREEN_BUTTON_CLASS = `${CORNER_BUTTON_CLASS} right-32`;

export function ExecuteClient({
  episodeId,
  episodeTitle,
  segments,
  guestQuestions,
}: {
  episodeId: string;
  episodeTitle: string;
  segments: Segment[];
  guestQuestions: GuestQuestion[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Timestamp-based: elapsed is always (now - segmentStartedAt), recomputed
  // every tick from real wall-clock time. If the tab is backgrounded and
  // the interval is throttled/paused, the next tick still lands on the
  // correct elapsed value instead of drifting — unlike a naive counter
  // that increments once per tick and simply misses ticks while hidden.
  const [segmentStartedAt, setSegmentStartedAt] = useState(() => Date.now());
  const [elapsedMs, setElapsedMs] = useState(0);
  const [noteDraft, setNoteDraft] = useState(segments[0]?.sessionNote ?? "");
  const [noteStatus, setNoteStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [showQuestions, setShowQuestions] = useState(false);

  const activeSegment = segments[activeIndex];

  useEffect(() => {
    const tick = () => setElapsedMs(Date.now() - segmentStartedAt);
    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [segmentStartedAt]);

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      // Some browsers/TVs refuse fullscreen outside a direct user gesture or
      // don't support the API at all — the page still works fine without it.
    }
  }

  function goToSegment(index: number) {
    if (index < 0 || index >= segments.length) return;
    setActiveIndex(index);
    setSegmentStartedAt(Date.now());
    setNoteDraft(segments[index]?.sessionNote ?? "");
    setNoteStatus("idle");
  }

  async function saveNote() {
    if (!activeSegment) return;
    setNoteStatus("saving");
    try {
      const response = await fetch(`/api/rundown-segments/${activeSegment.id}/note`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: noteDraft }),
      });
      setNoteStatus(response.ok ? "saved" : "idle");
    } catch {
      setNoteStatus("idle");
    }
  }

  const navButtonClass =
    "rounded-lg border border-slate-700 px-6 py-3 text-lg text-slate-200 transition-colors " +
    "hover:border-slate-500 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-30";

  if (!activeSegment) {
    return (
      <main className="min-h-screen bg-slate-950 px-8 py-12 text-slate-50 md:px-16 md:py-16">
        <button onClick={toggleFullscreen} className={FULLSCREEN_BUTTON_CLASS}>
          {isFullscreen ? "⛶ Keluar Fullscreen" : "⛶ Fullscreen"}
        </button>
        <Link href={`/episodes/${episodeId}/rundown`} className={EXIT_LINK_CLASS}>
          ✕ Keluar
        </Link>
        <h1 className="text-2xl font-semibold">{episodeTitle}</h1>
        <p className="mt-2 text-slate-400">
          Belum ada segmen rundown. Tambahkan dulu di halaman Rundown episode ini.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-8 py-12 text-lg leading-relaxed text-slate-50 md:px-16 md:py-16">
      <button onClick={toggleFullscreen} className={FULLSCREEN_BUTTON_CLASS}>
        {isFullscreen ? "⛶ Keluar Fullscreen" : "⛶ Fullscreen"}
      </button>
      <Link href={`/episodes/${episodeId}/rundown`} className={EXIT_LINK_CLASS}>
        ✕ Keluar
      </Link>
      <p className="mb-0 text-base text-slate-500">{episodeTitle}</p>
      <p className="mt-1 text-base text-slate-500">
        Segmen {activeIndex + 1} dari {segments.length} · Estimasi {activeSegment.estimatedMinutes} menit
      </p>

      <h1 className="my-4 text-3xl font-bold text-slate-50 md:text-4xl">{activeSegment.title}</h1>

      <p className="my-4 font-mono text-6xl font-semibold tabular-nums text-emerald-400 md:text-7xl">
        {formatElapsed(elapsedMs)}
      </p>

      <p className="mb-8 max-w-3xl whitespace-pre-wrap text-xl text-slate-100 md:text-2xl">
        {activeSegment.talkingPoints}
      </p>

      <div className="mb-10 flex flex-wrap gap-3">
        <button
          onClick={() => goToSegment(activeIndex - 1)}
          disabled={activeIndex === 0}
          className={navButtonClass}
        >
          ← Segmen Sebelumnya
        </button>
        <button
          onClick={() => goToSegment(activeIndex + 1)}
          disabled={activeIndex === segments.length - 1}
          className={navButtonClass}
        >
          Segmen Berikutnya →
        </button>
      </div>

      {guestQuestions.length > 0 && (
        <div className="mb-10 max-w-2xl">
          <button
            onClick={() => setShowQuestions((value) => !value)}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition-colors hover:border-slate-500 hover:bg-slate-800"
          >
            {showQuestions ? "▲ Sembunyikan Pertanyaan Narasumber" : "▼ Pertanyaan Narasumber"}
          </button>
          {showQuestions && (
            <ol className="mt-3 list-decimal space-y-2 pl-6 text-base text-slate-200">
              {guestQuestions.map((question) => (
                <li key={question.id} className="whitespace-pre-wrap">
                  {question.content}
                </li>
              ))}
            </ol>
          )}
        </div>
      )}

      <div className="max-w-xl">
        <label htmlFor="sessionNote" className="mb-1 block text-sm text-slate-400">
          Catatan singkat untuk segmen ini
        </label>
        <textarea
          id="sessionNote"
          value={noteDraft}
          onChange={(event) => {
            setNoteDraft(event.target.value);
            setNoteStatus("idle");
          }}
          rows={3}
          className="w-full rounded-md border border-slate-700 bg-slate-900 p-3 text-base text-slate-100 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
        />
        <div className="mt-2 flex items-center gap-3">
          <button
            onClick={saveNote}
            disabled={noteStatus === "saving"}
            className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {noteStatus === "saving" ? "Menyimpan..." : "Simpan Catatan"}
          </button>
          {noteStatus === "saved" && <span className="text-sm text-emerald-400">Tersimpan.</span>}
        </div>
      </div>
    </main>
  );
}
