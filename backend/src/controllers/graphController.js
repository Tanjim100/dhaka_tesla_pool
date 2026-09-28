const { findShortestPath } = require("../services/graphService");

const getShortestPath = async (req, res) => {
    try {
        const sourceNodeId = Number(req.params.sourceNodeId);
        const destinationNodeId = Number(req.params.destinationNodeId);

        if (
            !Number.isInteger(sourceNodeId) ||
            !Number.isInteger(destinationNodeId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid node ID",
            });
        }

        const result = await findShortestPath(
            sourceNodeId,
            destinationNodeId
        );

        res.json({
            success: true,
            sourceNodeId,
            destinationNodeId,
            path: result.path,
            totalFarePaisa: result.totalFarePaisa,
        });
    } catch (error) {
        console.error(error);

        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    getShortestPath,
};