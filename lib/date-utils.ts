export function dateLabel(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function datetimeLabel(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function timeLabel(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function relativeTime(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return dateLabel(d);
}

export function isoDate(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date);
  return d.toISOString().split("T")[0] ?? "";
}

export function isoDateTime(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date);
  return d.toISOString();
}

export function formatDateForInput(date: Date | string): string {
  return isoDate(date);
}

export const TIMELINE_STEPS = [
  {
    state: "AWAITING_RECIPIENT_DETAILS",
    label: "Order created",
    description: "Your passport order has been created. We're waiting for your details.",
  },
  {
    state: "RECIPIENT_DETAILS_RECEIVED",
    label: "Details received",
    description: "We've received your details and are preparing your passport.",
  },
  {
    state: "DRAFTING",
    label: "Passport being drafted",
    description: "Your passport is being drafted by our team.",
  },
  {
    state: "DRAFT_READY",
    label: "Draft ready for review",
    description: "The draft is ready and will be reviewed shortly.",
  },
  {
    state: "SENT_TO_HQ",
    label: "Sent to HQ",
    description: "Your passport has been sent to Hack Club HQ for printing.",
  },
  {
    state: "RECEIVED_FROM_HQ",
    label: "Received from HQ",
    description: "Hack Club HQ has received your passport and is preparing it for shipping.",
  },
  {
    state: "SHIPPING",
    label: "Shipped",
    description: "Your passport is on its way to you!",
  },
  {
    state: "DELIVERED",
    label: "Delivered",
    description: "Your passport has been delivered.",
  },
] as const;

export function getTimelineStepIndex(currentState: string): number {
  return TIMELINE_STEPS.findIndex((s) => s.state === currentState);
}

export function getCurrentTimelineStep(currentState: string) {
  const index = getTimelineStepIndex(currentState);
  return TIMELINE_STEPS[index] ?? TIMELINE_STEPS[0];
}

export function getNextTimelineStep(currentState: string) {
  const index = getTimelineStepIndex(currentState);
  return TIMELINE_STEPS[index + 1] ?? null;
}