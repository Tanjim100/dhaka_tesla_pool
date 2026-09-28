const prisma = require("../config/database");
const { hashPassword } = require("../utils/password");
const { comparePassword } = require("../utils/password");
const { generateToken } = require("../utils/jwt");

const registerUser = async ({
    name,
    email,
    password,
    phone,
    role
}) => {

    const existingUser = await prisma.user.findUnique({
        where: {
            email
        }
    });

    if (existingUser) {
        throw new Error("Email already registered");
    }

    const passwordHash = await hashPassword(password);

    const result = await prisma.$transaction(async (tx) => {

        const user = await tx.user.create({
            data: {
                name,
                email,
                passwordHash,
                phone,
                role
            }
        });

        if (role === "PASSENGER") {

            const passenger = await tx.passenger.create({
                data: {
                    userId: user.userId
                }
            });

            return {
                user,
                passenger
            };
        }

        if (role === "DRIVER") {

            const driver = await tx.driver.create({
                data: {
                    userId: user.userId
                }
            });

            return {
                user,
                driver
            };
        }

        throw new Error("Invalid user role");
    });

    return result;
};

const loginUser = async ({ email, password }) => {

    const user = await prisma.user.findUnique({
        where: {
            email
        }
    });

    if (!user) {
        throw new Error("Invalid email or password");
    }

    if (!user.isActive) {
        throw new Error("Account is inactive");
    }

    const passwordMatched = await comparePassword(
        password,
        user.passwordHash
    );

    if (!passwordMatched) {
        throw new Error("Invalid email or password");
    }

    const token = generateToken({
        userId: user.userId,
        role: user.role
    });

    return {
        user,
        token
    };
};


module.exports = {
    registerUser,
    loginUser
};