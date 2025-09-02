const express = require("express");
const router = express.Router();
const verifyToken = require("../Middleware/auth.middleware");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

router.get("/users", verifyToken, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
