import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Section from "../../components/Section";
import DataTable from "../../components/DataTable";

export default async function AdminOrganizersPage() {
  const members = await prisma.orgMember.findMany({
    orderBy: { org: { name: "asc" } },
    include: {
      org: { select: { name: true } },
      user: { select: { name: true, email: true, role: true } },
    },
  });

  return (
    <>
      <div className="mb-4">
        <Link href="/admin/register-organizer" className="govuk-button govuk-button--secondary">
          Register organizer
        </Link>
      </div>

      <Section
        title="Current organizers"
        description={`${members.length} organizer(s) across all YSWSes.`}
      >
        <DataTable
          columns={[
            { key: "name", header: "Name", render: (m: typeof members[0]) => m.user.name ?? m.user.email },
            { key: "email", header: "Email", render: (m: typeof members[0]) => m.user.email ?? "—" },
            { key: "role", header: "Global role", render: (m: typeof members[0]) => (
              <span className="govuk-tag govuk-tag--grey text-xs">{m.user.role}</span>
            ), className: "w-32" },
            { key: "orgRole", header: "Org role", render: (m: typeof members[0]) => (
              <span className="govuk-tag govuk-tag--grey text-xs">
                {m.role === "OWNER" ? "Owner" : "Organizer"}
              </span>
            ), className: "w-24" },
            { key: "org", header: "YSWS org", render: (m: typeof members[0]) => m.org.name },
          ]}
          data={members}
          rowKey="id"
          emptyMessage="No organizers registered yet."
        />
      </Section>
    </>
  );
}
