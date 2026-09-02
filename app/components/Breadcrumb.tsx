import Link from "next/link";

const chevron = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    className="mx-1 inline-block align-middle text-govuk-grey-4"
    aria-hidden="true"
  >
    <path
      d="M6 3l5 5-5 5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 text-sm text-govuk-grey-4">
      <ol className="flex list-none items-center gap-0 p-0">
        {items.map((item, i) => (
          <li key={i} className="flex items-center">
            {i > 0 && chevron}
            {item.href ? (
              <Link
                href={item.href}
                className="text-govuk-blue underline underline-offset-2 decoration-1 hover:text-govuk-blue-hover"
              >
                {item.label}
              </Link>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
