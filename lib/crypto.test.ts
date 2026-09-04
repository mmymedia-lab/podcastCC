import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { decryptSecret, EncryptionConfigError, encryptSecret } from "./crypto";

const originalEnv = { ...process.env };

beforeEach(() => {
  process.env.ENCRYPTION_KEY = "wF3n8y2K5b7Xh1qYtVzR4dM6cS9pL0jN2eA8oB1uC3g=";
});

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("encryptSecret/decryptSecret", () => {
  it("round-trips a plaintext value", () => {
    const ciphertext = encryptSecret("my-gemini-key");
    expect(ciphertext).not.toContain("my-gemini-key");
    expect(decryptSecret(ciphertext)).toBe("my-gemini-key");
  });

  it("produces a different ciphertext each time (random iv)", () => {
    expect(encryptSecret("same-value")).not.toBe(encryptSecret("same-value"));
  });

  it("throws EncryptionConfigError when ENCRYPTION_KEY is missing", () => {
    delete process.env.ENCRYPTION_KEY;
    expect(() => encryptSecret("value")).toThrow(EncryptionConfigError);
  });

  it("throws EncryptionConfigError when ENCRYPTION_KEY is the wrong length", () => {
    process.env.ENCRYPTION_KEY = "dG9vc2hvcnQ=";
    expect(() => encryptSecret("value")).toThrow(EncryptionConfigError);
  });

  it("fails to decrypt with the wrong key", () => {
    const ciphertext = encryptSecret("secret-value");
    process.env.ENCRYPTION_KEY = "z8xVb2Nq5wE7tR1yU4iO6pA9sD0fG3hJ5kL8mZ1cX2v=";
    expect(() => decryptSecret(ciphertext)).toThrow();
  });
});
