import React, { useEffect, useState } from "react";

function PurchaseApprovalPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // 获取待审核采购订单
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/purchase-orders");
      const data = await res.json();
      // 过滤出未审核的订单
      const unreviewedOrders = Array.isArray(data) ? data.filter(o => !o.is_reviewed) : [];
      setOrders(unreviewedOrders);
    } catch (error) {
      console.error("获取采购订单失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 处理批准
  const handleApprove = async (orderId) => {
    try {
      const response = await fetch(`/api/purchase-orders/${orderId}/review`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_reviewed: true,
          is_approved: true,
          review_date: new Date().toISOString()
        }),
      });

      if (response.ok) {
        // 从列表中移除已审核的订单
        setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
        alert("采购订单已批准！");
      } else {
        const errorData = await response.json();
        alert(`批准失败: ${errorData.message || "未知错误"}`);
      }
    } catch (error) {
      console.error("批准失败:", error);
      alert("批准失败，请重试");
    }
  };

  // 处理不批准
  const handleReject = async (orderId) => {
    try {
      const response = await fetch(`/api/purchase-orders/${orderId}/review`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_reviewed: true,
          is_approved: false,
          review_date: new Date().toISOString()
        }),
      });

      if (response.ok) {
        // 从列表中移除已审核的订单
        setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
        alert("采购订单已拒绝！");
      } else {
        const errorData = await response.json();
        alert(`拒绝失败: ${errorData.message || "未知错误"}`);
      }
    } catch (error) {
      console.error("拒绝失败:", error);
      alert("拒绝失败，请重试");
    }
  };

  // 格式化日期显示
  const formatDate = (dateString) => {
    if (!dateString) return "无";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("zh-CN");
    } catch {
      return dateString;
    }
  };

  return (
    <div>
      <h2>采购订单审核</h2>
      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "#666" }}>加载中...</div>
      ) : orders.length === 0 ? (
        <div style={{ color: '#888', textAlign: 'center', padding: 40 }}>暂无待审核采购订单</div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 32, background: "#fff", borderRadius: 8, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <thead>
            <tr style={{ background: "#f5f5f5" }}>
              <th style={{ padding: "12px 8px", textAlign: "left", fontWeight: 600, borderBottom: "1px solid #e0e0e0" }}>ID</th>
              <th style={{ padding: "12px 8px", textAlign: "left", fontWeight: 600, borderBottom: "1px solid #e0e0e0" }}>采购日期</th>
              <th style={{ padding: "12px 8px", textAlign: "left", fontWeight: 600, borderBottom: "1px solid #e0e0e0" }}>材料名称</th>
              <th style={{ padding: "12px 8px", textAlign: "left", fontWeight: 600, borderBottom: "1px solid #e0e0e0" }}>采购数量</th>
              <th style={{ padding: "12px 8px", textAlign: "left", fontWeight: 600, borderBottom: "1px solid #e0e0e0" }}>采购人</th>
              <th style={{ padding: "12px 8px", textAlign: "left", fontWeight: 600, borderBottom: "1px solid #e0e0e0" }}>状态</th>
              <th style={{ padding: "12px 8px", textAlign: "center", fontWeight: 600, borderBottom: "1px solid #e0e0e0" }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td style={{ padding: "12px", borderBottom: "1px solid #f0f0f0" }}>{order.id}</td>
                <td style={{ padding: "12px", borderBottom: "1px solid #f0f0f0" }}>{formatDate(order.order_date)}</td>
                <td style={{ padding: "12px", borderBottom: "1px solid #f0f0f0" }}>{order.material_name}</td>
                <td style={{ padding: "12px", borderBottom: "1px solid #f0f0f0" }}>{order.quantity}</td>
                <td style={{ padding: "12px", borderBottom: "1px solid #f0f0f0" }}>{order.purchaser}</td>
                <td style={{ padding: "12px", borderBottom: "1px solid #f0f0f0" }}>{order.status}</td>
                <td style={{ padding: "12px", borderBottom: "1px solid #f0f0f0", textAlign: "center" }}>
                  <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                    <button
                      onClick={() => handleApprove(order.id)}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#4caf50",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: "500",
                        transition: "background-color 0.2s"
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = "#45a049"}
                      onMouseLeave={(e) => e.target.style.backgroundColor = "#4caf50"}
                    >
                      批准
                    </button>
                    <button
                      onClick={() => handleReject(order.id)}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#f44336",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: "500",
                        transition: "background-color 0.2s"
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = "#d32f2f"}
                      onMouseLeave={(e) => e.target.style.backgroundColor = "#f44336"}
                    >
                      不批准
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default PurchaseApprovalPage; 