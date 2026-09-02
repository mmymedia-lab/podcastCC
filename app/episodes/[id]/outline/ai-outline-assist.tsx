"use client";

import { useState } from "react";

export function AiOutlineAssist({ episodeTitle }: { episodeTitle: string }) {
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
        body: JSON.stringify({ episodeTitle }),
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
    <div style={{ border: "1px solid #ccc", padding: "1rem", marginBottom: "1rem" }}>
      <h2>Bantuan AI: Draft Outline</h2>
      <button onClick={requestDraft} disabled={status === "loading"}>
        {status === "loading" ? "Membuat draft..." : "Draft dengan AI"}
      </button>
      {status === "error" && (
        <p role="alert">{errorMessage} — kamu tetap bisa isi poin bicara manual di bawah.</p>
      )}
      {draft && (
        <>
          <p>Salin poin yang relevan ke daftar poin bicara di bawah secara manual:</p>
          <pre style={{ whiteSpace: "pre-wrap", background: "#f5f5f5", padding: "0.75rem" }}>
            {draft}
          </pre>
        </>
      )}
    </div>
  );
}
