const AfterSalesOrder = require("../models/afterSalesOrder.model");

exports.create = async (req, res) => {
  try {
    const { boat_id, serial_no, sale_order_id, reason } = req.body;
    if (!boat_id || !serial_no || !sale_order_id || !reason) {
      return res.status(400).json({ message: "参数不完整" });
    }
    const id = await AfterSalesOrder.create({ boat_id, serial_no, sale_order_id, reason, is_complete: false });
    res.status(201).json({ id });
  } catch (err) {
    res.status(500).json({ message: "创建售后订单失败", error: err.message });
  }
};

exports.findAll = async (req, res) => {
  try {
    const rows = await AfterSalesOrder.findAll();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "查询失败", error: err.message });
  }
};

exports.findBySaleOrderId = async (req, res) => {
  try {
    const { sale_order_id } = req.params;
    const rows = await AfterSalesOrder.findBySaleOrderId(sale_order_id);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "查询失败", error: err.message });
  }
};

exports.findById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await require("../models/afterSalesOrder.model").findById(id);
    if (!order) return res.status(404).json({ message: "未找到该工单" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "查询失败", error: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_complete } = req.body;
    await AfterSalesOrder.updateStatus(id, is_complete);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "更新失败", error: err.message });
  }
};

exports.updatePrice = async (req, res) => {
  try {
    const { id } = req.params;
    const { price } = req.body;
    if (typeof price === 'undefined') return res.status(400).json({ message: "缺少报价" });
    await AfterSalesOrder.updatePrice(id, price);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "保存报价失败", error: err.message });
  }
}; 