import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

export class EncryptionConfigError extends Error {}

function loadKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) {
    throw new EncryptionConfigError("ENCRYPTION_KEY belum diisi di .env.");
  }
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new EncryptionConfigError(
      "ENCRYPTION_KEY harus berupa 32 byte yang di-encode base64 (contoh: openssl rand -base64 32).",
    );
  }
  return key;
}

/** Encrypts `plaintext` for storage. Output encodes iv + authTag + ciphertext, all base64. */
export function encryptSecret(plaintext: string): string {
  const key = loadKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv, authTag, ciphertext].map((buf) => buf.toString("base64")).join(".");
}

/** Reverses encryptSecret(). Throws if ENCRYPTION_KEY is missing/wrong or the payload was tampered with. */
export function decryptSecret(payload: string): string {
  const key = loadKey();
  const [ivB64, authTagB64, ciphertextB64] = payload.split(".");
  if (!ivB64 || !authTagB64 || !ciphertextB64) {
    throw new EncryptionConfigError("Data terenkripsi tidak valid.");
  }
  const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(authTagB64, "base64"));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(ciphertextB64, "base64")),
    decipher.final(),
  ]);
  return plaintext.toString("utf8");
}
