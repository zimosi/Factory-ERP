const pool = require("./db/connection");

async function testProcessingMaterials() {
  try {
    console.log("🧪 测试加工件材料API...");
    
    const connection = await pool.getConnection();
    console.log("✅ 数据库连接成功");
    
    // 检查 materials 表中的加工件材料
    console.log("\n1️⃣ 检查加工件材料 (warehouse_id = 3):");
    const [processingMaterials] = await connection.query(
      "SELECT * FROM materials WHERE warehouse_id = 3 ORDER BY id"
    );
    console.log(`找到 ${processingMaterials.length} 种加工件材料`);
    
    if (processingMaterials.length > 0) {
      console.log("\n加工件材料列表:");
      processingMaterials.forEach((material, index) => {
        console.log(`${index + 1}. ${material.name} (${material.model || '无型号'}) - 库存: ${material.quantity} ${material.unit}`);
      });
    } else {
      console.log("⚠️  没有找到加工件材料，请检查:");
      console.log("1. materials 表中是否有 warehouse_id = 3 的记录");
      console.log("2. 或者先添加一些加工件材料");
    }
    
    // 检查仓库信息
    console.log("\n2️⃣ 检查仓库信息:");
    const [warehouses] = await connection.query("SELECT * FROM warehouses WHERE id = 3");
    if (warehouses.length > 0) {
      console.log("仓库3信息:", warehouses[0]);
    } else {
      console.log("⚠️  仓库3不存在");
    }
    
    connection.release();
    console.log("\n✅ 测试完成");
    
  } catch (error) {
    console.error("❌ 测试失败:", error.message);
  } finally {
    process.exit(0);
  }
}

testProcessingMaterials();
