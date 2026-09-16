-- AlterTable
ALTER TABLE "presentations" ADD COLUMN "shareToken" TEXT,
ADD COLUMN "shareEnabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "presentations_shareToken_key" ON "presentations"("shareToken");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "presentations_shareToken_idx" ON "presentations"("shareToken");
