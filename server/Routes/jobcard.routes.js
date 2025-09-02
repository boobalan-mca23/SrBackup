const express = require("express");
const jobCardController = require("../Controllers/jobcard.controller");
const router = express.Router();

router.post("/", jobCardController.createJobCard);
router.put("/:goldSmithId/:jobCardId", jobCardController.updateJobCard);
// router.get("/job-cards", jobCardController.getAllJobCards);
// router.patch("/items/:itemId", jobCardController.updateJobCardItem);
router.get("/:id", jobCardController.getAllJobCardByGoldsmithId);
router.get("/:id/lastBalance",jobCardController.getPreviousJobCardBal);
router.get("/:id/jobcard",jobCardController.getJobCardById)
router.get("/:id/goldsmithCard", jobCardController.jobCardFilter);

module.exports = router;
