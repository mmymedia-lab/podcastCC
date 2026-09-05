import { TvDisplayClient } from "./tv-display-client";

// Deliberately not a Server Component fetch + not gated by requireSession():
// this page is the browser-based companion display for Mode Eksekusi (a
// tablet, phone, or Smart TV browser opening this URL directly) — see the
// Flutter companion-app spec, Milestone 0. It authenticates purely via the
// pairing code in the URL, polling /api/tv/session/[code] client-side.
export default async function TvDisplayPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return <TvDisplayClient code={code} />;
}
