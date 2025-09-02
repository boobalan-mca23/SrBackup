const express = require("express");
const router = express.Router();
const masterTouchController = require("../Controllers/mastertouch.controller");

router.post("/create", masterTouchController.createTouch);
router.get("/", masterTouchController.getTouch);

module.exports = router;
