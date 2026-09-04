import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const createOrderSchema = z.object({
  recipientEmail: z.string().email("Enter a valid recipient email").optional().or(z.literal("")),
  recipientName: z.string().min(2, "Enter the recipient's name").max(80, "Name is too long"),
  note: z.string().max(300).optional(),
});

const ORDER_FIELDS = {
  id: true,
  orgId: true,
  yswsId: true,
  totalQuantity: true,
  currentState: true,
  status: true,
  note: true,
  recipientName: true,
  recipientEmail: true,
  recipientToken: true,
  createdAt: true,
  updatedAt: true,
} as const;

function extractApiKey(req: Request): string | null {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length).trim();
  }
  const header = req.headers.get("x-api-key");
  if (header) return header.trim();
  return null;
}

async function resolveOrg(req: Request) {
  const apiKey = extractApiKey(req);
  if (apiKey) {
    const ysws = await prisma.ySWS.findUnique({
      where: { apiKey },
      include: { org: true },
    });
    if (ysws && ysws.orgId) {
      return { orgId: ysws.orgId, ysws: ysws.id, actorId: "api" };
    }
    return null;
  }

  const session = await auth();
  if (!session?.user?.id) return null;

  const membership = await prisma.orgMember.findFirst({
    where: { userId: session.user.id },
    include: { org: { select: { name: true } } },
  });
  if (!membership) return null;

  // Get the YSWS for this org
  const ysws = await prisma.ySWS.findFirst({
    where: { orgId: membership.orgId },
  });

  return { orgId: membership.orgId, ysws: ysws?.id, actorId: session.user.id };
}

export async function POST(req: Request) {
  const org = await resolveOrg(req);
  if (!org) {
    return NextResponse.json(
      { error: "Unauthorized. Provide a valid API key or sign in as an organizer." },
      { status: 401 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }

  // For API key users, the API key is scoped to a YSWS, so they implicitly have access
  if (org.actorId === "api" && !org.ysws) {
    return NextResponse.json(
      { error: "No YSWS associated with this API key" },
      { status: 400 }
    );
  }

  const rawEmail = parsed.data.recipientEmail?.toLowerCase().trim();
  const email = rawEmail || null;
  const linkedUser = email ? await prisma.user.findUnique({ where: { email } }) : null;

  const order = await prisma.passportOrder.create({
    data: {
      orgId: org.orgId,
      yswsId: org.ysws,
      totalQuantity: 1,
      currentState: "AWAITING_RECIPIENT_DETAILS",
      status: "PENDING",
      note: parsed.data.note ?? null,
      createdBy: org.actorId,
      createdFrom: "api",
      recipientName: parsed.data.recipientName,
      recipientEmail: email,
      recipientToken: crypto.randomUUID().substring(0, 16),
      createdByUserId: linkedUser?.id ?? null,
    },
    select: ORDER_FIELDS,
  });

  return NextResponse.json({ order }, { status: 201 });
}

export async function GET(req: Request) {
  const org = await resolveOrg(req);
  if (!org) {
    return NextResponse.json(
      { error: "Unauthorized. Provide a valid API key or sign in as an organizer." },
      { status: 401 }
    );
  }

  const orders = await prisma.passportOrder.findMany({
    where: { orgId: org.orgId },
    orderBy: { createdAt: "desc" },
    select: ORDER_FIELDS,
  });

  return NextResponse.json({ orders });
}