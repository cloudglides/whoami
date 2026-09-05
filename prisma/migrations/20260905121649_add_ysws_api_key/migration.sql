-- DropForeignKey
ALTER TABLE "EmailDelivery" DROP CONSTRAINT "EmailDelivery_orderId_fkey";

-- DropForeignKey
ALTER TABLE "PassportOrder" DROP CONSTRAINT "PassportOrder_userId_fkey";

-- DropForeignKey
ALTER TABLE "YSWS" DROP CONSTRAINT "YSWS_orgId_fkey";

-- DropIndex
DROP INDEX "PassportOrder_userId_idx";

-- DropIndex
DROP INDEX "YSWS_apiKey_key";

-- DropIndex
DROP INDEX "YSWS_orgId_idx";

-- AlterTable
ALTER TABLE "OrganizerYSWSMembership" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "PassportOrder" DROP COLUMN "userId",
ADD COLUMN     "currentState" "OrderTransition" NOT NULL DEFAULT 'AWAITING_RECIPIENT_DETAILS',
ADD COLUMN     "recipientToken" TEXT,
ADD COLUMN     "recipientUserId" TEXT,
ALTER COLUMN "createdFrom" DROP DEFAULT,
ALTER COLUMN "totalQuantity" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "expires";

-- AlterTable
ALTER TABLE "YSWS" DROP COLUMN "apiKey",
ADD COLUMN     "apiKeyDisplay" TEXT,
ADD COLUMN     "apiKeyExpiresAt" TIMESTAMP(3),
ADD COLUMN     "apiKeyHash" TEXT,
ADD COLUMN     "apiKeyLastUsed" TIMESTAMP(3),
ADD COLUMN     "apiKeyPrefix" TEXT,
ADD COLUMN     "apiKeyScopes" TEXT[] DEFAULT ARRAY['orders:write']::TEXT[];

-- CreateIndex
CREATE INDEX "OrderEvent_eventType_createdAt_idx" ON "OrderEvent"("eventType", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PassportOrder_recipientToken_key" ON "PassportOrder"("recipientToken");

-- CreateIndex
CREATE INDEX "PassportOrder_recipientUserId_idx" ON "PassportOrder"("recipientUserId");

-- CreateIndex
CREATE INDEX "PassportOrder_recipientEmail_idx" ON "PassportOrder"("recipientEmail");

-- CreateIndex
CREATE INDEX "PassportOrder_recipientToken_idx" ON "PassportOrder"("recipientToken");

-- CreateIndex
CREATE INDEX "PassportOrder_orgId_currentState_idx" ON "PassportOrder"("orgId", "currentState");

-- CreateIndex
CREATE INDEX "PassportOrder_yswsId_currentState_idx" ON "PassportOrder"("yswsId", "currentState");

-- CreateIndex
CREATE INDEX "PassportOrder_recipientEmail_archivedAt_idx" ON "PassportOrder"("recipientEmail", "archivedAt");

-- CreateIndex
CREATE INDEX "PassportOrder_createdAt_idx" ON "PassportOrder"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "YSWS_apiKeyHash_key" ON "YSWS"("apiKeyHash");

-- CreateIndex
CREATE UNIQUE INDEX "YSWS_apiKeyPrefix_key" ON "YSWS"("apiKeyPrefix");

-- CreateIndex
CREATE INDEX "YSWS_apiKeyPrefix_idx" ON "YSWS"("apiKeyPrefix");

-- AddForeignKey
ALTER TABLE "YSWS" ADD CONSTRAINT "YSWS_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PassportOrder" ADD CONSTRAINT "PassportOrder_recipientUserId_fkey" FOREIGN KEY ("recipientUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

