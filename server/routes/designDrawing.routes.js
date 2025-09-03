const express = require("express");
const router = express.Router();
const designDrawingController = require("../controllers/designDrawing.controller");

// 创建设计图纸
router.post("/", designDrawingController.createDesignDrawing);

// 获取所有设计图纸
router.get("/", designDrawingController.getAllDesignDrawings);

// 获取设计图纸详情
router.get("/:id", designDrawingController.getDesignDrawingById);

// 完成生产
router.post("/:id/complete", designDrawingController.completeProduction);

// 创建设计图纸领料单
router.post("/pick-order", designDrawingController.createDrawingPickOrder);

module.exports = router;
