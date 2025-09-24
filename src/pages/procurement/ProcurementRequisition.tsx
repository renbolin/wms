import React, { useState } from 'react';
import { Button, Table, Modal, Form, Input, Select, DatePicker, Row, Col, Descriptions, Space, InputNumber, Card, Steps, Timeline, Tag, Divider, message } from 'antd';
import { EyeOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { useInquiry, QuotationRequest } from '@/contexts/InquiryContext';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

interface ProcurementRequisition {
  id: number;
  requisitionNumber: string;
  applicant: string;
  department: string;
  applicationDate: string;
  status: string;
  type: string; // 申请类型：应急采购、正常采购
  description: string; // 采购描述
  totalAmount?: number; // 总金额
  approvalStatus: string; // 审批状态
  processStatus: string; // 流程状态：draft(草稿)、submitted(已提交审批)、approved(审批通过)、rejected(已拒绝)
  currentApprover?: string; // 当前审批人
  rejectionReason?: string; // 拒绝原因
  rejectedBy?: string; // 拒绝人
  rejectedDate?: string; // 拒绝日期
  inquiryStatus?: string; // 询价状态：未开始、询价中、已完成
}





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
          <Form.Item name="requisitionNumber" label="申请单号">
            <Input placeholder="请输入申请单号" />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="applicant" label="申请人">
            <Input placeholder="请输入申请人" />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="department" label="申请部门">
            <Input placeholder="请输入申请部门" />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="description" label="采购描述">
            <Input placeholder="请输入采购描述" />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择状态" allowClear>
              <Option value="pending">待审批</Option>
              <Option value="approved">审批通过</Option>
              <Option value="rejected">已拒绝</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="type" label="申请类型">
            <Select placeholder="请选择申请类型" allowClear>
              <Option value="emergency">应急采购</Option>
              <Option value="normal">正常采购</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="approvalStatus" label="审批状态">
            <Select placeholder="请选择审批状态" allowClear>
              <Option value="pending">待审批</Option>
              <Option value="approved">已审批</Option>
              <Option value="rejected">已拒绝</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="processStatus" label="流程状态">
            <Select placeholder="请选择流程状态" allowClear>
              <Option value="draft">草稿</Option>
              <Option value="submitted">已提交审批</Option>
              <Option value="approved">审批通过</Option>
              <Option value="rejected">已拒绝</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="currentApprover" label="当前审批人">
            <Input placeholder="请输入当前审批人" />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="rejectionReason" label="拒绝原因">
            <Input placeholder="请输入拒绝原因" />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="rejectedBy" label="拒绝人">
            <Input placeholder="请输入拒绝人" />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="inquiryStatus" label="询价状态">
            <Select placeholder="请选择询价状态" allowClear>
              <Option value="not_started">未开始</Option>
              <Option value="in_progress">询价中</Option>
              <Option value="completed">已完成</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="applicationDate" label="申请日期">
            <RangePicker placeholder={['开始日期', '结束日期']} />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="rejectedDate" label="拒绝日期">
            <RangePicker placeholder={['开始日期', '结束日期']} />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="totalAmountRange" label="总金额范围">
            <Input.Group compact>
              <Input style={{ width: '45%' }} placeholder="最小金额" />
              <Input style={{ width: '10%', textAlign: 'center', pointerEvents: 'none' }} placeholder="~" disabled />
              <Input style={{ width: '45%' }} placeholder="最大金额" />
            </Input.Group>
          </Form.Item>
        </Col>
        <Col span={24} style={{ textAlign: 'right' }}>
          <Space>
            <Button type="primary" htmlType="submit">
              查询
            </Button>
            <Button onClick={onReset}>
              重置
            </Button>
          </Space>
        </Col>
      </Row>
    </Form>
  );
};

