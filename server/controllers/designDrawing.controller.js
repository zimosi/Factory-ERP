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

    // 4. 预占材料库存 - 减少quantity，增加used_quantity
    for (const material of materials) {
      // 根据材料名称和型号查找材料ID
      let materialId = material.material_id;
      
      if (!materialId) {
        // 如果没有material_id，根据名称和型号查找
        const [materialRows] = await connection.query(
          `SELECT id FROM materials WHERE name = ? AND model = ?`,
          [material.material_name, material.model]
        );
        
        if (materialRows.length > 0) {
          materialId = materialRows[0].id;
        }
      }
      
      if (materialId) {
        // 先检查库存是否足够
        const [stockRows] = await connection.query(
          `SELECT quantity FROM materials WHERE id = ?`,
          [materialId]
        );
        
        if (stockRows.length === 0) {
          throw new Error(`材料 ${material.material_name} (${material.model}) 不存在`);
        }
        
        const currentStock = stockRows[0].quantity;
        if (currentStock < material.quantity) {
          throw new Error(`材料 ${material.material_name} (${material.model}) 库存不足，当前库存: ${currentStock}，需要: ${material.quantity}`);
        }
        
        // 预占库存：减少quantity，增加used_quantity（不记录到inventory_records）
        const quantityInt = Math.round(material.quantity);
        await connection.query(
          `UPDATE materials 
           SET quantity = quantity - ?, 
               used_quantity = used_quantity + ?
           WHERE id = ?`,
          [quantityInt, quantityInt, materialId]
        );
      } else {
        throw new Error(`无法找到材料: ${material.material_name} (${material.model})`);
      }
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

// 完成生产
exports.completeProduction = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;
    const { operator = "系统操作员" } = req.body;
    
    // 1. 获取设计图纸信息
    const [drawings] = await connection.query(
      "SELECT * FROM design_drawings WHERE id = ?",
      [id]
    );
    
    if (drawings.length === 0) {
      return res.status(404).json({ message: "设计图纸不存在" });
    }
    
    const drawing = drawings[0];
    
    // 检查是否已经完成
    if (drawing.status === 'completed') {
      return res.status(400).json({ message: "该设计图纸已经完成生产" });
    }
    
    // 2. 获取原材料明细和加工件明细
    const [materials] = await connection.query(
      "SELECT * FROM design_drawing_materials WHERE drawing_id = ?",
      [id]
    );
    
    const [products] = await connection.query(
      "SELECT * FROM design_drawing_products WHERE drawing_id = ?",
      [id]
    );
    
    if (products.length === 0) {
      return res.status(400).json({ message: "没有找到加工件信息" });
    }
    
    // 3. 更新加工件库存 - 增加quantity
    for (const product of products) {
      // 查找或创建加工件材料记录
      let materialId = product.product_id;
      
      if (!materialId) {
        // 如果product_id为空，根据名称和型号查找或创建材料记录
        const [existingMaterials] = await connection.query(
          `SELECT id FROM materials WHERE name = ? AND model = ? AND warehouse_id = 3`,
          [product.product_name, product.model]
        );
        
        if (existingMaterials.length > 0) {
          materialId = existingMaterials[0].id;
        } else {
          // 创建新的加工件材料记录
          const [insertResult] = await connection.query(
            `INSERT INTO materials (name, model, warehouse_id, quantity, used_quantity, unit, unit_price) 
             VALUES (?, ?, 3, 0, 0, ?, ?)`,
            [product.product_name, product.model, product.unit, product.unit_price]
          );
          materialId = insertResult.insertId;
        }
      }
      
      // 更新库存：增加quantity
      const quantityInt = Math.round(product.quantity);
      await connection.query(
        `UPDATE materials 
         SET quantity = quantity + ?
         WHERE id = ?`,
        [quantityInt, materialId]
      );
      
      // 记录库存变动
      await connection.query(
        `INSERT INTO inventory_records 
         (material_id, material_name, type, quantity, unit, operator, related_order_id, remark, what) 
         VALUES (?, ?, 'in', ?, ?, ?, ?, ?, '完成生产')`,
        [
          materialId,
          product.product_name,
          quantityInt,
          product.unit || '',
          operator,
          id,
          `设计图纸 ${drawing.drawing_no} 完成生产`
        ]
      );
    }
    
    // 4. 更新设计图纸状态
    await connection.query(
      `UPDATE design_drawings 
       SET status = 'completed', completed_at = NOW()
       WHERE id = ?`,
      [id]
    );
    
    await connection.commit();
    
    res.json({
      message: "生产完成成功",
      drawing_id: id,
      drawing_no: drawing.drawing_no,
      completed_products: products.length
    });
    
  } catch (error) {
    await connection.rollback();
    console.error("完成生产失败:", error);
    res.status(500).json({ message: "完成生产失败", error: error.message });
  } finally {
    connection.release();
  }
};

// 创建设计图纸领料单
exports.createDrawingPickOrder = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { drawing_id, items, operator = "系统操作员", remark = "设计图纸领料" } = req.body;
    
    // 验证参数
    if (!drawing_id || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "参数不完整" });
    }
    
    // 验证设计图纸是否存在
    const [drawings] = await connection.query(
      "SELECT * FROM design_drawings WHERE id = ?",
      [drawing_id]
    );
    
    if (drawings.length === 0) {
      return res.status(404).json({ message: "设计图纸不存在" });
    }
    
    const drawing = drawings[0];
    
    // 1. 插入领料单主表
    const [pickOrderResult] = await connection.query(
      `INSERT INTO material_pick_orders (production_order_id, operator, remark, what) 
       VALUES (NULL, ?, ?, '设计图纸')`,
      [operator, remark]
    );
    
    const pickOrderId = pickOrderResult.insertId;
    
    // 2. 插入领料单明细（不更新库存）
    for (const item of items) {
      if (!item.material_id || !item.quantity || isNaN(item.quantity) || Number(item.quantity) <= 0) {
        throw new Error("明细参数不完整");
      }
      
      // 获取材料信息
      const [materialRows] = await connection.query(
        "SELECT * FROM materials WHERE id = ?",
        [item.material_id]
      );
      
      if (materialRows.length === 0) {
        throw new Error(`材料ID ${item.material_id} 不存在`);
      }
      
      const material = materialRows[0];
      
      // 插入领料单明细
      const quantityDecimal = parseFloat(item.quantity).toFixed(2);
      await connection.query(
        `INSERT INTO material_pick_order_items (pick_order_id, material_id, model, material_name, quantity, what) 
         VALUES (?, ?, ?, ?, ?, '设计图纸')`,
        [pickOrderId, item.material_id, material.model, material.name, quantityDecimal]
      );
    }
    
    // 3. 更新设计图纸状态为生产中
    await connection.query(
      `UPDATE design_drawings 
       SET status = 'in_production'
       WHERE id = ?`,
      [drawing_id]
    );
    
    await connection.commit();
    
    res.status(201).json({
      message: "设计图纸领料单创建成功",
      pick_order_id: pickOrderId,
      drawing_id: drawing_id,
      drawing_no: drawing.drawing_no,
      items_count: items.length
    });
    
  } catch (error) {
    await connection.rollback();
    console.error("创建设计图纸领料单失败:", error);
    res.status(500).json({ message: "创建设计图纸领料单失败", error: error.message });
  } finally {
    connection.release();
  }
};
