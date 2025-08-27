import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DesignDrawingForm from "../components/DesignDrawingForm";

function ProcessingDesignPage() {
  const navigate = useNavigate();
  const [processingMaterials, setProcessingMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDesignForm, setShowDesignForm] = useState(false);

  // 获取所有加工件材料（warehouse_id = 3）
  useEffect(() => {
    fetchProcessingMaterials();
  }, []);

  const fetchProcessingMaterials = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/materials/processing-all");
      if (response.ok) {
        const data = await response.json();
        setProcessingMaterials(data);
      } else {
        setError("获取加工件材料失败");
      }
    } catch (error) {
      console.error("获取加工件材料失败:", error);
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  };

  // 计算库存状态
  const getStockStatus = (quantity, minQuantity) => {
    if (quantity <= 0) return { status: "无库存", color: "#f44336", bgColor: "#ffebee" };
    if (quantity < minQuantity) return { status: "库存不足", color: "#ff9800", bgColor: "#fff3e0" };
    return { status: "库存充足", color: "#4caf50", bgColor: "#e8f5e8" };
  };

  // 格式化数字
  const formatNumber = (num) => {
    if (num === null || num === undefined) return "0";
    return Number(num).toLocaleString();
  };

  // 处理设计图纸表单
  const handleDesignDrawingSubmit = () => {
    // 刷新页面数据
    fetchProcessingMaterials();
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
        <div style={{ fontSize: "18px", marginBottom: "16px" }}>加载中...</div>
        <div style={{ color: "#999" }}>正在获取加工件材料信息</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#d32f2f" }}>
        <div style={{ fontSize: "18px", marginBottom: "16px" }}>加载失败</div>
        <div style={{ color: "#666" }}>{error}</div>
        <button 
          onClick={fetchProcessingMaterials}
          style={{
            marginTop: "16px",
            padding: "8px 16px",
            backgroundColor: "#1976d2",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* 返回主页面按钮 */}
      <button
        style={{
          position: 'fixed',
          top: 24,
          left: 32,
          padding: '8px 20px',
          borderRadius: 6,
          background: '#1976d2',
          color: '#fff',
          border: 'none',
          fontWeight: 'bold',
          fontSize: 15,
          cursor: 'pointer',
          zIndex: 200
        }}
        onClick={() => navigate('/')}
      >
        返回主页面
      </button>

      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ 
          fontSize: "28px", 
          fontWeight: "bold", 
          color: "#1976d2", 
          marginBottom: "8px" 
        }}>
          加工件设计
        </h2>
        <p style={{ color: "#666", fontSize: "16px" }}>
          管理所有加工件材料，包括库存状态、规格信息和设计需求
        </p>
      </div>



      {/* 加工件材料表格 */}
      <div style={{
        background: "#fff",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        overflow: "hidden"
      }}>
        <div style={{
          padding: "20px 24px",
          borderBottom: "1px solid #f0f0f0",
          background: "#fafbfc",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div>
            <h3 style={{ margin: 0, color: "#333", fontSize: "18px" }}>
              加工件材料列表
            </h3>
            <p style={{ margin: "8px 0 0 0", color: "#666", fontSize: "14px" }}>
              共 {processingMaterials.length} 种加工件材料
            </p>
          </div>
          <button
            onClick={() => setShowDesignForm(true)}
            style={{
              padding: "10px 20px",
              backgroundColor: "#4caf50",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              transition: "background-color 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = "#45a049"}
            onMouseLeave={(e) => e.target.style.backgroundColor = "#4caf50"}
          >
            📐 设计图纸
          </button>
        </div>

        {processingMaterials.length === 0 ? (
          <div style={{ 
            textAlign: "center", 
            padding: "60px 20px", 
            color: "#999" 
          }}>
            <div style={{ fontSize: "18px", marginBottom: "8px" }}>暂无加工件材料</div>
            <div style={{ fontSize: "14px" }}>请先在库存管理中添加加工件材料</div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "14px"
            }}>
              <thead>
                <tr style={{
                  background: "#f8f9fa",
                  borderBottom: "2px solid #e9ecef"
                }}>
                  <th style={{
                    padding: "16px 12px",
                    textAlign: "left",
                    fontWeight: "600",
                    color: "#495057",
                    borderBottom: "1px solid #dee2e6"
                  }}>
                    材料信息
                  </th>
                  <th style={{
                    padding: "16px 12px",
                    textAlign: "center",
                    fontWeight: "600",
                    color: "#495057",
                    borderBottom: "1px solid #dee2e6"
                  }}>
                    库存状态
                  </th>
                  <th style={{
                    padding: "16px 12px",
                    textAlign: "center",
                    fontWeight: "600",
                    color: "#495057",
                    borderBottom: "1px solid #dee2e6"
                  }}>
                    规格属性
                  </th>

                </tr>
              </thead>
              <tbody>
                {processingMaterials.map((material, index) => {
                  const stockStatus = getStockStatus(material.quantity, material.min_quantity);
                  return (
                    <tr key={material.id} style={{
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
                            {material.name}
                          </span>
                          {material.model && (
                            <span style={{
                              marginLeft: "8px",
                              padding: "2px 8px",
                              backgroundColor: "#e3f2fd",
                              color: "#1976d2",
                              borderRadius: "12px",
                              fontSize: "12px"
                            }}>
                              {material.model}
                            </span>
                          )}
                        </div>
                        <div style={{ color: "#666", fontSize: "13px" }}>
                          ID: {material.id} | 仓库: {material.warehouse_id}
                        </div>
                      </td>
                      
                      <td style={{ padding: "16px 12px", textAlign: "center" }}>
                        <div style={{
                          padding: "8px 12px",
                          borderRadius: "20px",
                          color: stockStatus.color,
                          backgroundColor: stockStatus.bgColor,
                          fontSize: "12px",
                          fontWeight: "500",
                          display: "inline-block"
                        }}>
                          {stockStatus.status}
                        </div>
                        <div style={{ marginTop: "8px", fontSize: "13px", color: "#666" }}>
                          <div>当前: {formatNumber(material.quantity)} {material.unit}</div>
                          <div>最小: {formatNumber(material.min_quantity)} {material.unit}</div>
                          {material.quantity > 0 && material.quantity < material.min_quantity && (
                            <div style={{ color: "#ff9800", fontWeight: "500" }}>
                              缺口: {formatNumber(material.min_quantity - material.quantity)} {material.unit}
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td style={{ padding: "16px 12px", textAlign: "center" }}>
                        <div style={{ marginBottom: "8px" }}>
                          <span style={{
                            padding: "4px 8px",
                            backgroundColor: "#f0f0f0",
                            borderRadius: "4px",
                            fontSize: "12px",
                            color: "#666"
                          }}>
                            单价: ¥{material.unit_price || "0.00"}
                          </span>
                        </div>
                        <div style={{ fontSize: "13px", color: "#666" }}>
                          {material.property && (
                            <div style={{ marginBottom: "4px" }}>
                              属性: {material.property}
                            </div>
                          )}
                        </div>
                      </td>
                      

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* 设计图纸表单 */}
      <DesignDrawingForm
        isOpen={showDesignForm}
        onClose={() => setShowDesignForm(false)}
        onSubmit={handleDesignDrawingSubmit}
      />
    </div>
  );
}

export default ProcessingDesignPage;
