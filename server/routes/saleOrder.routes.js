const express = require("express");
const router = express.Router();
const saleOrderController = require("../controllers/saleOrder.controller");
const pool = require("../db/connection");

router.post("/", saleOrderController.createSaleOrder);
router.get("/", saleOrderController.getAllSaleOrders);

// PATCH /api/sale-orders/:id/used-quantity 增加used_quantity，并自动联动is_reviewed
router.patch('/:id/used-quantity', async (req, res) => {
  const { id } = req.params;
  const { add } = req.body;
  if (!add || isNaN(add)) {
    return res.status(400).json({ message: '参数add无效' });
  }
  try {
    await pool.query(
      'UPDATE sale_orders SET used_quantity = IFNULL(used_quantity,0) + ? WHERE id = ?',
      [Number(add), id]
    );
    // 判断是否需要自动review
    const [rows] = await pool.query('SELECT used_quantity, quantity FROM sale_orders WHERE id = ?', [id]);
    if (rows.length && rows[0].used_quantity === rows[0].quantity) {
      await pool.query('UPDATE sale_orders SET is_reviewed = 1 WHERE id = ?', [id]);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: '更新失败', error: err.message });
  }
});

module.exports = router; 