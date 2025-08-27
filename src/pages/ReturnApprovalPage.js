import React, { useEffect, useState } from "react";

function ReturnApprovalPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    setLoading(true);
    fetch("/api/return-orders")
      .then(res => res.json())
      .then(data => {
        setOrders(Array.isArray(data) ? data.filter(o => String(o.is_reviewed) === "0" || o.is_reviewed === 0 || o.is_reviewed === false) : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleApprove = async (id) => {
    await fetch(`/api/return-orders/${id}/review`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_reviewed: true, is_ok: true })
    });
    fetchOrders();
  };

  const handleReject = async (id) => {
    await fetch(`/api/return-orders/${id}/review`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_reviewed: true, is_ok: false })
    });
    fetchOrders();
  };

  return (
    <div>
      <h2>退货审核</h2>
      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "#666" }}>加载中...</div>
      ) : orders.length === 0 ? (
        <div style={{ color: '#888', textAlign: 'center', padding: 40 }}>暂无待审核退货单</div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 32, background: "#fff", borderRadius: 8, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <thead>
            <tr style={{ background: "#f5f5f5" }}>
              <th style={{ padding: "12px 8px", textAlign: "left", fontWeight: 600, borderBottom: "1px solid #e0e0e0" }}>ID</th>
              <th style={{ padding: "12px 8px", textAlign: "left", fontWeight: 600, borderBottom: "1px solid #e0e0e0" }}>材料名称</th>
              <th style={{ padding: "12px 8px", textAlign: "left", fontWeight: 600, borderBottom: "1px solid #e0e0e0" }}>型号</th>
              <th style={{ padding: "12px 8px", textAlign: "left", fontWeight: 600, borderBottom: "1px solid #e0e0e0" }}>数量</th>
              <th style={{ padding: "12px 8px", textAlign: "left", fontWeight: 600, borderBottom: "1px solid #e0e0e0" }}>单价</th>
              <th style={{ padding: "12px 8px", textAlign: "left", fontWeight: 600, borderBottom: "1px solid #e0e0e0" }}>操作人</th>
              <th style={{ padding: "12px 8px", textAlign: "left", fontWeight: 600, borderBottom: "1px solid #e0e0e0" }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td style={{ padding: "12px", borderBottom: "1px solid #f0f0f0" }}>{order.id}</td>
                <td style={{ padding: "12px", borderBottom: "1px solid #f0f0f0" }}>{order.material_name}</td>
                <td style={{ padding: "12px", borderBottom: "1px solid #f0f0f0" }}>{order.model}</td>
                <td style={{ padding: "12px", borderBottom: "1px solid #f0f0f0" }}>{order.quantity}</td>
                <td style={{ padding: "12px", borderBottom: "1px solid #f0f0f0" }}>{order.unit_price}</td>
                <td style={{ padding: "12px", borderBottom: "1px solid #f0f0f0" }}>{order.operator}</td>
                <td style={{ padding: "12px", borderBottom: "1px solid #f0f0f0" }}>
                  <button
                    style={{ marginRight: 12, background: '#388e3c', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 18px', fontWeight: 'bold', cursor: 'pointer' }}
                    onClick={() => handleApprove(order.id)}
                  >
                    通过
                  </button>
                  <button
                    style={{ background: '#d32f2f', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 18px', fontWeight: 'bold', cursor: 'pointer' }}
                    onClick={() => handleReject(order.id)}
                  >
                    不通过
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ReturnApprovalPage; 