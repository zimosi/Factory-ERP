-- 清除所有数据库数据
-- 注意：这个操作会删除所有数据，请谨慎使用！

-- 禁用外键检查
SET FOREIGN_KEY_CHECKS = 0;

-- 清除所有表的数据
TRUNCATE TABLE inventory_records;
TRUNCATE TABLE material_pick_order_items;
TRUNCATE TABLE material_pick_orders;
TRUNCATE TABLE design_drawing_products;
TRUNCATE TABLE design_drawing_materials;
TRUNCATE TABLE design_drawings;
TRUNCATE TABLE after_sales_order_materials;
TRUNCATE TABLE after_sales_orders;
TRUNCATE TABLE boats;
TRUNCATE TABLE sale_orders;
TRUNCATE TABLE return_orders;
TRUNCATE TABLE material_sale_orders;
TRUNCATE TABLE purchase_orders;
TRUNCATE TABLE production_order_materials;
TRUNCATE TABLE production_orders;
TRUNCATE TABLE product_materials;
TRUNCATE TABLE products;
TRUNCATE TABLE materials;
TRUNCATE TABLE users;

-- 重新启用外键检查
SET FOREIGN_KEY_CHECKS = 1;

-- 重置自增ID
ALTER TABLE users AUTO_INCREMENT = 1;
ALTER TABLE materials AUTO_INCREMENT = 1;
ALTER TABLE products AUTO_INCREMENT = 1;
ALTER TABLE product_materials AUTO_INCREMENT = 1;
ALTER TABLE production_orders AUTO_INCREMENT = 1;
ALTER TABLE production_order_materials AUTO_INCREMENT = 1;
ALTER TABLE purchase_orders AUTO_INCREMENT = 1;
ALTER TABLE material_sale_orders AUTO_INCREMENT = 1;
ALTER TABLE return_orders AUTO_INCREMENT = 1;
ALTER TABLE sale_orders AUTO_INCREMENT = 1;
ALTER TABLE boats AUTO_INCREMENT = 1;
ALTER TABLE after_sales_orders AUTO_INCREMENT = 1;
ALTER TABLE after_sales_order_materials AUTO_INCREMENT = 1;
ALTER TABLE design_drawings AUTO_INCREMENT = 1;
ALTER TABLE design_drawing_materials AUTO_INCREMENT = 1;
ALTER TABLE design_drawing_products AUTO_INCREMENT = 1;
ALTER TABLE material_pick_orders AUTO_INCREMENT = 1;
ALTER TABLE material_pick_order_items AUTO_INCREMENT = 1;
ALTER TABLE inventory_records AUTO_INCREMENT = 1;

-- 显示清除结果
SELECT '所有数据已清除完成！' as message;
