import { prisma } from "../prisma";
import { getRequestId, getClientInfo } from "../request-id";
import { createLogger } from "../logger";
import type { ActorType } from "../../generated/prisma/enums";
import { Prisma } from "../../generated/prisma/client";

const auditLogger = createLogger({ component: "audit" });

export interface AuditLogInput {
  entityType: string;
  entityId: string;
  action: string;
  actor: string;
  actorType: ActorType;
  beforeValue?: unknown;
  afterValue?: unknown;
  description?: string;
  requestId?: string;
}

export async function auditLog(input: AuditLogInput) {
  const { ip, userAgent } = await getClientInfo();
  const requestId = input.requestId ?? (await getRequestId());

  await prisma.auditLog.create({
    data: {
      entityType: input.entityType,
      entityId: input.entityId,
      action: input.action,
      actor: input.actor,
      actorType: input.actorType,
      beforeValue: (input.beforeValue as Prisma.InputJsonValue) ?? Prisma.JsonNull,
      afterValue: (input.afterValue as Prisma.InputJsonValue) ?? Prisma.JsonNull,
      ipAddress: ip,
      userAgent,
      requestId,
      description: input.description,
    },
  });

  auditLogger.info(
    {
      entityType: input.entityType,
      entityId: input.entityId,
      action: input.action,
      actor: input.actor,
      actorType: input.actorType,
      requestId,
    },
    input.description ?? `Audit: ${input.action} on ${input.entityType}:${input.entityId}`
  );
}

export async function getAuditLogs(params: {
  entityType?: string;
  entityId?: string;
  actor?: string;
  action?: string;
  startDate?: Date;
  endDate?: Date;
  take?: number;
  cursor?: string;
}) {
  const where: Record<string, unknown> = {};
  if (params.entityType) where.entityType = params.entityType;
  if (params.entityId) where.entityId = params.entityId;
  if (params.actor) where.actor = params.actor;
  if (params.action) where.action = params.action;
  if (params.startDate || params.endDate) {
    where.createdAt = {};
    if (params.startDate) (where.createdAt as Record<string, Date>).gte = params.startDate;
    if (params.endDate) (where.createdAt as Record<string, Date>).lte = params.endDate;
  }

  return prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: params.take ?? 100,
    cursor: params.cursor ? { id: params.cursor } : undefined,
  });
}

export async function getAuditLogCount(params: {
  entityType?: string;
  entityId?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  const where: Record<string, unknown> = {};
  if (params.entityType) where.entityType = params.entityType;
  if (params.entityId) where.entityId = params.entityId;
  if (params.startDate || params.endDate) {
    where.createdAt = {};
    if (params.startDate) (where.createdAt as Record<string, Date>).gte = params.startDate;
    if (params.endDate) (where.createdAt as Record<string, Date>).lte = params.endDate;
  }
  return prisma.auditLog.count({ where });
}

export const AUDIT_ACTIONS = {
  ORDER_CREATED: "ORDER_CREATED",
  ORDER_UPDATED: "ORDER_UPDATED",
  ORDER_STATE_CHANGED: "ORDER_STATE_CHANGED",
  ORDER_CANCELLED: "ORDER_CANCELLED",
  RECIPIENT_DETAILS_SUBMITTED: "RECIPIENT_DETAILS_SUBMITTED",
  RECIPIENT_EMAIL_SUBMITTED: "RECIPIENT_EMAIL_SUBMITTED",
  RECIPIENT_ADDRESS_SUBMITTED: "RECIPIENT_ADDRESS_SUBMITTED",
  RECIPIENT_PHOTO_SUBMITTED: "RECIPIENT_PHOTO_SUBMITTED",
  RECIPIENT_EMERGENCY_SUBMITTED: "RECIPIENT_EMERGENCY_SUBMITTED",
  RECIPIENT_DETAILS_COMPLETED: "RECIPIENT_DETAILS_COMPLETED",
  TRACKING_TOKEN_REGENERATED: "TRACKING_TOKEN_REGENERATED",
  API_KEY_REGENERATED: "API_KEY_REGENERATED",
  ROLE_CHANGED: "ROLE_CHANGED",
  ORG_CREATED: "ORG_CREATED",
  ORG_UPDATED: "ORG_UPDATED",
  ORG_DELETED: "ORG_DELETED",
  YSWS_CREATED: "YSWS_CREATED",
  YSWS_UPDATED: "YSWS_UPDATED",
  ORGANIZER_ADDED: "ORGANIZER_ADDED",
  ORGANIZER_REMOVED: "ORGANIZER_REMOVED",
  EMAIL_SENT: "EMAIL_SENT",
  EMAIL_FAILED: "EMAIL_FAILED",
  UNAUTHORIZED_ACCESS_ATTEMPT: "UNAUTHORIZED_ACCESS_ATTEMPT",
  ROLE_ESCALATED_VIA_ENV: "ROLE_ESCALATED_VIA_ENV",
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];