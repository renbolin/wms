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
      status: 'shipped',
      statusText: '已发货',
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
      status: 'completed',
      statusText: '已完成',
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
      contractFiles: [],
      attachmentFiles: [],
      remarks: '已完成验收，可关联入库处理',
      createdAt: '2024-01-08T08:30:00Z',
      updatedAt: '2024-01-20T17:00:00Z'
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

  const value: ProcurementOrderContextType = {
    orders,
    addOrder,
    updateOrder,
    deleteOrder,
    getOrderById,
    getOrdersByStatus
  };

  return (
    <ProcurementOrderContext.Provider value={value}>
      {children}
    </ProcurementOrderContext.Provider>
  );
};