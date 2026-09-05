const ENCRYPTION_KEY_BASE64 = process.env.PII_ENCRYPTION_KEY!;

async function getCryptoKey(): Promise<CryptoKey> {
  const keyData = Buffer.from(ENCRYPTION_KEY_BASE64, "base64");
  return crypto.subtle.importKey("raw", keyData, { name: "AES-GCM" }, false, [
    "encrypt",
    "decrypt",
  ]);
}

export async function encryptPII(plaintext: string): Promise<string> {
  if (!plaintext) return "";
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);
  const key = await getCryptoKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data);
  return Buffer.from(iv).toString("base64") + ":" + Buffer.from(encrypted).toString("base64");
}

export async function decryptPII(ciphertext: string): Promise<string> {
  if (!ciphertext) return "";
  const [ivB64, dataB64] = ciphertext.split(":");
  if (!ivB64 || !dataB64) return "";
  const iv = Buffer.from(ivB64, "base64");
  const data = Buffer.from(dataB64, "base64");
  const key = await getCryptoKey();
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
  return new TextDecoder().decode(decrypted);
}

export async function encryptPIIFields<T extends Record<string, unknown>>(
  obj: T,
  fields: readonly (keyof T)[]
): Promise<T> {
  const result = { ...obj } as Record<string, unknown>;
  for (const field of fields) {
    const value = result[field as string];
    if (typeof value === "string" && value) {
      result[field as string] = await encryptPII(value);
    }
  }
  return result as T;
}

export async function decryptPIIFields<T extends Record<string, unknown>>(
  obj: T,
  fields: readonly (keyof T)[]
): Promise<T> {
  const result = { ...obj } as Record<string, unknown>;
  for (const field of fields) {
    const value = result[field as string];
    if (typeof value === "string" && value) {
      result[field as string] = await decryptPII(value);
    }
  }
  return result as T;
}

export const PII_FIELDS = [
  "addressLine1",
  "addressLine2",
  "city",
  "stateProvince",
  "postalCode",
  "country",
  "dateOfBirth",
  "emergencyContact",
] as const;