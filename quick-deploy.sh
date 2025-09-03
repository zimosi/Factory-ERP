#!/bin/bash

# 快速部署脚本 - 工厂ERP系统到阿里云

echo "=========================================="
echo "工厂ERP系统快速部署脚本"
echo "服务器: 39.106.7.6 (Alibaba Cloud Linux)"
echo "=========================================="

# 检查是否为root用户
if [ "$EUID" -ne 0 ]; then
    echo "请使用root用户运行此脚本"
    exit 1
fi

# 1. 更新系统
echo "1. 更新系统包..."
yum update -y

# 2. 安装基础工具
echo "2. 安装基础工具..."
yum install -y wget curl git vim

# 3. 安装Node.js
echo "3. 安装Node.js 18.x..."
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs

# 4. 安装MySQL
echo "4. 安装MySQL..."
yum install -y mysql-server
systemctl start mysqld
systemctl enable mysqld

# 5. 安装Nginx
echo "5. 安装Nginx..."
yum install -y nginx
systemctl start nginx
systemctl enable nginx

# 6. 安装PM2
echo "6. 安装PM2..."
npm install -g pm2

# 7. 配置防火墙
echo "7. 配置防火墙..."
systemctl start firewalld
systemctl enable firewalld
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --permanent --add-service=ssh
firewall-cmd --reload

# 8. 创建应用目录
echo "8. 创建应用目录..."
mkdir -p /var/www/factory-erp
cd /var/www/factory-erp

echo "=========================================="
echo "环境配置完成！"
echo "=========================================="
echo "下一步操作："
echo "1. 将factory-erp代码上传到 /var/www/factory-erp/ 目录"
echo "2. 运行部署脚本: ./deploy-app.sh"
echo "3. 配置Nginx: cp nginx-config.conf /etc/nginx/conf.d/factory-erp.conf"
echo "4. 重启Nginx: systemctl restart nginx"
echo ""
echo "MySQL临时密码请查看: grep 'temporary password' /var/log/mysqld.log"
echo "=========================================="
