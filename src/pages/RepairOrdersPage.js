import React, { useEffect, useState } from "react";
import { useNavigate, Outlet, useParams } from "react-router-dom";

function RepairOrdersPage() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();
  const { afterSalesOrderId } = useParams();

  useEffect(() => {
    fetch("/api/after-sales-orders").then(res => res.json()).then(data => setOrders(Array.isArray(data) ? data : []));
  }, []);

  return (
    <div style={{ display: 'flex', height: '80vh', background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', margin: '40px auto', maxWidth: 1200 }}>
      {/* 左侧菜单栏 */}
      <div style={{ width: 220, borderRight: '1px solid #eee', padding: 0, background: '#fafbfc', borderRadius: '12px 0 0 12px' }}>
        <h3 style={{ textAlign: 'center', margin: '18px 0 12px 0' }}>维修工单</h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {orders.map(order => (
            <li key={order.id} style={{ margin: 0 }}>
              <button
                style={{
                  width: '100%',
                  padding: '12px 0',
                  background: afterSalesOrderId == order.id ? '#e91e63' : 'transparent',
                  color: afterSalesOrderId == order.id ? '#fff' : '#333',
                  border: 'none',
                  borderBottom: '1px solid #eee',
                  cursor: 'pointer',
                  fontWeight: afterSalesOrderId == order.id ? 700 : 400
                }}
                onClick={() => navigate(`/repair-orders/${order.id}`)}
              >
                {order.boat_no || order.serial_no || order.id}
              </button>
            </li>
          ))}
        </ul>
      </div>
      {/* 右侧详情区 */}
      <div style={{ flex: 1, padding: 32, overflow: 'auto' }}>
        <Outlet />
      </div>
    </div>
  );
}

export default RepairOrdersPage; 