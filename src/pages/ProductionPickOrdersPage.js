import React, { useEffect, useState } from "react";

function ProductionPickOrdersPage({ onExtracted }) {
  const [pickOrders, setPickOrders] = useState([]);
  useEffect(() => {
    fetch("/api/production-orders/production-pick-orders").then(res => res.json()).then(setPickOrders);
  }, []);

  // 新增：提取领料单逻辑
  const handleExtract = async (order) => {
    const user = JSON.parse(localStorage.getItem("user"));
    for (const item of order.items) {
      // 写入出库记录
      await fetch('/api/inventory-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          material_id: item.material_id,
          material_name: item.material_name,
          type: 'out',
          quantity: item.quantity,
          unit: item.unit,
          operator: user?.username || '未知',
          related_order_id: order.pick_order_id,
          remark: '生产领料出库',
          what: item.what || null
        })
      });
      // 原有出库逻辑
      await fetch(`/api/materials/${item.material_id}/extract`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: item.quantity })
      });
    }
    // 删除领料单
    await fetch(`/api/production-orders/production-pick-orders/${order.pick_order_id}`, {
      method: 'DELETE'
    });
    // 刷新领料单
    fetch("/api/production-orders/production-pick-orders").then(res => res.json()).then(setPickOrders);
    // 通知父组件刷新库存
    if (typeof onExtracted === 'function') onExtracted();
  };

  return (
    <div style={{ maxWidth: 1000, margin: "40px auto", background: "#fff", borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", padding: 32 }}>
      <h2 style={{ marginBottom: 24 }}>生产领料单</h2>
      {pickOrders.length === 0 ? (
        <div style={{ color: "#888", textAlign: "center" }}>暂无领料单</div>
      ) : (
        pickOrders.map(order => (
          <div key={order.pick_order_id} style={{ border: "1px solid #eee", borderRadius: 8, marginBottom: 28, padding: 18 }}>
            <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 8 }}>领料单号：{order.pick_order_id} &nbsp;|&nbsp; 关联生产订单：{order.production_order_id}</div>
            <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 8 }}>操作人：{order.operator || '—'} &nbsp;|&nbsp; 备注：{order.remark || '—'}</div>
            <div style={{ color: "#888", marginBottom: 8 }}>创建时间：{order.created_at && order.created_at.replace('T', ' ').slice(0, 19)}</div>
            <table style={{ width: "100%", borderCollapse: "collapse", background: "#fafbfc" }}>
              <thead>
                <tr>
                  <th style={{ border: "1px solid #e0e0e0", padding: "6px 8px", background: "#f5f5f5" }}>材料名称</th>
                  <th style={{ border: "1px solid #e0e0e0", padding: "6px 8px", background: "#f5f5f5" }}>型号</th>
                  <th style={{ border: "1px solid #e0e0e0", padding: "6px 8px", background: "#f5f5f5" }}>领用数量</th>
                  <th style={{ border: "1px solid #e0e0e0", padding: "6px 8px", background: "#f5f5f5" }}>单位</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map(item => (
                  <tr key={item.item_id}>
                    <td style={{ border: "1px solid #e0e0e0", padding: "6px 8px" }}>{item.material_name}</td>
                    <td style={{ border: "1px solid #e0e0e0", padding: "6px 8px" }}>{item.model}</td>
                    <td style={{ border: "1px solid #e0e0e0", padding: "6px 8px" }}>{item.quantity}</td>
                    <td style={{ border: "1px solid #e0e0e0", padding: "6px 8px" }}>{item.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              style={{ marginTop: 12, padding: '6px 18px', borderRadius: 6, border: 'none', background: '#388e3c', color: '#fff', fontWeight: 'bold', fontSize: 15, cursor: 'pointer' }}
              onClick={() => handleExtract(order)}
            >
              以提取
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default ProductionPickOrdersPage; 