"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateApiKey, getCurrentUser, getCurrentUserWithRole, hasRole, canAccessYSWS } from "@/lib/org";

const createOrderSchema = z.object({
  recipientEmail: z.string().email("Enter a valid email").optional().or(z.literal("")),
  recipientName: z.string().trim().min(2, "Enter the recipient's name").max(80, "Name is too long"),
  note: z.string().trim().max(300, "Note is too long").optional(),
  yswsId: z.string().nullable().optional(),
});

export type OrderFormState = { error?: string; ok?: boolean } | undefined;

export async function createOrderAction(
  _prev: OrderFormState,
  formData: FormData
): Promise<OrderFormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/api/auth/signin?callbackUrl=/dashboard");

  const membership = await prisma.orgMember.findFirst({ where: { userId: user.id } });
  if (!membership) return { error: "You are not an organizer for any org." };

  const parsed = createOrderSchema.safeParse({
    recipientEmail: formData.get("recipientEmail") || undefined,
    recipientName: formData.get("recipientName"),
    note: formData.get("note") || undefined,
    yswsId: formData.get("yswsId") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid order." };
  }

  // Determine the YSWS ID - use provided one or fall back to org's first YSWS
  let yswsId = parsed.data.yswsId ?? undefined;
  if (!yswsId) {
    const ysws = await prisma.ySWS.findFirst({ where: { orgId: membership.orgId } });
    yswsId = ysws?.id ?? undefined;
  }

  // Verify organizer has access to this YSWS
  if (yswsId) {
    const hasAccess = await canAccessYSWS(user.id, yswsId);
    if (!hasAccess) {
      return { error: "You do not have access to this YSWS." };
    }
  }

  const email = parsed.data.recipientEmail?.toLowerCase().trim() || null;
  const linkedUser = email ? await prisma.user.findUnique({ where: { email } }) : null;

  await prisma.passportOrder.create({
    data: {
      orgId: membership.orgId,
      yswsId: yswsId ?? null,
      totalQuantity: 1,
      currentState: "AWAITING_RECIPIENT_DETAILS",
      status: "PENDING",
      note: parsed.data.note ?? null,
      createdBy: user.id,
      createdFrom: "dashboard",
      recipientName: parsed.data.recipientName,
      recipientEmail: email,
      recipientToken: crypto.randomUUID().substring(0, 16),
      createdByUserId: linkedUser?.id ?? null,
    },
  });

  revalidatePath("/dashboard");
  return { ok: true };
}

export type ApiKeyFormState = { error?: string; ok?: boolean } | undefined;

export async function regenerateApiKeyAction(
  _prev: ApiKeyFormState,
  formData: FormData
): Promise<ApiKeyFormState> {
  const user = await getCurrentUserWithRole();
  if (!user) redirect("/api/auth/signin?callbackUrl=/dashboard");
  if (!hasRole(user.role, "ORGANIZER")) {
    return { error: "Only organizers can manage API keys." };
  }

  const orgId = formData.get("orgId");
  const yswsId = formData.get("yswsId");
  
  if (typeof orgId !== "string" || !orgId) {
    return { error: "Missing org." };
  }

  const membership = await prisma.orgMember.findUnique({
    where: { orgId_userId: { orgId, userId: user.id } },
  });
  if (!membership) return { error: "You are not a member of this org." };

  // Verify organizer has access to the specific YSWS
  const yswsIdStr = typeof yswsId === "string" ? yswsId : null;
  if (!yswsIdStr) {
    return { error: "Missing YSWS." };
  }
  const ywsAccess = await canAccessYSWS(user.id, yswsIdStr);
  if (!ywsAccess) return { error: "You are not authorized for this YSWS." };

  // Update the specific YSWS apiKey
  const ysws = await prisma.ySWS.findUnique({
    where: { id: yswsIdStr },
  });
  if (!ysws) return { error: "YSWS not found." };

  await prisma.ySWS.update({
    where: { id: ysws.id },
    data: { apiKey: generateApiKey() },
  });

  revalidatePath("/dashboard");
  return { ok: true };
}

export type IssuePassportState = { error?: string; ok?: string } | undefined;

const issuePassportSchema = z.object({
  recipientName: z.string().trim().min(2, "Enter the recipient's name").max(80, "Name is too long"),
  recipientEmail: z
    .string()
    .trim()
    .email("Enter a valid email")
    .optional()
    .or(z.literal("")),
  note: z.string().trim().max(300, "Note is too long").optional(),
});

