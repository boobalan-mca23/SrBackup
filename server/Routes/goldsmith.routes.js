const express = require("express");
const router = express.Router();
const goldsmithController = require("../Controllers/goldsmith.controller");

router.post("/", goldsmithController.createGoldsmith);
router.get("/", goldsmithController.getAllGoldsmith);
router.get("/:id", goldsmithController.getGoldsmithById);
router.put("/:id", goldsmithController.updateGoldsmith);
router.delete("/:id", goldsmithController.deleteGoldsmith);


module.exports = router;
