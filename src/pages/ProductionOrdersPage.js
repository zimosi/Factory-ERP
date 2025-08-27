import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

const saleOrderCardStyle = {
  background: "#fffbe6",
  borderRadius: 12,
  boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
  padding: "18px 16px",
  minWidth: 180,
  maxWidth: 180,
  border: "1px solid #ffe58f",
  position: "relative",
  textAlign: "left",
  flex: "0 0 180px",
  marginBottom: 0
};

function ProductionOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [bom, setBom] = useState([]);
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    sale_order_id: "",
    product_id: "",
    product_name: "",
    serial_no: "",
    planned_start_date: "",
    planned_end_date: "",
    is_reviewed: 0,
    remark: "",
    quantity: ""
  });
  const [saleOrders, setSaleOrders] = useState([]);
  // 新增处理弹窗相关状态
  const [processingOrderId, setProcessingOrderId] = useState(null);
  const [productStock, setProductStock] = useState(null);
  const [productStockLoading, setProductStockLoading] = useState(false);
  // 新增：boat表相关弹窗状态
  const [showBoatInfo, setShowBoatInfo] = useState(false);
  const [boatList, setBoatList] = useState([]);
  const [boatLoading, setBoatLoading] = useState(false);
  const [selectedBoats, setSelectedBoats] = useState([]);
  const [usedCount, setUsedCount] = useState(0);
  const [products, setProducts] = useState([]);
  // 新建生产订单弹窗相关state
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [createCount, setCreateCount] = useState(1);
  const [createStartDate, setCreateStartDate] = useState('');
  const [createEndDate, setCreateEndDate] = useState('');
  const [creatingOrder, setCreatingOrder] = useState(null); // 新增: 当前要创建生产订单的销售订单
  // 替换BOM相关state
  const [orderMaterials, setOrderMaterials] = useState([]);
  // 新增：用于记录哪些材料被勾选及输入的数量
  const [selectedMaterials, setSelectedMaterials] = useState({});
  // 新增：搜索和已完成订单展示相关state
  const [searchName, setSearchName] = useState("");

  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();

  useEffect(() => {
    fetch("/api/production-orders").then(res => res.json()).then(setOrders);
  }, []);

  useEffect(() => {
    if (params.id && orders.length > 0) {
      const order = orders.find(o => String(o.id) === String(params.id));
      setSelectedOrder(order);
      if (order) {
        fetch(`/api/products/${order.product_id}/bom`).then(res => res.json()).then(setBom);
      } else {
        setBom([]);
      }
    } else {
      setSelectedOrder(null);
      setBom([]);
    }
  }, [params.id, orders]);

  // 拉取saleOrders后只保留is_reviewed为false且未全部处理的订单
  useEffect(() => {
    fetch("/api/sale-orders").then(res => res.json()).then(data => {
      setSaleOrders(Array.isArray(data) ? data.filter(o => (o.is_reviewed === 0 || o.is_reviewed === false) && (o.used_quantity < o.quantity)) : []);
    });
  }, []);

  // 页面初始化时拉取products
  useEffect(() => {
    fetch('/api/products').then(res => res.json()).then(setProducts);
  }, []);

  // useEffect: 监听selectedOrder变化，拉取production_order_materials
  useEffect(() => {
    if (selectedOrder && selectedOrder.id) {
      fetch(`/api/production-orders/${selectedOrder.id}/materials`).then(res => res.json()).then(setOrderMaterials);
    } else {
      setOrderMaterials([]);
    }
  }, [selectedOrder]);

  const handleSelectOrder = (id) => {
    navigate(`/production-orders/${id}`);
  };

  // 处理按钮点击
  const handleProcessOrder = async (order) => {
    setProcessingOrderId(order.id);
    setProductStockLoading(true);
    // 拉取所有产品，查找同名产品库存
    try {
      const res = await fetch("/api/products");
      const products = await res.json();
      const found = Array.isArray(products) ? products.find(p => p.name === order.product) : null;
      setProductStock(found ? found.quantity : null);
    } catch {
      setProductStock(null);
    }
    setProductStockLoading(false);
  };

  // 关闭弹窗
  const handleCloseProcess = () => {
    setProcessingOrderId(null);
    setProductStock(null);
  };

  // 使用库存按钮点击，查找boat表
  const handleShowBoatInfo = async (productName) => {
    setShowBoatInfo(true);
    setBoatLoading(true);
    setSelectedBoats([]);
    setUsedCount(0);
    try {
      const res = await fetch(`/api/boats?product_name=${encodeURIComponent(productName)}`);
      const data = await res.json();
      setBoatList(Array.isArray(data) ? data : []);
    } catch {
      setBoatList([]);
    }
    setBoatLoading(false);
  };
  const handleCloseBoatInfo = () => {
    setShowBoatInfo(false);
    setBoatList([]);
    setSelectedBoats([]);
    setUsedCount(0);
  };

  // 勾选checkbox
  const handleSelectBoat = (auto_id, checked) => {
    setSelectedBoats(prev => checked ? [...prev, auto_id] : prev.filter(id => id !== auto_id));
  };

  // 使用按钮
  const handleUseSelectedBoats = async () => {
    for (const auto_id of selectedBoats) {
      await fetch(`/api/boats/${auto_id}/use`, { method: 'PATCH' });
    }
    // 更新sale_orders的used_quantity
    if (processingOrderId) {
      await fetch(`/api/sale-orders/${processingOrderId}/used-quantity`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ add: selectedBoats.length })
      });
    }
    // 刷新boatList
    const res = await fetch(`/api/boats?product_name=${encodeURIComponent(boatList[0]?.product_name || '')}`);
    const data = await res.json();
    setBoatList(Array.isArray(data) ? data : []);
    setSelectedBoats([]);
    // 刷新saleOrders
    const saleRes = await fetch('/api/sale-orders');
    const saleData = await saleRes.json();
    setSaleOrders(Array.isArray(saleData) ? saleData.filter(o => (o.is_reviewed === 0 || o.is_reviewed === false) && (o.used_quantity < o.quantity)) : []);
    // 刷新products
    const productsRes = await fetch('/api/products');
    const productsData = await productsRes.json();
    setProducts(productsData);
  };

  // 新建生产订单提交逻辑
  const handleCreateProductionOrders = async () => {
    // 当前处理的销售订单creatingOrder
    if (!creatingOrder) {
      alert('未选择销售订单');
      return;
    }
    const prod = products.find(p => p.name === creatingOrder.product);
    if (!prod) {
      alert('未找到产品信息');
      return;
    }
    let code = prod.code;
    for (let i = 0; i < Number(createCount); i++) {
      const serial_no = `${prod.suffix || ''}${code + 1}`;
      await fetch('/api/production-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sale_order_id: creatingOrder.id,
          product_id: prod.id,
          product_name: prod.name,
          serial_no,
          planned_start_date: createStartDate,
          planned_end_date: createEndDate,
          is_reviewed: 0,
          remark: ''
        })
      });
      // 新增：每新建一条生产订单，used_quantity加一
      await fetch(`/api/sale-orders/${creatingOrder.id}/used-quantity`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ add: 1 })
      });
      code++;
    }
    setShowCreateOrder(false);
    setCreatingOrder(null); // 关闭时清空
    // 刷新生产订单列表
    fetch("/api/production-orders").then(res => res.json()).then(setOrders);
    // 新增：刷新销售订单列表
    fetch("/api/sale-orders").then(res => res.json()).then(data => {
      setSaleOrders(Array.isArray(data) ? data.filter(o => (o.is_reviewed === 0 || o.is_reviewed === false) && (o.used_quantity < o.quantity)) : []);
    });
    // 新增：刷新产品列表
    fetch("/api/products").then(res => res.json()).then(setProducts);
  };

  // 处理勾选框变化
  const handleMaterialCheck = (material_id, checked) => {
    setSelectedMaterials(prev => {
      const copy = { ...prev };
      if (checked) {
        copy[material_id] = { ...copy[material_id], checked: true, value: copy[material_id]?.value || '' };
      } else {
        delete copy[material_id];
      }
      return copy;
    });
  };
  // 处理输入框变化
  const handleMaterialInput = (material_id, value) => {
    setSelectedMaterials(prev => ({
      ...prev,
      [material_id]: { ...prev[material_id], value }
    }));
  };
  // 确认按钮逻辑
  const handleConfirmMaterialUsage = async () => {
    const updates = Object.entries(selectedMaterials)
      .filter(([_, v]) => v.checked && v.value && !isNaN(Number(v.value)))
      .map(([material_id, v]) => ({ material_id, used: Number(v.value) }));
    if (updates.length === 0) return;
    // 新增：创建领料单
    const user = JSON.parse(localStorage.getItem("user"));
    const pickRes = await fetch('/api/production-orders/production-pick-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        production_order_id: selectedOrder.id,
        items: updates.map(u => ({ material_id: u.material_id, quantity: u.used })),
        what: '生产',
        operator: user?.username || ""
      })
    });
    // 原有逻辑：更新用量
    for (const upd of updates) {
      await fetch(`/api/production-orders/${selectedOrder.id}/materials/${upd.material_id}/use`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ used: upd.used })
      });
    }
    // 刷新明细
    fetch(`/api/production-orders/${selectedOrder.id}/materials`).then(res => res.json()).then(setOrderMaterials);
    setSelectedMaterials({});
  };

  // 左侧菜单栏只显示未完成订单
  const unfinishedOrders = orders.filter(o => !o.is_complete);

  return (
    <div style={{ maxWidth: 1200, margin: "60px auto", minHeight: 600, position: "relative" }}>
      {/* 返回主页面按钮，左上角绝对定位 */}
      <button
        style={{ position: "absolute", left: 0, top: 0, zIndex: 20, padding: "8px 18px", borderRadius: 6, border: "none", background: "#1976d2", color: "#fff", fontWeight: "bold", fontSize: 15, cursor: "pointer", margin: 16 }}
        onClick={() => navigate("/")}
      >
        返回主页面
      </button>
      {/* 顶部未review销售订单卡片区，加边框分割 */}
      {saleOrders.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 18, justifyContent: "flex-start", marginBottom: 36, border: "1.5px solid #ffe58f", borderRadius: 12, background: "#fffef6", padding: 18 }}>
          {saleOrders.map(order => (
            <div key={order.id}>
              <div style={saleOrderCardStyle}>
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
                {/* 处理按钮 */}
                <div style={{ textAlign: "center", marginTop: 10 }}>
                  <button
                    style={{ padding: "6px 18px", borderRadius: 6, border: "none", background: "#52c41a", color: "#fff", fontWeight: "bold", fontSize: 15, cursor: "pointer" }}
                    onClick={() => handleProcessOrder(order)}
                  >
                    处理
                  </button>
                </div>
              </div>
              {processingOrderId === order.id && (
                <div style={{ marginTop: 10, width: 700, background: "#fff", border: "2px solid #52c41a", borderRadius: 10, boxShadow: "0 4px 16px rgba(0,0,0,0.12)", padding: 18, zIndex: 100 }}>
                  <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>产品需求</div>
                  <div style={{ marginBottom: 8 }}>产品名称：<b>{order.product}</b></div>
                  <div style={{ marginBottom: 8 }}>已处理产品数量：<b>{order.used_quantity || 0}</b></div>
                  <div style={{ marginBottom: 8 }}>
                    现有库存：{
                      (() => {
                        const prod = products.find(p => p.name === order.product);
                        return prod ? <b>{prod.quantity}</b> : <span style={{ color: '#d32f2f' }}>无数据</span>;
                      })()
                    }
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <button onClick={() => handleShowBoatInfo(order.product)} style={{ padding: "6px 18px", borderRadius: 6, border: "none", background: "#1890ff", color: "#fff", fontWeight: "bold", fontSize: 15, cursor: "pointer" }}>使用库存</button>
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                    <button onClick={() => { setCreatingOrder(order); setShowCreateOrder(true); }} style={{ padding: '6px 18px', borderRadius: 6, border: 'none', background: '#faad14', color: '#fff', fontWeight: 'bold', fontSize: 15, cursor: 'pointer' }}>新建生产订单</button>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <button onClick={handleCloseProcess} style={{ padding: "4px 16px", borderRadius: 6, border: "none", background: "#aaa", color: "#fff", fontWeight: "bold", fontSize: 14, cursor: "pointer" }}>关闭</button>
                  </div>
                  {/* boat表弹窗 */}
                  {showBoatInfo && (
                    <div style={{ marginTop: 18, background: "#f6faff", border: "1.5px solid #1890ff", borderRadius: 8, padding: 14 }}>
                      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>产品库存明细（boat表）</div>
                      {boatLoading ? (
                        <div>加载中...</div>
                      ) : boatList.length === 0 ? (
                        <div style={{ color: '#888' }}>无相关库存</div>
                      ) : (
                        <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
                          <thead>
                            <tr>
                              <th style={{ border: "1px solid #e0e0e0", padding: "6px 8px", background: "#f5f5f5" }}>编号</th>
                              <th style={{ border: "1px solid #e0e0e0", padding: "6px 8px", background: "#f5f5f5" }}>产品名</th>
                              <th style={{ border: "1px solid #e0e0e0", padding: "6px 8px", background: "#f5f5f5" }}>备注</th>
                              <th style={{ border: "1px solid #e0e0e0", padding: "6px 8px", background: "#f5f5f5" }}>是否制作完成</th>
                              <th style={{ border: "1px solid #e0e0e0", padding: "6px 8px", background: "#f5f5f5" }}>选择</th>
                            </tr>
                          </thead>
                          <tbody>
                            {boatList.filter(boat => !boat.is_sold).map(boat => (
                              <tr key={boat.auto_id}>
                                <td style={{ border: "1px solid #e0e0e0", padding: "6px 8px" }}>{boat.boat_no}</td>
                                <td style={{ border: "1px solid #e0e0e0", padding: "6px 8px" }}>{boat.product_name}</td>
                                <td style={{ border: "1px solid #e0e0e0", padding: "6px 8px" }}>{boat.remark || '无'}</td>
                                <td style={{ border: "1px solid #e0e0e0", padding: "6px 8px", textAlign: 'center' }}>{boat.is_completed ? '是' : '否'}</td>
                                <td style={{ border: "1px solid #e0e0e0", padding: "6px 8px", textAlign: 'center' }}>
                                  <input type="checkbox" checked={selectedBoats.includes(boat.auto_id)} onChange={e => handleSelectBoat(boat.auto_id, e.target.checked)} />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                        <button onClick={handleCloseBoatInfo} style={{ padding: "4px 16px", borderRadius: 6, border: "none", background: "#aaa", color: "#fff", fontWeight: "bold", fontSize: 14, cursor: "pointer" }}>关闭明细</button>
                        <button disabled={selectedBoats.length === 0} onClick={handleUseSelectedBoats} style={{ padding: "4px 16px", borderRadius: 6, border: "none", background: selectedBoats.length === 0 ? '#ccc' : '#52c41a', color: "#fff", fontWeight: "bold", fontSize: 14, cursor: selectedBoats.length === 0 ? 'not-allowed' : 'pointer' }}>使用</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {/* 页面主体整体下移，生产订单区加边框分割 */}
      <div style={{ display: "flex", maxWidth: 1200, margin: "0 auto", minHeight: 600, position: "relative", border: "1.5px solid #e0e0e0", borderRadius: 12, background: "#fff", padding: 18 }}>
        {/* 左侧菜单栏 */}
        <div style={{ width: 260, background: "#fafbfc", borderRight: "1px solid #eee", padding: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 18, padding: "18px 0 12px 24px" }}>生产订单</div>
          {unfinishedOrders.length === 0 ? (
            <div style={{ color: "#888", padding: 24 }}>暂无未完成生产订单</div>
          ) : (
            unfinishedOrders.map(order => (
              <div
                key={order.id}
                onClick={() => handleSelectOrder(order.id)}
                style={{
                  padding: "12px 24px",
                  cursor: "pointer",
                  background: String(params.id) === String(order.id) ? "#e6f7ff" : "#fff",
                  borderLeft: String(params.id) === String(order.id) ? "4px solid #1890ff" : "4px solid transparent",
                  fontWeight: String(params.id) === String(order.id) ? 600 : 400
                }}
              >
                {order.serial_no || order.product_name}
                <div style={{ fontSize: 13, color: "#888" }}>{order.product_name}</div>
              </div>
            ))
          )}
        </div>
        {/* 右侧内容区 */}
        <div style={{ flex: 1, padding: 36, position: "relative" }}>
          {/* 顶部按钮区，右对齐（只保留新建生产订单按钮） */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 16, marginBottom: 24 }}>
            <button
              style={{ padding: "8px 18px", borderRadius: 6, border: "none", background: "#1976d2", color: "#fff", fontWeight: "bold", fontSize: 15, cursor: "pointer" }}
              onClick={() => setShowForm(f => !f)}
            >
              {showForm ? "取消" : "新建生产订单"}
            </button>
          </div>
          {/* 新建生产订单表单 */}
          {showForm && (
            <form style={{ maxWidth: 500, margin: "0 auto", background: "#fafbfc", borderRadius: 10, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", padding: 24, marginBottom: 32 }} onSubmit={async e => {
              e.preventDefault();
              setMessage("");
              // 查找产品信息
              const prod = products.find(p => p.name === form.product_name);
              if (!prod) {
                setMessage("未找到产品信息");
                return;
              }
              let code = prod.code;
              for (let i = 0; i < Number(form.quantity || 1); i++) {
                const serial_no = `${prod.suffix || ''}${code + 1}`;
                await fetch("/api/production-orders", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    sale_order_id: 0,
                    product_id: prod.id,
                    product_name: prod.name,
                    serial_no,
                    planned_start_date: form.planned_start_date,
                    planned_end_date: form.planned_end_date,
                    is_reviewed: 0,
                    remark: form.remark || ""
                  })
                });
                code++;
              }
              setMessage("生产订单创建成功！");
              setShowForm(false);
              setForm({
                sale_order_id: "",
                product_id: "",
                product_name: "",
                serial_no: "",
                planned_start_date: "",
                planned_end_date: "",
                is_reviewed: 0,
                remark: "",
                quantity: ""
              });
              fetch("/api/production-orders").then(res => res.json()).then(setOrders);
              fetch("/api/products").then(res => res.json()).then(setProducts);
            }}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ minWidth: 90, marginRight: 10, fontWeight: 500 }}>产品名称：</label>
                <input name="product_name" value={form.product_name} onChange={e => setForm(f => ({ ...f, product_name: e.target.value }))} style={{ padding: 8, borderRadius: 6, minWidth: 180 }} required />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ minWidth: 90, marginRight: 10, fontWeight: 500 }}>计划开工日期：</label>
                <input type="date" name="planned_start_date" value={form.planned_start_date} onChange={e => setForm(f => ({ ...f, planned_start_date: e.target.value }))} style={{ padding: 8, borderRadius: 6, minWidth: 180 }} required />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ minWidth: 90, marginRight: 10, fontWeight: 500 }}>计划完工日期：</label>
                <input type="date" name="planned_end_date" value={form.planned_end_date} onChange={e => setForm(f => ({ ...f, planned_end_date: e.target.value }))} style={{ padding: 8, borderRadius: 6, minWidth: 180 }} required />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ minWidth: 90, marginRight: 10, fontWeight: 500 }}>备注：</label>
                <input name="remark" value={form.remark} onChange={e => setForm(f => ({ ...f, remark: e.target.value }))} style={{ padding: 8, borderRadius: 6, minWidth: 180 }} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ minWidth: 90, marginRight: 10, fontWeight: 500 }}>生产数量：</label>
                <input type="number" min={1} name="quantity" value={form.quantity || 1} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} style={{ padding: 8, borderRadius: 6, minWidth: 80 }} required />
              </div>
              <div style={{ display: "flex", gap: 16, marginTop: 24 }}>
                <button type="submit" style={{ flex: 1, padding: "10px 0", background: "#1976d2", color: "#fff", fontWeight: "bold", fontSize: 16, border: "none", borderRadius: 6 }}>提交</button>
                <button type="button" style={{ flex: 1, padding: "10px 0", background: "#aaa", color: "#fff", fontWeight: "bold", fontSize: 16, border: "none", borderRadius: 6 }} onClick={() => setShowForm(false)}>取消</button>
              </div>
            </form>
          )}
          {!selectedOrder ? (
            <div style={{ color: "#888", fontSize: 18, textAlign: "center", marginTop: 120 }}>请选择左侧生产订单</div>
          ) : (
            <>
              <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 18 }}>产品：{selectedOrder.product_name}（编号：{selectedOrder.serial_no}）</div>
              <div style={{ marginBottom: 18, color: "#888" }}>计划开工：{selectedOrder.planned_start_date}，计划完工：{selectedOrder.planned_end_date}</div>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>生产用料明细</div>
              {orderMaterials.length === 0 ? (
                <div style={{ color: "#aaa" }}>暂无用料数据</div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
                  <thead>
                    <tr>
                      <th style={{ border: "1px solid #e0e0e0", padding: "6px 8px", background: "#f5f5f5" }}>材料名称</th>
                      <th style={{ border: "1px solid #e0e0e0", padding: "6px 8px", background: "#f5f5f5" }}>型号</th>
                      <th style={{ border: "1px solid #e0e0e0", padding: "6px 8px", background: "#f5f5f5" }}>计划用量</th>
                      <th style={{ border: "1px solid #e0e0e0", padding: "6px 8px", background: "#f5f5f5" }}>已用数量</th>
                      <th style={{ border: "1px solid #e0e0e0", padding: "6px 8px", background: "#f5f5f5" }}>选择</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderMaterials.map(mat => (
                      <tr key={mat.material_id}>
                        <td style={{ border: "1px solid #e0e0e0", padding: "6px 8px" }}>{mat.material_name}</td>
                        <td style={{ border: "1px solid #e0e0e0", padding: "6px 8px" }}>{mat.model}</td>
                        <td style={{ border: "1px solid #e0e0e0", padding: "6px 8px" }}>{mat.planned_quantity}</td>
                        <td style={{ border: "1px solid #e0e0e0", padding: "6px 8px" }}>{mat.used_quantity}</td>
                        <td style={{ border: "1px solid #e0e0e0", padding: "6px 8px", textAlign: 'center' }}>
                          <input type="checkbox" checked={!!selectedMaterials[mat.material_id]?.checked} onChange={e => handleMaterialCheck(mat.material_id, e.target.checked)} />
                          {selectedMaterials[mat.material_id]?.checked && (
                            <input
                              type="number"
                              min={0}
                              step={0.01}
                              value={selectedMaterials[mat.material_id]?.value || ''}
                              onChange={e => handleMaterialInput(mat.material_id, e.target.value)}
                              style={{ marginLeft: 8, width: 60 }}
                              placeholder="用量"
                            />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {orderMaterials.length > 0 && (
                <div style={{ marginTop: 16, textAlign: 'right' }}>
                  <button onClick={handleConfirmMaterialUsage} style={{ padding: '8px 24px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 'bold', fontSize: 15, cursor: 'pointer' }}>
                    确认
                  </button>
                </div>
              )}
            </>
          )}
          {message && <div style={{ color: message.includes("成功") ? "#388e3c" : "#d32f2f", marginTop: 18 }}>{message}</div>}
          {selectedOrder && !selectedOrder.is_complete && (
            <div style={{ marginTop: 32, textAlign: 'right' }}>
              <button
                style={{ padding: '10px 24px', borderRadius: 6, border: 'none', background: '#388e3c', color: '#fff', fontWeight: 'bold', fontSize: 16, cursor: 'pointer' }}
                onClick={async () => {
                  await fetch(`/api/production-orders/${selectedOrder.id}/complete`, { method: 'PATCH' });
                  // 刷新订单和明细
                  fetch('/api/production-orders').then(res => res.json()).then(setOrders);
                  fetch(`/api/production-orders/${selectedOrder.id}/materials`).then(res => res.json()).then(setOrderMaterials);
                }}
              >
                完成
              </button>
            </div>
          )}
        </div>
      </div>
      {showCreateOrder && (
        <div style={{ background: '#fff', border: '2px solid #faad14', borderRadius: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', padding: 18, zIndex: 200, position: 'absolute', left: 0, top: 60, width: 340 }}>
          <div style={{ marginBottom: 10 }}>
            <label>生产条数：</label>
            <input type="number" min={1} value={createCount} onChange={e => setCreateCount(e.target.value)} />
          </div>
          <div style={{ marginBottom: 10 }}>
            <label>计划生产日期：</label>
            <input type="date" value={createStartDate} onChange={e => setCreateStartDate(e.target.value)} />
          </div>
          <div style={{ marginBottom: 10 }}>
            <label>计划完成日期：</label>
            <input type="date" value={createEndDate} onChange={e => setCreateEndDate(e.target.value)} />
          </div>
          <button onClick={handleCreateProductionOrders} style={{ marginRight: 10, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 18px', fontWeight: 'bold' }}>提交</button>
          <button onClick={() => { setShowCreateOrder(false); setCreatingOrder(null); }} style={{ background: '#aaa', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 18px', fontWeight: 'bold' }}>取消</button>
        </div>
      )}
      {/* 新增：全部生产订单和搜索 */}
      <div style={{ marginTop: 40, background: '#fafbfc', borderRadius: 10, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <b style={{ fontSize: 17 }}>全部生产订单</b>
          <input
            type="text"
            placeholder="按产品名称搜索"
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
            style={{ padding: 6, borderRadius: 6, border: '1px solid #ccc', minWidth: 180 }}
          />
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #e0e0e0', padding: '6px 8px', background: '#f5f5f5' }}>编号</th>
              <th style={{ border: '1px solid #e0e0e0', padding: '6px 8px', background: '#f5f5f5' }}>产品名称</th>
              <th style={{ border: '1px solid #e0e0e0', padding: '6px 8px', background: '#f5f5f5' }}>计划开工</th>
              <th style={{ border: '1px solid #e0e0e0', padding: '6px 8px', background: '#f5f5f5' }}>计划完工</th>
              <th style={{ border: '1px solid #e0e0e0', padding: '6px 8px', background: '#f5f5f5' }}>是否完成</th>
            </tr>
          </thead>
          <tbody>
            {orders.filter(o => !searchName || o.product_name.includes(searchName)).map(order => (
              <tr key={order.id}>
                <td style={{ border: '1px solid #e0e0e0', padding: '6px 8px' }}>{order.serial_no}</td>
                <td style={{ border: '1px solid #e0e0e0', padding: '6px 8px' }}>{order.product_name}</td>
                <td style={{ border: '1px solid #e0e0e0', padding: '6px 8px' }}>{order.planned_start_date}</td>
                <td style={{ border: '1px solid #e0e0e0', padding: '6px 8px' }}>{order.planned_end_date}</td>
                <td style={{ border: '1px solid #e0e0e0', padding: '6px 8px' }}>{order.is_complete ? '已完成' : '未完成'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProductionOrdersPage; 