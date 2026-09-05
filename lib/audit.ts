import { prisma } from "./prisma";
import { getRequestId, getClientInfo } from "./request-id";
import { createLogger } from "./logger";
import { Prisma } from "../generated/prisma/client";

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

  const data: Prisma.AuditLogCreateInput = {
    entityType: params.entityType,
    entityId: params.entityId,
    action: params.action,
    actor: params.actor,
    actorType: params.actorType,
    ipAddress: ip,
    userAgent,
    requestId,
    description: params.description,
  };

  if (params.beforeValue !== undefined) {
    data.beforeValue = params.beforeValue as Prisma.InputJsonValue;
  }
  if (params.afterValue !== undefined) {
    data.afterValue = params.afterValue as Prisma.InputJsonValue;
  }

  await prisma.auditLog.create({ data });

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