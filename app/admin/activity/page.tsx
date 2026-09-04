import { prisma } from "@/lib/prisma";
import Section from "../../components/Section";
import DataTable from "../../components/DataTable";

export default async function AdminActivityPage() {
  const events = await prisma.orderEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      order: { select: { id: true, yswsId: true, recipientName: true, org: { select: { name: true } } } },
    },
  });

  return (
    <Section title="Activity" description="Recent order events and system activity.">
      <DataTable
        columns={[
          { key: "when", header: "When", render: (e: typeof events[0]) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(e.createdAt), className: "w-40" },
          { key: "type", header: "Event", render: (e: typeof events[0]) => (
            <span className="govuk-tag govuk-tag--grey text-xs">{e.eventType.replace(/_/g, " ")}</span>
          ), className: "w-40" },
          { key: "order", header: "Order", render: (e: typeof events[0]) => (
            <>
              <span className="font-mono text-sm">{e.orderId.slice(0, 8)}…</span>
              {e.order.recipientName && <span className="block text-xs text-govuk-grey-4">{e.order.recipientName}</span>}
            </>
          ) },
          { key: "ysws", header: "YSWS", render: (e: typeof events[0]) => e.order.org?.name ?? "—" },
          { key: "state", header: "State", render: (e: typeof events[0]) => e.newState ? (
            <span className="govuk-tag govuk-tag--blue text-xs">{e.newState.replace(/_/g, " ")}</span>
          ) : "—" },
          { key: "actor", header: "Actor", render: (e: typeof events[0]) => (
            <>
              <span className="font-mono text-xs">{e.actor.slice(0, 8)}…</span>
              <span className="block text-xs text-govuk-grey-4">{e.actorType ?? "—"}</span>
            </>
          ), className: "w-32" },
          { key: "description", header: "Details", render: (e: typeof events[0]) => e.description ?? "—" },
        ]}
        data={events}
        rowKey="id"
        emptyMessage="No activity recorded yet."
      />
    </Section>
  );
}