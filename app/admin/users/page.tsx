import { prisma } from "@/lib/prisma";
import { getCurrentUserWithRole } from "@/lib/org";
import { ROLE_LABEL } from "@/lib/org";
import Section from "../../components/Section";
import DataTable from "../../components/DataTable";
import SetRoleForm from "../SetRoleForm";

export default async function AdminUsersPage() {
  const user = await getCurrentUserWithRole();
  const isSuperadmin = user?.role === "SUPERADMIN";

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      slackId: true,
      hcaId: true,
      createdAt: true,
      _count: { select: { createdOrders: true, orgs: true } },
    },
  });

  return (
    <>
      <Section
        title="Users & roles"
        description={`${users.length} registered accounts.`}
      >
        <DataTable
          columns={[
            { key: "name", header: "Name", render: (u: typeof users[0]) => u.name ?? "—" },
            { key: "email", header: "Email", render: (u: typeof users[0]) => u.email ?? "—" },
            { key: "role", header: "Global role", render: (u: typeof users[0]) => (
              <span className="govuk-tag govuk-tag--grey text-xs">
                {ROLE_LABEL[u.role as keyof typeof ROLE_LABEL]}
              </span>
            ), className: "w-36" },
            { key: "slackId", header: "Slack ID", render: (u: typeof users[0]) => u.slackId ?? "—" },
            { key: "hcaId", header: "HCA ID", render: (u: typeof users[0]) => u.hcaId ?? "—" },
            { key: "orders", header: "Created orders", render: (u: typeof users[0]) => u._count.createdOrders, className: "w-28" },
            { key: "orgs", header: "Org memberships", render: (u: typeof users[0]) => u._count.orgs, className: "w-28" },
            { key: "created", header: "Joined", render: (u: typeof users[0]) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(u.createdAt), className: "w-32" },
          ]}
          data={users}
          rowKey="id"
          emptyMessage="No users registered yet."
        />
      </Section>

      {isSuperadmin && (
        <Section
          title="Change role"
          description="Set any account to participant, organizer, admin or superadmin."
        >
          <SetRoleForm />
        </Section>
      )}
    </>
  );
}