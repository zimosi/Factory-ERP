const pool = require("../db/connection");

exports.createPickOrder = async (req, res) => {
  try {
    let { production_order_id, serial_no, items, remark, operator } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "参数不完整" });
    }
    // 如果没有 production_order_id 但有 serial_no，自动查找
    if ((!production_order_id || production_order_id === 0) && serial_no) {
      const [prodRows] = await pool.query(
        "SELECT id FROM production_orders WHERE serial_no = ? LIMIT 1",
        [serial_no]
      );
      if (prodRows.length > 0) {
        production_order_id = prodRows[0].id;
      } else {
        production_order_id = null; // 查不到则为 null
      }
    }
    // 如果 production_order_id 为 0 或未传，赋值为 null，避免外键约束错误
    if (!production_order_id || production_order_id === 0) production_order_id = null;
    // 判断是否为维修工单生成的领料单
    let pickRemark = remark;
    let pickOperator = operator;
    if (remark === '售后维修' || remark === '维修工单自动生成') {
      // 优先用req.body.operator，否则尝试req.user
      if (!pickOperator && req.user && req.user.username) {
        pickOperator = req.user.username;
      }
      pickRemark = '售后维修';
    }
    // 插入主表
    const [result] = await pool.query(
      "INSERT INTO material_pick_orders (production_order_id, operator, remark, what) VALUES (?, ?, ?, ?)",
      [production_order_id, pickOperator || null, pickRemark || null, req.body.what || null]
    );
    const pick_order_id = result.insertId;
    // 插入明细
    for (const item of items) {
      if (!item.material_id || !item.quantity || isNaN(item.quantity) || Number(item.quantity) <= 0) {
        return res.status(400).json({ message: "明细参数不完整" });
      }
      let model = item.model;
      if (!model) {
        const [matRows] = await pool.query('SELECT model FROM materials WHERE id = ? LIMIT 1', [item.material_id]);
        if (matRows.length > 0) model = matRows[0].model;
      }
      await pool.query(
        "INSERT INTO material_pick_order_items (pick_order_id, material_id, model, quantity, what) VALUES (?, ?, ?, ?, ?)",
        [pick_order_id, item.material_id, model || null, item.quantity, req.body.what || null]
      );
    }
    res.status(201).json({ message: "领料单创建成功", pick_order_id });
  } catch (err) {
    res.status(500).json({ message: "领料单创建失败", error: err.message });
  }
};

exports.getAllPickOrders = async (req, res) => {
  try {
    // 查询主表和明细表，按领料单分组
    const [orders] = await pool.query(`
      SELECT mpo.id as pick_order_id, mpo.production_order_id, mpo.created_at, mpo.operator, mpo.remark,
             poi.id as item_id, poi.material_id, poi.model, poi.quantity, poi.what, m.name as material_name, m.unit as unit
      FROM material_pick_orders mpo
      LEFT JOIN material_pick_order_items poi ON mpo.id = poi.pick_order_id
      LEFT JOIN materials m ON poi.material_id = m.id
      ORDER BY mpo.id DESC, poi.id
    `);
    // 分组
    const result = {};
    for (const row of orders) {
      if (!result[row.pick_order_id]) {
        result[row.pick_order_id] = {
          pick_order_id: row.pick_order_id,
          production_order_id: row.production_order_id,
          created_at: row.created_at,
          operator: row.operator,
          remark: row.remark,
          items: []
        };
      }
      if (row.item_id) {
        result[row.pick_order_id].items.push({
          item_id: row.item_id,
          material_id: row.material_id,
          material_name: row.material_name,
          model: row.model,
          quantity: row.quantity,
          unit: row.unit,
          what: row.what // 新增what字段
        });
      }
    }
    res.json(Object.values(result));
  } catch (err) {
    res.status(500).json({ message: '获取领料单失败', error: err.message });
  }
};

exports.deletePickOrder = async (req, res) => {
  try {
    const { id } = req.params;
    // 查询明细用于记录出库
    const [items] = await pool.query('SELECT poi.material_id, poi.quantity, m.name as material_name, m.unit FROM material_pick_order_items poi LEFT JOIN materials m ON poi.material_id = m.id WHERE poi.pick_order_id = ?', [id]);
    // 删除明细和主表
    await pool.query('DELETE FROM material_pick_order_items WHERE pick_order_id = ?', [id]);
    await pool.query('DELETE FROM material_pick_orders WHERE id = ?', [id]);
    // 插入出库记录
    // 删除所有 INSERT INTO inventory_records 相关代码
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: '删除领料单失败', error: err.message });
  }
}; 