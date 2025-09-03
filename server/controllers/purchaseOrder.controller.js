const pool = require("../db/connection");

exports.createPurchaseOrder = async (req, res) => {
  try {
    const {
      order_date,
      material_id,
      material_name,
      model,
      property,
      quantity,
      unit,
      unit_price,
      total_amount,
      purchaser,
      status,
      warehouse_id,
      expected_arrival,
      remark,
      is_arrived
    } = req.body;

    const [result] = await pool.query(
        `INSERT INTO purchase_orders
        (order_date, material_id, material_name, model, property, quantity, unit, unit_price, total_amount, purchaser, status, warehouse_id, expected_arrival, remark, is_arrived)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [order_date, material_id, material_name, model, property, quantity, unit, unit_price, total_amount, purchaser, status, warehouse_id, expected_arrival, remark, is_arrived ?? false]
      );
    res.status(201).json({ message: "采购订单创建成功", id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: "采购订单创建失败", error: err.message });
  }
};

exports.getAllPurchaseOrders = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM purchase_orders ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "获取采购订单失败", error: err.message });
  }
};

exports.confirmArrival = async (req, res) => {
  const id = req.params.id;
  try {
    // 1. 查找采购订单
    const [[order]] = await pool.query("SELECT * FROM purchase_orders WHERE id = ?", [id]);
    if (!order) return res.status(404).json({ message: "订单不存在" });
    if (order.is_arrived) return res.status(400).json({ message: "已到货" });

    // 2. 更新订单到货状态
    await pool.query("UPDATE purchase_orders SET is_arrived = 1 WHERE id = ?", [id]);

    // 3. 增加材料库存
    await pool.query(
      "UPDATE materials SET quantity = quantity + ? WHERE id = ?",
      [order.quantity, order.material_id]
    );

    // 4. 记录入库流水
    await pool.query(
      `INSERT INTO inventory_records (material_id, material_name, type, quantity, unit, operator, related_order_id, remark, what) VALUES (?, ?, 'in', ?, ?, ?, ?, ?, ?)` ,
      [order.material_id, order.material_name, order.quantity, order.unit, order.purchaser, order.id, '采购订单入库', '采购订单']
    );

    res.json({ message: "到货确认成功" });
  } catch (err) {
    res.status(500).json({ message: "到货确认失败", error: err.message });
  }
};

exports.reviewPurchaseOrder = async (req, res) => {
  const id = req.params.id;
  const { is_reviewed, is_approved, review_date } = req.body;
  
  try {
    // 转换日期格式为MySQL兼容格式
    let formattedDate = null;
    if (review_date) {
      const date = new Date(review_date);
      formattedDate = date.toISOString().slice(0, 19).replace('T', ' ');
    }
    
    // 更新审核状态
    await pool.query(
      "UPDATE purchase_orders SET is_reviewed = ?, is_approved = ?, review_date = ? WHERE id = ?", 
      [is_reviewed ? 1 : 0, is_approved ? 1 : 0, formattedDate, id]
    );
    
    res.json({ message: "审核状态已更新" });
  } catch (err) {
    res.status(500).json({ message: "审核状态更新失败", error: err.message });
  }
}; 