const express = require("express");
const authenticate = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const { updateStatus, addVehicle } = require("../controllers/driverController");

const router = express.Router();

router.patch(
    "/status",
    authenticate,
    authorizeRoles("DRIVER"),
    updateStatus
);

router.post(
    "/vehicle",
    authenticate,
    authorizeRoles("DRIVER"),
    addVehicle
);

module.exports = router;