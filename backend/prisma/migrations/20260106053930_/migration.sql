-- AlterTable
ALTER TABLE "layouts" ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "layouts_published_idx" ON "layouts"("published");
