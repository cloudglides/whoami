"use client";

import type { StatusVariant } from "./status-variant";

const variantClasses: Record<StatusVariant, string> = {
  awaiting: "govuk-tag govuk-tag--yellow",
  "in-progress": "govuk-tag govuk-tag--blue",
  ready: "govuk-tag govuk-tag--blue",
  transit: "govuk-tag govuk-tag--grey",
  delivered: "govuk-tag govuk-tag--green",
  cancelled: "govuk-tag govuk-tag--red",
  error: "govuk-tag govuk-tag--red",
  pending: "govuk-tag govuk-tag--yellow",
  active: "govuk-tag govuk-tag--green",
  inactive: "govuk-tag govuk-tag--red",
  default: "govuk-tag govuk-tag--grey",
};

const variantLabels: Record<StatusVariant, string> = {
  awaiting: "Awaiting details",
  "in-progress": "In progress",
  ready: "Ready",
  transit: "In transit",
  delivered: "Delivered",
  cancelled: "Cancelled",
  error: "Error",
  pending: "Pending",
  active: "Active",
  inactive: "Inactive",
  default: "Unknown",
};

interface StatusBadgeProps {
  variant: StatusVariant;
  label?: string;
  className?: string;
}

export default function StatusBadge({
  variant,
  label,
  className = "",
}: StatusBadgeProps) {
  return (
    <span className={`${variantClasses[variant]} text-xs whitespace-nowrap ${className}`}>
      {label ?? variantLabels[variant]}
    </span>
  );
}

export type { StatusVariant };
