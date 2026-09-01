import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function ExecutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession();
  const { id: episodeId } = await params;

  const episode = await prisma.episode.findUnique({ where: { id: episodeId } });
  if (!episode) notFound();

  const segments = await prisma.rundownSegment.findMany({
    where: { episodeId },
    orderBy: { order: "asc" },
  });

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0b0b0b",
        color: "#f5f5f5",
        padding: "3rem 2rem",
        fontSize: "1.25rem",
        lineHeight: 1.6,
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "2rem" }}>{episode.title}</h1>

      {segments.length === 0 && (
        <p>Belum ada segmen rundown. Tambahkan dulu di halaman Rundown episode ini.</p>
      )}

      <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {segments.map((segment, index) => (
          <li
            key={segment.id}
            style={{
              marginBottom: "2.5rem",
              borderBottom: "1px solid #333",
              paddingBottom: "2rem",
            }}
          >
            <p style={{ fontSize: "1rem", opacity: 0.6, marginBottom: "0.5rem" }}>
              Segmen {index + 1} dari {segments.length} · Estimasi {segment.estimatedMinutes} menit
            </p>
            <h2 style={{ fontSize: "1.75rem", margin: "0 0 0.75rem" }}>{segment.title}</h2>
            <p style={{ whiteSpace: "pre-wrap" }}>{segment.talkingPoints}</p>
          </li>
        ))}
      </ol>
    </main>
  );
}
