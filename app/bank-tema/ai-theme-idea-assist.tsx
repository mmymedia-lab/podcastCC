"use client";

import { useState } from "react";
import { createThemeIdeaFromTitleAction } from "./actions";
import { CopyButton } from "@/components/ui/CopyButton";
import { BUTTON_PRIMARY, BUTTON_SECONDARY, INPUT } from "@/lib/ui-classes";

export function AiThemeIdeaAssist() {
  const [keyword, setKeyword] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function requestIdeas() {
    setStatus("loading");
    setErrorMessage("");
    try {
      const response = await fetch("/api/ai/theme-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword }),
      });
      const data = await response.json();
      if (!response.ok) {
        setErrorMessage(data.error ?? "Gagal meminta ide AI.");
        setStatus("error");
        return;
      }
      setSuggestions(data.ideas ?? []);
      setStatus("idle");
    } catch {
      setErrorMessage("Gagal meminta ide AI (koneksi bermasalah).");
      setStatus("error");
    }
  }

  return (
    <div className="mb-4 rounded-lg border border-primary-100 bg-primary-50 p-4">
      <h2 className="mb-2 text-sm font-semibold text-primary-800">Bantuan AI: Ide Topik</h2>
      <div className="flex flex-wrap gap-2">
        <input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="Kata kunci/kategori"
          className={`${INPUT} max-w-xs`}
        />
        <button
          onClick={requestIdeas}
          disabled={status === "loading" || !keyword.trim()}
          className={BUTTON_PRIMARY}
        >
          {status === "loading" ? "Meminta..." : "Minta Ide AI"}
        </button>
      </div>
      {status === "error" && (
        <p role="alert" className="mt-2 text-sm text-danger-700">
          {errorMessage} — kamu tetap bisa isi manual di bawah.
        </p>
      )}
      {suggestions.length > 0 && (
        <ul className="mt-3 space-y-2">
          {suggestions.map((suggestion, index) => (
            <li key={index} className="flex items-center justify-between gap-2 text-sm">
              <span>{suggestion}</span>
              <div className="flex items-center gap-2">
                <CopyButton text={suggestion} />
                <form action={createThemeIdeaFromTitleAction.bind(null, suggestion)}>
                  <button type="submit" className={BUTTON_SECONDARY}>
                    + Tambah
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
