const express = require("express");
const router = express.Router();
const entryController = require("../Controllers/cashgold.controller");


router.get("/", entryController.getAllEntries);
router.post("/", entryController.createEntry);

module.exports = router;
