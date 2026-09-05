import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { updateHostAction } from "../../actions";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import {
  BUTTON_PRIMARY,
  BUTTON_SECONDARY,
  FIELD_GROUP,
  FORM,
  H1,
  INPUT,
  LABEL,
  PAGE,
  TEXTAREA,
} from "@/lib/ui-classes";

export default async function EditHostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession();
  const { id } = await params;

  const host = await prisma.host.findUnique({ where: { id } });
  if (!host) notFound();

  return (
    <main className={PAGE}>
      <Breadcrumb
        items={[
          { label: "Beranda", href: "/dashboard" },
          { label: "Host", href: "/hosts" },
          { label: "Edit Host" },
        ]}
      />
      <h1 className={H1}>Edit Host</h1>

      <form action={updateHostAction.bind(null, host.id)} className={FORM}>
        <div className={FIELD_GROUP}>
          <label htmlFor="name" className={LABEL}>
            Nama
          </label>
          <input id="name" name="name" defaultValue={host.name} required className={INPUT} />
        </div>
        <div className={FIELD_GROUP}>
          <label htmlFor="contact" className={LABEL}>
            Kontak (opsional)
          </label>
          <input id="contact" name="contact" defaultValue={host.contact ?? ""} className={INPUT} />
        </div>
        <div className={FIELD_GROUP}>
          <label htmlFor="bio" className={LABEL}>
            Bio (opsional)
          </label>
          <textarea id="bio" name="bio" defaultValue={host.bio ?? ""} className={TEXTAREA} />
        </div>
        <div className="flex gap-2">
          <button type="submit" className={BUTTON_PRIMARY}>
            Simpan
          </button>
          <Link href="/hosts" className={BUTTON_SECONDARY}>
            Batal
          </Link>
        </div>
      </form>
    </main>
  );
}
