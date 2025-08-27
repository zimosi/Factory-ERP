const AfterSalesOrderMaterial = require("../models/afterSalesOrderMaterial.model");

exports.create = async (req, res) => {
  try {
    const { after_sales_order_id, material_id, material_name, model, quantity, unit, unit_price, remark } = req.body;
    if (!after_sales_order_id || !material_id || !material_name || !quantity || !unit) {
      return res.status(400).json({ message: "参数不完整" });
    }
    const id = await AfterSalesOrderMaterial.create({ after_sales_order_id, material_id, material_name, model, quantity, unit, unit_price, remark });
    await AfterSalesOrderMaterial.updateMaterialStock(material_id, quantity); // 同步库存
    res.status(201).json({ id });
  } catch (err) {
    res.status(500).json({ message: "添加失败", error: err.message });
  }
};

exports.findByOrderId = async (req, res) => {
  try {
    const { after_sales_order_id } = req.params;
    const rows = await AfterSalesOrderMaterial.findByOrderId(after_sales_order_id);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "查询失败", error: err.message });
  }
};

exports.deleteById = async (req, res) => {
  try {
    const { id } = req.params;
    await AfterSalesOrderMaterial.deleteById(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "删除失败", error: err.message });
  }
}; 