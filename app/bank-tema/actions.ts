"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

function parseTags(raw: FormDataEntryValue | null): string[] {
  if (typeof raw !== "string") return [];
  return raw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function requireTitle(raw: FormDataEntryValue | null): string {
  if (typeof raw !== "string" || !raw.trim()) {
    throw new Error("Judul wajib diisi.");
  }
  return raw.trim();
}

function optionalText(raw: FormDataEntryValue | null): string | null {
  return typeof raw === "string" && raw.trim() ? raw.trim() : null;
}

export async function createThemeIdeaAction(formData: FormData) {
  await requireSession();

  await prisma.themeIdea.create({
    data: {
      title: requireTitle(formData.get("title")),
      description: optionalText(formData.get("description")),
      tags: parseTags(formData.get("tags")),
    },
  });

  revalidatePath("/bank-tema");
  redirect("/bank-tema");
}

export async function updateThemeIdeaAction(id: string, formData: FormData) {
  await requireSession();

  await prisma.themeIdea.update({
    where: { id },
    data: {
      title: requireTitle(formData.get("title")),
      description: optionalText(formData.get("description")),
      tags: parseTags(formData.get("tags")),
    },
  });

  revalidatePath("/bank-tema");
  redirect("/bank-tema");
}

export async function deleteThemeIdeaAction(id: string) {
  await requireSession();
  await prisma.themeIdea.delete({ where: { id } });
  revalidatePath("/bank-tema");
}
