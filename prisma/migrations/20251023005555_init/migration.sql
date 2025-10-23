-- CreateTable
CREATE TABLE "Meister" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT,
    "organizationName" TEXT,
    "contactName" TEXT,
    "phone" TEXT,
    "festivalName" TEXT,
    "festivalLocation" TEXT,
    "festivalDate" DATETIME,
    "serviceTier" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Passenger" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "fullName" TEXT,
    "phone" TEXT,
    "weightKg" INTEGER,
    "location" TEXT,
    "maxDistance" INTEGER,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "smsNotifications" BOOLEAN NOT NULL DEFAULT true,
    "pilotId" TEXT,
    "meisterId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Passenger_pilotId_fkey" FOREIGN KEY ("pilotId") REFERENCES "Pilot" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Passenger_meisterId_fkey" FOREIGN KEY ("meisterId") REFERENCES "Meister" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Passenger" ("createdAt", "email", "emailNotifications", "fullName", "id", "location", "maxDistance", "passwordHash", "phone", "smsNotifications", "updatedAt", "weightKg") SELECT "createdAt", "email", "emailNotifications", "fullName", "id", "location", "maxDistance", "passwordHash", "phone", "smsNotifications", "updatedAt", "weightKg" FROM "Passenger";
DROP TABLE "Passenger";
ALTER TABLE "new_Passenger" RENAME TO "Passenger";
CREATE UNIQUE INDEX "Passenger_email_key" ON "Passenger"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Meister_email_key" ON "Meister"("email");
