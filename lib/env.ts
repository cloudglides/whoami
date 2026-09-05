import { z } from "zod";

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),

  // NextAuth
  AUTH_SECRET: z.string().min(32),
  AUTH_URL: z.string().url(),
  AUTH_HCA_CLIENT_ID: z.string().min(1),
  AUTH_HCA_CLIENT_SECRET: z.string().min(1),

  // Superadmin bootstrap (optional, for initial setup only)
  SUPERADMIN_EMAILS: z.string().default(""),

  // Redis / Valkey (for feedback, rate limiting)
  REDIS_URL: z.string().default("redis://127.0.0.1:6379"),

  // Email (Resend)
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),

  // Sentry
  SENTRY_DSN: z.string().optional(),

  // Airtable
  AIRTABLE_API_KEY: z.string().optional(),
  AIRTABLE_BASE_ID: z.string().optional(),

  // Feature flags
  FEATURE_EMAIL: z.string().default("false"),
  FEATURE_AIRTABLE: z.string().default("false"),
  FEATURE_RECIPIENT: z.string().default("false"),

  // Logging
  LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "fatal"]).default("info"),
});

export const env = envSchema.parse(process.env);