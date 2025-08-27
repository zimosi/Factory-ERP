import React, { useState, useRef, useEffect } from "react";

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

const suggestionBoxStyle = {
  position: "absolute",
  background: "#fff",
  border: "1px solid #ddd",
  borderRadius: 8,
  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
  zIndex: 1000,
  width: "calc(100% - 100px)",
  left: 100,
  top: 38,
  maxHeight: 300,
  overflowY: "auto",
  borderTop: "none"
};

function PurchaseOrdersPage() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    order_date: "",
    material_id: "",
    material_name: "",
    quantity: "",
    unit: "",
    unit_price: "",
    total_amount: "",
    purchaser: user?.username || "",
    status: "待入库",
    warehouse_id: "",
    expected_arrival: "",
    remark: "",
    is_arrived: false,
    model: "",
    property: ""
  });
  const [message, setMessage] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [modelOptions, setModelOptions] = useState([]);
  const [showModelOptions, setShowModelOptions] = useState(false);
  const [orders, setOrders] = useState([]);
  const materialInputRef = useRef();
  const searchTimeout = useRef();
  const [showLowStock, setShowLowStock] = useState(false);
  const [lowStockMaterials, setLowStockMaterials] = useState([]);
  const [purchaseInputs, setPurchaseInputs] = useState({}); // { material_id: { quantity, arrival, total } }
  const [searchMaterial, setSearchMaterial] = useState("");
  const [searchDate, setSearchDate] = useState("");

  useEffect(() => {
    fetchOrders();
    
    // 清理函数
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/purchase-orders");
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setOrders([]);
    }
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value
    });
    
    // 智能材料搜索
    if (name === "material_name") {
      if (value.trim()) {
        // 延迟搜索，避免频繁请求
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
          searchMaterials(value.trim());
        }, 300);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }
  };

  // 材料搜索函数
  const searchMaterials = async (query) => {
    try {
      const response = await fetch(`/api/materials?query=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error("搜索材料失败:", error);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // 🆕 一步选择：直接选择材料，自动补全所有信息
  const handleMaterialSelect = async (material) => {
    // 直接设置所有字段
    setForm(f => ({
      ...f,
      material_name: material.name,
      model: material.model || "",
      material_id: material.id,
      warehouse_id: material.warehouse_id || "",
      unit_price: material.unit_price || "",
      unit: material.unit || "",
      property: material.property || ""
    }));
    
    // 清空搜索状态
    setSuggestions([]);
    setShowSuggestions(false);
    setModelOptions([]);
    setShowModelOptions(false);
  };

  // 自动查找材料id
  const fetchMaterialIdAndFill = async (name, model) => {
    if (name && model) {
      try {
        const res = await fetch(`/api/materials/find-id?name=${encodeURIComponent(name)}&model=${encodeURIComponent(model)}`);
        if (res.ok) {
          const data = await res.json();
          setForm(f => ({
            ...f,
            material_id: data.id,
            warehouse_id: data.warehouse_id || "",
            unit_price: data.unit_price || "",
            unit: data.unit || "",
            property: data.property || ""
          }));
        } else {
          setForm(f => ({ ...f, material_id: "" }));
        }
      } catch {
        setForm(f => ({ ...f, material_id: "" }));
      }
    } else {
      setForm(f => ({ ...f, material_id: "" }));
    }
  };

  // 在材料名称和型号输入框onBlur时调用
  const handleMaterialNameBlur = () => {
    fetchMaterialIdAndFill(form.material_name, form.model);
  };
  const handleModelBlur = () => {
    fetchMaterialIdAndFill(form.material_name, form.model);
  };

  const handleBlur = e => {
    setTimeout(() => setShowSuggestions(false), 150);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage("");
    // 打印实际提交的body内容
    console.log("提交采购订单的body:", form);
    try {
      const res = await fetch("/api/purchase-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("采购订单创建成功！");
        setShowForm(false);
        setForm({
          order_date: "",
          material_id: "",
          material_name: "",
          quantity: "",
          unit: "",
          unit_price: "",
          total_amount: "",
          purchaser: user?.username || "",
          status: "待入库",
          warehouse_id: "",
          expected_arrival: "",
          remark: "",
          is_arrived: false,
          model: "",
          property: ""
        });
        fetchOrders(); // Add this line to refetch orders after successful creation
      } else {
        setMessage(data.message || "创建失败");
      }
    } catch (err) {
      setMessage("网络错误");
    }
  };

  const handleShowLowStock = async () => {
    const res = await fetch('/api/materials/all');
    const data = await res.json();
    setLowStockMaterials(Array.isArray(data) ? data.filter(m => m.quantity < (m.min_quantity || 0)) : []);
    setShowLowStock(true);
  };

  const handleInputChange = (id, field, value) => {
    setPurchaseInputs(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const handleGeneratePurchaseOrders = async () => {
    for (const m of lowStockMaterials) {
      const input = purchaseInputs[m.id];
      if (!input || !input.quantity || !input.arrival || !input.total) continue;
      // 获取材料详情
      const res = await fetch(`/api/materials/detail?name=${encodeURIComponent(m.name)}`);
      if (!res.ok) continue;
      const detail = await res.json();
      await fetch("/api/purchase-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_date: new Date().toISOString().slice(0, 10),
          material_id: detail.id,
          material_name: detail.name,
          quantity: input.quantity,
          unit: detail.unit,
          unit_price: detail.unit_price,
          total_amount: input.total,
          purchaser: user?.username || "",
          status: "待入库",
          warehouse_id: detail.warehouse_id,
          expected_arrival: input.arrival,
          remark: "",
          is_arrived: false,
          model: detail.model,
          property: detail.property
        })
      });
    }
    alert("采购订单已生成！");
    setShowLowStock(false);
    setPurchaseInputs({});
    fetchOrders();
  };

  // 搜索过滤
  const filteredOrders = orders.filter(order => {
    const matchMaterial = searchMaterial ? order.material_name.includes(searchMaterial) : true;
    const matchDate = searchDate ? (order.order_date && order.order_date.startsWith(searchDate)) : true;
    const matchReviewed = order.is_reviewed === true || order.is_reviewed === 1;
    return matchMaterial && matchDate && matchReviewed;
  });

  return (
    <div style={{ maxWidth: 1400, margin: "60px auto", textAlign: "center", overflowX: "auto" }}>
      <h2>采购订单页面</h2>
      <p>这里将展示和管理所有采购订单。</p>
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
      <button
        style={{
          padding: "10px 24px",
          borderRadius: 6,
          border: "none",
          background: "#1976d2",
          color: "#fff",
          fontWeight: "bold",
          fontSize: 16,
          cursor: "pointer",
          margin: "24px 0"
        }}
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? "取消" : "新建采购订单"}
      </button>
      {showForm && (
        <form style={formStyle} onSubmit={handleSubmit} autoComplete="off">
          {/* 🆕 选择进度指示器 */}
          <div style={{
            background: "#f8f9fa",
            border: "1px solid #e9ecef",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "20px",
            textAlign: "left"
          }}>
            <h4 style={{ margin: "0 0 12px 0", color: "#495057" }}>📋 材料选择进度</h4>
            <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  background: form.material_name ? "#4caf50" : "#e9ecef",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: "bold"
                }}>
                  {form.material_name ? "1" : "1"}
                </span>
                <span style={{ color: form.material_name ? "#4caf50" : "#6c757d" }}>
                  {form.material_name ? "✅ 已选择材料名称" : "⏳ 选择材料名称"}
                </span>
              </div>
              
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  background: form.model ? "#4caf50" : "#e9ecef",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: "bold"
                }}>
                  {form.model ? "2" : "2"}
                </span>
                <span style={{ color: form.model ? "#4caf50" : "#6c757d" }}>
                  {form.model ? "✅ 已选择型号" : "⏳ 选择型号"}
                </span>
              </div>
              
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  background: form.material_id ? "#4caf50" : "#e9ecef",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: "bold"
                }}>
                  {form.material_id ? "3" : "3"}
                </span>
                <span style={{ color: form.material_id ? "#4caf50" : "#6c757d" }}>
                  {form.material_id ? "✅ 信息已补全" : "⏳ 等待补全信息"}
                </span>
              </div>
            </div>
          </div>
          <div style={rowStyle}>
            <label style={labelStyle} htmlFor="order_date">采购日期</label>
            <input style={inputStyle} name="order_date" id="order_date" type="date" value={form.order_date} onChange={handleChange} required />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle} htmlFor="material_id">材料ID</label>
            <input style={inputStyle} name="material_id" id="material_id" value={form.material_id} readOnly />
          </div>
          <div style={{ ...rowStyle, position: "relative" }}>
            <label style={labelStyle} htmlFor="material_name">材料名称</label>
            <input
              style={{
                ...inputStyle,
                borderColor: form.material_name ? "#4caf50" : "#e1e5e9"
              }}
              name="material_name"
              id="material_name"
              value={form.material_name}
              onChange={handleChange}
              onFocus={handleChange}
              onBlur={handleMaterialNameBlur}
              ref={materialInputRef}
              autoComplete="off"
              required
              placeholder="输入材料名称，选择后自动补全所有信息"
            />
            {form.material_name && (
              <div style={{
                position: "absolute",
                right: "8px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#4caf50",
                fontSize: "12px"
              }}>
                ✅ 已选择
              </div>
            )}
            {showSuggestions && suggestions.length > 0 && (
              <div style={suggestionBoxStyle}>
                {suggestions.map((material, index) => (
                  <div
                    key={material.id || index}
                    style={{
                      padding: "12px 16px",
                      cursor: "pointer",
                      borderBottom: "1px solid #f0f0f0",
                      transition: "background-color 0.2s",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = "#f5f5f5"}
                    onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                    onMouseDown={() => handleMaterialSelect(material)}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: "600", color: "#1976d2", fontSize: "14px" }}>
                        {material.name}
                      </div>
                      <div style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}>
                        {material.model ? `型号: ${material.model}` : "无型号"} | {material.unit || "无单位"}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", fontSize: "12px", color: "#888" }}>
                      <div>ID: {material.id}</div>
                      <div>¥{material.unit_price || "0.00"}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={rowStyle}>
            <label style={labelStyle} htmlFor="quantity">采购数量</label>
            <input style={inputStyle} name="quantity" id="quantity" type="number" value={form.quantity} onChange={handleChange} required min="1" />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle} htmlFor="unit">单位</label>
            <input style={inputStyle} name="unit" id="unit" value={form.unit} onChange={handleChange} />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle} htmlFor="unit_price">单价</label>
            <input style={inputStyle} name="unit_price" id="unit_price" type="number" value={form.unit_price} onChange={handleChange} min="0" step="0.01" />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle} htmlFor="total_amount">总金额</label>
            <input style={inputStyle} name="total_amount" id="total_amount" type="number" value={form.total_amount} onChange={handleChange} min="0" step="0.01" />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle} htmlFor="purchaser">采购人</label>
            <input style={inputStyle} name="purchaser" id="purchaser" value={form.purchaser} onChange={handleChange} />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle} htmlFor="status">状态</label>
            <input style={inputStyle} name="status" id="status" value={form.status} onChange={handleChange} />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle} htmlFor="warehouse_id">仓库ID</label>
            <input style={inputStyle} name="warehouse_id" id="warehouse_id" value={form.warehouse_id} onChange={handleChange} />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle} htmlFor="expected_arrival">预计到货时间</label>
            <input style={inputStyle} name="expected_arrival" id="expected_arrival" type="date" value={form.expected_arrival} onChange={handleChange} />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle} htmlFor="remark">备注</label>
            <input style={inputStyle} name="remark" id="remark" value={form.remark} onChange={handleChange} />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle} htmlFor="is_arrived">是否到货</label>
            <input style={{ width: 20, height: 20 }} name="is_arrived" id="is_arrived" type="checkbox" checked={form.is_arrived} onChange={handleChange} />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle} htmlFor="model">型号</label>
            <input 
              style={{
                ...inputStyle,
                borderColor: form.model ? "#4caf50" : "#e1e5e9",
                backgroundColor: "#fff"
              }} 
              name="model" 
              id="model" 
              value={form.model} 
              onChange={handleChange} 
              placeholder="选择材料后自动填充"
              readOnly
            />
            {form.model && (
              <div style={{
                position: "absolute",
                right: "8px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#4caf50",
                fontSize: "12px"
              }}>
                ✅ 已选择
              </div>
            )}
          </div>
          <div style={rowStyle}>
            <label style={labelStyle} htmlFor="property">属性</label>
            <input style={inputStyle} name="property" id="property" value={form.property} onChange={handleChange} />
          </div>
          <button style={{...formStyle, padding: "10px 0", margin: 0, background: "#1976d2", color: "#fff", fontWeight: "bold", fontSize: 16, border: "none"}} type="submit">提交订单</button>
        </form>
      )}
      {message && <div style={{ color: message.includes("成功") ? "#388e3c" : "#d32f2f", marginTop: 18 }}>{message}</div>}
      {/* 采购订单表格展示 */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 32, tableLayout: "fixed" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #e0e0e0", padding: "8px 10px", fontSize: 15, background: "#f5f5f5", fontWeight: 600, minWidth: 90, whiteSpace: 'normal', wordBreak: 'break-all' }}>ID</th>
            <th style={{ border: "1px solid #e0e0e0", padding: "8px 10px", fontSize: 15, background: "#f5f5f5", fontWeight: 600, minWidth: 90, whiteSpace: 'normal', wordBreak: 'break-all' }}>采购日期</th>
            <th style={{ border: "1px solid #e0e0e0", padding: "8px 10px", fontSize: 15, background: "#f5f5f5", fontWeight: 600, minWidth: 90, whiteSpace: 'normal', wordBreak: 'break-all' }}>材料名称</th>
            <th style={{ border: "1px solid #e0e0e0", padding: "8px 10px", fontSize: 15, background: "#f5f5f5", fontWeight: 600, minWidth: 90, whiteSpace: 'normal', wordBreak: 'break-all' }}>材料ID</th>
            <th style={{ border: "1px solid #e0e0e0", padding: "8px 10px", fontSize: 15, background: "#f5f5f5", fontWeight: 600, minWidth: 90, whiteSpace: 'normal', wordBreak: 'break-all' }}>采购数量</th>
            <th style={{ border: "1px solid #e0e0e0", padding: "8px 10px", fontSize: 15, background: "#f5f5f5", fontWeight: 600, minWidth: 90, whiteSpace: 'normal', wordBreak: 'break-all' }}>单位</th>
            <th style={{ border: "1px solid #e0e0e0", padding: "8px 10px", fontSize: 15, background: "#f5f5f5", fontWeight: 600, minWidth: 90, whiteSpace: 'normal', wordBreak: 'break-all' }}>单价</th>
            <th style={{ border: "1px solid #e0e0e0", padding: "8px 10px", fontSize: 15, background: "#f5f5f5", fontWeight: 600, minWidth: 90, whiteSpace: 'normal', wordBreak: 'break-all' }}>总金额</th>
            <th style={{ border: "1px solid #e0e0e0", padding: "8px 10px", fontSize: 15, background: "#f5f5f5", fontWeight: 600, minWidth: 90, whiteSpace: 'normal', wordBreak: 'break-all' }}>采购人</th>
            <th style={{ border: "1px solid #e0e0e0", padding: "8px 10px", fontSize: 15, background: "#f5f5f5", fontWeight: 600, minWidth: 90, whiteSpace: 'normal', wordBreak: 'break-all' }}>状态</th>
            <th style={{ border: "1px solid #e0e0e0", padding: "8px 10px", fontSize: 15, background: "#f5f5f5", fontWeight: 600, minWidth: 90, whiteSpace: 'normal', wordBreak: 'break-all' }}>仓库ID</th>
            <th style={{ border: "1px solid #e0e0e0", padding: "8px 10px", fontSize: 15, background: "#f5f5f5", fontWeight: 600, minWidth: 90, whiteSpace: 'normal', wordBreak: 'break-all' }}>预计到货时间</th>
            <th style={{ border: "1px solid #e0e0e0", padding: "8px 10px", fontSize: 15, background: "#f5f5f5", fontWeight: 600, minWidth: 90, whiteSpace: 'normal', wordBreak: 'break-all' }}>备注</th>
            <th style={{ border: "1px solid #e0e0e0", padding: "8px 10px", fontSize: 15, background: "#f5f5f5", fontWeight: 600, minWidth: 90, whiteSpace: 'normal', wordBreak: 'break-all' }}>是否到货</th>
            <th style={{ border: "1px solid #e0e0e0", padding: "8px 10px", fontSize: 15, background: "#f5f5f5", fontWeight: 600, minWidth: 90, whiteSpace: 'normal', wordBreak: 'break-all' }}>型号</th>
            <th style={{ border: "1px solid #e0e0e0", padding: "8px 10px", fontSize: 15, background: "#f5f5f5", fontWeight: 600, minWidth: 90, whiteSpace: 'normal', wordBreak: 'break-all' }}>属性</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.length === 0 ? (
            <tr><td colSpan={16} style={{ textAlign: "center", padding: 16 }}>暂无采购订单</td></tr>
          ) : (
            filteredOrders.map(order => (
              <tr key={order.id}>
                <td style={{ border: "1px solid #e0e0e0", padding: "8px 10px", minWidth: 90, whiteSpace: 'normal', wordBreak: 'break-all', fontSize: 15 }}>{order.id}</td>
                <td style={{ border: "1px solid #e0e0e0", padding: "8px 10px", minWidth: 90, whiteSpace: 'normal', wordBreak: 'break-all', fontSize: 15 }}>{order.order_date}</td>
                <td style={{ border: "1px solid #e0e0e0", padding: "8px 10px", minWidth: 90, whiteSpace: 'normal', wordBreak: 'break-all', fontSize: 15 }}>{order.material_name}</td>
                <td style={{ border: "1px solid #e0e0e0", padding: "8px 10px", minWidth: 90, whiteSpace: 'normal', wordBreak: 'break-all', fontSize: 15 }}>{order.material_id}</td>
                <td style={{ border: "1px solid #e0e0e0", padding: "8px 10px", minWidth: 90, whiteSpace: 'normal', wordBreak: 'break-all', fontSize: 15 }}>{order.quantity}</td>
                <td style={{ border: "1px solid #e0e0e0", padding: "8px 10px", minWidth: 90, whiteSpace: 'normal', wordBreak: 'break-all', fontSize: 15 }}>{order.unit}</td>
                <td style={{ border: "1px solid #e0e0e0", padding: "8px 10px", minWidth: 90, whiteSpace: 'normal', wordBreak: 'break-all', fontSize: 15 }}>{order.unit_price}</td>
                <td style={{ border: "1px solid #e0e0e0", padding: "8px 10px", minWidth: 90, whiteSpace: 'normal', wordBreak: 'break-all', fontSize: 15 }}>{order.total_amount}</td>
                <td style={{ border: "1px solid #e0e0e0", padding: "8px 10px", minWidth: 90, whiteSpace: 'normal', wordBreak: 'break-all', fontSize: 15 }}>{order.purchaser}</td>
                <td style={{ border: "1px solid #e0e0e0", padding: "8px 10px", minWidth: 90, whiteSpace: 'normal', wordBreak: 'break-all', fontSize: 15 }}>{order.status}</td>
                <td style={{ border: "1px solid #e0e0e0", padding: "8px 10px", minWidth: 90, whiteSpace: 'normal', wordBreak: 'break-all', fontSize: 15 }}>{order.warehouse_id}</td>
                <td style={{ border: "1px solid #e0e0e0", padding: "8px 10px", minWidth: 90, whiteSpace: 'normal', wordBreak: 'break-all', fontSize: 15 }}>{order.expected_arrival}</td>
                <td style={{ border: "1px solid #e0e0e0", padding: "8px 10px", minWidth: 90, whiteSpace: 'normal', wordBreak: 'break-all', fontSize: 15 }}>{order.remark}</td>
                <td style={{ border: "1px solid #e0e0e0", padding: "8px 10px", minWidth: 90, whiteSpace: 'normal', wordBreak: 'break-all', fontSize: 15 }}>{order.is_arrived ? "是" : "否"}</td>
                <td style={{ border: "1px solid #e0e0e0", padding: "8px 10px", minWidth: 90, whiteSpace: 'normal', wordBreak: 'break-all', fontSize: 15 }}>{order.model}</td>
                <td style={{ border: "1px solid #e0e0e0", padding: "8px 10px", minWidth: 90, whiteSpace: 'normal', wordBreak: 'break-all', fontSize: 15 }}>{order.property}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div style={{ marginTop: 32, textAlign: 'center' }}>
        <button style={{ padding: '10px 24px', borderRadius: 6, border: 'none', background: '#d32f2f', color: '#fff', fontWeight: 'bold', fontSize: 16, cursor: 'pointer' }} onClick={handleShowLowStock}>
          查看缺少材料
        </button>
      </div>
      {showLowStock && (
        <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 10, padding: 32, minWidth: 400, maxHeight: 600, overflowY: 'auto', boxShadow: '0 4px 24px rgba(0,0,0,0.18)' }}>
            <h3 style={{ marginBottom: 18 }}>缺少材料清单</h3>
            {lowStockMaterials.length === 0 ? (
              <div style={{ color: '#888' }}>暂无缺少材料</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fafbfc' }}>
                <thead>
                  <tr>
                    <th style={{ border: '1px solid #e0e0e0', padding: '6px 8px', background: '#f5f5f5' }}>材料名称</th>
                    <th style={{ border: '1px solid #e0e0e0', padding: '6px 8px', background: '#f5f5f5' }}>型号</th>
                    <th style={{ border: '1px solid #e0e0e0', padding: '6px 8px', background: '#f5f5f5' }}>库存</th>
                    <th style={{ border: '1px solid #e0e0e0', padding: '6px 8px', background: '#f5f5f5' }}>最少库存</th>
                    <th style={{ border: '1px solid #e0e0e0', padding: '6px 8px', background: '#f5f5f5' }}>单价</th>
                    <th style={{ border: '1px solid #e0e0e0', padding: '6px 8px', background: '#f5f5f5' }}>采购数量</th>
                    <th style={{ border: '1px solid #e0e0e0', padding: '6px 8px', background: '#f5f5f5' }}>预计到货</th>
                    <th style={{ border: '1px solid #e0e0e0', padding: '6px 8px', background: '#f5f5f5' }}>总金额</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockMaterials.map(m => (
                    <tr key={m.id}>
                      <td style={{ border: '1px solid #e0e0e0', padding: '6px 8px' }}>{m.name}</td>
                      <td style={{ border: '1px solid #e0e0e0', padding: '6px 8px' }}>{m.model}</td>
                      <td style={{ border: '1px solid #e0e0e0', padding: '6px 8px' }}>{m.quantity}</td>
                      <td style={{ border: '1px solid #e0e0e0', padding: '6px 8px' }}>{m.min_quantity}</td>
                      <td style={{ border: '1px solid #e0e0e0', padding: '6px 8px' }}>{m.unit_price}</td>
                      <td style={{ border: '1px solid #e0e0e0', padding: '6px 8px' }}>
                        <input
                          type="number"
                          min={1}
                          value={purchaseInputs[m.id]?.quantity || ""}
                          onChange={e => handleInputChange(m.id, "quantity", e.target.value)}
                          style={{ width: 60 }}
                          placeholder="数量"
                        />
                      </td>
                      <td style={{ border: '1px solid #e0e0e0', padding: '6px 8px' }}>
                        <input
                          type="date"
                          value={purchaseInputs[m.id]?.arrival || ""}
                          onChange={e => handleInputChange(m.id, "arrival", e.target.value)}
                          style={{ width: 120 }}
                        />
                      </td>
                      <td style={{ border: '1px solid #e0e0e0', padding: '6px 8px' }}>
                        <input
                          type="number"
                          min={0}
                          value={purchaseInputs[m.id]?.total || ""}
                          onChange={e => handleInputChange(m.id, "total", e.target.value)}
                          style={{ width: 80 }}
                          placeholder="总金额"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div style={{ textAlign: 'right', marginTop: 18 }}>
              <button style={{ padding: '8px 24px', borderRadius: 6, border: 'none', background: '#1976d2', color: '#fff', fontWeight: 'bold', fontSize: 15, cursor: 'pointer', marginRight: 12 }} onClick={handleGeneratePurchaseOrders}>
                生成采购订单
              </button>
              <button style={{ padding: '8px 24px', borderRadius: 6, border: 'none', background: '#aaa', color: '#fff', fontWeight: 'bold', fontSize: 15, cursor: 'pointer' }} onClick={() => setShowLowStock(false)}>
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PurchaseOrdersPage; 