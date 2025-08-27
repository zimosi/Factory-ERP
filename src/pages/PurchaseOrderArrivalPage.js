import React, { useEffect, useState } from "react";

function PurchaseOrderArrivalPage() {
  const [orders, setOrders] = useState([]);
  const [searchMaterial, setSearchMaterial] = useState("");
  const [searchDate, setSearchDate] = useState("");

  const fetchOrders = async () => {
    const res = await fetch("/api/purchase-orders");
    const data = await res.json();
    setOrders(Array.isArray(data) ? data : []);
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleArrive = async (id) => {
    const res = await fetch(`/api/purchase-orders/${id}/arrive`, { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      alert("到货确认成功！");
      fetchOrders();
    } else {
      alert(data.message || "操作失败");
    }
  };

  // 搜索过滤
  const filteredOrders = orders.filter(order => {
    const matchMaterial = searchMaterial ? order.material_name.includes(searchMaterial) : true;
    const matchDate = searchDate ? (order.order_date && order.order_date.startsWith(searchDate)) : true;
    const matchReviewed = order.is_reviewed === true || order.is_reviewed === 1;
    return matchMaterial && matchDate && matchReviewed;
  });

  return (
    <div style={{ maxWidth: 900, margin: "60px auto", textAlign: "center" }}>
      <h2>采购订单入库</h2>
      <div style={{ margin: '20px 0', display: 'flex', justifyContent: 'center', gap: 16 }}>
        <input
          style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', minWidth: 160 }}
          placeholder="材料名称"
          value={searchMaterial}
          onChange={e => setSearchMaterial(e.target.value)}
        />
        <input
          type="date"
          style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', minWidth: 160 }}
          value={searchDate}
          onChange={e => setSearchDate(e.target.value)}
        />
        <button style={{ padding: '8px 18px', borderRadius: 6, border: 'none', background: '#1976d2', color: '#fff', fontWeight: 'bold', fontSize: 15, cursor: 'pointer' }} onClick={fetchOrders}>重置</button>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 32 }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>材料名称</th>
            <th>型号</th>
            <th>采购数量</th>
            <th>是否到货</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.length === 0 ? (
            <tr><td colSpan={6}>暂无采购订单</td></tr>
          ) : (
            filteredOrders.map(order => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.material_name}</td>
                <td>{order.model}</td>
                <td>{order.quantity}</td>
                <td>{order.is_arrived ? "是" : "否"}</td>
                <td>
                  {order.is_arrived ? "已入库" : (
                    <button onClick={() => handleArrive(order.id)}>确认到货</button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default PurchaseOrderArrivalPage; 