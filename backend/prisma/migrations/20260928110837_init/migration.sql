-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('PASSENGER', 'DRIVER');

-- CreateEnum
CREATE TYPE "VehicleStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "RideRequestStatus" AS ENUM ('REQUESTED', 'ACCEPTED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RideStatus" AS ENUM ('MATCHED', 'DRIVER_ARRIVED', 'STARTED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ShareRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PassengerStatus" AS ENUM ('CONFIRMED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "FareStatus" AS ENUM ('ESTIMATED', 'FINAL', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'TESLA_PAY');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- CreateTable
CREATE TABLE "User" (
    "userId" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "phone" TEXT,
    "role" "UserRole" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Passenger" (
    "passengerId" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Passenger_pkey" PRIMARY KEY ("passengerId")
);

-- CreateTable
CREATE TABLE "Driver" (
    "driverId" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Driver_pkey" PRIMARY KEY ("driverId")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "vehicleId" SERIAL NOT NULL,
    "driverId" INTEGER NOT NULL,
    "vehicleName" TEXT NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "totalSeats" INTEGER NOT NULL,
    "vehicleStatus" "VehicleStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("vehicleId")
);

-- CreateTable
CREATE TABLE "RideRequest" (
    "requestId" SERIAL NOT NULL,
    "passengerId" INTEGER NOT NULL,
    "pickupLocation" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "requestedSeats" INTEGER NOT NULL,
    "estimatedFare" INTEGER NOT NULL,
    "requestStatus" "RideRequestStatus" NOT NULL DEFAULT 'REQUESTED',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelledAt" TIMESTAMP(3),

    CONSTRAINT "RideRequest_pkey" PRIMARY KEY ("requestId")
);

-- CreateTable
CREATE TABLE "Ride" (
    "rideId" SERIAL NOT NULL,
    "requestId" INTEGER NOT NULL,
    "originalPassengerId" INTEGER NOT NULL,
    "driverId" INTEGER NOT NULL,
    "vehicleId" INTEGER NOT NULL,
    "rideStatus" "RideStatus" NOT NULL DEFAULT 'MATCHED',
    "isShared" BOOLEAN NOT NULL DEFAULT false,
    "totalFarePaisa" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Ride_pkey" PRIMARY KEY ("rideId")
);

-- CreateTable
CREATE TABLE "ShareRequest" (
    "shareRequestId" SERIAL NOT NULL,
    "rideId" INTEGER NOT NULL,
    "requestingPassengerId" INTEGER NOT NULL,
    "pickupLocation" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "requestedSeats" INTEGER NOT NULL,
    "requestStatus" "ShareRequestStatus" NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),

    CONSTRAINT "ShareRequest_pkey" PRIMARY KEY ("shareRequestId")
);

-- CreateTable
CREATE TABLE "RidePassenger" (
    "ridePassengerId" SERIAL NOT NULL,
    "rideId" INTEGER NOT NULL,
    "passengerId" INTEGER NOT NULL,
    "pickupLocation" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "requestedSeats" INTEGER NOT NULL,
    "passengerStatus" "PassengerStatus" NOT NULL DEFAULT 'CONFIRMED',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),
    "shareRequestId" INTEGER,

    CONSTRAINT "RidePassenger_pkey" PRIMARY KEY ("ridePassengerId")
);

-- CreateTable
CREATE TABLE "Fare" (
    "fareId" SERIAL NOT NULL,
    "ridePassengerId" INTEGER NOT NULL,
    "baseFare" INTEGER NOT NULL,
    "distanceCharge" INTEGER NOT NULL,
    "poolDiscount" INTEGER NOT NULL DEFAULT 0,
    "totalAmountPaisa" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BDT',
    "fareStatus" "FareStatus" NOT NULL DEFAULT 'ESTIMATED',
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Fare_pkey" PRIMARY KEY ("fareId")
);

-- CreateTable
CREATE TABLE "Payment" (
    "paymentId" SERIAL NOT NULL,
    "fareId" INTEGER NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "amountPaisa" INTEGER NOT NULL,
    "transactionReference" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("paymentId")
);

-- CreateTable
CREATE TABLE "RideStatusHistory" (
    "historyId" SERIAL NOT NULL,
    "rideId" INTEGER NOT NULL,
    "fromStatus" "RideStatus",
    "toStatus" "RideStatus" NOT NULL,
    "changedBy" INTEGER NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,

    CONSTRAINT "RideStatusHistory_pkey" PRIMARY KEY ("historyId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Passenger_userId_key" ON "Passenger"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Driver_userId_key" ON "Driver"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_driverId_key" ON "Vehicle"("driverId");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_licenseNumber_key" ON "Vehicle"("licenseNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Ride_requestId_key" ON "Ride"("requestId");

-- CreateIndex
CREATE UNIQUE INDEX "RidePassenger_shareRequestId_key" ON "RidePassenger"("shareRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "RidePassenger_rideId_passengerId_key" ON "RidePassenger"("rideId", "passengerId");

-- CreateIndex
CREATE UNIQUE INDEX "Fare_ridePassengerId_key" ON "Fare"("ridePassengerId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_fareId_key" ON "Payment"("fareId");

-- AddForeignKey
ALTER TABLE "Passenger" ADD CONSTRAINT "Passenger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("driverId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RideRequest" ADD CONSTRAINT "RideRequest_passengerId_fkey" FOREIGN KEY ("passengerId") REFERENCES "Passenger"("passengerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ride" ADD CONSTRAINT "Ride_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "RideRequest"("requestId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ride" ADD CONSTRAINT "Ride_originalPassengerId_fkey" FOREIGN KEY ("originalPassengerId") REFERENCES "Passenger"("passengerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ride" ADD CONSTRAINT "Ride_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("driverId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ride" ADD CONSTRAINT "Ride_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("vehicleId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareRequest" ADD CONSTRAINT "ShareRequest_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "Ride"("rideId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareRequest" ADD CONSTRAINT "ShareRequest_requestingPassengerId_fkey" FOREIGN KEY ("requestingPassengerId") REFERENCES "Passenger"("passengerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RidePassenger" ADD CONSTRAINT "RidePassenger_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "Ride"("rideId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RidePassenger" ADD CONSTRAINT "RidePassenger_passengerId_fkey" FOREIGN KEY ("passengerId") REFERENCES "Passenger"("passengerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RidePassenger" ADD CONSTRAINT "RidePassenger_shareRequestId_fkey" FOREIGN KEY ("shareRequestId") REFERENCES "ShareRequest"("shareRequestId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fare" ADD CONSTRAINT "Fare_ridePassengerId_fkey" FOREIGN KEY ("ridePassengerId") REFERENCES "RidePassenger"("ridePassengerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_fareId_fkey" FOREIGN KEY ("fareId") REFERENCES "Fare"("fareId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RideStatusHistory" ADD CONSTRAINT "RideStatusHistory_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "Ride"("rideId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RideStatusHistory" ADD CONSTRAINT "RideStatusHistory_changedBy_fkey" FOREIGN KEY ("changedBy") REFERENCES "Driver"("driverId") ON DELETE RESTRICT ON UPDATE CASCADE;
