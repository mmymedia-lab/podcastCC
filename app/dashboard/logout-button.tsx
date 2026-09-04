"use client";

import { signOut } from "next-auth/react";
import { BUTTON_SECONDARY } from "@/lib/ui-classes";

export function LogoutButton() {
  return (
    <button onClick={() => signOut({ callbackUrl: "/login" })} className={BUTTON_SECONDARY}>
      Logout
    </button>
  );
}
