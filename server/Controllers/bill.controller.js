const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createBill = async (req, res) => {
  try {
    const {
      customerId,
      goldRate,
      hallmarkCharges = 0,
      items = [],
      receivedDetails = [],
      totalWeight,
      totalPurity,
      totalAmount,
    } = req.body;

    if (
      totalWeight === undefined ||
      totalPurity === undefined ||
      totalAmount === undefined
    ) {
      return res.status(400).json({
        error:
          "Missing calculated totals: totalWeight, totalPurity, or totalAmount",
      });
    }

    const latestBill = await prisma.bill.findFirst({
      orderBy: { id: "desc" },
    });

    const billNo = `BILL-${(latestBill?.id || 0) + 1}`;

    const bill = await prisma.$transaction(async (tx) => {
      const newBill = await tx.bill.create({
        data: {
          billNo,
          customerId: parseInt(customerId),
          goldRate: parseFloat(goldRate),
          hallmarkCharges: parseFloat(hallmarkCharges),
          totalWeight: parseFloat(totalWeight),
          totalPurity: parseFloat(totalPurity),
          totalAmount: parseFloat(totalAmount),
          items: {
            create: items.map((item) => ({
              coinValue: parseFloat(item.coinValue),
              quantity: parseInt(item.quantity),
              percentage: parseFloat(item.percentage),
              touch: parseFloat(item.touch),
              weight: parseFloat(item.weight),
              purity: parseFloat(item.purity),
              amount: item.amount,
            })),
          },
          receivedDetails: {
            create: receivedDetails.map((r) => ({
              date: new Date(r.date),

              goldRate: parseFloat(r.goldRate),
              givenGold: parseFloat(r.givenGold),
              touch: parseFloat(r.touch),
              purityWeight: parseFloat(r.purityWeight),
              amount: parseFloat(r.amount),
              hallmark: parseFloat(r.hallmark),
            })),
          },
        },
        include: {
          items: true,
          receivedDetails: true,
        },
      });

      return newBill;
    });

    res.status(201).json({ bill });
  } catch (error) {
    console.error("Error creating bill:", error);
    res.status(500).json({ error: "Failed to create Bill" });
  }
};

const getBillById = async (req, res) => {
  try {
    const { id } = req.params;

    const bill = await prisma.bill.findUnique({
      where: { id: parseInt(id) },
      include: {
        customer: true,
        items: true,
        receivedDetails: true,
      },
    });

    if (!bill) {
      return res.status(404).json({ error: "Bill not found" });
    }

    res.json(bill);
  } catch (error) {
    console.error("Error fetching bill:", error);
    res.status(500).json({ error: "Failed to fetch bill" });
  }
};

const getBills = async (req, res) => {
  try {
    const bills = await prisma.bill.findMany({
      include: {
        customer: true,
        items: true,
        receivedDetails: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch bills" });
  }
};
const deleteBill = async (req, res) => {
  const { id } = req.params;

  const parsedId = parseInt(id);
  if (isNaN(parsedId)) {
    return res.status(400).json({ message: "Invalid bill ID" });
  }

  try {
    const existingBill = await prisma.bill.findUnique({
      where: { id: parsedId },
      include: {
        items: true,
        receivedDetails: true,
      },
    });

    if (!existingBill) {
      return res.status(404).json({ message: "Bill not found" });
    }w

    await prisma.receivedDetail.deleteMany({
      where: { billId: parsedId },
    });

    await prisma.billItem.deleteMany({
      where: { billId: parsedId },
    });

    await prisma.bill.delete({
      where: { id: parsedId },
    });

    return res.status(200).json({ message: "Bill deleted successfully" });
  } catch (error) {
    console.error("Error deleting bill:", error);
    return res.status(500).json({ message: "Failed to delete bill" });
  }
};
const addReceiveEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { receivedDetails = [] } = req.body;

    if (!receivedDetails.length) {
      return res.status(400).json({ error: "No receive details provided" });
    }

    const sanitizeDate = (date) => {
      if (!date) return new Date().toISOString();
      if (typeof date === "string") {
        if (date.includes("T")) return date;
        return new Date(date).toISOString();
      }
      if (date instanceof Date) return date.toISOString();
      return new Date().toISOString();
    };

    const existingBill = await prisma.bill.findUnique({
      where: { id: parseInt(id) },
      include: { receivedDetails: true },
    });

    if (!existingBill) {
      return res.status(404).json({ error: "Bill not found" });
    }

    const existingKeys = new Set(
      existingBill.receivedDetails.map(
        (d) => `${new Date(d.date).toISOString()}_${parseFloat(d.amount)}`
      )
    );

    const sanitizedDetails = receivedDetails
      .map(({ id, billId, createdAt, updatedAt, date, amount, ...rest }) => {
        const cleanDate = sanitizeDate(date);
        return {
          ...rest,
          amount: parseFloat(amount),
          date: cleanDate,
          _key: `${cleanDate}_${parseFloat(amount)}`,
        };
      })
      .filter((detail) => !existingKeys.has(detail._key))
      .map(({ _key, ...detail }) => detail);

    if (!sanitizedDetails.length) {
      return res.status(200).json({ message: "No new receive entries to add" });
    }

    const totalNewAmount = sanitizedDetails.reduce(
      (sum, detail) => sum + (parseFloat(detail.amount) || 0),
      0
    );

    const updatedBill = await prisma.bill.update({
      where: { id: parseInt(id) },
      data: {
        receivedDetails: {
          create: sanitizedDetails,
        },
        totalAmount: {
          increment: totalNewAmount,
        },
      },
      include: {
        customer: true,
        items: true,
        receivedDetails: true,
      },
    });

    return res.status(200).json(updatedBill);
  } catch (error) {
    console.error("Error adding receive entry:", error);
    return res.status(500).json({ error: "Failed to add receive entry" });
  }
};

module.exports = {
  createBill,
  getBills,
  getBillById,
  addReceiveEntry,
  deleteBill,
};
