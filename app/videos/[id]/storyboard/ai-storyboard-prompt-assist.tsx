"use client";

import { useState } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { BUTTON_PRIMARY, BUTTON_SECONDARY, LABEL, TEXTAREA } from "@/lib/ui-classes";

const GEMINI_URL = "https://gemini.google.com/app";

// Same storyboard-panel conventions as the podcast/outline-style AI assist:
// rough pencil-sketch style (not a finished/realistic render), simple
// camera-direction annotation, explicit aspect ratio — these keep results
// looking like a storyboard panel instead of concept art. Built client-side
// (no Gemini API call) since this only produces a prompt for the user to
// paste into Gemini themselves — see the milestone that replaced in-app
// image generation with this copy-a-prompt flow.
function buildStoryboardPrompt(description: string): string {
  return (
    `Gambarkan satu panel storyboard bergaya sketsa pensil kasar hitam-putih ` +
    `(rough pencil sketch, bukan render realistis berwarna), untuk adegan berikut: ` +
    `"${description}". Sertakan anotasi panah sederhana untuk arah gerakan kamera atau ` +
    `subjek jika relevan pada adegan tersebut. Fokus pada komposisi, framing, dan blocking, ` +
    `bukan detail wajah/tekstur yang realistis. Rasio aspek 16:9.`
  );
}

export function AiStoryboardPromptAssist() {
  const [description, setDescription] = useState("");
  const [prompt, setPrompt] = useState("");

  return (
    <div className="mb-4 rounded-lg border border-primary-100 bg-primary-50 p-4">
      <h2 className="mb-2 text-sm font-semibold text-primary-800">Bantuan AI: Prompt Storyboard</h2>
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
        onClick={() => setPrompt(buildStoryboardPrompt(description))}
        disabled={!description.trim()}
        className={BUTTON_PRIMARY}
      >
        Buat Prompt
      </button>

      {prompt && (
        <div className="mt-3">
          <p className="mb-1 text-sm font-medium text-slate-700">Prompt siap pakai:</p>
          <pre className="whitespace-pre-wrap rounded-md border border-slate-200 bg-white p-3 text-sm text-slate-800">
            {prompt}
          </pre>
          <div className="mt-2 flex flex-wrap gap-2">
            <CopyButton text={prompt} label="Salin Prompt" />
            <a href={GEMINI_URL} target="_blank" rel="noreferrer" className={BUTTON_SECONDARY}>
              Buka Gemini ↗
            </a>
          </div>

          <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm text-slate-700">
            <li>Klik &quot;Salin Prompt&quot;, lalu &quot;Buka Gemini&quot; (atau buka aplikasi Gemini di HP).</li>
            <li>Tempel prompt-nya, kirim, dan tunggu Gemini membuat gambarnya.</li>
            <li>Unduh gambar hasilnya.</li>
            <li>Unggah ke folder Google Drive tim untuk project ini.</li>
            <li>
              Klik kanan file di Drive → <strong>Share</strong> → ubah &quot;General access&quot; jadi{" "}
              <strong>&quot;Anyone with the link&quot;</strong> (Viewer) — supaya rekan tim yang membuka
              link-nya nanti tidak kena &quot;akses ditolak&quot;.
            </li>
            <li>Salin link share-nya, lalu tempel di form &quot;Tambah Frame&quot; di bawah.</li>
          </ol>
        </div>
      )}
    </div>
  );
}
