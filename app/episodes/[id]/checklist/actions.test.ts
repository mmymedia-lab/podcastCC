import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/permissions", () => ({
  requireEditableStage: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    checklistItem: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
import { requireEditableStage } from "@/lib/permissions";
import {
  createChecklistItemAction,
  toggleChecklistItemAction,
  deleteChecklistItemAction,
} from "./actions";

const checklistItem = prisma.checklistItem as unknown as {
  findFirst: ReturnType<typeof vi.fn>;
  findUnique: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};
const requireEditableStageMock = requireEditableStage as unknown as ReturnType<typeof vi.fn>;

function formDataWithLabel(label: string) {
  const formData = new FormData();
  formData.set("label", label);
  return formData;
}

beforeEach(() => {
  checklistItem.findFirst.mockReset();
  checklistItem.findUnique.mockReset();
  checklistItem.create.mockReset();
  checklistItem.update.mockReset();
  checklistItem.delete.mockReset();
  requireEditableStageMock.mockReset().mockResolvedValue(undefined);
});

describe("createChecklistItemAction", () => {
  it("starts order at 1 for the first item in a category", async () => {
    checklistItem.findFirst.mockResolvedValue(null);

    await createChecklistItemAction("ep-1", "PRE_PRODUCTION", "pra-produksi", formDataWithLabel("Siapkan mic"));

    expect(checklistItem.create).toHaveBeenCalledWith({
      data: { episodeId: "ep-1", category: "PRE_PRODUCTION", label: "Siapkan mic", order: 1 },
    });
  });

  it("increments order based on the last item in the same episode+category", async () => {
    checklistItem.findFirst.mockResolvedValue({ order: 4 });

    await createChecklistItemAction("ep-1", "PRE_PRODUCTION", "pra-produksi", formDataWithLabel("Cek baterai"));

    expect(checklistItem.create).toHaveBeenCalledWith({
      data: { episodeId: "ep-1", category: "PRE_PRODUCTION", label: "Cek baterai", order: 5 },
    });
  });

  it("gates on the stage mapped from the category, not the slug", async () => {
    await createChecklistItemAction("ep-1", "POST_PRODUCTION", "pasca-produksi", formDataWithLabel("Mixing"));

    expect(requireEditableStageMock).toHaveBeenCalledWith("ep-1", "PASCA_PRODUKSI");
  });

  it("rejects an empty label without touching the database", async () => {
    await expect(
      createChecklistItemAction("ep-1", "PRE_PRODUCTION", "pra-produksi", formDataWithLabel("   ")),
    ).rejects.toThrow("Item checklist wajib diisi.");

    expect(checklistItem.create).not.toHaveBeenCalled();
  });
});

describe("toggleChecklistItemAction", () => {
  it("flips isDone from false to true", async () => {
    checklistItem.findUnique.mockResolvedValue({ id: "item-1", isDone: false });

    await toggleChecklistItemAction("ep-1", "pra-produksi", "item-1");

    expect(checklistItem.update).toHaveBeenCalledWith({
      where: { id: "item-1" },
      data: { isDone: true },
    });
  });

  it("flips isDone from true to false", async () => {
    checklistItem.findUnique.mockResolvedValue({ id: "item-1", isDone: true });

    await toggleChecklistItemAction("ep-1", "pra-produksi", "item-1");

    expect(checklistItem.update).toHaveBeenCalledWith({
      where: { id: "item-1" },
      data: { isDone: false },
    });
  });

  it("no-ops silently when the item doesn't exist", async () => {
    checklistItem.findUnique.mockResolvedValue(null);

    await toggleChecklistItemAction("ep-1", "pra-produksi", "missing-item");

    expect(checklistItem.update).not.toHaveBeenCalled();
  });

  it("rejects an invalid category slug before touching the database", async () => {
    await expect(toggleChecklistItemAction("ep-1", "not-a-real-slug", "item-1")).rejects.toThrow(
      "Kategori checklist tidak valid.",
    );

    expect(checklistItem.findUnique).not.toHaveBeenCalled();
  });
});

describe("deleteChecklistItemAction", () => {
  it("deletes the item by id and gates on the mapped stage", async () => {
    await deleteChecklistItemAction("ep-1", "publish", "item-1");

    expect(requireEditableStageMock).toHaveBeenCalledWith("ep-1", "PUBLISH_DISTRIBUSI");
    expect(checklistItem.delete).toHaveBeenCalledWith({ where: { id: "item-1" } });
  });

  it("rejects an invalid category slug before touching the database", async () => {
    await expect(deleteChecklistItemAction("ep-1", "not-a-real-slug", "item-1")).rejects.toThrow(
      "Kategori checklist tidak valid.",
    );

    expect(checklistItem.delete).not.toHaveBeenCalled();
  });
});
