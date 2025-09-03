import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function ProcessingProductionPage() {
  const navigate = useNavigate();
  const [designDrawings, setDesignDrawings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // 获取所有设计图纸
  useEffect(() => {
    fetchDesignDrawings();
  }, []);

  const fetchDesignDrawings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/design-drawings");
      if (response.ok) {
        const data = await response.json();
        setDesignDrawings(data);
      } else {
        throw new Error("获取设计图纸失败");
      }
    } catch (error) {
      console.error("获取设计图纸失败:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 过滤设计图纸
  const filteredDrawings = designDrawings.filter(drawing => {
    const matchesSearch = drawing.drawing_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         drawing.designer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (drawing.remark && drawing.remark.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (filterStatus === "all") return matchesSearch;
    
    const currentStatus = drawing.status || 'pending';
    if (filterStatus === "pending") return matchesSearch && currentStatus === 'pending';
    if (filterStatus === "active") return matchesSearch && currentStatus === 'in_production';
    if (filterStatus === "completed") return matchesSearch && currentStatus === 'completed';
    
    return matchesSearch;
  });

  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("zh-CN");
  };

  // 获取状态颜色
  const getStatusColor = (status) => {
    switch (status) {
      case "in_production": return "#4caf50";
      case "completed": return "#2196f3";
      case "pending": return "#ff9800";
      default: return "#9e9e9e";
    }
  };

  // 获取状态文本
  const getStatusText = (status) => {
    switch (status) {
      case "pending": return "待生产";
      case "in_production": return "生产中";
      case "completed": return "已完成";
      default: return "未知";
    }
  };

  // 完成生产
  const handleCompleteProduction = async (drawingId, drawingNo) => {
    if (!window.confirm(`确认完成设计图纸 ${drawingNo} 的生产吗？\n\n完成生产后，对应的加工件将自动加入库存。`)) {
      return;
    }

    try {
      const response = await fetch(`/api/design-drawings/${drawingId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operator: "系统操作员"
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`生产完成成功！\n\n图纸编号：${result.drawing_no}\n完成加工件：${result.completed_products} 种`);
        // 刷新数据
        fetchDesignDrawings();
      } else {
        const error = await response.json();
        alert(`完成生产失败：${error.message}`);
      }
    } catch (error) {
      console.error("完成生产失败:", error);
      alert("完成生产失败，请稍后重试");
    }
  };

  // 开始领料
  const handleStartPickOrder = async (drawingId, drawingNo) => {
    if (!window.confirm(`确认开始设计图纸 ${drawingNo} 的领料吗？\n\n领料后，原材料库存将减少，设计图纸状态将变为生产中。`)) {
      return;
    }

    try {
      // 获取设计图纸详情
      const drawingResponse = await fetch(`/api/design-drawings/${drawingId}`);
      if (!drawingResponse.ok) {
        throw new Error("获取设计图纸详情失败");
      }
      
      const drawing = await drawingResponse.json();
      
      if (!drawing.materials || drawing.materials.length === 0) {
        alert("该设计图纸没有原材料信息");
        return;
      }

      // 准备领料单数据
      const items = drawing.materials.map(material => ({
        material_id: material.material_id,
        quantity: material.quantity
      }));

      // 创建领料单
      const response = await fetch('/api/design-drawings/pick-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          drawing_id: drawingId,
          items: items,
          operator: "系统操作员",
          remark: `设计图纸 ${drawingNo} 领料`
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`领料单创建成功！\n\n图纸编号：${result.drawing_no}\n领料单ID：${result.pick_order_id}\n材料种类：${result.items_count} 种`);
        // 刷新数据
        fetchDesignDrawings();
      } else {
        const error = await response.json();
        alert(`创建领料单失败：${error.message}`);
      }
    } catch (error) {
      console.error("创建领料单失败:", error);
      alert("创建领料单失败，请稍后重试");
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <div style={{ fontSize: "18px", color: "#666" }}>加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <div style={{ fontSize: "18px", color: "#f44336" }}>错误: {error}</div>
        <button
          onClick={fetchDesignDrawings}
          style={{
            marginTop: "16px",
            padding: "8px 16px",
            backgroundColor: "#2196f3",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
      {/* 页面标题 */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h1 style={{ margin: 0, color: "#1976d2", fontSize: "28px" }}>
            🔧 加工件生产管理
          </h1>
          <button
            onClick={() => navigate("/")}
            style={{
              padding: "10px 20px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500"
            }}
          >
            返回主页面
          </button>
        </div>
        <p style={{ margin: 0, color: "#666", fontSize: "16px" }}>
          管理所有设计图纸的生产订单，跟踪加工件的生产进度
        </p>
      </div>

      {/* 统计卡片 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "32px" }}>
        <div style={{
          background: "linear-gradient(135deg, #4caf50, #45a049)",
          padding: "24px",
          borderRadius: "12px",
          color: "white",
          textAlign: "center",
          boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)"
        }}>
          <div style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "8px" }}>
            {designDrawings.length}
          </div>
          <div style={{ fontSize: "14px", opacity: 0.9 }}>总设计图纸</div>
        </div>
        
        <div style={{
          background: "linear-gradient(135deg, #ff9800, #f57c00)",
          padding: "24px",
          borderRadius: "12px",
          color: "white",
          textAlign: "center",
          boxShadow: "0 4px 12px rgba(255, 152, 0, 0.3)"
        }}>
          <div style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "8px" }}>
            {designDrawings.filter(d => (d.status || 'pending') === 'pending').length}
          </div>
          <div style={{ fontSize: "14px", opacity: 0.9 }}>待生产</div>
        </div>
        
        <div style={{
          background: "linear-gradient(135deg, #2196f3, #1976d2)",
          padding: "24px",
          borderRadius: "12px",
          color: "white",
          textAlign: "center",
          boxShadow: "0 4px 12px rgba(33, 150, 243, 0.3)"
        }}>
          <div style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "8px" }}>
            {designDrawings.filter(d => (d.status || 'pending') === 'completed').length}
          </div>
          <div style={{ fontSize: "14px", opacity: 0.9 }}>已完成</div>
        </div>
        
        <div style={{
          background: "linear-gradient(135deg, #9c27b0, #7b1fa2)",
          padding: "24px",
          borderRadius: "12px",
          color: "white",
          textAlign: "center",
          boxShadow: "0 4px 12px rgba(156, 39, 176, 0.3)"
        }}>
          <div style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "8px" }}>
            ¥{(designDrawings.reduce((sum, drawing) => sum + (Number(drawing.total_material_cost) || 0), 0)).toFixed(2)}
          </div>
          <div style={{ fontSize: "14px", opacity: 0.9 }}>总材料成本</div>
        </div>
      </div>

      {/* 搜索和过滤 */}
      <div style={{
        background: "#f8f9fa",
        padding: "20px",
        borderRadius: "12px",
        marginBottom: "24px",
        display: "flex",
        gap: "16px",
        alignItems: "center",
        flexWrap: "wrap"
      }}>
        <div style={{ flex: 1, minWidth: "300px" }}>
          <input
            type="text"
            placeholder="搜索图纸编号、设计人或备注..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 16px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              fontSize: "14px",
              outline: "none"
            }}
          />
        </div>
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: "12px 16px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            fontSize: "14px",
            outline: "none",
            minWidth: "150px"
          }}
        >
          <option value="all">全部状态</option>
          <option value="pending">待生产</option>
          <option value="active">生产中</option>
          <option value="completed">已完成</option>
        </select>
        
        <button
          onClick={fetchDesignDrawings}
          style={{
            padding: "12px 24px",
            backgroundColor: "#2196f3",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500"
          }}
        >
          🔄 刷新
        </button>
      </div>

      {/* 设计图纸列表 */}
      <div style={{
        background: "white",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        overflow: "hidden"
      }}>
        {filteredDrawings.length === 0 ? (
          <div style={{ padding: "60px 20px", textAlign: "center", color: "#666" }}>
            <div style={{ fontSize: "18px", marginBottom: "8px" }}>暂无设计图纸</div>
            <div style={{ fontSize: "14px" }}>请先创建设计图纸</div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8f9fa" }}>
                  <th style={{ padding: "16px 12px", textAlign: "left", borderBottom: "1px solid #e0e0e0", fontWeight: "600" }}>
                    图纸信息
                  </th>
                  <th style={{ padding: "16px 12px", textAlign: "center", borderBottom: "1px solid #e0e0e0", fontWeight: "600" }}>
                    设计人
                  </th>
                  <th style={{ padding: "16px 12px", textAlign: "center", borderBottom: "1px solid #e0e0e0", fontWeight: "600" }}>
                    材料统计
                  </th>
                  <th style={{ padding: "16px 12px", textAlign: "center", borderBottom: "1px solid #e0e0e0", fontWeight: "600" }}>
                    加工件统计
                  </th>
                  <th style={{ padding: "16px 12px", textAlign: "center", borderBottom: "1px solid #e0e0e0", fontWeight: "600" }}>
                    成本分析
                  </th>
                  <th style={{ padding: "16px 12px", textAlign: "center", borderBottom: "1px solid #e0e0e0", fontWeight: "600" }}>
                    状态
                  </th>
                  <th style={{ padding: "16px 12px", textAlign: "center", borderBottom: "1px solid #e0e0e0", fontWeight: "600" }}>
                    创建时间
                  </th>
                  <th style={{ padding: "16px 12px", textAlign: "center", borderBottom: "1px solid #e0e0e0", fontWeight: "600" }}>
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredDrawings.map((drawing) => (
                  <tr key={drawing.id} style={{
                    borderBottom: "1px solid #f0f0f0",
                    transition: "background-color 0.2s"
                  }}
                  onMouseEnter={(e) => e.target.closest('tr').style.backgroundColor = "#f8f9fa"}
                  onMouseLeave={(e) => e.target.closest('tr').style.backgroundColor = "transparent"}
                  >
                    <td style={{ padding: "16px 12px" }}>
                      <div style={{ marginBottom: "8px" }}>
                        <span style={{
                          fontSize: "16px",
                          fontWeight: "600",
                          color: "#1976d2"
                        }}>
                          {drawing.drawing_no}
                        </span>
                      </div>
                      <div style={{ color: "#666", fontSize: "13px" }}>
                        {drawing.remark || "无备注"}
                      </div>
                    </td>
                    
                    <td style={{ padding: "16px 12px", textAlign: "center" }}>
                      <div style={{
                        padding: "6px 12px",
                        backgroundColor: "#e3f2fd",
                        color: "#1976d2",
                        borderRadius: "20px",
                        fontSize: "14px",
                        fontWeight: "500",
                        display: "inline-block"
                      }}>
                        {drawing.designer}
                      </div>
                    </td>
                    
                    <td style={{ padding: "16px 12px", textAlign: "center" }}>
                      <div style={{ fontSize: "14px", color: "#666" }}>
                        <div style={{ marginBottom: "4px" }}>
                          <strong>{drawing.material_count || 0}</strong> 种材料
                        </div>
                      </div>
                    </td>
                    
                    <td style={{ padding: "16px 12px", textAlign: "center" }}>
                      <div style={{ fontSize: "14px", color: "#666" }}>
                        <div style={{ marginBottom: "4px" }}>
                          <strong>{drawing.product_count || 0}</strong> 种加工件
                        </div>
                      </div>
                    </td>
                    
                    <td style={{ padding: "16px 12px", textAlign: "center" }}>
                      <div style={{ fontSize: "14px", color: "#666" }}>
                        <div style={{ marginBottom: "4px", color: "#f39c12", fontWeight: "600" }}>
                          ¥{(Number(drawing.total_material_cost) || 0).toFixed(2)}
                        </div>
                      </div>
                    </td>
                    
                    <td style={{ padding: "16px 12px", textAlign: "center" }}>
                      <div style={{
                        padding: "6px 12px",
                        backgroundColor: getStatusColor(drawing.status || 'pending'),
                        color: "white",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "500",
                        display: "inline-block"
                      }}>
                        {getStatusText(drawing.status || 'pending')}
                      </div>
                    </td>
                    
                    <td style={{ padding: "16px 12px", textAlign: "center" }}>
                      <div style={{ fontSize: "13px", color: "#666" }}>
                        {formatDate(drawing.created_at)}
                      </div>
                    </td>
                    
                    <td style={{ padding: "16px 12px", textAlign: "center" }}>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
                        <button
                          onClick={() => navigate(`/design-drawings/${drawing.id}`)}
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "#2196f3",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "12px"
                          }}
                        >
                          查看详情
                        </button>
                        {(drawing.status || 'pending') === 'pending' && (
                          <button
                            onClick={() => handleStartPickOrder(drawing.id, drawing.drawing_no)}
                            style={{
                              padding: "6px 12px",
                              backgroundColor: "#ff9800",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "12px"
                            }}
                          >
                            开始领料
                          </button>
                        )}
                        {(drawing.status || 'pending') === 'in_production' && (
                          <button
                            onClick={() => handleCompleteProduction(drawing.id, drawing.drawing_no)}
                            style={{
                              padding: "6px 12px",
                              backgroundColor: "#4caf50",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "12px"
                            }}
                          >
                            完成生产
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProcessingProductionPage;
