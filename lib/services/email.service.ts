import { prisma } from "../prisma";
import { auditLog } from "./audit.service";
import { getRequestId } from "../request-id";
import type { EventType } from "../../generated/prisma/enums";

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export async function createEmailDelivery(input: {
  orderId: string;
  recipientEmail: string;
  eventType: EventType;
  status: "sent" | "failed" | "retrying" | "pending";
  attempts?: number;
  errorMessage?: string;
}) {
  return prisma.emailDelivery.create({
    data: {
      orderId: input.orderId,
      recipientEmail: input.recipientEmail,
      eventType: input.eventType,
      status: input.status,
      attempts: input.attempts ?? 0,
      errorMessage: input.errorMessage ?? null,
    },
  });
}

export async function updateEmailDeliveryStatus(
  id: string,
  status: "sent" | "failed" | "retrying" | "pending",
  errorMessage?: string
) {
  return prisma.emailDelivery.update({
    where: { id },
    data: {
      status,
      attempts: { increment: 1 },
      lastAttemptAt: new Date(),
      sentAt: status === "sent" ? new Date() : undefined,
      errorMessage: errorMessage ?? null,
    },
  });
}

export async function getPendingEmails(limit = 50) {
  return prisma.emailDelivery.findMany({
    where: { status: "pending" },
    orderBy: { createdAt: "asc" },
    take: limit,
  });
}

export async function getFailedEmails(limit = 50) {
  return prisma.emailDelivery.findMany({
    where: { status: "failed", attempts: { lt: 3 } },
    orderBy: { lastAttemptAt: "asc" },
    take: limit,
  });
}

export function generateOrderCreatedEmail(order: {
  id: string;
  recipientName: string | null;
  recipientEmail: string;
  recipientToken: string;
  yswsName: string;
  orgName: string;
}): EmailTemplate {
  const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/track/${order.recipientToken}`;
  const recipientUrl = `${process.env.NEXT_PUBLIC_APP_URL}/recipient/${order.recipientToken}`;

  return {
    subject: `Your Hack Club Passport order from ${order.yswsName}`,
    html: `
      <h1>Passport Order Created</h1>
      <p>Hi ${order.recipientName ?? "there"},</p>
      <p>A passport order has been created for you by <strong>${order.yswsName}</strong> (${order.orgName}).</p>
      <p>Please complete your details at: <a href="${recipientUrl}">${recipientUrl}</a></p>
      <p>Track your order at: <a href="${trackingUrl}">${trackingUrl}</a></p>
      <hr>
      <p><small>Order ID: ${order.id}</small></p>
    `,
    text: `
Passport Order Created

Hi ${order.recipientName ?? "there"},

A passport order has been created for you by ${order.yswsName} (${order.orgName}).

Please complete your details at: ${recipientUrl}

Track your order at: ${trackingUrl}

Order ID: ${order.id}
    `,
  };
}

export function generateDetailsReceivedEmail(order: {
  id: string;
  recipientName: string | null;
  recipientEmail: string;
  recipientToken: string;
  yswsName: string;
}): EmailTemplate {
  const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/track/${order.recipientToken}`;

  return {
    subject: `Passport details received - ${order.yswsName}`,
    html: `
      <h1>Details Received</h1>
      <p>Hi ${order.recipientName ?? "there"},</h1>
      <p>We've received your details and your passport is now being prepared.</p>
      <p>Track your order at: <a href="${trackingUrl}">${trackingUrl}</a></p>
      <hr>
      <p><small>Order ID: ${order.id}</small></p>
    `,
    text: `
Details Received

Hi ${order.recipientName ?? "there"},

We've received your details and your passport is now being prepared.

Track your order at: ${trackingUrl}

Order ID: ${order.id}
    `,
  };
}

export function generateShippedEmail(order: {
  id: string;
  recipientName: string | null;
  recipientEmail: string;
  recipientToken: string;
  trackingNumber: string;
  carrier: string;
}): EmailTemplate {
  const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/track/${order.recipientToken}`;

  return {
    subject: `Your passport has shipped!`,
    html: `
      <h1>Your Passport Has Shipped</h1>
      <p>Hi ${order.recipientName ?? "there"},</p>
      <p>Your Hack Club Passport has been shipped via <strong>${order.carrier}</strong>.</p>
      <p>Tracking number: <strong>${order.trackingNumber}</strong></p>
      <p>Track your shipment at: <a href="${trackingUrl}">${trackingUrl}</a></p>
      <hr>
      <p><small>Order ID: ${order.id}</small></p>
    `,
    text: `
Your Passport Has Shipped

Hi ${order.recipientName ?? "there"},

Your Hack Club Passport has been shipped via ${order.carrier}.

Tracking number: ${order.trackingNumber}

Track your shipment at: ${trackingUrl}

Order ID: ${order.id}
    `,
  };
}

export function generateDeliveredEmail(order: {
  id: string;
  recipientName: string | null;
  recipientEmail: string;
  recipientToken: string;
}): EmailTemplate {
  const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/track/${order.recipientToken}`;

  return {
    subject: `Your passport has been delivered!`,
    html: `
      <h1>Delivered!</h1>
      <p>Hi ${order.recipientName ?? "there"},</p>
      <p>Your Hack Club Passport has been delivered.</p>
      <p>View details at: <a href="${trackingUrl}">${trackingUrl}</a></p>
      <hr>
      <p><small>Order ID: ${order.id}</small></p>
    `,
    text: `
Delivered!

Hi ${order.recipientName ?? "there"},

Your Hack Club Passport has been delivered.

View details at: ${trackingUrl}

Order ID: ${order.id}
    `,
  };
}

export async function sendEmail(options: { to: string; subject: string; html: string; text?: string }): Promise<{ success: boolean; error?: string }> {
  // TODO: Integrate with Resend, SendGrid, or Postmark
  // For now, log and return success
  console.log("[EMAIL] Would send:", { to: options.to, subject: options.subject });
  
  // Example with Resend:
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({ from: 'Passports <passports@hackclub.com>', ...options });
  
  return { success: true };
}

export async function processEmailQueue() {
  const pending = await getPendingEmails(10);
  
  for (const email of pending) {
    try {
      // Generate email based on event type
      // TODO: Implement when email templates are ready
      // let template: EmailTemplate | null = null;
      
      // if (email.eventType === "ORDER_CREATED") {
      //   template = generateOrderCreatedEmail({ ... });
      // } else if (email.eventType === "RECIPIENT_DETAILS_SUBMITTED") {
      //   template = generateDetailsReceivedEmail({ ... });
      // }
      
      // const tpl = template;
      
      // if (tpl) {
      //   const result = await sendEmail({
      //     to: email.recipientEmail,
      //     subject: tpl.subject,
      //     html: tpl.html,
      //     text: tpl.text,
      //   });
      //   await updateEmailDeliveryStatus(email.id, result.success ? "sent" : "failed", result.error);
      // }
      
      // For now, just log and mark as pending
      await updateEmailDeliveryStatus(email.id, "pending");
    } catch (error) {
      await updateEmailDeliveryStatus(email.id, "failed", error instanceof Error ? error.message : "Unknown error");
      await auditLog({
        entityType: "EmailDelivery",
        entityId: email.id,
        action: "EMAIL_FAILED",
        actor: "system",
        actorType: "SYSTEM",
        description: `Failed to send email: ${error instanceof Error ? error.message : "Unknown error"}`,
        requestId: await getRequestId(),
      });
    }
  }
}