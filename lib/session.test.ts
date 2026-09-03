import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn() },
  },
}));

import { prisma } from "./prisma";
import { resolveUserId } from "./session";

const userFindUnique = (prisma.user as unknown as { findUnique: ReturnType<typeof vi.fn> })
  .findUnique;

beforeEach(() => {
  userFindUnique.mockReset();
});

describe("resolveUserId", () => {
  it("returns session.user.id directly when present, without a DB lookup", async () => {
    const id = await resolveUserId({
      user: { id: "user-1", email: "a@example.com" },
      expires: "2099-01-01",
    } as never);

    expect(id).toBe("user-1");
    expect(userFindUnique).not.toHaveBeenCalled();
  });

  it("falls back to an email lookup when id is missing (stale/pre-migration session)", async () => {
    userFindUnique.mockResolvedValue({ id: "user-2" });

    const id = await resolveUserId({
      user: { email: "a@example.com" },
      expires: "2099-01-01",
    } as never);

    expect(id).toBe("user-2");
    expect(userFindUnique).toHaveBeenCalledWith({ where: { email: "a@example.com" } });
  });

  it("returns null when there is no session", async () => {
    expect(await resolveUserId(null)).toBeNull();
    expect(userFindUnique).not.toHaveBeenCalled();
  });

  it("returns null when the email fallback matches no user", async () => {
    userFindUnique.mockResolvedValue(null);

    const id = await resolveUserId({
      user: { email: "ghost@example.com" },
      expires: "2099-01-01",
    } as never);

    expect(id).toBeNull();
  });
});
