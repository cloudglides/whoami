/*
  Warnings:

  - A unique constraint covering the columns `[apiKey]` on the table `Org` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PARTICIPANT', 'ORGANIZER', 'ADMIN', 'SUPERADMIN');

-- AlterTable
ALTER TABLE "Org" ADD COLUMN     "apiKey" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'PARTICIPANT';

-- CreateIndex
CREATE UNIQUE INDEX "Org_apiKey_key" ON "Org"("apiKey");
