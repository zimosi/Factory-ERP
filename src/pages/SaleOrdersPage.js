import React, { useState, useEffect, useRef } from "react";

const formStyle = {
  maxWidth: 400,
  margin: "24px auto",
  padding: 24,
  borderRadius: 10,
  boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
  background: "#fafbfc",
  display: "flex",
  flexDirection: "column",
  gap: 16
};

const rowStyle = {
  display: "flex",
  alignItems: "center",
  marginBottom: 0
};

const labelStyle = {
  minWidth: 90,
  marginRight: 10,
  fontWeight: 500,
  color: "#333",
  textAlign: "right"
};

const inputStyle = {
  flex: 1,
  padding: "8px 10px",
  borderRadius: 6,
  border: "1px solid #ccc",
  fontSize: 15
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: 32
};
const thtdStyle = {
  border: "1px solid #e0e0e0",
  padding: "8px 6px",
  fontSize: 15,
  textAlign: "center"
};
const thStyle = {
  ...thtdStyle,
  background: "#f5f5f5",
  fontWeight: 600
};

function getDateStr(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function SaleOrdersPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    order_date: "",
    sales_person: "",
    product: "",
    quantity: "",
    customer: "",
    total_amount: "",
    deposit_amount: "",
    delivery_date: "",
    remark: ""
  });
  const [message, setMessage] = useState("");
  const [orders, setOrders] = useState([]);
  // 搜索相关
  const [searchSales, setSearchSales] = useState("");
  const [dateRange, setDateRange] = useState("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [showAfterSales, setShowAfterSales] = useState(false);
  const [afterSalesOrderId, setAfterSalesOrderId] = useState(null);
  const [boats, setBoats] = useState([]);
  const [selectedBoat, setSelectedBoat] = useState(null);
  const [afterReason, setAfterReason] = useState("");
  const [afterMsg, setAfterMsg] = useState("");
  const afterInputRef = useRef();

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line
  }, []);

  const fetchOrders = async (params = {}) => {
    let url = "/api/sale-orders";
    const query = [];
    if (params.sales_person) query.push(`sales_person=${encodeURIComponent(params.sales_person)}`);
    if (params.date_from) query.push(`date_from=${params.date_from}`);
    if (params.date_to) query.push(`date_to=${params.date_to}`);
    if (query.length) url += "?" + query.join("&");
    try {
      const res = await fetch(url);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setOrders([]);
    }
  };

  const handleSearch = e => {
    e.preventDefault();
    let date_from = "", date_to = "";
    if (dateRange === "month") {
      date_from = getDateStr(-30);
      date_to = getDateStr(0);
    } else if (dateRange === "halfyear") {
      date_from = getDateStr(-183);
      date_to = getDateStr(0);
    } else if (dateRange === "custom") {
      date_from = customFrom;
      date_to = customTo;
    }
    fetchOrders({
      sales_person: searchSales.trim(),
      date_from: date_from || undefined,
      date_to: date_to || undefined
    });
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch("/api/sale-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("订单创建成功！");
        setShowForm(false);
        setForm({
          order_date: "",
          sales_person: "",
          product: "",
          quantity: "",
          customer: "",
          total_amount: "",
          deposit_amount: "",
          delivery_date: "",
          remark: ""
        });
        fetchOrders();
      } else {
        setMessage(data.message || "创建失败");
      }
    } catch (err) {
      setMessage("网络错误");
    }
  };

  const handleCreateOrder = () => {
    setShowForm(true);
    setForm({
      order_date: "",
      sales_person: "",
      product: "",
      quantity: "",
      customer: "",
      total_amount: "",
      deposit_amount: "",
      delivery_date: "",
      remark: ""
    });
  };

  // 售后弹窗逻辑
  const openAfterSales = async (order_id) => {
    setAfterSalesOrderId(order_id);
    setShowAfterSales(true);
    setSelectedBoat(null);
    setAfterReason("");
    setAfterMsg("");
    // 获取该订单下所有船
    const res = await fetch(`/api/boats/by-order/${order_id}`);
    const data = await res.json();
    setBoats(Array.isArray(data) ? data : []);
  };
  const submitAfterSales = async () => {
    if (!selectedBoat || !afterReason.trim()) {
      setAfterMsg("请选择船只并填写售后原因");
      return;
    }
    const res = await fetch("/api/after-sales-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        boat_id: selectedBoat.auto_id,
        serial_no: selectedBoat.boat_no,
        sale_order_id: afterSalesOrderId,
        reason: afterReason,
        is_complete: false
      })
    });
    if (res.ok) {
      setAfterMsg("售后订单已创建");
      setShowAfterSales(false);
    } else {
      setAfterMsg("创建失败");
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: "60px auto", textAlign: "center" }}>
      <h2>销售订单页面</h2>
      <p>这里将展示和管理所有销售订单。</p>
      {/* 搜索表单 */}
      <form style={{ display: "flex", gap: 16, alignItems: "center", justifyContent: "center", marginBottom: 24 }} onSubmit={handleSearch}>
        <input
          style={{ ...inputStyle, maxWidth: 120 }}
          placeholder="销售人员"
          value={searchSales}
          onChange={e => setSearchSales(e.target.value)}
        />
        <select style={{ ...inputStyle, maxWidth: 120 }} value={dateRange} onChange={e => setDateRange(e.target.value)}>
          <option value="all">全部时间</option>
          <option value="month">最近一个月</option>
          <option value="halfyear">最近半年</option>
          <option value="custom">自定义</option>
        </select>
        {dateRange === "custom" && (
          <>
            <input
              style={{ ...inputStyle, maxWidth: 120 }}
              type="date"
              value={customFrom}
              onChange={e => setCustomFrom(e.target.value)}
              placeholder="起始日期"
            />
            <span>至</span>
            <input
              style={{ ...inputStyle, maxWidth: 120 }}
              type="date"
              value={customTo}
              onChange={e => setCustomTo(e.target.value)}
              placeholder="结束日期"
            />
          </>
        )}
        <button style={{ ...inputStyle, background: "#1976d2", color: "#fff", fontWeight: "bold", cursor: "pointer", maxWidth: 100 }} type="submit">查询</button>
      </form>
      <div style={{ margin: "32px 0" }}>
        <button
          style={{ padding: "10px 24px", borderRadius: 6, border: "none", background: "#1976d2", color: "#fff", fontWeight: "bold", fontSize: 16, cursor: "pointer" }}
          onClick={handleCreateOrder}
        >
          创建订单
        </button>
      </div>
      {showForm && (
        <form style={formStyle} onSubmit={handleSubmit}>
          <div style={rowStyle}>
            <label style={labelStyle} htmlFor="order_date">订单日期</label>
            <input style={inputStyle} name="order_date" id="order_date" type="date" value={form.order_date} onChange={handleChange} required />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle} htmlFor="sales_person">销售人员</label>
            <input style={inputStyle} name="sales_person" id="sales_person" value={form.sales_person} onChange={handleChange} required />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle} htmlFor="product">产品</label>
            <input style={inputStyle} name="product" id="product" value={form.product} onChange={handleChange} required />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle} htmlFor="quantity">数量</label>
            <input style={inputStyle} name="quantity" id="quantity" type="number" value={form.quantity} onChange={handleChange} required min="1" />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle} htmlFor="customer">客户</label>
            <input style={inputStyle} name="customer" id="customer" value={form.customer} onChange={handleChange} required />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle} htmlFor="total_amount">订单总额</label>
            <input style={inputStyle} name="total_amount" id="total_amount" type="number" value={form.total_amount} onChange={handleChange} required min="0" step="0.01" />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle} htmlFor="deposit_amount">定金总额</label>
            <input style={inputStyle} name="deposit_amount" id="deposit_amount" type="number" value={form.deposit_amount} onChange={handleChange} required min="0" step="0.01" />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle} htmlFor="delivery_date">交付时间</label>
            <input style={inputStyle} name="delivery_date" id="delivery_date" type="date" value={form.delivery_date} onChange={handleChange} required />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle} htmlFor="remark">备注</label>
            <input style={inputStyle} name="remark" id="remark" value={form.remark} onChange={handleChange} />
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 24 }}>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: "10px 0",
                background: "#1976d2",
                color: "#fff",
                fontWeight: "bold",
                fontSize: 16,
                border: "none",
                borderRadius: 6
              }}
            >
              提交订单
            </button>
            <button
              type="button"
              style={{
                flex: 1,
                padding: "10px 0",
                background: "#aaa",
                color: "#fff",
                fontWeight: "bold",
                fontSize: 16,
                border: "none",
                borderRadius: 6
              }}
              onClick={() => setShowForm(false)}
            >
              取消
            </button>
          </div>
        </form>
      )}
      {message && <div style={{ color: message.includes("成功") ? "#388e3c" : "#d32f2f", marginTop: 18 }}>{message}</div>}
      {/* 卡片式订单展示 */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "18px",
        justifyContent: "flex-start",
        marginTop: 32,
        maxWidth: 1100,
        marginLeft: "auto",
        marginRight: "auto"
      }}>
        {orders.length === 0 ? (
          <div style={{ color: "#888", margin: 24 }}>暂无销售订单</div>
        ) : (
          orders.map(order => (
            <div
              key={order.id}
              style={{
                background: "#fffbe6",
                borderRadius: 12,
                boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                padding: "18px 16px",
                minWidth: 180,
                maxWidth: 180,
                border: "1px solid #ffe58f",
                position: "relative",
                textAlign: "left",
                flex: "0 0 180px"
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
                订单号：{order.id}
              </div>
              <div style={{ borderBottom: "1px solid #ffe58f", padding: "6px 0" }}>
                <b>订单日期：</b>{order.order_date ? order.order_date.slice(0, 10) : ""}
              </div>
              <div style={{ borderBottom: "1px solid #ffe58f", padding: "6px 0" }}>
                <b>销售人员：</b>{order.sales_person}
              </div>
              <div style={{ borderBottom: "1px solid #ffe58f", padding: "6px 0" }}>
                <b>产品：</b>{order.product} <b>数量：</b>{order.quantity}
              </div>
              <div style={{ borderBottom: "1px solid #ffe58f", padding: "6px 0" }}>
                <b>客户：</b>{order.customer}
              </div>
              <div style={{ borderBottom: "1px solid #ffe58f", padding: "6px 0" }}>
                <b>订单总额：</b>
                <span style={{ color: "#d48806", fontWeight: 600 }}>{order.total_amount}</span>
                &nbsp;|&nbsp;
                <b>定金：</b>
                <span style={{ color: "#fa8c16", fontWeight: 600 }}>{order.deposit_amount}</span>
              </div>
              <div style={{ borderBottom: "1px solid #ffe58f", padding: "6px 0" }}>
                <b>交付时间：</b>{order.delivery_date ? order.delivery_date.slice(0, 10) : ""}
              </div>
              <div style={{ borderBottom: "1px solid #ffe58f", padding: "6px 0", color: '#888' }}>
                <b>备注：</b>{order.remark || '无'}
              </div>
              <div style={{ marginTop: 10 }}>
                <button onClick={() => openAfterSales(order.id)} style={{ padding: '4px 12px', borderRadius: 6, background: '#e91e63', color: '#fff', border: 'none', cursor: 'pointer' }}>售后</button>
              </div>
            </div>
          ))
        )}
      </div>
      {/* 售后弹窗 */}
      {showAfterSales && (
        <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 10, padding: 32, minWidth: 340, boxShadow: '0 2px 12px rgba(0,0,0,0.12)' }}>
            <h3>创建售后订单</h3>
            <div style={{ marginBottom: 16 }}>
              <div>选择船只：</div>
              <select style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc', marginTop: 6 }} value={selectedBoat ? selectedBoat.auto_id : ''} onChange={e => setSelectedBoat(boats.find(b => b.auto_id === Number(e.target.value)))}>
                <option value="">请选择船只</option>
                {boats.map(b => (
                  <option key={b.auto_id} value={b.auto_id}>{b.boat_no}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div>售后原因：</div>
              <textarea ref={afterInputRef} style={{ width: '100%', minHeight: 60, borderRadius: 6, border: '1px solid #ccc', marginTop: 6, padding: 8 }} value={afterReason} onChange={e => setAfterReason(e.target.value)} />
            </div>
            <div style={{ color: '#d32f2f', minHeight: 24 }}>{afterMsg}</div>
            <div style={{ marginTop: 18, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button onClick={() => setShowAfterSales(false)} style={{ padding: '6px 18px', borderRadius: 6, border: 'none', background: '#888', color: '#fff', fontWeight: 'bold', fontSize: 15, cursor: 'pointer' }}>取消</button>
              <button onClick={submitAfterSales} style={{ padding: '6px 18px', borderRadius: 6, border: 'none', background: '#e91e63', color: '#fff', fontWeight: 'bold', fontSize: 15, cursor: 'pointer' }}>提交</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SaleOrdersPage; 