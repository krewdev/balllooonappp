-- Convert existing weight data from kg to lbs, then rename columns
-- Note: 1 kg = 2.20462 lbs

-- Update Passenger table: convert kg to lbs (multiply by 2.20462 and round)
UPDATE "Passenger" SET "weightKg" = ROUND("weightKg" * 2.20462) WHERE "weightKg" IS NOT NULL;

-- Rename column in Passenger table
ALTER TABLE "Passenger" RENAME COLUMN "weightKg" TO "weightLbs";

-- Update Pilot table: convert kg to lbs (multiply by 2.20462 and round)
UPDATE "Pilot" SET "weightKg" = ROUND("weightKg" * 2.20462) WHERE "weightKg" IS NOT NULL;

-- Rename column in Pilot table
ALTER TABLE "Pilot" RENAME COLUMN "weightKg" TO "weightLbs";

