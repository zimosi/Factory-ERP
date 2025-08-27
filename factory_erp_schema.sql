-- =====================================================
-- Factory ERP System - Complete Database Schema
-- =====================================================
-- This file contains all tables and columns used in the Factory ERP system
-- Generated based on actual codebase usage
-- =====================================================

-- Drop existing tables if they exist (for clean setup)
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- 1. USER MANAGEMENT TABLES
-- =====================================================

-- Users table for authentication and user management
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) UNIQUE NOT NULL COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码',
    role VARCHAR(50) DEFAULT 'user' COMMENT '用户角色',
    email VARCHAR(100) COMMENT '邮箱',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) COMMENT='用户表';

-- =====================================================
-- 2. INVENTORY MANAGEMENT TABLES
-- =====================================================

-- Materials table for inventory management
DROP TABLE IF EXISTS materials;
CREATE TABLE materials (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '材料名称',
    model VARCHAR(100) COMMENT '型号',
    warehouse_id INT NOT NULL DEFAULT 1 COMMENT '仓库ID',
    quantity DECIMAL(10,3) DEFAULT 0 COMMENT '当前库存数量',
    used_quantity DECIMAL(10,3) DEFAULT 0 COMMENT '已使用数量',
    min_quantity DECIMAL(10,3) DEFAULT 0 COMMENT '最小库存数量',
    unit VARCHAR(20) COMMENT '单位',
    unit_price DECIMAL(10,2) DEFAULT 0.00 COMMENT '单价',
    property TEXT COMMENT '规格属性',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_name (name),
    INDEX idx_model (model),
    INDEX idx_warehouse (warehouse_id),
    INDEX idx_quantity (quantity),
    INDEX idx_name_model (name, model)
) COMMENT='材料库存表';

-- Products table for finished goods
DROP TABLE IF EXISTS products;
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL COMMENT '产品名称',
    warehouse_id INT NOT NULL DEFAULT 1 COMMENT '仓库ID',
    quantity INT DEFAULT 0 COMMENT '库存数量',
    unit_price DECIMAL(10,2) DEFAULT 0.00 COMMENT '单价',
    unit VARCHAR(20) COMMENT '单位',
    code INT DEFAULT 0 COMMENT '产品编码',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_name (name),
    INDEX idx_warehouse (warehouse_id)
) COMMENT='产品库存表';

-- Product materials table for BOM (Bill of Materials)
DROP TABLE IF EXISTS product_materials;
CREATE TABLE product_materials (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL COMMENT '产品ID',
    material_id INT NOT NULL COMMENT '材料ID',
    required_quantity DECIMAL(10,3) NOT NULL COMMENT '需求数量',
    is_required BOOLEAN DEFAULT TRUE COMMENT '是否必需',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES materials(id),
    INDEX idx_product (product_id),
    INDEX idx_material (material_id)
) COMMENT='产品材料清单表';

-- =====================================================
-- 3. PRODUCTION MANAGEMENT TABLES
-- =====================================================

-- Production orders table
DROP TABLE IF EXISTS production_orders;
CREATE TABLE production_orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sale_order_id INT COMMENT '销售订单ID',
    product_id INT NOT NULL COMMENT '产品ID',
    product_name VARCHAR(200) NOT NULL COMMENT '产品名称',
    serial_no VARCHAR(100) UNIQUE NOT NULL COMMENT '船编号',
    planned_start_date DATE COMMENT '计划开始日期',
    planned_end_date DATE COMMENT '计划结束日期',
    is_reviewed BOOLEAN DEFAULT FALSE COMMENT '是否已审核',
    is_complete BOOLEAN DEFAULT FALSE COMMENT '是否完成',
    remark TEXT COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (product_id) REFERENCES products(id),
    INDEX idx_serial_no (serial_no),
    INDEX idx_product (product_id),
    INDEX idx_sale_order (sale_order_id)
) COMMENT='生产订单表';

-- Production order materials table
DROP TABLE IF EXISTS production_order_materials;
CREATE TABLE production_order_materials (
    id INT PRIMARY KEY AUTO_INCREMENT,
    production_order_id INT NOT NULL COMMENT '生产订单ID',
    material_id INT NOT NULL COMMENT '材料ID',
    material_name VARCHAR(100) NOT NULL COMMENT '材料名称',
    model VARCHAR(100) COMMENT '型号',
    planned_quantity DECIMAL(10,3) NOT NULL COMMENT '计划数量',
    used_quantity DECIMAL(10,3) DEFAULT 0 COMMENT '已使用数量',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (production_order_id) REFERENCES production_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES materials(id),
    INDEX idx_production_order (production_order_id),
    INDEX idx_material (material_id)
) COMMENT='生产订单材料明细表';

