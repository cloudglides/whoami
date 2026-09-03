-- AlterTable
ALTER TABLE "PassportOrder" ADD COLUMN     "ysws" TEXT;

-- Backfill the ysws from the linked org's name
UPDATE "PassportOrder"
SET "ysws" = o."name"
FROM "Org" o
WHERE "PassportOrder"."orgId" = o."id";
