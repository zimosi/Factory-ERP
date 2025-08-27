import React, { useState, useRef } from "react";

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
  border: "1px solid #ccc",
  borderRadius: 6,
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  zIndex: 100,
  width: "calc(100% - 100px)",
  left: 100,
  top: 38,
  maxHeight: 180,
  overflowY: "auto"
};

function AddInventoryPage() {
  const [form, setForm] = useState({
    name: "",
    warehouse_id: "",
    quantity: "",
    model: "",
    unit_price: "",
    unit: "",
    property: ""
  });
  const [message, setMessage] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const nameInputRef = useRef();

  const handleChange = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (name === "name") {
      if (value) {
        fetch(`/api/materials?name_like=${encodeURIComponent(value)}`)
          .then(res => res.json())
          .then(data => {
            setSuggestions(data);
            setShowSuggestions(true);
          });
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }
  };

  const handleSuggestionClick = name => {
    setForm({ ...form, name });
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleBlur = () => {
    setTimeout(() => setShowSuggestions(false), 150);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage("");
    const user = JSON.parse(localStorage.getItem("user"));
    try {
      // 先进行材料入库
      const res = await fetch("/api/materials/add-inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        // 再写入入库记录
        await fetch('/api/inventory-records', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            material_name: form.name,
            type: 'in',
            quantity: form.quantity,
            unit: form.unit,
            operator: user?.username || '未知',
            remark: '手动入库'
          })
        });
        setMessage(data.message || "添加成功");
        setForm({
          name: "",
          warehouse_id: "",
          quantity: "",
          model: "",
          unit_price: "",
          unit: "",
          property: ""
        });
      } else {
        setMessage(data.message || "添加失败");
      }
    } catch (err) {
      setMessage("网络错误");
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "60px auto", textAlign: "center" }}>
      <h2>添加库存</h2>
      <form style={formStyle} onSubmit={handleSubmit} autoComplete="off">
        <div style={{ ...rowStyle, position: "relative" }}>
          <label style={labelStyle} htmlFor="name">材料名称</label>
          <input
            style={inputStyle}
            name="name"
            id="name"
            value={form.name}
            onChange={handleChange}
            onFocus={handleChange}
            onBlur={handleBlur}
            ref={nameInputRef}
            autoComplete="off"
            required
          />
          {showSuggestions && suggestions.length > 0 && (
            <div style={suggestionBoxStyle}>
              {suggestions.map(name => (
                <div
                  key={name}
                  style={{ padding: "8px 12px", cursor: "pointer", textAlign: "left" }}
                  onMouseDown={() => handleSuggestionClick(name)}
                >
                  {name}
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={rowStyle}>
          <label style={labelStyle} htmlFor="warehouse_id">仓库ID</label>
          <input style={inputStyle} name="warehouse_id" id="warehouse_id" value={form.warehouse_id} onChange={handleChange} required />
        </div>
        <div style={rowStyle}>
          <label style={labelStyle} htmlFor="quantity">数量</label>
          <input style={inputStyle} name="quantity" id="quantity" type="number" value={form.quantity} onChange={handleChange} required min="1" />
        </div>
        <div style={rowStyle}>
          <label style={labelStyle} htmlFor="model">型号</label>
          <input style={inputStyle} name="model" id="model" value={form.model} onChange={handleChange} />
        </div>
        <div style={rowStyle}>
          <label style={labelStyle} htmlFor="unit_price">单价</label>
          <input style={inputStyle} name="unit_price" id="unit_price" type="number" value={form.unit_price} onChange={handleChange} min="0" step="0.01" />
        </div>
        <div style={rowStyle}>
          <label style={labelStyle} htmlFor="unit">单位</label>
          <input style={inputStyle} name="unit" id="unit" value={form.unit} onChange={handleChange} />
        </div>
        <div style={rowStyle}>
          <label style={labelStyle} htmlFor="property">属性</label>
          <input style={inputStyle} name="property" id="property" value={form.property} onChange={handleChange} />
        </div>
        <button style={{...formStyle, padding: "10px 0", margin: 0, background: "#4caf50", color: "#fff", fontWeight: "bold", fontSize: 16, border: "none"}} type="submit">提交</button>
      </form>
      {message && <div style={{ color: message.includes("成功") ? "#388e3c" : "#d32f2f", marginTop: 18 }}>{message}</div>}
    </div>
  );
}

export default AddInventoryPage; 