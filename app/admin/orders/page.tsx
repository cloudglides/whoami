import { prisma } from "@/lib/prisma";
import Section from "../../components/Section";
import DataTable from "../../components/DataTable";

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

export default async function AdminOrdersPage() {
  const orders = await prisma.passportOrder.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { org: { select: { name: true } } },
  });

  return (
    <Section
      title="All passport orders"
      description={`Showing ${orders.length} most recent orders.`}
    >
      <DataTable
        columns={[
          { key: "when", header: "When", render: (o: typeof orders[0]) => dateLabel(o.createdAt), className: "w-32" },
          { key: "recipient", header: "Recipient", render: (o: typeof orders[0]) => (
            <>
              <span className="font-medium">{o.recipientName ?? "—"}</span>
              {o.recipientEmail && <span className="block text-xs text-govuk-grey-4">{o.recipientEmail}</span>}
            </>
          ) },
          { key: "org", header: "Org", render: (o: typeof orders[0]) => o.org.name },
          { key: "state", header: "State", render: (o: typeof orders[0]) => statusTag(o.currentState), className: "w-36" },
          { key: "fulfillment", header: "Fulfillment", render: (o: typeof orders[0]) => (
            <span className="govuk-tag govuk-tag--grey text-xs">{ORDER_STATUS_LABEL[o.status] ?? o.status}</span>
          ), className: "w-28" },
        ]}
        data={orders}
        rowKey="id"
        emptyMessage="No orders yet."
      />
    </Section>
  );
}
