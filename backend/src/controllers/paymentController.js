const {
    topUpWallet,
    payFare,
} = require("../services/paymentService");

const topUp = async (req, res) => {
    try {
        const amountPaisa = Number(req.body.amountPaisa);

        const result = await topUpWallet(
            req.user.userId,
            amountPaisa
        );

        res.json({
            success: true,
            message: "Wallet topped up successfully",
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



const pay = async (req, res) => {
    try {
        const fareId = Number(req.params.fareId);

        const result = await payFare(
            req.user.userId,
            fareId
        );

        res.json({
            success: true,
            message: "Payment successful",
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
    topUp,
    pay,
};