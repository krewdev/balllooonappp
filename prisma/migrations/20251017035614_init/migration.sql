-- CreateTable
CREATE TABLE "Pilot" (
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Passenger" (
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Flight" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pilotId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" DATETIME NOT NULL,
    "location" TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "maxPassengers" INTEGER NOT NULL,
    "stripeProductId" TEXT,
    "stripePriceId" TEXT,
    "stripePayLink" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Flight_pilotId_fkey" FOREIGN KEY ("pilotId") REFERENCES "Pilot" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Pilot_email_key" ON "Pilot"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Passenger_email_key" ON "Passenger"("email");
