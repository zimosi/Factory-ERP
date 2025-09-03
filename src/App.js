import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import SaleOrdersPage from "./pages/SaleOrdersPage";
import ProductionOrdersPage from "./pages/ProductionOrdersPage";
import ProductTypesPage from "./pages/ProductTypesPage";
import PurchaseOrdersPage from "./pages/PurchaseOrdersPage";
import InventoryCheckPage from "./pages/InventoryCheckPage";
import AddInventoryPage from "./pages/AddInventoryPage";
import PurchaseOrderArrivalPage from "./pages/PurchaseOrderArrivalPage";
import ProductReportPage from "./pages/ProductReportPage";
import ProductionPickOrdersPage from "./pages/ProductionPickOrdersPage";
import InventoryManagementPage from "./pages/InventoryManagementPage";
import ApprovalPage from "./pages/ApprovalPage";
import InventoryRecordsPage from "./pages/InventoryRecordsPage";
import RepairOrdersPage from "./pages/RepairOrdersPage";
import RepairOrderDetailPage from "./pages/RepairOrderDetailPage";
import RequireAuth from "./components/RequireAuth";
import MaterialSaleOrdersPage from "./pages/MaterialSaleOrdersPage";
import ReturnOrdersPage from "./pages/ReturnOrdersPage";
import PurchaseApprovalPage from "./pages/PurchaseApprovalPage";
import ReturnApprovalPage from "./pages/ReturnApprovalPage";
import DesignOrdersPage from "./pages/DesignOrdersPage";
import ProcessingDesignPage from "./pages/ProcessingDesignPage";
import ProcessingProductionPage from "./pages/ProcessingProductionPage";
import DesignDrawingDetailPage from "./pages/DesignDrawingDetailPage";
import MaterialSearchDemo from "./pages/MaterialSearchDemo";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <HomePage />
            </RequireAuth>
          }
        />
        <Route
          path="/sale-orders"
          element={
            <RequireAuth>
              <SaleOrdersPage />
            </RequireAuth>
          }
        />
        <Route
          path="/production-orders"
          element={
            <RequireAuth>
              <ProductionOrdersPage />
            </RequireAuth>
          }
        />
        <Route
          path="/production-orders/:id"
          element={
            <RequireAuth>
              <ProductionOrdersPage />
            </RequireAuth>
          }
        />
        <Route
          path="/product-types"
          element={
            <RequireAuth>
              <ProductTypesPage />
            </RequireAuth>
          }
        />
        <Route
          path="/purchase-orders"
          element={
            <RequireAuth>
              <PurchaseOrdersPage />
            </RequireAuth>
          }
        />
        <Route
          path="/inventory-check"
          element={
            <RequireAuth>
              <InventoryCheckPage />
            </RequireAuth>
          }
        />
        <Route
          path="/add-inventory"
          element={
            <RequireAuth>
              <AddInventoryPage />
            </RequireAuth>
          }
        />
        <Route
          path="/purchase-order-arrival"
          element={
            <RequireAuth>
              <PurchaseOrderArrivalPage />
            </RequireAuth>
          }
        />
        <Route
          path="/product-report"
          element={
            <RequireAuth>
              <ProductReportPage />
            </RequireAuth>
          }
        />
        <Route
          path="/production-pick-orders"
          element={
            <RequireAuth>
              <ProductionPickOrdersPage />
            </RequireAuth>
          }
        />
        <Route
          path="/inventory-management"
          element={
            <RequireAuth>
              <InventoryManagementPage />
            </RequireAuth>
          }
        >
          <Route path="purchase-arrival" element={<PurchaseOrderArrivalPage embedded />} />
          <Route path="inventory-check" element={<InventoryCheckPage embedded />} />
          <Route path="pick-orders" element={<ProductionPickOrdersPage embedded />} />
          <Route path="inventory-records" element={<InventoryRecordsPage />} />
          <Route path="return-orders" element={<ReturnOrdersPage />} />
        </Route>
        <Route
          path="/inventory-records"
          element={<Navigate to="/inventory-management/inventory-records" replace />} 
        />
        <Route
          path="/approval"
          element={
            <RequireAuth>
              <ApprovalPage />
            </RequireAuth>
          }
        >
          <Route path="purchase-approval" element={<PurchaseApprovalPage />} />
          <Route path="return-approval" element={<ReturnApprovalPage />} />
        </Route>
        <Route
          path="/repair-orders"
          element={
            <RequireAuth>
              <RepairOrdersPage />
            </RequireAuth>
          }
        >
          <Route path=":afterSalesOrderId" element={<RepairOrderDetailPage />} />
          <Route index element={<div style={{color:'#888',fontSize:18,padding:40}}>请选择左侧工单</div>} />
        </Route>
        <Route
          path="/material-sale-orders"
          element={
            <RequireAuth>
              <MaterialSaleOrdersPage />
            </RequireAuth>
          }
        />
        <Route
          path="/design-orders"
          element={
            <RequireAuth>
              <DesignOrdersPage />
            </RequireAuth>
          }
        >
          <Route index element={<div style={{color:'#888',fontSize:18,padding:40}}>请选择左侧菜单</div>} />
          <Route path="processing-design" element={<ProcessingDesignPage />} />
        </Route>
        <Route
          path="/material-search-demo"
          element={
            <RequireAuth>
              <MaterialSearchDemo />
            </RequireAuth>
          }
        />
        <Route
          path="/processing-production"
          element={
            <RequireAuth>
              <ProcessingProductionPage />
            </RequireAuth>
          }
        />
        <Route
          path="/design-drawings/:id"
          element={
            <RequireAuth>
              <DesignDrawingDetailPage />
            </RequireAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;