const express = require("express");
const router = express.Router();
const materialController = require("../controllers/material.controller");

// 具体路径路由放在前面
router.get("/", materialController.searchMaterials);
router.get("/models", materialController.getModelsByName);
router.get("/by-name-model", materialController.getMaterialByNameAndModel);
router.get("/all", materialController.getAllMaterials);
router.get("/detail", materialController.getMaterialDetail);
router.get("/find-id", materialController.findMaterialId);
router.get("/processing", materialController.getProcessingMaterials);
router.get("/processing-all", materialController.getAllProcessingMaterials);
router.post("/add-inventory", materialController.addInventory);
router.patch('/:id/extract', materialController.extractMaterial);

// 参数化路由放在最后
router.get("/:id", materialController.getMaterialById);

module.exports = router; 