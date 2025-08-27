import React from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

const menuItems = [
  { key: "purchase-arrival", label: "采购订单入库" },
  { key: "inventory-check", label: "库存盘点" },
  { key: "pick-orders", label: "生产领料单" },
  { key: "inventory-records", label: "出入库记录" },
  { key: "return-orders", label: "退货" }
];

function InventoryManagementPage() {
  const location = useLocation();
  const navigate = useNavigate();
  // 默认跳转到第一个板块
  React.useEffect(() => {
    if (location.pathname === "/inventory-management" || location.pathname === "/inventory-management/") {
      navigate("/inventory-management/purchase-arrival", { replace: true });
    }
  }, [location, navigate]);

  return (
    <div style={{ maxWidth: 1200, margin: "40px auto", background: "#fafbfc", borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", display: 'flex', minHeight: 600 }}>
      {/* 左侧菜单栏 */}
      <div style={{ width: 180, background: '#fff', borderRight: '1px solid #eee', borderRadius: '12px 0 0 12px', padding: '36px 0', display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 8, position: 'relative' }}>
        <button
          style={{
            position: 'absolute',
            top: 12,
            left: 16,
            right: 16,
            padding: '8px 0',
            borderRadius: 6,
            border: 'none',
            background: '#1976d2',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: 15,
            cursor: 'pointer',
            marginBottom: 24
          }}
          onClick={() => navigate("/")}
        >
          返回主页
        </button>
        <div style={{ height: 48 }} /> {/* 占位，避免菜单被按钮遮挡 */}
        {menuItems.map(item => (
          <NavLink
            key={item.key}
            to={`/inventory-management/${item.key}`}
            style={({ isActive }) => ({
              padding: '14px 0',
              textAlign: 'center',
              fontWeight: 600,
              fontSize: 17,
              color: isActive ? '#1976d2' : '#333',
              background: isActive ? '#e6f7ff' : 'transparent',
              borderLeft: isActive ? '4px solid #1976d2' : '4px solid transparent',
              cursor: 'pointer',
              textDecoration: 'none',
              transition: 'all 0.2s'
            })}
          >
            {item.label}
          </NavLink>
        ))}
      </div>
      {/* 右侧内容区 */}
      <div style={{ flex: 1, padding: 36, minHeight: 600 }}>
        <Outlet />
      </div>
    </div>
  );
}

export default InventoryManagementPage; 