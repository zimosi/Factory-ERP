const pool = require("../db/connection");

const ReturnOrder = {
  async create(order) {
    const [result] = await pool.query(
      `INSERT INTO return_orders (material_id, material_name, model, quantity, unit_price, operator) VALUES (?, ?, ?, ?, ?, ?)`,
      [order.material_id, order.material_name, order.model, order.quantity, order.unit_price, order.operator]
    );
    return result.insertId;
  },

  async findAll() {
    const [rows] = await pool.query("SELECT * FROM return_orders ORDER BY id DESC");
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query("SELECT * FROM return_orders WHERE id = ?", [id]);
    return rows[0];
  },
};

module.exports = ReturnOrder; 