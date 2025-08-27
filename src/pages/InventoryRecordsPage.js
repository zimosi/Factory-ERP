import React, { useEffect, useState } from "react";

function InventoryRecordsPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  // 搜索条件
  const [searchWhat, setSearchWhat] = useState("");
  const [searchType, setSearchType] = useState("");
  const [searchName, setSearchName] = useState("");

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    const res = await fetch("/api/inventory-records");
    const data = await res.json();
    setRecords(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  // 过滤
  const filteredRecords = records.filter(r =>
    (!searchWhat || r.what === searchWhat) &&
    (!searchType || r.type === searchType) &&
    (!searchName || (r.material_name && r.material_name.includes(searchName)))
  );

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", background: "#fff", borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", padding: 32 }}>
      <h2>出入库记录</h2>
      {/* 搜索区 */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <select value={searchWhat} onChange={e => setSearchWhat(e.target.value)} style={{ padding: 8 }}>
          <option value="">全部类型</option>
          <option value="生产">生产</option>
          <option value="售后">售后</option>
          {/* 可根据实际类型扩展 */}
        </select>
        <select value={searchType} onChange={e => setSearchType(e.target.value)} style={{ padding: 8 }}>
          <option value="">全部出入库</option>
          <option value="in">入库</option>
          <option value="out">出库</option>
        </select>
        <input
          style={{ padding: 8, width: 180 }}
          placeholder="材料名称"
          value={searchName}
          onChange={e => setSearchName(e.target.value)}
        />
        <button onClick={() => { setSearchWhat(""); setSearchType(""); setSearchName(""); }}>重置</button>
      </div>
      {loading ? <div>加载中...</div> : filteredRecords.length === 0 ? <div style={{ color: '#888', textAlign: 'center' }}>暂无出入库记录</div> : (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 32 }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>材料名称</th>
              <th>类型</th>
              <th>出入</th>
              <th>数量</th>
              <th>单位</th>
              <th>操作人</th>
              <th>关联单据</th>
              <th>备注</th>
              <th>时间</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map(r => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.material_name}</td>
                <td>{r.what || '-'}</td>
                <td>{r.type === 'in' ? '入库' : '出库'}</td>
                <td>{r.quantity}</td>
                <td>{r.unit}</td>
                <td>{r.operator || '-'}</td>
                <td>{r.related_order_id || '-'}</td>
                <td>{r.remark || '-'}</td>
                <td>{r.created_at && r.created_at.replace('T', ' ').slice(0, 19)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default InventoryRecordsPage; 