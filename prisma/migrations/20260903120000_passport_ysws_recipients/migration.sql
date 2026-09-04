-- CreateTable
CREATE TABLE "YSWS" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "apiKey" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "orgId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "YSWS_pkey" PRIMARY KEY ("id")
);

-- Backfill: create a YSWS from each existing org, moving its apiKey onto the YSWS
INSERT INTO "YSWS" ("id", "name", "slug", "apiKey", "isActive", "orgId", "updatedAt")
SELECT "id", "name", lower(regexp_replace(regexp_replace("name", '[^a-zA-Z0-9]+', '-', 'g'), '^-+|-+$', '', 'g')), "apiKey", true, "id", CURRENT_TIMESTAMP
FROM "Org";

-- CreateTable
CREATE TABLE "PassportRecipient" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PassportRecipient_pkey" PRIMARY KEY ("id")
);

-- Backfill: move existing flat recipient data into PassportRecipient rows
INSERT INTO "PassportRecipient" ("id", "orderId", "email", "name", "userId", "updatedAt")
SELECT 'rec_' || "id", "id",
       COALESCE("recipientEmail", 'unknown@example.com'),
       "recipientName",
       "userId",
       CURRENT_TIMESTAMP
FROM "PassportOrder"
WHERE "recipientEmail" IS NOT NULL OR "recipientName" IS NOT NULL;

-- AlterTable (rework PassportOrder into a header)
ALTER TABLE "PassportOrder" ADD COLUMN     "createdByUserId" TEXT,
ADD COLUMN     "createdFrom" TEXT NOT NULL DEFAULT 'legacy',
ADD COLUMN     "totalQuantity" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "yswsId" TEXT;

-- Backfill provenance on existing orders
UPDATE "PassportOrder" po
SET "yswsId" = po."orgId",
    "createdByUserId" = po."createdBy",
    "totalQuantity" = po."quantity";

-- Drop legacy columns no longer in the schema
ALTER TABLE "PassportOrder" DROP COLUMN "quantity",
DROP COLUMN "ysws";

-- CreateIndex
CREATE INDEX "YSWS_orgId_idx" ON "YSWS"("orgId");

-- CreateIndex
CREATE UNIQUE INDEX "YSWS_slug_key" ON "YSWS"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "YSWS_apiKey_key" ON "YSWS"("apiKey");

-- AddForeignKey
ALTER TABLE "YSWS" ADD CONSTRAINT "YSWS_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "PassportRecipient_orderId_idx" ON "PassportRecipient"("orderId");

-- CreateIndex
CREATE INDEX "PassportRecipient_email_idx" ON "PassportRecipient"("email");

-- AddForeignKey
ALTER TABLE "PassportRecipient" ADD CONSTRAINT "PassportRecipient_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "PassportOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PassportOrder" ADD CONSTRAINT "PassportOrder_yswsId_fkey" FOREIGN KEY ("yswsId") REFERENCES "YSWS"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PassportOrder" ADD CONSTRAINT "PassportOrder_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "PassportOrder_yswsId_idx" ON "PassportOrder"("yswsId");

-- CreateIndex
CREATE INDEX "PassportOrder_createdByUserId_idx" ON "PassportOrder"("createdByUserId");

-- DropForeignKey (org apiKey column removal)
ALTER TABLE "Org" DROP COLUMN "apiKey";