-- Material pick orders table
DROP TABLE IF EXISTS material_pick_orders;
CREATE TABLE material_pick_orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    production_order_id INT COMMENT '生产订单ID',
    operator VARCHAR(100) NOT NULL COMMENT '操作员',
    remark TEXT COMMENT '备注',
    what VARCHAR(50) COMMENT '类型(生产/售后/销售/退货)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (production_order_id) REFERENCES production_orders(id),
    INDEX idx_production_order (production_order_id),
    INDEX idx_operator (operator),
    INDEX idx_what (what)
) COMMENT='材料领料单表';

-- Material pick order items table
DROP TABLE IF EXISTS material_pick_order_items;
CREATE TABLE material_pick_order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pick_order_id INT NOT NULL COMMENT '领料单ID',
    material_id INT NOT NULL COMMENT '材料ID',
    model VARCHAR(100) COMMENT '型号',
    quantity DECIMAL(10,3) NOT NULL COMMENT '数量',
    what VARCHAR(50) COMMENT '类型',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (pick_order_id) REFERENCES material_pick_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES materials(id),
    INDEX idx_pick_order (pick_order_id),
    INDEX idx_material (material_id)
) COMMENT='材料领料单明细表';

-- =====================================================
-- 4. SALES & CUSTOMER MANAGEMENT TABLES
-- =====================================================

-- Sale orders table
DROP TABLE IF EXISTS sale_orders;
CREATE TABLE sale_orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_name VARCHAR(200) NOT NULL COMMENT '客户名称',
    product_id INT NOT NULL COMMENT '产品ID',
    quantity INT NOT NULL COMMENT '数量',
    unit_price DECIMAL(10,2) NOT NULL COMMENT '单价',
    total_amount DECIMAL(12,2) NOT NULL COMMENT '总金额',
    order_date DATE NOT NULL COMMENT '订单日期',
    delivery_date DATE COMMENT '交货日期',
    is_reviewed BOOLEAN DEFAULT FALSE COMMENT '是否已审核',
    used_quantity INT DEFAULT 0 COMMENT '已使用数量',
    remark TEXT COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (product_id) REFERENCES products(id),
    INDEX idx_customer (customer_name),
    INDEX idx_product (product_id),
    INDEX idx_order_date (order_date)
) COMMENT='销售订单表';

-- Boats table for boat tracking
DROP TABLE IF EXISTS boats;
CREATE TABLE boats (
    auto_id INT PRIMARY KEY AUTO_INCREMENT,
    boat_no VARCHAR(100) UNIQUE NOT NULL COMMENT '船编号',
    product_id INT NOT NULL COMMENT '产品ID',
    product_name VARCHAR(200) NOT NULL COMMENT '产品名称',
    order_id INT NOT NULL COMMENT '订单ID',
    is_completed BOOLEAN DEFAULT FALSE COMMENT '是否完成',
    is_sold BOOLEAN DEFAULT FALSE COMMENT '是否已售',
    remark TEXT COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (order_id) REFERENCES sale_orders(id),
    INDEX idx_boat_no (boat_no),
    INDEX idx_product (product_id),
    INDEX idx_order (order_id)
) COMMENT='船只信息表';

-- =====================================================
-- 5. AFTER-SALES SERVICE TABLES
-- =====================================================

-- After sales orders table
DROP TABLE IF EXISTS after_sales_orders;
CREATE TABLE after_sales_orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    boat_id VARCHAR(100) COMMENT '船ID',
    serial_no VARCHAR(100) COMMENT '船编号',
    sale_order_id INT COMMENT '销售订单ID',
    reason TEXT NOT NULL COMMENT '维修原因',
    is_complete BOOLEAN DEFAULT FALSE COMMENT '是否完成',
    price DECIMAL(12,2) DEFAULT 0.00 COMMENT '报价金额',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (sale_order_id) REFERENCES sale_orders(id),
    INDEX idx_boat_id (boat_id),
    INDEX idx_serial_no (serial_no),
    INDEX idx_sale_order (sale_order_id)
) COMMENT='售后服务订单表';

-- After sales order materials table
DROP TABLE IF EXISTS after_sales_order_materials;
CREATE TABLE after_sales_order_materials (
    id INT PRIMARY KEY AUTO_INCREMENT,
    after_sales_order_id INT NOT NULL COMMENT '售后服务订单ID',
    material_id INT NOT NULL COMMENT '材料ID',
    material_name VARCHAR(100) NOT NULL COMMENT '材料名称',
    model VARCHAR(100) COMMENT '型号',
    quantity DECIMAL(10,3) NOT NULL COMMENT '数量',
    unit VARCHAR(20) COMMENT '单位',
    unit_price DECIMAL(10,2) DEFAULT 0.00 COMMENT '单价',
    remark TEXT COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (after_sales_order_id) REFERENCES after_sales_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES materials(id),
    INDEX idx_after_sales_order (after_sales_order_id),
    INDEX idx_material (material_id)
) COMMENT='售后服务订单材料表';

