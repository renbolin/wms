// 库存管理相关类型定义

// 通用状态类型
export type InventoryStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'completed';

// 入库相关类型
export interface InboundOrder {
  id: string;
  inboundNo: string;
  type: 'purchase' | 'transfer';
  typeText: string;
  warehouse: string;
  warehouseName: string;
  supplier?: string;
  supplierName?: string;
  sourceWarehouse?: string; // 调拨入库时的来源仓库
  sourceWarehouseName?: string;
  purchaseOrderNo?: string; // 采购单号
  applicant: string;
  department: string;
  applyDate: string;
  inboundDate: string;
  status: InventoryStatus;
  statusText: string;
  totalItems: number;
  totalQuantity: number;
  totalAmount: number;
  operator?: string;
  operateDate?: string;
  approver?: string;
  approveDate?: string;
  purpose: string;
  remarks: string;
  items: InboundItem[];
}

export interface InboundItem {
  id: string;
  itemCode: string;
  itemName: string;
  specification: string;
  unit: string;
  plannedQuantity: number;
  actualQuantity: number;
  unitPrice: number;
  totalAmount: number;
  batchNo?: string;
  productionDate?: string;
  expiryDate?: string;
  remarks: string;
}

// 出库相关类型
export interface OutboundOrder {
  id: string;
  outboundNo: string;
  type: 'material' | 'transfer';
  typeText: string;
  warehouse: string;
  warehouseName: string;
  applicant: string;
  department: string;
  applyDate: string;
  outboundDate: string;
  status: InventoryStatus;
  statusText: string;
  totalItems: number;
  totalQuantity: number;
  totalAmount: number;
  operator?: string;
  operateDate?: string;
  approver?: string;
  approveDate?: string;
  purpose: string;
  targetWarehouse?: string; // 调拨出库时的目标仓库
  targetWarehouseName?: string;
  remarks: string;
  items: OutboundItem[];
}

export interface OutboundItem {
  id: string;
  itemCode: string;
  itemName: string;
  specification: string;
  unit: string;
  requestQuantity: number;
  approvedQuantity: number;
  actualQuantity: number;
  unitPrice: number;
  totalAmount: number;
  currentStock: number;
  batchNo?: string;
  remarks: string;
}

// 调拨相关类型
export interface TransferOrder {
  id: string;
  transferNo: string;
  fromWarehouse: string;
  fromWarehouseName: string;
  toWarehouse: string;
  toWarehouseName: string;
  applicant: string;
  department: string;
  applyDate: string;
  transferDate: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'transferred' | 'received';
  statusText: string;
  totalItems: number;
  totalQuantity: number;
  totalAmount: number;
  approver?: string;
  approveDate?: string;
  transferer?: string;
  receiver?: string;
  receiveDate?: string;
  purpose: string;
  remarks: string;
  items: TransferItem[];
}

export interface TransferItem {
  id: string;
  itemCode: string;
  itemName: string;
  specification: string;
  unit: string;
  requestQuantity: number;
  transferQuantity: number;
  receiveQuantity: number;
  unitPrice: number;
  totalAmount: number;
  currentStock: number;
  batchNo?: string;
  remarks: string;
}

// 库存相关类型
export interface InventoryItem {
  id: string;
  itemCode: string;
  itemName: string;
  specification: string;
  category: string;
  categoryName: string;
  unit: string;
  warehouse: string;
  warehouseName: string;
  location?: string; // 库位
  currentStock: number;
  availableStock: number; // 可用库存
  reservedStock: number; // 预留库存
  minStock: number; // 最小库存
  maxStock: number; // 最大库存
  unitPrice: number;
  totalAmount: number;
  batchNo?: string;
  productionDate?: string;
  expiryDate?: string;
  supplier?: string;
  supplierName?: string;
  lastInboundDate?: string;
  lastOutboundDate?: string;
  status: 'normal' | 'shortage' | 'excess' | 'expired' | 'near_expiry';
  statusText: string;
  remarks: string;
}

// 库存记录类型
export interface InventoryRecord {
  id: string;
  recordNo: string;
  type: 'inbound' | 'outbound' | 'transfer_out' | 'transfer_in' | 'adjustment';
  typeText: string;
  itemCode: string;
  itemName: string;
  specification: string;
  warehouse: string;
  warehouseName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  beforeStock: number;
  afterStock: number;
  batchNo?: string;
  relatedOrderNo?: string; // 关联单据号
  operator: string;
  operateDate: string;
  remarks: string;
}

