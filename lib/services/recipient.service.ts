import { prisma } from "../prisma";
import { auditLog } from "../audit";
import { getRequestId } from "../request-id";
import { validateEmail } from "../email";
import { encryptPIIFields, decryptPIIFields, PII_FIELDS, encryptPII } from "../encryption";

export interface RecipientData {
  name?: string | null;
  email?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  stateProvince?: string | null;
  postalCode?: string | null;
  country?: string | null;
  dateOfBirth?: Date | null;
  emergencyContact?: string | null;
  photoUrl?: string | null;
  [key: string]: unknown;
}

export async function getRecipientByOrderAndEmail(orderId: string, email: string) {
  return prisma.passportRecipient.findUnique({
    where: { orderId_email: { orderId, email } },
  });
}

export async function upsertRecipient(
  orderId: string,
  email: string,
  data: RecipientData
) {
  const normalizedEmail = email.toLowerCase().trim();
  const validation = validateEmail(normalizedEmail);
  if (!validation.valid) throw new Error(validation.error);

  const encryptedData = await encryptPIIFields(data, PII_FIELDS);

  return prisma.passportRecipient.upsert({
    where: { orderId_email: { orderId, email: normalizedEmail } },
    create: {
      orderId,
      email: normalizedEmail,
      name: data.name ?? null,
      addressLine1: encryptedData.addressLine1 as string | null,
      addressLine2: encryptedData.addressLine2 as string | null,
      city: encryptedData.city as string | null,
      stateProvince: encryptedData.stateProvince as string | null,
      postalCode: encryptedData.postalCode as string | null,
      country: encryptedData.country as string | null,
      dateOfBirth: data.dateOfBirth ?? null,
      emergencyContact: encryptedData.emergencyContact as string | null,
      photoUrl: data.photoUrl ?? null,
    },
    update: {
      name: data.name ?? undefined,
      addressLine1: encryptedData.addressLine1 as string | null,
      addressLine2: encryptedData.addressLine2 as string | null,
      city: encryptedData.city as string | null,
      stateProvince: encryptedData.stateProvince as string | null,
      postalCode: encryptedData.postalCode as string | null,
      country: encryptedData.country as string | null,
      dateOfBirth: data.dateOfBirth ?? undefined,
      emergencyContact: encryptedData.emergencyContact as string | null,
      photoUrl: data.photoUrl ?? undefined,
    },
  });
}

export async function updateRecipientField(
  orderId: string,
  email: string,
  field: keyof RecipientData,
  value: RecipientData[keyof RecipientData]
) {
  const recipient = await getRecipientByOrderAndEmail(orderId, email);
  if (!recipient) throw new Error("Recipient not found");

  let encryptedValue = value;
  if (PII_FIELDS.includes(field as typeof PII_FIELDS[number]) && typeof value === "string") {
    encryptedValue = await encryptPII(value);
  }

  return prisma.passportRecipient.update({
    where: { id: recipient.id },
    data: { [field]: encryptedValue },
  });
}

export async function getDecryptedRecipient(recipientId: string) {
  const recipient = await prisma.passportRecipient.findUnique({
    where: { id: recipientId },
  });
  if (!recipient) return null;

  const decrypted = await decryptPIIFields(recipient, PII_FIELDS);
  return decrypted;
}

export async function getOrderRecipients(orderId: string) {
  const recipients = await prisma.passportRecipient.findMany({
    where: { orderId },
    orderBy: { createdAt: "asc" },
  });

  return Promise.all(recipients.map((r) => decryptPIIFields(r, PII_FIELDS)));
}

export async function completeRecipientDetails(orderId: string, email: string) {
  const recipient = await getRecipientByOrderAndEmail(orderId, email);
  if (!recipient) throw new Error("Recipient not found");

  const requiredFields = ["name", "email", "addressLine1", "city", "country"];
  const missing = requiredFields.filter((field) => !recipient[field as keyof typeof recipient]);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(", ")}`);
  }

  await prisma.passportOrder.update({
    where: { id: orderId },
    data: {
      currentState: "RECIPIENT_DETAILS_RECEIVED",
      status: "CONFIRMED",
      recipientEmail: email,
    },
  });

  await prisma.orderEvent.create({
    data: {
      orderId,
      eventType: "RECIPIENT_DETAILS_SUBMITTED",
      status: "CONFIRMED",
      previousState: "AWAITING_RECIPIENT_DETAILS",
      newState: "RECIPIENT_DETAILS_RECEIVED",
      actor: "recipient",
      actorType: "RECIPIENT",
      description: `Recipient completed all details for order ${orderId}`,
    },
  });

  await prisma.emailDelivery.create({
    data: {
      orderId,
      recipientEmail: email,
      eventType: "EMAIL_SENT",
      status: "pending",
    },
  });

  await auditLog({
    entityType: "PassportOrder",
    entityId: orderId,
    action: "RECIPIENT_DETAILS_COMPLETED",
    actor: "recipient",
    actorType: "RECIPIENT",
    description: `Recipient completed all details for order ${orderId}`,
    requestId: await getRequestId(),
  });
}

export async function regenerateTrackingToken(orderId: string) {
  const newToken = Array.from(crypto.getRandomValues(new Uint8Array(32)), (b) =>
    b.toString(16).padStart(2, "0")
  ).join("");

  await prisma.passportOrder.update({
    where: { id: orderId },
    data: { recipientToken: newToken },
  });

  await auditLog({
    entityType: "PassportOrder",
    entityId: orderId,
    action: "TRACKING_TOKEN_REGENERATED",
    actor: "system",
    actorType: "SYSTEM",
    description: `Tracking token regenerated for order ${orderId}`,
    requestId: await getRequestId(),
  });

  return newToken;
}

export function getCompletedSteps(recipient: RecipientData | null): string[] {
  if (!recipient) return [];
  return [
    recipient.name ? "name" : null,
    recipient.email ? "email" : null,
    recipient.addressLine1 ? "address" : null,
    recipient.photoUrl ? "photo" : null,
    recipient.emergencyContact ? "emergency" : null,
  ].filter(Boolean) as string[];
}

export const STEP_ORDER = ["name", "email", "address", "photo", "emergency", "review"] as const;
export type StepKey = (typeof STEP_ORDER)[number];

export function getNextStep(currentStep: StepKey, completedSteps: string[]): StepKey | null {
  const currentIndex = STEP_ORDER.indexOf(currentStep);
  if (currentIndex === -1 || currentIndex === STEP_ORDER.length - 1) return null;
  return (STEP_ORDER[currentIndex + 1] ?? null) as StepKey | null;
}

export function canSkipStep(step: StepKey): boolean {
  const requiredSteps: StepKey[] = ["name", "email", "address"];
  return !requiredSteps.includes(step);
}