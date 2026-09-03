"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateApiKey, getCurrentUserWithRole, hasRole } from "@/lib/org";
import type { Role } from "../../generated/prisma/client";

const addOrganizerSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  orgName: z.string().trim().min(2, "Org name is too short").max(60, "Org name is too long"),
  orgSlug: z
    .string()
    .trim()
    .min(2, "Slug is too short")
    .max(40, "Slug is too long")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers and dashes"),
  description: z.string().trim().max(300).optional(),
});

export type AdminFormState = { error?: string; ok?: string } | undefined;

export async function addOrganizerAction(
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const actor = await getCurrentUserWithRole();
  if (!actor) redirect("/api/auth/signin?callbackUrl=/admin");
  if (!hasRole(actor.role, "ADMIN")) {
    return { error: "Admins and superadmins can register organizers." };
  }

  const parsed = addOrganizerSchema.safeParse({
    email: formData.get("email"),
    orgName: formData.get("orgName"),
    orgSlug: formData.get("orgSlug"),
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid details." };
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });
  if (!user) {
    return { error: "No account found with that email. Ask them to sign in once first." };
  }

  const slug = parsed.data.orgSlug;
  try {
    await prisma.$transaction(async (tx) => {
      const org = await tx.org.upsert({
        where: { slug },
        create: {
          name: parsed.data.orgName,
          slug,
          description: parsed.data.description ?? null,
          apiKey: generateApiKey(),
        },
        update: {},
      });
      await tx.orgMember.upsert({
        where: { orgId_userId: { orgId: org.id, userId: user.id } },
        create: { orgId: org.id, userId: user.id, role: "OWNER" },
        update: { role: "OWNER" },
      });
      await tx.user.update({
        where: { id: user.id },
        data: { role: "ORGANIZER" },
      });
    });
  } catch (e) {
    if (e instanceof Error && "code" in e && (e as { code: string }).code === "P2002") {
      return { error: "That slug is already taken." };
    }
    return { error: "Something went wrong registering this organizer." };
  }

  revalidatePath("/admin");
  return {
    ok: `Registered ${parsed.data.email} as an organizer of ${parsed.data.orgName}.`,
  };
}

const setRoleSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  role: z.enum(["PARTICIPANT", "ORGANIZER", "ADMIN", "SUPERADMIN"]),
});

export async function setRoleAction(
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const actor = await getCurrentUserWithRole();
  if (!actor) redirect("/api/auth/signin?callbackUrl=/admin");
  if (!hasRole(actor.role, "SUPERADMIN")) {
    return { error: "Only superadmins can change roles." };
  }

  const parsed = setRoleSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid details." };
  }

  const target = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });
  if (!target) {
    return { error: "No account found with that email." };
  }

  await prisma.user.update({
    where: { id: target.id },
    data: { role: parsed.data.role as Role },
  });

  revalidatePath("/admin");
  return { ok: `Set ${parsed.data.email} to ${parsed.data.role}.` };
}

const issuePassportSchema = z.object({
  orgId: z.string().min(1, "Choose an org"),
  quantity: z.coerce.number().int().min(1, "At least one passport").max(1000, "Too many"),
  recipientEmail: z
    .string()
    .trim()
    .email("Enter a valid email")
    .optional()
    .or(z.literal("")),
  recipientName: z.string().trim().max(80, "Name is too long").optional(),
  note: z.string().trim().max(300, "Note is too long").optional(),
});

export async function issuePassportAdminAction(
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const actor = await getCurrentUserWithRole();
  if (!actor) redirect("/api/auth/signin?callbackUrl=/admin");
  if (!hasRole(actor.role, "ADMIN")) {
    return { error: "Admins and superadmins can trigger passport orders." };
  }

  const parsed = issuePassportSchema.safeParse({
    orgId: formData.get("orgId"),
    quantity: formData.get("quantity"),
    recipientEmail: formData.get("recipientEmail") || undefined,
    recipientName: formData.get("recipientName") || undefined,
    note: formData.get("note") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid details." };
  }

  const org = await prisma.org.findUnique({
    where: { id: parsed.data.orgId },
  });
  if (!org) return { error: "That org does not exist." };

  const email = parsed.data.recipientEmail?.toLowerCase().trim() || null;
  const linkedUser = email
    ? await prisma.user.findUnique({ where: { email } })
    : null;

  await prisma.passportOrder.create({
    data: {
      orgId: org.id,
      ysws: org.name,
      quantity: parsed.data.quantity,
      note: parsed.data.note ?? null,
      createdBy: actor.id,
      userId: linkedUser?.id ?? null,
      recipientName: parsed.data.recipientName?.trim() || null,
      recipientEmail: email,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  return {
    ok: linkedUser
      ? `Order placed for ${linkedUser.name ?? email} (${parsed.data.quantity} passport${parsed.data.quantity === 1 ? "" : "s"}).`
      : `Order placed (${parsed.data.quantity} passport${parsed.data.quantity === 1 ? "" : "s"}).`,
  };
}
