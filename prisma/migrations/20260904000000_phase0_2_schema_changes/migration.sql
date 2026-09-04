-- Phase 0.2: Schema changes for recipient flow
-- 1. Create missing enums (OrderTransition, EventType, ActorType)
-- 2. Create missing tables (EmailDelivery, OrderEvent, AuditLog, Shipment, PassportVersion)
-- 3. Make PassportOrder.yswsId NOT NULL (backfill first)
-- 4. Add address fields to PassportRecipient
-- 5. Remove createdBy column from PassportOrder
-- 6. Add unique constraint on PassportRecipient (orderId, email)
-- 7. Add archivedAt to PassportOrder
-- 8. Change OrderEvent.actorType to enum
-- 9. Change AuditLog.actorType to enum
-- 10. Add index on EmailDelivery (status, createdAt)

-- Create missing enums first
CREATE TYPE "OrderTransition" AS ENUM (
    'AWAITING_RECIPIENT_DETAILS',
    'RECIPIENT_DETAILS_RECEIVED',
    'DRAFTING',
    'DRAFT_READY',
    'SENT_TO_HQ',
    'RECEIVED_FROM_HQ',
    'SHIPPING',
    'DELIVERED',
    'CANCELLED',
    'ERROR'
);

CREATE TYPE "EventType" AS ENUM (
    'ORDER_CREATED',
    'STATUS_CHANGED',
    'RECIPIENT_DETAILS_SUBMITTED',
    'RECIPIENT_DETAILS_UPDATED',
    'PASSPORT_VERSION_CREATED',
    'PASSPORT_VERSION_PROMOTED',
    'SHIPMENT_CREATED',
    'SHIPMENT_UPDATED',
    'EMAIL_SENT',
    'EMAIL_FAILED',
    'API_KEY_REGENERATED',
    'ROLE_CHANGED',
    'ORDER_CANCELLED'
);

CREATE TYPE "ActorType" AS ENUM ('ORGANIZER', 'ADMIN', 'SYSTEM', 'RECIPIENT', 'API');

-- Create missing tables first

CREATE TABLE "PassportVersion" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "data" JSONB,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PassportVersion_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PassportVersion_orderId_idx" ON "PassportVersion"("orderId");
CREATE INDEX "PassportVersion_orderId_version_idx" ON "PassportVersion"("orderId", "version");

ALTER TABLE "PassportVersion" ADD CONSTRAINT "PassportVersion_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "PassportOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "Shipment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "trackingNumber" TEXT,
    "carrier" TEXT,
    "status" TEXT,
    "shippedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "recipientEmail" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Shipment_orderId_idx" ON "Shipment"("orderId");

ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "PassportOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "OrderEvent" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "eventType" "EventType" NOT NULL,
    "status" "OrderStatus",
    "previousState" "OrderTransition",
    "newState" "OrderTransition" NOT NULL,
    "actor" TEXT NOT NULL,
    "actorType" "ActorType" NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OrderEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "OrderEvent_orderId_idx" ON "OrderEvent"("orderId");
CREATE INDEX "OrderEvent_createdAt_idx" ON "OrderEvent"("createdAt");

ALTER TABLE "OrderEvent" ADD CONSTRAINT "OrderEvent_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "PassportOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actor" TEXT NOT NULL,
    "actorType" "ActorType" NOT NULL,
    "beforeValue" JSONB,
    "afterValue" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "requestId" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AuditLog_entityType_entityId_createdAt_idx" ON "AuditLog"("entityType", "entityId", "createdAt");

CREATE TABLE "EmailDelivery" (
    "id" TEXT NOT NULL,
    "orderId" TEXT,
    "recipientEmail" TEXT NOT NULL,
    "eventType" "EventType" NOT NULL,
    "status" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastAttemptAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EmailDelivery_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "EmailDelivery_recipientEmail_idx" ON "EmailDelivery"("recipientEmail");
CREATE INDEX "EmailDelivery_eventType_idx" ON "EmailDelivery"("eventType");
CREATE INDEX "EmailDelivery_createdAt_idx" ON "EmailDelivery"("createdAt");
CREATE INDEX "EmailDelivery_status_createdAt_idx" ON "EmailDelivery"("status", "createdAt");

ALTER TABLE "EmailDelivery" ADD CONSTRAINT "EmailDelivery_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "PassportOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill yswsId for existing PassportOrder records
UPDATE "PassportOrder" 
SET "yswsId" = (
  SELECT id FROM "YSWS" WHERE "YSWS"."orgId" = "PassportOrder"."orgId" LIMIT 1
)
WHERE "yswsId" IS NULL;

-- Make yswsId NOT NULL
ALTER TABLE "PassportOrder" ALTER COLUMN "yswsId" SET NOT NULL;

-- Add address fields to PassportRecipient
ALTER TABLE "PassportRecipient" ADD COLUMN "addressLine1" TEXT;
ALTER TABLE "PassportRecipient" ADD COLUMN "addressLine2" TEXT;
ALTER TABLE "PassportRecipient" ADD COLUMN "city" TEXT;
ALTER TABLE "PassportRecipient" ADD COLUMN "stateProvince" TEXT;
ALTER TABLE "PassportRecipient" ADD COLUMN "postalCode" TEXT;
ALTER TABLE "PassportRecipient" ADD COLUMN "country" TEXT;
ALTER TABLE "PassportRecipient" ADD COLUMN "dateOfBirth" TIMESTAMP(3);
ALTER TABLE "PassportRecipient" ADD COLUMN "emergencyContact" TEXT;
ALTER TABLE "PassportRecipient" ADD COLUMN "photoUrl" TEXT;

-- Add unique constraint on PassportRecipient (orderId, email)
ALTER TABLE "PassportRecipient" ADD CONSTRAINT "PassportRecipient_orderId_email_key" UNIQUE ("orderId", "email");

-- Add archivedAt to PassportOrder
ALTER TABLE "PassportOrder" ADD COLUMN "archivedAt" TIMESTAMP(3);

-- Create index on archivedAt
CREATE INDEX "PassportOrder_archivedAt_idx" ON "PassportOrder"("archivedAt");

-- Remove createdBy column (replaced by createdByUserId)
ALTER TABLE "PassportOrder" DROP COLUMN "createdBy";

-- Change YSWS.orgId to NOT NULL (since every YSWS must belong to an org)
ALTER TABLE "YSWS" ALTER COLUMN "orgId" SET NOT NULL;

-- Update OrderEvent.actorType is already ActorType enum (created above)

-- Update AuditLog.actorType to use enum
ALTER TABLE "AuditLog" ALTER COLUMN "actorType" TYPE "ActorType" USING "actorType"::"ActorType";

-- Change FK from SetNull to Cascade for PassportOrder.yswsId
ALTER TABLE "PassportOrder" DROP CONSTRAINT IF EXISTS "PassportOrder_yswsId_fkey";
ALTER TABLE "PassportOrder" ADD CONSTRAINT "PassportOrder_yswsId_fkey" FOREIGN KEY ("yswsId") REFERENCES "YSWS"("id") ON DELETE CASCADE ON UPDATE CASCADE;