const prisma = require("../config/database");

const getGraph = async () => {
    const nodes = await prisma.graphNode.findMany({
        orderBy: {
            nodeId: "asc",
        },
    });

    const edges = await prisma.graphEdge.findMany();

    const graph = {};

    // Create empty adjacency list for every node
    for (const node of nodes) {
        graph[node.nodeId] = [];
    }

    // Graph is undirected
    for (const edge of edges) {
        graph[edge.fromNodeId].push({
            nodeId: edge.toNodeId,
            farePaisa: edge.farePaisa,
        });

        graph[edge.toNodeId].push({
            nodeId: edge.fromNodeId,
            farePaisa: edge.farePaisa,
        });
    }

    return {
        nodes,
        graph,
    };
};



const findShortestPath = async (sourceNodeId, destinationNodeId) => {
    const { graph } = await getGraph();

    if (!graph[sourceNodeId] || !graph[destinationNodeId]) {
        throw new Error("Invalid source or destination node");
    }

    const distances = {};
    const previous = {};
    const unvisited = new Set(Object.keys(graph).map(Number));

    for (const nodeId of unvisited) {
        distances[nodeId] = Infinity;
        previous[nodeId] = null;
    }

    distances[sourceNodeId] = 0;

    while (unvisited.size > 0) {
        let currentNode = null;
        let smallestDistance = Infinity;

        for (const nodeId of unvisited) {
            if (distances[nodeId] < smallestDistance) {
                smallestDistance = distances[nodeId];
                currentNode = nodeId;
            }
        }

        if (currentNode === null) {
            break;
        }

        if (currentNode === destinationNodeId) {
            break;
        }

        unvisited.delete(currentNode);

        for (const neighbor of graph[currentNode]) {
            const newDistance =
                distances[currentNode] + neighbor.farePaisa;

            if (newDistance < distances[neighbor.nodeId]) {
                distances[neighbor.nodeId] = newDistance;
                previous[neighbor.nodeId] = currentNode;
            }
        }
    }

    if (distances[destinationNodeId] === Infinity) {
        throw new Error("No route found");
    }

    // Reconstruct route
    const path = [];
    let currentNode = destinationNodeId;

    while (currentNode !== null) {
        path.unshift(currentNode);
        currentNode = previous[currentNode];
    }

    return {
        path,
        totalFarePaisa: distances[destinationNodeId],
    };
};

module.exports = {
    getGraph,
    findShortestPath,
};