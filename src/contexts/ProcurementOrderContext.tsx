import React, { createContext, useContext, useState, ReactNode } from 'react';

// 采购订单项目接口
export interface ProcurementOrderItem {
  id: string;
  name: string;
  specification: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  deliveryTime: string;
  remarks?: string;
  // 库存信息
  currentStock?: number; // 当前库存数量
}

// 采购订单接口
export interface ProcurementOrder {
  id: string;
  orderNumber: string;
  title: string;
  supplier: string;
  supplierContact: string;
  supplierPhone: string;
  orderDate: string;
  expectedDeliveryDate: string;
  totalAmount: number;
  status: 'draft' | 'confirmed' | 'in_production' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
  statusText: string;
  creator: string;
  department: string;
  items: ProcurementOrderItem[];
  
  // 库存信息
  currentStock?: number;
  
  // 收货信息
  deliveryAddress: string;
  recipient: string;
  recipientPhone: string;
  
  // 关联的询价单信息
  quotationRequestId?: string;
  quotationRequestNo?: string;
  selectedQuotationId?: string;
  
  // 关联的合同信息
  contractId?: string;
  contractNo?: string;
  
  // 合同和附件
  contractFiles?: string[];
  attachmentFiles?: string[];
  
  // 备注
  remarks?: string;
  
  // 时间戳
  createdAt: string;
  updatedAt: string;
}

interface ProcurementOrderContextType {
  orders: ProcurementOrder[];
  addOrder: (order: Omit<ProcurementOrder, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>) => void;
  updateOrder: (order: ProcurementOrder) => void;
  deleteOrder: (id: string) => void;
  getOrderById: (id: string) => ProcurementOrder | undefined;
  getOrdersByStatus: (status: ProcurementOrder['status']) => ProcurementOrder[];
  // 新增：从询价结果创建采购订单
  createOrderFromQuotation: (quotationData: {
    applicationId?: string;
    inquiryId: string;
    quotationId: string;
    quotationRequestNo: string;
    selectedQuotation: any;
    quotationComparison?: any;
  }) => void;
}

const ProcurementOrderContext = createContext<ProcurementOrderContextType | undefined>(undefined);

export const useProcurementOrder = () => {
  const context = useContext(ProcurementOrderContext);
  if (!context) {
    throw new Error('useProcurementOrder must be used within a ProcurementOrderProvider');
  }
  return context;
};

interface ProcurementOrderProviderProps {
  children: ReactNode;
}

