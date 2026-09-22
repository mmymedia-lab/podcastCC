"use client";

import { useState } from "react";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { EpisodeStage } from "@prisma/client";
import { STAGE_LABELS, STAGE_ORDER } from "../episodes/stages";
import { EpisodePhase, PHASE_BORDER_STYLE } from "../episodes/phases";
import { updateEpisodeStageAction } from "../episodes/actions";

const COLUMN_BG_STYLE: Record<EpisodePhase, string> = {
  PRA_PRODUKSI: "bg-phase-pra-produksi-bg",
  PRODUKSI_LIVE: "bg-phase-produksi-live-bg",
  PASCA_PRODUKSI: "bg-phase-pasca-produksi-bg",
};

export interface EpisodeCardData {
  id: string;
  title: string;
  stage: EpisodeStage;
  recordingDate: string | null;
  hostName: string | null;
  checklistDone: number;
  checklistTotal: number;
  teamInitials: string[];
}

export interface KanbanColumn {
  stage: EpisodeStage;
  phase: EpisodePhase;
  label: string;
  episodes: EpisodeCardData[];
}

function Avatar({ initials }: { initials: string }) {
  return (
    <span
      className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-[10px] font-semibold text-primary-800 ring-2 ring-white"
      title={initials}
    >
      {initials}
    </span>
  );
}

function EpisodeCard({
  episode,
  phase,
  onMove,
}: {
  episode: EpisodeCardData;
  phase: EpisodePhase;
  onMove: (episodeId: string, targetStage: EpisodeStage) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: episode.id,
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`touch-none rounded-md border-l-4 bg-white p-2.5 text-sm shadow-sm transition-shadow hover:shadow-md ${PHASE_BORDER_STYLE[phase]} ${isDragging ? "z-10 opacity-40" : ""}`}
    >
      <Link href={`/episodes/${episode.id}`} className="block font-medium text-slate-900 hover:underline">
        {episode.title}
      </Link>
      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
        {episode.recordingDate && <span>🗓 {episode.recordingDate}</span>}
        {episode.hostName && <span>🎙 {episode.hostName}</span>}
      </div>
      {episode.checklistTotal > 0 && (
        <div className="mt-2">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-primary-600"
              style={{ width: `${Math.round((episode.checklistDone / episode.checklistTotal) * 100)}%` }}
            />
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Checklist {episode.checklistDone}/{episode.checklistTotal}
          </p>
        </div>
      )}
      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex -space-x-1.5">
          {episode.teamInitials.map((initials, index) => (
            <Avatar key={`${initials}-${index}`} initials={initials} />
          ))}
        </div>
        <label className="sr-only" htmlFor={`move-${episode.id}`}>
          Pindah tahap: {episode.title}
        </label>
        <select
          id={`move-${episode.id}`}
          value={episode.stage}
          onPointerDown={(event) => event.stopPropagation()}
          onChange={(event) => onMove(episode.id, event.target.value as EpisodeStage)}
          className="rounded border border-slate-200 bg-slate-50 px-1 py-0.5 text-[11px] text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-600/30"
        >
          {STAGE_ORDER.map((stage) => (
            <option key={stage} value={stage}>
              {STAGE_LABELS[stage]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function Column({
  column,
  onMove,
}: {
  column: KanbanColumn;
  onMove: (episodeId: string, targetStage: EpisodeStage) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.stage });

  return (
    <div className="min-w-0 rounded-lg bg-slate-50 shadow-sm">
      <div
        className={`sticky top-0 flex items-center justify-between rounded-t-md border-t-4 px-3 py-2 ${PHASE_BORDER_STYLE[column.phase]} ${COLUMN_BG_STYLE[column.phase]}`}
      >
        <h2 className="text-sm font-semibold text-slate-800">{column.label}</h2>
        <span className="rounded-full bg-white/70 px-1.5 py-0.5 text-xs font-medium text-slate-600">
          {column.episodes.length}
        </span>
      </div>
      <ul
        ref={setNodeRef}
        className={`min-h-[3rem] space-y-2 rounded-b-md p-3 transition-colors ${isOver ? "bg-primary-50" : ""}`}
      >
        {column.episodes.map((episode) => (
          <li key={episode.id}>
            <EpisodeCard episode={episode} phase={column.phase} onMove={onMove} />
          </li>
        ))}
        {column.episodes.length === 0 && <li className="text-sm text-slate-400">—</li>}
      </ul>
    </div>
  );
}

export function KanbanBoard({ initialColumns }: { initialColumns: KanbanColumn[] }) {
  const [columns, setColumns] = useState(initialColumns);
  const [activeEpisode, setActiveEpisode] = useState<EpisodeCardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  function moveEpisode(episodeId: string, targetStage: EpisodeStage) {
    setError(null);

    const sourceColumn = columns.find((col) => col.episodes.some((ep) => ep.id === episodeId));
    const episode = sourceColumn?.episodes.find((ep) => ep.id === episodeId);
    if (!sourceColumn || !episode || sourceColumn.stage === targetStage) return;

    setColumns((prev) =>
      prev.map((col) => {
        if (col.stage === sourceColumn.stage) {
          return { ...col, episodes: col.episodes.filter((ep) => ep.id !== episodeId) };
        }
        if (col.stage === targetStage) {
          return { ...col, episodes: [{ ...episode, stage: targetStage }, ...col.episodes] };
        }
        return col;
      }),
    );

    const formData = new FormData();
    formData.set("stage", targetStage);

    updateEpisodeStageAction(episodeId, formData).catch((err) => {
      // Revert the optimistic move — most commonly a permission denial from
      // requireEditableStage() (e.g. this user's role can't edit this
      // episode's current stage), same trust-based gate as everywhere else
      // in this app, just now reachable via drag instead of only a form.
      setColumns((prev) =>
        prev.map((col) => {
          if (col.stage === targetStage) {
            return { ...col, episodes: col.episodes.filter((ep) => ep.id !== episodeId) };
          }
          if (col.stage === sourceColumn.stage) {
            return { ...col, episodes: [episode, ...col.episodes] };
          }
          return col;
        }),
      );
      setError(err instanceof Error ? err.message : "Gagal memindahkan episode.");
    });
  }

  function handleDragStart(event: DragStartEvent) {
    const episode = columns.flatMap((col) => col.episodes).find((ep) => ep.id === event.active.id);
    setActiveEpisode(episode ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveEpisode(null);
    const { active, over } = event;
    if (!over) return;
    moveEpisode(active.id as string, over.id as EpisodeStage);
  }

  return (
    <div>
      {error && (
        <div className="mb-3 flex items-center justify-between gap-3 rounded-md border border-danger-600/30 bg-danger-50 px-3 py-2 text-sm text-danger-700">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-danger-700/70 hover:text-danger-700"
            aria-label="Tutup pesan error"
          >
            ✕
          </button>
        </div>
      )}
      <DndContext
        id="episode-board"
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
          {columns.map((column) => (
            <Column key={column.stage} column={column} onMove={moveEpisode} />
          ))}
        </div>
        <DragOverlay>
          {activeEpisode && (
            <div className="w-64 rounded-md border-l-4 border-primary-600 bg-white p-2.5 text-sm shadow-lg">
              <p className="font-medium text-slate-900">{activeEpisode.title}</p>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
