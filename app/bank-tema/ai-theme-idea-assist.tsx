"use client";

import { useState } from "react";
import { createThemeIdeaFromTitleAction } from "./actions";

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
    <div style={{ border: "1px solid #ccc", padding: "1rem", marginBottom: "1rem" }}>
      <h2>Bantuan AI: Ide Topik</h2>
      <input
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
        placeholder="Kata kunci/kategori"
      />{" "}
      <button onClick={requestIdeas} disabled={status === "loading" || !keyword.trim()}>
        {status === "loading" ? "Meminta..." : "Minta Ide AI"}
      </button>
      {status === "error" && (
        <p role="alert">{errorMessage} — kamu tetap bisa isi manual di bawah.</p>
      )}
      {suggestions.length > 0 && (
        <ul>
          {suggestions.map((suggestion, index) => (
            <li key={index}>
              {suggestion}{" "}
              <form
                action={createThemeIdeaFromTitleAction.bind(null, suggestion)}
                style={{ display: "inline" }}
              >
                <button type="submit">+ Tambah</button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
