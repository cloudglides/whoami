import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const createOrderSchema = z.object({
  quantity: z.number().int().min(1).max(1000),
  note: z.string().max(300).optional(),
});

const ORDER_FIELDS = {
  id: true,
  orgId: true,
  ysws: true,
  quantity: true,
  status: true,
  note: true,
  recipientName: true,
  recipientEmail: true,
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
    const org = await prisma.org.findUnique({ where: { apiKey } });
    if (org) return { orgId: org.id, ysws: org.name, actorId: "api" };
    return null;
  }

  const session = await auth();
  if (!session?.user?.id) return null;

  const membership = await prisma.orgMember.findFirst({
    where: { userId: session.user.id },
    include: { org: { select: { name: true } } },
  });
  if (!membership) return null;

  return { orgId: membership.orgId, ysws: membership.org.name, actorId: session.user.id };
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

  const order = await prisma.passportOrder.create({
    data: {
      orgId: org.orgId,
      ysws: org.ysws,
      quantity: parsed.data.quantity,
      note: parsed.data.note ?? null,
      createdBy: org.actorId,
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
