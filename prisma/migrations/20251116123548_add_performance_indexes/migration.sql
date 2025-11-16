-- CreateIndex
CREATE INDEX "Booking_flightId_idx" ON "Booking"("flightId");

-- CreateIndex
CREATE INDEX "Booking_passengerId_idx" ON "Booking"("passengerId");

-- CreateIndex
CREATE INDEX "Booking_status_idx" ON "Booking"("status");

-- CreateIndex
CREATE INDEX "Flight_pilotId_idx" ON "Flight"("pilotId");

-- CreateIndex
CREATE INDEX "Flight_date_idx" ON "Flight"("date");

-- CreateIndex
CREATE INDEX "Passenger_phone_idx" ON "Passenger"("phone");

-- CreateIndex
CREATE INDEX "Pilot_approved_idx" ON "Pilot"("approved");

-- CreateIndex
CREATE INDEX "Pilot_stripeAccountId_idx" ON "Pilot"("stripeAccountId");
