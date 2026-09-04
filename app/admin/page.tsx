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
  return <span className={`govuk-tag ${tagClass} text-xs whitespace-nowrap`}>{state.replace(/_/g, " ")}</span>;
}

function fulfillmentTag(status: string) {
  return <span className="govuk-tag govuk-tag--grey text-xs whitespace-nowrap">{ORDER_STATUS_LABEL[status] ?? status}</span>;
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
      include: { org: { select: { name: true } }, ysws: { select: { name: true } } },
    }),
    prisma.passportOrder.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { org: { select: { name: true } }, ysws: { select: { name: true } } },
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
      <div className="mb-4 flex flex-wrap items-center gap-2">
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

      {/* Overview stats - compact, actionable */}
      <dl className="mb-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm divide-y divide-govuk-grey-2 border-y-2 border-govuk-black py-2">
        <div className="py-1">
          <dt className="text-govuk-grey-4">YSWS orgs</dt>
          <dd className="font-bold text-xl"><Link href="/admin/yswses" className="hover:underline">{orgCount}</Link></dd>
        </div>
        <div className="py-1">
          <dt className="text-govuk-grey-4">Organizers</dt>
          <dd className="font-bold text-xl"><Link href="/admin/organizers" className="hover:underline">{organizerCount}</Link></dd>
        </div>
        <div className="py-1">
          <dt className="text-govuk-grey-4">Total orders</dt>
          <dd className="font-bold text-xl"><Link href="/admin/orders" className="hover:underline">{orderCount}</Link></dd>
        </div>
        <div className="py-1">
          <dt className="text-govuk-grey-4">Needing attention</dt>
          <dd className="font-bold text-xl text-hc-red">{ordersNeedingAttention.length}</dd>
        </div>
      </dl>

      {/* Orders needing attention - distinct from recent orders */}
      {ordersNeedingAttention.length > 0 && (
        <Section
          title="Orders needing attention"
          description={`${ordersNeedingAttention.length} order(s) require action to move forward.`}
          action={
            <Link href="/admin/orders" className="text-sm font-medium underline underline-offset-2 hover:text-hc-red">
              View all orders &rarr;
            </Link>
          }
        >
          <DataTable
            columns={[
              { key: "id", header: "Order", render: (o: typeof ordersNeedingAttention[0]) => (
                <Link href={`/admin/orders/${o.id}`} className="font-mono text-sm hover:underline">
                  {o.id.slice(0, 8)}&hellip;
                </Link>
              ) },
              { key: "recipient", header: "Recipient", render: (o: typeof ordersNeedingAttention[0]) => o.recipientName ?? "&#8212;" },
              { key: "ysws", header: "YSWS", render: (o: typeof ordersNeedingAttention[0]) => o.ysws?.name ?? o.org.name },
              { key: "state", header: "Status", render: (o: typeof ordersNeedingAttention[0]) => statusTag(o.currentState), className: "w-36" },
              { key: "created", header: "Created", render: (o: typeof ordersNeedingAttention[0]) => dateLabel(o.createdAt), className: "w-28" },
            ]}
            data={ordersNeedingAttention}
            rowKey="id"
            emptyMessage="No orders needing attention."
          />
        </Section>
      )}

      {/* 2-column layout: Recent orders (wider) + Recent activity */}
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <Section
            title="Recent passport orders"
            description="Latest orders across all YSWSes."
            action={
              <Link href="/admin/orders" className="text-sm font-medium underline underline-offset-2 hover:text-hc-red">
                View all orders &rarr;
              </Link>
            }
          >
            <DataTable
              columns={[
                { key: "when", header: "When", render: (o: typeof recentOrders[0]) => dateLabel(o.createdAt), className: "w-24" },
                { key: "recipient", header: "Recipient", render: (o: typeof recentOrders[0]) => (
                  <Link href={`/admin/orders/${o.id}`} className="font-medium hover:underline">
                    {o.recipientName ?? "&#8212;"}
                  </Link>
                ) },
                { key: "ysws", header: "YSWS", render: (o: typeof recentOrders[0]) => o.ysws?.name ?? o.org.name },
                { key: "state", header: "State", render: (o: typeof recentOrders[0]) => statusTag(o.currentState), className: "w-32" },
                { key: "status", header: "Fulfillment", render: (o: typeof recentOrders[0]) => fulfillmentTag(o.status), className: "w-24" },
              ]}
              data={recentOrders}
              rowKey="id"
              emptyMessage="No orders yet. Create one using the action above."
            />
          </Section>
        </div>

        <div className="lg:col-span-4">
          {recentEvents.length > 0 ? (
            <Section title="Recent activity" description="Latest 10 system events.">
              <DataTable
                columns={[
                  { key: "when", header: "When", render: (e: typeof recentEvents[0]) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(e.createdAt), className: "w-32" },
                  { key: "type", header: "Event", render: (e: typeof recentEvents[0]) => (
                    <span className="govuk-tag govuk-tag--grey text-xs whitespace-nowrap">{e.eventType.replace(/_/g, " ")}</span>
                  ), className: "w-28" },
                  { key: "order", header: "Order", render: (e: typeof recentEvents[0]) => (
                    <Link href={`/admin/orders/${e.orderId}`} className="font-mono text-sm hover:underline">
                      {e.orderId.slice(0, 8)}&hellip;
                    </Link>
                  ) },
                  { key: "ysws", header: "Org", render: (e: typeof recentEvents[0]) => e.order.org?.name ?? "&#8212;" },
                ]}
                data={recentEvents}
                rowKey="id"
                emptyMessage="No activity recorded yet."
              />
            </Section>
          ) : (
            <Section title="Quick links">
              <ul className="space-y-2 text-sm">
                <li><Link href="/admin/orders" className="underline underline-offset-2 hover:text-hc-red">All passport orders</Link></li>
                <li><Link href="/admin/yswses" className="underline underline-offset-2 hover:text-hc-red">All YSWSes</Link></li>
                <li><Link href="/admin/organizers" className="underline underline-offset-2 hover:text-hc-red">All organizers</Link></li>
                <li><Link href="/admin/users" className="underline underline-offset-2 hover:text-hc-red">Users & roles</Link></li>
              </ul>
            </Section>
          )}
        </div>
      </div>
    </>
  );
}