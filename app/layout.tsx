import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NavGate } from "@/components/ui/NavGate";

export const metadata: Metadata = {
  title: "Podcast Prep & Execution",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="id">
      <body>
        <Providers>
          <NavGate email={session?.user?.email} />
          {children}
        </Providers>
      </body>
    </html>
  );
}
