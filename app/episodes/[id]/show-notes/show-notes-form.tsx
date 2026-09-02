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

  return (
    <form action={updateShowNotesAction.bind(null, episodeId)}>
      <div>
        <label htmlFor="draft">Draft show notes</label>
        <br />
        <button type="button" onClick={() => setDraft(outlineText)} disabled={!outlineText}>
          Isi dari Outline
        </button>
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
