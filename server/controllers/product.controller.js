const pool = require("../db/connection");

exports.createProduct = async (req, res) => {
  try {
    const { name, warehouse_id, quantity, unit_price, unit } = req.body;
    if (!name || !warehouse_id || quantity === undefined) {
      return res.status(400).json({ message: "产品名称、仓库ID和库存数量必填" });
    }
    const [result] = await pool.query(
      `INSERT INTO products (name, warehouse_id, quantity, unit_price, unit)
       VALUES (?, ?, ?, ?, ?)`,
      [name, warehouse_id, quantity, unit_price || null, unit || null]
    );
    res.status(201).json({ message: "产品添加成功", id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: "产品添加失败", error: err.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM products ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "获取产品失败", error: err.message });
  }
};

exports.batchAddProductMaterials = async (req, res) => {
  try {
    const { product_id, materials } = req.body;
    if (!product_id || !Array.isArray(materials) || materials.length === 0) {
      return res.status(400).json({ message: "产品ID和材料列表必填" });
    }
    const values = materials.map(m => [product_id, m.material_id, m.required_quantity, m.is_required ?? 1]);
    await pool.query(
      `INSERT INTO product_materials (product_id, material_id, required_quantity, is_required) VALUES ?`,
      [values]
    );
    res.status(201).json({ message: "产品报目单添加成功" });
  } catch (err) {
    res.status(500).json({ message: "产品报目单添加失败", error: err.message });
  }
};

exports.getAllProductBoms = async (req, res) => {
  try {
    // 查询所有产品及其材料清单
    const [rows] = await pool.query(`
      SELECT p.id as product_id, p.name as product_name, m.id as material_id, m.name as material_name, pm.required_quantity, pm.is_required
      FROM products p
      LEFT JOIN product_materials pm ON p.id = pm.product_id
      LEFT JOIN materials m ON pm.material_id = m.id
      ORDER BY p.id, pm.id
    `);
    // 整理为产品分组
    const result = {};
    for (const row of rows) {
      if (!result[row.product_id]) {
        result[row.product_id] = {
          product_id: row.product_id,
          product_name: row.product_name,
          materials: []
        };
      }
      if (row.material_id) {
        result[row.product_id].materials.push({
          material_id: row.material_id,
          material_name: row.material_name,
          required_quantity: row.required_quantity,
          is_required: row.is_required
        });
      }
    }
    res.json(Object.values(result));
  } catch (err) {
    res.status(500).json({ message: "获取产品报目单失败", error: err.message });
  }
};

exports.getProductBom = async (req, res) => {
  try {
    const product_id = req.params.id;
    const [rows] = await pool.query(`
      SELECT pm.material_id, m.name as material_name, pm.required_quantity, pm.is_required
      FROM product_materials pm
      LEFT JOIN materials m ON pm.material_id = m.id
      WHERE pm.product_id = ?
      ORDER BY pm.id
    `, [product_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "获取产品BOM失败", error: err.message });
  }
}; 