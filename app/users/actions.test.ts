import { beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma } from "@prisma/client";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("@/lib/session", () => ({
  requireSession: vi.fn(),
  resolveUserId: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
import { requireSession, resolveUserId } from "@/lib/session";
import { createUserAction, deleteUserAction, updateUserAction } from "./actions";

const user = prisma.user as unknown as {
  create: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};
const requireSessionMock = requireSession as unknown as ReturnType<typeof vi.fn>;
const resolveUserIdMock = resolveUserId as unknown as ReturnType<typeof vi.fn>;

function uniqueEmailError() {
  return new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
    code: "P2002",
    clientVersion: "5.20.0",
  });
}

function formData(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    data.set(key, value);
  }
  return data;
}

beforeEach(() => {
  user.create.mockReset();
  user.update.mockReset();
  user.delete.mockReset();
  requireSessionMock.mockReset().mockResolvedValue({ user: { id: "current-user" } });
  resolveUserIdMock.mockReset().mockResolvedValue("current-user");
});

describe("createUserAction", () => {
  it("creates a user with a hashed password", async () => {
    await createUserAction(formData({ email: "New@Example.com", name: "Budi", password: "supersecret" }));

    expect(user.create).toHaveBeenCalledTimes(1);
    const data = user.create.mock.calls[0][0].data;
    expect(data.email).toBe("new@example.com");
    expect(data.name).toBe("Budi");
    expect(data.passwordHash).not.toBe("supersecret");
  });

  it("rejects a missing email", async () => {
    await expect(createUserAction(formData({ password: "supersecret" }))).rejects.toThrow(
      "Email wajib diisi.",
    );
    expect(user.create).not.toHaveBeenCalled();
  });

  it("rejects a password shorter than 8 characters", async () => {
    await expect(
      createUserAction(formData({ email: "a@b.com", password: "short" })),
    ).rejects.toThrow("Password wajib diisi, minimal 8 karakter.");
    expect(user.create).not.toHaveBeenCalled();
  });

  it("surfaces a duplicate email as a friendly error", async () => {
    user.create.mockRejectedValue(uniqueEmailError());

    await expect(
      createUserAction(formData({ email: "dup@example.com", password: "supersecret" })),
    ).rejects.toThrow("Email sudah terdaftar.");
  });
});

describe("updateUserAction", () => {
  it("keeps the existing password when the field is left blank", async () => {
    await updateUserAction("user-1", formData({ email: "a@b.com" }));

    expect(user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { email: "a@b.com", name: null },
    });
  });

  it("hashes a new password when one is provided", async () => {
    await updateUserAction("user-1", formData({ email: "a@b.com", password: "newpassword123" }));

    const data = user.update.mock.calls[0][0].data;
    expect(data.passwordHash).toBeDefined();
    expect(data.passwordHash).not.toBe("newpassword123");
  });
});

describe("deleteUserAction", () => {
  it("deletes another user", async () => {
    await deleteUserAction("other-user");
    expect(user.delete).toHaveBeenCalledWith({ where: { id: "other-user" } });
  });

  it("refuses to delete the currently logged-in user", async () => {
    await expect(deleteUserAction("current-user")).rejects.toThrow(
      "Kamu tidak bisa menghapus akunmu sendiri.",
    );
    expect(user.delete).not.toHaveBeenCalled();
  });
});
