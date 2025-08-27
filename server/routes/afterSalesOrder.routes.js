const express = require("express");
const router = express.Router();
const afterSalesOrderController = require("../controllers/afterSalesOrder.controller");

router.post("/", afterSalesOrderController.create);
router.get("/", afterSalesOrderController.findAll);
router.get("/sale-order/:sale_order_id", afterSalesOrderController.findBySaleOrderId);
router.patch("/:id/status", afterSalesOrderController.updateStatus);
router.patch('/:id/price', afterSalesOrderController.updatePrice);
router.get("/:id", afterSalesOrderController.findById);

module.exports = router; 