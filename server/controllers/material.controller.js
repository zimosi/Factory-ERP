const pool = require("../db/connection");

exports.searchMaterials = async (req, res) => {
  try {
    const { name, name_like, query } = req.query;
    
    if (name) {
      // 精确查找，返回唯一对象
      const [rows] = await pool.query(
        "SELECT id, name, model, unit, unit_price, warehouse_id, property FROM materials WHERE name = ? LIMIT 1",
        [name]
      );
      if (rows.length === 0) {
        return res.status(404).json({ message: "未找到该材料" });
      }
      res.json(rows[0]);
    } else if (name_like) {
      // 模糊查找，返回数组
      const [rows] = await pool.query(
        "SELECT id, name, model, unit, unit_price, warehouse_id, property FROM materials WHERE name LIKE ? ORDER BY name ASC LIMIT 15",
        [`%${name_like}%`]
      );
      res.json(rows);
    } else if (query) {
      // 通用搜索，支持名称和型号的模糊匹配
      const [rows] = await pool.query(
        "SELECT id, name, model, unit, unit_price, warehouse_id, property FROM materials WHERE name LIKE ? OR model LIKE ? ORDER BY name ASC LIMIT 15",
        [`%${query}%`, `%${query}%`]
      );
      res.json(rows);
    } else {
      // 返回全部
      const [rows] = await pool.query(
        "SELECT id, name, model, unit, unit_price, warehouse_id, property FROM materials ORDER BY name ASC LIMIT 100"
      );
      res.json(rows);
    }
  } catch (err) {
    res.status(500).json({ message: "查询材料失败", error: err.message });
  }
};

// 🆕 新增：根据材料名称获取所有型号
exports.getModelsByName = async (req, res) => {
  try {
    const { name } = req.query;
    console.log("🔍 getModelsByName 被调用，参数:", { name });
    
    if (!name) {
      console.log("❌ 缺少材料名称");
      return res.status(400).json({ message: "缺少材料名称" });
    }
    
    // 获取指定材料名称的所有型号
    const [rows] = await pool.query(
      "SELECT DISTINCT model, unit, unit_price, warehouse_id, property FROM materials WHERE name = ? ORDER BY model ASC",
      [name]
    );
    
    console.log("📊 数据库查询结果:", rows);
    console.log("📊 查询的SQL参数:", [name]);
    
    res.json(rows);
  } catch (err) {
    console.error("❌ getModelsByName 错误:", err);
    res.status(500).json({ message: "获取型号失败", error: err.message });
  }
};

// 🆕 新增：根据材料名称和型号获取完整信息
exports.getMaterialByNameAndModel = async (req, res) => {
  try {
    const { name, model } = req.query;
    if (!name || !model) {
      return res.status(400).json({ message: "缺少材料名称或型号" });
    }
    
    // 根据名称和型号获取完整信息
    const [rows] = await pool.query(
      "SELECT * FROM materials WHERE name = ? AND model = ? LIMIT 1",
      [name, model]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: "未找到该材料" });
    }
    
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "查询材料失败", error: err.message });
  }
};

exports.addInventory = async (req, res) => {
  try {
    const {
      name, warehouse_id, quantity, model, unit_price, unit, property
    } = req.body;
    
    // 检查是否已存在（同时比较名称、型号和仓库ID）
    const [rows] = await pool.query(
      "SELECT id FROM materials WHERE name = ? AND model = ? AND warehouse_id = ?",
      [name, model, warehouse_id]
    );
    
    if (rows.length > 0) {
      // 已存在（名称、型号、仓库都相同），更新数量
      await pool.query(
        "UPDATE materials SET quantity = quantity + ? WHERE name = ? AND model = ? AND warehouse_id = ?",
        [quantity, name, model, warehouse_id]
      );
      res.json({ message: "库存数量已增加" });
    } else {
      // 新材料（名称或型号或仓库不同），插入新记录
      await pool.query(
        "INSERT INTO materials (name, warehouse_id, quantity, model, unit_price, unit, property, used_quantity) VALUES (?, ?, ?, ?, ?, ?, ?, 0)",
        [name, warehouse_id, quantity, model, unit_price, unit, property]
      );
      res.status(201).json({ message: "新材料已添加" });
    }
  } catch (err) {
    res.status(500).json({ message: "添加库存失败", error: err.message });
  }
};

exports.getAllMaterials = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM materials ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "获取材料失败", error: err.message });
  }
};

exports.getMaterialDetail = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) return res.status(400).json({ message: "缺少材料名称" });
    const [rows] = await pool.query(
      "SELECT * FROM materials WHERE name = ? LIMIT 1",
      [name]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "未找到该材料" });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "查询材料详情失败", error: err.message });
  }
};

exports.findMaterialId = async (req, res) => {
  try {
    const { name, model } = req.query;
    if (!name || !model) return res.status(400).json({ message: "缺少材料名称或型号" });
    const [rows] = await pool.query(
      "SELECT * FROM materials WHERE name = ? AND model = ? LIMIT 1",
      [name, model]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "未找到该材料" });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "查找材料ID失败", error: err.message });
  }
};

exports.extractMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    if (!quantity || isNaN(quantity)) {
      return res.status(400).json({ message: '参数quantity无效' });
    }
    // 先查当前used_quantity
    const [rows] = await pool.query('SELECT used_quantity FROM materials WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ message: '未找到材料' });
    const current = rows[0].used_quantity;
    const newUsed = Math.max(0, current - Number(quantity));
    await pool.query('UPDATE materials SET used_quantity = ? WHERE id = ?', [newUsed, id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: '提取失败', error: err.message });
  }
};

exports.getModelsByName = async (req, res) => {
  const { name } = req.query;
  if (!name) return res.status(400).json({ message: "缺少材料名称" });
  const [rows] = await pool.query(
    "SELECT DISTINCT model FROM materials WHERE name = ? AND model IS NOT NULL AND model != ''",
    [name]
  );
  res.json(rows.map(r => r.model));
};

exports.getMaterialById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "缺少材料ID" });
    const [rows] = await pool.query(
      "SELECT * FROM materials WHERE id = ? LIMIT 1",
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "未找到该材料" });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "查询材料详情失败", error: err.message });
  }
};

exports.getProcessingMaterials = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, model, quantity, min_quantity, unit_price, unit FROM materials WHERE warehouse_id = 3 AND quantity < min_quantity ORDER BY name, model"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "获取加工件失败", error: err.message });
  }
};

exports.getAllProcessingMaterials = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, model, quantity, unit_price, unit FROM materials WHERE warehouse_id = 3 ORDER BY name, model"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "获取加工件失败", error: err.message });
  }
};

// 通用材料搜索接口 - 用于自制品和材料的自动补全
exports.searchMaterials = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.trim() === '') {
      return res.json([]);
    }
    
    const searchQuery = `%${query.trim()}%`;
    const [rows] = await pool.query(
      "SELECT id, name, model, quantity, unit_price, unit, warehouse_id FROM materials WHERE name LIKE ? OR model LIKE ? ORDER BY name, model LIMIT 20",
      [searchQuery, searchQuery]
    );
    
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "搜索材料失败", error: err.message });
  }
}; 