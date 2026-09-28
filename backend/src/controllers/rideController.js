const { 
    createRideRequest,
    acceptRideRequest,
    updateRideSharing
 } = require("../services/rideService");

const createRequest = async (req, res) => {
    try {
        const {
            pickupNodeId,
            destinationNodeId,
            requestedSeats
        } = req.body;

        const userId = req.user.userId;

        const result = await createRideRequest({
            userId,
            pickupNodeId: Number(pickupNodeId),
            destinationNodeId: Number(destinationNodeId),
            requestedSeats: Number(requestedSeats)
        });

        res.status(201).json({
            success: true,
            message: "Ride request created successfully",
            rideRequest: result.rideRequest,
            route: result.route,
            totalFarePaisa: result.totalFarePaisa
        });
    } catch (error) {
        console.error(error);

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};



const acceptRequest = async (req, res) => {
    try {
        const requestId = Number(req.params.requestId);

        const ride = await acceptRideRequest({
            driverUserId: req.user.userId,
            requestId
        });

        res.status(201).json({
            success: true,
            message: "Ride request accepted successfully",
            ride
        });
    } catch (error) {
        console.error(error);

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


const updateSharing = async (req, res) => {
    try {
        const rideId = Number(req.params.rideId);

        const {
            shareEnabled,
            shareableSeats
        } = req.body;

        if (typeof shareEnabled !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "shareEnabled must be true or false"
            });
        }

        const ride = await updateRideSharing({
            userId: req.user.userId,
            rideId,
            shareEnabled,
            shareableSeats:
                shareableSeats !== undefined
                    ? Number(shareableSeats)
                    : 0
        });

        res.json({
            success: true,
            message: shareEnabled
                ? "Ride sharing enabled successfully"
                : "Ride sharing disabled successfully",
            ride
        });
    } catch (error) {
        console.error(error);

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};





module.exports = {
    createRequest, 
    acceptRequest, 
    updateSharing,
};