-- AlterTable
ALTER TABLE "PassportOrder" ADD COLUMN     "recipientEmail" TEXT,
ADD COLUMN     "recipientName" TEXT,
ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE INDEX "PassportOrder_userId_idx" ON "PassportOrder"("userId");

-- AddForeignKey
ALTER TABLE "PassportOrder" ADD CONSTRAINT "PassportOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
