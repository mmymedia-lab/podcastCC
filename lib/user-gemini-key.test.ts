import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("./crypto", () => ({
  encryptSecret: vi.fn((plain: string) => `encrypted(${plain})`),
  decryptSecret: vi.fn((cipher: string) => cipher.replace(/^encrypted\((.*)\)$/, "$1")),
}));

import { prisma } from "@/lib/prisma";
import { clearUserGeminiApiKey, getUserGeminiApiKey, setUserGeminiApiKey } from "./user-gemini-key";

const user = prisma.user as unknown as {
  findUnique: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
};

beforeEach(() => {
  user.findUnique.mockReset();
  user.update.mockReset();
});

describe("getUserGeminiApiKey", () => {
  it("returns undefined when the user has no key set", async () => {
    user.findUnique.mockResolvedValue({ geminiApiKeyEncrypted: null });
    await expect(getUserGeminiApiKey("user-1")).resolves.toBeUndefined();
  });

  it("returns undefined when the user doesn't exist", async () => {
    user.findUnique.mockResolvedValue(null);
    await expect(getUserGeminiApiKey("user-1")).resolves.toBeUndefined();
  });

  it("decrypts and returns the stored key", async () => {
    user.findUnique.mockResolvedValue({ geminiApiKeyEncrypted: "encrypted(my-key)" });
    await expect(getUserGeminiApiKey("user-1")).resolves.toBe("my-key");
  });
});

describe("setUserGeminiApiKey", () => {
  it("stores the encrypted key", async () => {
    await setUserGeminiApiKey("user-1", "my-key");
    expect(user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { geminiApiKeyEncrypted: "encrypted(my-key)" },
    });
  });
});

describe("clearUserGeminiApiKey", () => {
  it("nulls out the stored key", async () => {
    await clearUserGeminiApiKey("user-1");
    expect(user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { geminiApiKeyEncrypted: null },
    });
  });
});
