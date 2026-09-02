"use client";

import { useEffect, useState } from "react";

type Segment = {
  id: string;
  title: string;
  talkingPoints: string;
  estimatedMinutes: number;
  sessionNote: string | null;
};

// Exported so it can be covered by a unit test once a test runner is set
// up in this project (see PR notes — not yet configured, PRD.md Testing
// Decisions calls this out as the slice most worth isolated coverage).
export function formatElapsed(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export function ExecuteClient({
  episodeTitle,
  segments,
}: {
  episodeTitle: string;
  segments: Segment[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  // Timestamp-based: elapsed is always (now - segmentStartedAt), recomputed
  // every tick from real wall-clock time. If the tab is backgrounded and
  // the interval is throttled/paused, the next tick still lands on the
  // correct elapsed value instead of drifting — unlike a naive counter
  // that increments once per tick and simply misses ticks while hidden.
  const [segmentStartedAt, setSegmentStartedAt] = useState(() => Date.now());
  const [elapsedMs, setElapsedMs] = useState(0);
  const [noteDraft, setNoteDraft] = useState(segments[0]?.sessionNote ?? "");
  const [noteStatus, setNoteStatus] = useState<"idle" | "saving" | "saved">("idle");

  const activeSegment = segments[activeIndex];

  useEffect(() => {
    const tick = () => setElapsedMs(Date.now() - segmentStartedAt);
    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [segmentStartedAt]);

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

  if (!activeSegment) {
    return (
      <main
        style={{ minHeight: "100vh", background: "#0b0b0b", color: "#f5f5f5", padding: "3rem 2rem" }}
      >
        <h1>{episodeTitle}</h1>
        <p>Belum ada segmen rundown. Tambahkan dulu di halaman Rundown episode ini.</p>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0b0b0b",
        color: "#f5f5f5",
        padding: "3rem 2rem",
        fontSize: "1.25rem",
        lineHeight: 1.6,
      }}
    >
      <p style={{ fontSize: "1rem", opacity: 0.6, marginBottom: 0 }}>{episodeTitle}</p>
      <p style={{ fontSize: "1rem", opacity: 0.6, marginTop: "0.25rem" }}>
        Segmen {activeIndex + 1} dari {segments.length} · Estimasi {activeSegment.estimatedMinutes} menit
      </p>

      <h1 style={{ fontSize: "2rem", margin: "0 0 1rem" }}>{activeSegment.title}</h1>

      <p style={{ fontSize: "3.5rem", fontFamily: "monospace", margin: "1rem 0" }}>
        {formatElapsed(elapsedMs)}
      </p>

      <p style={{ whiteSpace: "pre-wrap", marginBottom: "2rem" }}>{activeSegment.talkingPoints}</p>

      <div style={{ marginBottom: "2.5rem" }}>
        <button onClick={() => goToSegment(activeIndex - 1)} disabled={activeIndex === 0}>
          ← Segmen Sebelumnya
        </button>{" "}
        <button
          onClick={() => goToSegment(activeIndex + 1)}
          disabled={activeIndex === segments.length - 1}
        >
          Segmen Berikutnya →
        </button>
      </div>

      <div>
        <label htmlFor="sessionNote">Catatan singkat untuk segmen ini</label>
        <br />
        <textarea
          id="sessionNote"
          value={noteDraft}
          onChange={(event) => {
            setNoteDraft(event.target.value);
            setNoteStatus("idle");
          }}
          rows={3}
          style={{ width: "100%", maxWidth: "40rem" }}
        />
        <br />
        <button onClick={saveNote} disabled={noteStatus === "saving"}>
          {noteStatus === "saving" ? "Menyimpan..." : "Simpan Catatan"}
        </button>
        {noteStatus === "saved" && <span> Tersimpan.</span>}
      </div>
    </main>
  );
}
