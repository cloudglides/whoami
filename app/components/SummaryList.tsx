interface SummaryListItem {
  key: string;
  value: string | number;
  href?: string;
  modifier?: "bold" | "numeric";
}

interface SummaryListProps {
  items: SummaryListItem[];
  className?: string;
}

export default function SummaryList({ items, className = "" }: SummaryListProps) {
  return (
    <dl className={`govuk-summary-list ${className}`}>
      {items.map((item) => (
        <div key={item.key} className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">{item.key}</dt>
          <dd className={`govuk-summary-list__value ${item.modifier === "bold" ? "govuk-!-font-weight-bold" : ""} ${item.modifier === "numeric" ? "govuk-!-font-size-27" : ""}`}>
            {item.href ? (
              <a href={item.href} className="govuk-link">{item.value}</a>
            ) : (
              item.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}