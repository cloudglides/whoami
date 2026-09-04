import Link from "next/link";
import Breadcrumb from "../components/Breadcrumb";
import FadeIn from "../components/FadeIn";
import { getCurrentUserWithRole, hasRole, ROLE_LABEL } from "@/lib/org";
import AdminSidebar from "./AdminSidebar";
import PageHeader from "../components/PageHeader";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUserWithRole();

  if (!user) {
    return (
      <FadeIn className="mx-auto max-w-2xl px-6 pb-12 pt-10">
        <PageHeader
          title="Admin"
          description="Sign in with Hack Club to manage organizers and YSWSes."
        />
        <Link href="/api/auth/signin?callbackUrl=/admin" className="govuk-button">
          Sign in with Hack Club
        </Link>
      </FadeIn>
    );
  }

  if (!hasRole(user.role, "ADMIN")) {
    return (
      <FadeIn className="mx-auto max-w-2xl px-6 pb-12 pt-10">
        <PageHeader
          title="Admin"
          description="You need admin access to manage organizers. Contact a superadmin."
        />
      </FadeIn>
    );
  }

  return (
    <FadeIn className="mx-auto w-full px-6 pb-12 pt-8">
      <Breadcrumb
        items={[{ label: "whoami", href: "/" }, { label: "Admin" }]}
      />
      <PageHeader
        title="Admin"
        description={`Signed in as a ${ROLE_LABEL[user.role].toLowerCase()}`}
      />

      <div className="grid gap-8 lg:grid-cols-4">
        <main className="lg:col-span-3">{children}</main>
        <aside className="lg:col-span-1">
          <AdminSidebar role={ROLE_LABEL[user.role]} />
        </aside>
      </div>
    </FadeIn>
  );
}