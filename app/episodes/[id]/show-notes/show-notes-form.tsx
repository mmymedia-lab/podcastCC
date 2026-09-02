"use client";

import { useState } from "react";
import { updateShowNotesAction } from "./actions";

export function ShowNotesForm({
  episodeId,
  initialDraft,
  initialExternalUrl,
  outlineText,
}: {
  episodeId: string;
  initialDraft: string;
  initialExternalUrl: string;
  outlineText: string;
}) {
  const [draft, setDraft] = useState(initialDraft);
  const [aiStatus, setAiStatus] = useState<"idle" | "loading" | "error">("idle");
  const [aiError, setAiError] = useState("");

  async function requestAiDraft() {
    setAiStatus("loading");
    setAiError("");
    try {
      const response = await fetch("/api/ai/show-notes-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outlineText }),
      });
      const data = await response.json();
      if (!response.ok) {
        setAiError(data.error ?? "Gagal membuat draft show notes.");
        setAiStatus("error");
        return;
      }
      setDraft(data.draft ?? "");
      setAiStatus("idle");
    } catch {
      setAiError("Gagal membuat draft show notes (koneksi bermasalah).");
      setAiStatus("error");
    }
  }

  return (
    <form action={updateShowNotesAction.bind(null, episodeId)}>
      <div>
        <label htmlFor="draft">Draft show notes</label>
        <br />
        <button type="button" onClick={() => setDraft(outlineText)} disabled={!outlineText}>
          Isi dari Outline
        </button>{" "}
        <button type="button" onClick={requestAiDraft} disabled={aiStatus === "loading"}>
          {aiStatus === "loading" ? "Membuat draft..." : "Draft dengan AI"}
        </button>
        {aiStatus === "error" && (
          <p role="alert">{aiError} — kamu tetap bisa isi/edit draft manual di bawah.</p>
        )}
        <br />
        <textarea
          id="draft"
          name="draft"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          rows={10}
          style={{ width: "100%", maxWidth: "40rem" }}
        />
      </div>
      <div>
        <label htmlFor="externalUrl">Link show notes final (opsional, mis. Google Docs)</label>
        <br />
        <input id="externalUrl" name="externalUrl" type="url" defaultValue={initialExternalUrl} />
      </div>
      <button type="submit">Simpan</button>
    </form>
  );
}
