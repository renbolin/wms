import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// 采购申请接口
export interface ProcurementRequisition {
  id: number;
  requisitionNumber: string;
  applicant: string;
  department: string;
  applicationDate: string;
  description: string;
}

// 询价单接口（扩展版本，包含采购申请关联）
export interface QuotationRequest {
  id: string;
  requestNo: string;
  title: string;
  department: string;
  requestDate: string;
  deadline: string;
  status: 'inquiring' | 'quoted' | 'completed';
  statusText: string;
  description: string;
  items: QuotationItem[];
  suppliers: string[];
  quotations: Quotation[];
  // 新增：关联的采购申请信息
  procurementRequisition?: {
    id: number;
    requisitionNumber: string;
    applicant: string;
    department: string;
    applicationDate: string;
    description: string;
  };
}

// 询价项目接口
export interface QuotationItem {
  id: string;
  name: string;
  specification: string;
  unit: string;
  quantity: number;
  estimatedPrice: number;
}

// 报价接口
export interface Quotation {
  id: string;
  supplierId: string;
  supplierName: string;
  quotationDate: string;
  validUntil: string;
  totalAmount: number;
  status: 'pending' | 'submitted' | 'selected' | 'rejected';
  items: QuotationItemPrice[];
  remarks: string;
}

// 报价项目价格接口
export interface QuotationItemPrice {
  itemId: string;
  unitPrice: number;
  totalPrice: number;
  deliveryTime: string;
  remarks: string;
}

// Context状态接口
interface InquiryContextType {
  quotationRequests: QuotationRequest[];
  procurementRequisitions: ProcurementRequisition[];
  addQuotationRequest: (request: QuotationRequest) => void;
  updateQuotationRequest: (id: string, request: Partial<QuotationRequest>) => void;
  setProcurementRequisitions: (requisitions: ProcurementRequisition[]) => void;
  getQuotationRequestsByProcurementId: (procurementId: number) => QuotationRequest[];
}

// 创建Context
const InquiryContext = createContext<InquiryContextType | undefined>(undefined);

