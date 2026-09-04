-- Add OrganizerYSWSMembership table

CREATE TABLE "OrganizerYSWSMembership" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "yswsId" TEXT NOT NULL,
    "role" "OrgRole" NOT NULL DEFAULT 'ORGANIZER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizerYSWSMembership_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX "OrganizerYSWSMembership_userId_idx" ON "OrganizerYSWSMembership"("userId");
CREATE INDEX "OrganizerYSWSMembership_yswsId_idx" ON "OrganizerYSWSMembership"("yswsId");

-- Create unique constraint
CREATE UNIQUE INDEX "OrganizerYSWSMembership_orgId_userId_yswsId_key" ON "OrganizerYSWSMembership"("orgId", "userId", "yswsId");

-- Add foreign keys
ALTER TABLE "OrganizerYSWSMembership" ADD CONSTRAINT "OrganizerYSWSMembership_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OrganizerYSWSMembership" ADD CONSTRAINT "OrganizerYSWSMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OrganizerYSWSMembership" ADD CONSTRAINT "OrganizerYSWSMembership_yswsId_fkey" FOREIGN KEY ("yswsId") REFERENCES "YSWS"("id") ON DELETE CASCADE ON UPDATE CASCADE;