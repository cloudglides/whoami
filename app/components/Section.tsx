export default function Section({
  title,
  description,
  children,
  action,
  className = "",
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`mb-8 ${className}`}>
      <header className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="mb-1 text-xl font-bold">{title}</h2>
          {description && (
            <p className="max-w-2xl text-govuk-grey-4">{description}</p>
          )}
        </div>
        {action && <div className="flex-shrink-0 mt-1">{action}</div>}
      </header>
      <div>{children}</div>
    </section>
  );
}