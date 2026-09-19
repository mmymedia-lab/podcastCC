"use client";

import { useState } from "react";
import { extractDriveFileId } from "@/lib/google-drive-url";

const LINK_CLASS = "mt-1 block break-all text-sm text-primary-700 hover:underline";

// Renders the Drive image itself (click-through to the file) instead of a
// bare link, using Drive's public thumbnail endpoint — no API/credentials
// needed, since the guide already has the user set the file to "Anyone
// with the link". Falls back to a plain link when the URL isn't a
// recognizable Drive file link, or the thumbnail fails to load (e.g. the
// file wasn't actually shared that way).
export function StoryboardFramePreview({ driveUrl }: { driveUrl: string }) {
  const [imageFailed, setImageFailed] = useState(false);
  const fileId = extractDriveFileId(driveUrl);

  if (!fileId || imageFailed) {
    return (
      <a href={driveUrl} target="_blank" rel="noreferrer" className={LINK_CLASS}>
        {driveUrl}
      </a>
    );
  }

  return (
    <a href={driveUrl} target="_blank" rel="noreferrer" className="mt-2 block">
      {/* eslint-disable-next-line @next/next/no-img-element -- external Drive-hosted image, not a local/optimizable asset */}
      <img
        src={`https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`}
        alt="Frame storyboard"
        onError={() => setImageFailed(true)}
        className="max-h-64 w-full rounded-md border border-slate-200 bg-slate-50 object-contain"
      />
    </a>
  );
}
