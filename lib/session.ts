import { getServerSession, type Session } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./auth";
import { prisma } from "./prisma";

/** Server-component guard: redirects to /login when there is no session. */
export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }
  return session;
}

/**
 * Resolves the current user's id from a session, falling back to an email
 * lookup when `session.user.id` isn't populated.
 *
 * `session.user.id` is set by our jwt/session callbacks (lib/auth.ts), but
 * that only runs for JWTs issued *after* those callbacks existed — a
 * session cookie from before that change (or any other reason the id claim
 * comes back empty) still carries `email`, so a user with such a cookie
 * would otherwise get hard-blocked from every write action until they
 * happen to log out and back in. This keeps that case working instead of
 * throwing "Sesi tidak valid" at everyone with a pre-existing session.
 */
export async function resolveUserId(session: Session | null): Promise<string | null> {
  if (session?.user?.id) return session.user.id;

  const email = session?.user?.email;
  if (!email) return null;

  const user = await prisma.user.findUnique({ where: { email } });
  return user?.id ?? null;
}
