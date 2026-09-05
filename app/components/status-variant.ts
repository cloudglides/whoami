export type StatusVariant =
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
