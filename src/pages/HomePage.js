import React from "react";
import { useNavigate } from "react-router-dom";

const containerStyle = {
  minHeight: "100vh",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  padding: "20px",
  position: "relative"
};

const headerStyle = {
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(10px)",
  borderRadius: "20px",
  padding: "30px 40px",
  marginBottom: "30px",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  textAlign: "center"
};

const titleStyle = {
  fontSize: "2.5rem",
  fontWeight: "700",
  color: "#2c3e50",
  margin: "0 0 10px 0",
  background: "linear-gradient(135deg, #667eea, #764ba2)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text"
};

const subtitleStyle = {
  fontSize: "1.1rem",
  color: "#7f8c8d",
  margin: "0 0 20px 0"
};

const userInfoStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  padding: "12px 24px",
  background: "linear-gradient(135deg, #667eea, #764ba2)",
  color: "white",
  borderRadius: "25px",
  fontSize: "1rem",
  fontWeight: "500",
  boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)"
};

const logoutBtnStyle = {
  position: "absolute",
  top: "30px",
  right: "40px",
  padding: "12px 24px",
  borderRadius: "25px",
  border: "none",
  background: "linear-gradient(135deg, #e74c3c, #c0392b)",
  color: "#fff",
  fontWeight: "600",
  fontSize: "0.9rem",
  cursor: "pointer",
  boxShadow: "0 4px 15px rgba(231, 76, 60, 0.4)",
  transition: "all 0.3s ease",
  zIndex: 10
};

const gridContainerStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: "25px",
  maxWidth: "1400px",
  margin: "0 auto"
};

const cardStyle = {
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(10px)",
  borderRadius: "20px",
  padding: "30px",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  transition: "all 0.3s ease",
  position: "relative",
  overflow: "hidden"
};

const cardHeaderStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginBottom: "25px",
  paddingBottom: "15px",
  borderBottom: "2px solid #ecf0f1"
};

const cardIconStyle = {
  width: "40px",
  height: "40px",
  borderRadius: "12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "20px",
  color: "white",
  fontWeight: "bold"
};

const cardTitleStyle = {
  fontSize: "1.4rem",
  fontWeight: "600",
  color: "#2c3e50",
  margin: 0
};

const buttonContainerStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "12px"
};

const buttonStyle = (color) => ({
  padding: "14px 20px",
  borderRadius: "12px",
  border: "none",
  background: `linear-gradient(135deg, ${color}, ${color}dd)`,
  color: "#fff",
  fontWeight: "600",
  fontSize: "0.95rem",
  cursor: "pointer",
  transition: "all 0.3s ease",
  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
  position: "relative",
  overflow: "hidden"
});

const buttonHoverStyle = {
  transform: "translateY(-2px)",
  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)"
};

const statsContainerStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "20px",
  marginBottom: "30px"
};

const statCardStyle = {
  background: "rgba(255, 255, 255, 0.9)",
  borderRadius: "15px",
  padding: "20px",
  textAlign: "center",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)"
};

const statNumberStyle = {
  fontSize: "2rem",
  fontWeight: "700",
  color: "#667eea",
  margin: "0 0 5px 0"
};

const statLabelStyle = {
  fontSize: "0.9rem",
  color: "#7f8c8d",
  margin: 0
};

