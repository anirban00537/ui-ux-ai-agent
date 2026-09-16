-- DropIndex
DROP INDEX IF EXISTS "presentations_shareToken_key";
DROP INDEX IF EXISTS "presentations_shareToken_idx";

-- AlterTable
ALTER TABLE "presentations" DROP COLUMN IF EXISTS "shareToken";
