const pool = require("../db/connection");

const AfterSalesOrderMaterial = {
  async create({ after_sales_order_id, material_id, material_name, model, quantity, unit, unit_price, remark }) {
    const [result] = await pool.query(
      `INSERT INTO after_sales_order_materials (after_sales_order_id, material_id, material_name, model, quantity, unit, unit_price, remark) VALUES (?, ?, ?, ?, ?, ?, ?, ?)` ,
      [after_sales_order_id, material_id, material_name, model, quantity, unit, unit_price, remark]
    );
    return result.insertId;
  },
  async findByOrderId(after_sales_order_id) {
    const [rows] = await pool.query("SELECT * FROM after_sales_order_materials WHERE after_sales_order_id = ? ORDER BY id ASC", [after_sales_order_id]);
    return rows;
  },
  async deleteById(id) {
    await pool.query("DELETE FROM after_sales_order_materials WHERE id = ?", [id]);
  },
  async updateMaterialStock(material_id, quantity) {
    await pool.query(
      "UPDATE materials SET quantity = quantity - ?, used_quantity = used_quantity + ? WHERE id = ?",
      [quantity, quantity, material_id]
    );
  }
};

module.exports = AfterSalesOrderMaterial; 