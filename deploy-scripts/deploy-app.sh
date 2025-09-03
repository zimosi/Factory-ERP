#!/bin/bash

# 工厂ERP应用部署脚本

echo "开始部署工厂ERP应用..."

# 进入应用目录
cd /var/www/factory-erp

# 备份现有应用（如果存在）
if [ -d "factory-erp" ]; then
    echo "备份现有应用..."
    sudo mv factory-erp factory-erp-backup-$(date +%Y%m%d-%H%M%S)
fi

# 从GitHub克隆代码（需要先上传到GitHub）
# git clone https://github.com/yourusername/factory-erp.git

# 或者直接上传代码包
echo "请将factory-erp代码上传到 /var/www/factory-erp/ 目录"

# 进入项目目录
cd factory-erp

# 安装依赖
echo "安装Node.js依赖..."
npm install

# 构建前端
echo "构建前端应用..."
npm run build

# 配置环境变量
echo "配置环境变量..."
cat > server/.env << EOF
NODE_ENV=production
PORT=5001
DB_HOST=localhost
DB_USER=factory_erp_user
DB_PASSWORD=FactoryERP2024!
DB_NAME=factory_erp
JWT_SECRET=your-super-secret-jwt-key-here
CORS_ORIGIN=http://39.106.7.6
EOF

# 配置MySQL数据库
echo "配置MySQL数据库..."
mysql -u root -p << EOF
CREATE DATABASE IF NOT EXISTS factory_erp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'factory_erp_user'@'localhost' IDENTIFIED BY 'FactoryERP2024!';
GRANT ALL PRIVILEGES ON factory_erp.* TO 'factory_erp_user'@'localhost';
FLUSH PRIVILEGES;
EOF

# 导入数据库结构
echo "导入数据库结构..."
mysql -u factory_erp_user -pFactoryERP2024! factory_erp < factory_erp_schema.sql

# 启动应用
echo "启动应用..."
pm2 start server/app.js --name "factory-erp" --env production

# 保存PM2配置
pm2 save
pm2 startup

echo "应用部署完成！"
echo "应用运行在: http://39.106.7.6:5001"