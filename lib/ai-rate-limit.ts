/**
 * Simple per-user sliding-window rate limit for the AI-assist endpoints,
 * to stop a spammed click (or a bypassed client-side disabled state, e.g.
 * multiple tabs) from burning Gemini quota unchecked. In-memory is enough
 * here: this app runs as a single self-hosted container, not a
 * multi-instance/serverless deployment.
 */
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 10;

const requestLog = new Map<string, number[]>();

/** Returns true if the request is allowed, false if the user is over the limit. */
export function checkAiRateLimit(userId: string): boolean {
  const now = Date.now();
  const recent = (requestLog.get(userId) ?? []).filter((timestamp) => now - timestamp < WINDOW_MS);

  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    requestLog.set(userId, recent);
    return false;
  }

  recent.push(now);
  requestLog.set(userId, recent);
  return true;
}
