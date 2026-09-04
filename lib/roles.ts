export type Role = "PARTICIPANT" | "ORGANIZER" | "ADMIN" | "SUPERADMIN";
export type OrgRole = "OWNER" | "ORGANIZER";

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