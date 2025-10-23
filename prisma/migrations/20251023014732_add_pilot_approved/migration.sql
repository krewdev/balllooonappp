-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Pilot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "fullName" TEXT,
    "phone" TEXT,
    "weightKg" INTEGER,
    "licenseNumber" TEXT,
    "licenseExpiry" DATETIME,
    "yearsExperience" INTEGER,
    "totalFlightHours" INTEGER,
    "insuranceProvider" TEXT,
    "insurancePolicyNumber" TEXT,
    "insuranceExpiry" DATETIME,
    "balloonRegistration" TEXT,
    "balloonCapacity" INTEGER,
    "stripeAccountId" TEXT,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Pilot" ("balloonCapacity", "balloonRegistration", "createdAt", "email", "fullName", "id", "insuranceExpiry", "insurancePolicyNumber", "insuranceProvider", "licenseExpiry", "licenseNumber", "passwordHash", "phone", "stripeAccountId", "totalFlightHours", "updatedAt", "weightKg", "yearsExperience") SELECT "balloonCapacity", "balloonRegistration", "createdAt", "email", "fullName", "id", "insuranceExpiry", "insurancePolicyNumber", "insuranceProvider", "licenseExpiry", "licenseNumber", "passwordHash", "phone", "stripeAccountId", "totalFlightHours", "updatedAt", "weightKg", "yearsExperience" FROM "Pilot";
DROP TABLE "Pilot";
ALTER TABLE "new_Pilot" RENAME TO "Pilot";
CREATE UNIQUE INDEX "Pilot_email_key" ON "Pilot"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
