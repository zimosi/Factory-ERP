const express = require("express");
const router = express.Router();
const controller = require("../controllers/returnOrder.controller");

router.post("/", controller.create);
router.get("/", controller.findAll);
router.patch("/:id/review", controller.review);

module.exports = router; 