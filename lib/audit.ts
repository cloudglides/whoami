import { prisma } from "./prisma";
import { getRequestId, getClientInfo } from "./request-id";
import { createLogger } from "./logger";

const auditLogger = createLogger({ component: "audit" });

type ActorType = "ORGANIZER" | "ADMIN" | "SYSTEM" | "RECIPIENT" | "API";

export async function auditLog(params: {
  entityType: string;
  entityId: string;
  action: string;
  actor: string;
  actorType: ActorType;
  beforeValue?: unknown;
  afterValue?: unknown;
  description?: string;
  requestId?: string;
}) {
  const { ip, userAgent } = await getClientInfo();
  const requestId = params.requestId ?? await getRequestId();

  await prisma.auditLog.create({
    data: {
      entityType: params.entityType,
      entityId: params.entityId,
      action: params.action,
      actor: params.actor,
      actorType: params.actorType,
      beforeValue: params.beforeValue as any,
      afterValue: params.afterValue as any,
      ipAddress: ip,
      userAgent,
      requestId,
      description: params.description,
    },
  });

  auditLogger.info(
    {
      entityType: params.entityType,
      entityId: params.entityId,
      action: params.action,
      actor: params.actor,
      actorType: params.actorType,
      requestId,
    },
    params.description ?? `Audit: ${params.action} on ${params.entityType}:${params.entityId}`
  );
}