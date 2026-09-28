ALTER TABLE "User" ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");

ALTER TABLE "Event" ADD COLUMN "deletedAt" TIMESTAMP(3);
UPDATE "Event" SET "deletedAt" = CURRENT_TIMESTAMP WHERE "isDeleted" = true;
ALTER TABLE "Event" DROP COLUMN "isDeleted";
CREATE INDEX "Event_deletedAt_idx" ON "Event"("deletedAt");

ALTER TABLE "Order" ADD COLUMN "deletedAt" TIMESTAMP(3);
CREATE INDEX "Order_deletedAt_idx" ON "Order"("deletedAt");

ALTER TABLE "Ticket" ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "Ticket" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
CREATE INDEX "Ticket_deletedAt_idx" ON "Ticket"("deletedAt");

