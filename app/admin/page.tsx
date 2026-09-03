import Link from "next/link";
import Breadcrumb from "../components/Breadcrumb";
import FadeIn from "../components/FadeIn";
import { prisma } from "@/lib/prisma";
import { getCurrentUserWithRole, hasRole, ROLE_LABEL } from "@/lib/org";
import AddOrganizerForm from "./AddOrganizerForm";
import SetRoleForm from "./SetRoleForm";
import IssuePassportAdminForm from "./IssuePassportAdminForm";

const ORDER_STATUS_LABEL: Record<string, string> = {
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

export default async function AdminPage() {
  const user = await getCurrentUserWithRole();

  if (!user) {
    return (
      <FadeIn className="mx-auto max-w-3xl px-5 pb-12 pt-10">
        <Breadcrumb items={[{ label: "whoami", href: "/" }, { label: "Admin" }]} />
        <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          Admin
        </h1>
        <p className="mb-6 max-w-xl text-lg leading-relaxed text-govuk-grey-4">
          Sign in with Hack Club to manage organizers.
        </p>
        <Link href="/api/auth/signin?callbackUrl=/admin" className="govuk-button">
          Sign in with Hack Club
        </Link>
      </FadeIn>
    );
  }

  if (!hasRole(user.role, "ADMIN")) {
    return (
      <FadeIn className="mx-auto max-w-3xl px-5 pb-12 pt-10">
        <Breadcrumb items={[{ label: "whoami", href: "/" }, { label: "Admin" }]} />
        <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          Admin
        </h1>
        <p className="mb-4 max-w-xl text-lg leading-relaxed text-govuk-grey-4">
          You need admin access to manage organizers. Contact a superadmin.
        </p>
        <Link href="/dashboard" className="govuk-button govuk-button--secondary">
          Back to dashboard
        </Link>
      </FadeIn>
    );
  }

  const orgs = await prisma.org.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });
  const recentOrders = await prisma.passportOrder.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { org: { select: { name: true } }, user: { select: { name: true } } },
  });

  return (
    <FadeIn className="mx-auto max-w-4xl px-5 pb-12 pt-10">
      <Breadcrumb
        items={[{ label: "whoami", href: "/" }, { label: "Admin" }]}
      />
      <h1 className="mb-1 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
        Admin
      </h1>
      <p className="mb-6 text-sm text-govuk-grey-4">
        Signed in as a {ROLE_LABEL[user.role].toLowerCase()}
      </p>

      <hr className="section-rule" />

      <h2 className="mb-1 text-xl font-bold">Trigger a passport order</h2>
      <p className="mb-3 max-w-2xl text-govuk-grey-4">
        Manually request passports for an org, connecting each one to a
        participant. Enter the email to link it to their account.
      </p>
      <IssuePassportAdminForm orgs={orgs} />

      <hr className="section-rule" />

      <h2 className="mb-3 text-xl font-bold">Recent passport orders</h2>
      {recentOrders.length === 0 ? (
        <p className="text-govuk-grey-4">No orders yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b-2 border-govuk-black">
                <th className="py-2 pr-4 font-bold">When</th>
                <th className="py-2 pr-4 font-bold">Org</th>
                <th className="py-2 pr-4 font-bold">Recipient</th>
                <th className="py-2 pr-4 font-bold">Qty</th>
                <th className="py-2 font-bold">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id} className="border-b border-govuk-grey-2 align-top">
                  <td className="py-2 pr-4">{dateLabel(o.createdAt)}</td>
                  <td className="py-2 pr-4">{o.org.name}</td>
                  <td className="py-2 pr-4">
                    {o.user?.name ?? o.recipientName ?? "Bulk order"}
                    {o.recipientEmail ? (
                      <span className="block text-sm text-govuk-grey-4">
                        {o.recipientEmail}
                      </span>
                    ) : null}
                  </td>
                  <td className="py-2 pr-4">{o.quantity}</td>
                  <td className="py-2">
                    <span className="govuk-tag govuk-tag--grey">
                      {ORDER_STATUS_LABEL[o.status] ?? o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <hr className="section-rule" />

      <h2 className="mb-1 text-xl font-bold">Register an organizer</h2>
      <p className="mb-3 max-w-xl text-govuk-grey-4">
        Promote someone to organizer and register their YSWS org so they can
        order passports. They must have signed in once.
      </p>
      <AddOrganizerForm />

      <hr className="section-rule" />

      {user.role === "SUPERADMIN" ? (
        <>
          <h2 className="mb-1 text-xl font-bold">Change roles</h2>
          <p className="mb-3 max-w-xl text-govuk-grey-4">
            Set any account to participant, organizer, admin or superadmin.
          </p>
          <SetRoleForm />
        </>
      ) : (
        <p className="text-govuk-grey-4">
          Only superadmins can change roles.
        </p>
      )}
    </FadeIn>
  );
}
