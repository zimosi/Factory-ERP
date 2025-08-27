const express = require("express");
const router = express.Router();
const inventoryRecordController = require("../controllers/inventoryRecord.controller");

router.post("/", inventoryRecordController.addInventoryRecord);
router.get("/", inventoryRecordController.getInventoryRecords);

module.exports = router; 