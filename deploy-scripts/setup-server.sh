#!/bin/bash

# 阿里云服务器环境配置脚本
# 适用于 Alibaba Cloud Linux 3.2104 LTS 64位

echo "开始配置阿里云服务器环境..."

# 更新系统包
echo "更新系统包..."
sudo yum update -y

# 安装必要的工具
echo "安装基础工具..."
sudo yum install -y wget curl git vim

# 安装Node.js 18.x
echo "安装Node.js..."
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# 验证Node.js安装
node --version
npm --version

# 安装MySQL 8.0
echo "安装MySQL..."
sudo yum install -y mysql-server
sudo systemctl start mysqld
sudo systemctl enable mysqld

# 获取MySQL临时密码
echo "获取MySQL临时密码..."
sudo grep 'temporary password' /var/log/mysqld.log

# 安装Nginx
echo "安装Nginx..."
sudo yum install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# 安装PM2进程管理器
echo "安装PM2..."
sudo npm install -g pm2

# 配置防火墙
echo "配置防火墙..."
sudo systemctl start firewalld
sudo systemctl enable firewalld
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --reload

# 创建应用目录
echo "创建应用目录..."
sudo mkdir -p /var/www/factory-erp
sudo chown -R $USER:$USER /var/www/factory-erp

echo "服务器环境配置完成！"
echo "请记录MySQL临时密码，稍后需要配置数据库"