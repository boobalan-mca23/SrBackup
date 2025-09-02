const express = require("express");
const router = express.Router();
const masterSealController = require("../Controllers/masterSealItem.controller");

router.post("/create",masterSealController.createMasterSeal);
router.get("/", masterSealController.getMasterSeal);
router.put("/:id",masterSealController.updateMasterSeal)

module.exports = router;