export const ProcurementOrderProvider: React.FC<ProcurementOrderProviderProps> = ({ children }) => {
  const [orders, setOrders] = useState<ProcurementOrder[]>([
    {
      id: '1',
      orderNumber: 'PO2024001',
      title: '办公设备采购订单',
      supplier: '华为技术有限公司',
      supplierContact: '张经理',
      supplierPhone: '13800138001',
      orderDate: '2024-01-15',
      expectedDeliveryDate: '2024-01-25',
      totalAmount: 23000,
      status: 'in_production',
      statusText: '待发货',
      creator: '李采购',
      department: '行政部',
      currentStock: 15, // 当前库存数量
      deliveryAddress: '北京市朝阳区建国路88号SOHO现代城A座15层',
      recipient: '李收货',
      recipientPhone: '13800138888',
      items: [
        {
          id: '1',
          name: '台式电脑',
          specification: 'Intel i5-12400F, 16GB内存, 512GB SSD',
          unit: '台',
          quantity: 5,
          unitPrice: 3800,
          totalPrice: 19000,
          deliveryTime: '7个工作日',
          remarks: '包含安装调试',
          currentStock: 12 // 当前库存12台
        },
        {
          id: '2',
          name: '激光打印机',
          specification: 'HP LaserJet Pro M404dn',
          unit: '台',
          quantity: 2,
          unitPrice: 2000,
          totalPrice: 4000,
          deliveryTime: '3个工作日',
          remarks: '含一年保修',
          currentStock: 3 // 当前库存3台
        }
      ],
      quotationRequestId: '1',
      quotationRequestNo: 'RFQ2024001',
      selectedQuotationId: 'q1',
      // 关联合同（示例）
      contractId: 'C-2024-001',
      contractNo: 'HT-2024-001',
      contractFiles: [],
      attachmentFiles: [],
      remarks: '请按时交付，质量要求严格',
      createdAt: '2024-01-15T09:00:00Z',
      updatedAt: '2024-01-15T09:00:00Z'
    },
    {
      id: '2',
      orderNumber: 'PO2024002',
      title: '营销物料采购订单',
      supplier: '广州印刷有限公司',
      supplierContact: '王总',
      supplierPhone: '13900139002',
      orderDate: '2024-01-18',
      expectedDeliveryDate: '2024-01-28',
      totalAmount: 15000,
      status: 'completed',
      statusText: '已完成',
      creator: '张采购',
      department: '市场部',
      currentStock: 8, // 当前库存数量
      deliveryAddress: '上海市浦东新区陆家嘴环路1000号恒生银行大厦20层',
      recipient: '王收货',
      recipientPhone: '13900139999',
      items: [
        {
          id: '1',
          name: '宣传册',
          specification: 'A4彩印，铜版纸',
          unit: '本',
          quantity: 1000,
          unitPrice: 12,
          totalPrice: 12000,
          deliveryTime: '10个工作日',
          remarks: '高质量印刷',
          currentStock: 500 // 当前库存500本
        },
        {
          id: '2',
          name: '展示架',
          specification: '不锈钢材质，可折叠',
          unit: '个',
          quantity: 10,
          unitPrice: 300,
          totalPrice: 3000,
          deliveryTime: '5个工作日',
          currentStock: 8 // 当前库存8个
        }
      ],
      quotationRequestId: '2',
      quotationRequestNo: 'RFQ2024002',
      selectedQuotationId: 'q2',
      contractFiles: [],
      attachmentFiles: [],
      remarks: '印刷质量要求高',
      createdAt: '2024-01-18T10:30:00Z',
      updatedAt: '2024-01-18T10:30:00Z'
    },
    {
      id: '3',
      orderNumber: 'PO2024003',
      title: '实验设备采购订单',
      supplier: '科研仪器有限公司',
      supplierContact: '刘工程师',
      supplierPhone: '13700137003',
      orderDate: '2024-01-20',
      expectedDeliveryDate: '2024-02-05',
      totalAmount: 45000,
      status: 'shipped',
      statusText: '已发货',
      creator: '陈采购',
      department: '研发部',
      currentStock: 3, // 当前库存数量
      deliveryAddress: '深圳市南山区科技园南区深圳湾科技生态园10栋A座8层',
      recipient: '陈实验员',
      recipientPhone: '13700137777',
      items: [
        {
          id: '1',
          name: '显微镜',
          specification: '光学显微镜，1000倍放大',
          unit: '台',
          quantity: 2,
          unitPrice: 15000,
          totalPrice: 30000,
          deliveryTime: '15个工作日',
          remarks: '含专业培训',
          currentStock: 1 // 当前库存1台
        },
        {
          id: '2',
          name: '离心机',
          specification: '高速离心机，最大转速12000rpm',
          unit: '台',
          quantity: 1,
          unitPrice: 15000,
          totalPrice: 15000,
          deliveryTime: '10个工作日',
          remarks: '含安装调试',
          currentStock: 0 // 当前库存0台
        }
      ],
      quotationRequestId: '3',
      quotationRequestNo: 'RFQ2024003',
      selectedQuotationId: 'q3',
      contractFiles: [],
      attachmentFiles: [],
      remarks: '精密仪器，运输需特别小心',
      createdAt: '2024-01-20T14:00:00Z',
      updatedAt: '2024-01-25T16:30:00Z'
    },
    {
      id: '5',
      orderNumber: 'PO2024005',
      title: '服务器设备采购订单',
      supplier: '戴尔科技有限公司',
      supplierContact: '周技术总监',
      supplierPhone: '13500135005',
      orderDate: '2024-01-08',
      expectedDeliveryDate: '2024-01-18',
      totalAmount: 120000,
      status: 'delivered',
      statusText: '已送达',
      creator: '吴采购',
      department: 'IT部',
      deliveryAddress: '杭州市西湖区文三路259号昌地火炬大厦1号楼15层',
      recipient: '吴运维',
      recipientPhone: '13500135555',
      items: [
        {
          id: '1',
          name: '服务器',
          specification: 'Dell PowerEdge R740，双路至强处理器',
          unit: '台',
          quantity: 2,
          unitPrice: 50000,
          totalPrice: 100000,
          deliveryTime: '10个工作日',
          remarks: '含3年保修'
        },
        {
          id: '2',
          name: '网络交换机',
          specification: '48口千兆交换机',
          unit: '台',
          quantity: 1,
          unitPrice: 20000,
          totalPrice: 20000,
          deliveryTime: '5个工作日',
          remarks: '含配置服务'
        }
      ],
      quotationRequestId: '5',
      quotationRequestNo: 'RFQ2024005',
      selectedQuotationId: 'q5',
      // 关联合同（示例）
      contractId: 'C-2024-001',
      contractNo: 'HT-2024-001',
      contractFiles: [],
      attachmentFiles: [],
      remarks: '已完成验收，可关联入库处理',
      createdAt: '2024-01-08T08:30:00Z',
      updatedAt: '2024-01-20T17:00:00Z'
    },
    // 新增：与 HT-2024-001 合同关联的示例订单（供应商一致）
    {
      id: '8',
      orderNumber: 'PO2024010',
      title: '台式电脑及外设采购（合同HT-2024-001）',
      supplier: '上海电子设备有限公司',
      supplierContact: '刘经理',
      supplierPhone: '13600000010',
      orderDate: '2024-02-10',
      expectedDeliveryDate: '2024-02-20',
      totalAmount: 43000,
      status: 'confirmed',
      statusText: '已确认',
      creator: '李采购',
      department: '采购部',
      deliveryAddress: '上海市浦东新区张江路88号',
      recipient: '张收货',
      recipientPhone: '13600000011',
      items: [
        { id: 'i-1', name: '台式电脑', specification: 'i5/16G/512G', unit: '台', quantity: 6, unitPrice: 3800, totalPrice: 22800, deliveryTime: '7个工作日' },
        { id: 'i-2', name: '显示器', specification: '24寸IPS', unit: '台', quantity: 6, unitPrice: 1200, totalPrice: 7200, deliveryTime: '7个工作日' },
        { id: 'i-3', name: '键鼠套装', specification: 'USB', unit: '套', quantity: 6, unitPrice: 200, totalPrice: 1200, deliveryTime: '7个工作日' },
        { id: 'i-4', name: '打印机耗材', specification: '碳粉', unit: '盒', quantity: 10, unitPrice: 150, totalPrice: 1500, deliveryTime: '3个工作日' }
      ],
      quotationRequestId: '1',
      quotationRequestNo: 'RFQ2024001',
      selectedQuotationId: 'q1',
      contractId: 'C-2024-001',
      contractNo: 'HT-2024-001',
      contractFiles: [],
      attachmentFiles: [],
      remarks: '根据年度框架合同下单',
      createdAt: '2024-02-10T09:00:00Z',
      updatedAt: '2024-02-10T09:00:00Z'
    },
    {
      id: '9',
      orderNumber: 'PO2024011',
      title: '办公外设补充采购（合同HT-2024-001）',
      supplier: '上海电子设备有限公司',
      supplierContact: '刘经理',
      supplierPhone: '13600000012',
      orderDate: '2024-03-01',
      expectedDeliveryDate: '2024-03-10',
      totalAmount: 12000,
      status: 'draft',
      statusText: '草稿',
      creator: '王采购',
      department: '采购部',
      deliveryAddress: '上海市浦东新区张江路88号',
      recipient: '王收货',
      recipientPhone: '13600000013',
      items: [
        { id: 'i-5', name: '键盘', specification: '机械键盘', unit: '把', quantity: 10, unitPrice: 300, totalPrice: 3000, deliveryTime: '5个工作日' },
        { id: 'i-6', name: '鼠标', specification: '无线鼠标', unit: '个', quantity: 10, unitPrice: 200, totalPrice: 2000, deliveryTime: '5个工作日' },
        { id: 'i-7', name: '显示器支架', specification: '可调节', unit: '个', quantity: 10, unitPrice: 400, totalPrice: 4000, deliveryTime: '7个工作日' },
        { id: 'i-8', name: '网线', specification: 'Cat6 5米', unit: '根', quantity: 20, unitPrice: 50, totalPrice: 1000, deliveryTime: '3个工作日' }
      ],
      contractId: 'C-2024-001',
      contractNo: 'HT-2024-001',
      contractFiles: [],
      attachmentFiles: [],
      remarks: '年度框架合同补充下单',
      createdAt: '2024-03-01T10:00:00Z',
      updatedAt: '2024-03-01T10:00:00Z'
    },
    // 新增：与 HT-2024-005 合同关联的示例订单（供应商：北京办公用品有限公司）
    {
      id: '10',
      orderNumber: 'PO2024012',
      title: '办公椅采购订单（合同HT-2024-005）',
      supplier: '北京办公用品有限公司',
      supplierContact: '赵经理',
      supplierPhone: '13700000012',
      orderDate: '2024-02-15',
      expectedDeliveryDate: '2024-02-28',
      totalAmount: 15000,
      status: 'confirmed',
      statusText: '已确认',
      creator: '赵采购',
      department: '行政部',
      deliveryAddress: '北京市海淀区中关村大街56号',
      recipient: '赵收货',
      recipientPhone: '13700000013',
      items: [
        { id: 'j-1', name: '办公椅', specification: '人体工学，可调节', unit: '把', quantity: 50, unitPrice: 300, totalPrice: 15000, deliveryTime: '10个工作日' }
      ],
      contractId: 'C-2024-002',
      contractNo: 'HT-2024-005',
      contractFiles: [],
      attachmentFiles: [],
      remarks: '根据一次性采购合同下单',
      createdAt: '2024-02-15T09:00:00Z',
      updatedAt: '2024-02-15T09:00:00Z'
    },
    {
      id: '11',
      orderNumber: 'PO2024013',
      title: '办公桌及附件采购（合同HT-2024-005）',
      supplier: '北京办公用品有限公司',
      supplierContact: '赵经理',
      supplierPhone: '13700000014',
      orderDate: '2024-03-05',
      expectedDeliveryDate: '2024-03-15',
      totalAmount: 18000,
      status: 'draft',
      statusText: '草稿',
      creator: '赵采购',
      department: '行政部',
      deliveryAddress: '北京市海淀区中关村大街56号',
      recipient: '李收货',
      recipientPhone: '13700000015',
      items: [
        { id: 'j-2', name: '办公桌', specification: '1.6m 颗粒板', unit: '张', quantity: 20, unitPrice: 600, totalPrice: 12000, deliveryTime: '7个工作日' },
        { id: 'j-3', name: '桌面理线器', specification: '铝合金', unit: '个', quantity: 20, unitPrice: 300, totalPrice: 6000, deliveryTime: '7个工作日' }
      ],
      contractId: 'C-2024-002',
      contractNo: 'HT-2024-005',
      contractFiles: [],
      attachmentFiles: [],
      remarks: '同一合同的补充下单',
      createdAt: '2024-03-05T10:00:00Z',
      updatedAt: '2024-03-05T10:00:00Z'
    }
  ]);

  const addOrder = (orderData: Omit<ProcurementOrder, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newOrder: ProcurementOrder = {
      ...orderData,
      id: Date.now().toString(),
      orderNumber: `PO${Date.now().toString().slice(-6)}`,
      createdAt: now,
      updatedAt: now
    };
    setOrders(prev => [...prev, newOrder]);
  };

  const updateOrder = (updatedOrder: ProcurementOrder) => {
    console.log('updateOrder被调用，更新的订单：', updatedOrder);
    setOrders(prev => {
      const newOrders = prev.map(order => 
        order.id === updatedOrder.id 
          ? { ...updatedOrder, updatedAt: new Date().toISOString() }
          : order
      );
      console.log('订单列表更新前：', prev);
      console.log('订单列表更新后：', newOrders);
      return newOrders;
    });
  };

  const deleteOrder = (id: string) => {
    setOrders(prev => prev.filter(order => order.id !== id));
  };

  const getOrderById = (id: string) => {
    return orders.find(order => order.id === id);
  };

  const getOrdersByStatus = (status: ProcurementOrder['status']) => {
    return orders.filter(order => order.status === status);
  };

  // 从询价结果创建采购订单
  const createOrderFromQuotation = (quotationData: {
    applicationId?: string;
    inquiryId: string;
    quotationId: string;
    quotationRequestNo: string;
    selectedQuotation: any;
    quotationComparison?: any;
  }) => {
    const now = new Date().toISOString();
    const newOrder: ProcurementOrder = {
      id: Date.now().toString(),
      orderNumber: `PO${Date.now().toString().slice(-6)}`,
      title: `基于询价单${quotationData.quotationRequestNo}的采购订单`,
      supplier: quotationData.selectedQuotation.supplierName,
      supplierContact: '联系人',
      supplierPhone: '联系电话',
      orderDate: now.split('T')[0],
      expectedDeliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      totalAmount: quotationData.selectedQuotation.totalAmount,
      status: 'draft',
      statusText: '草稿',
      creator: '系统用户',
      department: '采购部',
      deliveryAddress: '默认收货地址',
      recipient: '默认收货人',
      recipientPhone: '默认联系电话',
      items: quotationData.selectedQuotation.items.map((item: any) => ({
        id: item.itemId || item.id,
        name: item.name || '未知物品',
        specification: item.specification || '未知规格',
        unit: item.unit || '个',
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        deliveryTime: item.deliveryTime || '7个工作日',
        remarks: item.remarks
      })),
      // 关联信息
      quotationRequestId: quotationData.inquiryId,
      quotationRequestNo: quotationData.quotationRequestNo,
      selectedQuotationId: quotationData.quotationId,
      contractFiles: [],
      attachmentFiles: [],
      remarks: `基于询价单 ${quotationData.quotationRequestNo} 创建的采购订单`,
      createdAt: now,
      updatedAt: now
    };
    
    setOrders(prev => [...prev, newOrder]);
  };

  const value: ProcurementOrderContextType = {
    orders,
    addOrder,
    updateOrder,
    deleteOrder,
    getOrderById,
    getOrdersByStatus,
    createOrderFromQuotation
  };

  return (
    <ProcurementOrderContext.Provider value={value}>
      {children}
    </ProcurementOrderContext.Provider>
  );
};