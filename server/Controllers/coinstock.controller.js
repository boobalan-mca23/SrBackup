const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createStock = async (req, res) => {
  try {
    const { coinType, gram, quantity, touch, totalWeight, purity } = req.body;

    const existingStock = await prisma.coinStock.findFirst({
      where: {
        coinType,
        gram: parseFloat(gram),
      },
    });

    if (existingStock) {
      const updatedStock = await prisma.coinStock.update({
        where: { id: existingStock.id },
        data: {
          quantity: existingStock.quantity + parseInt(quantity),
          totalWeight:
            parseFloat(existingStock.totalWeight) + parseFloat(totalWeight),
          purity: parseFloat(existingStock.purity) + parseFloat(purity),
          stockLogs: {
            create: {
              coinType,
              gram: parseFloat(gram),
              quantity: parseInt(quantity),
              changeType: "ADD",
              reason: "Additional stock added",
            },
          },
        },
        include: { stockLogs: true },
      });

      return res.status(200).json({
        message: "Existing stock item updated successfully",
        data: updatedStock,
      });
    }

    const newStock = await prisma.coinStock.create({
      data: {
        coinType,
        gram: parseFloat(gram),
        quantity: parseInt(quantity),
        touch: parseFloat(touch),
        totalWeight: parseFloat(totalWeight),
        purity: parseFloat(purity),
        stockLogs: {
          create: {
            coinType,
            gram: parseFloat(gram),
            quantity: parseInt(quantity),
            changeType: "ADD",
            reason: "Initial stock added",
          },
        },
      },
      include: { stockLogs: true },
    });

    res.status(201).json({
      message: "New stock item added successfully",
      data: newStock,
    });
  } catch (error) {
    console.error("error", error);
    res.status(500).json({ message: "Error adding stock item", error });
  }
};

const getAllStocks = async (req, res) => {
  try {
    const stocks = await prisma.coinStock.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    res.status(200).json(stocks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching stocks", error });
  }
};

const updateStock = async (req, res) => {
  const { id } = req.params;
  const { coinType, gram, quantity, touch, totalWeight, purity } = req.body;

  try {
    const updatedStock = await prisma.coinStock.update({
      where: { id: parseInt(id) },
      data: {
        coinType,
        gram: parseFloat(gram),
        quantity: parseInt(quantity),
        touch: parseFloat(touch),
        totalWeight: parseFloat(totalWeight),
        purity: parseFloat(purity),
      },
    });

    res
      .status(200)
      .json({ message: "Stock item updated successfully", data: updatedStock });
  } catch (error) {
    res.status(500).json({ message: "Error updating stock item", error });
  }
};

const deleteStock = async (req, res) => {
  const { id } = req.params;
  const parsedId = parseInt(id);

  if (isNaN(parsedId)) {
    return res.status(400).json({ message: "Invalid stock ID" });
  }

  try {
    await prisma.stockLog.deleteMany({
      where: { coinStockId: parsedId },
    });

    const deletedStock = await prisma.coinStock.delete({
      where: { id: parsedId },
    });

    res.status(200).json({
      message: "Stock item deleted successfully",
      data: deletedStock,
    });
  } catch (error) {
    console.error("Error deleting stock item:", error);
    res.status(500).json({
      message: "Error deleting stock item",
      error: error.message,
    });
  }
};

const reduceStock = async (req, res) => {
  try {
    const { coinType, gram, quantity, reason } = req.body;
    const stock = await prisma.coinStock.findFirst({
      where: { coinType, gram: parseFloat(gram) },
    });

    if (!stock) return res.status(404).json({ message: "Stock not found" });
    if (stock.quantity < quantity)
      return res.status(400).json({
        message: `Insufficient stock. Available: ${stock.quantity}`,
      });

    const weightToReduce = parseFloat(gram) * parseInt(quantity);
    const purityToReduce =
      (parseFloat(stock.touch) * parseFloat(gram) * parseInt(quantity)) / 100;

    const updatedStock = await prisma.coinStock.update({
      where: { id: stock.id },
      data: {
        quantity: stock.quantity - quantity,
        totalWeight: parseFloat(stock.totalWeight) - weightToReduce,
        purity: parseFloat(stock.purity) - purityToReduce,
        stockLogs: {
          create: {
            coinType,
            gram: parseFloat(gram),
            quantity: -quantity,
            changeType: "REMOVE",
            reason,
          },
        },
      },
    });

    res.status(200).json({
      message: "Stock reduced successfully",
      data: updatedStock,
    });
  } catch (error) {
    res.status(500).json({ message: "Error reducing stock", error });
  }
};

const getAllLogs = async (req, res) => {
  try {
    const logs = await prisma.stockLog.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching stock logs", error });
  }
};

module.exports = {
  createStock,
  getAllStocks,
  updateStock,
  deleteStock,
  reduceStock,
  getAllLogs,
};
