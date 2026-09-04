import Link from "next/link";
import Breadcrumb from "../components/Breadcrumb";
import FadeIn from "../components/FadeIn";
import { getCurrentUserWithRole, hasRole, ROLE_LABEL, type Role } from "@/lib/org";
import { getYSWSContext } from "@/lib/ysws-context";
import { prisma } from "@/lib/prisma";
import CreateOrderForm from "./CreateOrderForm";
import ApiIntegrationPanel from "./ApiIntegrationPanel";
import YSWSSelector from "./YSWSSelector";
import Section from "../components/Section";
import DataTable from "../components/DataTable";

function dateLabel(d: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

function statusColor(state: string): "govuk-tag--grey" | "govuk-tag--blue" | "govuk-tag--green" | "govuk-tag--red" | "govuk-tag--yellow" {
  switch (state) {
    case "AWAITING_RECIPIENT_DETAILS":
      return "govuk-tag--yellow";
    case "RECIPIENT_DETAILS_RECEIVED":
    case "DRAFTING":
    case "DRAFT_READY":
      return "govuk-tag--blue";
    case "SENT_TO_HQ":
    case "RECEIVED_FROM_HQ":
      return "govuk-tag--grey";
    case "SHIPPING":
      return "govuk-tag--blue";
    case "DELIVERED":
      return "govuk-tag--green";
    case "CANCELLED":
    case "ERROR":
      return "govuk-tag--red";
    default:
      return "govuk-tag--grey";
  }
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ ysws?: string }>;
}) {
  const user = await getCurrentUserWithRole();
  const params = await searchParams;
  const selectedYswsId = params.ysws ?? null;

  // Get unified YSWS context
  const context = await getYSWSContext();

  return (
    <FadeIn className="mx-auto w-full px-6 pb-12 pt-8">
      <Breadcrumb
        items={[{ label: "whoami", href: "/" }, { label: "Dashboard" }]}
      />

      {!user ? (
        <UnsignedDashboard />
      ) : !hasRole(user.role, "ORGANIZER") ? (
        <NotOrganizer />
      ) : !context ? (
        <NoOrgAccess />
      ) : (
        <OrganizerDashboard 
          context={context} 
          selectedYswsId={selectedYswsId} 
        />
      )}
    </FadeIn>
  );
}

function UnsignedDashboard() {
  return (
    <div className="max-w-2xl">
      <h1 className="mb-2 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
        Organizer dashboard
      </h1>
      <p className="mb-6 max-w-xl text-lg leading-relaxed text-govuk-grey-4">
        Sign in with Hack Club to manage your YSWS and create passport orders.
      </p>
      <Link href="/api/auth/signin?callbackUrl=/dashboard" className="govuk-button">
        Sign in with Hack Club
      </Link>
    </div>
  );
}

function NotOrganizer() {
  return (
    <div className="max-w-2xl">
      <h1 className="mb-2 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
        Dashboard
      </h1>
      <p className="mb-4 max-w-xl text-lg leading-relaxed text-govuk-grey-4">
        You are signed in as a participant. If you run a YSWS and want to order
        passports, ask an admin to register you as an organizer.
      </p>
      <Link href="/" className="govuk-button govuk-button--secondary">
        Back home
      </Link>
    </div>
  );
}

function NoOrgAccess() {
  return (
    <div className="max-w-2xl">
      <h1 className="mb-2 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
        Dashboard
      </h1>
      <p className="mb-4 max-w-xl text-lg leading-relaxed text-govuk-grey-4">
        You are signed in as an organizer, but you are not linked to any YSWS
        yet. Ask an admin to register your YSWS and add you to it.
      </p>
      <Link href="/" className="govuk-button govuk-button--secondary">
        Back home
      </Link>
    </div>
  );
}

