import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '@/components/layouts/MainLayout';
import { InquiryProvider } from '@/contexts/InquiryContext';
import { ProcurementOrderProvider } from '@/contexts/ProcurementOrderContext';
import Dashboard from '@/pages/Dashboard';
import UserManagement from '@/pages/system/UserManagement';
import RoleManagement from '@/pages/system/RoleManagement';
import PermissionManagement from '@/pages/system/PermissionManagement';
import NotFound from '@/pages/NotFound';

// 采购管理模块
import ProcurementRequisition from '@/pages/procurement/ProcurementRequisition';
import ProcurementOrder from '@/pages/procurement/ProcurementOrder';
import ApprovalWorkflow from '@/pages/procurement/ApprovalWorkflow';
import QuotationComparison from '@/pages/procurement/QuotationComparison';
import WarehouseReceiving from '@/pages/procurement/WarehouseReceiving';
import DeliveryNotes from '@/pages/procurement/DeliveryNotes';

// 库存管理模块
import InventoryIn from '@/pages/inventory/InventoryIn';
import InventoryOut from '@/pages/inventory/InventoryOut';
import InventoryStock from '@/pages/inventory/InventoryStock';
import InventoryCheck from '@/pages/inventory/InventoryCheck';
import InventoryLedger from '@/pages/inventory/InventoryLedger';
import InventoryTransfer from '@/pages/inventory/InventoryTransfer';
import InventoryScrap from '@/pages/inventory/InventoryScrap';
import InventoryAlert from '@/pages/inventory/InventoryAlert';
import MobileScan from '@/pages/inventory/MobileScan';
import AgeAnalysis from '@/pages/inventory/AgeAnalysis';
import BatchManagement from '@/pages/inventory/BatchManagement';

// 固定资产管理模块
import AssetRegister from '@/pages/asset/AssetRegister';
import AssetTransfer from '@/pages/asset/AssetTransfer';
import AssetMaintenance from '@/pages/asset/AssetMaintenance';
import AssetRetirement from '@/pages/asset/AssetRetirement';
import AssetBorrow from '@/pages/asset/AssetBorrow';
import AssetInventory from '@/pages/asset/AssetInventory';
import AssetReport from '@/pages/asset/AssetReport';

// 基础信息管理模块
import WarehouseManagement from './pages/basic-info/Warehouse';
import SupplierManagement from './pages/basic-info/Supplier';
import EquipmentType from './pages/basic-info/EquipmentType';

function App() {
  return (
    <ProcurementOrderProvider>
      <InquiryProvider>
        <BrowserRouter>
        <Routes>
        {/* 直接访问主布局，无需登录验证 */}
        <Route 
          path="/" 
          element={<MainLayout />}
        >
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          
          {/* 采购管理路由 */}
          <Route path="procurement">
            <Route path="requisition" element={<ProcurementRequisition />} />
            <Route path="order" element={<ProcurementOrder />} />
            <Route path="approval-workflow" element={<ApprovalWorkflow />} />
            <Route path="quotation" element={<QuotationComparison />} />
            <Route path="delivery-notes" element={<DeliveryNotes />} />
            <Route path="receiving" element={<WarehouseReceiving />} />
          </Route>
          
          {/* 库存管理路由 */}
          <Route path="inventory">
            <Route path="in" element={<InventoryIn />} />
            <Route path="out" element={<InventoryOut />} />
            <Route path="stock" element={<InventoryStock />} />
            <Route path="check" element={<InventoryCheck />} />
            <Route path="ledger" element={<InventoryLedger />} />
            <Route path="transfer" element={<InventoryTransfer />} />
            <Route path="scrap" element={<InventoryScrap />} />
            <Route path="alert" element={<InventoryAlert />} />
            <Route path="mobile-scan" element={<MobileScan />} />
            <Route path="age-analysis" element={<AgeAnalysis />} />
            <Route path="batch-management" element={<BatchManagement />} />
          </Route>
          
          {/* 固定资产管理路由 */}
          <Route path="asset">
            <Route path="register" element={<AssetRegister />} />
            <Route path="transfer" element={<AssetTransfer />} />
            <Route path="maintenance" element={<AssetMaintenance />} />
            <Route path="retirement" element={<AssetRetirement />} />
            <Route path="borrow" element={<AssetBorrow />} />
            <Route path="inventory" element={<AssetInventory />} />
            <Route path="report" element={<AssetReport />} />
          </Route>

          {/* 基础信息管理路由 */}
          <Route path="/basic-info/warehouse" element={<WarehouseManagement />} />
          <Route path="/basic-info/supplier" element={<SupplierManagement />} />
          <Route path="/basic-info/equipment-type" element={<EquipmentType />} />
          
          {/* 系统管理路由 */}
          <Route path="system">
            <Route path="users" element={<UserManagement />} />
            <Route path="roles" element={<RoleManagement />} />
            <Route path="permissions" element={<PermissionManagement />} />
          </Route>
        </Route>
        
          {/* 404页面 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </BrowserRouter>
      </InquiryProvider>
    </ProcurementOrderProvider>
  );
}

export default App;
