import { notFound } from "next/navigation";
import { requireSession, resolveUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { canUnlockEpisodePascaProduksi, getEpisodePascaProduksiGate } from "@/lib/permissions";
import { CHECKLIST_CATEGORY_LABELS, slugToCategory } from "../categories";
import { createChecklistItemAction, deleteChecklistItemAction, toggleChecklistItemAction } from "../actions";
import { lockEpisodePascaProduksiAction, unlockEpisodePascaProduksiAction } from "@/app/episodes/actions";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { PascaProduksiGateNotice } from "@/components/ui/PascaProduksiGateNotice";
import {
  BUTTON_DANGER,
  BUTTON_GHOST,
  BUTTON_PRIMARY,
  CARD,
  CARD_LIST,
  EMPTY_STATE,
  FIELD_GROUP,
  FORM,
  H1,
  H2,
  INPUT,
  LABEL,
  PAGE,
} from "@/lib/ui-classes";

export default async function ChecklistPage({
  params,
}: {
  params: Promise<{ id: string; category: string }>;
}) {
  const session = await requireSession();
  const { id: episodeId, category: slug } = await params;

  const category = slugToCategory(slug);
  if (!category) notFound();

  const episode = await prisma.episode.findUnique({ where: { id: episodeId } });
  if (!episode) notFound();

  const items = await prisma.checklistItem.findMany({
    where: { episodeId, category },
    orderBy: { order: "asc" },
  });

  const userId = await resolveUserId(session);
  const pascaProduksiGate = category === "POST_PRODUCTION" ? await getEpisodePascaProduksiGate(episodeId) : null;
  const canTogglePascaProduksi =
    pascaProduksiGate && userId ? await canUnlockEpisodePascaProduksi(userId, episodeId) : false;
  const locked = pascaProduksiGate ? !pascaProduksiGate.unlocked : false;

  return (
    <main className={PAGE}>
      <Breadcrumb
        items={[
          { label: "Beranda", href: "/dashboard" },
          { label: "Episode", href: "/episodes" },
          { label: episode.title, href: `/episodes/${episodeId}` },
          { label: CHECKLIST_CATEGORY_LABELS[category] },
        ]}
      />
      <h1 className={H1}>
        {CHECKLIST_CATEGORY_LABELS[category]}: {episode.title}
      </h1>

      {pascaProduksiGate && (
        <PascaProduksiGateNotice
          unlocked={pascaProduksiGate.unlocked}
          productionDate={pascaProduksiGate.productionDate}
          manualOverride={pascaProduksiGate.manualOverride}
          canToggle={canTogglePascaProduksi}
          unlockAction={unlockEpisodePascaProduksiAction.bind(null, episodeId)}
          lockAction={lockEpisodePascaProduksiAction.bind(null, episodeId)}
        />
      )}

      <ul className={CARD_LIST}>
        {items.map((item) => (
          <li key={item.id} className={`${CARD} flex items-center gap-3`}>
            <form action={toggleChecklistItemAction.bind(null, episodeId, slug, item.id)}>
              <button
                type="submit"
                disabled={locked}
                aria-pressed={item.isDone}
                aria-label={
                  item.isDone
                    ? `Tandai "${item.label}" belum selesai`
                    : `Tandai "${item.label}" selesai`
                }
                className={`${BUTTON_GHOST} text-lg`}
              >
                {item.isDone ? "☑" : "☐"}
              </button>
            </form>
            <span
              className={`flex-1 text-sm ${
                item.isDone ? "text-slate-400 line-through" : "text-slate-900"
              }`}
            >
              {item.label}
            </span>
            <form action={deleteChecklistItemAction.bind(null, episodeId, slug, item.id)}>
              <button type="submit" disabled={locked} className={BUTTON_DANGER}>
                Hapus
              </button>
            </form>
          </li>
        ))}
        {items.length === 0 && <p className={EMPTY_STATE}>Belum ada item checklist.</p>}
      </ul>

      <h2 className={H2}>Tambah Item</h2>
      <form action={createChecklistItemAction.bind(null, episodeId, category, slug)} className={FORM}>
        <fieldset disabled={locked}>
          <div className={FIELD_GROUP}>
            <label htmlFor="label" className={LABEL}>
              Item
            </label>
            <input id="label" name="label" required className={INPUT} />
          </div>
          <button type="submit" className={BUTTON_PRIMARY}>
            Tambah
          </button>
        </fieldset>
      </form>
    </main>
  );
}
