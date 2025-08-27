const express = require("express");
const router = express.Router();
const controller = require("../controllers/productionPickOrder.controller");

router.post("/", controller.createPickOrder);
router.get("/", controller.getAllPickOrders);
router.delete("/:id", controller.deletePickOrder);

module.exports = router; 