-- 1. Rename columns
ALTER TABLE "doc_views" RENAME COLUMN "slidesViewed" TO "cardsViewed";

-- 2. Rename Constraints
ALTER TABLE "docs" RENAME CONSTRAINT "presentations_pkey" TO "docs_pkey";
ALTER TABLE "cards" RENAME CONSTRAINT "slides_pkey" TO "cards_pkey";
ALTER TABLE "doc_analytics" RENAME CONSTRAINT "presentation_analytics_pkey" TO "doc_analytics_pkey";
ALTER TABLE "doc_versions" RENAME CONSTRAINT "presentation_versions_pkey" TO "doc_versions_pkey";
ALTER TABLE "doc_views" RENAME CONSTRAINT "presentation_views_pkey" TO "doc_views_pkey";

-- 3. Rename Foreign Keys
ALTER TABLE "docs" RENAME CONSTRAINT "presentations_userId_fkey" TO "docs_userId_fkey";
ALTER TABLE "cards" RENAME CONSTRAINT "slides_presentationId_fkey" TO "cards_docId_fkey";
ALTER TABLE "doc_analytics" RENAME CONSTRAINT "presentation_analytics_presentationId_fkey" TO "doc_analytics_docId_fkey";
ALTER TABLE "doc_versions" RENAME CONSTRAINT "presentation_versions_presentationId_fkey" TO "doc_versions_docId_fkey";
ALTER TABLE "doc_views" RENAME CONSTRAINT "presentation_views_presentationId_fkey" TO "doc_views_docId_fkey";

-- 4. Rename Indexes
ALTER INDEX IF EXISTS "presentations_userId_idx" RENAME TO "docs_userId_idx";
ALTER INDEX IF EXISTS "presentations_ownerId_idx" RENAME TO "docs_ownerId_idx";
ALTER INDEX IF EXISTS "presentations_deletedAt_idx" RENAME TO "docs_deletedAt_idx";
ALTER INDEX IF EXISTS "presentations_isPublic_idx" RENAME TO "docs_isPublic_idx";
ALTER INDEX IF EXISTS "presentations_isTemplate_idx" RENAME TO "docs_isTemplate_idx";
ALTER INDEX IF EXISTS "presentations_createdAt_idx" RENAME TO "docs_createdAt_idx";
ALTER INDEX IF EXISTS "presentations_updatedAt_idx" RENAME TO "docs_updatedAt_idx";
ALTER INDEX IF EXISTS "presentations_parentId_idx" RENAME TO "docs_parentId_idx";
ALTER INDEX IF EXISTS "presentations_forkedFrom_idx" RENAME TO "docs_forkedFrom_idx";

ALTER INDEX IF EXISTS "presentation_versions_presentationId_idx" RENAME TO "doc_versions_docId_idx";
ALTER INDEX IF EXISTS "presentation_versions_createdAt_idx" RENAME TO "doc_versions_createdAt_idx";

ALTER INDEX IF EXISTS "slides_presentationId_idx" RENAME TO "cards_docId_idx";
ALTER INDEX IF EXISTS "slides_presentationId_order_idx" RENAME TO "cards_docId_order_idx";
ALTER INDEX IF EXISTS "slides_deletedAt_idx" RENAME TO "cards_deletedAt_idx";
ALTER INDEX IF EXISTS "slides_createdAt_idx" RENAME TO "cards_createdAt_idx";

ALTER INDEX IF EXISTS "presentation_analytics_viewCount_idx" RENAME TO "doc_analytics_viewCount_idx";
ALTER INDEX IF EXISTS "presentation_analytics_lastViewedAt_idx" RENAME TO "doc_analytics_lastViewedAt_idx";
ALTER INDEX IF EXISTS "presentation_analytics_presentationId_key" RENAME TO "doc_analytics_docId_key";

ALTER INDEX IF EXISTS "presentation_views_presentationId_idx" RENAME TO "doc_views_docId_idx";
ALTER INDEX IF EXISTS "presentation_views_userId_idx" RENAME TO "doc_views_userId_idx";
ALTER INDEX IF EXISTS "presentation_views_viewedAt_idx" RENAME TO "doc_views_viewedAt_idx";
ALTER INDEX IF EXISTS "presentation_views_sessionId_idx" RENAME TO "doc_views_sessionId_idx";

-- 5. Fix defaults
ALTER TABLE "docs" ALTER COLUMN "title" SET DEFAULT 'Untitled Doc';
