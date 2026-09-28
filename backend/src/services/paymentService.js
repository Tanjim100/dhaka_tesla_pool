const prisma = require("../config/database");

const topUpWallet = async (userId, amountPaisa) => {
    if (!Number.isInteger(amountPaisa) || amountPaisa <= 0) {
        throw new Error("Amount must be greater than 0");
    }

    const user = await prisma.user.update({
        where: { userId },
        data: {
            walletBalancePaisa: {
                increment: amountPaisa
            }
        }
    });

    return {
        walletBalancePaisa: user.walletBalancePaisa
    };
};




const payFare = async (userId, fareId) => {
    return await prisma.$transaction(async (tx) => {
        const fare = await tx.fare.findUnique({
            where: { fareId },
            include: {
                ridePassenger: {
                    include: {
                        passenger: {
                            include: {
                                user: true
                            }
                        }
                    }
                }
            }
        });

        if (!fare) {
            throw new Error("Fare not found");
        }

        if (fare.fareStatus !== "FINAL") {
            throw new Error("Fare is not finalized");
        }

        const passengerUser =
            fare.ridePassenger.passenger.user;

        if (passengerUser.userId !== userId) {
            throw new Error("You cannot pay this fare");
        }

        if (fare.payment) {
            if (fare.payment.paymentStatus === "PAID") {
                throw new Error("Fare is already paid");
            }
        }

        const user = await tx.user.findUnique({
            where: { userId }
        });

        if (user.walletBalancePaisa < fare.totalAmountPaisa) {
            await tx.payment.upsert({
                where: { fareId },
                update: {
                    paymentStatus: "FAILED",
                    amountPaisa: fare.totalAmountPaisa
                },
                create: {
                    fareId,
                    paymentMethod: "TESLA_PAY",
                    paymentStatus: "FAILED",
                    amountPaisa: fare.totalAmountPaisa
                }
            });

            throw new Error("Insufficient wallet balance");
        }

        const updatedUser = await tx.user.update({
            where: { userId },
            data: {
                walletBalancePaisa: {
                    decrement: fare.totalAmountPaisa
                }
            }
        });

        const payment = await tx.payment.upsert({
            where: { fareId },
            update: {
                paymentMethod: "TESLA_PAY",
                paymentStatus: "PAID",
                amountPaisa: fare.totalAmountPaisa,
                paidAt: new Date()
            },
            create: {
                fareId,
                paymentMethod: "TESLA_PAY",
                paymentStatus: "PAID",
                amountPaisa: fare.totalAmountPaisa,
                paidAt: new Date()
            }
        });

        return {
            payment,
            walletBalancePaisa: updatedUser.walletBalancePaisa
        };
    });
};





module.exports = {
    topUpWallet,
    payFare,
};