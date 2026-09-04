"use client";

import { useState } from "react";
import { BUTTON_PRIMARY } from "@/lib/ui-classes";

export function AiOutlineAssist({
  episodeId,
  episodeTitle,
}: {
  episodeId: string;
  episodeTitle: string;
}) {
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function requestDraft() {
    setStatus("loading");
    setErrorMessage("");
    try {
      const response = await fetch("/api/ai/outline-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ episodeId, episodeTitle }),
      });
      const data = await response.json();
      if (!response.ok) {
        setErrorMessage(data.error ?? "Gagal membuat draft outline.");
        setStatus("error");
        return;
      }
      setDraft(data.draft ?? "");
      setStatus("idle");
    } catch {
      setErrorMessage("Gagal membuat draft outline (koneksi bermasalah).");
      setStatus("error");
    }
  }

  return (
    <div className="mb-4 rounded-lg border border-primary-100 bg-primary-50 p-4">
      <h2 className="mb-2 text-sm font-semibold text-primary-800">Bantuan AI: Draft Outline</h2>
      <button
        onClick={requestDraft}
        disabled={status === "loading"}
        className={BUTTON_PRIMARY}
      >
        {status === "loading" ? "Membuat draft..." : "Draft dengan AI"}
      </button>
      {status === "error" && (
        <p role="alert" className="mt-2 text-sm text-danger-700">
          {errorMessage} — kamu tetap bisa isi poin bicara manual di bawah.
        </p>
      )}
      {draft && (
        <>
          <p className="mt-3 text-sm text-slate-700">
            Salin poin yang relevan ke daftar poin bicara di bawah secara manual:
          </p>
          <pre className="mt-2 whitespace-pre-wrap rounded-md bg-white p-3 text-sm text-slate-800">
            {draft}
          </pre>
        </>
      )}
    </div>
  );
}
