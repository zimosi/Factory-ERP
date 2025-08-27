const express = require("express");
const router = express.Router();
const pool = require("../db/connection");

// GET /api/boats?product_name=xxx 查询boat表
router.get("/", async (req, res) => {
  const { product_name } = req.query;
  try {
    let sql = "SELECT * FROM boats";
    const params = [];
    if (product_name) {
      sql += " WHERE product_name = ?";
      params.push(product_name);
    }
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "查询失败", error: err.message });
  }
});

// GET /api/boats/by-order/:order_id 查询某销售订单下所有船
router.get("/by-order/:order_id", async (req, res) => {
  const { order_id } = req.params;
  try {
    const [rows] = await pool.query("SELECT auto_id, boat_no FROM boats WHERE order_id = ?", [order_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "查询失败", error: err.message });
  }
});

// PATCH /api/boats/:auto_id/use 将指定boat的is_sold设为true，并同步减少产品库存
router.patch('/:auto_id/use', async (req, res) => {
  const { auto_id } = req.params;
  const pool = require("../db/connection");
  try {
    // 1. 查出该boat的product_id
    const [boats] = await pool.query('SELECT product_id FROM boats WHERE auto_id = ?', [auto_id]);
    if (!boats.length) return res.status(404).json({ message: '未找到该船' });
    const product_id = boats[0].product_id;

    // 2. 更新boat为已售出
    await pool.query('UPDATE boats SET is_sold = 1 WHERE auto_id = ?', [auto_id]);

    // 3. 同步减少产品库存
    if (product_id) {
      await pool.query('UPDATE products SET quantity = quantity - 1 WHERE id = ?', [product_id]);
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: '更新失败', error: err.message });
  }
});

module.exports = router; 