import Link from "next/link";
import Breadcrumb from "../components/Breadcrumb";
import FadeIn from "../components/FadeIn";
import { getCurrentUserWithRole, hasRole, ROLE_LABEL } from "@/lib/org";
import AdminSidebar from "./AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUserWithRole();

  if (!user) {
    return (
      <FadeIn className="mx-auto max-w-2xl px-6 pb-12 pt-10">
        <div className="mb-8">
          <h1 className="mb-1 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            Admin
          </h1>
          <p className="mb-4 max-w-2xl text-lg leading-relaxed text-govuk-grey-4">
            Sign in with Hack Club to manage organizers and YSWSes.
          </p>
        </div>
        <Link href="/api/auth/signin?callbackUrl=/admin" className="govuk-button">
          Sign in with Hack Club
        </Link>
      </FadeIn>
    );
  }

  if (!hasRole(user.role, "ADMIN")) {
    return (
      <FadeIn className="mx-auto max-w-2xl px-6 pb-12 pt-10">
        <div className="mb-8">
          <h1 className="mb-1 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            Admin
          </h1>
          <p className="mb-4 max-w-2xl text-lg leading-relaxed text-govuk-grey-4">
            You need admin access to manage organizers. Contact a superadmin.
          </p>
        </div>
      </FadeIn>
    );
  }

  return (
    <FadeIn className="mx-auto w-full px-6 pb-8 pt-2">
      <Breadcrumb
        items={[{ label: "whoami", href: "/" }, { label: "Admin" }]}
      />
      <div className="grid gap-6 lg:grid-cols-12">
        <main className="lg:col-span-8">{children}</main>
        <aside className="lg:col-span-4">
          <AdminSidebar role={ROLE_LABEL[user.role]} />
        </aside>
      </div>
    </FadeIn>
  );
}