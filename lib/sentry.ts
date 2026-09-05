import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN;
const ENVIRONMENT = process.env.NODE_ENV || "development";

function scrubPII(data: unknown): Record<string, unknown> | string | undefined {
  if (typeof data === "string") {
    // Email addresses
    if (data.includes("@") && data.includes(".") && !data.startsWith("http")) {
      return "[EMAIL_REDACTED]";
    }
    // API keys (wom_ prefix)
    if (data.startsWith("wom_")) {
      return "[API_KEY_REDACTED]";
    }
    // 64-char hex tokens
    if (/^[a-f0-9]{64}$/i.test(data)) {
      return "[TOKEN_REDACTED]";
    }
    // UUIDs (could be recipient tokens)
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data)) {
      return "[UUID_REDACTED]";
    }
    // Address-like strings
    if (data.length > 50 && /\d/.test(data) && /[a-zA-Z]/.test(data)) {
      return "[PII_REDACTED]";
    }
    return data;
  }
  if (typeof data === "object" && data !== null) {
    const scrubbed: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      // Scrub sensitive keys
      const lowerKey = key.toLowerCase();
      if (
        lowerKey.includes("email") ||
        lowerKey.includes("address") ||
        lowerKey.includes("token") ||
        lowerKey.includes("key") ||
        lowerKey.includes("secret") ||
        lowerKey.includes("password") ||
        lowerKey.includes("phone") ||
        lowerKey.includes("postal") ||
        lowerKey.includes("zip")
      ) {
        scrubbed[key] = "[REDACTED]";
      } else {
        scrubbed[key] = scrubPII(value);
      }
    }
    return scrubbed;
  }
  return undefined;
}

export function initSentry() {
  if (!SENTRY_DSN) {
    console.warn("[Sentry] SENTRY_DSN not set, skipping Sentry initialization");
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: ENVIRONMENT,
    tracesSampleRate: ENVIRONMENT === "production" ? 0.1 : 1.0,
    debug: ENVIRONMENT === "development",
    beforeSend(event) {
      // Scrub PII from event
      if (event.request) {
        event.request = scrubPII(event.request) as typeof event.request;
      }
      if (event.extra) {
        event.extra = scrubPII(event.extra) as typeof event.extra;
      }
      if (event.user) {
        // Keep user ID but scrub email
        event.user = {
          ...event.user,
          email: "[REDACTED]",
        };
      }
      return event;
    },
    beforeSendTransaction(transaction) {
      // Scrub PII from transaction
      if (transaction.request) {
        transaction.request = scrubPII(transaction.request) as typeof transaction.request;
      }
      return transaction;
    },
    // Use default integrations for edge runtime (includes WinterCGFetch, Console, RequestData, etc.)
    // Node.js-specific integrations like httpIntegration, onUncaughtExceptionIntegration, 
    // onUnhandledRejectionIntegration are not available in edge runtime
  });
}

export function captureOrderError(
  error: Error,
  context: { orderId: string; userId?: string; actorType?: string }
) {
  Sentry.withScope((scope) => {
    scope.setTag("orderId", context.orderId);
    if (context.userId) scope.setUser({ id: context.userId });
    if (context.actorType) scope.setTag("actorType", context.actorType);
    Sentry.captureException(error);
  });
}

export function captureEmailError(
  error: Error,
  context: { orderId: string; emailType: string; recipientEmail?: string }
) {
  Sentry.withScope((scope) => {
    scope.setTag("orderId", context.orderId);
    scope.setTag("emailType", context.emailType);
    if (context.recipientEmail) scope.setTag("recipientEmail", "[REDACTED]");
    Sentry.captureException(error);
  });
}

export function captureAPIError(
  error: Error,
  context: { endpoint: string; method: string; apiKeyPrefix?: string }
) {
  Sentry.withScope((scope) => {
    scope.setTag("endpoint", context.endpoint);
    scope.setTag("method", context.method);
    if (context.apiKeyPrefix) scope.setTag("apiKeyPrefix", context.apiKeyPrefix);
    Sentry.captureException(error);
  });
}

export function setSentryUserContext(user: { id: string; email?: string; role?: string }) {
  Sentry.setUser({
    id: user.id,
    email: user.email ? "[REDACTED]" : undefined,
    role: user.role,
  });
}

export function addSentryBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, unknown>
) {
  const scrubbedData = data ? scrubPII(data) : undefined;
  // Sentry breadcrumb data must be a plain object
  const breadcrumbData = scrubbedData && typeof scrubbedData === 'object' && !Array.isArray(scrubbedData)
    ? scrubbedData
    : undefined;
  
  Sentry.addBreadcrumb({
    message,
    category,
    data: breadcrumbData,
    level: "info",
  });
}