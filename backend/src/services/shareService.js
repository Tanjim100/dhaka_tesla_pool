const prisma = require("../config/database");

const createShareRequest = async ({
    userId,
    rideId,
    pickupNodeId,
    destinationNodeId,
    requestedSeats
}) => {
    const passenger = await prisma.passenger.findUnique({
        where: { userId }
    });

    if (!passenger) {
        throw new Error("Passenger profile not found");
    }

    const ride = await prisma.ride.findUnique({
        where: { rideId },
        include: {
            vehicle: true
        }
    });

    if (!ride) {
        throw new Error("Ride not found");
    }

    if (!ride.shareEnabled) {
        throw new Error("Ride sharing is not enabled");
    }

    if (ride.rideStatus !== "MATCHED") {
        throw new Error(
            "This ride is not available for sharing"
        );
    }

    if (ride.originalPassengerId === passenger.passengerId) {
        throw new Error(
            "Original passenger cannot create a share request"
        );
    }

    if (
        !Number.isInteger(requestedSeats) ||
        requestedSeats <= 0
    ) {
        throw new Error(
            "Requested seats must be greater than 0"
        );
    }

    if (requestedSeats > ride.shareableSeats) {
        throw new Error(
            "Requested seats exceed available sharing seats"
        );
    }

    if (pickupNodeId === destinationNodeId) {
        throw new Error(
            "Pickup and destination cannot be the same"
        );
    }

    // Validate nodes
    const nodes = await prisma.graphNode.findMany({
        where: {
            nodeId: {
                in: [pickupNodeId, destinationNodeId]
            }
        }
    });

    if (nodes.length !== 2) {
        throw new Error(
            "Invalid pickup or destination node"
        );
    }

    // Make sure route exists
    const { findShortestPath } = require("./graphService");

    await findShortestPath(
        pickupNodeId,
        destinationNodeId
    );

    // Prevent duplicate pending request
    const existingRequest =
        await prisma.shareRequest.findFirst({
            where: {
                rideId,
                requestingPassengerId:
                    passenger.passengerId,
                requestStatus: "PENDING"
            }
        });

    if (existingRequest) {
        throw new Error(
            "You already have a pending share request"
        );
    }

    const shareRequest =
        await prisma.shareRequest.create({
            data: {
                rideId,
                requestingPassengerId:
                    passenger.passengerId,
                pickupNodeId,
                destinationNodeId,
                requestedSeats,
                requestStatus: "PENDING"
            },
            include: {
                pickupNode: true,
                destinationNode: true
            }
        });

    return shareRequest;
};



const getPendingShareRequests = async ({
    userId,
    rideId
}) => {
    const passenger = await prisma.passenger.findUnique({
        where: { userId }
    });

    if (!passenger) {
        throw new Error("Passenger profile not found");
    }

    const ride = await prisma.ride.findUnique({
        where: { rideId }
    });

    if (!ride) {
        throw new Error("Ride not found");
    }

    if (ride.originalPassengerId !== passenger.passengerId) {
        throw new Error(
            "Only the original passenger can view share requests"
        );
    }

    return await prisma.shareRequest.findMany({
        where: {
            rideId,
            requestStatus: "PENDING"
        },
        include: {
            requestingPassenger: {
                include: {
                    user: {
                        select: {
                            userId: true,
                            name: true,
                            email: true
                        }
                    }
                }
            },
            pickupNode: true,
            destinationNode: true
        },
        orderBy: {
            requestedAt: "asc"
        }
    });
};


const respondToShareRequest = async ({
    userId,
    shareRequestId,
    decision
}) => {
    const passenger = await prisma.passenger.findUnique({
        where: { userId }
    });

    if (!passenger) {
        throw new Error("Passenger profile not found");
    }

    const shareRequest = await prisma.shareRequest.findUnique({
        where: { shareRequestId },
        include: {
            ride: true
        }
    });

    if (!shareRequest) {
        throw new Error("Share request not found");
    }

    // Only original passenger can accept/reject
    if (
        shareRequest.ride.originalPassengerId !==
        passenger.passengerId
    ) {
        throw new Error(
            "Only the original passenger can respond to this request"
        );
    }

    if (shareRequest.requestStatus !== "PENDING") {
        throw new Error(
            "Share request is no longer pending"
        );
    }

    if (!["ACCEPTED", "REJECTED"].includes(decision)) {
        throw new Error(
            "Decision must be ACCEPTED or REJECTED"
        );
    }

    // If rejected, simply update status
    if (decision === "REJECTED") {
        return await prisma.shareRequest.update({
            where: { shareRequestId },
            data: {
                requestStatus: "REJECTED",
                respondedAt: new Date()
            }
        });
    }

    // Accept request inside transaction
    const result = await prisma.$transaction(async (tx) => {
        const ride = await tx.ride.findUnique({
            where: { rideId: shareRequest.rideId }
        });

        if (!ride) {
            throw new Error("Ride not found");
        }

        if (!ride.shareEnabled) {
            throw new Error("Ride sharing is disabled");
        }

        if (
            shareRequest.requestedSeats >
            ride.shareableSeats
        ) {
            throw new Error(
                "Not enough shareable seats available"
            );
        }

        const updatedRequest =
            await tx.shareRequest.update({
                where: { shareRequestId },
                data: {
                    requestStatus: "ACCEPTED",
                    respondedAt: new Date()
                }
            });

        const ridePassenger =
            await tx.ridePassenger.create({
                data: {
                    rideId: ride.rideId,
                    passengerId:
                        shareRequest.requestingPassengerId,
                    pickupNodeId:
                        shareRequest.pickupNodeId,
                    destinationNodeId:
                        shareRequest.destinationNodeId,
                    requestedSeats:
                        shareRequest.requestedSeats,
                    passengerStatus: "CONFIRMED",
                    shareRequestId:
                        shareRequest.shareRequestId
                }
            });

        const updatedRide = await tx.ride.update({
            where: { rideId: ride.rideId },
            data: {
                isShared: true,
                shareableSeats: {
                    decrement:
                        shareRequest.requestedSeats
                }
            }
        });

        return {
            shareRequest: updatedRequest,
            ridePassenger,
            ride: updatedRide
        };
    });

    return result;
};





module.exports = {
    createShareRequest,
    getPendingShareRequests,
    respondToShareRequest,
};