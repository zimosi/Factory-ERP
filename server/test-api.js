const pool = require("./db/connection");

async function testAPI() {
  try {
    console.log("🧪 测试API功能...");
    
    const connection = await pool.getConnection();
    
    // 测试1：直接查询数据库
    console.log("\n1️⃣ 直接查询数据库:");
    const [directQuery] = await connection.query(
      "SELECT DISTINCT model, unit, unit_price, warehouse_id, property FROM materials WHERE name = ? ORDER BY model ASC",
      ["树脂"]
    );
    console.log("直接查询结果:", directQuery);
    
    // 测试2：检查编码
    console.log("\n2️⃣ 检查编码问题:");
    const [encodingTest] = await connection.query(
      "SELECT name, HEX(name), model, HEX(model) FROM materials WHERE name = '树脂'"
    );
    console.log("编码测试结果:", encodingTest);
    
    // 测试3：使用LIKE查询
    console.log("\n3️⃣ 使用LIKE查询:");
    const [likeQuery] = await connection.query(
      "SELECT DISTINCT model, unit, unit_price, warehouse_id, property FROM materials WHERE name LIKE ? ORDER BY model ASC",
      ["%树脂%"]
    );
    console.log("LIKE查询结果:", likeQuery);
    
    // 测试4：检查所有材料名称
    console.log("\n4️⃣ 检查所有材料名称:");
    const [allNames] = await connection.query(
      "SELECT DISTINCT name FROM materials ORDER BY name"
    );
    console.log("所有材料名称:", allNames.map(row => row.name));
    
    connection.release();
    console.log("\n✅ 测试完成");
    
  } catch (error) {
    console.error("❌ 测试失败:", error.message);
  } finally {
    process.exit(0);
  }
}

testAPI();
