/**
 * Shared Tailwind class strings, applied directly on native elements
 * (button/input/form) rather than wrapped in components — every field in
 * this app is a plain <form action={serverAction}> with native inputs, and
 * wrapping them would mean re-forwarding every prop (name, required, type,
 * defaultValue, rows, min, ...) for no behavioral benefit. Centralizing the
 * class strings here still gives one place to keep them consistent.
 */

export const PAGE = "mx-auto max-w-3xl px-4 py-8 sm:px-6";
export const PAGE_WIDE = "mx-auto max-w-5xl px-4 py-8 sm:px-6";

export const H1 = "mt-2 mb-6 text-2xl font-semibold tracking-tight text-slate-900";
export const H2 = "mt-8 mb-3 text-lg font-semibold text-slate-900";

export const CARD = "rounded-lg border border-slate-200 bg-white p-4 shadow-sm";
export const CARD_LIST = "space-y-3";

export const LABEL = "mb-1 block text-sm font-medium text-slate-700";
export const INPUT =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 " +
  "placeholder:text-slate-400 focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/30";
export const TEXTAREA = INPUT + " min-h-[6rem] resize-y";
export const FIELD_GROUP = "mb-4";
export const HELP_TEXT = "mt-1 text-xs text-slate-500";

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium " +
  "transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50";

export const BUTTON_PRIMARY =
  BUTTON_BASE + " bg-primary-700 text-white hover:bg-primary-800 focus:ring-primary-600";
export const BUTTON_SECONDARY =
  BUTTON_BASE +
  " border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:ring-primary-600";
export const BUTTON_DANGER =
  BUTTON_BASE + " text-danger-600 hover:bg-danger-50 focus:ring-danger-600";
export const BUTTON_GHOST =
  BUTTON_BASE + " min-w-10 min-h-10 text-slate-500 hover:bg-slate-100 focus:ring-primary-600";

export const FORM = "space-y-4";

export const EMPTY_STATE = "rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500";
