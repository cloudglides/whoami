export default function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="mb-8">
      <h1 className="mb-1 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
        {title}
      </h1>
      {description && (
        <p className="mb-4 max-w-2xl text-lg leading-relaxed text-govuk-grey-4">
          {description}
        </p>
      )}
      {actions && (
        <div className="mt-4 flex flex-wrap gap-3">
          {actions}
        </div>
      )}
    </header>
  );
}