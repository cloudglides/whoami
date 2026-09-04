import Link from "next/link";

interface PageHeaderProps {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  actions?: React.ReactNode;
  className?: string;
}

export default function PageHeader({
  title,
  description,
  backHref,
  backLabel = "Back",
  actions,
  className = "",
}: PageHeaderProps) {
  return (
    <header className={`mb-8 ${className}`}>
      {backHref && (
        <Link
          href={backHref}
          className="mb-4 inline-flex items-center gap-1 text-sm text-govuk-blue underline underline-offset-2 hover:text-govuk-blue-hover"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 3L6 8l4 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {backLabel}
        </Link>
      )}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="mb-1 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{title}</h1>
          {description && (
            <p className="max-w-2xl text-lg leading-relaxed text-govuk-grey-4">{description}</p>
          )}
        </div>
        {actions && <div className="flex-shrink-0">{actions}</div>}
      </div>
    </header>
  );
}