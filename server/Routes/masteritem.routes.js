const express = require("express");
const router = express.Router();
const masterItemController = require("../Controllers/masteritem.controller");

router.post("/create", masterItemController.createItem);
router.get("/", masterItemController.getItems);
router.put("/:id",masterItemController.updateItems)

module.exports = router;
