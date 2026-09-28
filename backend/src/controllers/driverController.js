const { 
    updateDriverStatus,
    createVehicle
} = require("../services/driverService");

const updateStatus = async (req, res) => {
    try {
        const { isOnline } = req.body;

        if (typeof isOnline !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "isOnline must be true or false"
            });
        }

        const driver = await updateDriverStatus(
            req.user.userId,
            isOnline
        );

        res.json({
            success: true,
            message: `Driver is now ${isOnline ? "online" : "offline"}`,
            driver
        });
    } catch (error) {
        console.error(error);

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


const addVehicle = async (req, res) => {
    try {
        const {
            vehicleName,
            licenseNumber,
            totalSeats
        } = req.body;

        if (!vehicleName || !licenseNumber || !totalSeats) {
            return res.status(400).json({
                success: false,
                message: "vehicleName, licenseNumber and totalSeats are required"
            });
        }

        const vehicle = await createVehicle({
            userId: req.user.userId,
            vehicleName,
            licenseNumber,
            totalSeats: Number(totalSeats)
        });

        res.status(201).json({
            success: true,
            message: "Vehicle created successfully",
            vehicle
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
    updateStatus,
    addVehicle
};