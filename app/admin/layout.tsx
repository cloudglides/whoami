import Link from "next/link";
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
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="mb-1 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          Admin
        </h1>
        <p className="mb-4 max-w-2xl text-lg leading-relaxed text-govuk-grey-4">
          Sign in with Hack Club to manage organizers and YSWSes.
        </p>
        <Link
          href="/api/auth/signin?callbackUrl=/admin"
          className="govuk-button"
        >
          Sign in with Hack Club
        </Link>
      </div>
    );
  }

  if (!hasRole(user.role, "ADMIN")) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="mb-1 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          Admin
        </h1>
        <p className="mb-4 max-w-2xl text-lg leading-relaxed text-govuk-grey-4">
          You need admin access to manage organizers. Contact a superadmin.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-govuk-white">
      <header className="border-b border-govuk-grey-2 bg-govuk-white sticky top-0 z-10">
        <div className="mx-auto max-w-full px-6 py-4">
          <nav
            className="flex items-center justify-between"
            aria-label="Global"
          >
            <Link href="/" className="text-xl font-bold text-hc-red"></Link>
            <div className="flex items-center gap-4 text-sm text-govuk-grey-4">
              <span>
                Signed in as <strong>{user.name ?? user.email}</strong>
              </span>
              <span aria-hidden="true">·</span>
              <span>
                Role: <strong>{ROLE_LABEL[user.role]}</strong>
              </span>
              <Link href="/api/auth/signout" className="govuk-link">
                Sign out
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-full px-6 py-6 lg:grid lg:grid-cols-[260px_1fr] lg:gap-6">
        <aside
          className="lg:sticky lg:top-20 lg:self-start hidden lg:block"
          aria-label="Admin navigation"
        >
          <AdminSidebar role={ROLE_LABEL[user.role]} />
        </aside>
        <main className="w-full lg:col-span-1">{children}</main>
      </div>
    </div>
  );
}
