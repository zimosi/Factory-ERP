const pool = require("./db/connection");

async function testPurchaseApproval() {
  try {
    console.log("🧪 测试采购订单审核功能...");
    
    const connection = await pool.getConnection();
    console.log("✅ 数据库连接成功");
    
    // 检查 purchase_orders 表结构
    console.log("\n1️⃣ 检查 purchase_orders 表结构:");
    const [tableInfo] = await connection.query("DESCRIBE purchase_orders");
    console.log("表结构:", tableInfo.map(col => ({ field: col.Field, type: col.Type, null: col.Null, default: col.Default })));
    
    // 检查是否有审核字段
    const hasReviewFields = tableInfo.some(col => 
      col.Field === 'is_reviewed' || col.Field === 'is_approved' || col.Field === 'review_date'
    );
    
    if (!hasReviewFields) {
      console.log("⚠️  缺少审核字段，需要执行 SQL 脚本");
      console.log("请运行: ALTER TABLE purchase_orders ADD COLUMN is_reviewed BOOLEAN DEFAULT FALSE");
      console.log("请运行: ALTER TABLE purchase_orders ADD COLUMN is_approved BOOLEAN DEFAULT NULL");
      console.log("请运行: ALTER TABLE purchase_orders ADD COLUMN review_date DATETIME DEFAULT NULL");
    } else {
      console.log("✅ 审核字段已存在");
    }
    
    // 检查现有采购订单
    console.log("\n2️⃣ 检查现有采购订单:");
    const [orders] = await connection.query("SELECT id, material_name, is_reviewed, is_approved FROM purchase_orders LIMIT 5");
    console.log("采购订单:", orders);
    
    connection.release();
    console.log("\n✅ 测试完成");
    
  } catch (error) {
    console.error("❌ 测试失败:", error.message);
  } finally {
    process.exit(0);
  }
}

testPurchaseApproval();
