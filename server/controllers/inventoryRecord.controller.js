const pool = require("../db/connection");

exports.addInventoryRecord = async (req, res) => {
  try {
    console.log("收到库存记录请求体：", req.body);
    const { material_id, material_name, type, quantity, unit, operator, related_order_id, remark, what } = req.body;
    await pool.query(
      `INSERT INTO inventory_records (material_id, material_name, type, quantity, unit, operator, related_order_id, remark, what) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
      [material_id, material_name, type, quantity, unit, operator, related_order_id, remark, what || null]
    );
    res.status(201).json({ message: "记录添加成功" });
  } catch (err) {
    res.status(500).json({ message: "记录添加失败", error: err.message });
  }
};

exports.getInventoryRecords = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM inventory_records ORDER BY created_at DESC, id DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "获取记录失败", error: err.message });
  }
}; 