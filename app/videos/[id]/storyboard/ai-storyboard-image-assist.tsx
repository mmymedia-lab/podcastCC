"use client";

import { useState } from "react";
import { BUTTON_PRIMARY, BUTTON_SECONDARY, LABEL, TEXTAREA } from "@/lib/ui-classes";

export function AiStoryboardImageAssist({ projectId }: { projectId: string }) {
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<{ mimeType: string; base64: string } | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function requestImage() {
    setStatus("loading");
    setErrorMessage("");
    try {
      const response = await fetch("/api/ai/storyboard-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, description }),
      });
      const data = await response.json();
      if (!response.ok) {
        setErrorMessage(data.error ?? "Gagal membuat gambar storyboard.");
        setStatus("error");
        return;
      }
      setImage({ mimeType: data.mimeType, base64: data.base64 });
      setStatus("idle");
    } catch {
      setErrorMessage("Gagal membuat gambar storyboard (koneksi bermasalah).");
      setStatus("error");
    }
  }

  const dataUri = image ? `data:${image.mimeType};base64,${image.base64}` : null;

  return (
    <div className="mb-4 rounded-lg border border-primary-100 bg-primary-50 p-4">
      <h2 className="mb-2 text-sm font-semibold text-primary-800">Bantuan AI: Gambar Storyboard</h2>
      <label htmlFor="ai-storyboard-description" className={LABEL}>
        Deskripsi adegan
      </label>
      <textarea
        id="ai-storyboard-description"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="mis. Host duduk di meja, kamera close-up dari sisi kiri"
        className={`${TEXTAREA} mb-2`}
      />
      <button
        onClick={requestImage}
        disabled={status === "loading" || !description.trim()}
        className={BUTTON_PRIMARY}
      >
        {status === "loading" ? "Membuat gambar..." : "Generate Gambar"}
      </button>
      {status === "error" && (
        <p role="alert" className="mt-2 text-sm text-danger-700">
          {errorMessage} — kamu tetap bisa isi link Drive manual di bawah.
        </p>
      )}
      {dataUri && (
        <div className="mt-3">
          <img
            src={dataUri}
            alt={`Sketsa storyboard: ${description}`}
            className="max-w-md rounded-md border border-slate-200"
          />
          <p className="mt-2 text-sm text-slate-600">
            Ini cuma pratinjau — belum tersimpan di mana pun. Unduh, unggah ke Google Drive tim, lalu
            tempel link-nya di form &quot;Tambah Frame&quot; di bawah.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <a href={dataUri} download="storyboard-frame.png" className={BUTTON_SECONDARY}>
              Unduh Gambar
            </a>
            <button onClick={requestImage} disabled={status === "loading"} className={BUTTON_SECONDARY}>
              Generate Ulang
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
