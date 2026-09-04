"use client";

import { useState } from "react";
import { updateShowNotesAction } from "./actions";
import {
  BUTTON_PRIMARY,
  BUTTON_SECONDARY,
  FIELD_GROUP,
  FORM,
  INPUT,
  LABEL,
  TEXTAREA,
} from "@/lib/ui-classes";

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
        body: JSON.stringify({ episodeId, outlineText }),
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
    <form action={updateShowNotesAction.bind(null, episodeId)} className={FORM}>
      <div className={FIELD_GROUP}>
        <label htmlFor="draft" className={LABEL}>
          Draft show notes
        </label>
        <div className="mb-2 rounded-lg border border-primary-100 bg-primary-50 p-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setDraft(outlineText)}
              disabled={!outlineText}
              className={BUTTON_SECONDARY}
            >
              Isi dari Outline
            </button>
            <button
              type="button"
              onClick={requestAiDraft}
              disabled={aiStatus === "loading"}
              className={BUTTON_PRIMARY}
            >
              {aiStatus === "loading" ? "Membuat draft..." : "Draft dengan AI"}
            </button>
          </div>
          {aiStatus === "error" && (
            <p role="alert" className="mt-2 text-sm text-danger-700">
              {aiError} — kamu tetap bisa isi/edit draft manual di bawah.
            </p>
          )}
        </div>
        <textarea
          id="draft"
          name="draft"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          rows={10}
          className={TEXTAREA}
        />
      </div>
      <div className={FIELD_GROUP}>
        <label htmlFor="externalUrl" className={LABEL}>
          Link show notes final (opsional, mis. Google Docs)
        </label>
        <input
          id="externalUrl"
          name="externalUrl"
          type="url"
          defaultValue={initialExternalUrl}
          className={INPUT}
        />
      </div>
      <button type="submit" className={BUTTON_PRIMARY}>
        Simpan
      </button>
    </form>
  );
}
