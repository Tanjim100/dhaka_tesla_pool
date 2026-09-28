const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
    // Passengers
    const nusratUser = await prisma.user.create({
        data: {
            name: "Nusrat",
            email: "nusrat@teslapool.com",
            passwordHash: "demo-password",
            phone: "01700000001",
            role: "PASSENGER",
        },
    });

    const nusrat = await prisma.passenger.create({
        data: {
            userId: nusratUser.userId,
        },
    });

    const rafiqUser = await prisma.user.create({
        data: {
            name: "Rafiq",
            email: "rafiq@teslapool.com",
            passwordHash: "demo-password",
            phone: "01700000002",
            role: "PASSENGER",
        },
    });

    const rafiq = await prisma.passenger.create({
        data: {
            userId: rafiqUser.userId,
        },
    });

    const shirinUser = await prisma.user.create({
        data: {
            name: "Shirin",
            email: "shirin@teslapool.com",
            passwordHash: "demo-password",
            phone: "01700000003",
            role: "PASSENGER",
        },
    });

    const shirin = await prisma.passenger.create({
        data: {
            userId: shirinUser.userId,
        },
    });

    // Driver
    const jashimUser = await prisma.user.create({
        data: {
            name: "Jashim",
            email: "jashim@teslapool.com",
            passwordHash: "demo-password",
            phone: "01700000004",
            role: "DRIVER",
        },
    });

    const jashim = await prisma.driver.create({
        data: {
            userId: jashimUser.userId,
            isOnline: false,
        },
    });

    // Vehicle
    const bullet = await prisma.vehicle.create({
        data: {
            driverId: jashim.driverId,
            vehicleName: "Bullet",
            licenseNumber: "DHAKA-TESLA-001",
            totalSeats: 3,
            vehicleStatus: "ACTIVE",
        },
    });

    console.log("Seed completed successfully!");
    console.log({
        passengers: [
            nusrat.passengerId,
            rafiq.passengerId,
            shirin.passengerId,
        ],
        driver: jashim.driverId,
        vehicle: bullet.vehicleId,
    });
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });