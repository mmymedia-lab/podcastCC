"use client";

import { useState } from "react";

const COPY_BUTTON_CLASS =
  "inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium " +
  "text-slate-600 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-600/30";

export function CopyButton({ text, label = "Salin" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access can be denied by the browser (e.g. no HTTPS/focus) —
      // the text is already visible on the page for a manual copy either way.
    }
  }

  return (
    <button type="button" onClick={handleCopy} className={COPY_BUTTON_CLASS}>
      {copied ? "Tersalin!" : `📋 ${label}`}
    </button>
  );
}