// Provider组件
export const InquiryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [quotationRequests, setQuotationRequests] = useState<QuotationRequest[]>([]);
  const [procurementRequisitions, setProcurementRequisitions] = useState([
    {
      id: 1,
      requisitionNumber: 'PR2024001',
      applicant: '张三',
      department: '行政部',
      applicationDate: '2024-01-15',
      description: '办公用品紧急采购'
    },
    {
      id: 2,
      requisitionNumber: 'PR2024002',
      applicant: '李四',
      department: 'IT部',
      applicationDate: '2024-01-16',
      description: '服务器设备采购'
    },
    {
      id: 3,
      requisitionNumber: 'PR2024003',
      applicant: '王五',
      department: '生产部',
      applicationDate: '2024-01-17',
      description: '生产设备维护'
    },
    {
      id: 4,
      requisitionNumber: 'PR2024004',
      applicant: '赵六',
      department: '市场部',
      applicationDate: '2024-01-18',
      description: '市场推广物料'
    },
    {
      id: 5,
      requisitionNumber: 'PR2024005',
      applicant: '孙七',
      department: '财务部',
      applicationDate: '2024-01-19',
      description: '财务软件升级'
    },
    {
      id: 6,
      requisitionNumber: 'PR2024006',
      applicant: '周八',
      department: '销售部',
      applicationDate: '2024-01-20',
      description: '销售工具采购'
    },
    {
      id: 7,
      requisitionNumber: 'PR2024007',
      applicant: '吴九',
      department: '餐饮部',
      applicationDate: '2024-01-21',
      description: '厨房设备更新'
    },
    {
      id: 8,
      requisitionNumber: 'PR2024008',
      applicant: '郑十',
      department: '人事部',
      applicationDate: '2024-01-24',
      description: '培训设备采购'
    }
  ]);

  // 初始化测试数据
  useEffect(() => {
    const initialQuotationRequests: QuotationRequest[] = [
      {
        id: '1',
        requestNo: 'INQ-2024-001',
        title: '办公设备采购询价',
        department: '行政部',
        requestDate: '2024-01-15',
        deadline: '2024-01-25',
        status: 'quoted',
        statusText: '已报价',
        description: '办公室电脑、打印机等设备采购',
        items: [
          {
            id: '1',
            name: '台式电脑',
            specification: 'Intel i5, 8GB内存, 256GB SSD',
            unit: '台',
            quantity: 5,
            estimatedPrice: 4000
          },
          {
            id: '2',
            name: '激光打印机',
            specification: 'A4黑白激光打印机',
            unit: '台',
            quantity: 2,
            estimatedPrice: 1500
          }
        ],
        suppliers: ['供应商A', '供应商B', '供应商C'],
        quotations: [
          {
            id: '1',
            supplierId: 'supplier-a',
            supplierName: '供应商A',
            quotationDate: '2024-01-18',
            validUntil: '2024-02-18',
            totalAmount: 23000,
            status: 'submitted',
            items: [
              {
                itemId: '1',
                unitPrice: 3800,
                totalPrice: 19000,
                deliveryTime: '7个工作日',
                remarks: '包含安装调试'
              },
              {
                itemId: '2',
                unitPrice: 1400,
                totalPrice: 2800,
                deliveryTime: '3个工作日',
                remarks: '含一年保修'
              }
            ],
            remarks: '价格优惠，服务周到'
          },
          {
            id: '2',
            supplierId: 'supplier-b',
            supplierName: '供应商B',
            quotationDate: '2024-01-19',
            validUntil: '2024-02-19',
            totalAmount: 24500,
            status: 'submitted',
            items: [
              {
                itemId: '1',
                unitPrice: 4000,
                totalPrice: 20000,
                deliveryTime: '5个工作日',
                remarks: '原装正品'
              },
              {
                itemId: '2',
                unitPrice: 1500,
                totalPrice: 3000,
                deliveryTime: '2个工作日',
                remarks: '两年保修'
              }
            ],
            remarks: '质量可靠，交期准时'
          }
        ],
        procurementRequisition: {
          id: 10,
          requisitionNumber: 'PR2024010',
          applicant: '张三',
          department: '行政部',
          applicationDate: '2024-01-15',
          description: '办公设备采购申请'
        }
      },
      {
        id: '2',
        requestNo: 'INQ-2024-002',
        title: '生产设备采购询价',
        department: '生产部',
        requestDate: '2024-01-20',
        deadline: '2024-01-30',
        status: 'completed',
        statusText: '已完成',
        description: '生产线设备更新采购',
        items: [
          {
            id: '3',
            name: '自动化生产线',
            specification: '全自动化生产设备',
            unit: '套',
            quantity: 1,
            estimatedPrice: 500000
          }
        ],
        suppliers: ['设备供应商A', '设备供应商B'],
        quotations: [
          {
             id: '3',
             supplierId: 'equipment-a',
             supplierName: '设备供应商A',
             quotationDate: '2024-01-22',
             validUntil: '2024-02-22',
             totalAmount: 480000,
             status: 'selected',
            items: [
              {
                itemId: '3',
                unitPrice: 480000,
                totalPrice: 480000,
                deliveryTime: '30个工作日',
                remarks: '包含安装调试培训'
              }
            ],
            remarks: '专业设备制造商'
          },
          {
             id: '4',
             supplierId: 'equipment-b',
             supplierName: '设备供应商B',
             quotationDate: '2024-01-23',
             validUntil: '2024-02-23',
             totalAmount: 520000,
             status: 'rejected',
            items: [
              {
                itemId: '3',
                unitPrice: 520000,
                totalPrice: 520000,
                deliveryTime: '25个工作日',
                remarks: '进口设备，质量保证'
              }
            ],
            remarks: '国际知名品牌'
          }
        ],
        procurementRequisition: {
          id: 2,
          requisitionNumber: 'PR2024002',
          applicant: '李四',
          department: '生产部',
          applicationDate: '2024-01-20',
          description: '生产设备采购申请'
        }
      },
      {
        id: '4',
        requestNo: 'INQ-2024-004',
        title: '清洁用品采购询价',
        department: '后勤部',
        requestDate: '2024-01-28',
        deadline: '2024-02-08',
        status: 'quoted',
        statusText: '已报价',
        description: '办公区域清洁用品采购',
        items: [
          {
            id: '5',
            name: '清洁剂',
            specification: '多功能清洁剂',
            unit: '瓶',
            quantity: 50,
            estimatedPrice: 25
          }
        ],
        suppliers: ['清洁用品供应商A', '清洁用品供应商B'],
        quotations: [
          {
            id: '8',
            supplierId: 'clean-a',
            supplierName: '清洁用品供应商A',
            quotationDate: '2024-01-30',
            validUntil: '2024-03-01',
            totalAmount: 1200,
            status: 'submitted',
            items: [
              {
                itemId: '5',
                unitPrice: 24,
                totalPrice: 1200,
                deliveryTime: '3个工作日',
                remarks: '环保配方'
              }
            ],
            remarks: '绿色环保产品'
          },
          {
            id: '9',
            supplierId: 'clean-b',
            supplierName: '清洁用品供应商B',
            quotationDate: '2024-01-31',
            validUntil: '2024-03-02',
            totalAmount: 1100,
            status: 'submitted',
            items: [
              {
                itemId: '5',
                unitPrice: 22,
                totalPrice: 1100,
                deliveryTime: '2个工作日',
                remarks: '批量优惠'
              }
            ],
            remarks: '价格实惠'
          }
        ],
        procurementRequisition: {
          id: 4,
          requisitionNumber: 'PR2024004',
          applicant: '赵六',
          department: '后勤部',
          applicationDate: '2024-01-28',
          description: '清洁用品采购申请'
        }
      },
      {
        id: '5',
        requestNo: 'INQ-2024-005',
        title: '营销物料采购询价',
        department: '市场部',
        requestDate: '2024-02-01',
        deadline: '2024-02-10',
        status: 'inquiring',
         statusText: '询价中',
        description: '宣传册、海报等营销物料制作',
        items: [
          {
            id: '6',
            name: '宣传册',
            specification: 'A4彩色印刷',
            unit: '本',
            quantity: 1000,
            estimatedPrice: 5
          }
        ],
        suppliers: ['印刷厂A', '印刷厂B'],
        quotations: [],
        procurementRequisition: {
          id: 5,
          requisitionNumber: 'PR2024005',
          applicant: '孙七',
          department: '市场部',
          applicationDate: '2024-02-01',
          description: '营销物料采购申请'
        }
      }
    ];

    setQuotationRequests(initialQuotationRequests);
  }, []);

  // 添加询价单
  const addQuotationRequest = (request: QuotationRequest) => {
    setQuotationRequests(prev => [...prev, request]);
  };

  // 更新询价单
  const updateQuotationRequest = (id: string, updatedRequest: Partial<QuotationRequest>) => {
    setQuotationRequests(prev => 
      prev.map(request => 
        request.id === id ? { ...request, ...updatedRequest } : request
      )
    );
  };



  // 根据采购申请ID获取相关询价单
  const getQuotationRequestsByProcurementId = (procurementId: number): QuotationRequest[] => {
    return quotationRequests.filter(request => 
      request.procurementRequisition?.id === procurementId
    );
  };

  const value: InquiryContextType = {
    quotationRequests,
    procurementRequisitions,
    addQuotationRequest,
    updateQuotationRequest,
    setProcurementRequisitions,
    getQuotationRequestsByProcurementId,
  };

  return (
    <InquiryContext.Provider value={value}>
      {children}
    </InquiryContext.Provider>
  );
};

// Hook来使用Context
export const useInquiry = (): InquiryContextType => {
  const context = useContext(InquiryContext);
  if (!context) {
    throw new Error('useInquiry must be used within an InquiryProvider');
  }
  return context;
};