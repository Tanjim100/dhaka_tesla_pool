const express = require("express");

const authenticate = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
    createRequest,
    acceptRequest,
    updateSharing,
    updateStatus,
} = require("../controllers/rideController");

const router = express.Router();

router.post(
    "/requests",
    authenticate,
    authorizeRoles("PASSENGER"),
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
    updateSharing
);

router.patch(
    "/:rideId/status",
    authenticate,
    authorizeRoles("DRIVER"),
    updateStatus
);


module.exports = router;