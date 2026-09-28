const {
    createShareRequest, 
    getPendingShareRequests,
    respondToShareRequest

} = require("../services/shareService");

const createRequest = async (req, res) => {
    try {
        const rideId = Number(req.params.rideId);

        const {
            pickupNodeId,
            destinationNodeId,
            requestedSeats
        } = req.body;

        const shareRequest =
            await createShareRequest({
                userId: req.user.userId,
                rideId,
                pickupNodeId: Number(pickupNodeId),
                destinationNodeId: Number(destinationNodeId),
                requestedSeats: Number(requestedSeats)
            });

        res.status(201).json({
            success: true,
            message:
                "Share request created successfully",
            shareRequest
        });
    } catch (error) {
        console.error(error);

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};




const getPendingRequests = async (req, res) => {
    try {
        const rideId = Number(req.params.rideId);

        const requests =
            await getPendingShareRequests({
                userId: req.user.userId,
                rideId
            });

        res.json({
            success: true,
            requests
        });
    } catch (error) {
        console.error(error);

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


const respondToRequest = async (req, res) => {
    try {
        const shareRequestId =
            Number(req.params.shareRequestId);

        const { decision } = req.body;

        const result =
            await respondToShareRequest({
                userId: req.user.userId,
                shareRequestId,
                decision
            });

        res.json({
            success: true,
            message:
                `Share request ${decision.toLowerCase()} successfully`,
            ...result
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
    getPendingRequests,
    respondToRequest,
};