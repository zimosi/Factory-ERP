-- 为采购订单表添加审核相关字段
ALTER TABLE purchase_orders 
ADD COLUMN is_approved BOOLEAN DEFAULT NULL COMMENT '是否批准';

ALTER TABLE purchase_orders 
ADD COLUMN review_date DATETIME DEFAULT NULL COMMENT '审核日期';

-- 添加索引
CREATE INDEX idx_purchase_approved ON purchase_orders(is_approved);
CREATE INDEX idx_purchase_review_date ON purchase_orders(review_date);
