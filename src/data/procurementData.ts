import { ProcurementOrder, Supplier, ProcurementStats, ProcurementNotification } from '../types/procurement';

// 模拟采购订单数据
export const mockProcurementOrders: ProcurementOrder[] = [
  {
    id: '1',
    orderNumber: 'PO-2024-001',
    supplierName: '华为技术有限公司',
    items: [
      {
        id: '1',
        name: '服务器设备',
        description: 'Dell PowerEdge R740服务器',
        quantity: 5,
        unitPrice: 25000,
        totalPrice: 125000,
        category: 'IT设备',
        specifications: '2U机架式，双路Intel Xeon处理器'
      }
    ],
    totalAmount: 125000,
    status: 'approved',
    createdDate: '2024-01-15',
    expectedDelivery: '2024-02-15',
    approvedBy: '张经理',
    notes: '紧急采购，优先处理'
  },
  {
    id: '2',
    orderNumber: 'PO-2024-002',
    supplierName: '联想集团',
    items: [
      {
        id: '2',
        name: '办公电脑',
        description: 'ThinkPad E14笔记本电脑',
        quantity: 20,
        unitPrice: 4500,
        totalPrice: 90000,
        category: 'IT设备'
      }
    ],
    totalAmount: 90000,
    status: 'ordered',
    createdDate: '2024-01-20',
    expectedDelivery: '2024-02-20'
  },
  {
    id: '3',
    orderNumber: 'PO-2024-003',
    supplierName: '得力集团',
    items: [
      {
        id: '3',
        name: '办公用品套装',
        description: '包含文具、纸张等办公用品',
        quantity: 100,
        unitPrice: 150,
        totalPrice: 15000,
        category: '办公用品'
      }
    ],
    totalAmount: 15000,
    status: 'received',
    createdDate: '2024-01-10',
    expectedDelivery: '2024-01-25',
    actualDelivery: '2024-01-24'
  },
  {
    id: '4',
    orderNumber: 'PO-2024-004',
    supplierName: '海康威视',
    items: [
      {
        id: '4',
        name: '监控设备',
        description: '网络摄像头及配套设备',
        quantity: 15,
        unitPrice: 800,
        totalPrice: 12000,
        category: '安防设备'
      }
    ],
    totalAmount: 12000,
    status: 'pending',
    createdDate: '2024-01-25',
    expectedDelivery: '2024-02-25'
  }
];

// 模拟供应商数据
export const mockSuppliers: Supplier[] = [
  {
    id: '1',
    name: '华为技术有限公司',
    contactPerson: '李总',
    email: 'li@huawei.com',
    phone: '138-0000-0001',
    address: '深圳市龙岗区华为基地',
    category: 'IT设备',
    rating: 4.8,
    totalOrders: 25,
    totalAmount: 2500000,
    status: 'active',
    registrationDate: '2023-01-15',
    lastOrderDate: '2024-01-15'
  },
  {
    id: '2',
    name: '联想集团',
    contactPerson: '王经理',
    email: 'wang@lenovo.com',
    phone: '138-0000-0002',
    address: '北京市海淀区联想大厦',
    category: 'IT设备',
    rating: 4.6,
    totalOrders: 18,
    totalAmount: 1800000,
    status: 'active',
    registrationDate: '2023-02-20',
    lastOrderDate: '2024-01-20'
  },
  {
    id: '3',
    name: '得力集团',
    contactPerson: '陈主管',
    email: 'chen@deli.com',
    phone: '138-0000-0003',
    address: '浙江省宁波市得力工业园',
    category: '办公用品',
    rating: 4.3,
    totalOrders: 35,
    totalAmount: 350000,
    status: 'active',
    registrationDate: '2023-03-10',
    lastOrderDate: '2024-01-10'
  },
  {
    id: '4',
    name: '海康威视',
    contactPerson: '赵工程师',
    email: 'zhao@hikvision.com',
    phone: '138-0000-0004',
    address: '杭州市滨江区海康威视科技园',
    category: '安防设备',
    rating: 4.7,
    totalOrders: 12,
    totalAmount: 960000,
    status: 'active',
    registrationDate: '2023-04-05',
    lastOrderDate: '2024-01-25'
  }
];

// 模拟采购统计数据
export const mockProcurementStats: ProcurementStats = {
  totalOrders: 90,
  totalAmount: 5610000,
  pendingOrders: 8,
  completedOrders: 75,
  monthlyGrowth: 15.6,
  averageOrderValue: 62333,
  topSuppliers: [
    { name: '华为技术有限公司', amount: 2500000, orders: 25 },
    { name: '联想集团', amount: 1800000, orders: 18 },
    { name: '海康威视', amount: 960000, orders: 12 },
    { name: '得力集团', amount: 350000, orders: 35 }
  ],
  categoryBreakdown: [
    { category: 'IT设备', amount: 4300000, percentage: 76.6 },
    { category: '安防设备', amount: 960000, percentage: 17.1 },
    { category: '办公用品', amount: 350000, percentage: 6.3 }
  ]
};

// 模拟采购通知数据
export const mockProcurementNotifications: ProcurementNotification[] = [
  {
    id: '1',
    type: 'approval_needed',
    title: '采购订单待审批',
    description: '订单PO-2024-005需要您的审批，金额：￥85,000',
    orderId: '5',
    priority: 'high',
    timestamp: '2024-01-26T10:30:00Z',
    isRead: false
  },
  {
    id: '2',
    type: 'delivery_delayed',
    title: '交货延期通知',
    description: '华为技术有限公司的订单PO-2024-001预计延期3天交货',
    orderId: '1',
    supplierId: '1',
    priority: 'medium',
    timestamp: '2024-01-26T09:15:00Z',
    isRead: false
  },
  {
    id: '3',
    type: 'order_completed',
    title: '订单已完成',
    description: '得力集团的订单PO-2024-003已成功完成交付',
    orderId: '3',
    supplierId: '3',
    priority: 'low',
    timestamp: '2024-01-25T16:45:00Z',
    isRead: true
  },
  {
    id: '4',
    type: 'supplier_issue',
    title: '供应商评级下降',
    description: '供应商"某某公司"评级下降至3.2分，建议重新评估',
    supplierId: '5',
    priority: 'medium',
    timestamp: '2024-01-25T14:20:00Z',
    isRead: false
  }
];