export async function issuePassportAction(
  _prev: IssuePassportState,
  formData: FormData
): Promise<IssuePassportState> {
  const user = await getCurrentUserWithRole();
  if (!user) redirect("/api/auth/signin?callbackUrl=/dashboard");
  if (!hasRole(user.role, "ORGANIZER")) {
    return { error: "Only organizers can issue passports." };
  }

  const membership = await prisma.orgMember.findFirst({
    where: { userId: user.id },
  });
  if (!membership) return { error: "You are not an organizer for any org." };

  const org = await prisma.org.findUnique({
    where: { id: membership.orgId },
    select: { name: true },
  });

  const parsed = issuePassportSchema.safeParse({
    recipientName: formData.get("recipientName"),
    recipientEmail: formData.get("recipientEmail") || undefined,
    note: formData.get("note") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid details." };
  }

  const email = parsed.data.recipientEmail?.toLowerCase().trim() || null;
  const linkedUser = email
    ? await prisma.user.findUnique({ where: { email } })
    : null;

  // Create order in AWAITING_RECIPIENT_DETAILS state
  const order = await prisma.passportOrder.create({
    data: {
      orgId: membership.orgId,
      yswsId: org?.name ?? null,
      totalQuantity: 1,
      currentState: "AWAITING_RECIPIENT_DETAILS",
      status: "PENDING",
      note: parsed.data.note ?? null,
      createdBy: user.id,
      createdByUserId: linkedUser?.id ?? null,
      createdFrom: "dashboard",
      recipientName: parsed.data.recipientName,
      recipientEmail: email,
      recipientToken: crypto.randomUUID().substring(0, 16),
    },
  });

  // Create OrderEvent for ORDER_CREATED
  await prisma.orderEvent.create({
    data: {
      orderId: order.id,
      eventType: "ORDER_CREATED" as const,
      status: "PENDING" as const,
      newState: "AWAITING_RECIPIENT_DETAILS" as const,
      actor: user.id,
      actorType: "organizer" as const,
      description: `Passport order created for ${parsed.data.recipientName ?? email}`,
    },
  });

  // Create EmailDelivery record
  await prisma.emailDelivery.create({
    data: {
      orderId: order.id,
      recipientEmail: email ?? "",
      eventType: "EMAIL_SENT" as const,
      status: email ? "sent" : "pending",
    },
  });

  revalidatePath("/dashboard");
  return { ok: "Passport order created. We will be in touch." };
}

export type SubmitRecipientDetailsState = { error?: string; ok?: string } | undefined;

const submitRecipientDetailsSchema = z.object({
  recipientName: z.string().trim().min(2, "Enter the recipient's name").max(80, "Name is too long"),
  recipientEmail: z
    .string()
    .trim()
    .email("Enter a valid email")
    .optional()
    .or(z.literal("")),
  note: z.string().trim().max(300, "Note is too long").optional(),
});

export async function submitRecipientDetailsAction(
  _prev: SubmitRecipientDetailsState,
  formData: FormData
): Promise<SubmitRecipientDetailsState> {
  const user = await getCurrentUserWithRole();
  if (!user) return { error: "You must be signed in." };

  const orderId = formData.get("orderId") as string;
  if (!orderId) return { error: "Missing order ID." };

  // Verify organizer owns this order
  const order = await prisma.passportOrder.findUnique({
    where: { id: orderId },
    include: { org: true },
  });
  if (!order) return { error: "Order not found." };
  if (order.orgId !== user.id && order.createdBy !== user.id) {
    return { error: "You do not have access to this order." };
  }

  const parsed = submitRecipientDetailsSchema.safeParse({
    recipientName: formData.get("recipientName"),
    recipientEmail: formData.get("recipientEmail") || undefined,
    note: formData.get("note") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid details." };
  }

  const email = parsed.data.recipientEmail?.toLowerCase().trim() || order.recipientEmail;
  const name = parsed.data.recipientName || order.recipientName;

  // Update the order with recipient details and transition state
  await prisma.passportOrder.update({
    where: { id: orderId },
    data: {
      recipientName: name,
      recipientEmail: email,
      currentState: "RECIPIENT_DETAILS_RECEIVED" as const,
      status: email ? "CONFIRMED" : "PENDING",
    },
  });

  // Create OrderEvent for STATUS_CHANGED / RECIPIENT_DETAILS_SUBMITTED
  await prisma.orderEvent.create({
    data: {
      orderId: orderId,
      eventType: "RECIPIENT_DETAILS_SUBMITTED" as const,
      status: order.status,
      previousState: "AWAITING_RECIPIENT_DETAILS" as const,
      newState: "RECIPIENT_DETAILS_RECEIVED" as const,
      actor: user.id,
      actorType: "organizer" as const,
      description: `Recipient details submitted for order ${orderId}`,
    },
  });

  // Create EmailDelivery record if email was provided
  if (email) {
    await prisma.emailDelivery.create({
      data: {
        orderId: orderId,
        recipientEmail: email,
        eventType: "EMAIL_SENT" as const,
        status: "sent" as const,
      },
    });
  }

  revalidatePath("/dashboard");
  return { ok: "Recipient details received. Passport is now being prepared." };
}

export type RegenerateTrackingTokenState = { error?: string; ok?: string } | undefined;

export async function regenerateTrackingTokenAction(
  _prev: RegenerateTrackingTokenState,
  formData: FormData
): Promise<RegenerateTrackingTokenState> {
  const user = await getCurrentUserWithRole();
  if (!user) return { error: "You must be signed in." };

  const orderId = formData.get("orderId") as string;
  if (!orderId) return { error: "Missing order ID." };

  // Verify organizer owns this order
  const order = await prisma.passportOrder.findUnique({
    where: { id: orderId },
    include: { org: true },
  });
  if (!order) return { error: "Order not found." };
  if (order.orgId !== user.id && order.createdBy !== user.id) {
    return { error: "You do not have access to this order." };
  }

  const newToken = crypto.randomUUID().substring(0, 16);

  await prisma.passportOrder.update({
    where: { id: orderId },
    data: { recipientToken: newToken },
  });

  revalidatePath("/dashboard");
  return { ok: `Tracking token regenerated: ${newToken}` };
}