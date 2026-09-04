import Link from "next/link";
import { LogoutButton } from "./LogoutButton";

export function AppNav({ email }: { email?: string | null }) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm font-semibold text-slate-900 hover:text-primary-700">
            🎙 Beranda
          </Link>
          {/*
            Plain <a>, not <Link>: this must always land on a fresh server
            render of /dashboard so the wizard re-opens even when already on
            that page — Next.js can reuse the cached client-side render for
            a Link to the same route with only the search param changed,
            which would silently no-op the click (see the same fix in
            app/login/page.tsx for the root-layout equivalent of this).
          */}
          <a href="/dashboard?panduan=1" className="text-sm text-slate-500 hover:text-primary-700">
            📖 Panduan
          </a>
        </div>
        <div className="flex items-center gap-3">
          {email && <span className="hidden text-sm text-slate-500 sm:inline">{email}</span>}
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
