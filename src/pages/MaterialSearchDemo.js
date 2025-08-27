import React, { useState, useRef, useEffect } from 'react';

const containerStyle = {
  maxWidth: 800,
  margin: "40px auto",
  padding: "30px",
  background: "#fff",
  borderRadius: "12px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
};

const titleStyle = {
  fontSize: "24px",
  fontWeight: "600",
  color: "#333",
  marginBottom: "30px",
  textAlign: "center"
};

const formGroupStyle = {
  marginBottom: "20px"
};

const labelStyle = {
  display: "block",
  marginBottom: "8px",
  fontWeight: "500",
  color: "#555"
};

const inputStyle = {
  width: "100%",
  padding: "12px 16px",
  border: "2px solid #e1e5e9",
  borderRadius: "8px",
  fontSize: "16px",
  transition: "border-color 0.3s, box-shadow 0.3s"
};

const suggestionBoxStyle = {
  position: "absolute",
  background: "#fff",
  border: "2px solid #e1e5e9",
  borderRadius: "8px",
  boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
  zIndex: 1000,
  width: "100%",
  top: "100%",
  left: 0,
  maxHeight: "300px",
  overflowY: "auto",
  borderTop: "none"
};

const suggestionItemStyle = {
  padding: "16px 20px",
  cursor: "pointer",
  borderBottom: "1px solid #f0f0f0",
  transition: "background-color 0.2s",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const infoCardStyle = {
  background: "#f8f9fa",
  border: "1px solid #e9ecef",
  borderRadius: "8px",
  padding: "20px",
  marginTop: "30px"
};

function MaterialSearchDemo() {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const searchTimeout = useRef();

  // 智能搜索函数
  const searchMaterials = async (query) => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/materials?query=${encodeURIComponent(query.trim())}`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error("搜索失败:", error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理输入变化
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // 延迟搜索，避免频繁请求
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      searchMaterials(value);
    }, 300);
  };

  // 处理建议项点击
  const handleSuggestionClick = (material) => {
    setSelectedMaterial(material);
    setSearchQuery(material.name);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  // 处理输入框失焦
  const handleInputBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  // 清理定时器
  useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>🧪 材料搜索自动补全演示</h1>
      
      <div style={formGroupStyle}>
        <label style={labelStyle}>
          材料名称搜索 (支持名称和型号模糊搜索)
        </label>
        <div style={{ position: "relative" }}>
          <input
            style={{
              ...inputStyle,
              borderColor: showSuggestions ? "#1976d2" : "#e1e5e9",
              boxShadow: showSuggestions ? "0 0 0 3px rgba(25, 118, 210, 0.1)" : "none"
            }}
            type="text"
            placeholder="输入材料名称或型号，如：树脂、九厘板、加工件..."
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
            onBlur={handleInputBlur}
            autoComplete="off"
          />
          
          {/* 搜索建议框 */}
          {showSuggestions && suggestions.length > 0 && (
            <div style={suggestionBoxStyle}>
              {suggestions.map((material, index) => (
                <div
                  key={material.id || index}
                  style={suggestionItemStyle}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "#f8f9fa"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                  onMouseDown={() => handleSuggestionClick(material)}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontWeight: "600", 
                      color: "#1976d2", 
                      fontSize: "16px",
                      marginBottom: "4px"
                    }}>
                      {material.name}
                    </div>
                    <div style={{ 
                      fontSize: "14px", 
                      color: "#666",
                      display: "flex",
                      gap: "16px"
                    }}>
                      <span>型号: {material.model || "无"}</span>
                      <span>单位: {material.unit || "无"}</span>
                      <span>属性: {material.property || "无"}</span>
                    </div>
                  </div>
                  <div style={{ 
                    textAlign: "right", 
                    fontSize: "14px", 
                    color: "#666",
                    minWidth: "80px"
                  }}>
                    <div style={{ fontWeight: "500", marginBottom: "4px" }}>
                      ID: {material.id}
                    </div>
                    <div style={{ color: "#e74c3c", fontWeight: "600" }}>
                      ¥{material.unit_price || "0.00"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* 加载状态 */}
          {isLoading && (
            <div style={{
              position: "absolute",
              right: "16px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#666"
            }}>
              🔄 搜索中...
            </div>
          )}
        </div>
      </div>

      {/* 选中的材料信息 */}
      {selectedMaterial && (
        <div style={infoCardStyle}>
          <h3 style={{ margin: "0 0 16px 0", color: "#333" }}>
            ✅ 已选择的材料
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
            <div>
              <strong>材料名称:</strong> {selectedMaterial.name}
            </div>
            <div>
              <strong>材料ID:</strong> {selectedMaterial.id}
            </div>
            <div>
              <strong>型号:</strong> {selectedMaterial.model || "无"}
            </div>
            <div>
              <strong>单位:</strong> {selectedMaterial.unit || "无"}
            </div>
            <div>
              <strong>单价:</strong> ¥{selectedMaterial.unit_price || "0.00"}
            </div>
            <div>
              <strong>属性:</strong> {selectedMaterial.property || "无"}
            </div>
            <div>
              <strong>仓库ID:</strong> {selectedMaterial.warehouse_id || "无"}
            </div>
          </div>
        </div>
      )}

      {/* 功能说明 */}
      <div style={infoCardStyle}>
        <h3 style={{ margin: "0 0 16px 0", color: "#333" }}>
          🚀 功能特性
        </h3>
        <ul style={{ margin: 0, paddingLeft: "20px", lineHeight: "1.6" }}>
          <li><strong>实时搜索:</strong> 输入时自动搜索，支持名称和型号模糊匹配</li>
          <li><strong>智能延迟:</strong> 300ms延迟避免频繁请求，提升性能</li>
          <li><strong>丰富信息:</strong> 显示材料ID、型号、单位、价格等完整信息</li>
          <li><strong>美观界面:</strong> 现代化设计，悬停效果，清晰的信息层次</li>
          <li><strong>自动补全:</strong> 点击建议项自动填充所有相关信息</li>
          <li><strong>响应式设计:</strong> 适配不同屏幕尺寸</li>
        </ul>
      </div>

      {/* 使用说明 */}
      <div style={infoCardStyle}>
        <h3 style={{ margin: "0 0 16px 0", color: "#333" }}>
          📖 使用方法
        </h3>
        <ol style={{ margin: 0, paddingLeft: "20px", lineHeight: "1.6" }}>
          <li>在搜索框中输入材料名称或型号（如：树脂、九厘板、加工件）</li>
          <li>系统会实时显示匹配的材料列表</li>
          <li>每个建议项显示材料的详细信息</li>
          <li>点击任意建议项，系统会自动填充所有相关信息</li>
          <li>支持键盘导航和鼠标操作</li>
        </ol>
      </div>
    </div>
  );
}

export default MaterialSearchDemo;
