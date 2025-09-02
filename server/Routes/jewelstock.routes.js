const express = require("express");
const router = express.Router();
const jewelStockController = require("../Controllers/jewelstock.controller");

router.post("/", jewelStockController.createJewelStock);
router.get("/", jewelStockController.getAllJewelStock);

module.exports = router;
