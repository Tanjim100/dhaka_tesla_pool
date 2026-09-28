/*
  Warnings:

  - You are about to drop the column `poolDiscount` on the `Fare` table. All the data in the column will be lost.
  - You are about to drop the column `destination` on the `RidePassenger` table. All the data in the column will be lost.
  - You are about to drop the column `pickupLocation` on the `RidePassenger` table. All the data in the column will be lost.
  - You are about to drop the column `destination` on the `RideRequest` table. All the data in the column will be lost.
  - You are about to drop the column `pickupLocation` on the `RideRequest` table. All the data in the column will be lost.
  - You are about to drop the column `destination` on the `ShareRequest` table. All the data in the column will be lost.
  - You are about to drop the column `pickupLocation` on the `ShareRequest` table. All the data in the column will be lost.
  - Added the required column `destinationNodeId` to the `RidePassenger` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pickupNodeId` to the `RidePassenger` table without a default value. This is not possible if the table is not empty.
  - Added the required column `destinationNodeId` to the `RideRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pickupNodeId` to the `RideRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `destinationNodeId` to the `ShareRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pickupNodeId` to the `ShareRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Fare" DROP COLUMN "poolDiscount";

-- AlterTable
ALTER TABLE "RidePassenger" DROP COLUMN "destination",
DROP COLUMN "pickupLocation",
ADD COLUMN     "destinationNodeId" INTEGER NOT NULL,
ADD COLUMN     "pickupNodeId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "RideRequest" DROP COLUMN "destination",
DROP COLUMN "pickupLocation",
ADD COLUMN     "destinationNodeId" INTEGER NOT NULL,
ADD COLUMN     "pickupNodeId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "ShareRequest" DROP COLUMN "destination",
DROP COLUMN "pickupLocation",
ADD COLUMN     "destinationNodeId" INTEGER NOT NULL,
ADD COLUMN     "pickupNodeId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "GraphNode" (
    "nodeId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GraphNode_pkey" PRIMARY KEY ("nodeId")
);

-- CreateTable
CREATE TABLE "GraphEdge" (
    "edgeId" SERIAL NOT NULL,
    "fromNodeId" INTEGER NOT NULL,
    "toNodeId" INTEGER NOT NULL,
    "farePaisa" INTEGER NOT NULL,

    CONSTRAINT "GraphEdge_pkey" PRIMARY KEY ("edgeId")
);

-- CreateTable
CREATE TABLE "RideRouteNode" (
    "rideRouteNodeId" SERIAL NOT NULL,
    "rideId" INTEGER NOT NULL,
    "nodeId" INTEGER NOT NULL,
    "sequence" INTEGER NOT NULL,

    CONSTRAINT "RideRouteNode_pkey" PRIMARY KEY ("rideRouteNodeId")
);

-- CreateIndex
CREATE UNIQUE INDEX "GraphNode_name_key" ON "GraphNode"("name");

-- CreateIndex
CREATE UNIQUE INDEX "GraphEdge_fromNodeId_toNodeId_key" ON "GraphEdge"("fromNodeId", "toNodeId");

-- CreateIndex
CREATE UNIQUE INDEX "RideRouteNode_rideId_sequence_key" ON "RideRouteNode"("rideId", "sequence");

-- CreateIndex
CREATE UNIQUE INDEX "RideRouteNode_rideId_nodeId_key" ON "RideRouteNode"("rideId", "nodeId");

-- AddForeignKey
ALTER TABLE "GraphEdge" ADD CONSTRAINT "GraphEdge_fromNodeId_fkey" FOREIGN KEY ("fromNodeId") REFERENCES "GraphNode"("nodeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GraphEdge" ADD CONSTRAINT "GraphEdge_toNodeId_fkey" FOREIGN KEY ("toNodeId") REFERENCES "GraphNode"("nodeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RideRequest" ADD CONSTRAINT "RideRequest_pickupNodeId_fkey" FOREIGN KEY ("pickupNodeId") REFERENCES "GraphNode"("nodeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RideRequest" ADD CONSTRAINT "RideRequest_destinationNodeId_fkey" FOREIGN KEY ("destinationNodeId") REFERENCES "GraphNode"("nodeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RideRouteNode" ADD CONSTRAINT "RideRouteNode_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "Ride"("rideId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RideRouteNode" ADD CONSTRAINT "RideRouteNode_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "GraphNode"("nodeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareRequest" ADD CONSTRAINT "ShareRequest_pickupNodeId_fkey" FOREIGN KEY ("pickupNodeId") REFERENCES "GraphNode"("nodeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareRequest" ADD CONSTRAINT "ShareRequest_destinationNodeId_fkey" FOREIGN KEY ("destinationNodeId") REFERENCES "GraphNode"("nodeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RidePassenger" ADD CONSTRAINT "RidePassenger_pickupNodeId_fkey" FOREIGN KEY ("pickupNodeId") REFERENCES "GraphNode"("nodeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RidePassenger" ADD CONSTRAINT "RidePassenger_destinationNodeId_fkey" FOREIGN KEY ("destinationNodeId") REFERENCES "GraphNode"("nodeId") ON DELETE RESTRICT ON UPDATE CASCADE;
