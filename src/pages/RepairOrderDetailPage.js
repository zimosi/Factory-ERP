import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

function RepairOrderDetailPage() {
  const navigate = useNavigate();
  const { afterSalesOrderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [materials, setMaterials] = useState([]); // 已提交明细
  const [batchList, setBatchList] = useState([]); // 待提交批量明细
  const [searchName, setSearchName] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [msg, setMsg] = useState("");
  const [model, setModel] = useState("");

  const nameInputRef = useRef();
  const [markup, setMarkup] = useState(1);
  const [workHours, setWorkHours] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [otherFee, setOtherFee] = useState("");
  const [quote, setQuote] = useState(null);
  const [quoteMsg, setQuoteMsg] = useState("");

  // 加载工单基本信息和明细
  useEffect(() => {
    if (afterSalesOrderId) {
      setLoading(true);
      fetch(`/api/after-sales-orders/${afterSalesOrderId}`)
        .then(res => res.json())
        .then(data => {
          setOrder(data);
          setLoading(false);
          setQuote(data.price ? Number(data.price).toFixed(2) : null); // 同步数据库报价
        });
      fetch(`/api/after-sales-order-materials/${afterSalesOrderId}`)
        .then(res => res.json())
        .then(data => setMaterials(Array.isArray(data) ? data : []));
    }
  }, [afterSalesOrderId]);

  // 材料模糊搜索，返回完整对象
  useEffect(() => {
    if (searchName.trim()) {
      fetch(`/api/materials?query=${encodeURIComponent(searchName.trim())}`)
        .then(res => res.json())
        .then(data => setSuggestions(Array.isArray(data) ? data : []));
    } else {
      setSuggestions([]);
    }
  }, [searchName]);

  // 🆕 一步选择：直接选择材料，自动补全所有信息
  const handleMaterialSelect = async (material) => {
    // 直接设置所有字段
    setSearchName(material.name);
    setSelectedMaterial(material);
    setModel(material.model || "");
    setUnit(material.unit || "");
    setSuggestions([]);
  };

  // 添加到批量明细
  const handleAddToBatch = () => {
    setMsg("");
    if (!selectedMaterial || !quantity || isNaN(quantity) || Number(quantity) <= 0) {
      setMsg("请选择材料并填写正确数量");
      return;
    }
    setBatchList([...batchList, {
      material_id: selectedMaterial.id,
      material_name: selectedMaterial.name,
      model: model,
      quantity: Number(quantity), // 强制转为数字
      unit: selectedMaterial.unit || unit,
      unit_price: selectedMaterial.unit_price ? Number(selectedMaterial.unit_price) : null,
      remark: "维修用料"
    }]);
    setSearchName("");
    setSelectedMaterial(null);
    setQuantity("");
    setUnit("");
    setModel("");
  };

  // 查找生产订单id
  async function fetchProductionOrderIdBySerialNo(serialNo) {
    if (!serialNo) return null;
    try {
      const res = await fetch(`/api/production-orders/find-by-serial-no?serial_no=${encodeURIComponent(serialNo)}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.id || null;
    } catch {
      return null;
    }
  }

  // 批量提交
  const handleBatchSubmit = async () => {
    setMsg("");
    if (batchList.length === 0) {
      setMsg("请先添加至少一种材料");
      return;
    }
    // 获取船编号（优先 boat_no，没有就用 serial_no）
    const serialNo = order?.boat_no || order?.serial_no;
    let productionOrderId = null;
    if (serialNo) {
      productionOrderId = await fetchProductionOrderIdBySerialNo(serialNo);
    }

    // 1. 批量写入 after_sales_order_materials
    let allSuccess = true;
    for (const item of batchList) {
      const res = await fetch(`/api/after-sales-order-materials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          after_sales_order_id: afterSalesOrderId,
          material_id: item.material_id,
          material_name: item.material_name,
          model: item.model,
          quantity: item.quantity,
          unit: item.unit,
          unit_price: item.unit_price,
          remark: item.remark
        })
      });
      if (!res.ok) allSuccess = false;
    }

    // 2. 生成领料单
    const user = JSON.parse(localStorage.getItem("user"));
    const res = await fetch(`/api/production-orders/production-pick-orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        production_order_id: productionOrderId,
        items: batchList.map(i => ({
          material_id: i.material_id,
          model: i.model, // 确保带上型号
          quantity: Number(i.quantity)
        })),
        remark: `维修工单${afterSalesOrderId}自动生成`,
        operator: user?.username || "",
        what: "售后"
      })
    });

    // 3. 刷新明细
    if (allSuccess && res.ok) {
      setMsg("全部添加成功");
      setBatchList([]);
      fetch(`/api/after-sales-order-materials/${afterSalesOrderId}`)
        .then(res => res.json())
        .then(data => setMaterials(Array.isArray(data) ? data : []));
    } else {
      setMsg("有材料添加失败");
    }
  };

  // 删除明细
  const handleDelete = async (id) => {
    await fetch(`/api/after-sales-order-materials/${id}`, { method: "DELETE" });
    fetch(`/api/after-sales-order-materials/${afterSalesOrderId}`)
      .then(res => res.json())
      .then(data => setMaterials(Array.isArray(data) ? data : []));
  };

  if (loading) return <div>加载中...</div>;
  if (!order) return <div style={{ color: '#d32f2f' }}>未找到该工单</div>;

  return (
    <div>
      {/* 左上角返回主页面按钮，位于菜单栏上方 */}
      <button
        style={{ position: 'fixed', top: 24, left: 32, padding: '8px 20px', borderRadius: 6, background: '#1976d2', color: '#fff', border: 'none', fontWeight: 'bold', fontSize: 15, cursor: 'pointer', zIndex: 200 }}
        onClick={() => navigate('/')}
      >返回主页面</button>
      <h2>维修工单详情</h2>
      {order && (
        <>
          <div style={{ marginBottom: 24, background: '#fafbfc', borderRadius: 8, padding: 18, boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
            <div><b>工单ID：</b>{order.id}</div>
            <div><b>船只编号：</b>{order.boat_no || order.serial_no}</div>
            <div><b>销售订单ID：</b>{order.sale_order_id}</div>
            <div><b>售后原因：</b>{order.reason}</div>
            <div><b>是否完成：</b>{order.is_complete ? '已完成' : '未完成'}</div>
            <div><b>创建时间：</b>{order.created_at && order.created_at.replace('T', ' ').slice(0, 19)}</div>
          </div>
          <div style={{ marginBottom: 32 }}>
            <h3>添加/选择所需材料</h3>
            {/* 材料选择进度指示器 */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              marginBottom: '16px',
              padding: '12px 16px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #e9ecef'
            }}>
              <span style={{ 
                backgroundColor: searchName ? '#4caf50' : '#6c757d',
                color: 'white',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {searchName ? "1" : "1"}
              </span>
              <span style={{ color: searchName ? '#4caf50' : '#6c757d' }}>
                {searchName ? "✅ 已输入材料名称" : "⏳ 输入材料名称"}
              </span>
              <span style={{ color: '#6c757d' }}>→</span>
              <span style={{ 
                backgroundColor: selectedMaterial ? '#4caf50' : '#6c757d',
                color: 'white',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {selectedMaterial ? "2" : "2"}
              </span>
              <span style={{ color: selectedMaterial ? '#4caf50' : '#6c757d' }}>
                {selectedMaterial ? "✅ 已选择材料" : "⏳ 选择材料"}
              </span>
              <span style={{ color: '#6c757d' }}>→</span>
              <span style={{ 
                backgroundColor: quantity && Number(quantity) > 0 ? '#4caf50' : '#6c757d',
                color: 'white',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {quantity && Number(quantity) > 0 ? "3" : "3"}
              </span>
              <span style={{ color: quantity && Number(quantity) > 0 ? '#4caf50' : '#6c757d' }}>
                {quantity && Number(quantity) > 0 ? "✅ 已填写数量" : "⏳ 填写数量"}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
              <div style={{ position: 'relative' }}>
                <input
                  ref={nameInputRef}
                  style={{ 
                    padding: 8, 
                    borderRadius: 6, 
                    border: selectedMaterial ? '2px solid #4caf50' : '1px solid #ccc', 
                    minWidth: 180,
                    backgroundColor: selectedMaterial ? '#f8fff8' : '#fff'
                  }}
                  placeholder="输入材料名称，选择后自动补全所有信息"
                  value={searchName}
                  onChange={e => { setSearchName(e.target.value); setSelectedMaterial(null); }}
                  autoComplete="off"
                />
                {selectedMaterial && (
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
                {suggestions.length > 0 && (
                  <div style={{ 
                    position: 'absolute', 
                    top: 36, 
                    left: 0, 
                    background: '#fff', 
                    border: '2px solid #e1e5e9', 
                    borderRadius: 8, 
                    zIndex: 1000, 
                    width: '100%',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
                  }}>
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
              {/* 型号输入框 - 现在只读，自动填充 */}
              <input
                style={{ 
                  padding: 8, 
                  borderRadius: 6, 
                  border: '1px solid #ccc', 
                  width: 120,
                  backgroundColor: '#f5f5f5',
                  color: '#666'
                }}
                placeholder="选择材料后自动填充"
                value={model}
                readOnly
              />
              <input
                style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', width: 80 }}
                placeholder="数量"
                type="number"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                min="0.01"
                step="0.01"
              />
              <span style={{ 
                padding: '8px 12px', 
                backgroundColor: unit ? '#e8f5e8' : '#f5f5f5', 
                borderRadius: 6, 
                color: unit ? '#2e7d32' : '#999',
                minWidth: '60px',
                textAlign: 'center',
                fontSize: '14px'
              }}>
                {unit || "无单位"}
              </span>
              <button onClick={handleAddToBatch} style={{ padding: '8px 18px', borderRadius: 6, background: '#1976d2', color: '#fff', border: 'none', fontWeight: 'bold', fontSize: 15, cursor: 'pointer' }}>添加材料</button>
            </div>
            {/* 批量待提交明细表 */}
            {batchList.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
                  <thead>
                    <tr>
                      <th>材料名称</th>
                      <th>型号</th>
                      <th>数量</th>
                      <th>单位</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batchList.map((m, idx) => (
                      <tr key={idx}>
                        <td>{m.material_name}</td>
                        <td>{m.model}</td>
                        <td>{m.quantity}</td>
                        <td>{m.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button onClick={handleBatchSubmit} style={{ marginTop: 8, padding: '8px 24px', borderRadius: 6, background: '#388e3c', color: '#fff', border: 'none', fontWeight: 'bold', fontSize: 15, cursor: 'pointer' }}>全部提交</button>
              </div>
            )}
            <div style={{ color: msg.includes('成功') ? '#388e3c' : '#d32f2f', marginTop: 8 }}>{msg}</div>
          </div>
          <div>
            <h3>已选材料明细</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
              <thead>
                <tr>
                  <th>材料名称</th>
                  <th>型号</th>
                  <th>数量</th>
                  <th>单位</th>
                  <th>单价</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {materials.map(m => (
                  <tr key={m.id}>
                    <td>{m.material_name}</td>
                    <td>{m.model}</td>
                    <td>{m.quantity}</td>
                    <td>{m.unit}</td>
                    <td>{m.unit_price}</td>
                    <td><button onClick={() => handleDelete(m.id)} style={{ color: '#d32f2f', border: 'none', background: 'none', cursor: 'pointer' }}>删除</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 32, display: 'flex', gap: 16, alignItems: 'center' }}>
            <label>
              加价率
              <input
                style={{ marginLeft: 4, padding: 8, borderRadius: 6, border: '1px solid #ccc', width: 80 }}
                placeholder="如1.2"
                type="number"
                step="0.01"
                value={markup}
                onChange={e => setMarkup(e.target.value)}
              />
            </label>
            <label>
              工时
              <input
                style={{ marginLeft: 4, padding: 8, borderRadius: 6, border: '1px solid #ccc', width: 80 }}
                placeholder="小时"
                type="number"
                value={workHours}
                onChange={e => setWorkHours(e.target.value)}
              />
            </label>
            <label>
              时薪
              <input
                style={{ marginLeft: 4, padding: 8, borderRadius: 6, border: '1px solid #ccc', width: 80 }}
                placeholder="元/小时"
                type="number"
                value={hourlyRate}
                onChange={e => setHourlyRate(e.target.value)}
              />
            </label>
            <label>
              其他费用
              <input
                style={{ marginLeft: 4, padding: 8, borderRadius: 6, border: '1px solid #ccc', width: 80 }}
                placeholder="元"
                type="number"
                value={otherFee}
                onChange={e => setOtherFee(e.target.value)}
              />
            </label>
            <button
              style={{ padding: '8px 20px', borderRadius: 6, background: '#1976d2', color: '#fff', border: 'none', fontWeight: 'bold', fontSize: 15, cursor: 'pointer' }}
              onClick={async () => {
                // 计算报价
                const materialTotal = materials.reduce((sum, m) => sum + Number(m.quantity) * Number(m.unit_price || 0), 0);
                const price = materialTotal * Number(markup || 1) + Number(workHours || 0) * Number(hourlyRate || 0) + Number(otherFee || 0);
                setQuote(price.toFixed(2));
                // 提交到后端
                const res = await fetch(`/api/after-sales-orders/${order.id}/price`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ price })
                });
                if (res.ok) {
                  setQuote(price.toFixed(2));
                  setQuoteMsg("报价已保存！");
                } else {
                  setQuoteMsg("报价保存失败");
                }
              }}
            >生成报价</button>
            {quote !== null && <span style={{ marginLeft: 16, fontWeight: 600, color: '#1976d2' }}>报价：￥{quote}</span>}
            {quoteMsg && <span style={{ marginLeft: 16, color: quoteMsg.includes('成功') ? '#388e3c' : '#d32f2f' }}>{quoteMsg}</span>}
          </div>
        </>
      )}
    </div>
  );
}

export default RepairOrderDetailPage; 