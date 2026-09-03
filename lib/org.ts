import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { Role } from "../generated/prisma/client";

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
            include: { user: { select: { name: true, email: true } } },
          },
        },
      },
    },
  });
  return membership?.org ?? null;
}

export async function isOrgMember(userId: string, orgId: string) {
  const membership = await prisma.orgMember.findUnique({
    where: { orgId_userId: { orgId, userId } },
  });
  return membership !== null;
}

export function generateApiKey(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return (
    "wom_" +
    Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")
  );
}
