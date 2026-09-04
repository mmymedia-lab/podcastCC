import Link from "next/link";
import { LogoutButton } from "./LogoutButton";

export function AppNav({ email }: { email?: string | null }) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/dashboard" className="text-sm font-semibold text-slate-900 hover:text-primary-700">
          🎙 Beranda
        </Link>
        <div className="flex items-center gap-3">
          {email && <span className="hidden text-sm text-slate-500 sm:inline">{email}</span>}
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
