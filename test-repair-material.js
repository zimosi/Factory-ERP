console.log("🧪 维修工单材料选择功能测试");

// 模拟材料数据
const mockMaterials = [
  {
    id: 1,
    name: "树脂",
    model: "标准型",
    unit: "桶",
    unit_price: "10.00",
    warehouse_id: 1,
    property: "原材料"
  },
  {
    id: 2,
    name: "树脂",
    model: "高强型",
    unit: "桶",
    unit_price: "15.00",
    warehouse_id: 1,
    property: "原材料"
  }
];

// 测试材料选择函数
const handleMaterialSelect = (material) => {
  console.log("✅ 选择材料:", material);
  
  // 模拟设置状态
  const searchName = material.name;
  const selectedMaterial = material;
  const model = material.model || "";
  const unit = material.unit || "";
  
  console.log("📝 设置状态:");
  console.log("- 材料名称:", searchName);
  console.log("- 型号:", model);
  console.log("- 单位:", unit);
  console.log("- 单价:", material.unit_price);
  
  return { searchName, selectedMaterial, model, unit };
};

// 测试
console.log("\n🔍 测试材料选择:");
mockMaterials.forEach((material, index) => {
  console.log(`\n测试 ${index + 1}:`);
  const result = handleMaterialSelect(material);
  console.log("结果:", result);
});

console.log("\n✅ 测试完成！");
