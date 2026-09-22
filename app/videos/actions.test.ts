import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("@/lib/session", () => ({
  requireSession: vi.fn(),
}));

vi.mock("@/lib/permissions", () => ({
  requireCanDeleteProject: vi.fn(),
  requireEditableProjectStage: vi.fn(),
}));

vi.mock("@/lib/google-drive", () => ({
  createProjectDriveFolder: vi.fn(),
  deleteProjectDriveFolder: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    project: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { requireCanDeleteProject, requireEditableProjectStage } from "@/lib/permissions";
import { createProjectDriveFolder, deleteProjectDriveFolder } from "@/lib/google-drive";
import { createProjectAction, deleteProjectAction } from "./actions";

const project = prisma.project as unknown as {
  create: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  findUnique: ReturnType<typeof vi.fn>;
};
const requireSessionMock = requireSession as unknown as ReturnType<typeof vi.fn>;
const requireCanDeleteProjectMock = requireCanDeleteProject as unknown as ReturnType<typeof vi.fn>;
const requireEditableProjectStageMock = requireEditableProjectStage as unknown as ReturnType<
  typeof vi.fn
>;
const createProjectDriveFolderMock = createProjectDriveFolder as unknown as ReturnType<typeof vi.fn>;
const deleteProjectDriveFolderMock = deleteProjectDriveFolder as unknown as ReturnType<typeof vi.fn>;

function formData(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    data.set(key, value);
  }
  return data;
}

beforeEach(() => {
  project.create.mockReset();
  project.update.mockReset();
  project.delete.mockReset();
  project.findUnique.mockReset();
  requireSessionMock.mockReset().mockResolvedValue({ user: { id: "user-1" } });
  requireCanDeleteProjectMock.mockReset().mockResolvedValue({ user: { id: "user-1" } });
  requireEditableProjectStageMock.mockReset().mockResolvedValue({ user: { id: "user-1" } });
  createProjectDriveFolderMock.mockReset();
  deleteProjectDriveFolderMock.mockReset();
});

describe("createProjectAction", () => {
  it("stores the Drive folder id/url when one comes back", async () => {
    project.create.mockResolvedValue({ id: "proj-1", title: "Judul" });
    createProjectDriveFolderMock.mockResolvedValue({ id: "drive-folder-1", url: "https://drive.google.com/drive/folders/drive-folder-1" });

    await createProjectAction(formData({ title: "Judul" }));

    expect(project.update).toHaveBeenCalledWith({
      where: { id: "proj-1" },
      data: {
        driveFolderId: "drive-folder-1",
        driveFolderUrl: "https://drive.google.com/drive/folders/drive-folder-1",
      },
    });
  });

  it("skips the update when Drive folder creation soft-fails (returns null)", async () => {
    project.create.mockResolvedValue({ id: "proj-1", title: "Judul" });
    createProjectDriveFolderMock.mockResolvedValue(null);

    await createProjectAction(formData({ title: "Judul" }));

    expect(project.update).not.toHaveBeenCalled();
  });
});

describe("deleteProjectAction", () => {
  it("refuses to delete when the caller isn't allowed", async () => {
    requireCanDeleteProjectMock.mockRejectedValue(
      new Error("Hanya Super Admin atau Leader Produksi project ini yang bisa menghapus proyek."),
    );

    await expect(deleteProjectAction("proj-1")).rejects.toThrow(
      "Hanya Super Admin atau Leader Produksi project ini yang bisa menghapus proyek.",
    );
    expect(project.delete).not.toHaveBeenCalled();
  });

  it("trashes the Drive folder before deleting the project when one exists", async () => {
    project.findUnique.mockResolvedValue({ id: "proj-1", driveFolderId: "drive-folder-1" });

    await deleteProjectAction("proj-1");

    expect(deleteProjectDriveFolderMock).toHaveBeenCalledWith("drive-folder-1");
    expect(project.delete).toHaveBeenCalledWith({ where: { id: "proj-1" } });
  });

  it("skips the Drive call when the project has no folder", async () => {
    project.findUnique.mockResolvedValue({ id: "proj-1", driveFolderId: null });

    await deleteProjectAction("proj-1");

    expect(deleteProjectDriveFolderMock).not.toHaveBeenCalled();
    expect(project.delete).toHaveBeenCalledWith({ where: { id: "proj-1" } });
  });

  it("throws if the project no longer exists", async () => {
    project.findUnique.mockResolvedValue(null);

    await expect(deleteProjectAction("proj-1")).rejects.toThrow("Proyek tidak ditemukan.");
    expect(project.delete).not.toHaveBeenCalled();
  });
});