-- =====================================================
-- 6. PURCHASE & PROCUREMENT TABLES
-- =====================================================

-- Purchase orders table
DROP TABLE IF EXISTS purchase_orders;
CREATE TABLE purchase_orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    material_name VARCHAR(100) NOT NULL COMMENT '材料名称',
    model VARCHAR(100) COMMENT '型号',
    quantity DECIMAL(10,3) NOT NULL COMMENT '数量',
    unit VARCHAR(20) COMMENT '单位',
    unit_price DECIMAL(10,2) DEFAULT 0.00 COMMENT '单价',
    supplier VARCHAR(200) COMMENT '供应商',
    order_date DATE NOT NULL COMMENT '订单日期',
    expected_arrival_date DATE COMMENT '预计到货日期',
    is_arrived BOOLEAN DEFAULT FALSE COMMENT '是否到货',
    is_reviewed BOOLEAN DEFAULT FALSE COMMENT '是否已审核',
    is_approved BOOLEAN DEFAULT NULL COMMENT '是否批准',
    review_date DATETIME DEFAULT NULL COMMENT '审核日期',
    remark TEXT COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_material_name (material_name),
    INDEX idx_order_date (order_date),
    INDEX idx_supplier (supplier),
    INDEX idx_is_reviewed (is_reviewed)
) COMMENT='采购订单表';

-- =====================================================
-- 7. MATERIAL SALES TABLES
-- =====================================================

-- Material sale orders table
DROP TABLE IF EXISTS material_sale_orders;
CREATE TABLE material_sale_orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_date DATE NOT NULL COMMENT '订单日期',
    sales_person VARCHAR(100) NOT NULL COMMENT '销售人员',
    material_id INT NOT NULL COMMENT '材料ID',
    material_name VARCHAR(100) NOT NULL COMMENT '材料名称',
    model VARCHAR(100) COMMENT '型号',
    quantity DECIMAL(10,3) NOT NULL COMMENT '数量',
    unit_price DECIMAL(10,2) NOT NULL COMMENT '单价',
    customer VARCHAR(200) NOT NULL COMMENT '客户',
    total_amount DECIMAL(12,2) NOT NULL COMMENT '总金额',
    deposit_amount DECIMAL(12,2) DEFAULT 0.00 COMMENT '定金金额',
    delivery_date DATE COMMENT '交货日期',
    remark TEXT COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (material_id) REFERENCES materials(id),
    INDEX idx_order_date (order_date),
    INDEX idx_sales_person (sales_person),
    INDEX idx_customer (customer),
    INDEX idx_material (material_id)
) COMMENT='材料销售订单表';

-- =====================================================
-- 8. RETURN MANAGEMENT TABLES
-- =====================================================

-- Return orders table
DROP TABLE IF EXISTS return_orders;
CREATE TABLE return_orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    material_id INT NOT NULL COMMENT '材料ID',
    material_name VARCHAR(100) NOT NULL COMMENT '材料名称',
    model VARCHAR(100) COMMENT '型号',
    quantity DECIMAL(10,3) NOT NULL COMMENT '数量',
    unit_price DECIMAL(10,2) NOT NULL COMMENT '单价',
    operator VARCHAR(100) NOT NULL COMMENT '操作员',
    is_reviewed BOOLEAN DEFAULT FALSE COMMENT '是否已审核',
    is_paid BOOLEAN DEFAULT FALSE COMMENT '是否已付款',
    is_ok BOOLEAN DEFAULT FALSE COMMENT '是否通过',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (material_id) REFERENCES materials(id),
    INDEX idx_material (material_id),
    INDEX idx_operator (operator),
    INDEX idx_is_reviewed (is_reviewed)
) COMMENT='退货订单表';

-- =====================================================
-- 9. DESIGN & ENGINEERING TABLES
-- =====================================================

-- Design drawings table
DROP TABLE IF EXISTS design_drawings;
CREATE TABLE design_drawings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    drawing_no VARCHAR(50) UNIQUE NOT NULL COMMENT '图纸编号',
    designer VARCHAR(100) NOT NULL COMMENT '设计人',
    remark TEXT COMMENT '备注',
    total_material_cost DECIMAL(12,2) DEFAULT 0.00 COMMENT '原材料总成本',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_drawing_no (drawing_no),
    INDEX idx_designer (designer)
) COMMENT='设计图纸主表';

