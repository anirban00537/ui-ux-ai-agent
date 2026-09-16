-- 1. Rename tables
ALTER TABLE IF EXISTS "presentations" RENAME TO "docs";
ALTER TABLE IF EXISTS "slides" RENAME TO "cards";
ALTER TABLE IF EXISTS "presentation_versions" RENAME TO "doc_versions";
ALTER TABLE IF EXISTS "presentation_analytics" RENAME TO "doc_analytics";
ALTER TABLE IF EXISTS "presentation_views" RENAME TO "doc_views";

-- 2. Rename columns in referencing tables
ALTER TABLE IF EXISTS "doc_versions" RENAME COLUMN "presentationId" TO "docId";
ALTER TABLE IF EXISTS "cards" RENAME COLUMN "presentationId" TO "docId";
ALTER TABLE IF EXISTS "doc_analytics" RENAME COLUMN "presentationId" TO "docId";
ALTER TABLE IF EXISTS "doc_views" RENAME COLUMN "presentationId" TO "docId";
ALTER TABLE IF EXISTS "ai_usages" RENAME COLUMN "presentationId" TO "docId";
ALTER TABLE IF EXISTS "credit_transactions" RENAME COLUMN "presentationId" TO "docId";

-- 3. Add new columns to docs and cards
ALTER TABLE IF EXISTS "docs" ADD COLUMN IF NOT EXISTS "prompt" TEXT;
ALTER TABLE IF EXISTS "docs" ADD COLUMN IF NOT EXISTS "numberOfCards" INTEGER;
ALTER TABLE IF EXISTS "docs" ADD COLUMN IF NOT EXISTS "outlineStatus" VARCHAR(50) DEFAULT 'none';
ALTER TABLE IF EXISTS "cards" ADD COLUMN IF NOT EXISTS "outline" JSONB;

-- 4. Migrate data from outlines table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'outlines') THEN
        UPDATE "docs" d
        SET 
            "prompt" = o."prompt",
            "numberOfCards" = o."numberOfSlides",
            "outlineStatus" = o."status"
        FROM "outlines" o
        WHERE o."presentationId" = d."id";
        
        DROP TABLE "outlines";
    END IF;
END $$;

-- 5. Drop unnecessary columns
ALTER TABLE IF EXISTS "ai_usages" DROP COLUMN IF EXISTS "outlineId";
