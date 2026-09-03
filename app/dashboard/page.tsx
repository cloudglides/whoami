import Link from "next/link";
import Breadcrumb from "../components/Breadcrumb";
import FadeIn from "../components/FadeIn";
import { getCurrentUserWithRole, getOrgForUser, hasRole, ROLE_LABEL } from "@/lib/org";
import type { Role } from "../../generated/prisma/client";
import OrderForm from "./OrderForm";
import ApiKeyPanel from "./ApiKeyPanel";
import IssuePassportForm from "./IssuePassportForm";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  SHIPPED: "Shipped",
};

function dateLabel(d: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

export default async function DashboardPage() {
  const user = await getCurrentUserWithRole();

  return (
    <FadeIn className="mx-auto max-w-3xl px-5 pb-12 pt-10">
      <Breadcrumb
        items={[{ label: "whoami", href: "/" }, { label: "Dashboard" }]}
      />

      {!user ? (
        <>
          <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            Organizer dashboard
          </h1>
          <p className="mb-6 max-w-xl text-lg leading-relaxed text-govuk-grey-4">
            Sign in with Hack Club to set up an org for your YSWS and order
            passports to hand out.
          </p>
          <Link href="/api/auth/signin?callbackUrl=/dashboard" className="govuk-button">
            Sign in with Hack Club
          </Link>
        </>
      ) : !hasRole(user.role, "ORGANIZER") ? (
        <NotOrganizer />
      ) : (
        <OrgArea userId={user.id} role={user.role} />
      )}
    </FadeIn>
  );
}

function NotOrganizer() {
  return (
    <>
      <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
        Dashboard
      </h1>
      <p className="mb-4 max-w-xl text-lg leading-relaxed text-govuk-grey-4">
        You are signed in as a participant. If you run a YSWS and want to order
        passports, ask an admin to register you as an organizer.
      </p>
      <Link href="/" className="govuk-button govuk-button--secondary">
        Back home
      </Link>
    </>
  );
}

async function OrgArea({ userId, role }: { userId: string; role: Role }) {
  const org = await getOrgForUser(userId);

  if (!org) {
    return (
      <>
        <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          Dashboard
        </h1>
        <p className="mb-4 max-w-xl text-lg leading-relaxed text-govuk-grey-4">
          You are signed in as an organizer, but you are not linked to an org
          yet. Ask an admin to register your YSWS and add you to it.
        </p>
        <Link href="/" className="govuk-button govuk-button--secondary">
          Back home
        </Link>
      </>
    );
  }

  const totalOrdered = org.orders.reduce((sum, o) => sum + o.quantity, 0);

  return (
    <>
      <h1 className="mb-1 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
        {org.name}
      </h1>
      <p className="mb-1 text-sm text-govuk-grey-4">
        YSWS: {org.name} · You are a {ROLE_LABEL[role].toLowerCase()}
      </p>
      <p className="mb-4 text-sm text-govuk-grey-4">
        Total passports ordered: {totalOrdered}
      </p>
      {hasRole(role, "ADMIN") && (
        <p className="mb-4">
          <Link href="/admin" className="govuk-link">
            Go to the admin panel →
          </Link>
        </p>
      )}

      <hr className="section-rule" />

      <h2 className="mb-1 text-xl font-bold">Order passports</h2>
      <ApiKeyPanel orgId={org.id} apiKey={org.apiKey} />
      <OrderForm orgId={org.id} />

      <hr className="section-rule" />

      <h2 className="mb-1 text-xl font-bold">Issue a passport to a participant</h2>
      <p className="mb-3 max-w-xl text-govuk-grey-4">
        Trigger a single PASSPORT/ID order for someone at your event, entering
        the details to print. Link it to their account if you know their email.
      </p>
      <IssuePassportForm />

      <hr className="section-rule" />

      <h2 className="mb-4 text-xl font-bold">Order history</h2>
      {org.orders.length === 0 ? (
        <p className="text-govuk-grey-4">
          No orders yet. Place your first order above.
        </p>
      ) : (
        <ul className="govuk-task-list">
          {org.orders.map((order) => (
            <li key={order.id} className="govuk-task-list__item">
              <div className="govuk-task-list__name-and-hint">
                <span className="font-semibold">
                  {order.recipientName
                    ? `Passport for ${order.recipientName}`
                    : `${order.quantity} passport${order.quantity === 1 ? "" : "s"}`}
                </span>
                <p className="govuk-task-list__hint">
                  {dateLabel(order.createdAt)}
                  {order.ysws ? ` · ${order.ysws}` : ""}
                  {order.recipientEmail ? ` · ${order.recipientEmail}` : ""}
                  {order.note ? ` · ${order.note}` : ""}
                </p>
              </div>
              <span className="govuk-task-list__status">
                <span className="govuk-tag govuk-tag--grey">
                  {STATUS_LABEL[order.status] ?? order.status}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
