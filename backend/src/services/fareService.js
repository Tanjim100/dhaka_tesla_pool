const prisma = require("../config/database");
const { findShortestPath } = require("./graphService");

const calculateRideFares = async (rideId, tx = prisma) => {
    const ride = await tx.ride.findUnique({
        where: { rideId },
        include: {
            passengers: true
        }
    });

    if (!ride) {
        throw new Error("Ride not found");
    }

    if (ride.passengers.length === 0) {
        throw new Error("No passengers found");
    }

    // Find route for every passenger
    const passengerRoutes = [];

    for (const passenger of ride.passengers) {
        const route = await findShortestPath(
            passenger.pickupNodeId,
            passenger.destinationNodeId
        );

        passengerRoutes.push({
            ridePassengerId: passenger.ridePassengerId,
            path: route.path
        });
    }

    // Count how many passengers use each edge
    const edgePassengers = new Map();

    for (const passengerRoute of passengerRoutes) {
        const path = passengerRoute.path;

        for (let i = 0; i < path.length - 1; i++) {
            const from = path[i];
            const to = path[i + 1];

            const edgeKey = `${from}-${to}`;

            if (!edgePassengers.has(edgeKey)) {
                edgePassengers.set(edgeKey, []);
            }

            edgePassengers
                .get(edgeKey)
                .push(passengerRoute.ridePassengerId);
        }
    }

    // Get all graph edges
    const edges = await tx.graphEdge.findMany();

    // Build fare lookup for both directions
    const edgeFareMap = new Map();

    for (const edge of edges) {
        edgeFareMap.set(
            `${edge.fromNodeId}-${edge.toNodeId}`,
            edge.farePaisa
        );

        edgeFareMap.set(
            `${edge.toNodeId}-${edge.fromNodeId}`,
            edge.farePaisa
        );
    }

    // Calculate each passenger's fare
    const passengerFares = new Map();

    for (const passengerRoute of passengerRoutes) {
        let totalFare = 0;

        const path = passengerRoute.path;

        for (let i = 0; i < path.length - 1; i++) {
            const from = path[i];
            const to = path[i + 1];

            const edgeKey = `${from}-${to}`;

            const edgeFare = edgeFareMap.get(edgeKey);

            if (edgeFare === undefined) {
                throw new Error(
                    `Fare not found for edge ${from}-${to}`
                );
            }

            const usersOnEdge =
                edgePassengers.get(edgeKey).length;

            totalFare += Math.floor(
                edgeFare / usersOnEdge
            );
        }

        passengerFares.set(
            passengerRoute.ridePassengerId,
            totalFare
        );
    }

    // Make sure allocated fares equal original ride fare
    const allocatedTotal = Array.from(
        passengerFares.values()
    ).reduce((sum, fare) => sum + fare, 0);

    if (allocatedTotal !== ride.totalFarePaisa) {
        throw new Error(
            `Fare allocation mismatch. Expected ${ride.totalFarePaisa}, got ${allocatedTotal}`
        );
    }

    // Save fares
    const fares = [];

    for (const [ridePassengerId, totalAmountPaisa] of passengerFares) {
        const fare = await tx.fare.upsert({
            where: {
                ridePassengerId
            },
            update: {
                baseFare: 0,
                distanceCharge: totalAmountPaisa,
                totalAmountPaisa,
                fareStatus: "ESTIMATED",
                calculatedAt: new Date()
            },
            create: {
                ridePassengerId,
                baseFare: 0,
                distanceCharge: totalAmountPaisa,
                totalAmountPaisa,
                fareStatus: "ESTIMATED"
            }
        });

        fares.push(fare);
    }

    return fares;
};

module.exports = {
    calculateRideFares
};