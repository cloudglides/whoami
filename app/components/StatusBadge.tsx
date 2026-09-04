"use client";

type StatusVariant =
  | "awaiting"
  | "in-progress"
  | "ready"
  | "transit"
  | "delivered"
  | "cancelled"
  | "error"
  | "pending"
  | "active"
  | "inactive"
  | "default";

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

export function mapOrderStateToVariant(state: string): StatusVariant {
  switch (state) {
    case "AWAITING_RECIPIENT_DETAILS":
      return "awaiting";
    case "RECIPIENT_DETAILS_RECEIVED":
    case "DRAFTING":
    case "DRAFT_READY":
      return "in-progress";
    case "SENT_TO_HQ":
    case "RECEIVED_FROM_HQ":
      return "transit";
    case "SHIPPING":
      return "transit";
    case "DELIVERED":
      return "delivered";
    case "CANCELLED":
      return "cancelled";
    case "ERROR":
      return "error";
    default:
      return "default";
  }
}

export function mapFulfillmentStatusToVariant(status: string): StatusVariant {
  switch (status) {
    case "PENDING":
      return "pending";
    case "CONFIRMED":
      return "in-progress";
    case "SHIPPED":
      return "transit";
    default:
      return "default";
  }
}

export function mapYSWSActiveToVariant(isActive: boolean): StatusVariant {
  return isActive ? "active" : "inactive";
}

export function mapUserRoleToVariant(role: string): StatusVariant {
  switch (role) {
    case "SUPERADMIN":
      return "error";
    case "ADMIN":
      return "in-progress";
    case "ORGANIZER":
      return "ready";
    default:
      return "default";
  }
}