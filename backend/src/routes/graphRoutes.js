const express = require("express");
const { getShortestPath } = require("../controllers/graphController");

const router = express.Router();

router.get(
    "/route/:sourceNodeId/:destinationNodeId",
    getShortestPath
);

module.exports = router;