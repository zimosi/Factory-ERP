const pool = require("../db/connection");

const MaterialSaleOrder = {
  async create(order) {
    const [result] = await pool.query(
      `INSERT INTO material_sale_orders (order_date, sales_person, material_id, material_name, model, quantity, unit_price, customer, total_amount, deposit_amount, delivery_date, remark) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
      [order.order_date, order.sales_person, order.material_id, order.material_name, order.model, order.quantity, order.unit_price, order.customer, order.total_amount, order.deposit_amount, order.delivery_date, order.remark]
    );
    
    // 创建订单后，自动更新材料库存和已使用数量
    if (order.material_id && order.quantity) {
      await pool.query(
        `UPDATE materials SET quantity = quantity - ?, used_quantity = used_quantity + ? WHERE id = ?`,
        [order.quantity, order.quantity, order.material_id]
      );
    }
    
    return result.insertId;
  },
  async findAll() {
    const [rows] = await pool.query("SELECT * FROM material_sale_orders ORDER BY id DESC");
    return rows;
  }
};

module.exports = MaterialSaleOrder; 