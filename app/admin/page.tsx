import { prisma } from "@/lib/prisma";
import { getCurrentUserWithRole } from "@/lib/org";
import Link from "next/link";
import Section from "../components/Section";
import DataTable from "../components/DataTable";

const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  SHIPPED: "Shipped",
  AWAITING_RECIPIENT_DETAILS: "Awaiting details",
  RECIPIENT_DETAILS_RECEIVED: "Details received",
  DRAFTING: "Drafting",
  DRAFT_READY: "Draft ready",
  SENT_TO_HQ: "Sent to HQ",
  RECEIVED_FROM_HQ: "Received from HQ",
  SHIPPING: "Shipping",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  ERROR: "Error",
};

function dateLabel(d: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

function statusTag(state: string) {
  const tagClass = ["AWAITING_RECIPIENT_DETAILS"].includes(state) ? "govuk-tag--yellow"
    : ["RECIPIENT_DETAILS_RECEIVED", "DRAFTING", "DRAFT_READY"].includes(state) ? "govuk-tag--blue"
    : ["SENT_TO_HQ", "RECEIVED_FROM_HQ"].includes(state) ? "govuk-tag--grey"
    : ["SHIPPING"].includes(state) ? "govuk-tag--blue"
    : ["DELIVERED"].includes(state) ? "govuk-tag--green"
    : ["CANCELLED", "ERROR"].includes(state) ? "govuk-tag--red"
    : "govuk-tag--grey";
  return <span className={`govuk-tag ${tagClass} text-xs`}>{state.replace(/_/g, " ")}</span>;
}

export default async function AdminPage() {
  await getCurrentUserWithRole(); // Verify auth via layout

  const [orgCount, orderCount, organizerCount, ordersNeedingAttention, recentOrders, recentEvents] = await Promise.all([
    prisma.org.count(),
    prisma.passportOrder.count(),
    prisma.user.count({ where: { role: { in: ["ORGANIZER", "ADMIN"] } } }),
    prisma.passportOrder.findMany({
      where: { currentState: { in: ["AWAITING_RECIPIENT_DETAILS", "RECIPIENT_DETAILS_RECEIVED", "DRAFTING", "ERROR"] } },
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { org: { select: { name: true } } },
    }),
    prisma.passportOrder.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { org: { select: { name: true } } },
    }),
    prisma.orderEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { order: { select: { id: true, recipientName: true, org: { select: { name: true } } } } },
    }),
  ]);

  return (
    <>
      {/* Quick actions - primary + secondary */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Link href="/admin/create-order" className="govuk-button">
          Create passport order
        </Link>
        <Link href="/admin/register-organizer" className="govuk-button govuk-button--secondary govuk-button--small">
          Register organizer
        </Link>
        <Link href="/admin/users" className="govuk-button govuk-button--secondary govuk-button--small">
          Manage users & roles
        </Link>
      </div>

      {/* Overview stats - compact */}
      <dl className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm divide-y divide-govuk-grey-2 border-y-2 border-govuk-black py-3">
        <div className="py-1.5">
          <dt className="text-govuk-grey-4">YSWS orgs</dt>
          <dd className="font-bold text-xl">{orgCount}</dd>
        </div>
        <div className="py-1.5">
          <dt className="text-govuk-grey-4">Organizers</dt>
          <dd className="font-bold text-xl">{organizerCount}</dd>
        </div>
        <div className="py-1.5">
          <dt className="text-govuk-grey-4">Total orders</dt>
          <dd className="font-bold text-xl">{orderCount}</dd>
        </div>
        <div className="py-1.5">
          <dt className="text-govuk-grey-4">Needing attention</dt>
          <dd className="font-bold text-xl text-hc-red">{ordersNeedingAttention.length}</dd>
        </div>
      </dl>

      {/* Orders needing attention - inline if any */}
      {ordersNeedingAttention.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-2 text-lg font-bold">Orders needing attention</h2>
          <p className="mb-2 text-sm text-govuk-grey-4">
            {ordersNeedingAttention.length} order(s) require action to move forward.
          </p>
          <DataTable
            columns={[
              { key: "id", header: "Order", render: (o: typeof ordersNeedingAttention[0]) => <span className="font-mono text-sm">{o.id.slice(0, 8)}…</span> },
              { key: "recipient", header: "Recipient", render: (o: typeof ordersNeedingAttention[0]) => o.recipientName ?? "—" },
              { key: "org", header: "Org", render: (o: typeof ordersNeedingAttention[0]) => o.org.name },
              { key: "state", header: "Status", render: (o: typeof ordersNeedingAttention[0]) => statusTag(o.currentState) },
              { key: "created", header: "Created", render: (o: typeof ordersNeedingAttention[0]) => dateLabel(o.createdAt) },
            ]}
            data={ordersNeedingAttention}
            rowKey="id"
            emptyMessage="No orders needing attention."
          />
        </div>
      )}

      {/* 2-column layout: Recent orders (wider) + Recent activity */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <Section
            title="Recent passport orders"
            description="Latest 10 orders across all YSWSes."
          >
            <DataTable
              columns={[
                { key: "when", header: "When", render: (o: typeof recentOrders[0]) => dateLabel(o.createdAt), className: "w-28" },
                { key: "recipient", header: "Recipient", render: (o: typeof recentOrders[0]) => (
                  <>
                    <span className="font-medium">{o.recipientName ?? "—"}</span>
                    {o.recipientEmail && <span className="block text-xs text-govuk-grey-4">{o.recipientEmail}</span>}
                  </>
                ) },
                { key: "org", header: "Org", render: (o: typeof recentOrders[0]) => o.org.name },
                { key: "state", header: "State", render: (o: typeof recentOrders[0]) => statusTag(o.currentState), className: "w-32" },
                { key: "status", header: "Fulfillment", render: (o: typeof recentOrders[0]) => (
                  <span className="govuk-tag govuk-tag--grey text-xs">{ORDER_STATUS_LABEL[o.status] ?? o.status}</span>
                ), className: "w-24" },
              ]}
              data={recentOrders}
              rowKey="id"
              emptyMessage="No orders yet. Create one using the action above."
            />
          </Section>
        </div>

        <div className="lg:col-span-4">
          <Section
            title="Recent activity"
            description="Latest 10 system events."
          >
            <DataTable
              columns={[
                { key: "when", header: "When", render: (e: typeof recentEvents[0]) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(e.createdAt), className: "w-36" },
                { key: "type", header: "Event", render: (e: typeof recentEvents[0]) => (
                  <span className="govuk-tag govuk-tag--grey text-xs">{e.eventType.replace(/_/g, " ")}</span>
                ), className: "w-32" },
                { key: "order", header: "Order", render: (e: typeof recentEvents[0]) => (
                  <>
                    <span className="font-mono text-sm">{e.orderId.slice(0, 8)}…</span>
                    {e.order.recipientName && <span className="block text-xs text-govuk-grey-4">{e.order.recipientName}</span>}
                  </>
                ) },
                { key: "ysws", header: "Org", render: (e: typeof recentEvents[0]) => e.order.org?.name ?? "—" },
                { key: "actor", header: "Actor", render: (e: typeof recentEvents[0]) => (
                  <>
                    <span className="font-mono text-xs">{e.actor.slice(0, 8)}…</span>
                    <span className="block text-xs text-govuk-grey-4">{e.actorType ?? "—"}</span>
                  </>
                ), className: "w-28" },
              ]}
              data={recentEvents}
              rowKey="id"
              emptyMessage="No activity recorded yet."
            />
          </Section>
        </div>
      </div>
    </>
  );
}
