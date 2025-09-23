// 采购相关的数据类型定义

export interface ProcurementOrder {
  id: string;
  orderNumber: string;
  supplierName: string;
  items: ProcurementItem[];
  totalAmount: number;
  status: 'pending' | 'approved' | 'ordered' | 'received' | 'completed' | 'cancelled';
  createdDate: string;
  expectedDelivery: string;
  actualDelivery?: string;
  approvedBy?: string;
  notes?: string;
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