const express = require("express");
const cors = require("cors");

const prisma = require("./config/database");

const authRoutes = require("./routes/authRoutes");
const passengerRoutes = require("./routes/passengerRoutes");
const driverRoutes = require("./routes/driverRoutes");
const rideRoutes = require("./routes/rideRoutes");
const shareRoutes = require("./routes/shareRoutes");
const fareRoutes = require("./routes/fareRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();

app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Dhaka Tesla Pool Backend"
    });
});

app.get("/api/health", async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;

        res.json({
            success: true,
            message: "API and Database are working"
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Database connection failed"
        });
    }
});



app.use("/api/auth", authRoutes);
app.use("/api/passengers", passengerRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/rides", rideRoutes);
app.use("/api/shares", shareRoutes);
app.use("/api/fares", fareRoutes);
app.use("/api/payments", paymentRoutes);


module.exports = app;