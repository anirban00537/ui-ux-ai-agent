/*
  Warnings:

  - You are about to drop the `screens` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "screens" DROP CONSTRAINT "screens_designId_fkey";

-- AlterTable
ALTER TABLE "designs" ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'mobile_app';

-- DropTable
DROP TABLE "screens";

-- CreateTable
CREATE TABLE "artboards" (
    "id" TEXT NOT NULL,
    "designId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "html" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "artboards_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "artboards" ADD CONSTRAINT "artboards_designId_fkey" FOREIGN KEY ("designId") REFERENCES "designs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
