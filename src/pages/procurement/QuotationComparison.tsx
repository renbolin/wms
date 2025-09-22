import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Modal, Form, Input, Select, DatePicker, Space, Tag, message, Descriptions, InputNumber, Row, Col, Divider } from 'antd';
import { EyeOutlined, CheckOutlined, CloseOutlined, FileTextOutlined, DeleteOutlined, MinusCircleOutlined, SendOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useLocation, useNavigate } from 'react-router-dom';
import { useInquiry } from '@/contexts/InquiryContext';

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

// 筛选条件组件
const FilterBar = ({ onFilter }: { onFilter: (values: any) => void }) => {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    onFilter(values);
  };

  const onReset = () => {
    form.resetFields();
    onFilter({});
  };

  return (
    <Form form={form} onFinish={onFinish} layout="inline" style={{ marginBottom: 16 }}>
      <Row gutter={[16, 16]} style={{ width: '100%' }}>
        <Col span={6}>
          <Form.Item name="requestNo" label="询价单号">
            <Input placeholder="请输入询价单号" />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="title" label="询价标题">
            <Input placeholder="请输入询价标题" />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="department" label="申请部门">
            <Input placeholder="请输入申请部门" />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="requestDate" label="申请日期">
            <RangePicker placeholder={['开始日期', '结束日期']} />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="status" label="询价状态">
            <Select placeholder="请选择状态" allowClear>
              <Option value="inquiring">询价中</Option>
              <Option value="quoted">已报价</Option>
              <Option value="completed">已完成</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="deadline" label="截止日期">
            <RangePicker placeholder={['开始日期', '结束日期']} />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="supplier" label="供应商">
            <Select placeholder="请选择供应商" allowClear>
              <Option value="北京科技有限公司">北京科技有限公司</Option>
              <Option value="上海设备制造厂">上海设备制造厂</Option>
              <Option value="广州电子科技">广州电子科技</Option>
              <Option value="深圳智能设备">深圳智能设备</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
              <Button onClick={onReset}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

// 询价单接口
interface QuotationRequest {
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
  quotations: Quotation[];
  // 关联的采购申请信息
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
interface QuotationItem {
  id: string;
  name: string;
  specification: string;
  unit: string;
  quantity: number;
  estimatedPrice: number;
}

// 报价接口
interface Quotation {
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
interface QuotationItemPrice {
  itemId: string;
  unitPrice: number;
  totalPrice: number;
  deliveryTime: string;
  remarks: string;
}

// 供应商接口
interface Supplier {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
}

const QuotationComparison: React.FC = () => {
  // 使用全局状态管理
  const { quotationRequests, updateQuotationRequest } = useInquiry();
  
  // 获取路由参数
  const location = useLocation();
  const navigate = useNavigate();
  const { requisitionNumber, openComparison } = location.state || {};
  
  const [filteredData, setFilteredData] = useState<QuotationRequest[]>([]);
  const [loading, setLoading] = useState(false);

  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isComparisonModalVisible, setIsComparisonModalVisible] = useState(false);
  const [isProcurementDetailModalVisible, setIsProcurementDetailModalVisible] = useState(false);

  const [selectedRecord, setSelectedRecord] = useState<QuotationRequest | null>(null);
  const [viewingProcurementRecord, setViewingProcurementRecord] = useState<QuotationRequest | null>(null);
  
  // 比价弹窗按钮状态
  const [isConfirmed, setIsConfirmed] = useState(false); // 是否已确定选择
  const [canConfirm, setCanConfirm] = useState(false); // 是否可以确定（已选定供应商）
  const [form] = Form.useForm();

  // 模拟供应商数据
  const suppliers: Supplier[] = [
    { id: '1', name: '北京科技有限公司', contact: '张经理', phone: '010-12345678', email: 'zhang@bjtech.com' },
    { id: '2', name: '上海设备制造厂', contact: '李经理', phone: '021-87654321', email: 'li@shequip.com' },
    { id: '3', name: '广州电子科技', contact: '王经理', phone: '020-11223344', email: 'wang@gztech.com' },
    { id: '4', name: '深圳智能设备', contact: '刘经理', phone: '0755-99887766', email: 'liu@szai.com' },
  ];

  // 模拟数据
  const mockData: QuotationRequest[] = [
    {
      id: '1',
      requestNo: 'RFQ202401001',
      title: '办公设备采购询价',
      department: '行政部',
      requestDate: '2024-01-15',
      deadline: '2024-01-25',
      status: 'completed',
    statusText: '已完成',
      description: '办公室电脑、打印机等设备采购',
      procurementRequisition: {
        id: 10,
        requisitionNumber: 'PR2024010',
        applicant: '张三',
        department: '行政部',
        applicationDate: '2024-01-10',
        description: '办公设备采购申请'
      },
      items: [
        { id: '1', name: '台式电脑', specification: 'Intel i5, 8GB内存, 256GB SSD', unit: '台', quantity: 10, estimatedPrice: 4000 },
        { id: '2', name: '激光打印机', specification: 'A4黑白激光打印机', unit: '台', quantity: 2, estimatedPrice: 1500 },
      ],
      quotations: [
        {
          id: '1',
          supplierId: '1',
          supplierName: '北京科技有限公司',
          quotationDate: '2024-01-18',
          validUntil: '2024-02-18',
          totalAmount: 43000,
          status: 'submitted',
          items: [
            { itemId: '1', unitPrice: 3800, totalPrice: 38000, deliveryTime: '7个工作日', remarks: '含三年质保' },
            { itemId: '2', unitPrice: 2500, totalPrice: 5000, deliveryTime: '3个工作日', remarks: '含安装调试' },
          ],
          remarks: '价格优惠，质量可靠'
        },
        {
          id: '2',
          supplierId: '2',
          supplierName: '上海设备制造厂',
          quotationDate: '2024-01-19',
          validUntil: '2024-02-19',
          totalAmount: 41000,
          status: 'selected',
          items: [
            { itemId: '1', unitPrice: 3600, totalPrice: 36000, deliveryTime: '5个工作日', remarks: '含两年质保' },
            { itemId: '2', unitPrice: 2500, totalPrice: 5000, deliveryTime: '2个工作日', remarks: '免费送货上门' },
          ],
          remarks: '性价比最高'
        }
      ]
    },
    {
      id: '2',
      requestNo: 'RFQ202401002',
      title: '生产设备询价',
      department: '生产部',
      requestDate: '2024-01-20',
      deadline: '2024-01-30',
      status: 'quoted',
      statusText: '已报价',
      description: '生产线设备更新采购',
      items: [
        { id: '3', name: '数控机床', specification: 'CNC加工中心', unit: '台', quantity: 1, estimatedPrice: 500000 },
      ],
      quotations: [
        {
          id: '3',
          supplierId: '2',
          supplierName: '上海设备制造厂',
          quotationDate: '2024-01-22',
          validUntil: '2024-02-22',
          totalAmount: 480000,
          status: 'submitted',
          items: [
            { itemId: '3', unitPrice: 480000, totalPrice: 480000, deliveryTime: '30个工作日', remarks: '含培训服务' },
          ],
          remarks: '专业制造商，技术成熟'
        },
        {
          id: '12',
          supplierId: '4',
          supplierName: '深圳智能设备',
          quotationDate: '2024-01-23',
          validUntil: '2024-02-23',
          totalAmount: 465000,
          status: 'submitted',
          items: [
            { itemId: '3', unitPrice: 465000, totalPrice: 465000, deliveryTime: '25个工作日', remarks: '德国技术，精度更高' },
          ],
          remarks: '进口核心部件，精度保证'
        },
        {
          id: '13',
          supplierId: '1',
          supplierName: '北京科技有限公司',
          quotationDate: '2024-01-24',
          validUntil: '2024-02-24',
          totalAmount: 495000,
          status: 'submitted',
          items: [
            { itemId: '3', unitPrice: 495000, totalPrice: 495000, deliveryTime: '35个工作日', remarks: '含安装调试及操作培训' },
          ],
          remarks: '本土化服务，售后保障完善'
        }
      ]
    },
    {
      id: '4',
      requestNo: 'RFQ202401004',
      title: '服务器设备询价',
      department: 'IT部',
      requestDate: '2024-01-16',
      deadline: '2024-01-26',
      status: 'quoted',
      statusText: '已报价',
      description: '数据中心服务器设备采购',
      items: [
        { id: '6', name: '服务器', specification: 'Dell PowerEdge R740', unit: '台', quantity: 5, estimatedPrice: 25000 },
        { id: '7', name: '交换机', specification: '48口千兆交换机', unit: '台', quantity: 2, estimatedPrice: 8000 },
      ],
      quotations: [
        {
          id: '9',
          supplierId: '1',
          supplierName: '北京科技有限公司',
          quotationDate: '2024-01-18',
          validUntil: '2024-02-18',
          totalAmount: 141000,
          status: 'submitted',
          items: [
            { itemId: '6', unitPrice: 24000, totalPrice: 120000, deliveryTime: '15个工作日', remarks: '原装正品，三年保修' },
            { itemId: '7', unitPrice: 7000, totalPrice: 14000, deliveryTime: '7个工作日', remarks: '含配置服务' },
          ],
          remarks: '专业IT设备供应商，技术支持完善'
        },
        {
          id: '10',
          supplierId: '4',
          supplierName: '深圳智能设备',
          quotationDate: '2024-01-19',
          validUntil: '2024-02-19',
          totalAmount: 138500,
          status: 'submitted',
          items: [
            { itemId: '6', unitPrice: 23500, totalPrice: 117500, deliveryTime: '12个工作日', remarks: '企业级配置，五年保修' },
            { itemId: '7', unitPrice: 7500, totalPrice: 15000, deliveryTime: '5个工作日', remarks: '免费上门安装' },
          ],
          remarks: '价格优势明显，服务响应快'
        },
        {
          id: '11',
          supplierId: '2',
          supplierName: '上海设备制造厂',
          quotationDate: '2024-01-20',
          validUntil: '2024-02-20',
          totalAmount: 145000,
          status: 'submitted',
          items: [
            { itemId: '6', unitPrice: 25000, totalPrice: 125000, deliveryTime: '20个工作日', remarks: '高端配置，终身维护' },
            { itemId: '7', unitPrice: 8000, totalPrice: 16000, deliveryTime: '10个工作日', remarks: '专业网络配置' },
          ],
          remarks: '质量可靠，长期合作伙伴'
        }
      ]
    },
    {
      id: '5',
      requestNo: 'RFQ202401005',
      title: '营销物料询价',
      department: '市场部',
      requestDate: '2024-01-18',
      deadline: '2024-01-28',
      status: 'inquiring',
    statusText: '询价中',
      description: '品牌推广物料制作',
      items: [
        { id: '8', name: '宣传册', specification: 'A4彩印 200g铜版纸', unit: '本', quantity: 1000, estimatedPrice: 15 },
        { id: '9', name: '展示架', specification: '铝合金易拉宝 80*200cm', unit: '个', quantity: 20, estimatedPrice: 120 },
      ],
      quotations: [
        {
          id: '4',
          supplierId: '1',
          supplierName: '北京科技有限公司',
          quotationDate: '2024-01-20',
          validUntil: '2024-02-20',
          totalAmount: 17400,
          status: 'selected',
          items: [
            { itemId: '8', unitPrice: 12, totalPrice: 12000, deliveryTime: '5个工作日', remarks: '包装精美' },
            { itemId: '9', unitPrice: 100, totalPrice: 2000, deliveryTime: '3个工作日', remarks: '含设计费' },
          ],
          remarks: '设计能力强，交期快'
        },
        {
          id: '5',
          supplierId: '3',
          supplierName: '广州电子科技',
          quotationDate: '2024-01-21',
          validUntil: '2024-02-21',
          totalAmount: 18500,
          status: 'submitted',
          items: [
            { itemId: '8', unitPrice: 14, totalPrice: 14000, deliveryTime: '7个工作日', remarks: '质量保证' },
            { itemId: '9', unitPrice: 110, totalPrice: 2200, deliveryTime: '5个工作日', remarks: '免费送货' },
          ],
          remarks: '质量可靠，服务周到'
        }
      ]
    },
    {
      id: '6',
      requestNo: 'RFQ202401006',
      title: '实验设备询价',
      department: '研发部',
      requestDate: '2024-01-19',
      deadline: '2024-01-29',
      status: 'completed',
    statusText: '已完成',
      description: '实验室精密仪器采购',
      items: [
        { id: '10', name: '显微镜', specification: '光学显微镜 1000倍', unit: '台', quantity: 3, estimatedPrice: 15000 },
        { id: '11', name: '天平', specification: '精密电子天平 0.1mg', unit: '台', quantity: 2, estimatedPrice: 8000 },
      ],
      quotations: [
        {
          id: '6',
          supplierId: '4',
          supplierName: '深圳智能设备',
          quotationDate: '2024-01-22',
          validUntil: '2024-02-22',
          totalAmount: 61000,
          status: 'selected',
          items: [
            { itemId: '10', unitPrice: 14000, totalPrice: 42000, deliveryTime: '10个工作日', remarks: '德国进口镜头' },
            { itemId: '11', unitPrice: 7500, totalPrice: 15000, deliveryTime: '7个工作日', remarks: '含校准证书' },
          ],
          remarks: '专业实验设备供应商'
        }
      ]
    },
    {
      id: '7',
      requestNo: 'RFQ202401007',
      title: '清洁用品询价',
      department: '后勤部',
      requestDate: '2024-01-22',
      deadline: '2024-02-01',
      status: 'quoted',
      statusText: '已报价',
      description: '办公区域清洁用品采购',
      items: [
        { id: '12', name: '洗手液', specification: '500ml 抗菌型', unit: '瓶', quantity: 50, estimatedPrice: 25 },
        { id: '13', name: '垃圾袋', specification: '45L 加厚型', unit: '卷', quantity: 20, estimatedPrice: 15 },
      ],
      quotations: [
        {
          id: '14',
          supplierId: '1',
          supplierName: '北京科技有限公司',
          quotationDate: '2024-01-24',
          validUntil: '2024-02-24',
          totalAmount: 1350,
          status: 'submitted',
          items: [
            { itemId: '12', unitPrice: 22, totalPrice: 1100, deliveryTime: '3个工作日', remarks: '品牌产品，质量保证' },
            { itemId: '13', unitPrice: 12.5, totalPrice: 250, deliveryTime: '2个工作日', remarks: '环保材质' },
          ],
          remarks: '长期合作，价格优惠'
        },
        {
          id: '15',
          supplierId: '3',
          supplierName: '广州电子科技',
          quotationDate: '2024-01-25',
          validUntil: '2024-02-25',
          totalAmount: 1420,
          status: 'submitted',
          items: [
            { itemId: '12', unitPrice: 24, totalPrice: 1200, deliveryTime: '5个工作日', remarks: '进口原料，抗菌效果好' },
            { itemId: '13', unitPrice: 11, totalPrice: 220, deliveryTime: '3个工作日', remarks: '可降解材质' },
          ],
          remarks: '质量优先，绿色环保'
        }
      ]
    },
    {
      id: '8',
      requestNo: 'RFQ202401008',
      title: '安防设备询价',
      department: '安保部',
      requestDate: '2024-01-23',
      deadline: '2024-02-02',
      status: 'inquiring',
      statusText: '询价中',
      description: '园区安防监控设备升级',
      items: [
        { id: '14', name: '监控摄像头', specification: '4K高清 夜视功能', unit: '个', quantity: 12, estimatedPrice: 1200 },
        { id: '15', name: '硬盘录像机', specification: '16路 4TB存储', unit: '台', quantity: 2, estimatedPrice: 3500 },
      ],
      quotations: []
    },
    {
      id: '9',
      requestNo: 'RFQ202401009',
      title: '培训设备询价',
      department: '人事部',
      requestDate: '2024-01-24',
      deadline: '2024-02-03',
      status: 'quoted',
      statusText: '已报价',
      description: '员工培训室设备采购',
      items: [
        { id: '16', name: '投影仪', specification: '4K分辨率 激光光源', unit: '台', quantity: 2, estimatedPrice: 8000 },
        { id: '17', name: '音响系统', specification: '无线麦克风 功放音箱', unit: '套', quantity: 1, estimatedPrice: 5000 },
      ],
      quotations: [
        {
          id: '7',
          supplierId: '1',
          supplierName: '北京科技有限公司',
          quotationDate: '2024-01-26',
          validUntil: '2024-02-26',
          totalAmount: 20500,
          status: 'submitted',
          items: [
            { itemId: '16', unitPrice: 7800, totalPrice: 15600, deliveryTime: '7个工作日', remarks: '含安装调试' },
            { itemId: '17', unitPrice: 4900, totalPrice: 4900, deliveryTime: '5个工作日', remarks: '一年保修' },
          ],
          remarks: '专业AV设备供应商'
        },
        {
          id: '8',
          supplierId: '3',
          supplierName: '广州电子科技',
          quotationDate: '2024-01-27',
          validUntil: '2024-02-27',
          totalAmount: 21200,
          status: 'pending',
          items: [
            { itemId: '16', unitPrice: 8100, totalPrice: 16200, deliveryTime: '10个工作日', remarks: '进口品牌' },
            { itemId: '17', unitPrice: 5000, totalPrice: 5000, deliveryTime: '7个工作日', remarks: '免费培训' },
          ],
          remarks: '高端设备，质量保证'
        },
      ]
    },
    {
      id: '10',
      requestNo: 'RFQ202401010',
      title: '车辆维修询价',
      department: '车队',
      requestDate: '2024-01-25',
      deadline: '2024-02-04',
      status: 'compared',
      statusText: '已比价',
      description: '公务车辆定期保养维修',
      items: [
        { id: '18', name: '机油更换', specification: '全合成机油 5W-30', unit: '次', quantity: 5, estimatedPrice: 300 },
        { id: '19', name: '轮胎更换', specification: '205/55R16 品牌轮胎', unit: '条', quantity: 8, estimatedPrice: 600 },
      ],
      quotations: [
        {
          id: '9',
          supplierId: '2',
          supplierName: '上海设备制造厂',
          quotationDate: '2024-01-27',
          validUntil: '2024-02-27',
          totalAmount: 6300,
          status: 'submitted',
          items: [
            { itemId: '18', unitPrice: 280, totalPrice: 1400, deliveryTime: '当天完成', remarks: '含工时费' },
            { itemId: '19', unitPrice: 580, totalPrice: 4640, deliveryTime: '2个工作日', remarks: '品牌保证' },
          ],
          remarks: '专业汽修服务'
        },
        {
          id: '10',
          supplierId: '4',
          supplierName: '深圳智能设备',
          quotationDate: '2024-01-28',
          validUntil: '2024-02-28',
          totalAmount: 6800,
          status: 'submitted',
          items: [
            { itemId: '18', unitPrice: 320, totalPrice: 1600, deliveryTime: '当天完成', remarks: '原厂机油' },
            { itemId: '19', unitPrice: 650, totalPrice: 5200, deliveryTime: '1个工作日', remarks: '进口轮胎' },
          ],
          remarks: '高端服务，质量优先'
        },
      ]
    },
    {
      id: '11',
      requestNo: 'RFQ202401011',
      title: '食堂设备询价',
      department: '餐饮部',
      requestDate: '2024-01-26',
      deadline: '2024-02-05',
      status: 'selected',
      statusText: '已选定',
      description: '员工食堂厨房设备更新',
      items: [
        { id: '20', name: '商用冰箱', specification: '双门冷藏冷冻 600L', unit: '台', quantity: 2, estimatedPrice: 8000 },
        { id: '21', name: '蒸饭柜', specification: '24盘电蒸箱 不锈钢', unit: '台', quantity: 1, estimatedPrice: 12000 },
      ],
      quotations: [
        {
          id: '11',
          supplierId: '2',
          supplierName: '上海设备制造厂',
          quotationDate: '2024-01-28',
          validUntil: '2024-02-28',
          totalAmount: 26500,
          status: 'selected',
          items: [
            { itemId: '20', unitPrice: 7500, totalPrice: 15000, deliveryTime: '5个工作日', remarks: '节能环保' },
            { itemId: '21', unitPrice: 11500, totalPrice: 11500, deliveryTime: '7个工作日', remarks: '含安装' },
          ],
          remarks: '专业厨房设备制造商'
        },
        {
          id: '12',
          supplierId: '1',
          supplierName: '北京科技有限公司',
          quotationDate: '2024-01-29',
          validUntil: '2024-02-29',
          totalAmount: 28000,
          status: 'rejected',
          items: [
            { itemId: '20', unitPrice: 8000, totalPrice: 16000, deliveryTime: '7个工作日', remarks: '进口压缩机' },
            { itemId: '21', unitPrice: 12000, totalPrice: 12000, deliveryTime: '10个工作日', remarks: '智能控制' },
          ],
          remarks: '高端产品，价格偏高'
        }
      ]
    },
    {
      id: '12',
      requestNo: 'RFQ202401012',
      title: '绿化用品询价',
      department: '园林部',
      requestDate: '2024-01-27',
      deadline: '2024-02-06',
      status: 'completed',
      statusText: '已完成',
      description: '园区绿化养护用品采购',
      items: [
        { id: '22', name: '有机肥料', specification: '复合有机肥 25kg装', unit: '袋', quantity: 100, estimatedPrice: 45 },
        { id: '23', name: '园艺工具', specification: '修枝剪 浇水壶套装', unit: '套', quantity: 10, estimatedPrice: 120 },
      ],
      quotations: [
        {
          id: '13',
          supplierId: '3',
          supplierName: '广州电子科技',
          quotationDate: '2024-01-29',
          validUntil: '2024-02-29',
          totalAmount: 5700,
          status: 'selected',
          items: [
            { itemId: '22', unitPrice: 42, totalPrice: 4200, deliveryTime: '3个工作日', remarks: '有机认证' },
            { itemId: '23', unitPrice: 110, totalPrice: 1100, deliveryTime: '2个工作日', remarks: '进口工具' },
          ],
          remarks: '专业园艺用品供应商'
        },
      ]
    },
  ];

  useEffect(() => {
    // 使用全局状态中的询价单数据
    setFilteredData(quotationRequests);
  }, [quotationRequests]);

  // 处理从采购申请页面跳转过来的自动匹配和打开比价对话框
  useEffect(() => {
    console.log('自动打开useEffect执行:', {
      requisitionNumber,
      openComparison,
      quotationRequestsLength: quotationRequests.length,
      quotationRequests: quotationRequests.map(r => ({
        id: r.id,
        requestNo: r.requestNo,
        procurementRequisition: r.procurementRequisition
      }))
    });
    
    if (requisitionNumber && openComparison && quotationRequests.length > 0) {
      console.log('开始查找匹配的询价单...');
      // 查找匹配申请单号的询价单
      const matchedRecord = quotationRequests.find(
        request => request.procurementRequisition?.requisitionNumber === requisitionNumber
      );
      
      console.log('匹配结果:', matchedRecord);
      
      if (matchedRecord) {
        console.log('找到匹配的询价单，准备打开比价对话框');
        // 自动打开比价对话框
        handleCompare(matchedRecord);
        message.success(`已自动匹配申请单号 ${requisitionNumber} 并打开比价对话框`);
      } else {
        console.log('未找到匹配的询价单');
        message.warning(`未找到申请单号 ${requisitionNumber} 对应的询价单`);
      }
    } else {
      console.log('条件不满足，不执行自动打开逻辑');
    }
  }, [requisitionNumber, openComparison, quotationRequests]);

  const handleView = (record: QuotationRequest) => {
    setSelectedRecord(record);
    setIsDetailModalVisible(true);
  };

  const handleCompare = (record: QuotationRequest) => {
    setSelectedRecord(record);
    setIsComparisonModalVisible(true);
    
    // 检查是否已有选定的供应商
    const hasSelectedQuotation = record.quotations.some(q => q.status === 'selected');
    const hasSubmittedQuotation = record.quotations.some(q => q.status === 'submitted');
    
    setCanConfirm(hasSelectedQuotation || hasSubmittedQuotation);
    setIsConfirmed(record.status === 'completed');
  };

  const handleSelectQuotation = (quotationId: string) => {
    if (!selectedRecord) return;
    
    const updatedRecord = {
      ...selectedRecord,
      quotations: selectedRecord.quotations.map(q => ({
        ...q,
        status: q.id === quotationId ? 'selected' as const : 'rejected' as const
      }))
    };
    
    setSelectedRecord(updatedRecord);
    setCanConfirm(true);
    message.success('报价选定成功，请点击确定按钮完成询价');
  };

  // 确定按钮处理函数
  const handleConfirmSelection = () => {
    if (!selectedRecord) return;
    
    const updatedRecord = {
      ...selectedRecord,
      status: 'completed' as const,
      statusText: '已完成'
    };
    
    updateQuotationRequest(updatedRecord);
    setSelectedRecord(updatedRecord);
    setIsConfirmed(true);
    message.success('询价单已完成');
  };

  // 取消按钮处理函数
  const handleCancelComparison = () => {
    setIsComparisonModalVisible(false);
    setIsConfirmed(false);
    setCanConfirm(false);
  };

  // 生成订单按钮处理函数
  const handleGenerateOrder = () => {
    if (!selectedRecord) return;
    
    // 跳转到采购订单页面并传递询价单数据
    message.success('正在跳转到采购订单页面...');
    setIsComparisonModalVisible(false);
    
    // 使用React Router的navigate跳转到采购订单页面，并传递询价单编号
    navigate('/procurement/order', {
      state: {
        fromQuotation: true,
        quotationRequestId: selectedRecord.id,
        quotationRequestNo: selectedRecord.requestNo
      }
    });
  };

















  // 筛选处理
  const handleFilter = (values: any) => {
    let filtered = quotationRequests;

    // 询价单号筛选
    if (values.requestNo) {
      filtered = filtered.filter(item =>
        item.requestNo.toLowerCase().includes(values.requestNo.toLowerCase())
      );
    }

    // 询价标题筛选
    if (values.title) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(values.title.toLowerCase())
      );
    }

    // 申请部门筛选
    if (values.department) {
      filtered = filtered.filter(item =>
        item.department.toLowerCase().includes(values.department.toLowerCase())
      );
    }

    // 状态筛选
    if (values.status) {
      filtered = filtered.filter(item => item.status === values.status);
    }

    // 申请日期筛选
    if (values.requestDate && values.requestDate.length === 2) {
      const [startDate, endDate] = values.requestDate;
      filtered = filtered.filter(item => {
        const itemDate = dayjs(item.requestDate);
        return itemDate.isAfter(startDate.startOf('day')) && itemDate.isBefore(endDate.endOf('day'));
      });
    }

    // 截止日期筛选
    if (values.deadline && values.deadline.length === 2) {
      const [startDate, endDate] = values.deadline;
      filtered = filtered.filter(item => {
        const itemDate = dayjs(item.deadline);
        return itemDate.isAfter(startDate.startOf('day')) && itemDate.isBefore(endDate.endOf('day'));
      });
    }

    // 供应商筛选
    if (values.supplier) {
      filtered = filtered.filter(item =>
        item.suppliers.includes(values.supplier)
      );
    }

    setFilteredData(filtered);
  };

  // 状态快速筛选
  const handleQuickFilter = (status: string) => {
    if (status === 'all') {
      setFilteredData(quotationRequests);
    } else {
      setFilteredData(quotationRequests.filter(item => item.status === status));
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      inquiring: 'processing',
      quoted: 'warning',
      completed: 'success',
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const columns: ColumnsType<QuotationRequest> = [
    {
      title: '序号',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: '询价单号',
      dataIndex: 'requestNo',
      key: 'requestNo',
      width: 120,
    },
    {
      title: '询价标题',
      dataIndex: 'title',
      key: 'title',
      width: 200,
    },
    {
      title: '申请部门',
      dataIndex: 'department',
      key: 'department',
      width: 100,
    },
    {
      title: '申请单号',
      key: 'requisitionNumber',
      width: 120,
      render: (_, record) => record.procurementRequisition?.requisitionNumber || '-',
    },
    {
      title: '询价日期',
      dataIndex: 'requestDate',
      key: 'requestDate',
      width: 100,
    },
    {
      title: '截止日期',
      dataIndex: 'deadline',
      key: 'deadline',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'statusText',
      key: 'status',
      width: 80,
      render: (text, record) => (
        <Tag color={getStatusColor(record.status)}>{text}</Tag>
      ),
    },
    {
      title: '报价数量',
      key: 'quotationCount',
      width: 80,
      render: (_, record) => record.quotations.length,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            详情
          </Button>
          {record.quotations.length > 1 && record.status === 'quoted' && (
            <Button
              type="link"
              size="small"
              icon={<FileTextOutlined />}
              onClick={() => handleCompare(record)}
            >
              比价
            </Button>
          )}

        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
        <Card>
          <FilterBar onFilter={handleFilter} />
          
          <div className="mb-4 flex justify-between items-center">
            <div className="flex gap-2">
              <Button onClick={() => handleQuickFilter('all')}>全部</Button>
              <Button onClick={() => handleQuickFilter('inquiring')}>询价中</Button>
              <Button onClick={() => handleQuickFilter('quoted')}>已报价</Button>
              <Button onClick={() => handleQuickFilter('completed')}>已完成</Button>
            </div>
          </div>

          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="id"
            loading={loading}
            scroll={{ x: 1200 }}
            pagination={{
              total: filteredData.length,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`,
            }}
          />
        </Card>



        {/* 详情模态框 */}
        <Modal
        title="询价单详情"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={null}
        width={1000}
      >
        {selectedRecord && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="询价单号">{selectedRecord.requestNo}</Descriptions.Item>
              <Descriptions.Item label="申请单号">{selectedRecord.procurementRequisition?.requisitionNumber || '无关联申请'}</Descriptions.Item>
              <Descriptions.Item label="询价标题">{selectedRecord.title}</Descriptions.Item>
              <Descriptions.Item label="申请部门">{selectedRecord.department}</Descriptions.Item>
              <Descriptions.Item label="询价日期">{selectedRecord.requestDate}</Descriptions.Item>
              <Descriptions.Item label="截止日期">{selectedRecord.deadline}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={getStatusColor(selectedRecord.status)}>{selectedRecord.statusText}</Tag>
              </Descriptions.Item>

              <Descriptions.Item label="询价说明" span={2}>{selectedRecord.description}</Descriptions.Item>
            </Descriptions>

            <div className="mt-4">
              <h4>询价项目</h4>
              <Table
                size="small"
                dataSource={selectedRecord.items}
                rowKey="id"
                pagination={false}
                columns={[
                  { title: '项目名称', dataIndex: 'name', key: 'name' },
                  { title: '规格型号', dataIndex: 'specification', key: 'specification' },
                  { title: '单位', dataIndex: 'unit', key: 'unit', width: 60 },
                  { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 80 },
                  { title: '预估单价', dataIndex: 'estimatedPrice', key: 'estimatedPrice', width: 100, render: (value) => `¥${value}` },
                ]}
              />
            </div>

            <div className="mt-4">
              <h4>供应商报价</h4>
              {selectedRecord.quotations.map(quotation => (
                <Card key={quotation.id} size="small" className="mb-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{quotation.supplierName}</span>
                    <div>
                      <Tag color={quotation.status === 'selected' ? 'success' : quotation.status === 'rejected' ? 'error' : 'default'}>
                        {quotation.status === 'selected' ? '已选定' : quotation.status === 'rejected' ? '已拒绝' : '待处理'}
                      </Tag>
                      <span className="ml-2 text-lg font-bold text-red-500">¥{quotation.totalAmount}</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    报价日期：{quotation.quotationDate} | 有效期至：{quotation.validUntil}
                  </div>
                  {quotation.remarks && (
                    <div className="text-sm text-gray-600 mt-1">备注：{quotation.remarks}</div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}
        </Modal>

        {/* 比价模态框 */}
        <Modal
        title="报价比较"
        open={isComparisonModalVisible}
        onCancel={handleCancelComparison}
        footer={[
          <Button key="cancel" onClick={handleCancelComparison}>
            取消
          </Button>,
          <Button 
            key="confirm" 
            type="primary" 
            disabled={!canConfirm || isConfirmed}
            onClick={handleConfirmSelection}
          >
            确定
          </Button>,
          <Button 
            key="generate" 
            type="primary" 
            disabled={!isConfirmed}
            onClick={handleGenerateOrder}
            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
          >
            生成订单
          </Button>
        ]}
        width={1200}
      >
        {selectedRecord && (
          <div>
            <div className="mb-4">
              <h4>{selectedRecord.title} - 报价比较</h4>
            </div>
            
            {selectedRecord.quotations.map(quotation => (
              <Card 
                key={quotation.id} 
                className="mb-4"
                title={
                  <div className="flex justify-between items-center">
                    <span>{quotation.supplierName}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-red-500">总价：¥{quotation.totalAmount}</span>
                      {quotation.status === 'submitted' && (
                        <Button
                          type="primary"
                          size="small"
                          icon={<CheckOutlined />}
                          onClick={() => handleSelectQuotation(quotation.id)}
                        >
                          选定此报价
                        </Button>
                      )}
                      {quotation.status === 'selected' && (
                        <Tag color="success">已选定</Tag>
                      )}
                      {quotation.status === 'rejected' && (
                        <Tag color="error">已拒绝</Tag>
                      )}
                    </div>
                  </div>
                }
              >
                <div className="mb-2 text-sm text-gray-600">
                  报价日期：{quotation.quotationDate} | 有效期至：{quotation.validUntil}
                </div>
                <Table
                  size="small"
                  dataSource={quotation.items}
                  rowKey="itemId"
                  pagination={false}
                  columns={[
                    { 
                      title: '项目名称', 
                      key: 'itemName',
                      render: (_, record) => {
                        const item = selectedRecord.items.find(i => i.id === record.itemId);
                        return item?.name;
                      },
                    },
                    { title: '单价', dataIndex: 'unitPrice', key: 'unitPrice', render: (value) => `¥${value}` },
                    { title: '总价', dataIndex: 'totalPrice', key: 'totalPrice', render: (value) => `¥${value}` },
                    { title: '交货期', dataIndex: 'deliveryTime', key: 'deliveryTime' },
                    { title: '备注', dataIndex: 'remarks', key: 'remarks' },
                  ]}
                />
                {quotation.remarks && (
                  <div className="mt-2 text-sm">
                    <strong>供应商备注：</strong> {quotation.remarks}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
        </Modal>

        {/* 采购申请详情模态框 */}
        <Modal
          title="采购申请详情"
          open={isProcurementDetailModalVisible}
          onCancel={() => setIsProcurementDetailModalVisible(false)}
          footer={null}
          width={800}
        >
          {viewingProcurementRecord && (
            <div>
              <Descriptions bordered column={2}>
                <Descriptions.Item label="申请编号">{viewingProcurementRecord.requisitionNumber}</Descriptions.Item>
                <Descriptions.Item label="申请标题">{viewingProcurementRecord.description}</Descriptions.Item>
                <Descriptions.Item label="申请人">{viewingProcurementRecord.applicant}</Descriptions.Item>
                <Descriptions.Item label="申请部门">{viewingProcurementRecord.department}</Descriptions.Item>
                <Descriptions.Item label="申请日期">{viewingProcurementRecord.applicationDate}</Descriptions.Item>
                <Descriptions.Item label="期望交付日期">{viewingProcurementRecord.expectedDeliveryDate}</Descriptions.Item>
                <Descriptions.Item label="预算金额">¥{viewingProcurementRecord.budgetAmount}</Descriptions.Item>
                <Descriptions.Item label="审批状态">
                  <Tag color={
                    viewingProcurementRecord.approvalStatus === '审批通过' ? 'success' :
                    viewingProcurementRecord.approvalStatus === '审批中' ? 'processing' :
                    viewingProcurementRecord.approvalStatus === '已拒绝' ? 'error' : 'default'
                  }>
                    {viewingProcurementRecord.approvalStatus}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="申请说明" span={2}>
                  {viewingProcurementRecord.description}
                </Descriptions.Item>
                {viewingProcurementRecord.urgencyLevel && (
                  <Descriptions.Item label="紧急程度" span={2}>
                    <Tag color={
                      viewingProcurementRecord.urgencyLevel === '紧急' ? 'red' :
                      viewingProcurementRecord.urgencyLevel === '一般' ? 'orange' : 'green'
                    }>
                      {viewingProcurementRecord.urgencyLevel}
                    </Tag>
                  </Descriptions.Item>
                )}
              </Descriptions>

              {viewingProcurementRecord.items && viewingProcurementRecord.items.length > 0 && (
                <div className="mt-4">
                  <h4>采购物品清单</h4>
                  <Table
                    size="small"
                    dataSource={viewingProcurementRecord.items}
                    rowKey="id"
                    pagination={false}
                    columns={[
                      { title: '物品名称', dataIndex: 'name', key: 'name' },
                      { title: '规格型号', dataIndex: 'specification', key: 'specification' },
                      { title: '单位', dataIndex: 'unit', key: 'unit', width: 60 },
                      { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 80 },
                      { 
                        title: '预估单价', 
                        dataIndex: 'estimatedPrice', 
                        key: 'estimatedPrice', 
                        width: 100, 
                        render: (value) => value ? `¥${value}` : '-'
                      },
                      { 
                        title: '小计', 
                        key: 'subtotal', 
                        width: 100,
                        render: (_, record) => {
                          const subtotal = (record.estimatedPrice || 0) * record.quantity;
                          return `¥${subtotal}`;
                        }
                      },
                    ]}
                  />
                </div>
              )}

              {viewingProcurementRecord.approvalHistory && viewingProcurementRecord.approvalHistory.length > 0 && (
                <div className="mt-4">
                  <h4>审批历史</h4>
                  <Table
                    size="small"
                    dataSource={viewingProcurementRecord.approvalHistory}
                    rowKey="id"
                    pagination={false}
                    columns={[
                      { title: '审批人', dataIndex: 'approver', key: 'approver' },
                      { title: '审批时间', dataIndex: 'approvalDate', key: 'approvalDate' },
                      { 
                        title: '审批结果', 
                        dataIndex: 'result', 
                        key: 'result',
                        render: (result) => (
                          <Tag color={result === '通过' ? 'success' : result === '拒绝' ? 'error' : 'processing'}>
                            {result}
                          </Tag>
                        )
                      },
                      { title: '审批意见', dataIndex: 'comments', key: 'comments' },
                    ]}
                  />
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    );
  };
  
  export default QuotationComparison;