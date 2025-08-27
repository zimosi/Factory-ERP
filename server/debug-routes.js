const pool = require("./db/connection");

async function debugRoutes() {
  try {
    console.log("🔍 开始调试路由...");
    
    const connection = await pool.getConnection();
    console.log("✅ 数据库连接成功");
    
    // 测试1：检查数据库中的材料
    console.log("\n1️⃣ 检查数据库中的材料:");
    const [materials] = await connection.query("SELECT id, name, model FROM materials WHERE name = '树脂'");
    console.log("树脂材料:", materials);
    
    // 测试2：测试SQL查询
    console.log("\n2️⃣ 测试SQL查询:");
    const [models] = await connection.query(
      "SELECT DISTINCT model, unit, unit_price, warehouse_id, property FROM materials WHERE name = ? ORDER BY model ASC",
      ["树脂"]
    );
    console.log("型号查询结果:", models);
    
    // 测试3：检查路由是否被正确加载
    console.log("\n3️⃣ 检查Express路由:");
    console.log("这个测试需要在服务器运行时进行");
    
    connection.release();
    console.log("\n✅ 数据库测试完成");
    
  } catch (error) {
    console.error("❌ 测试失败:", error.message);
  } finally {
    process.exit(0);
  }
}

debugRoutes();
