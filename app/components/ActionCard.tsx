import Link from "next/link";

interface ActionCardProps {
  title: string;
  description: string;
  href: string;
  label: string;
  variant?: "primary" | "secondary" | "destructive";
}

export default function ActionCard({
  title,
  description,
  href,
  label,
  variant = "primary",
}: ActionCardProps) {
  const variants = {
    primary: "govuk-button",
    secondary: "govuk-button govuk-button--secondary",
    destructive: "govuk-button govuk-button--warning",
  };

  return (
    <Link
      href={href}
      className={`flex flex-col p-6 border-2 border-govuk-grey-2 hover:border-govuk-black hover:bg-govuk-grey-1 transition-colors ${variant === "destructive" && "border-hc-red hover:border-hc-red hover:bg-white"}`}
    >
      <h3 className="mb-2 text-lg font-bold">{title}</h3>
      <p className="mb-4 flex-1 text-govuk-grey-4">{description}</p>
      <span className={variants[variant]}>{label}</span>
    </Link>
  );
}