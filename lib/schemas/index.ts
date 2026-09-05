import { z } from "zod";
import { normalizeEmail } from "../email";
import {
  MAX_NAME_LENGTH,
  MIN_NAME_LENGTH,
  MAX_NOTE_LENGTH,
  ALLOWED_IMAGE_TYPES,
  MAX_FILE_SIZE,
} from "../constants";

export const createOrderSchema = z.object({
  recipientEmail: z.string().email("Enter a valid recipient email").transform(normalizeEmail),
  recipientName: z
    .string()
    .trim()
    .min(MIN_NAME_LENGTH, "Enter the recipient's name")
    .max(MAX_NAME_LENGTH, "Name is too long"),
  note: z.string().trim().max(MAX_NOTE_LENGTH, "Note is too long").optional(),
  yswsId: z.string().optional(),
});

export const issuePassportSchema = z.object({
  recipientName: z
    .string()
    .trim()
    .min(MIN_NAME_LENGTH, "Enter the recipient's name")
    .max(MAX_NAME_LENGTH, "Name is too long"),
  recipientEmail: z.string().trim().email("Enter a valid email").transform(normalizeEmail),
  note: z.string().trim().max(MAX_NOTE_LENGTH, "Note is too long").optional(),
  orgId: z.string().min(1, "Choose an org"),
});

export const addOrganizerSchema = z.object({
  email: z.string().trim().email("Enter a valid email").transform(normalizeEmail),
  orgName: z.string().trim().min(2, "Org name is too short").max(60, "Org name is too long"),
  orgSlug: z
    .string()
    .trim()
    .min(2, "Slug is too short")
    .max(40, "Slug is too long")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers and dashes"),
  description: z.string().trim().max(300).optional(),
});

export const setRoleSchema = z.object({
  email: z.string().trim().email("Enter a valid email").transform(normalizeEmail),
  role: z.enum(["PARTICIPANT", "ORGANIZER", "ADMIN", "SUPERADMIN"]),
});

export const submitProjectSchema = z.object({
  title: z.string().trim().min(2, "Add a title").max(80, "Title is too long"),
  description: z.string().trim().max(400, "Description is too long").optional(),
  url: z
    .string()
    .trim()
    .url("Enter a valid URL (start with https://)")
    .optional()
    .or(z.literal("")),
});

export const recipientNameSchema = z.object({
  recipientName: z
    .string()
    .trim()
    .min(MIN_NAME_LENGTH, "Enter your full name")
    .max(MAX_NAME_LENGTH, "Name is too long"),
});

export const recipientEmailSchema = z.object({
  recipientEmail: z.string().email("Enter a valid email address").transform(normalizeEmail),
});

export const recipientAddressSchema = z.object({
  addressLine1: z
    .string()
    .trim()
    .min(2, "Enter address line 1")
    .max(100, "Address line 1 is too long"),
  addressLine2: z.string().trim().max(100, "Address line 2 is too long").optional().or(z.literal("")),
  city: z.string().trim().min(2, "Enter city").max(60, "City name is too long"),
  stateProvince: z.string().trim().max(60, "State/province is too long").optional().or(z.literal("")),
  postalCode: z.string().trim().min(3, "Enter postal code").max(20, "Postal code is too long"),
  country: z.string().length(2, "Select a country"),
});

export const recipientPhotoSchema = z.object({
  photo: z
    .instanceof(File)
    .optional()
    .refine((f) => !f || f.size <= MAX_FILE_SIZE, "File too large (max 5MB)")
    .refine(
      (f) => !f || ALLOWED_IMAGE_TYPES.includes(f.type as typeof ALLOWED_IMAGE_TYPES[number]),
      "Invalid file type (JPEG, PNG, WebP only)"
    ),
});

export const recipientEmergencySchema = z.object({
  emergencyContact: z.string().trim().max(200, "Emergency contact is too long").optional().or(z.literal("")),
});

export const submitRecipientDetailsSchema = z.object({
  recipientName: z
    .string()
    .trim()
    .min(MIN_NAME_LENGTH, "Enter the recipient's name")
    .max(MAX_NAME_LENGTH, "Name is too long"),
  recipientEmail: z
    .string()
    .trim()
    .email("Enter a valid email")
    .optional()
    .or(z.literal(""))
    .transform((val) => (val ? normalizeEmail(val) : undefined)),
  note: z.string().trim().max(MAX_NOTE_LENGTH, "Note is too long").optional(),
});

export const regenerateApiKeySchema = z.object({
  orgId: z.string().min(1, "Choose an org"),
  yswsId: z.string().min(1, "Choose a YSWS"),
});