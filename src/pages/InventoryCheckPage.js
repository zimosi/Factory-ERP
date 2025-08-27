import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { useNavigate } from "react-router-dom";

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

const InventoryCheckPage = forwardRef(function InventoryCheckPage(props, ref) {
  const [materials, setMaterials] = useState([]);
  const [showForm, setShowForm] = useState(false);
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
  const navigate = useNavigate();
  const [showProductForm, setShowProductForm] = useState(false);
  const [productForm, setProductForm] = useState({
    product_name: "",
    warehouse_id: "",
    quantity: "",
    unit_price: "",
    unit: ""
  });
  const [searchWarehouseId, setSearchWarehouseId] = useState("");
  const [searchName, setSearchName] = useState("");
  const [nameSuggestions, setNameSuggestions] = useState([]);
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);
  const [products, setProducts] = useState([]);

  // 采购计划相关state
  const user = JSON.parse(localStorage.getItem("user"));
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [purchaseForm, setPurchaseForm] = useState({
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
  const [purchaseMessage, setPurchaseMessage] = useState("");
  const [purchaseSuggestions, setPurchaseSuggestions] = useState([]);
  const [showPurchaseSuggestions, setShowPurchaseSuggestions] = useState(false);
  const purchaseMaterialInputRef = useRef();
  // 缺失材料modal
  const [showLowStock, setShowLowStock] = useState(false);
  const [lowStockMaterials, setLowStockMaterials] = useState([]);
  const [purchaseInputs, setPurchaseInputs] = useState({});

  useEffect(() => {
    fetchMaterials();
    fetchProducts();
  }, []);

  const fetchMaterials = async () => {
    try {
      const res = await fetch("/api/materials/all");
      const data = await res.json();
      setMaterials(Array.isArray(data) ? data : []);
    } catch {
      setMaterials([]);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      setProducts([]);
    }
  };

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
    try {
      const res = await fetch("/api/materials/add-inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
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
        setShowForm(false);
        fetchMaterials();
      } else {
        setMessage(data.message || "添加失败");
      }
    } catch (err) {
      setMessage("网络错误");
    }
  };

  const handleProductChange = e => {
    const { name, value } = e.target;
    setProductForm({ ...productForm, [name]: value });
  };
  const handleProductSubmit = async e => {
    e.preventDefault();
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: productForm.product_name,
          warehouse_id: productForm.warehouse_id,
          quantity: productForm.quantity,
          unit_price: productForm.unit_price,
          unit: productForm.unit
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert("产品添加成功");
        setProductForm({ product_name: "", warehouse_id: "", quantity: "", unit_price: "", unit: "" });
        setShowProductForm(false);
      } else {
        alert(data.message || "添加失败");
      }
    } catch {
      alert("网络错误");
    }
  };

  const filteredMaterials = materials.filter(m => {
    const matchWarehouse = searchWarehouseId ? String(m.warehouse_id) === String(searchWarehouseId) : true;
    const matchName = searchName ? m.name === searchName : true;
    return matchWarehouse && matchName;
  });

  // 仓库id为2时只展示成品库products，否则展示materials
  const showProductsOnly = searchWarehouseId === "2";
  const filteredProducts = products.filter(p => {
    const matchWarehouse = searchWarehouseId ? String(p.warehouse_id) === String(searchWarehouseId) : true;
    const matchName = searchName ? p.name === searchName : true;
    return matchWarehouse && matchName;
  });

  // 新建采购计划表单相关逻辑
  const handlePurchaseChange = e => {
    const { name, value, type, checked } = e.target;
    setPurchaseForm({
      ...purchaseForm,
      [name]: type === "checkbox" ? checked : value
    });
    if (name === "material_name") {
      if (value) {
        fetch(`/api/materials?name_like=${encodeURIComponent(value)}`)
          .then(res => res.json())
          .then(data => {
            setPurchaseSuggestions(data);
            setShowPurchaseSuggestions(true);
          });
      } else {
        setPurchaseSuggestions([]);
        setShowPurchaseSuggestions(false);
      }
    }
  };
  const handlePurchaseSuggestionClick = async (name) => {
    setPurchaseForm(f => ({ ...f, material_name: name }));
    setPurchaseSuggestions([]);
    setShowPurchaseSuggestions(false);
    try {
      const res = await fetch(`/api/materials/detail?name=${encodeURIComponent(name)}`);
      if (res.ok) {
        const data = await res.json();
        setPurchaseForm(f => ({
          ...f,
          material_name: data.name,
          warehouse_id: data.warehouse_id || "",
          unit_price: data.unit_price || "",
          unit: data.unit || "",
          model: data.model || "",
          property: data.property || ""
        }));
        // 自动查material_id
        await fetchPurchaseMaterialIdAndFill(data.name, data.model || "");
      }
    } catch {}
  };
  const fetchPurchaseMaterialIdAndFill = async (name, model) => {
    if (name && model) {
      try {
        const res = await fetch(`/api/materials/find-id?name=${encodeURIComponent(name)}&model=${encodeURIComponent(model)}`);
        if (res.ok) {
          const data = await res.json();
          setPurchaseForm(f => ({
            ...f,
            material_id: data.id,
            warehouse_id: data.warehouse_id || "",
            unit_price: data.unit_price || "",
            unit: data.unit || "",
            property: data.property || ""
          }));
        } else {
          setPurchaseForm(f => ({ ...f, material_id: "" }));
        }
      } catch {
        setPurchaseForm(f => ({ ...f, material_id: "" }));
      }
    } else {
      setPurchaseForm(f => ({ ...f, material_id: "" }));
    }
  };
  const handlePurchaseMaterialNameBlur = () => {
    fetchPurchaseMaterialIdAndFill(purchaseForm.material_name, purchaseForm.model);
  };
  const handlePurchaseModelBlur = () => {
    fetchPurchaseMaterialIdAndFill(purchaseForm.material_name, purchaseForm.model);
  };
  const handlePurchaseBlur = e => {
    setTimeout(() => setShowPurchaseSuggestions(false), 150);
  };
  const handlePurchaseSubmit = async e => {
    e.preventDefault();
    setPurchaseMessage("");
    try {
      const res = await fetch("/api/purchase-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(purchaseForm)
      });
      const data = await res.json();
      if (res.ok) {
        setPurchaseMessage("采购订单创建成功！");
        setShowPurchaseForm(false);
        setPurchaseForm({
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
      } else {
        setPurchaseMessage(data.message || "创建失败");
      }
    } catch (err) {
      setPurchaseMessage("网络错误");
    }
  };
  // 缺失材料modal逻辑
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
  };

  useImperativeHandle(ref, () => ({
    fetchMaterials,
    fetchProducts
  }));

  return (
    <div style={{ maxWidth: 900, margin: "60px auto", textAlign: "center", position: "relative" }}>
      <h2>盘点库存页面</h2>
      <p>这里将展示和管理库存盘点相关内容。</p>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 16, marginBottom: 24 }}>
        <div>
          <input
            style={{ ...inputStyle, width: 120 }}
            placeholder="仓库ID"
            value={searchWarehouseId}
            onChange={e => setSearchWarehouseId(e.target.value)}
          />
        </div>
        <div style={{ position: "relative" }}>
          <input
            style={{ ...inputStyle, width: 180 }}
            placeholder="材料名称"
            value={searchName}
            onChange={e => {
              setSearchName(e.target.value);
              if (e.target.value) {
                fetch(`/api/materials?name_like=${encodeURIComponent(e.target.value)}`)
                  .then(res => res.json())
                  .then(data => {
                    setNameSuggestions(data);
                    setShowNameSuggestions(true);
                  });
              } else {
                setNameSuggestions([]);
                setShowNameSuggestions(false);
              }
            }}
            onBlur={() => setTimeout(() => setShowNameSuggestions(false), 150)}
            autoComplete="off"
          />
          {showNameSuggestions && nameSuggestions.length > 0 && (
            <div style={suggestionBoxStyle}>
              {nameSuggestions.map(name => (
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
        <button
          style={{ ...inputStyle, width: 80, background: "#1976d2", color: "#fff", cursor: "pointer" }}
          onClick={() => {
            setShowForm(false);
            setShowProductForm(false);
          }}
        >
          搜索
        </button>
        <button
          style={{ ...inputStyle, width: 80, background: "#aaa", color: "#fff", cursor: "pointer" }}
          onClick={() => {
            setSearchWarehouseId("");
            setSearchName("");
            setShowForm(false);
            setShowProductForm(false);
          }}
        >
          重置
        </button>
        <button
          style={{ ...inputStyle, width: 100, background: "#4caf50", color: "#fff", cursor: "pointer", fontWeight: 600 }}
          onClick={() => {
            setShowForm(true);
            setShowProductForm(false);
          }}
        >
          添加库存
        </button>
        <button
          style={{ ...inputStyle, width: 100, background: "#ff9800", color: "#fff", cursor: "pointer", fontWeight: 600 }}
          onClick={() => {
            setShowProductForm(true);
            setShowForm(false);
          }}
        >
          添加产品
        </button>
      </div>
      {showForm && (
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
      )}
      {showProductForm && (
        <form style={formStyle} onSubmit={handleProductSubmit} autoComplete="off">
          <div style={rowStyle}>
            <label style={labelStyle} htmlFor="product_name">产品名称</label>
            <input style={inputStyle} name="product_name" id="product_name" value={productForm.product_name} onChange={handleProductChange} required />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle} htmlFor="warehouse_id">仓库ID</label>
            <input style={inputStyle} name="warehouse_id" id="warehouse_id" value={productForm.warehouse_id} onChange={handleProductChange} required />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle} htmlFor="quantity">库存数量</label>
            <input style={inputStyle} name="quantity" id="quantity" type="number" value={productForm.quantity} onChange={handleProductChange} required min="0" />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle} htmlFor="unit_price">单价</label>
            <input style={inputStyle} name="unit_price" id="unit_price" type="number" step="0.01" value={productForm.unit_price} onChange={handleProductChange} />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle} htmlFor="unit">单位</label>
            <input style={inputStyle} name="unit" id="unit" value={productForm.unit} onChange={handleProductChange} />
          </div>
          <button style={{...formStyle, padding: "10px 0", margin: 0, background: "#ff9800", color: "#fff", fontWeight: "bold", fontSize: 16, border: "none"}} type="submit">提交产品</button>
        </form>
      )}
      {message && <div style={{ color: message.includes("成功") ? "#388e3c" : "#d32f2f", marginTop: 18 }}>{message}</div>}
      {/* 主表格：材料或成品 */}
      {!showProductsOnly ? (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 32 }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #e0e0e0", padding: "8px 6px", background: "#f5f5f5", fontWeight: 700 }}>ID</th>
              <th style={{ border: "1px solid #e0e0e0", padding: "8px 6px", background: "#f5f5f5", fontWeight: 700 }}>材料名称</th>
              <th style={{ border: "1px solid #e0e0e0", padding: "8px 6px", background: "#f5f5f5", fontWeight: 700 }}>仓库ID</th>
              <th style={{ border: "1px solid #e0e0e0", padding: "8px 6px", background: "#f5f5f5", fontWeight: 700 }}>库存数量</th>
              <th style={{ border: "1px solid #e0e0e0", padding: "8px 6px", background: "#f5f5f5", fontWeight: 700 }}>型号</th>
              <th style={{ border: "1px solid #e0e0e0", padding: "8px 6px", background: "#f5f5f5", fontWeight: 700 }}>单价</th>
              <th style={{ border: "1px solid #e0e0e0", padding: "8px 6px", background: "#f5f5f5", fontWeight: 700 }}>单位</th>
              <th style={{ border: "1px solid #e0e0e0", padding: "8px 6px", background: "#f5f5f5", fontWeight: 700 }}>属性</th>
              <th style={{ border: "1px solid #e0e0e0", padding: "8px 6px", background: "#f5f5f5", fontWeight: 700 }}>被用库存数量</th>
            </tr>
          </thead>
          <tbody>
            {filteredMaterials.length === 0 ? (
              <tr><td colSpan={16} style={{ textAlign: "center", padding: 16 }}>暂无库存</td></tr>
            ) : (
              filteredMaterials.map(material => (
                <tr key={material.id}>
                  <td style={{ border: "1px solid #e0e0e0", padding: "8px 6px" }}>{material.id}</td>
                  <td style={{ border: "1px solid #e0e0e0", padding: "8px 6px" }}>{material.name}</td>
                  <td style={{ border: "1px solid #e0e0e0", padding: "8px 6px" }}>{material.warehouse_id}</td>
                  <td style={{ border: "1px solid #e0e0e0", padding: "8px 6px" }}>{material.quantity}</td>
                  <td style={{ border: "1px solid #e0e0e0", padding: "8px 6px" }}>{material.model}</td>
                  <td style={{ border: "1px solid #e0e0e0", padding: "8px 6px" }}>{material.unit_price}</td>
                  <td style={{ border: "1px solid #e0e0e0", padding: "8px 6px" }}>{material.unit}</td>
                  <td style={{ border: "1px solid #e0e0e0", padding: "8px 6px" }}>{material.property}</td>
                  <td style={{ border: "1px solid #e0e0e0", padding: "8px 6px" }}>{material.used_quantity}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 32 }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #e0e0e0", padding: "8px 6px", background: "#f5f5f5", fontWeight: 700 }}>ID</th>
              <th style={{ border: "1px solid #e0e0e0", padding: "8px 6px", background: "#f5f5f5", fontWeight: 700 }}>产品名称</th>
              <th style={{ border: "1px solid #e0e0e0", padding: "8px 6px", background: "#f5f5f5", fontWeight: 700 }}>仓库ID</th>
              <th style={{ border: "1px solid #e0e0e0", padding: "8px 6px", background: "#f5f5f5", fontWeight: 700 }}>库存数量</th>
              <th style={{ border: "1px solid #e0e0e0", padding: "8px 6px", background: "#f5f5f5", fontWeight: 700 }}>单价</th>
              <th style={{ border: "1px solid #e0e0e0", padding: "8px 6px", background: "#f5f5f5", fontWeight: 700 }}>单位</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: "center", padding: 16 }}>暂无成品库存</td></tr>
            ) : (
              filteredProducts.map(product => (
                <tr key={product.id}>
                  <td style={{ border: "1px solid #e0e0e0", padding: "8px 6px" }}>{product.id}</td>
                  <td style={{ border: "1px solid #e0e0e0", padding: "8px 6px" }}>{product.name}</td>
                  <td style={{ border: "1px solid #e0e0e0", padding: "8px 6px" }}>{product.warehouse_id}</td>
                  <td style={{ border: "1px solid #e0e0e0", padding: "8px 6px" }}>{product.quantity}</td>
                  <td style={{ border: "1px solid #e0e0e0", padding: "8px 6px" }}>{product.unit_price}</td>
                  <td style={{ border: "1px solid #e0e0e0", padding: "8px 6px" }}>{product.unit}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
      {/* 表格下方操作按钮 */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16, marginTop: 24 }}>
        <button style={{ padding: '10px 24px', borderRadius: 6, border: 'none', background: '#1976d2', color: '#fff', fontWeight: 'bold', fontSize: 16, cursor: 'pointer' }} onClick={() => setShowPurchaseForm(true)}>新建采购计划</button>
        <button style={{ padding: '10px 24px', borderRadius: 6, border: 'none', background: '#ff9800', color: '#fff', fontWeight: 'bold', fontSize: 16, cursor: 'pointer' }} onClick={handleShowLowStock}>查看缺失材料</button>
      </div>
      {/* 新建采购计划表单 */}
      {showPurchaseForm && (
        <form style={formStyle} onSubmit={handlePurchaseSubmit} autoComplete="off">
          <div style={rowStyle}>
            <label style={labelStyle} htmlFor="order_date">采购日期</label>
            <input style={inputStyle} name="order_date" id="order_date" type="date" value={purchaseForm.order_date} onChange={handlePurchaseChange} required />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle} htmlFor="material_id">材料ID</label>
            <input style={inputStyle} name="material_id" id="material_id" value={purchaseForm.material_id} readOnly />
          </div>
          <div style={{ ...rowStyle, position: "relative" }}>
            <label style={labelStyle} htmlFor="material_name">材料名称</label>
            <input
              style={inputStyle}
              name="material_name"
              id="material_name"
              value={purchaseForm.material_name}
              onChange={handlePurchaseChange}
              onFocus={handlePurchaseChange}
              onBlur={handlePurchaseMaterialNameBlur}
              ref={purchaseMaterialInputRef}
              autoComplete="off"
              required
            />
            {showPurchaseSuggestions && purchaseSuggestions.length > 0 && (
              <div style={suggestionBoxStyle}>
                {purchaseSuggestions.map(mat => (
                  <div
                    key={mat.id || mat.name}
                    style={{ padding: "8px 12px", cursor: "pointer", textAlign: "left" }}
                    onMouseDown={() => handlePurchaseSuggestionClick(mat.name)}
                  >
                    {mat.name}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={rowStyle}>
            <label style={labelStyle} htmlFor="quantity">采购数量</label>
            <input style={inputStyle} name="quantity" id="quantity" type="number" value={purchaseForm.quantity} onChange={handlePurchaseChange} required min="1" />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle} htmlFor="unit">单位</label>
            <input style={inputStyle} name="unit" id="unit" value={purchaseForm.unit} onChange={handlePurchaseChange} />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle} htmlFor="unit_price">单价</label>
            <input style={inputStyle} name="unit_price" id="unit_price" type="number" value={purchaseForm.unit_price} onChange={handlePurchaseChange} min="0" step="0.01" />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle} htmlFor="total_amount">总金额</label>
            <input style={inputStyle} name="total_amount" id="total_amount" type="number" value={purchaseForm.total_amount} onChange={handlePurchaseChange} min="0" step="0.01" />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle} htmlFor="purchaser">采购人</label>
            <input style={inputStyle} name="purchaser" id="purchaser" value={purchaseForm.purchaser} onChange={handlePurchaseChange} />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle} htmlFor="status">状态</label>
            <input style={inputStyle} name="status" id="status" value={purchaseForm.status} onChange={handlePurchaseChange} />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle} htmlFor="warehouse_id">仓库ID</label>
            <input style={inputStyle} name="warehouse_id" id="warehouse_id" value={purchaseForm.warehouse_id} onChange={handlePurchaseChange} />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle} htmlFor="expected_arrival">预计到货时间</label>
            <input style={inputStyle} name="expected_arrival" id="expected_arrival" type="date" value={purchaseForm.expected_arrival} onChange={handlePurchaseChange} />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle} htmlFor="remark">备注</label>
            <input style={inputStyle} name="remark" id="remark" value={purchaseForm.remark} onChange={handlePurchaseChange} />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle} htmlFor="is_arrived">是否到货</label>
            <input style={{ width: 20, height: 20 }} name="is_arrived" id="is_arrived" type="checkbox" checked={purchaseForm.is_arrived} onChange={handlePurchaseChange} />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle} htmlFor="model">型号</label>
            <input style={inputStyle} name="model" id="model" value={purchaseForm.model} onChange={handlePurchaseChange} onBlur={handlePurchaseModelBlur} />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle} htmlFor="property">属性</label>
            <input style={inputStyle} name="property" id="property" value={purchaseForm.property} onChange={handlePurchaseChange} />
          </div>
          <button style={{...formStyle, padding: "10px 0", margin: 0, background: "#1976d2", color: "#fff", fontWeight: "bold", fontSize: 16, border: "none"}} type="submit">提交订单</button>
        </form>
      )}
      {purchaseMessage && <div style={{ color: purchaseMessage.includes("成功") ? "#388e3c" : "#d32f2f", marginTop: 18 }}>{purchaseMessage}</div>}
      {/* 缺失材料modal */}
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
});

export default InventoryCheckPage; 