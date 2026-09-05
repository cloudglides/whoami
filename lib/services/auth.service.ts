import { prisma } from "../prisma";
import { getCurrentUser, getCurrentUserWithRole, hasRole, isSuperadminEmail } from "../org";
import type { Role, OrgRole } from "../../generated/prisma/enums";

export interface AuthContext {
  userId: string;
  role: Role;
  email: string | null;
  name: string | null;
  isSuperadmin: boolean;
  orgId: string | null;
  accessibleYSWSes: AccessibleYSWS[];
}

export interface AccessibleYSWS {
  yswsId: string;
  yswsName: string;
  yswsSlug: string;
  yswsApiKey: string | null;
  orgId: string;
  orgName: string;
  orgSlug: string;
  role: OrgRole;
  orderCount: number;
  isActive: boolean;
}

export async function getAuthContext(): Promise<AuthContext | null> {
  const user = await getCurrentUserWithRole();
  if (!user) return null;

  const isSuperadmin = user.role === "SUPERADMIN" || isSuperadminEmail(user.email);

  if (hasRole(user.role, "ADMIN")) {
    const orgs = await prisma.org.findMany({
      where: { members: { some: { userId: user.id } } },
      include: {
        ysws: {
          where: { isActive: true },
          include: {
            _count: { select: { orders: true } },
            organizerMemberships: { where: { userId: user.id }, select: { role: true } },
          },
        },
      },
    });

    const accessibleYSWSes: AccessibleYSWS[] = [];
    for (const org of orgs) {
      for (const ysws of org.ysws) {
        const membership = ysws.organizerMemberships[0];
        accessibleYSWSes.push({
          yswsId: ysws.id,
          yswsName: ysws.name,
          yswsSlug: ysws.slug,
          yswsApiKey: ysws.apiKeyHash,
          orgId: org.id,
          orgName: org.name,
          orgSlug: org.slug,
          role: membership?.role ?? "ORGANIZER",
          orderCount: ysws._count.orders,
          isActive: ysws.isActive,
        });
      }
    }

    return {
      userId: user.id,
      role: user.role,
      email: user.email ?? null,
      name: user.name ?? null,
      isSuperadmin,
      orgId: orgs[0]?.id ?? null,
      accessibleYSWSes,
    };
  }

  const memberships = await prisma.organizerYSWSMembership.findMany({
    where: { userId: user.id },
    include: {
      ysws: { include: { org: true, _count: { select: { orders: true } } } },
      org: true,
    },
  });

  const accessibleYSWSes: AccessibleYSWS[] = memberships
    .filter((m) => m.ysws?.isActive)
    .map((m) => ({
      yswsId: m.yswsId,
      yswsName: m.ysws!.name,
      yswsSlug: m.ysws!.slug,
      yswsApiKey: m.ysws!.apiKeyHash,
      orgId: m.orgId,
      orgName: m.org!.name,
      orgSlug: m.org!.slug,
      role: m.role,
      orderCount: m.ysws!._count.orders,
      isActive: m.ysws!.isActive,
    }));

  return {
    userId: user.id,
    role: user.role,
    email: user.email ?? null,
    name: user.name ?? null,
    isSuperadmin,
    orgId: memberships[0]?.orgId ?? null,
    accessibleYSWSes,
  };
}

export async function requireAuth(): Promise<AuthContext> {
  const context = await getAuthContext();
  if (!context) {
    throw new Error("UNAUTHORIZED");
  }
  return context;
}

export async function requireRole(minRole: Role): Promise<AuthContext> {
  const context = await requireAuth();
  if (!hasRole(context.role, minRole)) {
    throw new Error("FORBIDDEN");
  }
  return context;
}

export async function requireYSWSAccess(yswsId: string, requiredRole: Role = "ORGANIZER"): Promise<AccessibleYSWS> {
  const context = await requireAuth();
  const ysws = context.accessibleYSWSes.find((y) => y.yswsId === yswsId);
  if (!ysws) throw new Error("YSWS_NOT_FOUND");
  if (!hasRole(ysws.role as Role, requiredRole)) throw new Error("FORBIDDEN");
  return ysws;
}

export async function requireOrgAccess(orgId: string): Promise<AuthContext> {
  const context = await requireAuth();
  const membership = await prisma.orgMember.findUnique({
    where: { orgId_userId: { orgId, userId: context.userId } },
  });
  if (!membership && !hasRole(context.role, "ADMIN")) {
    throw new Error("FORBIDDEN");
  }
  return context;
}

export function canAccessYSWS(context: AuthContext, yswsId: string): boolean {
  return context.accessibleYSWSes.some((y) => y.yswsId === yswsId);
}

export function canAccessOrg(context: AuthContext, orgId: string): boolean {
  return context.accessibleYSWSes.some((y) => y.orgId === orgId);
}

export function getActiveYSWS(context: AuthContext, selectedYswsId?: string | null): AccessibleYSWS | null {
  if (selectedYswsId) {
    return context.accessibleYSWSes.find((y) => y.yswsId === selectedYswsId) ?? null;
  }
  return context.accessibleYSWSes[0] ?? null;
}