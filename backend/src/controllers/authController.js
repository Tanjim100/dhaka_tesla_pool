const { registerUser, loginUser } = require("../services/authService");

const register = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            phone,
            role
        } = req.body;

        const result = await registerUser({
            name,
            email,
            password,
            phone,
            role
        });

        res.status(201).json({
            success: true,
            message: "Registration successful",
            user: {
                userId: result.userId,
                name: result.name,
                email: result.email,
                phone: result.phone,
                role: result.role
            }
        });

    } catch (error) {
        console.error(error);

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const login = async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;

        const result = await loginUser({
            email,
            password
        });

        res.json({
            success: true,
            message: "Login successful",
            token: result.token,
            user: {
                userId: result.user.userId,
                name: result.user.name,
                email: result.user.email,
                phone: result.user.phone,
                role: result.user.role
            }
        });

    } catch (error) {
        console.error(error);

        res.status(401).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    register,
    login
};