const express = require("express");

const router = express.Router();

const authenticate = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
    topUp, 
    pay
} = require("../controllers/paymentController");

router.post(
    "/wallet/top-up",
    authenticate,
    authorizeRoles("PASSENGER"),
    validateRequired(["amountPaisa"]),
    topUp
);

router.post(
    "/fares/:fareId/pay",
    authenticate,
    authorizeRoles("PASSENGER"),
    pay
);

module.exports = router;