// 仓库类型
export interface Warehouse {
  id: string;
  warehouseCode: string;
  warehouseName: string;
  type: 'main' | 'branch' | 'temporary';
  typeText: string;
  address: string;
  manager: string;
  contact: string;
  capacity: number;
  currentUsage: number;
  usageRate: number;
  status: 'active' | 'inactive' | 'maintenance';
  statusText: string;
  description: string;
  createDate: string;
}

// 物料类别类型
export interface ItemCategory {
  id: string;
  categoryCode: string;
  categoryName: string;
  parentId?: string;
  parentName?: string;
  level: number;
  sort: number;
  description: string;
  status: 'active' | 'inactive';
  statusText: string;
  createDate: string;
}

// 供应商类型
export interface Supplier {
  id: string;
  supplierCode: string;
  supplierName: string;
  type: 'manufacturer' | 'distributor' | 'service';
  typeText: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  creditLevel: 'A' | 'B' | 'C' | 'D';
  status: 'active' | 'inactive' | 'blacklist';
  statusText: string;
  description: string;
  createDate: string;
}

// 搜索条件类型
export interface InboundSearchParams {
  inboundNo?: string;
  type?: 'purchase' | 'transfer';
  status?: InventoryStatus;
  warehouse?: string;
  supplier?: string;
  department?: string;
  dateRange?: [string, string];
}

export interface OutboundSearchParams {
  outboundNo?: string;
  type?: 'material' | 'transfer';
  status?: InventoryStatus;
  warehouse?: string;
  department?: string;
  dateRange?: [string, string];
}

export interface TransferSearchParams {
  transferNo?: string;
  fromWarehouse?: string;
  toWarehouse?: string;
  status?: 'draft' | 'pending' | 'approved' | 'rejected' | 'transferred' | 'received';
  dateRange?: [string, string];
}

export interface InventorySearchParams {
  itemCode?: string;
  itemName?: string;
  category?: string;
  warehouse?: string;
  status?: 'normal' | 'shortage' | 'excess' | 'expired' | 'near_expiry';
  stockRange?: [number, number];
}

// 表单数据类型
export interface InboundFormData {
  type: 'purchase' | 'transfer';
  warehouse: string;
  warehouseName: string;
  supplier?: string;
  supplierName?: string;
  sourceWarehouse?: string;
  sourceWarehouseName?: string;
  purchaseOrderNo?: string;
  applicant: string;
  department: string;
  applyDate: string;
  inboundDate: string;
  purpose: string;
  totalItems?: number;
  totalQuantity?: number;
  totalAmount?: number;
  remarks?: string;
}

export interface OutboundFormData {
  type: 'material' | 'transfer';
  warehouse: string;
  warehouseName: string;
  applicant: string;
  department: string;
  applyDate: string;
  outboundDate: string;
  purpose: string;
  targetWarehouse?: string;
  targetWarehouseName?: string;
  totalItems?: number;
  totalQuantity?: number;
  totalAmount?: number;
  remarks?: string;
}

export interface TransferFormData {
  fromWarehouse: string;
  fromWarehouseName: string;
  toWarehouse: string;
  toWarehouseName: string;
  applicant: string;
  department: string;
  applyDate: string;
  transferDate?: string;
  purpose: string;
  totalItems?: number;
  totalQuantity?: number;
  totalAmount?: number;
  remarks?: string;
}

// API 响应类型
export interface InventoryApiResponse<T> {
  code: number;
  message: string;
  data: T;
  total?: number;
}

export interface PaginationParams {
  current: number;
  pageSize: number;
  total?: number;
}

// 统计数据类型
export interface InventoryStatistics {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  expiredItems: number;
  nearExpiryItems: number;
  inboundToday: number;
  outboundToday: number;
  transferToday: number;
}

export interface WarehouseStatistics {
  warehouseId: string;
  warehouseName: string;
  totalItems: number;
  totalValue: number;
  capacity: number;
  currentUsage: number;
  usageRate: number;
  inboundThisMonth: number;
  outboundThisMonth: number;
}