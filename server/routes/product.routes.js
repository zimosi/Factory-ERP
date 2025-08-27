const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");

router.post("/", productController.createProduct);
router.get("/", productController.getAllProducts);
router.post("/product-materials/batch", productController.batchAddProductMaterials);
router.get("/product-boms", productController.getAllProductBoms);
router.get("/:id/bom", productController.getProductBom);

module.exports = router; 