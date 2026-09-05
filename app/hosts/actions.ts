"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

function requireName(raw: FormDataEntryValue | null): string {
  if (typeof raw !== "string" || !raw.trim()) {
    throw new Error("Nama wajib diisi.");
  }
  return raw.trim();
}

function optionalText(raw: FormDataEntryValue | null): string | null {
  return typeof raw === "string" && raw.trim() ? raw.trim() : null;
}

export async function createHostAction(formData: FormData) {
  await requireSession();

  await prisma.host.create({
    data: {
      name: requireName(formData.get("name")),
      contact: optionalText(formData.get("contact")),
      bio: optionalText(formData.get("bio")),
    },
  });

  revalidatePath("/hosts");
  redirect("/hosts");
}

export async function updateHostAction(id: string, formData: FormData) {
  await requireSession();

  await prisma.host.update({
    where: { id },
    data: {
      name: requireName(formData.get("name")),
      contact: optionalText(formData.get("contact")),
      bio: optionalText(formData.get("bio")),
    },
  });

  revalidatePath("/hosts");
  redirect("/hosts");
}

export async function deleteHostAction(id: string) {
  await requireSession();
  await prisma.host.delete({ where: { id } });
  revalidatePath("/hosts");
}