const ProcurementRequisition: React.FC = () => {
  const [form] = Form.useForm();
  const [inquiryForm] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ProcurementRequisition | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [viewingRecord, setViewingRecord] = useState<ProcurementRequisition | null>(null);
  const [isProgressModalVisible, setIsProgressModalVisible] = useState(false);
  const [progressRecord, setProgressRecord] = useState<ProcurementRequisition | null>(null);
  const [isInquiryModalVisible, setIsInquiryModalVisible] = useState(false);
  const [inquiryRecord, setInquiryRecord] = useState<ProcurementRequisition | null>(null);
  const [isInquiryDetailModalVisible, setIsInquiryDetailModalVisible] = useState(false);
  const [selectedQuotationRequest, setSelectedQuotationRequest] = useState<any>(null);
  const [filteredData, setFilteredData] = useState<ProcurementRequisition[]>([]);
  
  // 路由导航
  const navigate = useNavigate();
  
  // 使用全局状态管理
  const { addQuotationRequest, setProcurementRequisitions, getQuotationRequestsByProcurementId, quotationRequests } = useInquiry();

  // 供应商模拟数据
  const suppliers: any[] = [
    { id: '1', name: '北京科技有限公司', contact: '张经理', phone: '010-12345678', email: 'zhang@bjtech.com' },
    { id: '2', name: '上海办公用品公司', contact: '李经理', phone: '021-87654321', email: 'li@shoffice.com' },
    { id: '3', name: '深圳电子设备厂', contact: '王经理', phone: '0755-11223344', email: 'wang@szelectronics.com' },
    { id: '4', name: '广州工业材料公司', contact: '赵经理', phone: '020-99887766', email: 'zhao@gzmaterials.com' },
  ];

  // 模拟数据
  const mockData: ProcurementRequisition[] = [
    {
      id: 1,
      requisitionNumber: 'PR2024001',
      applicant: '张三',
      department: '行政部',
      applicationDate: '2024-01-15',
      status: 'pending',
      type: 'emergency',
      description: '办公用品紧急采购',
      totalAmount: 15000,
      approvalStatus: '审批中',
      processStatus: 'submitted', // 已提交审批
      currentApprover: '李经理',
      inquiryStatus: 'not_started'
    },
    {
      id: 2,
      requisitionNumber: 'PR2024002',
      applicant: '李四',
      department: 'IT部',
      applicationDate: '2024-01-16',
      status: 'approved',
      type: 'normal',
      description: '服务器设备采购',
      totalAmount: 50000,
      approvalStatus: '审批通过',
      processStatus: 'approved', // 审批通过
      currentApprover: '',
      inquiryStatus: '已完成'
    },
    {
      id: 3,
      requisitionNumber: 'PR2024003',
      applicant: '王五',
      department: '生产部',
      applicationDate: '2024-01-17',
      status: 'rejected',
      type: 'normal',
      description: '生产原材料采购',
      totalAmount: 30000,
      approvalStatus: '已拒绝',
      processStatus: 'rejected', // 已拒绝
      currentApprover: '',
      rejectionReason: '预算超出部门限额，建议重新评估采购需求或寻找更具性价比的供应商',
      rejectedBy: '财务经理',
      rejectedDate: '2024-01-18',
      inquiryStatus: '未开始'
    },
    {
      id: 4,
      requisitionNumber: 'PR2024004',
      applicant: '赵六',
      department: '市场部',
      applicationDate: '2024-01-18',
      status: 'approved',
      type: 'normal',
      description: '营销物料采购',
      totalAmount: 25000,
      approvalStatus: '审批通过',
      processStatus: 'approved', // 审批通过
      currentApprover: '',
      inquiryStatus: '询价中'
    },
    {
      id: 5,
      requisitionNumber: 'PR2024005',
      applicant: '孙七',
      department: '研发部',
      applicationDate: '2024-01-19',
      status: 'approved',
      type: 'emergency',
      description: '实验设备采购',
      totalAmount: 80000,
      approvalStatus: '审批通过',
      processStatus: 'approved', // 审批通过
      currentApprover: '',
      inquiryStatus: '询价中'
    },
    {
      id: 6,
      requisitionNumber: 'PR2024006',
      applicant: '周八',
      department: '财务部',
      applicationDate: '2024-01-20',
      status: 'approved',
      type: 'normal',
      description: '财务软件采购',
      totalAmount: 35000,
      approvalStatus: '审批通过',
      processStatus: 'approved', // 审批通过
      currentApprover: '',
      inquiryStatus: 'not_started'
    },
    {
      id: 7,
      requisitionNumber: 'PR2024007',
      applicant: '吴九',
      department: '人事部',
      applicationDate: '2024-01-21',
      status: 'approved',
      type: 'normal',
      description: '办公家具采购',
      totalAmount: 45000,
      approvalStatus: '审批通过',
      processStatus: 'approved', // 审批通过
      currentApprover: '',
      inquiryStatus: 'not_started'
    },
    {
      id: 8,
      requisitionNumber: 'PR2024008',
      applicant: '郑十',
      department: '采购部',
      applicationDate: '2024-01-22',
      status: 'approved',
      type: 'normal',
      description: '仓储设备采购',
      totalAmount: 60000,
      approvalStatus: '审批通过',
      processStatus: 'approved', // 审批通过
      currentApprover: '',
      inquiryStatus: 'not_started'
    },
    {
      id: 9,
      requisitionNumber: 'PR2024009',
      applicant: '钱十一',
      department: '质量部',
      applicationDate: '2024-01-23',
      status: 'pending',
      type: 'emergency',
      description: '检测设备采购',
      totalAmount: 120000,
      approvalStatus: '审批中',
      processStatus: 'submitted', // 已提交审批
      currentApprover: '总经理',
      inquiryStatus: 'not_started'
    },
    {
      id: 10,
      requisitionNumber: 'PR2024010',
      applicant: '孙十二',
      department: '安全部',
      applicationDate: '2024-01-24',
      status: 'approved',
      type: 'normal',
      description: '安防设备采购',
      totalAmount: 40000,
      approvalStatus: '审批通过',
      processStatus: 'approved', // 审批通过
      currentApprover: '',
      inquiryStatus: '已报价'
    },
    {
      id: 11,
      requisitionNumber: 'PR2024011',
      applicant: '陈十三',
      department: '技术部',
      applicationDate: '2024-01-25',
      status: 'inquiring',
      type: 'normal',
      description: '开发工具软件采购',
      totalAmount: 18000,
      approvalStatus: '草稿',
      processStatus: 'draft', // 草稿状态
      currentApprover: '',
      inquiryStatus: 'not_started'
    },
    {
      id: 12,
      requisitionNumber: 'PR2024012',
      applicant: '刘十四',
      department: '运营部',
      applicationDate: '2024-01-26',
      status: 'inquiring',
      type: 'emergency',
      description: '紧急维修材料采购',
      totalAmount: 8500,
      approvalStatus: '草稿',
      processStatus: 'draft', // 草稿状态
      currentApprover: '',
      inquiryStatus: 'not_started'
    },
    {
      id: 13,
      requisitionNumber: 'PR2024013',
      applicant: '黄十五',
      department: '销售部',
      applicationDate: '2024-01-27',
      status: 'pending',
      type: 'normal',
      description: '客户礼品采购',
      totalAmount: 12000,
      approvalStatus: '审批中',
      processStatus: 'submitted', // 已提交审批
      currentApprover: '部门经理',
      inquiryStatus: 'not_started'
    }
  ];

  React.useEffect(() => {
    setFilteredData(mockData);
    // 同步数据到全局状态
    setProcurementRequisitions(mockData);
  }, [setProcurementRequisitions]);

  const columns: TableProps<ProcurementRequisition>['columns'] = [
    {
      title: '序号',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: '申请单号',
      dataIndex: 'requisitionNumber',
      key: 'requisitionNumber',
    },
    {
      title: '申请人',
      dataIndex: 'applicant',
      key: 'applicant',
    },
    {
      title: '申请部门',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: '申请类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => type === 'emergency' ? '应急采购' : '正常采购',
    },
    {
      title: '采购描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '申请日期',
      dataIndex: 'applicationDate',
      key: 'applicationDate',
    },
    {
      title: '审批状态',
      dataIndex: 'approvalStatus',
      key: 'approvalStatus',
    },
    {
      title: '询价比价状态',
      dataIndex: 'inquiryStatus',
      key: 'inquiryStatus',
      render: (inquiryStatus: string, record: ProcurementRequisition) => {
        // 从全局状态获取该采购申请的询价单
        const relatedQuotations = getQuotationRequestsByProcurementId(record.id);
        let currentStatus = inquiryStatus || 'not_started';
        
        // 如果有关联的询价单，根据询价单状态更新显示
        if (relatedQuotations.length > 0) {
          const latestQuotation = relatedQuotations[relatedQuotations.length - 1];
          if (latestQuotation.status === 'inquiring') {
            currentStatus = 'in_progress';
          } else if (latestQuotation.status === 'quoted') {
            currentStatus = '已报价';
          } else if (latestQuotation.status === 'completed') {
            currentStatus = 'completed';
          }
        }
        
        // 支持中文状态直接显示
        const statusMap = {
          'not_started': '未开始',
          'in_progress': '询价中',
          'completed': '已完成',
          '未开始': '未开始',
          '询价中': '询价中',
          '已报价': '已报价',
          '已完成': '已完成'
        };
        const colorMap = {
          'not_started': 'default',
          'in_progress': 'processing',
          'completed': 'success',
          '未开始': 'default',
          '询价中': 'processing',
          '已报价': 'warning',
          '已完成': 'success'
        };
        
        const displayText = statusMap[currentStatus as keyof typeof statusMap] || '未开始';
        const color = colorMap[currentStatus as keyof typeof colorMap] || 'default';
        
        return (
          <Tag color={color}>
            {displayText}
          </Tag>
        );
      },
    },
    {
      title: '拒绝原因',
      dataIndex: 'rejectionReason',
      key: 'rejectionReason',
      ellipsis: true,
      render: (rejectionReason: string, record: ProcurementRequisition) => {
        if (record.status === 'rejected' && rejectionReason) {
          return (
            <div style={{ color: '#ff4d4f', maxWidth: '200px' }}>
              {rejectionReason}
            </div>
          );
        }
        return '-';
      },
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 320,
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleView(record)}>
            详情
          </Button>
          {/* 只有草稿状态的申请才能编辑 */}
          {record.processStatus === 'draft' && (
            <Button type="link" onClick={() => handleEdit(record)}>
              编辑
            </Button>
          )}
          {/* 只有草稿状态的申请才能删除 */}
          {record.processStatus === 'draft' && (
            <Button type="link" danger onClick={() => handleDelete(record.id)}>
              删除
            </Button>
          )}
          {/* 只有非草稿状态才显示进度详情 */}
          {record.processStatus !== 'draft' && (
            <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewProgress(record)}>
              进度详情
            </Button>
          )}
          {record.status === 'rejected' && (
            <Button type="link" onClick={() => handleReapply(record)}>
              重新申请
            </Button>
          )}
          {/* 审批通过 + 未开始：显示创建询价单 */}
          {record.processStatus === 'approved' && (record.inquiryStatus === 'not_started' || record.inquiryStatus === '未开始') && (
            <Button type="link" onClick={() => handleInquiry(record)}>
              创建询价
            </Button>
          )}
          {/* 审批通过 + 已完成：显示查看询价单详情 */}
          {record.processStatus === 'approved' && record.inquiryStatus === '已完成' && (
            <Button type="link" onClick={() => handleInquiry(record)}>
              询价详情
            </Button>
          )}
          {/* 审批通过 + 询价中：显示查看询价单详情 */}
          {record.processStatus === 'approved' && record.inquiryStatus === '询价中' && (
            <Button type="link" onClick={() => handleInquiry(record)}>
              询价详情
            </Button>
          )}
          {/* 审批通过 + 已报价：显示询价详情和比价按钮 */}
          {record.processStatus === 'approved' && record.inquiryStatus === '已报价' && (
            <>
              <Button type="link" onClick={() => handleInquiry(record)}>
                询价详情
              </Button>
              <Button type="link" onClick={() => handleComparison(record)}>
                比价
              </Button>
            </>
          )}
          {/* 审批中 + 未开始：不显示按钮 */}
        </Space>
      ),
    },
  ];

  const handleView = (record: ProcurementRequisition) => {
    setViewingRecord(record);
    setIsDetailModalVisible(true);
  };

  const handleViewProgress = (record: ProcurementRequisition) => {
    setProgressRecord(record);
    setIsProgressModalVisible(true);
  };

  const handleReapply = (record: ProcurementRequisition) => {
    // 复制原申请数据，重置状态相关字段
    const reapplyData = {
      ...record,
      id: undefined, // 清除ID，作为新申请
      requisitionNumber: '', // 清除申请单号，系统会自动生成
      status: 'pending',
      approvalStatus: '待部门经理审批',
      currentApprover: '李经理',
      rejectionReason: undefined,
      rejectedBy: undefined,
      rejectedDate: undefined,
      applicationDate: dayjs().format('YYYY-MM-DD') // 设置为当前日期
    };
    
    setEditingRecord(null); // 设置为null表示新增模式
    form.setFieldsValue({
      ...reapplyData,
      applicationDate: dayjs(), // 表单中使用dayjs对象
    });
    setIsModalVisible(true);
  };

  const handleEdit = (record: ProcurementRequisition) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      applicationDate: record.applicationDate ? dayjs(record.applicationDate) : null,
    });
    setIsModalVisible(true);
  };

  const handleDelete = (id: number) => {
    const newData = filteredData.filter(item => item.id !== id);
    setFilteredData(newData);
  };

  const handleInquiry = (record: ProcurementRequisition) => {
    console.log('handleInquiry called with record:', record);
    console.log('quotationRequests:', quotationRequests);
    setInquiryRecord(record);
    
    if (record.inquiryStatus === 'not_started' || record.inquiryStatus === '未开始') {
      // 审批通过 + 未开始：显示创建询价单的表单（图二的样子）
      inquiryForm.setFieldsValue({
        title: `${record.description} - 询价单`,
        department: record.department,
        requestDate: dayjs(),
        deadline: dayjs().add(7, 'day'),
        description: `基于采购申请 ${record.requisitionNumber} 创建的询价单`,
        items: [{
          name: record.description.includes('办公用品') ? '办公桌椅' :
                record.description.includes('设备') ? '生产设备' :
                record.description.includes('材料') ? '原材料' : '物品',
          specification: record.description.includes('办公用品') ? '标准办公桌椅套装' :
                        record.description.includes('设备') ? '工业级生产设备' :
                        record.description.includes('材料') ? '优质原材料' : '标准规格',
          unit: '套',
          quantity: 1,
          estimatedPrice: record.description.includes('办公用品') ? 2000 :
                         record.description.includes('设备') ? 50000 :
                         record.description.includes('材料') ? 5000 : 1000
        }],
        suppliers: []
      });
      setIsInquiryModalVisible(true);
    } else {
      // 审批通过 + 已完成 或 询价中：显示只读的询价单详情
      // 特殊处理PR2024002，显示INQ-2024-002的真实详情
      if (record.requisitionNumber === 'PR2024002') {
        console.log('Processing PR2024002, looking for INQ-2024-002');
        // 从InquiryContext中获取INQ-2024-002的详情
        const inq2024002 = quotationRequests.find(req => req.requestNo === 'INQ-2024-002');
        console.log('Found INQ-2024-002:', inq2024002);
        if (inq2024002) {
          console.log('Setting selectedQuotationRequest and showing modal');
          setSelectedQuotationRequest(inq2024002);
          setIsInquiryDetailModalVisible(true);
          return;
        } else {
          console.log('INQ-2024-002 not found in quotationRequests');
        }
      }
      
      // 其他情况使用模拟数据
      const mockQuotationRequest: QuotationRequest = {
        id: `mock-${record.id}`,
        requestNo: `RFQ${record.requisitionNumber.slice(-6)}`,
        title: `${record.description} - 询价单`,
        department: record.department,
        requestDate: record.applicationDate,
        deadline: dayjs(record.applicationDate).add(7, 'day').format('YYYY-MM-DD'),
        description: `基于采购申请 ${record.requisitionNumber} 创建的询价单`,
        items: [{
          id: '1',
          name: record.description.includes('办公用品') ? '办公桌椅' : 
                record.description.includes('设备') ? '生产设备' :
                record.description.includes('材料') ? '原材料' : '物品',
          specification: record.description.includes('办公用品') ? '标准办公桌椅套装' :
                        record.description.includes('设备') ? '工业级生产设备' :
                        record.description.includes('材料') ? '优质原材料' : '标准规格',
          unit: '套',
          quantity: 1,
          estimatedPrice: record.description.includes('办公用品') ? 2000 :
                         record.description.includes('设备') ? 50000 :
                         record.description.includes('材料') ? 5000 : 1000
        }],
        suppliers: ['供应商A', '供应商B', '供应商C'],
        status: record.inquiryStatus === '已完成' ? 'completed' : 'inquiring',
        statusText: record.inquiryStatus === '已完成' ? '已完成' : '询价中',
        quotations: [],
        procurementRequisition: {
          id: record.id,
          requisitionNumber: record.requisitionNumber,
          applicant: record.applicant,
          department: record.department,
          applicationDate: record.applicationDate,
          description: record.description
        }
      };
      
      setSelectedQuotationRequest(mockQuotationRequest);
      setIsInquiryDetailModalVisible(true);
    }
  };



  const handleInquiryOk = async () => {
    try {
      const values = await inquiryForm.validateFields();
      
      // 创建询价单对象
       const quotationRequest: QuotationRequest = {
         id: Date.now().toString(),
         requestNo: `RFQ${Date.now()}`,
         title: values.title,
         department: values.department,
         requestDate: values.requestDate.format('YYYY-MM-DD'),
         deadline: values.deadline.format('YYYY-MM-DD'),
         description: values.description,
         items: values.items || [],
         suppliers: values.suppliers || [],
         status: 'inquiring',
         statusText: '草稿',
         quotations: [],
         procurementRequisition: inquiryRecord ? {
           id: inquiryRecord.id,
           requisitionNumber: inquiryRecord.requisitionNumber,
           applicant: inquiryRecord.applicant,
           department: inquiryRecord.department,
           applicationDate: inquiryRecord.applicationDate,
           description: inquiryRecord.description
         } : undefined
       };
      
      // 添加到全局状态
      addQuotationRequest(quotationRequest);
      
      message.success('询价单创建成功');
      
      // 更新采购申请的询价状态
      if (inquiryRecord) {
        const updatedData = filteredData.map(item => 
          item.id === inquiryRecord.id 
            ? { ...item, inquiryStatus: 'in_progress' }
            : item
        );
        setFilteredData(updatedData);
      }
      
      setIsInquiryModalVisible(false);
      setInquiryRecord(null);
      inquiryForm.resetFields();
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handleInquiryCancel = () => {
    setIsInquiryModalVisible(false);
    setInquiryRecord(null);
    inquiryForm.resetFields();
  };

  const handleComparison = (record: ProcurementRequisition) => {
    // 跳转到询价详情页面进行比价，传递申请单号参数
    navigate('/procurement/quotation', { 
      state: { 
        requisitionNumber: record.requisitionNumber,
        openComparison: true 
      } 
    });
  };

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // 存为草稿
  const handleSaveDraft = () => {
    form.validateFields().then(values => {
      const formattedValues = {
        ...values,
        applicationDate: values.applicationDate ? values.applicationDate.format('YYYY-MM-DD') : ''
      };
      
      if (editingRecord) {
        const newData = filteredData.map(item => 
          item.id === editingRecord.id ? { ...item, ...formattedValues, status: 'inquiring' } : item
        );
        setFilteredData(newData);
      } else {
        const newRecord = {
          id: Date.now(),
          ...formattedValues,
          status: 'inquiring', // 询价状态
          approvalStatus: '草稿',
          processStatus: 'draft', // 流程状态为草稿
          currentApprover: '',
          inquiryStatus: 'not_started'
        };
        setFilteredData([...filteredData, newRecord]);
      }
      setIsModalVisible(false);
      message.success('已保存为草稿');
    }).catch(() => {
      // 验证失败时也可以保存草稿，但只保存已填写的字段
      const values = form.getFieldsValue();
      const formattedValues = {
        ...values,
        applicationDate: values.applicationDate ? values.applicationDate.format('YYYY-MM-DD') : ''
      };
      
      if (editingRecord) {
        const newData = filteredData.map(item => 
          item.id === editingRecord.id ? { ...item, ...formattedValues, status: 'inquiring' } : item
        );
        setFilteredData(newData);
      } else {
        const newRecord = {
          id: Date.now(),
          ...formattedValues,
          status: 'inquiring',
          approvalStatus: '草稿',
          processStatus: 'draft',
          currentApprover: '',
          inquiryStatus: 'not_started'
        };
        setFilteredData([...filteredData, newRecord]);
      }
      setIsModalVisible(false);
      message.success('已保存为草稿');
    });
  };

  // 创建申请
  const handleCreateApplication = () => {
    form.validateFields().then(values => {
      const formattedValues = {
        ...values,
        applicationDate: values.applicationDate ? values.applicationDate.format('YYYY-MM-DD') : ''
      };
      
      if (editingRecord) {
        const newData = filteredData.map(item => 
          item.id === editingRecord.id ? { 
            ...item, 
            ...formattedValues, 
            status: 'inquiring',
            approvalStatus: '待审批',
            processStatus: 'pending'
          } : item
        );
        setFilteredData(newData);
      } else {
        const newRecord = {
          id: Date.now(),
          ...formattedValues,
          status: 'inquiring', // 询价中状态
          approvalStatus: '待审批',
          processStatus: 'pending', // 流程状态为待审批
          currentApprover: '张经理',
          inquiryStatus: 'not_started'
        };
        setFilteredData([...filteredData, newRecord]);
      }
      setIsModalVisible(false);
      message.success('申请已创建并提交审批');
    });
  };



  const handleCancel = () => {
    setIsModalVisible(false);
    setIsDetailModalVisible(false);
  };

  const handleFilter = (values: any) => {
    let filtered = mockData;
    
    if (values.requisitionNumber) {
      filtered = filtered.filter(item => 
        item.requisitionNumber.includes(values.requisitionNumber)
      );
    }
    
    if (values.applicant) {
      filtered = filtered.filter(item => 
        item.applicant.includes(values.applicant)
      );
    }
    
    if (values.department) {
      filtered = filtered.filter(item => 
        item.department.includes(values.department)
      );
    }
    
    if (values.status) {
      filtered = filtered.filter(item => item.status === values.status);
    }
    
    if (values.type) {
      filtered = filtered.filter(item => item.type === values.type);
    }
    
    if (values.applicationDate && values.applicationDate.length === 2) {
      const [start, end] = values.applicationDate;
      filtered = filtered.filter(item => {
        const itemDate = dayjs(item.applicationDate);
        return itemDate.isAfter(start.subtract(1, 'day')) && itemDate.isBefore(end.add(1, 'day'));
      });
    }
    
    setFilteredData(filtered);
  };

  return (
    <div>
      <FilterBar onFilter={handleFilter} />
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={handleAdd}>
          新增采购申请
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        scroll={{ x: 1700 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`,
        }}
      />
      
      {/* 新增/编辑模态框 */}
      <Modal
        title={editingRecord ? '编辑采购申请' : '新增采购申请'}
        open={isModalVisible}
        onCancel={handleCancel}
        width={800}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            取消
          </Button>,
          <Button key="draft" onClick={handleSaveDraft}>
            存为草稿
          </Button>,
          <Button key="create" type="primary" onClick={handleCreateApplication}>
            创建申请
          </Button>
        ]}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="requisitionNumber"
                label="申请单号"
                rules={[{ required: true, message: '请输入申请单号' }]}
              >
                <Input placeholder="请输入申请单号" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="applicant"
                label="申请人"
                rules={[{ required: true, message: '请输入申请人' }]}
              >
                <Input placeholder="请输入申请人" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="department"
                label="申请部门"
                rules={[{ required: true, message: '请输入申请部门' }]}
              >
                <Input placeholder="请输入申请部门" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="applicationDate"
                label="申请日期"
                rules={[{ required: true, message: '请选择申请日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="申请类型"
                rules={[{ required: true, message: '请选择申请类型' }]}
              >
                <Select placeholder="请选择申请类型">
                  <Option value="emergency">应急采购</Option>
                  <Option value="normal">正常采购</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="description"
                label="采购描述"
                rules={[{ required: true, message: '请输入采购描述' }]}
              >
                <TextArea rows={4} placeholder="请输入采购描述" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="totalAmount"
                label="总金额"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="请输入总金额"
                  min={0}
                  precision={2}
                  formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => (Number(value!.replace(/¥\s?|(,*)/g, '')) || 0) as any}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* 详情模态框 */}
      <Modal
        title="采购申请详情"
        open={isDetailModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="close" onClick={handleCancel}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {viewingRecord && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="申请单号">{viewingRecord.requisitionNumber}</Descriptions.Item>
            <Descriptions.Item label="申请人">{viewingRecord.applicant}</Descriptions.Item>
            <Descriptions.Item label="申请部门">{viewingRecord.department}</Descriptions.Item>
            <Descriptions.Item label="申请日期">{viewingRecord.applicationDate}</Descriptions.Item>
            <Descriptions.Item label="申请类型">
              {viewingRecord.type === 'emergency' ? '应急采购' : '正常采购'}
            </Descriptions.Item>
            <Descriptions.Item label="总金额">
              {viewingRecord.totalAmount ? `¥${viewingRecord.totalAmount.toLocaleString()}` : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              {viewingRecord.status === 'pending' ? '待审批' : 
               viewingRecord.status === 'approved' ? '审批通过' : '已拒绝'}
            </Descriptions.Item>
            <Descriptions.Item label="审批状态" span={2}>{viewingRecord.approvalStatus}</Descriptions.Item>
            <Descriptions.Item label="当前审批人" span={2}>{viewingRecord.currentApprover || '-'}</Descriptions.Item>
            {viewingRecord.status === 'rejected' && viewingRecord.rejectionReason && (
              <>
                <Descriptions.Item label="拒绝人">{viewingRecord.rejectedBy}</Descriptions.Item>
                <Descriptions.Item label="拒绝日期">{viewingRecord.rejectedDate}</Descriptions.Item>
                <Descriptions.Item label="拒绝原因" span={2}>
                  <div style={{ color: '#ff4d4f', padding: '8px', backgroundColor: '#fff2f0', border: '1px solid #ffccc7', borderRadius: '4px' }}>
                    {viewingRecord.rejectionReason}
                  </div>
                </Descriptions.Item>
              </>
            )}
            <Descriptions.Item label="采购描述" span={2}>{viewingRecord.description}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* 进度详情模态框 */}
      <Modal
        title="流程跟踪详情"
        open={isProgressModalVisible}
        onCancel={() => setIsProgressModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsProgressModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={1000}
      >
        {progressRecord && (
          <div>
            {/* 基本信息 */}
            <Card title="基本信息" style={{ marginBottom: 16 }}>
              <Descriptions bordered column={2}>
                <Descriptions.Item label="申请单号">{progressRecord.requisitionNumber}</Descriptions.Item>
                <Descriptions.Item label="申请人">{progressRecord.applicant}</Descriptions.Item>
                <Descriptions.Item label="申请部门">{progressRecord.department}</Descriptions.Item>
                <Descriptions.Item label="申请日期">{progressRecord.applicationDate}</Descriptions.Item>
                <Descriptions.Item label="审批流程">采购申请审批流程</Descriptions.Item>
                <Descriptions.Item label="当前状态">
                  <Tag color={progressRecord.status === 'approved' ? 'green' : progressRecord.status === 'rejected' ? 'red' : 'blue'}>
                    {progressRecord.status === 'approved' ? '审批通过' : progressRecord.status === 'rejected' ? '已拒绝' : '审批中'}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* 流程进度 */}
            <Card title="流程进度" style={{ marginBottom: 16 }}>
              <Steps current={getProgressCurrentStep(progressRecord)} status={progressRecord.status === 'rejected' ? 'error' : undefined}>
                <Steps.Step
                  title="部门主管审批"
                  description={getStepDescription(progressRecord, 0)}
                />
                <Steps.Step
                  title="财务审批"
                  description={getStepDescription(progressRecord, 1)}
                />
                <Steps.Step
                  title="总经理审批"
                  description={getStepDescription(progressRecord, 2)}
                />
              </Steps>
            </Card>

            {/* 审批历史 */}
            <Card title="审批历史">
              <Timeline>
                {getProgressHistory(progressRecord).map((history, index) => (
                  <Timeline.Item
                    key={index}
                    dot={getTimelineIcon(history.action)}
                    color={getTimelineColor(history.action)}
                  >
                    <div>
                      <Row gutter={16}>
                        <Col span={12}>
                          <strong>{history.stepName}</strong>
                        </Col>
                        <Col span={12} style={{ textAlign: 'right' }}>
                          <span style={{ color: '#666' }}>{history.processTime}</span>
                        </Col>
                      </Row>
                      <Row gutter={16} style={{ marginTop: 8 }}>
                        <Col span={8}>
                          <span>审批人：{history.approver}</span>
                        </Col>
                        <Col span={8}>
                          <span>角色：{history.approverRole}</span>
                        </Col>
                        <Col span={8}>
                          <span>处理时长：{history.duration || '处理中'}</span>
                        </Col>
                      </Row>
                      {history.comment && (
                        <Row gutter={16} style={{ marginTop: 8 }}>
                          <Col span={24}>
                            <span>审批意见：{history.comment}</span>
                          </Col>
                        </Row>
                      )}
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>
          </div>
        )}
      </Modal>

      {/* 询价详情弹窗 */}
      <Modal
        title="创建询价单"
        open={isInquiryModalVisible}
        onOk={handleInquiryOk}
        onCancel={handleInquiryCancel}
        width={1000}
        okText="创建询价单"
        cancelText="取消"
      >
        {inquiryRecord && (
          <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
            <Row gutter={16}>
              <Col span={12}>
                <strong>关联采购申请：</strong>{inquiryRecord.requisitionNumber}
              </Col>
              <Col span={12}>
                <strong>申请部门：</strong>{inquiryRecord.department}
              </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: 8 }}>
              <Col span={12}>
                <strong>申请人：</strong>{inquiryRecord.applicant}
              </Col>
              <Col span={12}>
                <strong>申请日期：</strong>{inquiryRecord.applicationDate}
              </Col>
            </Row>
          </div>
        )}
        
        <Form form={inquiryForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="title"
                label="询价单标题"
                rules={[{ required: true, message: '请输入询价单标题' }]}
              >
                <Input placeholder="请输入询价单标题" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="department"
                label="申请部门"
                rules={[{ required: true, message: '请输入申请部门' }]}
              >
                <Input placeholder="请输入申请部门" disabled />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="requestDate"
                label="询价日期"
                rules={[{ required: true, message: '请选择询价日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="deadline"
                label="截止日期"
                rules={[{ required: true, message: '请选择截止日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="description"
            label="询价说明"
            rules={[{ required: true, message: '请输入询价说明' }]}
          >
            <TextArea rows={3} placeholder="请输入询价说明" />
          </Form.Item>
          
          <Divider>询价物品清单</Divider>
          
          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card key={key} size="small" style={{ marginBottom: 16 }}>
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          name={[name, 'name']}
                          label="物品名称"
                          rules={[{ required: true, message: '请输入物品名称' }]}
                        >
                          <Input placeholder="请输入物品名称" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          name={[name, 'specification']}
                          label="规格型号"
                          rules={[{ required: true, message: '请输入规格型号' }]}
                        >
                          <Input placeholder="请输入规格型号" />
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Form.Item
                          {...restField}
                          name={[name, 'unit']}
                          label="单位"
                          rules={[{ required: true, message: '请输入单位' }]}
                        >
                          <Input placeholder="单位" />
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Form.Item
                          {...restField}
                          name={[name, 'quantity']}
                          label="数量"
                          rules={[{ required: true, message: '请输入数量' }]}
                        >
                          <InputNumber min={1} placeholder="数量" style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          name={[name, 'estimatedPrice']}
                          label="预估单价"
                          rules={[{ required: true, message: '请输入预估单价' }]}
                        >
                          <InputNumber
                            min={0}
                            precision={2}
                            placeholder="预估单价"
                            style={{ width: '100%' }}
                            addonAfter="元"
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, 'description']}
                          label="备注说明"
                        >
                          <Input placeholder="备注说明（可选）" />
                        </Form.Item>
                      </Col>
                      <Col span={4} style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <Form.Item>
                          <Button
                            type="link"
                            danger
                            icon={<MinusCircleOutlined />}
                            onClick={() => remove(name)}
                            disabled={fields.length === 1}
                          >
                            删除
                          </Button>
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    添加询价物品
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
          
          <Divider>供应商选择</Divider>
          
          <Form.Item
            name="suppliers"
            label="选择供应商"
            rules={[{ required: true, message: '请至少选择一个供应商' }]}
          >
            <Select
              mode="multiple"
              placeholder="请选择供应商"
              style={{ width: '100%' }}
            >
              {suppliers.map(supplier => (
                <Option key={supplier.id} value={supplier.id}>
                  {supplier.name} - {supplier.contact} ({supplier.phone})
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 询价单详情展示弹窗 */}
      <Modal
        title="询价单详情"
        open={isInquiryDetailModalVisible}
        onCancel={() => setIsInquiryDetailModalVisible(false)}
        footer={null}
        width={1000}
      >
        {selectedQuotationRequest && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="询价单号">{selectedQuotationRequest.requestNo || `RFQ${selectedQuotationRequest.procurementRequisition?.requisitionNumber?.slice(-6) || ''}`}</Descriptions.Item>
              <Descriptions.Item label="询价标题">{selectedQuotationRequest.title}</Descriptions.Item>
              <Descriptions.Item label="申请部门">{selectedQuotationRequest.department}</Descriptions.Item>
              <Descriptions.Item label="询价日期">{selectedQuotationRequest.requestDate}</Descriptions.Item>
              <Descriptions.Item label="截止日期">{selectedQuotationRequest.deadline}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={selectedQuotationRequest.status === 'completed' ? 'success' : selectedQuotationRequest.status === 'quoted' ? 'processing' : 'default'}>
                  {selectedQuotationRequest.statusText || '询价中'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="询价说明" span={2}>{selectedQuotationRequest.description}</Descriptions.Item>
            </Descriptions>

            <div className="mt-4">
              <h4>询价项目</h4>
              <Table
                size="small"
                dataSource={selectedQuotationRequest.items}
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
              {selectedQuotationRequest.quotations && selectedQuotationRequest.quotations.length > 0 ? (
                selectedQuotationRequest.quotations.map((quotation: any) => (
                  <Card key={quotation.id} size="small" className="mb-2">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{quotation.supplierName}</span>
                      <div>
                        <Tag color={quotation.status === 'selected' ? 'success' : quotation.status === 'rejected' ? 'error' : 'default'}>
                          {quotation.status === 'selected' ? '已选定' : quotation.status === 'rejected' ? '已拒绝' : '待处理'}
                        </Tag>
                        <span className="ml-2 text-lg font-bold text-red-500">¥{quotation.totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      报价日期：{quotation.quotationDate} | 有效期至：{quotation.validUntil}
                    </div>
                    {quotation.remarks && (
                      <div className="text-sm text-gray-600 mt-1">备注：{quotation.remarks}</div>
                    )}
                  </Card>
                ))
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '40px 0', 
                  color: '#999',
                  backgroundColor: '#fafafa',
                  border: '1px dashed #d9d9d9',
                  borderRadius: 6
                }}>
                  暂无供应商报价
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// 辅助函数
const getProgressCurrentStep = (record: ProcurementRequisition) => {
  if (record.status === 'pending') {
    return 0; // 当前在第一步
  } else if (record.status === 'approved') {
    return 3; // 全部完成
  } else {
    return 0; // 被拒绝时显示在第一步
  }
};

const getStepDescription = (record: ProcurementRequisition, stepIndex: number) => {
  const stepNames = ['张主管', '李财务', '王总经理'];

  
  if (record.status === 'approved') {
    return `${stepNames[stepIndex]} 已同意`;
  } else if (record.status === 'rejected' && stepIndex === 0) {
    return `${stepNames[stepIndex]} 已拒绝`;
  } else if (record.status === 'pending' && stepIndex === 0) {
    return `等待 ${stepNames[stepIndex]} 审批`;
  } else {
    return `等待 ${stepNames[stepIndex]} 审批`;
  }
};

const getProgressHistory = (record: ProcurementRequisition) => {
  const baseHistory = [
    {
      stepName: '申请提交',
      approver: record.applicant,
      approverRole: '申请人',
      action: 'submitted',
      processTime: record.applicationDate,
      duration: '-',
      comment: '提交采购申请'
    }
  ];

  if (record.status === 'approved') {
    baseHistory.push(
      {
        stepName: '部门主管审批',
        approver: '张主管',
        approverRole: '部门主管',
        action: 'approved',
        processTime: '2024-01-16 10:30:00',
        duration: '2小时',
        comment: '同意采购申请，预算充足'
      },
      {
        stepName: '财务审批',
        approver: '李财务',
        approverRole: '财务经理',
        action: 'approved',
        processTime: '2024-01-16 14:20:00',
        duration: '3小时50分钟',
        comment: '财务审核通过，资金可用'
      },
      {
        stepName: '总经理审批',
        approver: '王总经理',
        approverRole: '总经理',
        action: 'approved',
        processTime: '2024-01-17 09:15:00',
        duration: '19小时',
        comment: '最终审批通过，可以执行采购'
      }
    );
  } else if (record.status === 'rejected') {
    baseHistory.push({
      stepName: '部门主管审批',
      approver: '张主管',
      approverRole: '部门主管',
      action: 'rejected',
      processTime: '2024-01-16 10:30:00',
      duration: '2小时',
      comment: '预算不足，请重新申请'
    });
  } else {
    baseHistory.push({
      stepName: '部门主管审批',
      approver: '张主管',
      approverRole: '部门主管',
      action: 'pending',
      processTime: '-',
      duration: '处理中',
      comment: ''
    });
  }

  return baseHistory;
};

const getTimelineIcon = (action: string) => {
  switch (action) {
    case 'approved':
      return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
    case 'rejected':
      return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
    case 'pending':
      return <ClockCircleOutlined style={{ color: '#1890ff' }} />;
    case 'submitted':
      return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
    default:
      return <ClockCircleOutlined />;
  }
};

const getTimelineColor = (action: string) => {
  switch (action) {
    case 'approved':
    case 'submitted':
      return 'green';
    case 'rejected':
      return 'red';
    case 'pending':
      return 'blue';
    default:
      return 'gray';
  }
};

export default ProcurementRequisition;