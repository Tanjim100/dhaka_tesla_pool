const express = require("express");

const authenticate = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
    validateRequired
} = require("../middleware/validationMiddleware");

const {
    createRequest,
    acceptRequest,
    updateSharing,
    updateStatus,
    passengerHistory,
    driverHistory,
} = require("../controllers/rideController");

const router = express.Router();

router.post(
    "/requests",
    authenticate,
    authorizeRoles("PASSENGER"),
    validateRequired([
        "pickupNodeId",
        "destinationNodeId",
        "requestedSeats"
    ]),
    createRequest
);

router.post(
    "/requests/:requestId/accept",
    authenticate,
    authorizeRoles("DRIVER"),
    acceptRequest
);

router.patch(
    "/:rideId/sharing",
    authenticate,
    authorizeRoles("PASSENGER"),
    validateRequired([
        "shareEnabled"
    ]),
    updateSharing
);

router.patch(
    "/:rideId/status",
    authenticate,
    authorizeRoles("DRIVER"),
    validateRequired([
        "status"
    ]),
    updateStatus
);



router.get(
    "/passenger/history",
    authenticate,
    authorizeRoles("PASSENGER"),
    passengerHistory
);

router.get(
    "/driver/history",
    authenticate,
    authorizeRoles("DRIVER"),
    driverHistory
);


module.exports = router;