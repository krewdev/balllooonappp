/*
  Warnings:

  - Made the column `location` on table `Passenger` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phone` on table `Passenger` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "flightId" TEXT NOT NULL,
    "passengerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Booking_flightId_fkey" FOREIGN KEY ("flightId") REFERENCES "Flight" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Booking_passengerId_fkey" FOREIGN KEY ("passengerId") REFERENCES "Passenger" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Passenger" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "fullName" TEXT,
    "phone" TEXT NOT NULL,
    "weightKg" INTEGER,
    "location" TEXT NOT NULL,
    "maxDistance" INTEGER,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "smsNotifications" BOOLEAN NOT NULL DEFAULT true,
    "smsConsent" BOOLEAN NOT NULL DEFAULT false,
    "pilotId" TEXT,
    "meisterId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Passenger_pilotId_fkey" FOREIGN KEY ("pilotId") REFERENCES "Pilot" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Passenger_meisterId_fkey" FOREIGN KEY ("meisterId") REFERENCES "Meister" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Passenger" ("createdAt", "email", "emailNotifications", "fullName", "id", "location", "maxDistance", "meisterId", "passwordHash", "phone", "pilotId", "smsNotifications", "updatedAt", "weightKg") SELECT "createdAt", "email", "emailNotifications", "fullName", "id", "location", "maxDistance", "meisterId", "passwordHash", "phone", "pilotId", "smsNotifications", "updatedAt", "weightKg" FROM "Passenger";
DROP TABLE "Passenger";
ALTER TABLE "new_Passenger" RENAME TO "Passenger";
CREATE UNIQUE INDEX "Passenger_email_key" ON "Passenger"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
