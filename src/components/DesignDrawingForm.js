import React, { useState, useEffect, useRef } from "react";

function DesignDrawingForm({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    drawing_no: "",
    designer: "",
    remark: ""
  });
  
  const [materials, setMaterials] = useState([]);
  const [products, setProducts] = useState([]);
  const [totalMaterialCost, setTotalMaterialCost] = useState(0);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [productSuggestions, setProductSuggestions] = useState([]);
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);
  
  const [newMaterial, setNewMaterial] = useState({
    material_name: "",
    model: "",
    quantity: "",
    unit: "",
    unit_price: ""
  });
  
  const [newProduct, setNewProduct] = useState({
    product_name: "",
    model: "",
    quantity: "",
    unit: "",
    unit_price: ""
  });
  
  const materialInputRef = useRef();
  
  // 获取当前用户信息
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setFormData(prev => ({ ...prev, designer: user.username || "" }));
    }
  }, []);
  
  // 生成图纸编号
  useEffect(() => {
    if (!formData.drawing_no) {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      setFormData(prev => ({ ...prev, drawing_no: `DD${year}${month}${day}${random}` }));
    }
  }, [formData.drawing_no]);
  
  // 计算原材料总成本
  useEffect(() => {
    const total = materials.reduce((sum, material) => sum + (material.subtotal || 0), 0);
    setTotalMaterialCost(total);
  }, [materials]);
  
  // 材料搜索
  const searchMaterials = async (query) => {
    if (query.trim()) {
      try {
        const response = await fetch(`/api/materials?query=${encodeURIComponent(query.trim())}`);
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error("搜索材料失败:", error);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };
  
  // 加工件搜索
  const searchProducts = async (query) => {
    if (query.trim()) {
      try {
        const response = await fetch(`/api/materials?query=${encodeURIComponent(query.trim())}`);
        if (response.ok) {
          const data = await response.json();
          setProductSuggestions(data);
          setShowProductSuggestions(true);
        }
      } catch (error) {
        console.error("搜索加工件失败:", error);
      }
    } else {
      setProductSuggestions([]);
      setShowProductSuggestions(false);
    }
  };
  
  // 选择材料
  const handleMaterialSelect = (material) => {
    setNewMaterial({
      material_name: material.name,
      model: material.model || "",
      quantity: "",
      unit: material.unit || "",
      unit_price: material.unit_price || "0.00",
      material_id: material.id
    });
    setSearchQuery(material.name);
    setShowSuggestions(false);
  };
  
  // 选择加工件
  const handleProductSelect = (product) => {
    setNewProduct({
      product_name: product.name,
      model: product.model || "",
      quantity: "",
      unit: product.unit || "",
      unit_price: product.unit_price || "0.00",
      product_id: product.id
    });
    setProductSearchQuery(product.name);
    setShowProductSuggestions(false);
  };
  
  // 添加原材料
  const handleAddMaterial = () => {
    if (!newMaterial.material_name || !newMaterial.quantity || Number(newMaterial.quantity) <= 0) {
      alert("请填写完整的材料信息");
      return;
    }
    
    const material = {
      ...newMaterial,
      id: Date.now(), // 临时ID
      quantity: Number(newMaterial.quantity),
      unit_price: Number(newMaterial.unit_price) || 0,
      subtotal: Number(newMaterial.quantity) * (Number(newMaterial.unit_price) || 0)
    };
    
    setMaterials([...materials, material]);
    setNewMaterial({
      material_name: "",
      model: "",
      quantity: "",
      unit: "",
      unit_price: ""
    });
    setSearchQuery("");
  };
  
  // 删除原材料
  const handleDeleteMaterial = (index) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };
  
  // 添加加工件
  const handleAddProduct = () => {
    if (!newProduct.product_name || !newProduct.quantity || Number(newProduct.quantity) <= 0) {
      alert("请填写完整的加工件信息");
      return;
    }
    
    const product = {
      ...newProduct,
      id: Date.now(), // 临时ID
      quantity: Number(newProduct.quantity),
      unit_price: Number(newProduct.unit_price) || 0,
      subtotal: Number(newProduct.quantity) * (Number(newProduct.unit_price) || 0)
    };
    
    setProducts([...products, product]);
    setNewProduct({
      product_name: "",
      model: "",
      quantity: "",
      unit: "",
      unit_price: ""
    });
    setProductSearchQuery("");
  };
  
  // 删除加工件
  const handleDeleteProduct = (index) => {
    setProducts(products.filter((_, i) => i !== index));
  };
  
  // 提交表单
  const handleSubmit = async () => {
    if (materials.length === 0) {
      alert("请至少添加一种原材料");
      return;
    }
    
    if (products.length === 0) {
      alert("请至少添加一种加工件");
      return;
    }
    
    const submitData = {
      ...formData,
      materials: materials.map(m => ({
        material_id: m.material_id,
        material_name: m.material_name,
        model: m.model,
        quantity: m.quantity,
        unit: m.unit,
        unit_price: m.unit_price,
        subtotal: m.subtotal
      })),
      products: products.map(p => ({
        product_name: p.product_name,
        model: p.model,
        quantity: p.quantity,
        unit: p.unit,
        unit_price: p.unit_price,
        subtotal: p.subtotal
      })),
      total_material_cost: totalMaterialCost
    };
    
    try {
      const response = await fetch("/api/design-drawings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData)
      });
      
      if (response.ok) {
        alert("设计图纸创建成功！");
        onSubmit && onSubmit();
        onClose();
      } else {
        const error = await response.json();
        alert(`创建失败: ${error.message || "未知错误"}`);
      }
    } catch (error) {
      console.error("提交失败:", error);
      alert("提交失败，请重试");
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      zIndex: 1000,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "20px"
    }}>
      <div style={{
        background: "#fff",
        borderRadius: "12px",
        width: "90%",
        maxWidth: "1200px",
        maxHeight: "90vh",
        overflow: "auto",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
      }}>
        {/* 标题栏 */}
        <div style={{
          padding: "20px 24px",
          borderBottom: "1px solid #e0e0e0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <h2 style={{ margin: 0, color: "#1976d2" }}>设计图纸</h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "#666"
            }}
          >
            ×
          </button>
        </div>
        
        <div style={{ padding: "24px" }}>
          {/* 基本信息 */}
          <div style={{ marginBottom: "32px" }}>
            <h3 style={{ marginBottom: "16px", color: "#333" }}>📋 基本信息</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                  图纸编号
                </label>
                <input
                  type="text"
                  value={formData.drawing_no}
                  onChange={(e) => setFormData(prev => ({ ...prev, drawing_no: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    fontSize: "14px"
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                  设计人
                </label>
                <input
                  type="text"
                  value={formData.designer}
                  onChange={(e) => setFormData(prev => ({ ...prev, designer: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    fontSize: "14px"
                  }}
                />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                  备注
                </label>
                <textarea
                  value={formData.remark}
                  onChange={(e) => setFormData(prev => ({ ...prev, remark: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    fontSize: "14px",
                    minHeight: "80px",
                    resize: "vertical"
                  }}
                  placeholder="请输入图纸备注信息..."
                />
              </div>
            </div>
          </div>
          
          {/* 原材料需求 */}
          <div style={{ marginBottom: "32px" }}>
            <h3 style={{ marginBottom: "16px", color: "#333" }}>🔧 原材料需求</h3>
            
            {/* 添加原材料表单 */}
            <div style={{
              background: "#f8f9fa",
              padding: "16px",
              borderRadius: "8px",
              marginBottom: "16px"
            }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr auto", gap: "12px", alignItems: "end" }}>
                <div style={{ position: "relative" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "12px", color: "#666" }}>
                    材料名称
                  </label>
                  <input
                    ref={materialInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      searchMaterials(e.target.value);
                    }}
                    placeholder="搜索材料名称"
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "14px"
                    }}
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <div style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      background: "#fff",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      maxHeight: "200px",
                      overflowY: "auto",
                      zIndex: 1000,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                    }}>
                      {suggestions.map((material, index) => (
                        <div
                          key={material.id || index}
                          style={{
                            padding: "8px 12px",
                            cursor: "pointer",
                            borderBottom: "1px solid #f0f0f0",
                            fontSize: "14px"
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = "#f5f5f5"}
                          onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                          onClick={() => handleMaterialSelect(material)}
                        >
                          <div style={{ fontWeight: "500" }}>{material.name}</div>
                          <div style={{ fontSize: "12px", color: "#666" }}>
                            {material.model ? `型号: ${material.model}` : "无型号"} | {material.unit || "无单位"}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <input
                  type="text"
                  value={newMaterial.model}
                  onChange={(e) => setNewMaterial(prev => ({ ...prev, model: e.target.value }))}
                  placeholder="型号"
                  style={{
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px"
                  }}
                />
                
                <input
                  type="number"
                  value={newMaterial.quantity}
                  onChange={(e) => setNewMaterial(prev => ({ ...prev, quantity: e.target.value }))}
                  placeholder="数量"
                  min="0.01"
                  step="0.01"
                  style={{
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px"
                  }}
                />
                
                <input
                  type="text"
                  value={newMaterial.unit}
                  onChange={(e) => setNewMaterial(prev => ({ ...prev, unit: e.target.value }))}
                  placeholder="单位"
                  style={{
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px"
                  }}
                />
                
                <input
                  type="number"
                  value={newMaterial.unit_price}
                  onChange={(e) => setNewMaterial(prev => ({ ...prev, unit_price: e.target.value }))}
                  placeholder="单价"
                  min="0"
                  step="0.01"
                  style={{
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px"
                  }}
                />
                
                <button
                  onClick={handleAddMaterial}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#1976d2",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "14px"
                  }}
                >
                  添加
                </button>
              </div>
            </div>
            
            {/* 原材料列表 */}
            {materials.length > 0 && (
              <div style={{ marginBottom: "16px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                  <thead>
                    <tr style={{ background: "#f5f5f5" }}>
                      <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }}>材料名称</th>
                      <th style={{ padding: "12px", textAlign: "center", borderBottom: "1px solid #ddd" }}>型号</th>
                      <th style={{ padding: "12px", textAlign: "center", borderBottom: "1px solid #ddd" }}>数量</th>
                      <th style={{ padding: "12px", textAlign: "center", borderBottom: "1px solid #ddd" }}>单位</th>
                      <th style={{ padding: "12px", textAlign: "center", borderBottom: "1px solid #ddd" }}>单价</th>
                      <th style={{ padding: "12px", textAlign: "center", borderBottom: "1px solid #ddd" }}>小计</th>
                      <th style={{ padding: "12px", textAlign: "center", borderBottom: "1px solid #ddd" }}>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materials.map((material, index) => (
                      <tr key={material.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                        <td style={{ padding: "12px" }}>{material.material_name}</td>
                        <td style={{ padding: "12px", textAlign: "center" }}>{material.model || "-"}</td>
                        <td style={{ padding: "12px", textAlign: "center" }}>{material.quantity}</td>
                        <td style={{ padding: "12px", textAlign: "center" }}>{material.unit}</td>
                        <td style={{ padding: "12px", textAlign: "center" }}>¥{material.unit_price}</td>
                        <td style={{ padding: "12px", textAlign: "center" }}>¥{material.subtotal.toFixed(2)}</td>
                        <td style={{ padding: "12px", textAlign: "center" }}>
                          <button
                            onClick={() => handleDeleteMaterial(index)}
                            style={{
                              padding: "4px 8px",
                              backgroundColor: "#f44336",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "12px"
                            }}
                          >
                            删除
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          {/* 加工件产出 */}
          <div style={{ marginBottom: "32px" }}>
            <h3 style={{ marginBottom: "16px", color: "#333" }}>🎯 加工件产出</h3>
            
            {/* 添加加工件表单 */}
            <div style={{
              background: "#f8f9fa",
              padding: "16px",
              borderRadius: "8px",
              marginBottom: "16px"
            }}>
                          <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1fr 1fr 1fr auto", gap: "12px", alignItems: "end" }}>
              <div style={{ position: "relative" }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "12px", color: "#666" }}>
                  加工件名称
                </label>
                <input
                  type="text"
                  value={productSearchQuery}
                  onChange={(e) => {
                    setProductSearchQuery(e.target.value);
                    searchProducts(e.target.value);
                  }}
                  placeholder="搜索加工件名称"
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px"
                  }}
                />
                {showProductSuggestions && productSuggestions.length > 0 && (
                  <div style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    background: "#fff",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    maxHeight: "200px",
                    overflowY: "auto",
                    zIndex: 1000,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                  }}>
                    {productSuggestions.map((product, index) => (
                      <div
                        key={product.id || index}
                        style={{
                          padding: "8px 12px",
                          cursor: "pointer",
                          borderBottom: "1px solid #f0f0f0",
                          fontSize: "14px"
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = "#f5f5f5"}
                        onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                        onClick={() => handleProductSelect(product)}
                      >
                        <div style={{ fontWeight: "500" }}>{product.name}</div>
                        <div style={{ fontSize: "12px", color: "#666" }}>
                          {product.model ? `型号: ${product.model}` : "无型号"} | {product.unit || "无单位"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
                
                <input
                  type="text"
                  value={newProduct.model}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, model: e.target.value }))}
                  placeholder="选择加工件后自动填充"
                  readOnly
                  style={{
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px",
                    backgroundColor: "#f8f9fa",
                    color: "#666"
                  }}
                />
                
                <input
                  type="number"
                  value={newProduct.quantity}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, quantity: e.target.value }))}
                  placeholder="数量"
                  min="1"
                  style={{
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px"
                  }}
                />
                
                <input
                  type="text"
                  value={newProduct.unit}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, unit: e.target.value }))}
                  placeholder="单位"
                  style={{
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px"
                  }}
                />
                
                <input
                  type="number"
                  value={newProduct.unit_price}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, unit_price: e.target.value }))}
                  placeholder="单价"
                  min="0"
                  step="0.01"
                  style={{
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px"
                  }}
                />
                
                <button
                  onClick={handleAddProduct}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#4caf50",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "14px"
                  }}
                >
                  添加
                </button>
              </div>
            </div>
            
            {/* 加工件列表 */}
            {products.length > 0 && (
              <div style={{ marginBottom: "16px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                  <thead>
                    <tr style={{ background: "#f5f5f5" }}>
                      <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }}>加工件名称</th>
                      <th style={{ padding: "12px", textAlign: "center", borderBottom: "1px solid #ddd" }}>型号</th>
                      <th style={{ padding: "12px", textAlign: "center", borderBottom: "1px solid #ddd" }}>数量</th>
                      <th style={{ padding: "12px", textAlign: "center", borderBottom: "1px solid #ddd" }}>单位</th>
                      <th style={{ padding: "12px", textAlign: "center", borderBottom: "1px solid #ddd" }}>单价</th>
                      <th style={{ padding: "12px", textAlign: "center", borderBottom: "1px solid #ddd" }}>小计</th>
                      <th style={{ padding: "12px", textAlign: "center", borderBottom: "1px solid #ddd" }}>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product, index) => (
                      <tr key={product.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                        <td style={{ padding: "12px" }}>{product.product_name}</td>
                        <td style={{ padding: "12px", textAlign: "center" }}>{product.model || "-"}</td>
                        <td style={{ padding: "12px", textAlign: "center" }}>{product.quantity}</td>
                        <td style={{ padding: "12px", textAlign: "center" }}>{product.unit}</td>
                        <td style={{ padding: "12px", textAlign: "center" }}>¥{product.unit_price}</td>
                        <td style={{ padding: "12px", textAlign: "center" }}>¥{product.subtotal.toFixed(2)}</td>
                        <td style={{ padding: "12px", textAlign: "center" }}>
                          <button
                            onClick={() => handleDeleteProduct(index)}
                            style={{
                              padding: "4px 8px",
                              backgroundColor: "#f44336",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "12px"
                            }}
                          >
                            删除
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          {/* 成本分析 */}
          <div style={{ marginBottom: "32px" }}>
            <h3 style={{ marginBottom: "16px", color: "#333" }}>💰 成本分析</h3>
            <div style={{
              background: "#f8f9fa",
              padding: "20px",
              borderRadius: "8px",
              border: "2px solid #e0e0e0"
            }}>
              <div style={{ fontSize: "18px", fontWeight: "600", color: "#1976d2" }}>
                原材料总成本: ¥{totalMaterialCost.toFixed(2)}
              </div>
            </div>
          </div>
          
          {/* 操作按钮 */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: "16px",
            paddingTop: "24px",
            borderTop: "1px solid #e0e0e0"
          }}>
            <button
              onClick={onClose}
              style={{
                padding: "12px 24px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "16px"
              }}
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              style={{
                padding: "12px 32px",
                backgroundColor: "#4caf50",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "500"
              }}
            >
              生成设计图纸
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DesignDrawingForm;
