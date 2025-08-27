const pool = require("./db/connection");

async function testSimple() {
  try {
    console.log("🧪 简单测试开始...");
    
    const connection = await pool.getConnection();
    console.log("✅ 连接成功");
    
    // 测试1：直接查询
    const [rows1] = await connection.query("SELECT * FROM materials WHERE name = ?", ["树脂"]);
    console.log("测试1结果:", rows1.length, "条记录");
    
    // 测试2：使用DISTINCT查询型号
    const [rows2] = await connection.query(
      "SELECT DISTINCT model, unit, unit_price, warehouse_id, property FROM materials WHERE name = ? ORDER BY model ASC",
      ["树脂"]
    );
    console.log("测试2结果:", rows2.length, "条记录");
    console.log("测试2数据:", rows2);
    
    // 测试3：检查字符编码
    const [rows3] = await connection.query("SELECT name, LENGTH(name), HEX(name) FROM materials WHERE name = ?", ["树脂"]);
    console.log("测试3结果:", rows3);
    
    connection.release();
    console.log("✅ 测试完成");
    
  } catch (error) {
    console.error("❌ 测试失败:", error.message);
  } finally {
    process.exit(0);
  }
}

testSimple();
