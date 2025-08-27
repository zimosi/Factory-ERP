const ReturnOrder = require("../models/returnOrder.model");
const pool = require("../db/connection");

exports.create = async (req, res) => {
  try {
    const { material_name, model, quantity, unit_price, operator } = req.body;
    // 查找material_id
    const [rows] = await pool.query(
      "SELECT id FROM materials WHERE name = ? AND model = ? LIMIT 1",
      [material_name, model]
    );
    if (!rows.length) {
      return res.status(400).json({ message: "未找到对应材料ID" });
    }
    const material_id = rows[0].id;
    const id = await ReturnOrder.create({
      material_id,
      material_name,
      model,
      quantity,
      unit_price,
      operator
    });
    res.status(201).json({ id });
  } catch (err) {
    res.status(500).json({ message: "退货单创建失败", error: err.message });
  }
};

exports.findAll = async (req, res) => {
  try {
    const rows = await ReturnOrder.findAll();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "查询失败", error: err.message });
  }
};

exports.review = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_reviewed, is_ok } = req.body;
    await pool.query(
      "UPDATE return_orders SET is_reviewed = ?, is_ok = ? WHERE id = ?",
      [is_reviewed, is_ok, id]
    );

    // 审批通过时自动生成领料单
    if (is_reviewed && is_ok) {
      // 查询退货单详情
      const [rows] = await pool.query("SELECT * FROM return_orders WHERE id = ?", [id]);
      if (rows.length) {
        const order = rows[0];
        // 插入material_pick_orders
        const [result] = await pool.query(
          "INSERT INTO material_pick_orders (production_order_id, operator, remark, what) VALUES (?, ?, ?, ?)",
          [null, order.operator, '退货单自动生成', '退货']
        );
        const pick_order_id = result.insertId;
        // 插入material_pick_order_items
        await pool.query(
          "INSERT INTO material_pick_order_items (pick_order_id, material_id, model, quantity, what) VALUES (?, ?, ?, ?, ?)",
          [pick_order_id, order.material_id, order.model, order.quantity, '退货']
        );
        // 更新materials表库存
        await pool.query(
          "UPDATE materials SET used_quantity = used_quantity - ?, quantity = quantity + ? WHERE id = ?",
          [order.quantity, order.quantity, order.material_id]
        );
      }
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "退货审核失败", error: err.message });
  }
}; 