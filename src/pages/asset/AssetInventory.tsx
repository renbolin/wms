import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Modal, Form, Input, Select, Space, Tag, message, Descriptions, Row, Col, DatePicker, Progress, Statistic } from 'antd';
import { PlusOutlined, EditOutlined, EyeOutlined, DeleteOutlined, SearchOutlined, CheckOutlined, FileTextOutlined, ScanOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

// 盘点计划接口
interface InventoryPlan {
  id: string;
  planNo: string;
  planName: string;
  planType: 'full' | 'partial' | 'spot';
  planTypeText: string;
  department: string;
  assetCategory: string;
  location: string;
  planDate: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'approved' | 'in_progress' | 'completed' | 'cancelled';
  statusText: string;
  totalAssets: number;
  checkedAssets: number;
  normalAssets: number;
  abnormalAssets: number;
  missingAssets: number;
  excessAssets: number;
  progress: number;
  planUser: string;
  approver?: string;
  approveDate?: string;
  description: string;
  createUser: string;
  createDate: string;
  updateUser?: string;
  updateDate?: string;
}

// 盘点明细接口
interface InventoryDetail {
  id: string;
  planId: string;
  assetCode: string;
  assetName: string;
  assetType: string;
  specification: string;
  originalLocation: string;
  actualLocation: string;
  originalCustodian: string;
  actualCustodian: string;
  originalStatus: string;
  actualStatus: string;
  checkResult: 'normal' | 'abnormal' | 'missing' | 'excess';
  checkResultText: string;
  checkDate: string;
  checker: string;
  remarks: string;
  photos?: string[];
}

const AssetInventory: React.FC = () => {
  const [data, setData] = useState<InventoryPlan[]>([]);
  const [filteredData, setFilteredData] = useState<InventoryPlan[]>([]);
  const [detailData, setDetailData] = useState<InventoryDetail[]>([]);
  const [loading, _setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isCheckModalVisible, setIsCheckModalVisible] = useState(false);
  const [isResultModalVisible, setIsResultModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<InventoryPlan | null>(null);
  const [editingRecord, setEditingRecord] = useState<InventoryPlan | null>(null);
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [checkForm] = Form.useForm();

  // 模拟数据
  const mockData: InventoryPlan[] = [
    {
      id: '1',
      planNo: 'IP20240130001',
      planName: '2024年第一季度全面盘点',
      planType: 'full',
      planTypeText: '全面盘点',
      department: '全公司',
      assetCategory: '全部',
      location: '全部',
      planDate: '2024-01-30',
      startDate: '2024-02-01',
      endDate: '2024-02-15',
      status: 'in_progress',
      statusText: '盘点中',
      totalAssets: 150,
      checkedAssets: 95,
      normalAssets: 85,
      abnormalAssets: 8,
      missingAssets: 2,
      excessAssets: 0,
      progress: 63,
      planUser: '张三',
      approver: '李四',
      approveDate: '2024-01-31',
      description: '对公司所有固定资产进行全面盘点，确保账实相符',
      createUser: '张三',
      createDate: '2024-01-30 09:00:00',
      updateUser: '张三',
      updateDate: '2024-02-05 16:30:00',
    },
    {
      id: '2',
      planNo: 'IP20240125001',
      planName: 'IT设备专项盘点',
      planType: 'partial',
      planTypeText: '部分盘点',
      department: '技术部',
      assetCategory: '电子设备',
      location: 'A栋办公楼',
      planDate: '2024-01-25',
      startDate: '2024-01-26',
      endDate: '2024-01-30',
      status: 'completed',
      statusText: '已完成',
      totalAssets: 45,
      checkedAssets: 45,
      normalAssets: 42,
      abnormalAssets: 2,
      missingAssets: 1,
      excessAssets: 0,
      progress: 100,
      planUser: '王五',
      approver: '李四',
      approveDate: '2024-01-25',
      description: '对技术部门的IT设备进行专项盘点',
      createUser: '王五',
      createDate: '2024-01-25 10:15:00',
      updateUser: '王五',
      updateDate: '2024-01-30 17:00:00',
    },
    {
      id: '3',
      planNo: 'IP20240120001',
      planName: '办公家具抽查盘点',
      planType: 'spot',
      planTypeText: '抽查盘点',
      department: '行政部',
      assetCategory: '办公家具',
      location: 'B栋办公楼',
      planDate: '2024-01-20',
      startDate: '2024-01-22',
      endDate: '2024-01-24',
      status: 'completed',
      statusText: '已完成',
      totalAssets: 30,
      checkedAssets: 30,
      normalAssets: 28,
      abnormalAssets: 2,
      missingAssets: 0,
      excessAssets: 0,
      progress: 100,
      planUser: '赵六',
      approver: '张三',
      approveDate: '2024-01-21',
      description: '对办公家具进行抽查盘点，重点检查使用状况',
      createUser: '赵六',
      createDate: '2024-01-20 14:30:00',
      updateUser: '赵六',
      updateDate: '2024-01-24 16:45:00',
    },
    {
      id: '4',
      planNo: 'IP20240115001',
      planName: '生产设备年度盘点',
      planType: 'full',
      planTypeText: '全面盘点',
      department: '生产部',
      assetCategory: '生产设备',
      location: '生产车间',
      planDate: '2024-01-15',
      startDate: '2024-01-16',
      endDate: '2024-01-20',
      status: 'approved',
      statusText: '已审批',
      totalAssets: 80,
      checkedAssets: 0,
      normalAssets: 0,
      abnormalAssets: 0,
      missingAssets: 0,
      excessAssets: 0,
      progress: 0,
      planUser: '孙七',
      approver: '李四',
      approveDate: '2024-01-16',
      description: '对生产车间所有设备进行年度盘点',
      createUser: '孙七',
      createDate: '2024-01-15 11:20:00',
      updateUser: '李四',
      updateDate: '2024-01-16 09:30:00',
    },
    {
      id: '5',
      planNo: 'IP20240110001',
      planName: '车辆设备盘点',
      planType: 'partial',
      planTypeText: '部分盘点',
      department: '后勤部',
      assetCategory: '车辆设备',
      location: '停车场',
      planDate: '2024-01-10',
      startDate: '2024-01-12',
      endDate: '2024-01-15',
      status: 'draft',
      statusText: '草稿',
      totalAssets: 12,
      checkedAssets: 0,
      normalAssets: 0,
      abnormalAssets: 0,
      missingAssets: 0,
      excessAssets: 0,
      progress: 0,
      planUser: '周八',
      description: '对公司车辆进行盘点检查',
      createUser: '周八',
      createDate: '2024-01-10 15:45:00',
    },
  ];

  // 模拟盘点明细数据
  const mockDetailData: InventoryDetail[] = [
    {
      id: '1',
      planId: '1',
      assetCode: 'FA001',
      assetName: '笔记本电脑',
      assetType: '电子设备',
      specification: 'ThinkPad X1 Carbon',
      originalLocation: '办公室A-101',
      actualLocation: '办公室A-101',
      originalCustodian: '张三',
      actualCustodian: '张三',
      originalStatus: '正常',
      actualStatus: '正常',
      checkResult: 'normal',
      checkResultText: '正常',
      checkDate: '2024-02-02',
      checker: '王五',
      remarks: '设备状态良好，位置正确',
    },
    {
      id: '2',
      planId: '1',
      assetCode: 'FA002',
      assetName: '投影仪',
      assetType: '办公设备',
      specification: '4K高清投影仪',
      originalLocation: '会议室B-201',
      actualLocation: '会议室B-202',
      originalCustodian: '李四',
      actualCustodian: '李四',
      originalStatus: '正常',
      actualStatus: '轻微损坏',
      checkResult: 'abnormal',
      checkResultText: '异常',
      checkDate: '2024-02-03',
      checker: '赵六',
      remarks: '设备位置变更，镜头有轻微划痕',
    },
    {
      id: '3',
      planId: '1',
      assetCode: 'FA003',
      assetName: '打印机',
      assetType: '办公设备',
      specification: 'HP LaserJet Pro',
      originalLocation: '办公室C-301',
      actualLocation: '',
      originalCustodian: '孙七',
      actualCustodian: '',
      originalStatus: '正常',
      actualStatus: '',
      checkResult: 'missing',
      checkResultText: '盘亏',
      checkDate: '2024-02-04',
      checker: '周八',
      remarks: '设备未在原位置找到，需要进一步核查',
    },
  ];

  useEffect(() => {
    setData(mockData);
    setFilteredData(mockData);
    setDetailData(mockDetailData);
  }, []);

  const handleAdd = () => {
    setEditingRecord(null);
    setIsModalVisible(true);
    form.resetFields();
    form.setFieldsValue({
      planDate: dayjs(),
      startDate: dayjs().add(1, 'day'),
      endDate: dayjs().add(7, 'day'),
    });
  };

  const handleEdit = (record: InventoryPlan) => {
    setEditingRecord(record);
    setIsModalVisible(true);
    form.setFieldsValue({
      ...record,
      planDate: dayjs(record.planDate),
      startDate: dayjs(record.startDate),
      endDate: dayjs(record.endDate),
    });
  };

  const handleView = (record: InventoryPlan) => {
    setSelectedRecord(record);
    setIsDetailModalVisible(true);
  };

  const handleCheck = (record: InventoryPlan) => {
    setSelectedRecord(record);
    setIsCheckModalVisible(true);
    checkForm.resetFields();
  };

  const handleViewResult = (record: InventoryPlan) => {
    setSelectedRecord(record);
    setIsResultModalVisible(true);
  };

  const handleDelete = (record: InventoryPlan) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除盘点计划 ${record.planNo} 吗？`,
      onOk: () => {
        const newData = data.filter(item => item.id !== record.id);
        setData(newData);
        setFilteredData(newData);
        message.success('删除成功');
      },
    });
  };

  const handleApprove = (record: InventoryPlan) => {
    Modal.confirm({
      title: '确认审批',
      content: `确定要审批通过盘点计划 ${record.planNo} 吗？`,
      onOk: () => {
        const newData = data.map(item => 
          item.id === record.id 
            ? { 
                ...item, 
                status: 'approved' as const, 
                statusText: '已审批',
                approver: '当前用户',
                approveDate: dayjs().format('YYYY-MM-DD'),
                updateUser: '当前用户',
                updateDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
              }
            : item
        );
        setData(newData);
        setFilteredData(newData);
        message.success('审批成功');
      },
    });
  };

  const handleStart = (record: InventoryPlan) => {
    Modal.confirm({
      title: '确认开始盘点',
      content: `确定要开始执行盘点计划 ${record.planNo} 吗？`,
      onOk: () => {
        const newData = data.map(item => 
          item.id === record.id 
            ? { 
                ...item, 
                status: 'in_progress' as const, 
                statusText: '盘点中',
                updateUser: '当前用户',
                updateDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
              }
            : item
        );
        setData(newData);
        setFilteredData(newData);
        message.success('盘点已开始');
      },
    });
  };

  const handleComplete = (record: InventoryPlan) => {
    Modal.confirm({
      title: '确认完成盘点',
      content: `确定要完成盘点计划 ${record.planNo} 吗？完成后将不能再修改盘点结果。`,
      onOk: () => {
        const newData = data.map(item => 
          item.id === record.id 
            ? { 
                ...item, 
                status: 'completed' as const, 
                statusText: '已完成',
                progress: 100,
                updateUser: '当前用户',
                updateDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
              }
            : item
        );
        setData(newData);
        setFilteredData(newData);
        message.success('盘点已完成');
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const newRecord: InventoryPlan = {
        id: editingRecord ? editingRecord.id : Date.now().toString(),
        planNo: editingRecord ? editingRecord.planNo : `IP${dayjs().format('YYYYMMDD')}${String(data.length + 1).padStart(3, '0')}`,
        planName: values.planName,
        planType: values.planType,
        planTypeText: getPlanTypeText(values.planType),
        department: values.department,
        assetCategory: values.assetCategory,
        location: values.location,
        planDate: values.planDate.format('YYYY-MM-DD'),
        startDate: values.startDate.format('YYYY-MM-DD'),
        endDate: values.endDate.format('YYYY-MM-DD'),
        status: editingRecord ? editingRecord.status : 'draft',
        statusText: editingRecord ? editingRecord.statusText : '草稿',
        totalAssets: values.totalAssets || 0,
        checkedAssets: editingRecord ? editingRecord.checkedAssets : 0,
        normalAssets: editingRecord ? editingRecord.normalAssets : 0,
        abnormalAssets: editingRecord ? editingRecord.abnormalAssets : 0,
        missingAssets: editingRecord ? editingRecord.missingAssets : 0,
        excessAssets: editingRecord ? editingRecord.excessAssets : 0,
        progress: editingRecord ? editingRecord.progress : 0,
        planUser: values.planUser,
        description: values.description,
        createUser: editingRecord ? editingRecord.createUser : '当前用户',
        createDate: editingRecord ? editingRecord.createDate : dayjs().format('YYYY-MM-DD HH:mm:ss'),
        updateUser: '当前用户',
        updateDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      };

      if (editingRecord) {
        const newData = data.map(item => item.id === editingRecord.id ? newRecord : item);
        setData(newData);
        setFilteredData(newData);
        message.success('修改成功');
      } else {
        const newData = [newRecord, ...data];
        setData(newData);
        setFilteredData(newData);
        message.success('添加成功');
      }

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('提交失败:', error);
    }
  };

  const handleSearch = async () => {
    try {
      const values = await searchForm.validateFields();
      let filtered = data;

      if (values.planNo) {
        filtered = filtered.filter(item => item.planNo.includes(values.planNo));
      }

      if (values.planName) {
        filtered = filtered.filter(item => item.planName.includes(values.planName));
      }

      if (values.planType) {
        filtered = filtered.filter(item => item.planType === values.planType);
      }

      if (values.department) {
        filtered = filtered.filter(item => item.department === values.department);
      }

      if (values.status) {
        filtered = filtered.filter(item => item.status === values.status);
      }

      if (values.dateRange && values.dateRange.length === 2) {
        const [startDate, endDate] = values.dateRange;
        filtered = filtered.filter(item => {
          const planDate = dayjs(item.planDate);
          return planDate.isAfter(startDate.subtract(1, 'day')) && planDate.isBefore(endDate.add(1, 'day'));
        });
      }

      setFilteredData(filtered);
    } catch (error) {
      console.error('搜索失败:', error);
    }
  };

  const handleReset = () => {
    searchForm.resetFields();
    setFilteredData(data);
  };

  const getPlanTypeText = (type: string) => {
    const types = {
      full: '全面盘点',
      partial: '部分盘点',
      spot: '抽查盘点',
    };
    return types[type as keyof typeof types] || type;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'default',
      approved: 'processing',
      in_progress: 'warning',
      completed: 'success',
      cancelled: 'error',
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getCheckResultColor = (result: string) => {
    const colors = {
      normal: 'success',
      abnormal: 'warning',
      missing: 'error',
      excess: 'processing',
    };
    return colors[result as keyof typeof colors] || 'default';
  };

  // 计算统计数据
  const totalPlans = filteredData.length;
  const inProgressPlans = filteredData.filter(item => item.status === 'in_progress').length;
  const completedPlans = filteredData.filter(item => item.status === 'completed').length;
  const totalAssets = filteredData.reduce((sum, item) => sum + item.totalAssets, 0);

  const columns: ColumnsType<InventoryPlan> = [
    {
      title: '序号',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: '盘点计划号',
      dataIndex: 'planNo',
      key: 'planNo',
      width: 140,
    },
    {
      title: '计划名称',
      dataIndex: 'planName',
      key: 'planName',
      width: 180,
      ellipsis: true,
    },
    {
      title: '盘点类型',
      dataIndex: 'planTypeText',
      key: 'planType',
      width: 100,
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
      width: 100,
    },
    {
      title: '资产类别',
      dataIndex: 'assetCategory',
      key: 'assetCategory',
      width: 100,
    },
    {
      title: '盘点进度',
      key: 'progress',
      width: 120,
      render: (_, record) => (
        <div>
          <Progress 
            percent={record.progress} 
            size="small" 
            status={record.status === 'completed' ? 'success' : 'active'}
          />
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.checkedAssets}/{record.totalAssets}
          </div>
        </div>
      ),
    },
    {
      title: '计划日期',
      dataIndex: 'planDate',
      key: 'planDate',
      width: 100,
    },
    {
      title: '执行期间',
      key: 'period',
      width: 180,
      render: (_, record) => `${record.startDate} ~ ${record.endDate}`,
    },
    {
      title: '计划人',
      dataIndex: 'planUser',
      key: 'planUser',
      width: 80,
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
      title: '操作',
      key: 'action',
      width: 250,
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
          {record.status === 'draft' && (
            <>
              <Button
                type="link"
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
              >
                编辑
              </Button>
              <Button
                type="link"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => handleApprove(record)}
                style={{ color: '#52c41a' }}
              >
                审批
              </Button>
              <Button
                type="link"
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record)}
                danger
              >
                删除
              </Button>
            </>
          )}
          {record.status === 'approved' && (
            <Button
              type="link"
              size="small"
              onClick={() => handleStart(record)}
              style={{ color: '#1890ff' }}
            >
              开始盘点
            </Button>
          )}
          {record.status === 'in_progress' && (
            <>
              <Button
                type="link"
                size="small"
                icon={<ScanOutlined />}
                onClick={() => handleCheck(record)}
                style={{ color: '#fa8c16' }}
              >
                盘点
              </Button>
              <Button
                type="link"
                size="small"
                onClick={() => handleComplete(record)}
                style={{ color: '#52c41a' }}
              >
                完成
              </Button>
            </>
          )}
          {record.status === 'completed' && (
            <Button
              type="link"
              size="small"
              icon={<FileTextOutlined />}
              onClick={() => handleViewResult(record)}
              style={{ color: '#722ed1' }}
            >
              盘点结果
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const detailColumns: ColumnsType<InventoryDetail> = [
    {
      title: '资产编码',
      dataIndex: 'assetCode',
      key: 'assetCode',
      width: 100,
    },
    {
      title: '资产名称',
      dataIndex: 'assetName',
      key: 'assetName',
      width: 120,
    },
    {
      title: '资产类型',
      dataIndex: 'assetType',
      key: 'assetType',
      width: 100,
    },
    {
      title: '原位置',
      dataIndex: 'originalLocation',
      key: 'originalLocation',
      width: 120,
    },
    {
      title: '实际位置',
      dataIndex: 'actualLocation',
      key: 'actualLocation',
      width: 120,
      render: (text, _record) => text || <span style={{ color: '#ff4d4f' }}>未找到</span>,
    },
    {
      title: '原保管人',
      dataIndex: 'originalCustodian',
      key: 'originalCustodian',
      width: 100,
    },
    {
      title: '实际保管人',
      dataIndex: 'actualCustodian',
      key: 'actualCustodian',
      width: 100,
      render: (text, _record) => text || <span style={{ color: '#ff4d4f' }}>-</span>,
    },
    {
      title: '盘点结果',
      dataIndex: 'checkResultText',
      key: 'checkResult',
      width: 100,
      render: (text, record) => (
        <Tag color={getCheckResultColor(record.checkResult)}>{text}</Tag>
      ),
    },
    {
      title: '盘点日期',
      dataIndex: 'checkDate',
      key: 'checkDate',
      width: 100,
    },
    {
      title: '盘点人',
      dataIndex: 'checker',
      key: 'checker',
      width: 80,
    },
    {
      title: '备注',
      dataIndex: 'remarks',
      key: 'remarks',
      width: 200,
      ellipsis: true,
    },
  ];

  return (
    <div className="p-6">
      {/* 统计卡片 */}
      <Row gutter={16} className="mb-4">
        <Col span={6}>
          <Card>
            <Statistic
              title="盘点计划总数"
              value={totalPlans}
              suffix="个"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="进行中计划"
              value={inProgressPlans}
              suffix="个"
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已完成计划"
              value={completedPlans}
              suffix="个"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="涉及资产总数"
              value={totalAssets}
              suffix="件"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        {/* 搜索表单 */}
        <Form form={searchForm} layout="inline" className="mb-4">
          <Form.Item name="planNo" label="计划号">
            <Input placeholder="请输入计划号" style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="planName" label="计划名称">
            <Input placeholder="请输入计划名称" style={{ width: 180 }} />
          </Form.Item>
          <Form.Item name="planType" label="盘点类型">
            <Select placeholder="请选择盘点类型" style={{ width: 120 }}>
              <Option value="full">全面盘点</Option>
              <Option value="partial">部分盘点</Option>
              <Option value="spot">抽查盘点</Option>
            </Select>
          </Form.Item>
          <Form.Item name="department" label="部门">
            <Select placeholder="请选择部门" style={{ width: 120 }}>
              <Option value="全公司">全公司</Option>
              <Option value="技术部">技术部</Option>
              <Option value="行政部">行政部</Option>
              <Option value="生产部">生产部</Option>
              <Option value="后勤部">后勤部</Option>
            </Select>
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择状态" style={{ width: 120 }}>
              <Option value="draft">草稿</Option>
              <Option value="approved">已审批</Option>
              <Option value="in_progress">盘点中</Option>
              <Option value="completed">已完成</Option>
              <Option value="cancelled">已取消</Option>
            </Select>
          </Form.Item>
          <Form.Item name="dateRange" label="计划日期">
            <RangePicker style={{ width: 240 }} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                搜索
              </Button>
              <Button onClick={handleReset}>重置</Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                新增计划
              </Button>
            </Space>
          </Form.Item>
        </Form>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1800 }}
          pagination={{
            total: filteredData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      {/* 新增/编辑模态框 */}
      <Modal
        title={editingRecord ? '编辑盘点计划' : '新增盘点计划'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
        width={800}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="planName" 
                label="计划名称" 
                rules={[{ required: true, message: '请输入计划名称' }]}
              >
                <Input placeholder="请输入计划名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="planType" 
                label="盘点类型" 
                rules={[{ required: true, message: '请选择盘点类型' }]}
              >
                <Select placeholder="请选择盘点类型">
                  <Option value="full">全面盘点</Option>
                  <Option value="partial">部分盘点</Option>
                  <Option value="spot">抽查盘点</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item 
                name="department" 
                label="盘点部门" 
                rules={[{ required: true, message: '请选择盘点部门' }]}
              >
                <Select placeholder="请选择盘点部门">
                  <Option value="全公司">全公司</Option>
                  <Option value="技术部">技术部</Option>
                  <Option value="行政部">行政部</Option>
                  <Option value="生产部">生产部</Option>
                  <Option value="后勤部">后勤部</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item 
                name="assetCategory" 
                label="资产类别" 
                rules={[{ required: true, message: '请选择资产类别' }]}
              >
                <Select placeholder="请选择资产类别">
                  <Option value="全部">全部</Option>
                  <Option value="电子设备">电子设备</Option>
                  <Option value="办公设备">办公设备</Option>
                  <Option value="办公家具">办公家具</Option>
                  <Option value="生产设备">生产设备</Option>
                  <Option value="车辆设备">车辆设备</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item 
                name="location" 
                label="盘点位置" 
                rules={[{ required: true, message: '请输入盘点位置' }]}
              >
                <Input placeholder="请输入盘点位置" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item 
                name="planDate" 
                label="计划日期" 
                rules={[{ required: true, message: '请选择计划日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item 
                name="startDate" 
                label="开始日期" 
                rules={[{ required: true, message: '请选择开始日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item 
                name="endDate" 
                label="结束日期" 
                rules={[{ required: true, message: '请选择结束日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="planUser" 
                label="计划人" 
                rules={[{ required: true, message: '请输入计划人' }]}
              >
                <Input placeholder="请输入计划人" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="totalAssets" label="预计资产数量">
                <Input type="number" placeholder="请输入预计资产数量" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item 
            name="description" 
            label="计划描述" 
            rules={[{ required: true, message: '请输入计划描述' }]}
          >
            <TextArea rows={3} placeholder="请输入计划描述" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 详情模态框 */}
      <Modal
        title="盘点计划详情"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedRecord && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="计划号">{selectedRecord.planNo}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={getStatusColor(selectedRecord.status)}>{selectedRecord.statusText}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="计划名称" span={2}>{selectedRecord.planName}</Descriptions.Item>
              <Descriptions.Item label="盘点类型">{selectedRecord.planTypeText}</Descriptions.Item>
              <Descriptions.Item label="盘点部门">{selectedRecord.department}</Descriptions.Item>
              <Descriptions.Item label="资产类别">{selectedRecord.assetCategory}</Descriptions.Item>
              <Descriptions.Item label="盘点位置">{selectedRecord.location}</Descriptions.Item>
              <Descriptions.Item label="计划日期">{selectedRecord.planDate}</Descriptions.Item>
              <Descriptions.Item label="执行期间">{selectedRecord.startDate} ~ {selectedRecord.endDate}</Descriptions.Item>
              <Descriptions.Item label="计划人">{selectedRecord.planUser}</Descriptions.Item>
              <Descriptions.Item label="审批人">{selectedRecord.approver || '-'}</Descriptions.Item>
              <Descriptions.Item label="审批日期">{selectedRecord.approveDate || '-'}</Descriptions.Item>
              <Descriptions.Item label="盘点进度">
                <Progress percent={selectedRecord.progress} size="small" />
              </Descriptions.Item>
              <Descriptions.Item label="资产总数">{selectedRecord.totalAssets}</Descriptions.Item>
              <Descriptions.Item label="已盘点">{selectedRecord.checkedAssets}</Descriptions.Item>
              <Descriptions.Item label="正常">{selectedRecord.normalAssets}</Descriptions.Item>
              <Descriptions.Item label="异常">{selectedRecord.abnormalAssets}</Descriptions.Item>
              <Descriptions.Item label="盘亏">{selectedRecord.missingAssets}</Descriptions.Item>
              <Descriptions.Item label="盘盈">{selectedRecord.excessAssets}</Descriptions.Item>
              <Descriptions.Item label="计划描述" span={2}>{selectedRecord.description}</Descriptions.Item>
              <Descriptions.Item label="创建人">{selectedRecord.createUser}</Descriptions.Item>
              <Descriptions.Item label="创建时间">{selectedRecord.createDate}</Descriptions.Item>
              {selectedRecord.updateUser && (
                <>
                  <Descriptions.Item label="更新人">{selectedRecord.updateUser}</Descriptions.Item>
                  <Descriptions.Item label="更新时间">{selectedRecord.updateDate}</Descriptions.Item>
                </>
              )}
            </Descriptions>
          </div>
        )}
      </Modal>

      {/* 盘点操作模态框 */}
      <Modal
        title="资产盘点"
        open={isCheckModalVisible}
        onCancel={() => setIsCheckModalVisible(false)}
        footer={null}
        width={400}
      >
        <div className="text-center">
          <p>盘点功能开发中...</p>
          <p>可以通过扫码或手工录入方式进行盘点</p>
        </div>
      </Modal>

      {/* 盘点结果模态框 */}
      <Modal
        title="盘点结果"
        open={isResultModalVisible}
        onCancel={() => setIsResultModalVisible(false)}
        footer={null}
        width={1200}
      >
        {selectedRecord && (
          <div>
            {/* 统计信息 */}
            <Row gutter={16} className="mb-4">
              <Col span={6}>
                <Card size="small">
                  <Statistic title="资产总数" value={selectedRecord.totalAssets} />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <Statistic title="正常" value={selectedRecord.normalAssets} valueStyle={{ color: '#52c41a' }} />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <Statistic title="异常" value={selectedRecord.abnormalAssets} valueStyle={{ color: '#fa8c16' }} />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <Statistic title="盘亏" value={selectedRecord.missingAssets} valueStyle={{ color: '#ff4d4f' }} />
                </Card>
              </Col>
            </Row>

            {/* 盘点明细 */}
            <Table
              columns={detailColumns}
              dataSource={detailData.filter(item => item.planId === selectedRecord.id)}
              rowKey="id"
              size="small"
              scroll={{ x: 1200 }}
              pagination={{
                pageSize: 5,
                showSizeChanger: false,
              }}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AssetInventory;