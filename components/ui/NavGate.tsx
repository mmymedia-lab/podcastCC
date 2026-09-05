"use client";

import { usePathname } from "next/navigation";
import { AppNav } from "./AppNav";

// Mode Eksekusi (episodes/[id]/execute) is a distraction-free, full-bleed
// presentation view for live recording — a persistent top bar would sit on
// top of it and defeat that purpose, so it's excluded here. /login is also
// excluded even when a still-valid session cookie exists (e.g. a bookmark
// or a direct visit while already logged in) — it should never show a
// "Beranda" bar on top of the pre-auth form. /tv/[code] is the same kind
// of full-bleed presentation view, opened on a shared/unauthenticated
// display device (TV, tablet, phone) rather than by a logged-in team
// member, so it never shows the app's own nav bar either.
export function NavGate({ email }: { email?: string | null }) {
  const pathname = usePathname();
  if (!email || pathname === "/login" || pathname?.endsWith("/execute") || pathname?.startsWith("/tv/"))
    return null;
  return <AppNav email={email} />;
}
