-- AlterTable
ALTER TABLE "Ride" ADD COLUMN     "shareEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "shareableSeats" INTEGER NOT NULL DEFAULT 0;
