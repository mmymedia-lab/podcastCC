import { describe, expect, it } from "vitest";
import { extractDriveFileId } from "./google-drive-url";

describe("extractDriveFileId", () => {
  it("extracts the ID from a /file/d/<id>/view link", () => {
    expect(extractDriveFileId("https://drive.google.com/file/d/abc123XYZ-_/view?usp=sharing")).toBe(
      "abc123XYZ-_",
    );
  });

  it("extracts the ID from an open?id=<id> link", () => {
    expect(extractDriveFileId("https://drive.google.com/open?id=abc123XYZ-_")).toBe("abc123XYZ-_");
  });

  it("extracts the ID from a uc?id=<id> link", () => {
    expect(extractDriveFileId("https://drive.google.com/uc?export=view&id=abc123XYZ-_")).toBe(
      "abc123XYZ-_",
    );
  });

  it("returns null for a non-Drive-file URL", () => {
    expect(extractDriveFileId("https://example.com/not-a-drive-link")).toBeNull();
  });

  it("returns null for a Drive folder URL", () => {
    expect(extractDriveFileId("https://drive.google.com/drive/folders/abc123")).toBeNull();
  });
});
