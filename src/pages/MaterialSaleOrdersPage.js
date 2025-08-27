import React, { useState, useEffect } from "react";

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
  marginTop: 16,
  background: "#fff",
  borderRadius: 8,
  overflow: "hidden",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
};

const thStyle = {
  background: "#f5f5f5",
  padding: "12px 8px",
  textAlign: "left",
  fontWeight: 600,
  borderBottom: "1px solid #e0e0e0",
  fontSize: 14
};

const tdStyle = {
  padding: "12px",
  borderBottom: "1px solid #f0f0f0",
  fontSize: 14
};

const containerStyle = {
  display: "flex",
  gap: 32,
  maxWidth: 1200,
  margin: "40px auto",
  padding: "0 20px"
};

const leftPanelStyle = {
  flex: "0 0 450px",
  background: "#fff",
  borderRadius: 12,
  boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
  padding: 32
};

const rightPanelStyle = {
  flex: 1,
  background: "#fff",
  borderRadius: 12,
  boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
  padding: 32
};

function MaterialSaleOrdersPage() {
  const [showForm, setShowForm] = useState(true);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    order_date: "",
    sales_person: "",
    material_name: "",
    model: "",
    material_id: "",
    quantity: "",
    unit_price: "",
    customer: "",
    total_amount: "",
    deposit_amount: "",
    delivery_date: "",
    remark: ""
  });
  const [message, setMessage] = useState("");
  const [modelOptions, setModelOptions] = useState([]);
  const [materialOptions, setMaterialOptions] = useState([]);
  const [showMaterialDropdown, setShowMaterialDropdown] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);

  // 获取订单列表
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/material-sale-orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error("获取订单列表失败:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 材料名称模糊搜索
  const handleMaterialNameChange = async (e) => {
    const name = e.target.value;
    setForm(f => ({ ...f, material_name: name, material_id: "", model: "" }));
    setShowMaterialDropdown(true);
    if (name && name.length >= 1) {
      try {
        const res = await fetch(`/api/materials?name_like=${encodeURIComponent(name)}`);
        if (res.ok) {
          const data = await res.json();
          setMaterialOptions(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("搜索材料失败:", err);
      }
    } else {
      setMaterialOptions([]);
    }
  };

  // 选择材料
  const handleMaterialSelect = (material) => {
    setForm(f => ({
      ...f,
      material_name: material.name,
      material_id: material.id,
      model: ""
    }));
    setShowMaterialDropdown(false);
    setModelOptions([]);

    // 获取该材料的型号列表
    fetchMaterialModels(material.name);
  };

  // 获取材料型号
  const fetchMaterialModels = async (materialName) => {
    try {
      const res = await fetch(`/api/materials/models?name=${encodeURIComponent(materialName)}`);
      if (res.ok) {
        const data = await res.json();
        setModelOptions(Array.isArray(data) ? data : []);
        // 如果有型号数据，显示型号下拉框
        if (Array.isArray(data) && data.length > 0) {
          setShowModelDropdown(true);
        }
      }
    } catch (err) {
      console.error("获取型号失败:", err);
    }
  };

  // 型号输入框点击事件
  const handleModelInputClick = () => {
    if (form.material_name && modelOptions.length > 0) {
      setShowModelDropdown(true);
    }
  };

  // 型号选择后查找id
  const handleModelChange = async (e) => {
    const model = e.target.value;
    setForm(f => ({ ...f, model, material_id: "" }));
    setShowModelDropdown(true);

    if (form.material_name && model) {
      const res = await fetch(`/api/materials/find-id?name=${encodeURIComponent(form.material_name)}&model=${encodeURIComponent(model)}`);
      if (res.ok) {
        const data = await res.json();
        setForm(f => ({ ...f, material_id: data.id }));
        // 自动补齐材料信息
        await fetchMaterialInfo(data.id);
      } else {
        setForm(f => ({ ...f, material_id: "" }));
      }
    }
  };

  // 选择型号
  const handleModelSelect = async (model) => {
    setForm(f => ({ ...f, model, material_id: "" }));
    setShowModelDropdown(false);

    if (form.material_name && model) {
      const res = await fetch(`/api/materials/find-id?name=${encodeURIComponent(form.material_name)}&model=${encodeURIComponent(model)}`);
      if (res.ok) {
        const data = await res.json();
        setForm(f => ({ ...f, material_id: data.id }));
        // 自动补齐材料信息
        await fetchMaterialInfo(data.id);
      } else {
        setForm(f => ({ ...f, material_id: "" }));
      }
    }
  };

  // 获取材料详细信息并自动补齐
  const fetchMaterialInfo = async (materialId) => {
    try {
      const res = await fetch(`/api/materials/${materialId}`);
      if (res.ok) {
        const material = await res.json();
        setForm(f => ({
          ...f,
          unit_price: material.unit_price || "",
          // 自动计算订单总额
          total_amount: material.unit_price && f.quantity ? (material.unit_price * f.quantity).toFixed(2) : "",
          // 自动计算定金总额
          deposit_amount: material.unit_price && f.quantity ? (material.unit_price * f.quantity * 0.2).toFixed(2) : ""
        }));
      }
    } catch (err) {
      console.error("获取材料信息失败:", err);
    }
  };

  // 数量变化时自动计算订单总额
  const handleQuantityChange = (e) => {
    const quantity = e.target.value;
    setForm(f => ({
      ...f,
      quantity,
      total_amount: f.unit_price && quantity ? (f.unit_price * quantity).toFixed(2) : "",
      deposit_amount: f.unit_price && quantity ? (f.unit_price * quantity * 0.2).toFixed(2) : ""
    }));
  };

  // 单价变化时自动计算订单总额
  const handleUnitPriceChange = (e) => {
    const unitPrice = e.target.value;
    setForm(f => ({
      ...f,
      unit_price: unitPrice,
      total_amount: unitPrice && f.quantity ? (unitPrice * f.quantity).toFixed(2) : "",
      deposit_amount: unitPrice && f.quantity ? (unitPrice * f.quantity * 0.2).toFixed(2) : ""
    }));
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setShowMaterialDropdown(false);
        setShowModelDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage("");
    if (!form.material_id) {
      setMessage("请正确填写材料名称和型号");
      return;
    }
    try {
      const res = await fetch("/api/material-sale-orders", {
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
          material_name: "",
          model: "",
          material_id: "",
          quantity: "",
          unit_price: "",
          customer: "",
          total_amount: "",
          deposit_amount: "",
          delivery_date: "",
          remark: ""
        });
        // 刷新订单列表
        fetchOrders();
        // 自动生成material_pick_order
        const user = JSON.parse(localStorage.getItem("user"));
        await fetch("/api/production-pick-orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            production_order_id: 0,
            operator: user?.username || "",
            what: "销售",
            remark: "销售出库",
            items: [{
              material_id: form.material_id,
              model: form.model,
              quantity: form.quantity
            }]
          })
        });
      } else {
        setMessage(data.message || "创建失败");
      }
    } catch (err) {
      setMessage("网络错误");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  const dropdownStyle = {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    background: "#fff",
    border: "1px solid #ccc",
    borderRadius: "4px",
    maxHeight: "200px",
    overflowY: "auto",
    zIndex: 100,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
  };

  const dropdownItemStyle = {
    padding: "8px 12px",
    cursor: "pointer",
    borderBottom: "1px solid #f0f0f0"
  };

  const dropdownItemHoverStyle = {
    ...dropdownItemStyle,
    background: "#f5f5f5"
  };

  return (
    <div style={containerStyle}>
      {/* 左侧面板 - 创建订单表单 */}
      <div style={leftPanelStyle}>
        <h2>新建材料销售订单</h2>
        {showForm && (
          <form style={formStyle} onSubmit={handleSubmit} autoComplete="off">
            <div style={rowStyle}>
              <label style={labelStyle}>订单日期</label>
              <input style={inputStyle} type="date" name="order_date" value={form.order_date} onChange={handleChange} required />
            </div>
            <div style={rowStyle}>
              <label style={labelStyle}>销售人员</label>
              <input style={inputStyle} name="sales_person" value={form.sales_person} onChange={handleChange} required />
            </div>
            <div style={{...rowStyle, position: 'relative'}} className="dropdown-container">
              <label style={labelStyle}>材料名称</label>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  style={inputStyle}
                  name="material_name"
                  value={form.material_name}
                  onChange={handleMaterialNameChange}
                  required
                  autoComplete="off"
                />
                {showMaterialDropdown && materialOptions.length > 0 && (
                  <div style={dropdownStyle}>
                    {materialOptions.map((material, idx) => (
                      <div
                        key={idx}
                        style={dropdownItemStyle}
                        onMouseEnter={(e) => e.target.style.background = '#f5f5f5'}
                        onMouseLeave={(e) => e.target.style.background = '#fff'}
                        onClick={() => handleMaterialSelect(material)}
                      >
                        {material.name}{material.model ? `(${material.model})` : ''}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div style={{...rowStyle, position: 'relative'}} className="dropdown-container">
              <label style={labelStyle}>型号</label>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  style={inputStyle}
                  name="model"
                  value={form.model}
                  onChange={handleModelChange}
                  required
                  autoComplete="off"
                  onClick={handleModelInputClick}
                />
                {showModelDropdown && modelOptions.length > 0 && (
                  <div style={dropdownStyle}>
                    {modelOptions.map((model, idx) => (
                      <div
                        key={idx}
                        style={dropdownItemStyle}
                        onMouseEnter={(e) => e.target.style.background = '#f5f5f5'}
                        onMouseLeave={(e) => e.target.style.background = '#fff'}
                        onClick={() => handleModelSelect(model)}
                      >
                        {model}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div style={rowStyle}>
              <label style={labelStyle}>数量</label>
              <input style={inputStyle} name="quantity" type="number" min="1" value={form.quantity} onChange={handleQuantityChange} required />
            </div>
            <div style={rowStyle}>
              <label style={labelStyle}>单价</label>
              <input style={inputStyle} name="unit_price" type="number" min="0" step="0.01" value={form.unit_price} onChange={handleUnitPriceChange} required />
            </div>
            <div style={rowStyle}>
              <label style={labelStyle}>客户</label>
              <input style={inputStyle} name="customer" value={form.customer} onChange={handleChange} required />
            </div>
            <div style={rowStyle}>
              <label style={labelStyle}>订单总额</label>
              <input style={inputStyle} name="total_amount" type="number" min="0" value={form.total_amount} onChange={handleChange} required />
            </div>
            <div style={rowStyle}>
              <label style={labelStyle}>定金总额</label>
              <input style={inputStyle} name="deposit_amount" type="number" min="0" value={form.deposit_amount} onChange={handleChange} required />
            </div>
            <div style={rowStyle}>
              <label style={labelStyle}>交付时间</label>
              <input style={inputStyle} type="date" name="delivery_date" value={form.delivery_date} onChange={handleChange} required />
            </div>
            <div style={rowStyle}>
              <label style={labelStyle}>备注</label>
              <input style={inputStyle} name="remark" value={form.remark} onChange={handleChange} />
            </div>
            <button style={{...formStyle, padding: "10px 0", margin: 0, background: "#1976d2", color: "#fff", fontWeight: "bold", fontSize: 16, border: "none"}} type="submit">提交订单</button>
          </form>
        )}
        {message && <div style={{ color: message.includes("成功") ? "#388e3c" : "#d32f2f", marginTop: 18 }}>{message}</div>}
      </div>

      {/* 右侧面板 - 订单列表 */}
      <div style={rightPanelStyle}>
        <h2>材料销售订单列表</h2>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>加载中...</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>订单ID</th>
                  <th style={thStyle}>订单日期</th>
                  <th style={thStyle}>销售人员</th>
                  <th style={thStyle}>材料名称</th>
                  <th style={thStyle}>型号</th>
                  <th style={thStyle}>数量</th>
                  <th style={thStyle}>单价</th>
                  <th style={thStyle}>客户</th>
                  <th style={thStyle}>订单总额</th>
                  <th style={thStyle}>定金</th>
                  <th style={thStyle}>交付时间</th>
                  <th style={thStyle}>备注</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="12" style={{ ...tdStyle, textAlign: "center", color: "#666" }}>
                      暂无订单数据
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id}>
                      <td style={tdStyle}>{order.id}</td>
                      <td style={tdStyle}>{formatDate(order.order_date)}</td>
                      <td style={tdStyle}>{order.sales_person}</td>
                      <td style={tdStyle}>{order.material_name}</td>
                      <td style={tdStyle}>{order.model}</td>
                      <td style={tdStyle}>{order.quantity}</td>
                      <td style={tdStyle}>¥{order.unit_price}</td>
                      <td style={tdStyle}>{order.customer}</td>
                      <td style={tdStyle}>¥{order.total_amount}</td>
                      <td style={tdStyle}>¥{order.deposit_amount}</td>
                      <td style={tdStyle}>{formatDate(order.delivery_date)}</td>
                      <td style={tdStyle}>{order.remark || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default MaterialSaleOrdersPage; 