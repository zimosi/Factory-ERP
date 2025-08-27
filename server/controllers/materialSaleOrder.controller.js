const MaterialSaleOrder = require("../models/materialSaleOrder.model");

exports.create = async (req, res) => {
  try {
    const id = await MaterialSaleOrder.create(req.body);
    res.status(201).json({ id });
  } catch (err) {
    res.status(500).json({ message: "创建失败", error: err.message });
  }
};

exports.findAll = async (req, res) => {
  try {
    const rows = await MaterialSaleOrder.findAll();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "查询失败", error: err.message });
  }
}; 