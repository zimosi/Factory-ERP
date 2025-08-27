const express = require("express");
const router = express.Router();
const afterSalesOrderMaterialController = require("../controllers/afterSalesOrderMaterial.controller");

router.post("/", afterSalesOrderMaterialController.create);
router.get("/:after_sales_order_id", afterSalesOrderMaterialController.findByOrderId);
router.delete("/:id", afterSalesOrderMaterialController.deleteById);

module.exports = router; 