async function OrganizerDashboard({
  context,
  selectedYswsId,
}: {
  context: Awaited<ReturnType<typeof getYSWSContext>>;
  selectedYswsId?: string | null;
}) {
  if (!context) return <NoOrgAccess />;

  // Resolve current YSWS - validate server-side
  let activeYSWS = context.activeYSWS;
  if (selectedYswsId) {
    const selected = context.accessibleYSWSes.find((y) => y.yswsId === selectedYswsId);
    if (selected) activeYSWS = selected;
  }

  if (!activeYSWS) {
    return (
      <div className="max-w-2xl">
        <h1 className="mb-2 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          {context.accessibleYSWSes[0]?.orgName ?? "Dashboard"}
        </h1>
        <p className="mb-4 max-w-xl text-lg leading-relaxed text-govuk-grey-4">
          No active YSWS selected. Please choose a YSWS from the switcher below.
        </p>
      </div>
    );
  }

  // Fetch orders for the selected YSWS
  const orders = await prisma.ySWS.findUnique({
    where: { id: activeYSWS.yswsId },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        include: { 
          user: { select: { name: true, email: true } },
        },
      },
    },
  });

  const orderList = orders?.orders ?? [];
  const totalOrdered = orderList.reduce((sum, o) => sum + o.totalQuantity, 0);
  const apiKey = activeYSWS.yswsApiKey;

  // Orders needing attention (awaiting details, pending, etc.)
  const needsAttention = orderList.filter((o) => 
    ["AWAITING_RECIPIENT_DETAILS", "RECIPIENT_DETAILS_RECEIVED", "DRAFTING", "ERROR"].includes(o.currentState)
  );

  const recentOrders = orderList.slice(0, 20);

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <main className="lg:col-span-8 space-y-8">
        {/* Header with YSWS switcher */}
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-4 border-b border-govuk-grey-2">
          <div>
            <h1 className="mb-1 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              {activeYSWS.orgName}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-govuk-grey-4">
              <span>YSWS: <strong>{activeYSWS.yswsName}</strong></span>
              <span>·</span>
              <span>You are a {ROLE_LABEL[context.role].toLowerCase()}</span>
              {totalOrdered > 0 && (
                <>
                  <span>·</span>
                  <span>Total orders: <strong>{totalOrdered}</strong></span>
                </>
              )}
            </div>
          </div>
          {hasRole(context.role, "ADMIN") && (
            <Link href="/admin" className="govuk-button govuk-button--secondary govuk-button--small shrink-0">
              Go to admin panel
            </Link>
          )}
        </header>

        {/* YSWS Switcher - prominent if multiple */}
        {context.accessibleYSWSes.length > 1 && (
          <YSWSSelector 
            yswsList={context.accessibleYSWSes} 
            currentYswsId={activeYSWS.yswsId} 
          />
        )}

        {/* Orders needing attention */}
        {needsAttention.length > 0 && (
          <Section
            title={`Orders needing attention (${needsAttention.length})`}
            description="These orders require action to move forward."
          >
            <DataTable
              columns={[
                { key: "recipient", header: "Recipient", render: (o: typeof orderList[0]) => (
                  <>
                    <span className="font-medium">
                      {o.recipientName ?? "—"}
                    </span>
                    {o.recipientEmail && (
                      <span className="block text-xs text-govuk-grey-4">{o.recipientEmail}</span>
                    )}
                  </>
                ) },
                { key: "state", header: "Status", render: (o: typeof orderList[0]) => (
                  <span className={`govuk-tag ${statusColor(o.currentState)} text-xs`}>
                    {o.currentState.replace(/_/g, " ")}
                  </span>
                ), className: "w-40" },
                { key: "created", header: "Created", render: (o: typeof orderList[0]) => dateLabel(o.createdAt), className: "w-32" },
              ]}
              data={needsAttention}
              rowKey="id"
              emptyMessage="No orders needing attention."
            />
          </Section>
        )}

        {/* Create order form */}
        <Section
          title="Create passport order"
          description="Each order is for one participant. Enter their details and we'll handle the rest."
        >
          <CreateOrderForm orgId={activeYSWS.orgId} yswsId={activeYSWS.yswsId} />
        </Section>

        {/* Recent orders */}
        <Section
          title="Recent orders"
          description={`Showing latest ${recentOrders.length} of ${orderList.length} total orders for this YSWS.`}
        >
          {recentOrders.length === 0 ? (
            <p className="text-govuk-grey-4">No orders yet. Create your first order above.</p>
          ) : (
            <DataTable
              columns={[
                { key: "recipient", header: "Recipient", render: (o: typeof orderList[0]) => (
                  <>
                    <span className="font-medium">
                      {o.recipientName ?? "—"}
                    </span>
                    {o.recipientEmail && (
                      <span className="block text-xs text-govuk-grey-4">{o.recipientEmail}</span>
                    )}
                  </>
                ) },
                { key: "state", header: "Status", render: (o: typeof orderList[0]) => (
                  <span className={`govuk-tag ${statusColor(o.currentState)} text-xs`}>
                    {o.currentState.replace(/_/g, " ")}
                  </span>
                ), className: "w-40" },
                { key: "created", header: "Created", render: (o: typeof orderList[0]) => dateLabel(o.createdAt), className: "w-32" },
                { key: "note", header: "Note", render: (o: typeof orderList[0]) => o.note ? (
                  <span className="text-govuk-grey-4 text-sm max-w-xs block truncate">{o.note}</span>
                ) : (
                  <span className="text-govuk-grey-4 text-sm">—</span>
                ) },
              ]}
              data={recentOrders}
              rowKey="id"
              emptyMessage="No orders yet."
            />
          )}
        </Section>
      </main>

      <aside className="lg:col-span-4 space-y-6">
        <ApiIntegrationPanel 
          orgId={activeYSWS.orgId} 
          yswsId={activeYSWS.yswsId}
          apiKey={apiKey} 
          yswsName={activeYSWS.yswsName}
        />
      </aside>
    </div>
  );
}