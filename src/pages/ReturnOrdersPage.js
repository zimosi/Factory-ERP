import React, { useState } from "react";

function ReturnOrdersPage() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [form, setForm] = useState({
    material_name: "",
    model: "",
    quantity: "",
    unit_price: "",
    operator: user?.username || ""
  });
  const [materialOptions, setMaterialOptions] = useState([]);
  const [modelOptions, setModelOptions] = useState([]);
  const [showMaterialDropdown, setShowMaterialDropdown] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);

  // 材料名称自动补齐
  const handleMaterialNameChange = async (e) => {
    const name = e.target.value;
    setForm(f => ({ ...f, material_name: name, model: "" }));
    setShowMaterialDropdown(true);
    if (name && name.length >= 1) {
      try {
        const res = await fetch(`/api/materials?name_like=${encodeURIComponent(name)}`);
        if (res.ok) {
          const data = await res.json();
          setMaterialOptions(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        setMaterialOptions([]);
      }
    } else {
      setMaterialOptions([]);
    }
  };
  const handleMaterialSelect = (material) => {
    setForm(f => ({ ...f, material_name: material.name, model: "" }));
    setShowMaterialDropdown(false);
    fetchMaterialModels(material.name);
  };
  // 型号自动补齐
  const fetchMaterialModels = async (materialName) => {
    try {
      const res = await fetch(`/api/materials/models?name=${encodeURIComponent(materialName)}`);
      if (res.ok) {
        const data = await res.json();
        setModelOptions(Array.isArray(data) ? data : []);
        if (Array.isArray(data) && data.length > 0) setShowModelDropdown(true);
      }
    } catch (err) {
      setModelOptions([]);
    }
  };
  const handleModelChange = (e) => {
    setForm(f => ({ ...f, model: e.target.value }));
    setShowModelDropdown(true);
  };
  const handleModelSelect = (model) => {
    setForm(f => ({ ...f, model }));
    setShowModelDropdown(false);
  };
  // 其他字段
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  // 提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/return-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        alert("退货申请已提交");
        setForm({
          material_name: "",
          model: "",
          quantity: "",
          unit_price: "",
          operator: user?.username || ""
        });
      } else {
        const data = await res.json();
        alert(data.message || "提交失败");
      }
    } catch (err) {
      alert("网络错误，提交失败");
    }
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
      <h2 style={{ marginBottom: 32 }}>退货管理</h2>
      <form onSubmit={handleSubmit} style={{ width: 380, background: '#fafbfc', borderRadius: 10, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', padding: 32, display: 'flex', flexDirection: 'column', gap: 18 }} autoComplete="off">
        <div style={{ position: 'relative' }}>
          <label style={{ fontWeight: 500 }}>材料名称</label>
          <input name="material_name" value={form.material_name} onChange={handleMaterialNameChange} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} autoComplete="off" required />
          {showMaterialDropdown && materialOptions.length > 0 && (
            <div style={dropdownStyle}>
              {materialOptions.map((m, idx) => (
                <div key={idx} style={dropdownItemStyle} onClick={() => handleMaterialSelect(m)}>{m.name}{m.model ? `（${m.model}）` : ''}</div>
              ))}
            </div>
          )}
        </div>
        <div style={{ position: 'relative' }}>
          <label style={{ fontWeight: 500 }}>型号</label>
          <input name="model" value={form.model} onChange={handleModelChange} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} autoComplete="off" required />
          {showModelDropdown && modelOptions.length > 0 && (
            <div style={dropdownStyle}>
              {modelOptions.map((m, idx) => (
                <div key={idx} style={dropdownItemStyle} onClick={() => handleModelSelect(m)}>{m}</div>
              ))}
            </div>
          )}
        </div>
        <div>
          <label style={{ fontWeight: 500 }}>数量</label>
          <input name="quantity" type="number" min="1" value={form.quantity} onChange={handleChange} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} required />
        </div>
        <div>
          <label style={{ fontWeight: 500 }}>单价</label>
          <input name="unit_price" type="number" min="0" step="0.01" value={form.unit_price} onChange={handleChange} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} required />
        </div>
        <div>
          <label style={{ fontWeight: 500 }}>操作人</label>
          <input name="operator" value={form.operator} readOnly style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc', marginTop: 4, background: '#f5f5f5' }} />
        </div>
        <button type="submit" style={{ marginTop: 18, padding: '10px 0', background: '#1976d2', color: '#fff', fontWeight: 'bold', fontSize: 16, border: 'none', borderRadius: 6 }}>提交退货申请</button>
      </form>
    </div>
  );
}

export default ReturnOrdersPage; 