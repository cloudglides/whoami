import { z } from "zod";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function validateEmail(email: string): { valid: boolean; normalized?: string; error?: string } {
  const normalized = normalizeEmail(email);
  if (!EMAIL_REGEX.test(normalized)) {
    return { valid: false, error: "Invalid email format" };
  }
  if (normalized.length > 254) {
    return { valid: false, error: "Email too long" };
  }
  return { valid: true, normalized };
}

export const emailSchema = z
  .string()
  .trim()
  .email("Enter a valid email address")
  .transform(normalizeEmail);

export const optionalEmailSchema = z
  .string()
  .trim()
  .email("Enter a valid email address")
  .optional()
  .or(z.literal(""))
  .transform((val) => (val ? normalizeEmail(val) : undefined));

export function isEmailVerified(email: string | null | undefined): boolean {
  if (!email) return false;
  // In production, check against email verification status in DB
  return true;
}