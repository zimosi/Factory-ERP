const pool = require("../db/connection");

exports.createSaleOrder = async (req, res) => {
  try {
    const {
      order_date,
      sales_person,
      product,
      quantity,
      customer,
      total_amount,
      deposit_amount,
      delivery_date,
      remark
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO sale_orders 
      (order_date, sales_person, product, quantity, customer, total_amount, deposit_amount, delivery_date, remark)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [order_date, sales_person, product, quantity, customer, total_amount, deposit_amount, delivery_date, remark]
    );
    res.status(201).json({ message: "订单创建成功", id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: "订单创建失败", error: err.message });
  }
};

exports.getAllSaleOrders = async (req, res) => {
  try {
    const { sales_person, date_from, date_to } = req.query;
    let sql = "SELECT * FROM sale_orders WHERE 1=1";
    const params = [];

    if (sales_person) {
      sql += " AND sales_person = ?";
      params.push(sales_person);
    }
    if (date_from) {
      sql += " AND order_date >= ?";
      params.push(date_from);
    }
    if (date_to) {
      sql += " AND order_date <= ?";
      params.push(date_to);
    }
    sql += " ORDER BY id DESC";

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "获取订单失败", error: err.message });
  }
}; 