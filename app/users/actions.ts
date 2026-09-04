"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSession, resolveUserId } from "@/lib/session";

function requireEmail(raw: FormDataEntryValue | null): string {
  if (typeof raw !== "string" || !raw.trim()) {
    throw new Error("Email wajib diisi.");
  }
  return raw.trim().toLowerCase();
}

function optionalName(raw: FormDataEntryValue | null): string | null {
  return typeof raw === "string" && raw.trim() ? raw.trim() : null;
}

function isUniqueEmailError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export async function createUserAction(formData: FormData) {
  await requireSession();

  const email = requireEmail(formData.get("email"));
  const name = optionalName(formData.get("name"));
  const password = formData.get("password");
  if (typeof password !== "string" || password.length < 8) {
    throw new Error("Password wajib diisi, minimal 8 karakter.");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  try {
    await prisma.user.create({ data: { email, name, passwordHash } });
  } catch (error) {
    if (isUniqueEmailError(error)) {
      throw new Error("Email sudah terdaftar.");
    }
    throw error;
  }

  revalidatePath("/users");
  redirect("/users");
}

export async function updateUserAction(id: string, formData: FormData) {
  await requireSession();

  const email = requireEmail(formData.get("email"));
  const name = optionalName(formData.get("name"));
  const password = formData.get("password");

  const data: Prisma.UserUpdateInput = { email, name };
  if (typeof password === "string" && password.trim()) {
    if (password.length < 8) {
      throw new Error("Password minimal 8 karakter.");
    }
    data.passwordHash = await bcrypt.hash(password, 10);
  }

  try {
    await prisma.user.update({ where: { id }, data });
  } catch (error) {
    if (isUniqueEmailError(error)) {
      throw new Error("Email sudah terdaftar.");
    }
    throw error;
  }

  revalidatePath("/users");
  redirect("/users");
}

export async function deleteUserAction(id: string) {
  const session = await requireSession();
  const currentUserId = await resolveUserId(session);
  if (id === currentUserId) {
    throw new Error("Kamu tidak bisa menghapus akunmu sendiri.");
  }

  await prisma.user.delete({ where: { id } });
  revalidatePath("/users");
}
