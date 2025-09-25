// 采购相关的数据类型定义

// 采购申请相关类型
export interface ProcurementApplication {
  id: string;
  applicationNo: string;
  title: string;
  applicant: string;
  applicantId: string;
  department: string;
  applicationDate: string;
  requiredDate: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'urgent';
  reason: string;
  items: ProcurementApplicationItem[];
  totalEstimatedAmount: number;
  status: 'draft' | 'submitted' | 'reviewing' | 'approved' | 'rejected' | 'cancelled' | 'completed';
  approvalHistory: ApprovalRecord[];
  attachments: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // 扩展属性以支持采购申请页面
  requisitionNumber?: string;
  description?: string;
  totalAmount?: number;
  type?: string;
  approvalStatus?: string;
  processStatus?: string;
  currentApprover?: string;
  rejectionReason?: string;
  rejectedBy?: string;
  rejectedDate?: string;
  inquiryStatus?: 'not_started' | '未开始' | 'in_progress' | '询价中' | 'completed' | '已完成' | '已报价';
}

export interface ProcurementApplicationItem {
  id: string;
  itemName: string;
  description: string;
  category: string;
  specifications: string;
  quantity: number;
  unit: string;
  estimatedUnitPrice: number;
  estimatedTotalPrice: number;
  suggestedSuppliers: string[];
  purpose: string;
  remarks?: string;
}

export interface ApprovalRecord {
  id: string;
  approver: string;
  approverId: string;
  approverRole: string;
  action: 'approve' | 'reject' | 'return';
  comments: string;
  timestamp: string;
  level: number;
}

export interface ProcurementOrder {
  id: string;
  orderNumber: string;
  supplierName: string;
  supplierId: string;
  items: ProcurementItem[];
  totalAmount: number;
  status: 'pending' | 'approved' | 'ordered' | 'received' | 'completed' | 'cancelled';
  createdDate: string;
  expectedDelivery: string;
  actualDelivery?: string;
  approvedBy?: string;
  notes?: string;
  // 新增字段 - 完善数据关联
  applicationId?: string;        // 关联的采购申请ID
  inquiryId?: string;           // 关联的询价单ID
  quotationId?: string;         // 选中的报价ID
  quotationComparison?: QuotationComparisonResult; // 比价结果
  contractNo?: string;          // 合同编号
  // 询价相关信息
  quotationRequestNo?: string;  // 询价单号
  selectedQuotationDetails?: {  // 选中报价详情
    supplierId: string;
    supplierName: string;
    quotationDate: string;
    validUntil: string;
    totalAmount: number;
    items: QuotationItemPrice[];
  };
}

export interface ProcurementItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category: string;
  specifications?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  category: string;
  rating: number;
  totalOrders: number;
  totalAmount: number;
  status: 'active' | 'inactive' | 'blacklisted';
  registrationDate: string;
  lastOrderDate?: string;
}

export interface ProcurementStats {
  totalOrders: number;
  totalAmount: number;
  pendingOrders: number;
  completedOrders: number;
  monthlyGrowth: number;
  averageOrderValue: number;
  topSuppliers: Array<{
    name: string;
    amount: number;
    orders: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
}

export interface ProcurementNotification {
  id: string;
  type: 'approval_needed' | 'delivery_delayed' | 'order_completed' | 'supplier_issue';
  title: string;
  description: string;
  orderId?: string;
  supplierId?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: string;
  isRead: boolean;
}

// 比价结果类型
export interface QuotationComparisonResult {
  id: string;
  inquiryId: string;
  comparisonDate: string;
  comparedQuotations: string[]; // 参与比价的报价ID列表
  selectedQuotationId: string;  // 选中的报价ID
  comparisonCriteria: {
    price: number;              // 价格权重
    quality: number;            // 质量权重
    delivery: number;           // 交期权重
    service: number;            // 服务权重
  };
  comparisonResults: QuotationScore[];
  approver: string;
  approvalDate: string;
  remarks?: string;
}

// 报价评分
export interface QuotationScore {
  quotationId: string;
  supplierName: string;
  totalScore: number;
  priceScore: number;
  qualityScore: number;
  deliveryScore: number;
  serviceScore: number;
  ranking: number;
}

// 询价项目价格
export interface QuotationItemPrice {
  itemId: string;
  unitPrice: number;
  totalPrice: number;
  deliveryTime: string;
  remarks?: string;
}

// 到货单相关类型定义
export interface DeliveryNote {
  id: string;
  deliveryNo: string;
  purchaseOrderNo: string;
  purchaseOrderId: string;         // 新增：采购订单ID
  supplierName: string;
  supplierId: string;              // 新增：供应商ID
  supplierContact: string;
  supplierPhone: string;
  deliveryDate: string;
  receivedDate?: string;
  receiver?: string;
  department?: string;
  status: 'pending' | 'received' | 'partial' | 'completed' | 'rejected';
  statusText: string;
  totalAmount: number;
  items: DeliveryItem[];
  orderItems?: ProcurementItem[];  // 新增：订单明细对比
  attachments: string[];
  remarks: string;
  transportInfo?: TransportInfo;
  qualityCheckRequired?: boolean;  // 新增：是否需要质量检查
  qualityCheckStatus?: 'pending' | 'passed' | 'failed' | 'waived'; // 新增：质量检查状态
}

export interface DeliveryItem {
  id: string;
  itemName: string;
  specification: string;
  unit: string;
  orderedQuantity: number;
  deliveredQuantity: number;
  receivedQuantity: number;
  unitPrice: number;
  totalPrice: number;
  remarks: string;
  batchNo?: string;
  expiryDate?: string;
}

export interface TransportInfo {
  carrier: string;
  trackingNo: string;
  vehicleNo: string;
  driverName: string;
  driverPhone: string;
  estimatedArrival: string;
  actualArrival?: string;
}