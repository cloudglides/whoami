import Link from "next/link";

interface Step {
  number: number;
  title: string;
  description: string;
  link?: { href: string; label: string };
}

export default function StepByStep({
  heading,
  steps,
}: {
  heading: string;
  steps: Step[];
}) {
  return (
    <div className="gem-c-step-by-step">
      <h2 className="mb-6 text-2xl font-bold">{heading}</h2>
      <ol className="list-none p-0">
        {steps.map((step) => (
          <li key={step.number} className="gem-c-step-by-step__step flex gap-4">
            <div className="gem-c-step-by-step__number">{step.number}</div>
            <div className="flex-1">
              <h3 className="mb-2 text-lg font-bold">{step.title}</h3>
              <p className="mb-3 text-base leading-relaxed text-govuk-text-muted">
                {step.description}
              </p>
              {step.link && (
                <Link
                  href={step.link.href}
                  className="inline-block rounded-sm bg-govuk-yellow px-5 py-2 text-sm font-bold text-govuk-black no-underline shadow-[0_2px_0_#002d18] transition-all hover:bg-[#ffeb3b] hover:shadow-[0_4px_0_#002d18] hover:translate-y-[-2px] active:translate-y-0 active:shadow-[0_0_0_#002d18]"
                >
                  {step.link.label}
                </Link>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
