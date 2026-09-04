import { headers } from "next/headers";

export async function getRequestId(): Promise<string> {
  const headersList = await headers();
  return headersList.get("x-request-id") ?? "unknown";
}

export async function getClientInfo(): Promise<{ ip?: string; userAgent?: string }> {
  const headersList = await headers();
  const forwarded = headersList.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : undefined;
  const userAgent = headersList.get("user-agent") ?? undefined;
  return { ip, userAgent };
}