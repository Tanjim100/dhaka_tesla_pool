const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
    // =========================
    // PASSENGERS
    // =========================

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

    // =========================
    // DRIVER
    // =========================

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

    // =========================
    // VEHICLE
    // =========================

    const bullet = await prisma.vehicle.create({
        data: {
            driverId: jashim.driverId,
            vehicleName: "Bullet",
            licenseNumber: "DHAKA-TESLA-001",
            totalSeats: 3,
            vehicleStatus: "ACTIVE",
        },
    });

    // =========================
    // GRAPH NODES
    // =========================

    const graphNodes = [
        { nodeId: 1, name: "Adamjee Cantonment" },
        { nodeId: 2, name: "Ibrahimpur" },
        { nodeId: 3, name: "Nirjhor" },
        { nodeId: 4, name: "MES More" },
        { nodeId: 5, name: "Kuril" },
        { nodeId: 6, name: "Notun Bazar" },
        { nodeId: 7, name: "Gulshan" },
        { nodeId: 8, name: "Banani" },
        { nodeId: 9, name: "Banani DOHS" },
        { nodeId: 10, name: "Mohakhali DOHS" },
        { nodeId: 11, name: "Bijoy Sharani" },
        { nodeId: 12, name: "Farmgate" },
        { nodeId: 13, name: "Mohakhali" },
        { nodeId: 14, name: "Badda" },
        { nodeId: 15, name: "Rampura" },
        { nodeId: 16, name: "Malibagh" },
    ];

    await prisma.graphNode.createMany({
        data: graphNodes,
    });

    // =========================
    // GRAPH EDGES
    // =========================
    // Graph is undirected.
    // Each edge is stored once.
    // Fare between every connected node = 30 BDT.

    const graphEdges = [
        [1, 2],
        [2, 3],
        [3, 4],
        [4, 5],
        [5, 6],
        [6, 7],
        [7, 8],
        [4, 8],
        [8, 9],
        [1, 9],
        [9, 10],
        [10, 11],
        [10, 12],
        [11, 12],
        [10, 13],
        [7, 13],
        [12, 16],
        [15, 16],
        [13, 14],
        [14, 15],
        [6, 14],
    ];

    await prisma.graphEdge.createMany({
        data: graphEdges.map(([fromNodeId, toNodeId]) => ({
            fromNodeId,
            toNodeId,
            farePaisa: 3000,
        })),
    });

    // =========================
    // SEED SUMMARY
    // =========================

    console.log("Seed completed successfully!");

    console.log({
        passengers: [
            nusrat.passengerId,
            rafiq.passengerId,
            shirin.passengerId,
        ],
        driver: jashim.driverId,
        vehicle: bullet.vehicleId,
        graphNodes: graphNodes.length,
        graphEdges: graphEdges.length,
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