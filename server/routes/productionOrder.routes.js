const express = require("express");
const router = express.Router();
const productionOrderController = require("../controllers/productionOrder.controller");
const productionPickOrderController = require('../controllers/productionPickOrder.controller');

router.post("/", productionOrderController.createProductionOrder);
router.get("/", productionOrderController.getAllProductionOrders);
router.get("/:id/materials", productionOrderController.getProductionOrderMaterials);
router.patch("/:id/materials/:material_id/use", productionOrderController.updateMaterialUsage);
router.patch('/:id/complete', productionOrderController.completeProductionOrder);
router.post('/production-pick-orders', productionPickOrderController.createPickOrder);
router.get('/production-pick-orders', productionPickOrderController.getAllPickOrders);
router.delete('/production-pick-orders/:id', productionPickOrderController.deletePickOrder);
router.get('/find-by-serial-no', productionOrderController.findBySerialNo);

module.exports = router; 