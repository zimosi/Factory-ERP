import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

function DesignDrawingDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [drawing, setDrawing] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 获取设计图纸详情
  useEffect(() => {
    if (id) {
      fetchDrawingDetail();
    }
  }, [id]);

  const fetchDrawingDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/design-drawings/${id}`);
      if (response.ok) {
        const data = await response.json();
        setDrawing(data);
        setMaterials(data.materials || []);
        setProducts(data.products || []);
      } else {
        throw new Error("获取设计图纸详情失败");
      }
    } catch (error) {
      console.error("获取设计图纸详情失败:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("zh-CN");
  };

  // 格式化数字
  const formatNumber = (num) => {
    if (num === null || num === undefined) return "0";
    return Number(num).toLocaleString();
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
          onClick={fetchDrawingDetail}
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

  if (!drawing) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <div style={{ fontSize: "18px", color: "#666" }}>未找到设计图纸</div>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
      {/* 页面标题 */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h1 style={{ margin: 0, color: "#1976d2", fontSize: "28px" }}>
            📋 设计图纸详情
          </h1>
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={() => navigate("/processing-production")}
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
              返回列表
            </button>
            <button
              onClick={() => navigate("/")}
              style={{
                padding: "10px 20px",
                backgroundColor: "#1976d2",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500"
              }}
            >
              返回主页
            </button>
          </div>
        </div>
        <p style={{ margin: 0, color: "#666", fontSize: "16px" }}>
          查看设计图纸的详细信息和材料清单
        </p>
      </div>

      {/* 基本信息卡片 */}
      <div style={{
        background: "white",
        borderRadius: "12px",
        padding: "24px",
        marginBottom: "24px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
      }}>
        <h2 style={{ margin: "0 0 20px 0", color: "#333", fontSize: "20px" }}>
          📋 基本信息
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#666" }}>
              图纸编号
            </label>
            <div style={{ fontSize: "16px", color: "#1976d2", fontWeight: "600" }}>
              {drawing.drawing_no}
            </div>
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#666" }}>
              设计人
            </label>
            <div style={{ fontSize: "16px", color: "#333" }}>
              {drawing.designer}
            </div>
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#666" }}>
              创建时间
            </label>
            <div style={{ fontSize: "16px", color: "#333" }}>
              {formatDate(drawing.created_at)}
            </div>
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#666" }}>
              总材料成本
            </label>
            <div style={{ fontSize: "16px", color: "#f39c12", fontWeight: "600" }}>
              ¥{(Number(drawing.total_material_cost) || 0).toFixed(2)}
            </div>
          </div>
        </div>
        {drawing.remark && (
          <div style={{ marginTop: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#666" }}>
              备注
            </label>
            <div style={{ fontSize: "16px", color: "#333", padding: "12px", background: "#f8f9fa", borderRadius: "6px" }}>
              {drawing.remark}
            </div>
          </div>
        )}
      </div>

      {/* 统计概览 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "24px" }}>
        <div style={{
          background: "linear-gradient(135deg, #4caf50, #45a049)",
          padding: "20px",
          borderRadius: "12px",
          color: "white",
          textAlign: "center",
          boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)"
        }}>
          <div style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "8px" }}>
            {materials.length}
          </div>
          <div style={{ fontSize: "14px", opacity: 0.9 }}>材料种类</div>
        </div>
        
        <div style={{
          background: "linear-gradient(135deg, #2196f3, #1976d2)",
          padding: "20px",
          borderRadius: "12px",
          color: "white",
          textAlign: "center",
          boxShadow: "0 4px 12px rgba(33, 150, 243, 0.3)"
        }}>
          <div style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "8px" }}>
            {materials.reduce((sum, material) => sum + (Number(material.quantity) || 0), 0).toFixed(2)}
          </div>
          <div style={{ fontSize: "14px", opacity: 0.9 }}>材料总数量</div>
        </div>
        
        <div style={{
          background: "linear-gradient(135deg, #ff9800, #f57c00)",
          padding: "20px",
          borderRadius: "12px",
          color: "white",
          textAlign: "center",
          boxShadow: "0 4px 12px rgba(255, 152, 0, 0.3)"
        }}>
          <div style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "8px" }}>
            {products.length}
          </div>
          <div style={{ fontSize: "14px", opacity: 0.9 }}>加工件种类</div>
        </div>
        
        <div style={{
          background: "linear-gradient(135deg, #9c27b0, #7b1fa2)",
          padding: "20px",
          borderRadius: "12px",
          color: "white",
          textAlign: "center",
          boxShadow: "0 4px 12px rgba(156, 39, 176, 0.3)"
        }}>
          <div style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "8px" }}>
            {products.reduce((sum, product) => sum + (Number(product.quantity) || 0), 0)}
          </div>
          <div style={{ fontSize: "14px", opacity: 0.9 }}>加工件总数量</div>
        </div>
      </div>

      {/* 材料需求表格 */}
      <div style={{
        background: "white",
        borderRadius: "12px",
        padding: "24px",
        marginBottom: "24px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
      }}>
        <h2 style={{ margin: "0 0 20px 0", color: "#333", fontSize: "20px" }}>
          🔧 材料需求清单
        </h2>
        {materials.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
            <div style={{ fontSize: "16px" }}>暂无材料需求</div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8f9fa" }}>
                  <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #e0e0e0", fontWeight: "600" }}>
                    材料名称
                  </th>
                  <th style={{ padding: "12px", textAlign: "center", borderBottom: "1px solid #e0e0e0", fontWeight: "600" }}>
                    型号
                  </th>
                  <th style={{ padding: "12px", textAlign: "center", borderBottom: "1px solid #e0e0e0", fontWeight: "600" }}>
                    需求数量
                  </th>
                  <th style={{ padding: "12px", textAlign: "center", borderBottom: "1px solid #e0e0e0", fontWeight: "600" }}>
                    单位
                  </th>
                  <th style={{ padding: "12px", textAlign: "center", borderBottom: "1px solid #e0e0e0", fontWeight: "600" }}>
                    单价
                  </th>
                  <th style={{ padding: "12px", textAlign: "center", borderBottom: "1px solid #e0e0e0", fontWeight: "600" }}>
                    小计
                  </th>
                </tr>
              </thead>
              <tbody>
                {materials.map((material, index) => (
                  <tr key={material.id || index} style={{
                    borderBottom: "1px solid #f0f0f0",
                    transition: "background-color 0.2s"
                  }}
                  onMouseEnter={(e) => e.target.closest('tr').style.backgroundColor = "#f8f9fa"}
                  onMouseLeave={(e) => e.target.closest('tr').style.backgroundColor = "transparent"}
                  >
                    <td style={{ padding: "12px" }}>
                      <div style={{ fontWeight: "500", color: "#1976d2" }}>
                        {material.material_name}
                      </div>
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      {material.model || "-"}
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      <strong>{formatNumber(material.quantity)}</strong>
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      {material.unit || "-"}
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      ¥{(Number(material.unit_price) || 0).toFixed(2)}
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      <strong style={{ color: "#f39c12" }}>
                        ¥{(Number(material.subtotal) || 0).toFixed(2)}
                      </strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 加工件产出表格 */}
      <div style={{
        background: "white",
        borderRadius: "12px",
        padding: "24px",
        marginBottom: "24px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
      }}>
        <h2 style={{ margin: "0 0 20px 0", color: "#333", fontSize: "20px" }}>
          🎯 加工件产出清单
        </h2>
        {products.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
            <div style={{ fontSize: "16px" }}>暂无加工件产出</div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8f9fa" }}>
                  <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #e0e0e0", fontWeight: "600" }}>
                    加工件名称
                  </th>
                  <th style={{ padding: "12px", textAlign: "center", borderBottom: "1px solid #e0e0e0", fontWeight: "600" }}>
                    型号
                  </th>
                  <th style={{ padding: "12px", textAlign: "center", borderBottom: "1px solid #e0e0e0", fontWeight: "600" }}>
                    生产数量
                  </th>
                  <th style={{ padding: "12px", textAlign: "center", borderBottom: "1px solid #e0e0e0", fontWeight: "600" }}>
                    单位
                  </th>
                  <th style={{ padding: "12px", textAlign: "center", borderBottom: "1px solid #e0e0e0", fontWeight: "600" }}>
                    单价
                  </th>
                  <th style={{ padding: "12px", textAlign: "center", borderBottom: "1px solid #e0e0e0", fontWeight: "600" }}>
                    小计
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => (
                  <tr key={product.id || index} style={{
                    borderBottom: "1px solid #f0f0f0",
                    transition: "background-color 0.2s"
                  }}
                  onMouseEnter={(e) => e.target.closest('tr').style.backgroundColor = "#f8f9fa"}
                  onMouseLeave={(e) => e.target.closest('tr').style.backgroundColor = "transparent"}
                  >
                    <td style={{ padding: "12px" }}>
                      <div style={{ fontWeight: "500", color: "#ff9800" }}>
                        {product.product_name}
                      </div>
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      {product.model || "-"}
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      <strong>{formatNumber(product.quantity)}</strong>
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      {product.unit || "-"}
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      ¥{(Number(product.unit_price) || 0).toFixed(2)}
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      <strong style={{ color: "#ff9800" }}>
                        ¥{(Number(product.subtotal) || 0).toFixed(2)}
                      </strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
          onClick={() => navigate(`/processing-production/${id}/start`)}
          style={{
            padding: "14px 28px",
            backgroundColor: "#4caf50",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "500",
            transition: "background-color 0.2s"
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = "#45a049"}
          onMouseLeave={(e) => e.target.style.backgroundColor = "#4caf50"}
        >
          🚀 开始生产
        </button>
        
        <button
          onClick={() => navigate("/processing-production")}
          style={{
            padding: "14px 28px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "500"
          }}
        >
          返回列表
        </button>
      </div>
    </div>
  );
}

export default DesignDrawingDetailPage;