function HomePage() {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleButtonClick = (path) => {
    navigate(path);
  };

  return (
    <div style={containerStyle}>
      <button style={logoutBtnStyle} onClick={handleLogout}>
        🚪 退出登录
      </button>
      
      <div style={headerStyle}>
        <h1 style={titleStyle}>LAWADA 企业资源管理系统</h1>
        <p style={subtitleStyle}>Enterprise Resource Planning System</p>
        <div style={userInfoStyle}>
          👤 当前用户：<strong>{user?.username || "未知用户"}</strong>
        </div>
      </div>

      <div style={statsContainerStyle}>
        <div style={statCardStyle}>
          <div style={statNumberStyle}>12</div>
          <div style={statLabelStyle}>活跃订单</div>
        </div>
        <div style={statCardStyle}>
          <div style={statNumberStyle}>156</div>
          <div style={statLabelStyle}>库存项目</div>
        </div>
        <div style={statCardStyle}>
          <div style={statNumberStyle}>8</div>
          <div style={statLabelStyle}>待审批</div>
        </div>
        <div style={statCardStyle}>
          <div style={statNumberStyle}>24</div>
          <div style={statLabelStyle}>生产任务</div>
        </div>
      </div>

      <div style={gridContainerStyle}>
        {/* 销售管理模块 */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <div style={{...cardIconStyle, background: "linear-gradient(135deg, #3498db, #2980b9)"}}>
              💰
            </div>
            <h3 style={cardTitleStyle}>销售管理</h3>
          </div>
          <div style={buttonContainerStyle}>
            <button 
              style={buttonStyle("#3498db")} 
              onClick={() => handleButtonClick("/sale-orders")}
              onMouseEnter={(e) => Object.assign(e.target.style, buttonHoverStyle)}
              onMouseLeave={(e) => Object.assign(e.target.style, buttonStyle("#3498db"))}
            >
              📋 销售订单管理
            </button>
            <button 
              style={buttonStyle("#2980b9")} 
              onClick={() => handleButtonClick("/material-sale-orders")}
              onMouseEnter={(e) => Object.assign(e.target.style, buttonHoverStyle)}
              onMouseLeave={(e) => Object.assign(e.target.style, buttonStyle("#2980b9"))}
            >
              🧱 材料销售订单
            </button>
          </div>
        </div>

        {/* 采购管理模块 */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <div style={{...cardIconStyle, background: "linear-gradient(135deg, #27ae60, #229954)"}}>
              🛒
            </div>
            <h3 style={cardTitleStyle}>采购管理</h3>
          </div>
          <div style={buttonContainerStyle}>
            <button 
              style={buttonStyle("#27ae60")} 
              onClick={() => handleButtonClick("/purchase-orders")}
              onMouseEnter={(e) => Object.assign(e.target.style, buttonHoverStyle)}
              onMouseLeave={(e) => Object.assign(e.target.style, buttonStyle("#27ae60"))}
            >
              📦 采购订单管理
            </button>
          </div>
        </div>

        {/* 设计管理模块 */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <div style={{...cardIconStyle, background: "linear-gradient(135deg, #9b59b6, #8e44ad)"}}>
              ✏️
            </div>
            <h3 style={cardTitleStyle}>设计管理</h3>
          </div>
          <div style={buttonContainerStyle}>
            <button 
              style={buttonStyle("#9b59b6")} 
              onClick={() => handleButtonClick("/design-orders")}
              onMouseEnter={(e) => Object.assign(e.target.style, buttonHoverStyle)}
              onMouseLeave={(e) => Object.assign(e.target.style, buttonStyle("#9b59b6"))}
            >
              🎨 设计订单管理
            </button>
            <button 
              style={buttonStyle("#8e44ad")} 
              onClick={() => handleButtonClick("/banzheng")}
              onMouseEnter={(e) => Object.assign(e.target.style, buttonHoverStyle)}
              onMouseLeave={(e) => Object.assign(e.target.style, buttonStyle("#8e44ad"))}
            >
              📄 办证管理
            </button>
          </div>
        </div>

        {/* 生产管理模块 */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <div style={{...cardIconStyle, background: "linear-gradient(135deg, #e67e22, #d35400)"}}>
              ⚙️
            </div>
            <h3 style={cardTitleStyle}>生产管理</h3>
          </div>
          <div style={buttonContainerStyle}>
            <button 
              style={buttonStyle("#e67e22")} 
              onClick={() => handleButtonClick("/production-orders")}
              onMouseEnter={(e) => Object.assign(e.target.style, buttonHoverStyle)}
              onMouseLeave={(e) => Object.assign(e.target.style, buttonStyle("#e67e22"))}
            >
              🏭 生产订单管理
            </button>
            <button 
              style={buttonStyle("#d35400")} 
              onClick={() => handleButtonClick("/product-report")}
              onMouseEnter={(e) => Object.assign(e.target.style, buttonHoverStyle)}
              onMouseLeave={(e) => Object.assign(e.target.style, buttonStyle("#d35400"))}
            >
              📊 产品报目单
            </button>

          </div>
        </div>

        {/* 库存管理模块 */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <div style={{...cardIconStyle, background: "linear-gradient(135deg, #f39c12, #e67e22)"}}>
              📦
            </div>
            <h3 style={cardTitleStyle}>库存管理</h3>
          </div>
          <div style={buttonContainerStyle}>
            <button 
              style={buttonStyle("#f39c12")} 
              onClick={() => handleButtonClick("/inventory-management")}
              onMouseEnter={(e) => Object.assign(e.target.style, buttonHoverStyle)}
              onMouseLeave={(e) => Object.assign(e.target.style, buttonStyle("#f39c12"))}
            >
              🏪 库存管理系统
            </button>
            <button 
              style={buttonStyle("#e67e22")} 
              onClick={() => handleButtonClick("/material-search-demo")}
              onMouseEnter={(e) => Object.assign(e.target.style, buttonHoverStyle)}
              onMouseLeave={(e) => Object.assign(e.target.style, buttonStyle("#e67e22"))}
            >
              🧪 材料搜索演示
            </button>
          </div>
        </div>

        {/* 系统管理模块 */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <div style={{...cardIconStyle, background: "linear-gradient(135deg, #34495e, #2c3e50)"}}>
              ⚙️
            </div>
            <h3 style={cardTitleStyle}>系统管理</h3>
          </div>
          <div style={buttonContainerStyle}>
            <button 
              style={buttonStyle("#34495e")} 
              onClick={() => handleButtonClick("/approval")}
              onMouseEnter={(e) => Object.assign(e.target.style, buttonHoverStyle)}
              onMouseLeave={(e) => Object.assign(e.target.style, buttonStyle("#34495e"))}
            >
              ✅ 审批管理
            </button>
            <button 
              style={buttonStyle("#2c3e50")} 
              onClick={() => handleButtonClick("/permission-management")}
              onMouseEnter={(e) => Object.assign(e.target.style, buttonHoverStyle)}
              onMouseLeave={(e) => Object.assign(e.target.style, buttonStyle("#2c3e50"))}
            >
              🔐 权限管理
            </button>
          </div>
        </div>

        {/* 维修管理模块 */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <div style={{...cardIconStyle, background: "linear-gradient(135deg, #e74c3c, #c0392b)"}}>
              🔧
            </div>
            <h3 style={cardTitleStyle}>维修管理</h3>
          </div>
          <div style={buttonContainerStyle}>
            <button 
              style={buttonStyle("#e74c3c")} 
              onClick={() => handleButtonClick("/repair-orders")}
              onMouseEnter={(e) => Object.assign(e.target.style, buttonHoverStyle)}
              onMouseLeave={(e) => Object.assign(e.target.style, buttonStyle("#e74c3c"))}
            >
              🛠️ 维修工单管理
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;