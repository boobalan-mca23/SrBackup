const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.createJewelStock = async (req, res) => {
  try {
    const { jewelName, weight, stoneWeight, finalWeight, touch, purityValue } =
      req.body;

    const newEntry = await prisma.jewelStock.create({
      data: {
        jewelName,
        weight: parseFloat(weight),
        stoneWeight: parseFloat(stoneWeight),
        finalWeight: parseFloat(finalWeight),
        touch: parseFloat(touch),
        purityValue: parseFloat(purityValue),
      },
    });

    res.status(201).json(newEntry);
  } catch (error) {
    console.error("Error creating jewel stock:", error);
    res.status(500).json({ error: "Failed to create jewel stock entry" });
  }
};

exports.getAllJewelStock = async (req, res) => {
  try {
    const entries = await prisma.jewelStock.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    res.status(200).json(entries);
  } catch (error) {
    console.error("Error fetching jewel stock entries:", error);
    res.status(500).json({ error: "Failed to fetch jewel stock entries" });
  }
};
