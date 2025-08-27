const pool = require("../db/connection");

// 创建设计图纸
exports.createDesignDrawing = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const {
      drawing_no,
      designer,
      remark,
      materials,
      products,
      total_material_cost
    } = req.body;
    
    // 验证必填字段
    if (!drawing_no || !designer || !materials || !products) {
      return res.status(400).json({ message: "缺少必填字段" });
    }
    
    if (materials.length === 0) {
      return res.status(400).json({ message: "至少需要一种原材料" });
    }
    
    if (products.length === 0) {
      return res.status(400).json({ message: "至少需要一种加工件" });
    }
    
    // 1. 插入设计图纸主表
    const [drawingResult] = await connection.query(
      `INSERT INTO design_drawings (drawing_no, designer, remark, total_material_cost) 
       VALUES (?, ?, ?, ?)`,
      [drawing_no, designer, remark, total_material_cost]
    );
    
    const drawingId = drawingResult.insertId;
    
    // 2. 插入原材料明细
    for (const material of materials) {
      await connection.query(
        `INSERT INTO design_drawing_materials 
         (drawing_id, material_id, material_name, model, quantity, unit, unit_price, subtotal) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          drawingId,
          material.material_id,
          material.material_name,
          material.model,
          material.quantity,
          material.unit,
          material.unit_price,
          material.subtotal
        ]
      );
    }
    
    // 3. 插入加工件明细
    for (const product of products) {
      await connection.query(
        `INSERT INTO design_drawing_products 
         (drawing_id, product_id, product_name, model, quantity, unit, unit_price, subtotal) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          drawingId,
          product.product_id || null, // 如果是新加工件，product_id可能为null
          product.product_name,
          product.model,
          product.quantity,
          product.unit,
          product.unit_price,
          product.subtotal
        ]
      );
    }
    
    await connection.commit();
    
    res.status(201).json({
      message: "设计图纸创建成功",
      id: drawingId,
      drawing_no: drawing_no
    });
    
  } catch (error) {
    await connection.rollback();
    console.error("创建设计图纸失败:", error);
    res.status(500).json({ message: "创建设计图纸失败", error: error.message });
  } finally {
    connection.release();
  }
};

// 获取所有设计图纸
exports.getAllDesignDrawings = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        d.*,
        COUNT(DISTINCT dm.id) as material_count,
        COUNT(DISTINCT dp.id) as product_count
      FROM design_drawings d
      LEFT JOIN design_drawing_materials dm ON d.id = dm.drawing_id
      LEFT JOIN design_drawing_products dp ON d.id = dp.drawing_id
      GROUP BY d.id
      ORDER BY d.created_at DESC
    `);
    
    res.json(rows);
  } catch (error) {
    console.error("获取设计图纸失败:", error);
    res.status(500).json({ message: "获取设计图纸失败", error: error.message });
  }
};

// 获取设计图纸详情
exports.getDesignDrawingById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 获取主表信息
    const [drawings] = await pool.query(
      "SELECT * FROM design_drawings WHERE id = ?",
      [id]
    );
    
    if (drawings.length === 0) {
      return res.status(404).json({ message: "设计图纸不存在" });
    }
    
    const drawing = drawings[0];
    
    // 获取原材料明细
    const [materials] = await pool.query(
      "SELECT * FROM design_drawing_materials WHERE drawing_id = ?",
      [id]
    );
    
    // 获取加工件明细
    const [products] = await pool.query(
      "SELECT * FROM design_drawing_products WHERE drawing_id = ?",
      [id]
    );
    
    res.json({
      ...drawing,
      materials,
      products
    });
    
  } catch (error) {
    console.error("获取设计图纸详情失败:", error);
    res.status(500).json({ message: "获取设计图纸详情失败", error: error.message });
  }
};
