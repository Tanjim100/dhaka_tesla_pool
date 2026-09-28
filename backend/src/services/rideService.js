const prisma = require("../config/database");
const { findShortestPath } = require("./graphService");

const createRideRequest = async ({
    userId,
    pickupNodeId,
    destinationNodeId,
    requestedSeats
}) => {
    // Find passenger profile
    const passenger = await prisma.passenger.findUnique({
        where: { userId }
    });

    if (!passenger) {
        throw new Error("Passenger profile not found");
    }

    // Validate seats
    if (!Number.isInteger(requestedSeats) || requestedSeats <= 0) {
        throw new Error("Requested seats must be greater than 0");
    }

    // Source and destination cannot be same
    if (pickupNodeId === destinationNodeId) {
        throw new Error("Pickup and destination cannot be the same");
    }

    // Check that both nodes exist
    const nodes = await prisma.graphNode.findMany({
        where: {
            nodeId: {
                in: [pickupNodeId, destinationNodeId]
            }
        }
    });

    if (nodes.length !== 2) {
        throw new Error("Invalid pickup or destination node");
    }

    // Find shortest route and fare
    const route = await findShortestPath(
        pickupNodeId,
        destinationNodeId
    );

    // Create ride request
    const rideRequest = await prisma.rideRequest.create({
        data: {
            passengerId: passenger.passengerId,
            pickupNodeId,
            destinationNodeId,
            requestedSeats,
            estimatedFare: route.totalFarePaisa,
            requestStatus: "REQUESTED"
        },
        include: {
            pickupNode: true,
            destinationNode: true
        }
    });

    return {
        rideRequest,
        route: route.path,
        totalFarePaisa: route.totalFarePaisa
    };
};




