const express = require("express");
const router = express.Router();

const authRoutes = require("./auth.routes");
const saleOrderRoutes = require("./saleOrder.routes");
const purchaseOrderRoutes = require("./purchaseOrder.routes");
const materialRoutes = require("./material.routes");
const productRoutes = require("./product.routes");
const productionOrderRoutes = require("./productionOrder.routes");
const boatsRoutes = require("./boats.routes");
const inventoryRecordRoutes = require("./inventoryRecord.routes");
const afterSalesOrderRoutes = require("./afterSalesOrder.routes");
const afterSalesOrderMaterialRoutes = require("./afterSalesOrderMaterial.routes");
const materialSaleOrderRoutes = require("./materialSaleOrder.routes");
const productionPickOrderRoutes = require("./productionPickOrder.routes");
const returnOrderRoutes = require("./returnOrder.routes");
const designDrawingRoutes = require("./designDrawing.routes");



router.use("/boats", boatsRoutes);
router.use("/auth", authRoutes);
router.use("/sale-orders", saleOrderRoutes);
router.use("/purchase-orders", purchaseOrderRoutes);
router.use("/materials", materialRoutes);
router.use("/products", productRoutes);
router.use("/production-orders", productionOrderRoutes);
router.use("/inventory-records", inventoryRecordRoutes);
router.use("/after-sales-orders", afterSalesOrderRoutes);
router.use("/after-sales-order-materials", afterSalesOrderMaterialRoutes);
router.use("/material-sale-orders", materialSaleOrderRoutes);
router.use("/production-pick-orders", productionPickOrderRoutes);
router.use("/return-orders", returnOrderRoutes);
router.use("/design-drawings", designDrawingRoutes);



module.exports = router;
