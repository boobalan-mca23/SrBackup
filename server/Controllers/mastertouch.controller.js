
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createTouch = async (req, res) => {
  const { touch } = req.body;
  try {
    const parsedTouch = parseFloat(touch);
    if (isNaN(parsedTouch)) {
      return res.status(400).json({ error: "Invalid number" });
    }
    const newTouch = await prisma.masterTouch.create({
      data: { touch: parsedTouch },
    });
    res.status(201).json(newTouch);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getTouch = async (req, res) => {
  try {
    const touches = await prisma.masterTouch.findMany();
    res.json(touches);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  createTouch,
  getTouch,
};
