const prisma = require("../config/database");

const createRideRequest = async ({
    passengerId,
    pickupLocation,
    destination,
    requestedSeats
}) => {

    const estimatedFare = 30000; // 300 BDT for now

    const rideRequest = await prisma.rideRequest.create({
        data: {
            passengerId,
            pickupLocation,
            destination,
            requestedSeats,
            estimatedFare,
            requestStatus: "REQUESTED"
        }
    });

    return rideRequest;
};

module.exports = {
    createRideRequest
};