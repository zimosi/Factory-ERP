const pool = require("../db/connection");

exports.createProductionOrder = async (req, res) => {
  try {
    const {
      sale_order_id,
      product_id,
      product_name,
      serial_no,
      planned_start_date,
      planned_end_date,
      is_reviewed,
      remark
    } = req.body;
    const [result] = await pool.query(
      `INSERT INTO production_orders (sale_order_id, product_id, product_name, serial_no, planned_start_date, planned_end_date, is_reviewed, remark)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)` ,
      [sale_order_id, product_id, product_name, serial_no, planned_start_date, planned_end_date, is_reviewed ?? 0, remark]
    );
    // 新建生产订单后，products表对应产品的code自增1
    if (product_id) {
      await pool.query('UPDATE products SET code = code + 1 WHERE id = ?', [product_id]);
      // 查询BOM
      const [bomRows] = await pool.query(`
        SELECT pm.material_id, m.name as material_name, pm.required_quantity, pm.is_required
        FROM product_materials pm
        LEFT JOIN materials m ON pm.material_id = m.id
        WHERE pm.product_id = ?
      `, [product_id]);
      for (const bom of bomRows) {
        let model = null;
        // 查找型号
        const [matRows] = await pool.query('SELECT model FROM materials WHERE id = ? LIMIT 1', [bom.material_id]);
        if (matRows.length > 0) model = matRows[0].model;
        if (bom.is_required) {
          // 扣减库存，增加used_quantity
          await pool.query(
            'UPDATE materials SET quantity = quantity - ?, used_quantity = used_quantity + ? WHERE id = ?',
            [bom.required_quantity, bom.required_quantity, bom.material_id]
          );
        }
        // 新增：插入production_order_materials表，带上型号
        await pool.query(
          'INSERT INTO production_order_materials (production_order_id, material_id, material_name, model, planned_quantity, used_quantity) VALUES (?, ?, ?, ?, ?, 0)',
          [result.insertId, bom.material_id, bom.material_name, model, bom.required_quantity]
        );
      }
    }
    // 新增：如有sale_order_id，自动插入boats表
    if (typeof sale_order_id !== 'undefined') {
      let saleRemark = '';
      if (sale_order_id && sale_order_id !== 0) {
        try {
          const [saleRows] = await pool.query('SELECT remark FROM sale_orders WHERE id = ?', [sale_order_id]);
          if (saleRows.length) saleRemark = saleRows[0].remark || '';
        } catch {}
      } else {
        saleRemark = remark || '';
      }
      await pool.query(
        `INSERT INTO boats (boat_no, product_id, product_name, order_id, is_completed, is_sold, remark)
         VALUES (?, ?, ?, ?, ?, ?, ?)` ,
        [serial_no, product_id, product_name, sale_order_id, sale_order_id === 0 ? 0 : 0, sale_order_id === 0 ? 0 : 1, saleRemark]
      );
    }
    res.status(201).json({ message: "生产订单创建成功", id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "生产订单创建失败", error: err.message });
  }
};

exports.getAllProductionOrders = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM production_orders ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "获取生产订单失败", error: err.message });
  }
};

exports.getProductionOrderMaterials = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      'SELECT material_id, material_name, model, planned_quantity, used_quantity FROM production_order_materials WHERE production_order_id = ?',
      [id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: '获取生产订单用料失败', error: err.message });
  }
};

exports.updateMaterialUsage = async (req, res) => {
  try {
    const { id, material_id } = req.params;
    const { used } = req.body;
    if (!used || isNaN(used)) {
      return res.status(400).json({ message: '参数used无效' });
    }
    await pool.query(
      'UPDATE production_order_materials SET used_quantity = used_quantity + ? WHERE production_order_id = ? AND material_id = ?',
      [Number(used), id, material_id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: '更新用料失败', error: err.message });
  }
};

exports.completeProductionOrder = async (req, res) => {
  try {
    const { id } = req.params;
    // 1. 标记生产订单完成
    await pool.query('UPDATE production_orders SET is_complete = 1 WHERE id = ?', [id]);
    // 2. 查询所有用料明细
    const [rows] = await pool.query('SELECT material_id, planned_quantity, used_quantity FROM production_order_materials WHERE production_order_id = ?', [id]);
    for (const row of rows) {
      const diff = Number(row.planned_quantity) - Number(row.used_quantity);
      if (diff > 0) {
        // 退回未用材料
        // 先查当前used_quantity和quantity
        const [mats] = await pool.query('SELECT used_quantity, quantity FROM materials WHERE id = ?', [row.material_id]);
        if (mats.length) {
          const newUsed = Math.max(0, Number(mats[0].used_quantity) - diff);
          const newQty = Number(mats[0].quantity) + diff;
          await pool.query('UPDATE materials SET used_quantity = ?, quantity = ? WHERE id = ?', [newUsed, newQty, row.material_id]);
        }
      }
    }
    // 3. 只有sale_order_id为0时，产品库存+1
    const [orderRows] = await pool.query('SELECT product_id, sale_order_id FROM production_orders WHERE id = ?', [id]);
    if (orderRows.length && orderRows[0].product_id && Number(orderRows[0].sale_order_id) === 0) {
      await pool.query('UPDATE products SET quantity = quantity + 1 WHERE id = ?', [orderRows[0].product_id]);
    }
    // 4. 自动将boats表中对应boat_no的is_completed设为1
    const [orderInfo] = await pool.query('SELECT serial_no FROM production_orders WHERE id = ?', [id]);
    if (orderInfo.length && orderInfo[0].serial_no) {
      await pool.query('UPDATE boats SET is_completed = 1 WHERE boat_no = ?', [orderInfo[0].serial_no]);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: '完成生产订单失败', error: err.message });
  }
};

exports.findBySerialNo = async (req, res) => {
  const { serial_no } = req.query;
  if (!serial_no) return res.status(400).json({ message: "缺少船编号" });
  const [rows] = await pool.query("SELECT id FROM production_orders WHERE serial_no = ? LIMIT 1", [serial_no]);
  if (rows.length === 0) return res.status(404).json({ message: "未找到生产订单" });
  res.json({ id: rows[0].id });
}; 