"use client";

import { useState } from "react";
import { createScriptBreakdownFromSuggestionAction } from "./actions";
import { CopyButton } from "@/components/ui/CopyButton";
import { BUTTON_PRIMARY, BUTTON_SECONDARY } from "@/lib/ui-classes";

export function AiScriptBreakdownAssist({
  projectId,
  projectTitle,
}: {
  projectId: string;
  projectTitle: string;
}) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function requestDraft() {
    setStatus("loading");
    setErrorMessage("");
    try {
      const response = await fetch("/api/ai/script-breakdown-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, projectTitle }),
      });
      const data = await response.json();
      if (!response.ok) {
        setErrorMessage(data.error ?? "Gagal membuat draft script breakdown.");
        setStatus("error");
        return;
      }
      setSuggestions(data.scenes ?? []);
      setStatus("idle");
    } catch {
      setErrorMessage("Gagal membuat draft script breakdown (koneksi bermasalah).");
      setStatus("error");
    }
  }

  return (
    <div className="mb-4 rounded-lg border border-primary-100 bg-primary-50 p-4">
      <h2 className="mb-2 text-sm font-semibold text-primary-800">Bantuan AI: Draft Scene</h2>
      <button onClick={requestDraft} disabled={status === "loading"} className={BUTTON_PRIMARY}>
        {status === "loading" ? "Membuat draft..." : "Draft dengan AI"}
      </button>
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
                <form action={createScriptBreakdownFromSuggestionAction.bind(null, projectId, suggestion)}>
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
