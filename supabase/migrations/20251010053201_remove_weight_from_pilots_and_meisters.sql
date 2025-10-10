/*
  # Remove weight field from pilots and meisters tables

  ## Changes Made
  
  1. **Pilots Table**
    - Remove `weight_kg` column (weight is not needed for pilots)
  
  2. **Meisters Table**
    - Remove `weight_kg` column (weight is not needed for festival organizers)
  
  3. **Passengers Table**
    - Keep `weight_kg` column (passengers need to provide weight for balloon capacity planning)

  ## Notes
  - Weight information is only relevant for passengers who will be flying
  - Pilots and meisters (festival organizers) do not need weight tracking
*/

-- Remove weight_kg column from pilots table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pilots' AND column_name = 'weight_kg'
  ) THEN
    ALTER TABLE pilots DROP COLUMN weight_kg;
  END IF;
END $$;

-- Remove weight_kg column from meisters table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meisters' AND column_name = 'weight_kg'
  ) THEN
    ALTER TABLE meisters DROP COLUMN weight_kg;
  END IF;
END $$;
