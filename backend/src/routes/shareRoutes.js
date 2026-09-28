const express = require("express");

const authenticate = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
    createRequest, 
    getPendingRequests,
    respondToRequest,
} = require("../controllers/shareController");

const router = express.Router();

router.post(
    "/rides/:rideId",
    authenticate,
    authorizeRoles("PASSENGER"),
    createRequest
);


router.get(
    "/rides/:rideId/requests",
    authenticate,
    authorizeRoles("PASSENGER"),
    getPendingRequests
);

router.patch(
    "/requests/:shareRequestId/respond",
    authenticate,
    authorizeRoles("PASSENGER"),
    respondToRequest
);

module.exports = router;