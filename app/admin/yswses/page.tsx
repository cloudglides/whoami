import { prisma } from "@/lib/prisma";
import Section from "../../components/Section";
import DataTable from "../../components/DataTable";

export default async function AdminYSWSesPage() {
  const yswses = await prisma.ySWS.findMany({
    orderBy: { name: "asc" },
    include: {
      org: { select: { name: true } },
      _count: { select: { orders: true, organizerMemberships: true } },
    },
  });

  return (
    <>
      <Section title="YSWSes" description={`${yswses.length} YSWS registered.`}>
        <DataTable
          columns={[
            { key: "name", header: "Name", render: (y: typeof yswses[0]) => y.name },
            { key: "slug", header: "Slug", render: (y: typeof yswses[0]) => y.slug },
            { key: "org", header: "Org", render: (y: typeof yswses[0]) => y.org?.name ?? "—" },
            { key: "active", header: "Active", render: (y: typeof yswses[0]) => (
              <span className={`govuk-tag ${y.isActive ? "govuk-tag--green" : "govuk-tag--red"} text-xs`}>
                {y.isActive ? "Yes" : "No"}
              </span>
            ), className: "w-20" },
            { key: "organizers", header: "Organizers", render: (y: typeof yswses[0]) => y._count.organizerMemberships, className: "w-24" },
            { key: "orders", header: "Orders", render: (y: typeof yswses[0]) => y._count.orders, className: "w-20" },
          ]}
          data={yswses}
          rowKey="id"
          emptyMessage="No YSWSes registered yet."
        />
      </Section>
    </>
  );
}