import React from "react";
import { NavLink, Outlet } from "react-router-dom";

const containerStyle = {
  display: "flex",
  minHeight: "100vh",
  background: "#f5f5f5"
};

const sidebarStyle = {
  width: 250,
  background: "#fff",
  boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
  padding: "20px 0"
};

const menuItemStyle = {
  display: "block",
  padding: "12px 24px",
  color: "#333",
  textDecoration: "none",
  fontSize: 16,
  borderLeft: "4px solid transparent",
  transition: "all 0.3s"
};

const activeMenuItemStyle = {
  ...menuItemStyle,
  background: "#e3f2fd",
  color: "#1976d2",
  borderLeftColor: "#1976d2"
};

const contentStyle = {
  flex: 1,
  padding: "20px",
  background: "#fff",
  margin: "20px",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
};

const titleStyle = {
  fontSize: 24,
  fontWeight: "bold",
  color: "#333",
  marginBottom: 20,
  borderBottom: "2px solid #1976d2",
  paddingBottom: 10
};

function DesignOrdersPage() {
  return (
    <div style={containerStyle}>
      <div style={sidebarStyle}>
        <h2 style={{ padding: "0 24px 20px", color: "#1976d2", borderBottom: "1px solid #e0e0e0" }}>
          设计管理
        </h2>
        <NavLink
          to="/design-orders"
          end
          style={({ isActive }) => isActive ? activeMenuItemStyle : menuItemStyle}
        >
          设计订单
        </NavLink>
        <NavLink
          to="/design-orders/processing-design"
          style={({ isActive }) => isActive ? activeMenuItemStyle : menuItemStyle}
        >
          加工件设计
        </NavLink>
      </div>
      <div style={contentStyle}>
        <h1 style={titleStyle}>设计订单管理</h1>
        <Outlet />
      </div>
    </div>
  );
}

export default DesignOrdersPage; 