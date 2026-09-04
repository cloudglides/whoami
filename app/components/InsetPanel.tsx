export default function InsetPanel({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`govuk-inset ${className}`}>
      {title && (
        <h3 className="mb-2 text-sm font-bold text-govuk-grey-4 uppercase tracking-wide">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}