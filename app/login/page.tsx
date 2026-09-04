"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { BUTTON_PRIMARY, FIELD_GROUP, FORM, INPUT, LABEL } from "@/lib/ui-classes";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setSubmitting(false);

    if (result?.error) {
      setError("Email atau password salah.");
      return;
    }

    // A hard navigation, not router.push(): the root layout reads the
    // session server-side to decide whether to render the nav bar, and
    // that layout is a shared ancestor of every route — Next.js reuses its
    // pre-login (no-session) render across client-side navigations instead
    // of re-fetching it, so a soft push here would leave the nav bar
    // missing until the next full page reload.
    window.location.href = "/dashboard";
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="mb-1 text-xl font-semibold text-slate-900">Podcast Prep & Execution</h1>
        <p className="mb-6 text-sm text-slate-500">Masuk untuk melanjutkan.</p>
        <form onSubmit={handleSubmit} className={FORM}>
          <div className={FIELD_GROUP}>
            <label htmlFor="email" className={LABEL}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className={INPUT}
            />
          </div>
          <div className={FIELD_GROUP}>
            <label htmlFor="password" className={LABEL}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className={INPUT}
            />
          </div>
          {error && (
            <p role="alert" className="rounded-md bg-danger-50 px-3 py-2 text-sm text-danger-700">
              {error}
            </p>
          )}
          <button type="submit" disabled={submitting} className={`${BUTTON_PRIMARY} w-full`}>
            {submitting ? "Memproses..." : "Masuk"}
          </button>
        </form>
      </div>
    </main>
  );
}
