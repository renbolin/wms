import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Modal, Form, Input, Select, DatePicker, Space, Tag, message, Descriptions, Row, Col, InputNumber, Progress, Statistic, Divider, Tabs, Upload, Checkbox } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined, SearchOutlined, CheckOutlined, CloseOutlined, PlayCircleOutlined, PauseCircleOutlined, FileExcelOutlined, DownloadOutlined, UploadOutlined, ScanOutlined, PrinterOutlined, UnorderedListOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

// 盘点计划接口
interface CheckPlan {
  id: string;
  planNo: string;
  planName: string;
  planType: 'full' | 'partial' | 'cycle' | 'spot';
  planTypeText: string;
  department: string;
  warehouse: string;
  warehouseName: string;
  location?: string;
  planDate: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'approved' | 'in_progress' | 'completed' | 'cancelled';
  statusText: string;
  totalItems: number;
  checkedItems: number;
  normalItems: number;
  abnormalItems: number;
  missingItems: number;
  excessItems: number;
  progress: number;
  planUser: string;
  checkUsers: string[];
  approver?: string;
  approveDate?: string;
  description: string;
  createUser: string;
  createDate: string;
  updateUser: string;
  updateDate: string;
  items: CheckItem[];
}

// 盘点明细接口
interface CheckItem {
  id: string;
  itemCode: string;
  itemName: string;
  specification: string;
  unit: string;
  category: string;
  location: string;
  batchNo?: string;
  serialNo?: string;
  bookQuantity: number;
  actualQuantity?: number;
  differenceQuantity?: number;
  unitPrice: number;
  totalValue: number;
  checkStatus: 'pending' | 'checked' | 'abnormal' | 'missing' | 'excess';
  checkUser?: string;
  checkDate?: string;
  differenceReason?: string;
  adjustmentStatus: 'pending' | 'approved' | 'rejected' | 'adjusted';
  remarks: string;
}

