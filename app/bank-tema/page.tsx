import Link from "next/link";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { deleteThemeIdeaAction } from "./actions";

export default async function BankTemaPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  await requireSession();
  const { tag: activeTag } = await searchParams;

  const [ideas, allTagRows] = await Promise.all([
    prisma.themeIdea.findMany({
      where: activeTag ? { tags: { has: activeTag } } : undefined,
      orderBy: { createdAt: "desc" },
    }),
    prisma.themeIdea.findMany({ select: { tags: true } }),
  ]);

  const uniqueTags = Array.from(new Set(allTagRows.flatMap((row) => row.tags))).sort();

  return (
    <main>
      <h1>Bank Tema</h1>
      <p>
        <Link href="/bank-tema/new">+ Tambah ide baru</Link>
      </p>

      {uniqueTags.length > 0 && (
        <nav aria-label="Filter tag">
          <Link href="/bank-tema">Semua</Link>
          {uniqueTags.map((tag) => (
            <Link key={tag} href={`/bank-tema?tag=${encodeURIComponent(tag)}`}>
              {" "}
              {tag}
            </Link>
          ))}
        </nav>
      )}

      <ul>
        {ideas.map((idea) => (
          <li key={idea.id}>
            <h2>{idea.title}</h2>
            {idea.description && <p>{idea.description}</p>}
            {idea.tags.length > 0 && <p>Tag: {idea.tags.join(", ")}</p>}
            <Link href={`/bank-tema/${idea.id}/edit`}>Edit</Link>
            <form action={deleteThemeIdeaAction.bind(null, idea.id)} style={{ display: "inline" }}>
              <button type="submit">Hapus</button>
            </form>
          </li>
        ))}
        {ideas.length === 0 && <p>Belum ada ide{activeTag ? ` dengan tag "${activeTag}"` : ""}.</p>}
      </ul>
    </main>
  );
}
