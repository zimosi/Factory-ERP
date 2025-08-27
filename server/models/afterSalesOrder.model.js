const pool = require("../db/connection");

const AfterSalesOrder = {
  async create({ boat_id, serial_no, sale_order_id, reason, is_complete }) {
    const [result] = await pool.query(
      `INSERT INTO after_sales_orders (boat_id, serial_no, sale_order_id, reason, is_complete) VALUES (?, ?, ?, ?, ?)` ,
      [boat_id, serial_no, sale_order_id, reason, is_complete || false]
    );
    return result.insertId;
  },
  async findAll() {
    const [rows] = await pool.query("SELECT * FROM after_sales_orders ORDER BY created_at DESC, id DESC");
    return rows;
  },
  async findById(id) {
    const [rows] = await pool.query("SELECT * FROM after_sales_orders WHERE id = ?", [id]);
    return rows[0];
  },
  async findBySaleOrderId(sale_order_id) {
    const [rows] = await pool.query("SELECT * FROM after_sales_orders WHERE sale_order_id = ? ORDER BY created_at DESC", [sale_order_id]);
    return rows;
  },
  async updateStatus(id, is_complete) {
    await pool.query("UPDATE after_sales_orders SET is_complete = ? WHERE id = ?", [is_complete, id]);
  },
  async updatePrice(id, price) {
    await pool.query("UPDATE after_sales_orders SET price = ? WHERE id = ?", [price, id]);
  }
};

module.exports = AfterSalesOrder; 