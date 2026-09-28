const express = require("express");

const authenticate = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
    createRequest,
    acceptRequest,
    updateSharing,
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

module.exports = router;