const InventoryCheck: React.FC = () => {
  // 添加样式
  const styles = `
    .row-pending {
      background-color: #fff7e6 !important;
    }
    .row-difference {
      background-color: #fff2f0 !important;
    }
    .ant-table-tbody > tr.row-pending:hover > td {
      background-color: #ffe7ba !important;
    }
    .ant-table-tbody > tr.row-difference:hover > td {
      background-color: #ffccc7 !important;
    }
  `;

  // 注入样式
  React.useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
  const [data, setData] = useState<CheckPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isItemModalVisible, setIsItemModalVisible] = useState(false);
  const [isExecuteModalVisible, setIsExecuteModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<CheckPlan | null>(null);
  const [selectedItems, setSelectedItems] = useState<CheckItem[]>([]);
  
  // 实时计算盘点统计数据
  const calculateCheckStats = (items: CheckItem[]) => {
    const total = items.length;
    const checked = items.filter(item => item.checkStatus !== 'pending').length;
    const normal = items.filter(item => item.checkStatus === 'checked' && (item.differenceQuantity || 0) === 0).length;
    const abnormal = items.filter(item => item.checkStatus === 'abnormal' || (item.differenceQuantity && item.differenceQuantity !== 0)).length;
    const missing = items.filter(item => item.checkStatus === 'missing').length;
    const excess = items.filter(item => item.checkStatus === 'excess').length;
    const progress = total > 0 ? Math.round((checked / total) * 100) : 0;
    
    return {
      total,
      checked,
      pending: total - checked,
      normal,
      abnormal,
      missing,
      excess,
      progress
    };
  };

  // 自动更新盘点项状态
  const updateItemStatus = (itemId: string, updates: Partial<CheckItem>) => {
    const newItems = selectedItems.map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, ...updates };
        
        // 自动计算差异数量
        if (updatedItem.actualQuantity !== undefined) {
          updatedItem.differenceQuantity = updatedItem.actualQuantity - updatedItem.bookQuantity;
          
          // 自动设置盘点状态
          if (updatedItem.differenceQuantity === 0) {
            updatedItem.checkStatus = 'checked';
          } else if (updatedItem.actualQuantity === 0) {
            updatedItem.checkStatus = 'missing';
          } else if (updatedItem.differenceQuantity > 0) {
            updatedItem.checkStatus = 'excess';
          } else {
            updatedItem.checkStatus = 'abnormal';
          }
          
          // 设置盘点人和时间
          updatedItem.checkUser = '当前用户';
          updatedItem.checkDate = dayjs().format('YYYY-MM-DD HH:mm:ss');
        }
        
        return updatedItem;
      }
      return item;
    });
    
    setSelectedItems(newItems);
    
    // 显示状态更新消息
    const stats = calculateCheckStats(newItems);
    message.success(`盘点进度: ${stats.checked}/${stats.total} (${stats.progress}%)`);
  };
  const [editingRecord, setEditingRecord] = useState<CheckPlan | null>(null);
  const [form] = Form.useForm();
  const [itemForm] = Form.useForm();
  const [executeForm] = Form.useForm();
  const [adjustmentForm] = Form.useForm();
  const [isAdjustmentModalVisible, setIsAdjustmentModalVisible] = useState(false);
  const [adjustmentRecord, setAdjustmentRecord] = useState<CheckItem | null>(null);

  // 处理调整申请
  const handleAdjustmentRequest = (record: CheckItem) => {
    setAdjustmentRecord(record);
    adjustmentForm.setFieldsValue({
      itemCode: record.itemCode,
      itemName: record.itemName,
      location: record.location,
      batchNo: record.batchNo,
      bookQuantity: record.bookQuantity,
      actualQuantity: record.actualQuantity,
      differenceQuantity: record.differenceQuantity,
      differenceValue: ((record.differenceQuantity || 0) * record.unitPrice).toFixed(2),
      differenceReason: record.differenceReason || '',
    });
    setIsAdjustmentModalVisible(true);
  };

  // 提交调整申请
  const handleSubmitAdjustment = async () => {
    try {
      const values = await adjustmentForm.validateFields();
      
      // 更新记录状态
      updateItemStatus(adjustmentRecord!.id, {
        differenceReason: values.differenceReason,
        adjustmentStatus: 'pending',
        remarks: values.remarks
      });
      
      setIsAdjustmentModalVisible(false);
      message.success('调整申请已提交，等待审批');
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 模拟数据
  const mockData: CheckPlan[] = [
    {
      id: '1',
      planNo: 'CP20240201001',
      planName: '2024年2月全盘计划',
      planType: 'full',
      planTypeText: '全盘',
      department: '仓储部',
      warehouse: 'WH001',
      warehouseName: '主仓库',
      location: '全部库位',
      planDate: '2024-02-01',
      startDate: '2024-02-05',
      endDate: '2024-02-07',
      status: 'in_progress',
      statusText: '盘点中',
      totalItems: 1250,
      checkedItems: 856,
      normalItems: 820,
      abnormalItems: 25,
      missingItems: 8,
      excessItems: 3,
      progress: 68,
      planUser: '张三',
      checkUsers: ['张三', '李四', '王五'],
      approver: '赵六',
      approveDate: '2024-02-02',
      description: '对主仓库所有物料进行全面盘点，确保账实相符',
      createUser: '张三',
      createDate: '2024-02-01 09:00:00',
      updateUser: '张三',
      updateDate: '2024-02-05 16:30:00',
      items: [],
    },
    {
      id: '2',
      planNo: 'CP20240125001',
      planName: '电子元器件专项盘点',
      planType: 'partial',
      planTypeText: '部分盘点',
      department: '技术部',
      warehouse: 'WH002',
      warehouseName: '电子仓库',
      location: 'A区',
      planDate: '2024-01-25',
      startDate: '2024-01-26',
      endDate: '2024-01-28',
      status: 'completed',
      statusText: '已完成',
      totalItems: 320,
      checkedItems: 320,
      normalItems: 305,
      abnormalItems: 12,
      missingItems: 2,
      excessItems: 1,
      progress: 100,
      planUser: '李四',
      checkUsers: ['李四', '王五'],
      approver: '赵六',
      approveDate: '2024-01-25',
      description: '对电子元器件进行专项盘点，重点检查高价值物料',
      createUser: '李四',
      createDate: '2024-01-25 10:15:00',
      updateUser: '李四',
      updateDate: '2024-01-28 17:00:00',
      items: [],
    },
    {
      id: '3',
      planNo: 'CP20240120001',
      planName: '原材料循环盘点',
      planType: 'cycle',
      planTypeText: '循环盘点',
      department: '生产部',
      warehouse: 'WH003',
      warehouseName: '原料仓库',
      location: 'B区-01至B区-05',
      planDate: '2024-01-20',
      startDate: '2024-01-22',
      endDate: '2024-01-24',
      status: 'approved',
      statusText: '已审批',
      totalItems: 180,
      checkedItems: 0,
      normalItems: 0,
      abnormalItems: 0,
      missingItems: 0,
      excessItems: 0,
      progress: 0,
      planUser: '王五',
      checkUsers: ['王五', '赵六'],
      approver: '钱七',
      approveDate: '2024-01-21',
      description: '按照循环盘点计划，对原材料进行定期盘点',
      createUser: '王五',
      createDate: '2024-01-20 14:30:00',
      updateUser: '王五',
      updateDate: '2024-01-21 11:20:00',
      items: [],
    },
  ];

  // 盘点明细模拟数据
  const mockItems: CheckItem[] = [
    {
      id: '1',
      itemCode: 'IC001',
      itemName: '集成电路芯片',
      specification: 'STM32F103C8T6',
      unit: '个',
      category: '电子元器件',
      location: 'A区-01-001',
      batchNo: 'B20240101',
      serialNo: '',
      bookQuantity: 1000,
      actualQuantity: 995,
      differenceQuantity: -5,
      unitPrice: 15.50,
      totalValue: 15500.00,
      checkStatus: 'abnormal',
      checkUser: '张三',
      checkDate: '2024-02-05 10:30:00',
      differenceReason: '包装破损导致部分损耗',
      adjustmentStatus: 'pending',
      remarks: '需要联系供应商确认质量问题',
    },
    {
      id: '2',
      itemCode: 'R001',
      itemName: '电阻器',
      specification: '1KΩ ±5% 1/4W',
      unit: '个',
      category: '电子元器件',
      location: 'A区-01-002',
      batchNo: 'B20240115',
      serialNo: '',
      bookQuantity: 5000,
      actualQuantity: 5000,
      differenceQuantity: 0,
      unitPrice: 0.05,
      totalValue: 250.00,
      checkStatus: 'checked',
      checkUser: '李四',
      checkDate: '2024-02-05 11:15:00',
      differenceReason: '',
      adjustmentStatus: 'approved',
      remarks: '盘点正常',
    },
    {
      id: '3',
      itemCode: 'C001',
      itemName: '电容器',
      specification: '100μF 25V',
      unit: '个',
      category: '电子元器件',
      location: 'A区-01-003',
      batchNo: 'B20240110',
      serialNo: '',
      bookQuantity: 2000,
      actualQuantity: 0,
      differenceQuantity: -2000,
      unitPrice: 0.80,
      totalValue: 1600.00,
      checkStatus: 'missing',
      checkUser: '王五',
      checkDate: '2024-02-05 14:20:00',
      differenceReason: '库位标识错误，物料实际在其他库位',
      adjustmentStatus: 'pending',
      remarks: '需要重新查找物料位置',
    },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      setTimeout(() => {
        setData(mockData);
        setLoading(false);
      }, 1000);
    } catch (error) {
      message.error('获取数据失败');
      setLoading(false);
    }
  };

  // 状态颜色函数
  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'default',
      approved: 'blue',
      in_progress: 'processing',
      completed: 'success',
      cancelled: 'error',
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getCheckStatusColor = (status: string) => {
    const colors = {
      pending: 'default',
      checked: 'success',
      abnormal: 'warning',
      missing: 'error',
      excess: 'purple',
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getAdjustmentStatusColor = (status: string) => {
    const colors = {
      pending: 'default',
      approved: 'success',
      rejected: 'error',
      adjusted: 'blue',
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  // 操作函数
  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: CheckPlan) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      planDate: dayjs(record.planDate),
      startDate: dayjs(record.startDate),
      endDate: dayjs(record.endDate),
    });
    setIsModalVisible(true);
  };

  const handleDelete = (record: CheckPlan) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除盘点计划"${record.planName}"吗？`,
      onOk: () => {
        setData(data.filter(item => item.id !== record.id));
        message.success('删除成功');
      },
    });
  };

  const handleApprove = (record: CheckPlan) => {
    Modal.confirm({
      title: '确认审批',
      content: `确定要审批通过盘点计划"${record.planName}"吗？`,
      onOk: () => {
        const newData = data.map(item => 
          item.id === record.id 
            ? { ...item, status: 'approved' as const, statusText: '已审批', approver: '当前用户', approveDate: dayjs().format('YYYY-MM-DD') }
            : item
        );
        setData(newData);
        message.success('审批成功');
      },
    });
  };

  const handleReject = (record: CheckPlan) => {
    Modal.confirm({
      title: '确认拒绝',
      content: `确定要拒绝盘点计划"${record.planName}"吗？`,
      onOk: () => {
        const newData = data.map(item => 
          item.id === record.id 
            ? { ...item, status: 'cancelled' as const, statusText: '已取消' }
            : item
        );
        setData(newData);
        message.success('已拒绝');
      },
    });
  };

  const handleStart = (record: CheckPlan) => {
    Modal.confirm({
      title: '开始盘点',
      content: `确定要开始执行盘点计划"${record.planName}"吗？`,
      onOk: () => {
        const newData = data.map(item => 
          item.id === record.id 
            ? { ...item, status: 'in_progress' as const, statusText: '盘点中' }
            : item
        );
        setData(newData);
        message.success('盘点已开始');
      },
    });
  };

  const handleComplete = (record: CheckPlan) => {
    Modal.confirm({
      title: '完成盘点',
      content: `确定要完成盘点计划"${record.planName}"吗？完成后将不能再修改盘点数据。`,
      onOk: () => {
        const newData = data.map(item => 
          item.id === record.id 
            ? { ...item, status: 'completed' as const, statusText: '已完成', progress: 100 }
            : item
        );
        setData(newData);
        message.success('盘点已完成');
      },
    });
  };

  const handleViewDetail = (record: CheckPlan) => {
    setSelectedRecord(record);
    setIsDetailModalVisible(true);
  };

  const handleViewItems = (record: CheckPlan) => {
    setSelectedRecord(record);
    setSelectedItems(mockItems);
    setIsItemModalVisible(true);
  };

  const handleExecute = (record: CheckPlan) => {
    setSelectedRecord(record);
    setSelectedItems(mockItems);
    executeForm.resetFields();
    setIsExecuteModalVisible(true);
  };

  const handleExport = (record: CheckPlan) => {
    message.success(`正在导出盘点计划"${record.planName}"的数据...`);
  };

  const handlePrint = (record: CheckPlan) => {
    message.success(`正在打印盘点计划"${record.planName}"...`);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const newRecord: CheckPlan = {
        id: editingRecord?.id || Date.now().toString(),
        planNo: editingRecord?.planNo || `CP${dayjs().format('YYYYMMDD')}${String(data.length + 1).padStart(3, '0')}`,
        planName: values.planName,
        planType: values.planType,
        planTypeText: values.planType === 'full' ? '全盘' : 
                     values.planType === 'partial' ? '部分盘点' : 
                     values.planType === 'cycle' ? '循环盘点' : '抽查盘点',
        department: values.department,
        warehouse: values.warehouse,
        warehouseName: values.warehouse === 'WH001' ? '主仓库' : 
                      values.warehouse === 'WH002' ? '电子仓库' : '原料仓库',
        location: values.location,
        planDate: values.planDate.format('YYYY-MM-DD'),
        startDate: values.startDate.format('YYYY-MM-DD'),
        endDate: values.endDate.format('YYYY-MM-DD'),
        status: editingRecord?.status || 'draft',
        statusText: editingRecord?.statusText || '草稿',
        totalItems: values.totalItems || 0,
        checkedItems: editingRecord?.checkedItems || 0,
        normalItems: editingRecord?.normalItems || 0,
        abnormalItems: editingRecord?.abnormalItems || 0,
        missingItems: editingRecord?.missingItems || 0,
        excessItems: editingRecord?.excessItems || 0,
        progress: editingRecord?.progress || 0,
        planUser: values.planUser,
        checkUsers: values.checkUsers || [],
        approver: editingRecord?.approver,
        approveDate: editingRecord?.approveDate,
        description: values.description,
        createUser: editingRecord?.createUser || '当前用户',
        createDate: editingRecord?.createDate || dayjs().format('YYYY-MM-DD HH:mm:ss'),
        updateUser: '当前用户',
        updateDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        items: editingRecord?.items || [],
      };

      if (editingRecord) {
        setData(data.map(item => item.id === editingRecord.id ? newRecord : item));
        message.success('修改成功');
      } else {
        setData([...data, newRecord]);
        message.success('新增成功');
      }
      setIsModalVisible(false);
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  // 表格列定义
  const columns: ColumnsType<CheckPlan> = [
    {
      title: '序号',
      key: 'index',
      width: 60,
      fixed: 'left',
      render: (_, __, index) => index + 1,
    },
    {
      title: '盘点计划号',
      dataIndex: 'planNo',
      key: 'planNo',
      width: 140,
      fixed: 'left',
    },
    {
      title: '计划名称',
      dataIndex: 'planName',
      key: 'planName',
      width: 200,
      ellipsis: true,
    },
    {
      title: '盘点类型',
      dataIndex: 'planTypeText',
      key: 'planTypeText',
      width: 100,
      render: (text: string, record: CheckPlan) => (
        <Tag color={record.planType === 'full' ? 'red' : 
                   record.planType === 'partial' ? 'orange' : 
                   record.planType === 'cycle' ? 'blue' : 'green'}>
          {text}
        </Tag>
      ),
    },
    {
      title: '负责部门',
      dataIndex: 'department',
      key: 'department',
      width: 100,
    },
    {
      title: '仓库',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
      width: 100,
    },
    {
      title: '盘点范围',
      dataIndex: 'location',
      key: 'location',
      width: 120,
      ellipsis: true,
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
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string, record: CheckPlan) => (
        <Tag color={getStatusColor(status)}>{record.statusText}</Tag>
      ),
    },
    {
      title: '盘点进度',
      key: 'progress',
      width: 120,
      render: (_, record) => (
        <div>
          <Progress percent={record.progress} size="small" />
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.checkedItems}/{record.totalItems}
          </div>
        </div>
      ),
    },
    {
      title: '计划人',
      dataIndex: 'planUser',
      key: 'planUser',
      width: 80,
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            详情
          </Button>
          {record.status === 'draft' && (
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
              编辑
            </Button>
          )}
          {record.status === 'draft' && (
            <Button type="link" size="small" icon={<CheckOutlined />} onClick={() => handleApprove(record)}>
              审批
            </Button>
          )}
          {record.status === 'approved' && (
            <Button type="link" size="small" icon={<PlayCircleOutlined />} onClick={() => handleStart(record)}>
              开始
            </Button>
          )}
          {record.status === 'in_progress' && (
            <Button type="link" size="small" icon={<ScanOutlined />} onClick={() => handleExecute(record)}>
              执行
            </Button>
          )}
          {record.status === 'in_progress' && (
            <Button type="link" size="small" icon={<CheckOutlined />} onClick={() => handleComplete(record)}>
              完成
            </Button>
          )}
          <Button type="link" size="small" icon={<UnorderedListOutlined />} onClick={() => handleViewItems(record)}>
            明细
          </Button>
          {record.status === 'draft' && (
            <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
              删除
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* 统计卡片 */}
      <Row gutter={16} className="mb-6">
        <Col span={4}>
          <Card>
            <Statistic
              title="总计划数"
              value={data.length}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="进行中"
              value={data.filter(item => item.status === 'in_progress').length}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="已完成"
              value={data.filter(item => item.status === 'completed').length}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="待审批"
              value={data.filter(item => item.status === 'draft').length}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="总盘点物料"
              value={data.reduce((sum, item) => sum + item.totalItems, 0)}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="异常物料"
              value={data.reduce((sum, item) => sum + item.abnormalItems + item.missingItems, 0)}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 搜索表单 */}
      <Card className="mb-4">
        <Form layout="inline">
          <Form.Item label="计划名称">
            <Input placeholder="请输入计划名称" />
          </Form.Item>
          <Form.Item label="盘点类型">
            <Select placeholder="请选择盘点类型" style={{ width: 120 }}>
              <Option value="full">全盘</Option>
              <Option value="partial">部分盘点</Option>
              <Option value="cycle">循环盘点</Option>
              <Option value="spot">抽查盘点</Option>
            </Select>
          </Form.Item>
          <Form.Item label="状态">
            <Select placeholder="请选择状态" style={{ width: 120 }}>
              <Option value="draft">草稿</Option>
              <Option value="approved">已审批</Option>
              <Option value="in_progress">盘点中</Option>
              <Option value="completed">已完成</Option>
              <Option value="cancelled">已取消</Option>
            </Select>
          </Form.Item>
          <Form.Item label="计划日期">
            <RangePicker />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" icon={<SearchOutlined />}>
                查询
              </Button>
              <Button>重置</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* 操作按钮 */}
      <Card className="mb-4">
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增盘点计划
          </Button>
          <Button icon={<FileExcelOutlined />}>
            批量导入
          </Button>
          <Button icon={<DownloadOutlined />}>
            导出数据
          </Button>
          <Button icon={<PrinterOutlined />}>
            打印报表
          </Button>
        </Space>
      </Card>

      {/* 数据表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1600 }}
          pagination={{
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
        onCancel={() => setIsModalVisible(false)}
        onOk={handleSave}
        width={800}
destroyOnHidden
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
                  <Option value="full">全盘</Option>
                  <Option value="partial">部分盘点</Option>
                  <Option value="cycle">循环盘点</Option>
                  <Option value="spot">抽查盘点</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="department"
                label="负责部门"
                rules={[{ required: true, message: '请输入负责部门' }]}
              >
                <Input placeholder="请输入负责部门" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="warehouse"
                label="盘点仓库"
                rules={[{ required: true, message: '请选择盘点仓库' }]}
              >
                <Select placeholder="请选择盘点仓库">
                  <Option value="WH001">主仓库</Option>
                  <Option value="WH002">电子仓库</Option>
                  <Option value="WH003">原料仓库</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="location"
                label="盘点范围"
                rules={[{ required: true, message: '请输入盘点范围' }]}
              >
                <Input placeholder="请输入盘点范围，如：A区、全部库位等" />
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
              <Form.Item
                name="checkUsers"
                label="盘点人员"
                rules={[{ required: true, message: '请选择盘点人员' }]}
              >
                <Select mode="multiple" placeholder="请选择盘点人员">
                  <Option value="张三">张三</Option>
                  <Option value="李四">李四</Option>
                  <Option value="王五">王五</Option>
                  <Option value="赵六">赵六</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="计划描述">
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
        width={1000}
      >
        {selectedRecord && (
          <Descriptions bordered column={3}>
            <Descriptions.Item label="计划号">{selectedRecord.planNo}</Descriptions.Item>
            <Descriptions.Item label="计划名称">{selectedRecord.planName}</Descriptions.Item>
            <Descriptions.Item label="盘点类型">
              <Tag color={selectedRecord.planType === 'full' ? 'red' : 
                         selectedRecord.planType === 'partial' ? 'orange' : 
                         selectedRecord.planType === 'cycle' ? 'blue' : 'green'}>
                {selectedRecord.planTypeText}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="负责部门">{selectedRecord.department}</Descriptions.Item>
            <Descriptions.Item label="盘点仓库">{selectedRecord.warehouseName}</Descriptions.Item>
            <Descriptions.Item label="盘点范围">{selectedRecord.location}</Descriptions.Item>
            <Descriptions.Item label="计划日期">{selectedRecord.planDate}</Descriptions.Item>
            <Descriptions.Item label="开始日期">{selectedRecord.startDate}</Descriptions.Item>
            <Descriptions.Item label="结束日期">{selectedRecord.endDate}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={getStatusColor(selectedRecord.status)}>{selectedRecord.statusText}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="盘点进度">
              <Progress percent={selectedRecord.progress} size="small" />
            </Descriptions.Item>
            <Descriptions.Item label="计划人">{selectedRecord.planUser}</Descriptions.Item>
            <Descriptions.Item label="盘点人员" span={2}>
              {selectedRecord.checkUsers.map(user => (
                <Tag key={user}>{user}</Tag>
              ))}
            </Descriptions.Item>
            <Descriptions.Item label="总物料数">{selectedRecord.totalItems}</Descriptions.Item>
            <Descriptions.Item label="已盘点">{selectedRecord.checkedItems}</Descriptions.Item>
            <Descriptions.Item label="正常">{selectedRecord.normalItems}</Descriptions.Item>
            <Descriptions.Item label="异常">{selectedRecord.abnormalItems}</Descriptions.Item>
            <Descriptions.Item label="缺失">{selectedRecord.missingItems}</Descriptions.Item>
            <Descriptions.Item label="多余">{selectedRecord.excessItems}</Descriptions.Item>
            {selectedRecord.approver && (
              <>
                <Descriptions.Item label="审批人">{selectedRecord.approver}</Descriptions.Item>
                <Descriptions.Item label="审批日期">{selectedRecord.approveDate}</Descriptions.Item>
              </>
            )}
            <Descriptions.Item label="创建人">{selectedRecord.createUser}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{selectedRecord.createDate}</Descriptions.Item>
            <Descriptions.Item label="更新时间">{selectedRecord.updateDate}</Descriptions.Item>
            <Descriptions.Item label="计划描述" span={3}>{selectedRecord.description}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* 盘点明细模态框 */}
      <Modal
        title="盘点明细"
        open={isItemModalVisible}
        onCancel={() => setIsItemModalVisible(false)}
        footer={null}
        width={1600}
      >
        <Table
          columns={[
            {
              title: '物料编码',
              dataIndex: 'itemCode',
              key: 'itemCode',
              width: 100,
            },
            {
              title: '物料名称',
              dataIndex: 'itemName',
              key: 'itemName',
              width: 150,
            },
            {
              title: '规格型号',
              dataIndex: 'specification',
              key: 'specification',
              width: 120,
              ellipsis: true,
            },
            {
              title: '单位',
              dataIndex: 'unit',
              key: 'unit',
              width: 60,
            },
            {
              title: '库位',
              dataIndex: 'location',
              key: 'location',
              width: 100,
            },
            {
              title: '批次号',
              dataIndex: 'batchNo',
              key: 'batchNo',
              width: 100,
            },
            {
              title: '账面数量',
              dataIndex: 'bookQuantity',
              key: 'bookQuantity',
              width: 80,
              align: 'right',
            },
            {
              title: '实盘数量',
              dataIndex: 'actualQuantity',
              key: 'actualQuantity',
              width: 80,
              align: 'right',
              render: (value) => value ?? '-',
            },
            {
              title: '差异数量',
              dataIndex: 'differenceQuantity',
              key: 'differenceQuantity',
              width: 80,
              align: 'right',
              render: (value) => {
                if (value === undefined || value === null) return '-';
                return (
                  <span style={{ color: value === 0 ? '#52c41a' : '#f5222d' }}>
                    {value > 0 ? `+${value}` : value}
                  </span>
                );
              },
            },
            {
              title: '单价',
              dataIndex: 'unitPrice',
              key: 'unitPrice',
              width: 80,
              align: 'right',
              render: (value) => `¥${value.toFixed(2)}`,
            },
            {
              title: '盘点状态',
              dataIndex: 'checkStatus',
              key: 'checkStatus',
              width: 80,
              render: (status: string) => (
                <Tag color={getCheckStatusColor(status)}>
                  {status === 'pending' ? '待盘点' :
                   status === 'checked' ? '已盘点' :
                   status === 'abnormal' ? '异常' :
                   status === 'missing' ? '缺失' : '多余'}
                </Tag>
              ),
            },
            {
              title: '调整状态',
              dataIndex: 'adjustmentStatus',
              key: 'adjustmentStatus',
              width: 80,
              render: (status: string) => (
                <Tag color={getAdjustmentStatusColor(status)}>
                  {status === 'pending' ? '待调整' :
                   status === 'approved' ? '已批准' :
                   status === 'rejected' ? '已拒绝' : '已调整'}
                </Tag>
              ),
            },
            {
              title: '盘点人',
              dataIndex: 'checkUser',
              key: 'checkUser',
              width: 80,
            },
            {
              title: '操作',
              key: 'action',
              width: 120,
              render: (_, record) => (
                <Space size="small">
                  <Button type="link" size="small" icon={<EditOutlined />}>
                    编辑
                  </Button>
                  <Button type="link" size="small" icon={<CheckOutlined />}>
                    调整
                  </Button>
                </Space>
              ),
            },
          ]}
          dataSource={selectedItems}
          rowKey="id"
          size="small"
          scroll={{ x: 1400 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Modal>

      {/* 盘点执行模态框 */}
      <Modal
        title={`盘点执行 - ${selectedRecord?.planName}`}
        open={isExecuteModalVisible}
        onCancel={() => setIsExecuteModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsExecuteModalVisible(false)}>
            关闭
          </Button>,
          <Button key="export" icon={<FileExcelOutlined />}>
            导出盘点结果
          </Button>,
          <Button key="submit" type="primary" icon={<CheckOutlined />}>
            完成盘点
          </Button>,
        ]}
        width={1600}
        style={{ top: 20 }}
      >
        {selectedRecord && (
          <div>
            {/* 盘点进度统计 */}
            {(() => {
              const stats = calculateCheckStats(selectedItems);
              return (
                <Row gutter={16} style={{ marginBottom: 16 }}>
                  <Col span={4}>
                    <Statistic
                      title="总物料数"
                      value={stats.total}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Col>
                  <Col span={4}>
                    <Statistic
                      title="已盘点"
                      value={stats.checked}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Col>
                  <Col span={4}>
                    <Statistic
                      title="待盘点"
                      value={stats.pending}
                      valueStyle={{ color: '#faad14' }}
                    />
                  </Col>
                  <Col span={4}>
                    <Statistic
                      title="正常"
                      value={stats.normal}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Col>
                  <Col span={4}>
                    <Statistic
                      title="差异"
                      value={stats.abnormal + stats.missing + stats.excess}
                      valueStyle={{ color: '#f5222d' }}
                    />
                  </Col>
                  <Col span={4}>
                    <div>
                      <Statistic
                        title="盘点进度"
                        value={stats.progress}
                        suffix="%"
                        valueStyle={{ color: '#722ed1' }}
                      />
                      <Progress 
                        percent={stats.progress} 
                        size="small" 
                        status={stats.progress === 100 ? 'success' : 'active'}
                        style={{ marginTop: 8 }}
                      />
                    </div>
                  </Col>
                </Row>
              );
            })()}

            <Divider />

            {/* 盘点操作区 */}
            <Tabs defaultActiveKey="list" type="card">
              <TabPane tab={`物品清单 (${selectedItems.length})`} key="list">
                <div style={{ marginBottom: 16 }}>
                  <Space>
                    <Input.Search
                      placeholder="搜索物料编码、名称或库位"
                      style={{ width: 300 }}
                      onSearch={(value) => {
                        // 这里可以添加搜索逻辑
                        console.log('搜索:', value);
                      }}
                    />
                    <Select placeholder="筛选状态" style={{ width: 120 }} allowClear>
                      <Option value="pending">待盘点</Option>
                      <Option value="checked">已盘点</Option>
                      <Option value="abnormal">异常</Option>
                      <Option value="missing">缺失</Option>
                      <Option value="excess">多余</Option>
                    </Select>
                    <Select placeholder="筛选库位" style={{ width: 120 }} allowClear>
                      <Option value="A区-01">A区-01</Option>
                      <Option value="A区-02">A区-02</Option>
                      <Option value="B区-01">B区-01</Option>
                      <Option value="B区-02">B区-02</Option>
                    </Select>
                    <Button icon={<ScanOutlined />} type="primary">
                      扫码盘点
                    </Button>
                  </Space>
                </div>

                <Table
                  columns={[
                    {
                      title: '序号',
                      key: 'index',
                      width: 60,
                      render: (_, __, index) => index + 1,
                    },
                    {
                      title: '库位',
                      dataIndex: 'location',
                      key: 'location',
                      width: 80,
                      sorter: (a, b) => a.location.localeCompare(b.location),
                    },
                    {
                      title: '物料编码',
                      dataIndex: 'itemCode',
                      key: 'itemCode',
                      width: 100,
                    },
                    {
                      title: '物料名称',
                      dataIndex: 'itemName',
                      key: 'itemName',
                      width: 150,
                      ellipsis: true,
                    },
                    {
                      title: '规格',
                      dataIndex: 'specification',
                      key: 'specification',
                      width: 120,
                      ellipsis: true,
                    },
                    {
                      title: '批次号',
                      dataIndex: 'batchNo',
                      key: 'batchNo',
                      width: 100,
                    },
                    {
                      title: '账面数量',
                      dataIndex: 'bookQuantity',
                      key: 'bookQuantity',
                      width: 80,
                      align: 'right',
                      render: (value, record) => `${value} ${record.unit}`,
                    },
                    {
                      title: '实盘数量',
                      dataIndex: 'actualQuantity',
                      key: 'actualQuantity',
                      width: 100,
                      align: 'right',
                      render: (value, record) => {
                        if (value === undefined || value === null) {
                          return (
                            <InputNumber
                              size="small"
                              min={0}
                              placeholder="请输入"
                              style={{ width: '80px' }}
                              onChange={(val) => {
                                // 更新实盘数量
                                updateItemStatus(record.id, {
                                  actualQuantity: val || 0
                                });
                              }}
                            />
                          );
                        }
                        return `${value} ${record.unit}`;
                      },
                    },
                    {
                      title: '差异数量',
                      dataIndex: 'differenceQuantity',
                      key: 'differenceQuantity',
                      width: 80,
                      align: 'right',
                      render: (value, record) => {
                        if (value === undefined || value === null) return '-';
                        const color = value === 0 ? '#52c41a' : '#f5222d';
                        return (
                          <span style={{ color, fontWeight: 'bold' }}>
                            {value > 0 ? `+${value}` : value} {record.unit}
                          </span>
                        );
                      },
                    },
                    {
                      title: '盘点状态',
                      dataIndex: 'checkStatus',
                      key: 'checkStatus',
                      width: 80,
                      render: (status: string) => {
                        const statusConfig = {
                          pending: { color: 'default', text: '待盘点' },
                          checked: { color: 'success', text: '已盘点' },
                          abnormal: { color: 'warning', text: '异常' },
                          missing: { color: 'error', text: '缺失' },
                          excess: { color: 'purple', text: '多余' },
                        };
                        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
                        return <Tag color={config.color}>{config.text}</Tag>;
                      },
                    },
                    {
                      title: '盘点人',
                      dataIndex: 'checkUser',
                      key: 'checkUser',
                      width: 80,
                      render: (value) => value || '-',
                    },
                    {
                      title: '盘点时间',
                      dataIndex: 'checkDate',
                      key: 'checkDate',
                      width: 140,
                      render: (value) => value || '-',
                    },
                    {
                      title: '操作',
                      key: 'action',
                      width: 120,
                      fixed: 'right',
                      render: (_, record) => (
                        <Space size="small">
                          <Button 
                            type="link" 
                            size="small" 
                            icon={<EditOutlined />}
                            onClick={() => {
                              // 打开编辑模态框
                              executeForm.setFieldsValue({
                                itemCode: record.itemCode,
                                location: record.location,
                                batchNo: record.batchNo,
                                actualQuantity: record.actualQuantity,
                                differenceReason: record.differenceReason,
                              });
                            }}
                          >
                            编辑
                          </Button>
                          {record.checkStatus === 'pending' && (
                            <Button 
                              type="link" 
                              size="small" 
                              icon={<CheckOutlined />}
                              onClick={() => {
                                // 快速标记为已盘点（账面数量）
                                updateItemStatus(record.id, {
                                  actualQuantity: record.bookQuantity
                                });
                              }}
                            >
                              正常
                            </Button>
                          )}
                        </Space>
                      ),
                    },
                  ]}
                  dataSource={selectedItems}
                  rowKey="id"
                  size="small"
                  scroll={{ x: 1400, y: 400 }}
                  pagination={{
                    pageSize: 20,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`,
                  }}
                  rowClassName={(record) => {
                    if (record.checkStatus === 'pending') return 'row-pending';
                    if (record.differenceQuantity && record.differenceQuantity !== 0) return 'row-difference';
                    return '';
                  }}
                />
              </TabPane>

              <TabPane tab="差异汇总" key="difference">
                <Table
                  columns={[
                    {
                      title: '库位',
                      dataIndex: 'location',
                      key: 'location',
                      width: 80,
                    },
                    {
                      title: '物料编码',
                      dataIndex: 'itemCode',
                      key: 'itemCode',
                      width: 100,
                    },
                    {
                      title: '物料名称',
                      dataIndex: 'itemName',
                      key: 'itemName',
                      width: 150,
                    },
                    {
                      title: '账面数量',
                      dataIndex: 'bookQuantity',
                      key: 'bookQuantity',
                      width: 80,
                      align: 'right',
                    },
                    {
                      title: '实盘数量',
                      dataIndex: 'actualQuantity',
                      key: 'actualQuantity',
                      width: 80,
                      align: 'right',
                    },
                    {
                      title: '差异数量',
                      dataIndex: 'differenceQuantity',
                      key: 'differenceQuantity',
                      width: 80,
                      align: 'right',
                      render: (value, record) => (
                        <span style={{ 
                          color: value > 0 ? '#52c41a' : '#f5222d', 
                          fontWeight: 'bold' 
                        }}>
                          {value > 0 ? `+${value}` : value} {record.unit}
                        </span>
                      ),
                    },
                    {
                      title: '差异金额',
                      key: 'differenceValue',
                      width: 100,
                      align: 'right',
                      render: (_, record) => {
                        const value = (record.differenceQuantity || 0) * record.unitPrice;
                        return (
                          <span style={{ 
                            color: value > 0 ? '#52c41a' : '#f5222d', 
                            fontWeight: 'bold' 
                          }}>
                            {value > 0 ? '+' : ''}¥{value.toFixed(2)}
                          </span>
                        );
                      },
                    },
                    {
                      title: '差异原因',
                      dataIndex: 'differenceReason',
                      key: 'differenceReason',
                      width: 150,
                      ellipsis: true,
                    },
                    {
                      title: '调整状态',
                      dataIndex: 'adjustmentStatus',
                      key: 'adjustmentStatus',
                      width: 80,
                      render: (status: string) => (
                        <Tag color={getAdjustmentStatusColor(status)}>
                          {status === 'pending' ? '待调整' :
                           status === 'approved' ? '已批准' :
                           status === 'rejected' ? '已拒绝' : '已调整'}
                        </Tag>
                      ),
                    },
                    {
                      title: '操作',
                      key: 'action',
                      width: 100,
                      render: (_, record) => (
                        <Button 
                          type="link" 
                          size="small" 
                          icon={<CheckOutlined />}
                          onClick={() => handleAdjustmentRequest(record)}
                          disabled={record.adjustmentStatus !== 'pending'}
                        >
                          {record.adjustmentStatus === 'pending' ? '申请调整' : 
                           record.adjustmentStatus === 'approved' ? '已批准' :
                           record.adjustmentStatus === 'rejected' ? '已拒绝' : '已调整'}
                        </Button>
                      ),
                    },
                  ]}
                  dataSource={selectedItems.filter(item => 
                    item.differenceQuantity !== undefined && 
                    item.differenceQuantity !== 0
                  )}
                  rowKey="id"
                  size="small"
                  pagination={false}
                />
              </TabPane>

              <TabPane tab="手工录入" key="manual">
                <Form form={executeForm} layout="vertical">
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item label="物料编码" name="itemCode">
                        <Input placeholder="请输入或扫描物料编码" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="库位" name="location">
                        <Input placeholder="请输入库位" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="批次号" name="batchNo">
                        <Input placeholder="请输入批次号" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label="实盘数量" name="actualQuantity">
                        <InputNumber min={0} placeholder="请输入实盘数量" style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="差异原因" name="differenceReason">
                        <Input placeholder="如有差异，请说明原因" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item>
                    <Space>
                      <Button type="primary" icon={<CheckOutlined />}>
                        确认盘点
                      </Button>
                      <Button icon={<ScanOutlined />}>
                        扫码录入
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              </TabPane>
            </Tabs>
          </div>
        )}
      </Modal>

      {/* 调整申请模态框 */}
      <Modal
        title="库存调整申请"
        open={isAdjustmentModalVisible}
        onOk={handleSubmitAdjustment}
        onCancel={() => setIsAdjustmentModalVisible(false)}
        width={800}
        okText="提交申请"
        cancelText="取消"
      >
        <Form form={adjustmentForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="物料编码" name="itemCode">
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="物料名称" name="itemName">
                <Input disabled />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="库位" name="location">
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="批次号" name="batchNo">
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="账面数量" name="bookQuantity">
                <InputNumber disabled style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="实盘数量" name="actualQuantity">
                <InputNumber disabled style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="差异数量" name="differenceQuantity">
                <InputNumber disabled style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="差异金额" name="differenceValue">
                <Input disabled addonAfter="元" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item 
            label="差异原因" 
            name="differenceReason"
            rules={[{ required: true, message: '请输入差异原因' }]}
          >
            <Select placeholder="请选择差异原因">
              <Option value="盘点错误">盘点错误</Option>
              <Option value="系统错误">系统错误</Option>
              <Option value="货物损坏">货物损坏</Option>
              <Option value="货物丢失">货物丢失</Option>
              <Option value="供应商多发">供应商多发</Option>
              <Option value="供应商少发">供应商少发</Option>
              <Option value="其他">其他</Option>
            </Select>
          </Form.Item>
          <Form.Item label="备注说明" name="remarks">
            <TextArea rows={4} placeholder="请详细说明差异情况和调整原因" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default InventoryCheck;