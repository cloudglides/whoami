"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateApiKey, getCurrentUser, getCurrentUserWithRole, hasRole } from "@/lib/org";

const createOrderSchema = z.object({
  quantity: z.coerce.number().int().min(1, "Order at least one passport").max(1000, "That is too many passports"),
  note: z.string().trim().max(300, "Note is too long").optional(),
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

  const org = await prisma.org.findUnique({
    where: { id: membership.orgId },
    select: { name: true },
  });

  const parsed = createOrderSchema.safeParse({
    quantity: formData.get("quantity"),
    note: formData.get("note") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid order." };
  }

  await prisma.passportOrder.create({
    data: {
      orgId: membership.orgId,
      ysws: org?.name ?? null,
      quantity: parsed.data.quantity,
      note: parsed.data.note ?? null,
      createdBy: user.id,
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
  if (typeof orgId !== "string" || !orgId) {
    return { error: "Missing org." };
  }

  const membership = await prisma.orgMember.findUnique({
    where: { orgId_userId: { orgId, userId: user.id } },
  });
  if (!membership) return { error: "You are not a member of this org." };

  await prisma.org.update({
    where: { id: orgId },
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

  await prisma.passportOrder.create({
    data: {
      orgId: membership.orgId,
      ysws: org?.name ?? null,
      quantity: 1,
      note: parsed.data.note ?? null,
      createdBy: user.id,
      userId: linkedUser?.id ?? null,
      recipientName: parsed.data.recipientName,
      recipientEmail: email,
    },
  });

  revalidatePath("/dashboard");
  return { ok: "Passport issued. We will print and ship it." };
}
