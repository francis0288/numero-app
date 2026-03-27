-- AlterTable: add readingMode and isPrivate to Reading
ALTER TABLE "Reading" ADD COLUMN "reading_mode" TEXT NOT NULL DEFAULT 'warm';
ALTER TABLE "Reading" ADD COLUMN "is_private" BOOLEAN NOT NULL DEFAULT false;

-- Backfill readingMode from tone (warm→warm, practical→practical, analytical→practical, spiritual→warm)
UPDATE "Reading"
SET "reading_mode" = CASE
  WHEN "tone" = 'practical'   THEN 'practical'
  WHEN "tone" = 'analytical'  THEN 'practical'
  ELSE 'warm'
END;
