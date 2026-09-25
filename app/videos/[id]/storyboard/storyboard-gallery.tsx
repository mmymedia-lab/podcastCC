"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { extractDriveFileId } from "@/lib/google-drive-url";
import { BUTTON_DANGER, BUTTON_GHOST, BUTTON_SECONDARY } from "@/lib/ui-classes";

export interface StoryboardFrameData {
  id: string;
  driveUrl: string;
  notes: string | null;
}

// Kept intentionally generous (not the Kanban board's compact 220px) since
// these are storyboard frames people need to actually make out the
// composition of, not just recognize at a glance.
const GRID_CLASS = "grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4";

function driveImageUrl(driveUrl: string, size: number): string | null {
  const fileId = extractDriveFileId(driveUrl);
  return fileId ? `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}` : null;
}

function Thumbnail({
  frame,
  index,
  imageFailed,
  onImageError,
  onOpen,
  buttonRef,
}: {
  frame: StoryboardFrameData;
  index: number;
  imageFailed: boolean;
  onImageError: () => void;
  onOpen: () => void;
  buttonRef: (el: HTMLButtonElement | null) => void;
}) {
  const imageUrl = driveImageUrl(frame.driveUrl, 500);

  if (!imageUrl || imageFailed) {
    return (
      <a
        href={frame.driveUrl}
        target="_blank"
        rel="noreferrer"
        className="flex aspect-video items-center justify-center break-all rounded-md border border-slate-200 bg-slate-50 p-3 text-center text-xs text-primary-700 hover:underline"
      >
        {frame.driveUrl}
      </a>
    );
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onOpen}
      aria-label={`Lihat Shot ${index + 1} lebih besar`}
      className="block aspect-video w-full overflow-hidden rounded-md border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-600/50"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- external Drive-hosted image, not a local/optimizable asset */}
      <img
        src={imageUrl}
        alt={`Storyboard Shot ${index + 1}`}
        onError={onImageError}
        className="h-full w-full object-cover transition-transform hover:scale-[1.02]"
      />
    </button>
  );
}

export function StoryboardGallery({
  projectId,
  items,
  moveAction,
  deleteAction,
}: {
  projectId: string;
  items: StoryboardFrameData[];
  moveAction: (projectId: string, frameId: string, direction: "up" | "down") => Promise<void>;
  deleteAction: (projectId: string, frameId: string) => Promise<void>;
}) {
  const [failedIds, setFailedIds] = useState<Set<string>>(new Set());
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const lastOpenedIndex = useRef<number | null>(null);

  useEffect(() => {
    if (openIndex !== null) {
      dialogRef.current?.showModal();
    }
  }, [openIndex]);

  function openAt(index: number) {
    lastOpenedIndex.current = index;
    setOpenIndex(index);
  }

  function close() {
    dialogRef.current?.close();
    setOpenIndex(null);
    const previouslyOpened = lastOpenedIndex.current;
    if (previouslyOpened !== null) {
      thumbnailRefs.current[previouslyOpened]?.focus();
    }
  }

  function step(delta: 1 | -1) {
    setOpenIndex((current) => {
      if (current === null) return current;
      const next = current + delta;
      return next >= 0 && next < items.length ? next : current;
    });
  }

  function handleDialogKeyDown(event: React.KeyboardEvent<HTMLDialogElement>) {
    if (event.key === "ArrowLeft") step(-1);
    if (event.key === "ArrowRight") step(1);
  }

  const activeFrame = openIndex !== null ? items[openIndex] : null;
  const activeImageUrl = activeFrame ? driveImageUrl(activeFrame.driveUrl, 1200) : null;
  const activeImageFailed = activeFrame ? failedIds.has(activeFrame.id) : false;

  return (
    <>
      <ul className={GRID_CLASS}>
        {items.map((item, index) => (
          <li key={item.id} className="rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
            <Thumbnail
              frame={item}
              index={index}
              imageFailed={failedIds.has(item.id)}
              onImageError={() => setFailedIds((prev) => new Set(prev).add(item.id))}
              onOpen={() => openAt(index)}
              buttonRef={(el) => {
                thumbnailRefs.current[index] = el;
              }}
            />
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-slate-600">Shot {index + 1}</span>
              <div className="flex gap-1">
                <form action={moveAction.bind(null, projectId, item.id, "up")}>
                  <button
                    type="submit"
                    disabled={index === 0}
                    aria-label={`Pindahkan Shot ${index + 1} ke atas`}
                    className={`${BUTTON_GHOST} h-8 min-h-0 w-8 min-w-0 disabled:opacity-40`}
                  >
                    ↑
                  </button>
                </form>
                <form action={moveAction.bind(null, projectId, item.id, "down")}>
                  <button
                    type="submit"
                    disabled={index === items.length - 1}
                    aria-label={`Pindahkan Shot ${index + 1} ke bawah`}
                    className={`${BUTTON_GHOST} h-8 min-h-0 w-8 min-w-0 disabled:opacity-40`}
                  >
                    ↓
                  </button>
                </form>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/*
        Native <dialog>: showModal() traps focus and blocks background
        interaction, and Escape closes it, all without extra JS. The
        onClick checks for a click on the dialog element itself (not a
        descendant) to detect a backdrop click and close on it too.
      */}
      <dialog
        ref={dialogRef}
        onClose={close}
        onKeyDown={handleDialogKeyDown}
        onClick={(event) => {
          if (event.target === dialogRef.current) close();
        }}
        aria-label="Pratinjau frame storyboard"
        className="w-[min(90vw,56rem)] rounded-lg border border-slate-200 p-0 backdrop:bg-slate-900/60"
      >
        {activeFrame && openIndex !== null && (
          <div className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">
                Shot {openIndex + 1} dari {items.length}
              </span>
              <button
                type="button"
                onClick={close}
                aria-label="Tutup"
                className={`${BUTTON_GHOST} h-8 min-h-0 w-8 min-w-0`}
              >
                ✕
              </button>
            </div>

            <div className="relative flex items-center justify-center">
              <button
                type="button"
                onClick={() => step(-1)}
                disabled={openIndex === 0}
                aria-label="Shot sebelumnya"
                className={`${BUTTON_GHOST} absolute left-1 disabled:opacity-30`}
              >
                ‹
              </button>

              {activeImageUrl && !activeImageFailed ? (
                // eslint-disable-next-line @next/next/no-img-element -- external Drive-hosted image
                <img
                  src={activeImageUrl}
                  alt={`Storyboard Shot ${openIndex + 1}`}
                  onError={() => setFailedIds((prev) => new Set(prev).add(activeFrame.id))}
                  className="max-h-[65vh] w-full rounded-md object-contain"
                />
              ) : (
                <a
                  href={activeFrame.driveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block break-all p-8 text-center text-sm text-primary-700 hover:underline"
                >
                  {activeFrame.driveUrl}
                </a>
              )}

              <button
                type="button"
                onClick={() => step(1)}
                disabled={openIndex === items.length - 1}
                aria-label="Shot berikutnya"
                className={`${BUTTON_GHOST} absolute right-1 disabled:opacity-30`}
              >
                ›
              </button>
            </div>

            {activeFrame.notes && (
              <p className="mt-3 text-sm text-slate-700">{activeFrame.notes}</p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href={`/videos/${projectId}/storyboard/${activeFrame.id}/edit`}
                className={BUTTON_SECONDARY}
              >
                Edit
              </Link>
              <button
                type="button"
                onClick={async () => {
                  await deleteAction(projectId, activeFrame.id);
                  close();
                }}
                className={BUTTON_DANGER}
              >
                Hapus
              </button>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
