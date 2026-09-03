import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/permissions", () => ({
  requireEditableStage: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    evaluationNote: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    themeIdea: {
      create: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
import { convertNoteToThemeIdeaAction } from "./actions";

const evaluationNote = prisma.evaluationNote as unknown as {
  findUnique: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
};
const themeIdea = prisma.themeIdea as unknown as { create: ReturnType<typeof vi.fn> };

beforeEach(() => {
  evaluationNote.findUnique.mockReset();
  evaluationNote.update.mockReset();
  themeIdea.create.mockReset();
});

describe("convertNoteToThemeIdeaAction", () => {
  it("creates a theme idea and marks the note converted on first call", async () => {
    evaluationNote.findUnique.mockResolvedValue({
      id: "note-1",
      content: "Coba format tanya-jawab",
      convertedToThemeIdeaAt: null,
    });

    await convertNoteToThemeIdeaAction("ep-1", "note-1");

    expect(themeIdea.create).toHaveBeenCalledWith({
      data: { title: "Coba format tanya-jawab" },
    });
    expect(evaluationNote.update).toHaveBeenCalledWith({
      where: { id: "note-1" },
      data: { convertedToThemeIdeaAt: expect.any(Date) },
    });
  });

  it("is a no-op on a note that was already converted (double-click safe)", async () => {
    evaluationNote.findUnique.mockResolvedValue({
      id: "note-1",
      content: "Coba format tanya-jawab",
      convertedToThemeIdeaAt: new Date("2026-01-01"),
    });

    await convertNoteToThemeIdeaAction("ep-1", "note-1");

    expect(themeIdea.create).not.toHaveBeenCalled();
    expect(evaluationNote.update).not.toHaveBeenCalled();
  });

  it("is a no-op when the note doesn't exist", async () => {
    evaluationNote.findUnique.mockResolvedValue(null);

    await convertNoteToThemeIdeaAction("ep-1", "missing-note");

    expect(themeIdea.create).not.toHaveBeenCalled();
    expect(evaluationNote.update).not.toHaveBeenCalled();
  });
});
