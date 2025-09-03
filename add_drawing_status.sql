-- 为设计图纸表添加状态字段
ALTER TABLE design_drawings 
ADD COLUMN status ENUM('pending', 'in_production', 'completed') DEFAULT 'pending' COMMENT '生产状态';

-- 添加生产完成时间字段
ALTER TABLE design_drawings 
ADD COLUMN completed_at TIMESTAMP NULL COMMENT '生产完成时间';

-- 添加索引
CREATE INDEX idx_drawing_status ON design_drawings(status);
