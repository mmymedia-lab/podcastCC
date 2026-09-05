import { PHASE_DOT_STYLE, PHASE_LABELS, PHASE_ORDER } from "@/app/episodes/phases";

/** Small "Keterangan warna" key explaining the 3 phase colors used on stage badges. */
export function PhaseLegend() {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
      <span className="font-medium text-slate-600">Keterangan warna:</span>
      {PHASE_ORDER.map((phase) => (
        <span key={phase} className="flex items-center gap-1.5">
          <span className={`h-2.5 w-2.5 rounded-full ${PHASE_DOT_STYLE[phase]}`} />
          {PHASE_LABELS[phase]}
        </span>
      ))}
    </div>
  );
}
