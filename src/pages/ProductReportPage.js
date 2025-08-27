import React, { useEffect, useState } from "react";

function ProductReportPage() {
  const [showForm, setShowForm] = useState(false);
  const [products, setProducts] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [productId, setProductId] = useState("");
  const [materialRows, setMaterialRows] = useState([
    { material_id: "", required_quantity: "", is_required: 1 }
  ]);
  const [message, setMessage] = useState("");
  const [productBoms, setProductBoms] = useState([]);

  useEffect(() => {
    fetch("/api/products").then(res => res.json()).then(setProducts);
    fetch("/api/materials/all").then(res => res.json()).then(setMaterials);
    fetch("/api/products/product-boms").then(res => res.json()).then(setProductBoms);
  }, []);

  const handleMaterialChange = (idx, field, value) => {
    setMaterialRows(rows => rows.map((row, i) => i === idx ? { ...row, [field]: value } : row));
  };
  const addMaterialRow = () => setMaterialRows(rows => [...rows, { material_id: "", required_quantity: "", is_required: 1 }]);
  const removeMaterialRow = idx => setMaterialRows(rows => rows.length > 1 ? rows.filter((_, i) => i !== idx) : rows);

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch("/api/products/product-materials/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          materials: materialRows.map(r => ({
            material_id: r.material_id,
            required_quantity: r.required_quantity,
            is_required: r.is_required
          }))
        })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("产品报目单添加成功");
        setShowForm(false);
        setProductId("");
        setMaterialRows([{ material_id: "", required_quantity: "", is_required: 1 }]);
      } else {
        setMessage(data.message || "添加失败");
      }
    } catch {
      setMessage("网络错误");
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "60px auto", textAlign: "center" }}>
      <h2>产品报目单页面</h2>
      <p>这里将展示和管理所有产品报目单。</p>
      <button
        style={{ padding: "10px 24px", borderRadius: 6, border: "none", background: "#1976d2", color: "#fff", fontWeight: "bold", fontSize: 16, cursor: "pointer", margin: "24px 0" }}
        onClick={() => setShowForm(f => !f)}
      >
        {showForm ? "取消" : "新增产品报目单"}
      </button>
      {showForm && (
        <form style={{ maxWidth: 500, margin: "0 auto", background: "#fafbfc", borderRadius: 10, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", padding: 24 }} onSubmit={handleSubmit}>
          <div style={{ marginBottom: 18 }}>
            <label style={{ minWidth: 90, marginRight: 10, fontWeight: 500 }}>产品名称：</label>
            <select value={productId} onChange={e => setProductId(e.target.value)} required style={{ padding: 8, borderRadius: 6, minWidth: 180 }}>
              <option value="">请选择产品</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontWeight: 500 }}>所需材料：</label>
            {materialRows.map((row, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <select value={row.material_id} onChange={e => handleMaterialChange(idx, "material_id", e.target.value)} required style={{ padding: 6, borderRadius: 6, minWidth: 120 }}>
                  <option value="">选择材料</option>
                  {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
                <input type="number" min="1" placeholder="用量" value={row.required_quantity} onChange={e => handleMaterialChange(idx, "required_quantity", e.target.value)} required style={{ width: 80, padding: 6, borderRadius: 6 }} />
                <label style={{ fontWeight: 400 }}>
                  <input type="checkbox" checked={row.is_required === 1 || row.is_required === true} onChange={e => handleMaterialChange(idx, "is_required", e.target.checked ? 1 : 0)} /> 必需
                </label>
                <button type="button" onClick={() => removeMaterialRow(idx)} style={{ color: "#d32f2f", background: "none", border: "none", fontSize: 18, cursor: "pointer" }}>×</button>
              </div>
            ))}
            <button type="button" onClick={addMaterialRow} style={{ marginTop: 8, background: "#eee", border: "none", borderRadius: 6, padding: "4px 12px", cursor: "pointer" }}>+ 添加材料</button>
          </div>
          <button type="submit" style={{ marginTop: 24, padding: "10px 0", width: "100%", background: "#1976d2", color: "#fff", fontWeight: "bold", fontSize: 16, border: "none", borderRadius: 6 }}>提交</button>
        </form>
      )}
      {message && <div style={{ color: message.includes("成功") ? "#388e3c" : "#d32f2f", marginTop: 18 }}>{message}</div>}
      {/* 产品报目单展示 */}
      <div style={{ marginTop: 40, textAlign: "left" }}>
        <h3 style={{ marginBottom: 16 }}>所有产品报目单</h3>
        {productBoms.length === 0 ? (
          <div style={{ color: "#888", margin: 24 }}>暂无产品报目单</div>
        ) : (
          productBoms.map(bom => (
            <div key={bom.product_id} style={{ marginBottom: 32, border: "1px solid #eee", borderRadius: 8, padding: 18, background: "#fafbfc" }}>
              <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 8 }}>产品：{bom.product_name}</div>
              {bom.materials.length === 0 ? (
                <div style={{ color: "#aaa" }}>暂无材料</div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
                  <thead>
                    <tr>
                      <th style={{ border: "1px solid #e0e0e0", padding: "6px 8px", background: "#f5f5f5" }}>材料名称</th>
                      <th style={{ border: "1px solid #e0e0e0", padding: "6px 8px", background: "#f5f5f5" }}>用量</th>
                      <th style={{ border: "1px solid #e0e0e0", padding: "6px 8px", background: "#f5f5f5" }}>是否必需</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bom.materials.map(mat => (
                      <tr key={mat.material_id}>
                        <td style={{ border: "1px solid #e0e0e0", padding: "6px 8px" }}>{mat.material_name}</td>
                        <td style={{ border: "1px solid #e0e0e0", padding: "6px 8px" }}>{mat.required_quantity}</td>
                        <td style={{ border: "1px solid #e0e0e0", padding: "6px 8px" }}>{mat.is_required ? "是" : "否"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ProductReportPage; 