const express = require("express");
const router = express.Router();
const purchaseOrderController = require("../controllers/purchaseOrder.controller");

router.post("/", purchaseOrderController.createPurchaseOrder);
router.get("/", purchaseOrderController.getAllPurchaseOrders);
router.post("/:id/arrive", purchaseOrderController.confirmArrival);
router.patch("/:id/review", purchaseOrderController.reviewPurchaseOrder);

module.exports = router; 