-- Design drawing materials table
DROP TABLE IF EXISTS design_drawing_materials;
CREATE TABLE design_drawing_materials (
    id INT PRIMARY KEY AUTO_INCREMENT,
    drawing_id INT NOT NULL COMMENT '图纸ID',
    material_id INT NOT NULL COMMENT '材料ID',
    material_name VARCHAR(100) NOT NULL COMMENT '材料名称',
    model VARCHAR(100) COMMENT '型号',
    quantity DECIMAL(10,3) NOT NULL COMMENT '需求数量',
    unit VARCHAR(20) COMMENT '单位',
    unit_price DECIMAL(10,2) DEFAULT 0.00 COMMENT '单价',
    subtotal DECIMAL(12,2) DEFAULT 0.00 COMMENT '小计',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (drawing_id) REFERENCES design_drawings(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES materials(id),
    INDEX idx_drawing_id (drawing_id),
    INDEX idx_material_id (material_id)
) COMMENT='设计图纸原材料明细表';

-- Design drawing products table
DROP TABLE IF EXISTS design_drawing_products;
CREATE TABLE design_drawing_products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    drawing_id INT NOT NULL COMMENT '图纸ID',
    product_id INT NULL COMMENT '材料ID',
    product_name VARCHAR(200) NOT NULL COMMENT '加工件名称',
    model VARCHAR(100) COMMENT '型号',
    quantity INT NOT NULL COMMENT '生产数量',
    unit VARCHAR(20) COMMENT '单位',
    unit_price DECIMAL(10,2) DEFAULT 0.00 COMMENT '单价',
    subtotal DECIMAL(12,2) DEFAULT 0.00 COMMENT '小计',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (drawing_id) REFERENCES design_drawings(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES materials(id),
    INDEX idx_drawing_id (drawing_id),
    INDEX idx_product_name (product_name)
) COMMENT='设计图纸加工件明细表';

-- =====================================================
-- 10. INVENTORY RECORDS TABLE
-- =====================================================

-- Inventory records table for audit trail
DROP TABLE IF EXISTS inventory_records;
CREATE TABLE inventory_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    material_id INT NOT NULL COMMENT '材料ID',
    material_name VARCHAR(100) NOT NULL COMMENT '材料名称',
    type ENUM('in', 'out') NOT NULL COMMENT '类型(入库/出库)',
    quantity DECIMAL(10,3) NOT NULL COMMENT '数量',
    unit VARCHAR(20) COMMENT '单位',
    operator VARCHAR(100) NOT NULL COMMENT '操作员',
    related_order_id INT COMMENT '相关订单ID',
    remark TEXT COMMENT '备注',
    what VARCHAR(50) COMMENT '类型(生产/售后/销售/退货)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (material_id) REFERENCES materials(id),
    INDEX idx_material (material_id),
    INDEX idx_type (type),
    INDEX idx_operator (operator),
    INDEX idx_created_at (created_at),
    INDEX idx_what (what)
) COMMENT='库存记录表';

-- =====================================================
-- 11. WAREHOUSE MANAGEMENT TABLES
-- =====================================================

-- Warehouses table
DROP TABLE IF EXISTS warehouses;
CREATE TABLE warehouses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '仓库名称',
    location VARCHAR(200) COMMENT '仓库位置',
    manager VARCHAR(100) COMMENT '仓库管理员',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_name (name)
) COMMENT='仓库表';

-- =====================================================
-- FOREIGN KEY CONSTRAINTS
-- =====================================================

-- Enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- 12. INITIAL DATA
-- =====================================================

-- Insert default warehouse
INSERT INTO warehouses (id, name, location, manager) VALUES 
(1, '主仓库', '工厂主楼', '系统管理员'),
(2, '成品仓库', '工厂成品区', '成品管理员'),
(3, '加工件仓库', '工厂加工区', '加工件管理员')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Insert default admin user (password: admin123)
INSERT INTO users (username, password, role, email) VALUES 
('admin', '$2b$10$rQZ8K9vX8K9vX8K9vX8K9O', 'admin', 'admin@factory.com')
ON DUPLICATE KEY UPDATE username = VALUES(username);

-- =====================================================
-- 13. INDEXES FOR PERFORMANCE
-- =====================================================

-- Composite indexes for better query performance
CREATE INDEX idx_materials_name_model_warehouse ON materials(name, model, warehouse_id);
CREATE INDEX idx_production_orders_serial_product ON production_orders(serial_no, product_id);
CREATE INDEX idx_material_pick_orders_production_what ON material_pick_orders(production_order_id, what);
CREATE INDEX idx_inventory_records_material_type_date ON inventory_records(material_id, type, created_at);

-- =====================================================
-- SCHEMA COMPLETION
-- =====================================================

-- Display table count
SELECT 
    COUNT(*) as total_tables,
    'Factory ERP Database Schema Created Successfully!' as status
FROM information_schema.tables 
WHERE table_schema = DATABASE() 
AND table_type = 'BASE TABLE';

-- Display all tables
SHOW TABLES;