const acceptRideRequest = async ({
    driverUserId,
    requestId
}) => {
    const driver = await prisma.driver.findUnique({
        where: { userId: driverUserId },
        include: {
            vehicle: true
        }
    });

    if (!driver) {
        throw new Error("Driver profile not found");
    }

    if (!driver.isOnline) {
        throw new Error("Driver is offline");
    }

    if (!driver.vehicle) {
        throw new Error("Driver has no vehicle");
    }

    if (driver.vehicle.vehicleStatus !== "ACTIVE") {
        throw new Error("Vehicle is not active");
    }

    // const result = await prisma.$transaction(async (tx) => {
    //     // Lock/check the request inside transaction
    //     const rideRequest = await tx.rideRequest.findUnique({
    //         where: { requestId }
    //     });

    //     if (!rideRequest) {
    //         throw new Error("Ride request not found");
    //     }

    //     if (rideRequest.requestStatus !== "REQUESTED") {
    //         throw new Error("Ride request is no longer available");
    //     }

    //     // Find shortest route again
    //     const route = await findShortestPath(
    //         rideRequest.pickupNodeId,
    //         rideRequest.destinationNodeId
    //     );

    //     // Update request
    //     await tx.rideRequest.update({
    //         where: { requestId },
    //         data: {
    //             requestStatus: "ACCEPTED"
    //         }
    //     });

    //     // Create ride
    //     const ride = await tx.ride.create({
    //         data: {
    //             requestId: rideRequest.requestId,
    //             originalPassengerId: rideRequest.passengerId,
    //             driverId: driver.driverId,
    //             vehicleId: driver.vehicle.vehicleId,
    //             rideStatus: "MATCHED",
    //             isShared: false,
    //             totalFarePaisa: rideRequest.estimatedFare,

    //             passengers: {
    //                 create: {
    //                     passengerId: rideRequest.passengerId,
    //                     pickupNodeId: rideRequest.pickupNodeId,
    //                     destinationNodeId: rideRequest.destinationNodeId,
    //                     requestedSeats: rideRequest.requestedSeats,
    //                     passengerStatus: "CONFIRMED"
    //                 }
    //             },

    //             routeNodes: {
    //                 create: route.path.map((nodeId, index) => ({
    //                     nodeId,
    //                     sequence: index
    //                 }))
    //             },

    //             statusHistory: {
    //                 create: {
    //                     fromStatus: null,
    //                     toStatus: "MATCHED",
    //                     changedBy: driver.driverId,
    //                     note: "Ride request accepted by driver"
    //                 }
    //             }
    //         },
    //         include: {
    //             passengers: true,
    //             routeNodes: {
    //                 orderBy: {
    //                     sequence: "asc"
    //                 }
    //             }
    //         }
    //     });

    //     return ride;
    // });


    const result = await prisma.$transaction(async (tx) => {
        const rideRequest = await tx.rideRequest.findUnique({
            where: { requestId }
        });

        if (!rideRequest) {
            throw new Error("Ride request not found");
        }

        if (rideRequest.requestStatus !== "REQUESTED") {
            throw new Error("Ride request is no longer available");
        }

        // Lock the vehicle row
        const vehicleRows = await tx.$queryRaw`
        SELECT *
        FROM "Vehicle"
        WHERE "vehicleId" = ${driver.vehicle.vehicleId}
        FOR UPDATE
    `;

        if (vehicleRows.length === 0) {
            throw new Error("Vehicle not found");
        }

        const vehicle = vehicleRows[0];

        // Calculate already reserved seats
        const seatResult = await tx.ridePassenger.aggregate({
            _sum: {
                requestedSeats: true
            },
            where: {
                ride: {
                    vehicleId: vehicle.vehicleId,
                    rideStatus: {
                        in: ["MATCHED", "DRIVER_ARRIVED", "STARTED"]
                    }
                },
                passengerStatus: "CONFIRMED"
            }
        });

        const usedSeats = seatResult._sum.requestedSeats || 0;

        const availableSeats = vehicle.totalSeats - usedSeats;

        if (rideRequest.requestedSeats > availableSeats) {
            throw new Error("Not enough seats available");
        }

        // Find route
        const route = await findShortestPath(
            rideRequest.pickupNodeId,
            rideRequest.destinationNodeId
        );

        // Accept request
        await tx.rideRequest.update({
            where: { requestId },
            data: {
                requestStatus: "ACCEPTED"
            }
        });

        // Create ride
        const ride = await tx.ride.create({
            data: {
                requestId: rideRequest.requestId,
                originalPassengerId: rideRequest.passengerId,
                driverId: driver.driverId,
                vehicleId: vehicle.vehicleId,
                rideStatus: "MATCHED",
                isShared: false,
                totalFarePaisa: rideRequest.estimatedFare,

                passengers: {
                    create: {
                        passengerId: rideRequest.passengerId,
                        pickupNodeId: rideRequest.pickupNodeId,
                        destinationNodeId: rideRequest.destinationNodeId,
                        requestedSeats: rideRequest.requestedSeats,
                        passengerStatus: "CONFIRMED"
                    }
                },

                routeNodes: {
                    create: route.path.map((nodeId, index) => ({
                        nodeId,
                        sequence: index
                    }))
                },

                statusHistory: {
                    create: {
                        fromStatus: null,
                        toStatus: "MATCHED",
                        changedBy: driver.driverId,
                        note: "Ride request accepted by driver"
                    }
                }
            },
            include: {
                passengers: true,
                routeNodes: {
                    orderBy: {
                        sequence: "asc"
                    }
                }
            }
        });

        return ride;
    });

    return result;
};




const updateRideSharing = async ({
    userId,
    rideId,
    shareEnabled,
    shareableSeats
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

    // Only original passenger can control sharing
    if (ride.originalPassengerId !== passenger.passengerId) {
        throw new Error(
            "Only the original passenger can control ride sharing"
        );
    }

    if (ride.rideStatus !== "MATCHED") {
        throw new Error(
            "Sharing can only be changed before the ride starts"
        );
    }

    if (!shareEnabled) {
        return await prisma.ride.update({
            where: { rideId },
            data: {
                shareEnabled: false,
                shareableSeats: 0
            }
        });
    }

    if (
        !Number.isInteger(shareableSeats) ||
        shareableSeats <= 0
    ) {
        throw new Error(
            "Shareable seats must be greater than 0"
        );
    }

    // Original passenger must keep at least 1 seat
    if (shareableSeats >= ride.vehicle.totalSeats) {
        throw new Error(
            "Original passenger must keep at least 1 seat"
        );
    }

    const updatedRide = await prisma.ride.update({
        where: { rideId },
        data: {
            shareEnabled: true,
            shareableSeats
        }
    });

    return updatedRide;
};



module.exports = {
    createRideRequest,
    acceptRideRequest,
    updateRideSharing,
};