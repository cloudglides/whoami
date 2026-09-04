import Link from "next/link";
import Breadcrumb from "../components/Breadcrumb";
import FadeIn from "../components/FadeIn";
import { prisma } from "@/lib/prisma";
import { getCurrentUserWithRole, getOrgForUser, getOrganizerYSWSesWithStats, hasRole, ROLE_LABEL } from "@/lib/org";
import type { Role } from "../../generated/prisma/client";
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

  // Verify the selected YSWS is accessible by the user
  let verifiedYswsId: string | null = null;
  if (user && selectedYswsId) {
    const yswsList = await getOrganizerYSWSesWithStats(user.id);
    const hasAccess = yswsList.some((y) => y.yswsId === selectedYswsId);
    if (hasAccess) {
      verifiedYswsId = selectedYswsId;
    }
  }

  return (
    <FadeIn className="mx-auto w-full px-6 pb-12 pt-8">
      <Breadcrumb
        items={[{ label: "whoami", href: "/" }, { label: "Dashboard" }]}
      />

      {!user ? (
        <UnsignedDashboard />
      ) : !hasRole(user.role, "ORGANIZER") ? (
        <NotOrganizer />
      ) : (
        <OrganizerDashboard userId={user.id} role={user.role} selectedYswsId={verifiedYswsId} />
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

async function OrganizerDashboard({
  userId,
  role,
  selectedYswsId,
}: {
  userId: string;
  role: Role;
  selectedYswsId?: string | null;
}) {
  const org = await getOrgForUser(userId);
  const yswsList = await getOrganizerYSWSesWithStats(userId);

  if (!org) {
    return (
      <div className="max-w-2xl">
        <h1 className="mb-2 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          Dashboard
        </h1>
        <p className="mb-4 max-w-xl text-lg leading-relaxed text-govuk-grey-4">
          You are signed in as an organizer, but you are not linked to an org
          yet. Ask an admin to register your YSWS and add you to it.
        </p>
        <Link href="/" className="govuk-button govuk-button--secondary">
          Back home
        </Link>
      </div>
    );
  }

  // Resolve current YSWS
  const currentYsws = yswsList.find((y) => y.yswsId === selectedYswsId) ?? yswsList[0];
  const selectedYswsIdResolved = currentYsws?.yswsId ?? null;

  // Fetch orders for the selected YSWS
  let orders: Array<{
    id: string;
    recipientName: string | null;
    recipientEmail: string | null;
    totalQuantity: number;
    currentState: string;
    status: string;
    note: string | null;
    createdAt: Date;
    user: { name: string | null; email: string | null } | null;
    ysws: { name: string } | null;
  }> = [];
  let totalOrdered = 0;
  let apiKey: string | null = null;
  let yswsName: string | null = null;

  if (selectedYswsIdResolved) {
    const ysws = await prisma.ySWS.findUnique({
      where: { id: selectedYswsIdResolved },
      include: {
        orders: {
          orderBy: { createdAt: "desc" },
          include: { 
            user: { select: { name: true, email: true } },
            ysws: { select: { name: true } },
          },
        },
        org: true,
      },
    });
    
    if (ysws) {
      orders = ysws.orders;
      totalOrdered = orders.reduce((sum, o) => sum + o.totalQuantity, 0);
      apiKey = ysws.apiKey;
      yswsName = ysws.name;
    }
  } else if (yswsList.length === 1 && currentYsws?.yswsId) {
    const fullYsws = await prisma.ySWS.findUnique({
      where: { id: currentYsws.yswsId },
      include: {
        orders: {
          orderBy: { createdAt: "desc" },
          include: { 
            user: { select: { name: true, email: true } },
            ysws: { select: { name: true } },
          },
        },
      }
      });
      if (fullYsws) {
        orders = fullYsws.orders;
        totalOrdered = orders.reduce((sum, o) => sum + o.totalQuantity, 0);
        apiKey = fullYsws.apiKey;
        yswsName = fullYsws.name;
      }
    }

  // Orders needing attention (awaiting details, pending, etc.)
  const needsAttention = orders.filter((o) => 
    ["AWAITING_RECIPIENT_DETAILS", "RECIPIENT_DETAILS_RECEIVED", "DRAFTING", "ERROR"].includes(o.currentState)
  );

  const recentOrders = orders.slice(0, 20);

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <main className="lg:col-span-8 space-y-8">
        {/* Header with YSWS switcher */}
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-4 border-b border-govuk-grey-2">
          <div>
            <h1 className="mb-1 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              {org.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-govuk-grey-4">
              <span>YSWS: <strong>{currentYsws?.yswsName ?? org.name}</strong></span>
              <span>·</span>
              <span>You are a {ROLE_LABEL[role].toLowerCase()}</span>
              {totalOrdered > 0 && (
                <span>·</span>
              )}
              {totalOrdered > 0 && (
                <span>Total orders: <strong>{totalOrdered}</strong></span>
              )}
            </div>
          </div>
          {hasRole(role, "ADMIN") && (
            <Link href="/admin" className="govuk-button govuk-button--secondary govuk-button--small shrink-0">
              Go to admin panel
            </Link>
          )}
        </header>

        {/* YSWS Switcher - prominent if multiple */}
        {yswsList.length > 1 && (
          <YSWSSelector yswsList={yswsList} currentYswsId={selectedYswsIdResolved} />
        )}

        {/* Orders needing attention */}
        {needsAttention.length > 0 && (
          <Section
            title={`Orders needing attention (${needsAttention.length})`}
            description="These orders require action to move forward."
          >
            <DataTable
              columns={[
                { key: "recipient", header: "Recipient", render: (o: typeof orders[0]) => (
                  <>
                    <span className="font-medium">
                      {o.recipientName ?? "—"}
                    </span>
                    {o.recipientEmail && (
                      <span className="block text-xs text-govuk-grey-4">{o.recipientEmail}</span>
                    )}
                  </>
                ) },
                { key: "state", header: "Status", render: (o: typeof orders[0]) => (
                  <span className={`govuk-tag ${statusColor(o.currentState)} text-xs`}>
                    {o.currentState.replace(/_/g, " ")}
                  </span>
                ), className: "w-40" },
                { key: "created", header: "Created", render: (o: typeof orders[0]) => dateLabel(o.createdAt), className: "w-32" },
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
          <CreateOrderForm orgId={org.id} yswsId={selectedYswsIdResolved} />
        </Section>

        {/* Recent orders */}
        <Section
          title="Recent orders"
          description={`Showing latest ${recentOrders.length} of ${orders.length} total orders for this YSWS.`}
        >
          {recentOrders.length === 0 ? (
            <p className="text-govuk-grey-4">No orders yet. Create your first order above.</p>
          ) : (
            <DataTable
              columns={[
                { key: "recipient", header: "Recipient", render: (o: typeof orders[0]) => (
                  <>
                    <span className="font-medium">
                      {o.recipientName ?? "—"}
                    </span>
                    {o.recipientEmail && (
                      <span className="block text-xs text-govuk-grey-4">{o.recipientEmail}</span>
                    )}
                  </>
                ) },
                { key: "state", header: "Status", render: (o: typeof orders[0]) => (
                  <span className={`govuk-tag ${statusColor(o.currentState)} text-xs`}>
                    {o.currentState.replace(/_/g, " ")}
                  </span>
                ), className: "w-40" },
                { key: "created", header: "Created", render: (o: typeof orders[0]) => dateLabel(o.createdAt), className: "w-32" },
                { key: "note", header: "Note", render: (o: typeof orders[0]) => o.note ? (
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
          orgId={org.id} 
          yswsId={selectedYswsIdResolved}
          apiKey={apiKey} 
          yswsName={yswsName ?? currentYsws?.yswsName ?? null}
        />
      </aside>
    </div>
  );
}