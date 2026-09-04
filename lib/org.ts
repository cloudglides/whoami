import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { Role, OrgRole } from "../generated/prisma/client";

export const ROLE_RANK: Record<Role, number> = {
  PARTICIPANT: 0,
  ORGANIZER: 1,
  ADMIN: 2,
  SUPERADMIN: 3,
};

export const ROLE_LABEL: Record<Role, string> = {
  PARTICIPANT: "Participant",
  ORGANIZER: "Organizer",
  ADMIN: "Admin",
  SUPERADMIN: "Superadmin",
};

export function hasRole(role: Role, minRole: Role): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[minRole];
}

const SUPERADMIN_EMAILS = (process.env.SUPERADMIN_EMAILS ?? "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user;
}

export async function getCurrentUserWithRole(): Promise<
  (NonNullable<Awaited<ReturnType<typeof getCurrentUser>>> & { role: Role }) | null
> {
  const user = await getCurrentUser();
  if (!user) return null;

  const email = user.email?.toLowerCase().trim();
  if (email && SUPERADMIN_EMAILS.includes(email)) {
    return { ...user, role: "SUPERADMIN" };
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  if (!dbUser) return null;
  return { ...user, role: dbUser.role };
}

export async function getOrgForUser(userId: string) {
  const membership = await prisma.orgMember.findFirst({
    where: { userId },
    include: {
      org: {
        include: {
          orders: {
            orderBy: { createdAt: "desc" },
            include: { 
              user: { select: { name: true, email: true } },
              ysws: { select: { name: true } },
            },
          },
          ysws: {
            select: { apiKey: true, name: true, slug: true },
          },
        },
      },
    },
  });
  return membership?.org ?? null;
}

export async function isOrgMember(userId: string, orgId: string): Promise<boolean> {
  const membership = await prisma.orgMember.findUnique({
    where: { orgId_userId: { orgId, userId } },
  });
  return membership !== null;
}

export async function isOrganizerForYSWS(
  userId: string,
  ywsId: string
): Promise<{ orgId: string; role: OrgRole } | null> {
  const membership = await prisma.organizerYSWSMembership.findFirst({
    where: { userId, yswsId: ywsId },
    include: { org: true },
  });
  if (!membership) return null;
  return { orgId: membership.orgId, role: membership.role };
}

export async function getYSWSForUser(userId: string) {
  const membership = await prisma.organizerYSWSMembership.findFirst({
    where: { userId },
    include: { ysws: true, org: true },
  });
  return {
    yws: membership?.ysws ?? null,
    organizerMembership: membership ?? null,
  };
}

export function generateApiKey(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return (
    "wom_" +
    Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")
  );
}

// Check if user can access an org's orders (org membership check)
export async function canAccessOrgOrders(
  userId: string,
  orgId: string
): Promise<boolean> {
  const membership = await prisma.orgMember.findUnique({
    where: { orgId_userId: { orgId, userId } },
  });
  return membership !== null;
}

// Check if user can access a YSWS (via organizer membership)
export async function canAccessYSWS(
  userId: string,
  ywsId: string
): Promise<boolean> {
  const membership = await prisma.organizerYSWSMembership.findFirst({
    where: { userId, yswsId: ywsId },
  });
  return membership !== null;
}

// Get all YSWSes an organizer can access
export async function getOrganizerYSWSes(userId: string) {
  const memberships = await prisma.organizerYSWSMembership.findMany({
    where: { userId },
    include: { ysws: { include: { org: true } } },
  });
  return memberships.map((m) => ({
    orgId: m.orgId,
    yswsId: m.yswsId,
    yswsName: m.ysws?.name,
    orgName: m.ysws?.org?.name,
    role: m.role,
  }));
}

// Get all orders for a YSWS that an organizer can manage
export async function getYSWSOrders(
  userId: string,
  ywsId: string
) {
  // First verify organizer access
  const canAccess = await canAccessYSWS(userId, ywsId);
  if (!canAccess) return [];

  return prisma.passportOrder.findMany({
    where: { yswsId: ywsId },
    orderBy: { createdAt: "desc" },
    include: {
      org: { select: { name: true } },
      recipients: { select: { email: true, name: true } },
    },
  });
}

// Get all YSWSes for an organizer with order counts
export async function getOrganizerYSWSesWithStats(userId: string) {
  const memberships = await prisma.organizerYSWSMembership.findMany({
    where: { userId },
    include: { 
      ysws: { 
        include: { 
          org: true,
          _count: {
            select: { orders: true }
          }
        } 
      } 
    },
  });
  return memberships.map((m) => ({
    orgId: m.orgId,
    yswsId: m.yswsId,
    yswsName: m.ysws?.name,
    yswsSlug: m.ysws?.slug,
    yswsApiKey: m.ysws?.apiKey,
    orgName: m.ysws?.org?.name,
    role: m.role,
    orderCount: m.ysws?._count.orders ?? 0,
  }));
}