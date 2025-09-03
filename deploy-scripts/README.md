# 工厂ERP系统部署指南

## 服务器信息
- **IP地址**: 39.106.7.6
- **操作系统**: Alibaba Cloud Linux 3.2104 LTS 64位
- **配置**: 2核4GB

## 部署步骤

### 1. 连接服务器
```bash
ssh root@39.106.7.6
```

### 2. 配置服务器环境
```bash
# 上传并执行环境配置脚本
chmod +x setup-server.sh
./setup-server.sh
```

### 3. 上传应用代码
有两种方式：

#### 方式一：通过GitHub（推荐）
1. 将代码推送到GitHub仓库
2. 在服务器上克隆：
```bash
cd /var/www
git clone https://github.com/yourusername/factory-erp.git
```

#### 方式二：直接上传
1. 将factory-erp文件夹打包上传到服务器
2. 解压到 `/var/www/factory-erp/` 目录

### 4. 部署应用
```bash
chmod +x deploy-app.sh
./deploy-app.sh
```

### 5. 配置Nginx
```bash
# 复制Nginx配置
sudo cp nginx-config.conf /etc/nginx/conf.d/factory-erp.conf

# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx
```

### 6. 配置SSL证书（可选）
如果有域名，可以配置HTTPS：
```bash
chmod +x setup-ssl.sh
./setup-ssl.sh
```

## 访问地址
- **HTTP**: http://39.106.7.6
- **HTTPS**: https://yourdomain.com（如果配置了域名和SSL）

## 常用管理命令

### PM2进程管理
```bash
# 查看应用状态
pm2 status

# 重启应用
pm2 restart factory-erp

# 查看日志
pm2 logs factory-erp

# 停止应用
pm2 stop factory-erp
```

### Nginx管理
```bash
# 重启Nginx
sudo systemctl restart nginx

# 查看Nginx状态
sudo systemctl status nginx

# 查看Nginx日志
sudo tail -f /var/log/nginx/error.log
```

### MySQL管理
```bash
# 连接MySQL
mysql -u factory_erp_user -p

# 查看数据库
SHOW DATABASES;

# 查看表
USE factory_erp;
SHOW TABLES;
```

## 故障排除

### 1. 应用无法启动
```bash
# 检查端口占用
netstat -tlnp | grep 5001

# 查看应用日志
pm2 logs factory-erp

# 检查环境变量
cat server/.env
```

### 2. 数据库连接失败
```bash
# 检查MySQL状态
sudo systemctl status mysqld

# 检查数据库用户权限
mysql -u root -p
SELECT User, Host FROM mysql.user WHERE User='factory_erp_user';
```

### 3. Nginx配置问题
```bash
# 测试Nginx配置
sudo nginx -t

# 查看Nginx错误日志
sudo tail -f /var/log/nginx/error.log
```

## 安全建议

1. **修改默认密码**: 修改MySQL root密码和数据库用户密码
2. **配置防火墙**: 只开放必要端口（80, 443, 22）
3. **定期备份**: 设置数据库自动备份
4. **更新系统**: 定期更新系统和软件包
5. **监控日志**: 定期检查应用和系统日志

## 备份策略

### 数据库备份
```bash
# 创建备份脚本
cat > /home/backup-db.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u factory_erp_user -pFactoryERP2024! factory_erp > /home/backups/factory_erp_$DATE.sql
find /home/backups -name "*.sql" -mtime +7 -delete
EOF

chmod +x /home/backup-db.sh

# 设置定时备份（每天凌晨2点）
echo "0 2 * * * /home/backup-db.sh" | crontab -
```

### 应用代码备份
```bash
# 创建代码备份脚本
cat > /home/backup-app.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf /home/backups/factory-erp-code_$DATE.tar.gz /var/www/factory-erp
find /home/backups -name "*.tar.gz" -mtime +7 -delete
EOF

chmod +x /home/backup-app.sh
```
