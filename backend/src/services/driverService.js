const prisma = require("../config/database");

const updateDriverStatus = async (userId, isOnline) => {
    const driver = await prisma.driver.findUnique({
        where: { userId }
    });

    if (!driver) {
        throw new Error("Driver profile not found");
    }

    const updatedDriver = await prisma.driver.update({
        where: { driverId: driver.driverId },
        data: { isOnline }
    });

    return updatedDriver;
};



const createVehicle = async ({
    userId,
    vehicleName,
    licenseNumber,
    totalSeats
}) => {
    const driver = await prisma.driver.findUnique({
        where: { userId },
        include: {
            vehicle: true
        }
    });

    if (!driver) {
        throw new Error("Driver profile not found");
    }

    if (driver.vehicle) {
        throw new Error("Driver already has a vehicle");
    }

    if (!Number.isInteger(totalSeats) || totalSeats <= 0) {
        throw new Error("Total seats must be greater than 0");
    }

    const vehicle = await prisma.vehicle.create({
        data: {
            driverId: driver.driverId,
            vehicleName,
            licenseNumber,
            totalSeats
        }
    });

    return vehicle;
};



module.exports = {
    updateDriverStatus,
    createVehicle
};

