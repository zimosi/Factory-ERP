const pool = require("./db/connection");

async function checkDatabase() {
  try {
    console.log("🔍 正在检查数据库连接...");
    
    // 测试连接
    const connection = await pool.getConnection();
    console.log("✅ 数据库连接成功");
    
    // 检查数据库
    const [databases] = await connection.query("SHOW DATABASES");
    console.log("📚 可用数据库:", databases.map(db => db.Database));
    
    // 使用factory_erp数据库
    await connection.query("USE factory_erp");
    console.log("✅ 切换到 factory_erp 数据库");
    
    // 检查表
    const [tables] = await connection.query("SHOW TABLES");
    console.log("📋 可用表:", tables.map(table => Object.values(table)[0]));
    
    // 检查materials表
    try {
      const [tableInfo] = await connection.query("DESCRIBE materials");
      console.log("\n📊 materials表结构:");
      console.table(tableInfo);
      
      // 检查表中的数据
      const [data] = await connection.query("SELECT COUNT(*) as count FROM materials");
      console.log(`\n📈 materials表中有 ${data[0].count} 条记录`);
      
      if (data[0].count > 0) {
        const [sampleData] = await connection.query("SELECT * FROM materials LIMIT 5");
        console.log("\n🔍 materials表示例数据:");
        console.table(sampleData);
      } else {
        console.log("⚠️  materials表中没有数据！");
      }
    } catch (error) {
      console.log("❌ materials表不存在或有问题:", error.message);
    }
    
    connection.release();
    console.log("\n✅ 数据库检查完成");
    
  } catch (error) {
    console.error("❌ 数据库检查失败:", error.message);
  } finally {
    process.exit(0);
  }
}

checkDatabase();
