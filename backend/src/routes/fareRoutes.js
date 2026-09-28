const express = require("express");
const authenticate = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const { 
    calculateRideFares,
    finalizeRideFares,
 } = require("../services/fareService");

const router = express.Router();

router.post(
    "/rides/:rideId/calculate",
    authenticate,
    authorizeRoles("DRIVER"),
    async (req, res) => {
        try {
            const rideId = Number(req.params.rideId);

            const fares = await calculateRideFares(rideId);

            res.json({
                success: true,
                message: "Fares calculated successfully",
                fares
            });
        } catch (error) {
            console.error(error);

            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
);


router.post(
    "/rides/:rideId/finalize",
    authenticate,
    authorizeRoles("DRIVER"),
    async (req, res) => {
        try {
            const rideId = Number(req.params.rideId);

            const fares = await finalizeRideFares(rideId);

            res.json({
                success: true,
                message: "Fares finalized successfully",
                fares
            });
        } catch (error) {
            console.error(error);

            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
);

module.exports = router;