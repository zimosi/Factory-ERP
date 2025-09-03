#!/bin/bash

# SSL证书配置脚本（使用Let's Encrypt免费证书）

echo "开始配置SSL证书..."

# 安装Certbot
echo "安装Certbot..."
sudo yum install -y epel-release
sudo yum install -y certbot python3-certbot-nginx

# 获取SSL证书（需要域名）
echo "请确保您已经将域名解析到服务器IP: 39.106.7.6"
echo "请输入您的域名（例如: yourdomain.com）:"
read DOMAIN

if [ -z "$DOMAIN" ]; then
    echo "未输入域名，跳过SSL配置"
    exit 0
fi

# 获取证书
echo "获取SSL证书..."
sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN

# 配置自动续期
echo "配置证书自动续期..."
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -

# 更新Nginx配置以支持HTTPS
sudo tee /etc/nginx/conf.d/factory-erp-ssl.conf > /dev/null << EOF
# HTTPS配置
server {
    listen 443 ssl http2;
    server_name $DOMAIN;
    
    # SSL证书配置
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    # SSL安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # 前端静态文件
    location / {
        root /var/www/factory-erp/factory-erp/build;
        index index.html index.htm;
        try_files \$uri \$uri/ /index.html;
    }
    
    # API代理
    location /api/ {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}

# HTTP重定向到HTTPS
server {
    listen 80;
    server_name $DOMAIN;
    return 301 https://\$server_name\$request_uri;
}
EOF

# 重启Nginx
sudo systemctl restart nginx

echo "SSL证书配置完成！"
echo "您的网站现在可以通过 https://$DOMAIN 访问"