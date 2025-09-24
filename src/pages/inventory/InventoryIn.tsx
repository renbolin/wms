import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Modal, Form, Input, Select, DatePicker, Space, Tag, message, Descriptions, Row, Col, InputNumber, Tabs, Upload, Progress, Statistic, Divider } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined, SearchOutlined, CheckOutlined, CloseOutlined, UploadOutlined, DownloadOutlined, PrinterOutlined, FileExcelOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

// 入库单接口
interface InboundOrder {
  id: string;
  inboundNo: string;
  type: 'purchase' | 'transfer' | 'return' | 'other';
  typeText: string;
  sourceNo: string; // 来源单号（采购单号或调拨单号）
  warehouse: string;
  warehouseName: string;
  applicant: string;
  applyDate: string;
  inboundDate: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'completed';
  statusText: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  priorityText: string;
  totalItems: number;
  totalQuantity: number;
  totalAmount: number;
  operator?: string;
  operateDate?: string;
  approver?: string;
  approveDate?: string;
  isBatch?: boolean; // 是否批量导入
  batchId?: string; // 批量导入批次ID
  remarks: string;
  items: InboundItem[];
}

// 入库明细接口
interface InboundItem {
  id: string;
  itemCode: string;
  itemName: string;
  specification: string;
  unit: string;
  plannedQuantity: number;
  actualQuantity: number;
  unitPrice: number;
  totalAmount: number;
  batchNo?: string;
  expiryDate?: string;
  productionDate?: string;
  serialNo?: string; // 序列号
  location?: string; // 库位
  supplier?: string;
  remarks: string;
}

const InventoryIn: React.FC = () => {
  const [data, setData] = useState<InboundOrder[]>([]);
  const [filteredData, setFilteredData] = useState<InboundOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isItemModalVisible, setIsItemModalVisible] = useState(false);
  const [isBatchModalVisible, setIsBatchModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<InboundOrder | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<InboundOrder | null>(null);
  const [selectedItems, setSelectedItems] = useState<InboundItem[]>([]);
  const [batchUploadProgress, setBatchUploadProgress] = useState(0);
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [itemForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('all');

  // 模拟数据
  const mockData: InboundOrder[] = [
    {
      id: '1',
      inboundNo: 'IN202401001',
      type: 'purchase',
      typeText: '采购入库',
      sourceNo: 'PO202401001',
      warehouse: 'WH001',
      warehouseName: '主仓库',
      applicant: '张三',
      applyDate: '2024-01-15',
      inboundDate: '2024-01-16',
      status: 'completed',
      statusText: '已完成',
      priority: 'high',
      priorityText: '高',
      totalItems: 3,
      totalQuantity: 150,
      totalAmount: 15000,
      operator: '李四',
      operateDate: '2024-01-16 14:30',
      approver: '王五',
      approveDate: '2024-01-15 16:20',
      isBatch: false,
      remarks: '采购入库',
      items: [
        {
          id: '1',
          itemCode: 'M001',
          itemName: '钢材',
          specification: 'Q235 20*30mm',
          unit: '根',
          plannedQuantity: 100,
          actualQuantity: 100,
          unitPrice: 50,
          totalAmount: 5000,
          batchNo: 'B20240115001',
          expiryDate: '2025-01-15',
          productionDate: '2024-01-10',
          serialNo: 'SN20240115001',
          location: 'A01-01-01',
          supplier: '钢材供应商A',
          remarks: '质量良好'
        }
      ]
    },
    {
      id: '2',
      inboundNo: 'IN202401002',
      type: 'transfer',
      typeText: '调拨入库',
      sourceNo: 'TR202401001',
      warehouse: 'WH002',
      warehouseName: '分仓库A',
      applicant: '赵六',
      applyDate: '2024-01-16',
      inboundDate: '2024-01-17',
      status: 'pending',
      statusText: '待审批',
      priority: 'medium',
      priorityText: '中',
      totalItems: 2,
      totalQuantity: 80,
      totalAmount: 8000,
      isBatch: false,
      remarks: '从主仓库调拨',
      items: []
    },
    {
      id: '3',
      inboundNo: 'IN202401003',
      type: 'return',
      typeText: '退货入库',
      sourceNo: 'RT202401001',
      warehouse: 'WH001',
      warehouseName: '主仓库',
      applicant: '孙七',
      applyDate: '2024-01-17',
      inboundDate: '2024-01-18',
      status: 'approved',
      statusText: '已审批',
      priority: 'urgent',
      priorityText: '紧急',
      totalItems: 1,
      totalQuantity: 20,
      totalAmount: 2000,
      isBatch: true,
      batchId: 'BATCH20240117001',
      remarks: '客户退货',
      items: []
    }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    setTimeout(() => {
      setData(mockData);
      setFilteredData(mockData);
      setLoading(false);
    }, 1000);
  };

  const handleSearch = (values: any) => {
    let filtered = data;

    if (values.inboundNo) {
      filtered = filtered.filter(item => 
        item.inboundNo.toLowerCase().includes(values.inboundNo.toLowerCase())
      );
    }

    if (values.type) {
      filtered = filtered.filter(item => item.type === values.type);
    }

    if (values.status) {
      filtered = filtered.filter(item => item.status === values.status);
    }

    if (values.warehouse) {
      filtered = filtered.filter(item => item.warehouse === values.warehouse);
    }

    if (values.dateRange && values.dateRange.length === 2) {
      const [startDate, endDate] = values.dateRange;
      filtered = filtered.filter(item => {
        const itemDate = dayjs(item.applyDate);
        return itemDate.isAfter(startDate.subtract(1, 'day')) && 
               itemDate.isBefore(endDate.add(1, 'day'));
      });
    }

    setFilteredData(filtered);
  };

  const handleReset = () => {
    searchForm.resetFields();
    setFilteredData(data);
  };

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: InboundOrder) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      applyDate: dayjs(record.applyDate),
      inboundDate: dayjs(record.inboundDate),
    });
    setIsModalVisible(true);
  };

  const handleView = (record: InboundOrder) => {
    setSelectedRecord(record);
    setIsDetailModalVisible(true);
  };

  const handleDelete = (record: InboundOrder) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除入库单 ${record.inboundNo} 吗？`,
      onOk: () => {
        const newData = data.filter(item => item.id !== record.id);
        setData(newData);
        setFilteredData(newData);
        message.success('删除成功');
      },
    });
  };

  const handleApprove = (record: InboundOrder) => {
    Modal.confirm({
      title: '确认审批',
      content: `确定要审批通过入库单 ${record.inboundNo} 吗？`,
      onOk: () => {
        const newData = data.map(item => 
          item.id === record.id 
            ? { 
                ...item, 
                status: 'approved' as const, 
                statusText: '已审批',
                approver: '当前用户',
                approveDate: dayjs().format('YYYY-MM-DD HH:mm')
              }
            : item
        );
        setData(newData);
        setFilteredData(newData);
        message.success('审批成功');
      },
    });
  };

  const handleReject = (record: InboundOrder) => {
    Modal.confirm({
      title: '确认驳回',
      content: `确定要驳回入库单 ${record.inboundNo} 吗？`,
      onOk: () => {
        const newData = data.map(item => 
          item.id === record.id 
            ? { 
                ...item, 
                status: 'rejected' as const, 
                statusText: '已驳回',
                approver: '当前用户',
                approveDate: dayjs().format('YYYY-MM-DD HH:mm')
              }
            : item
        );
        setData(newData);
        setFilteredData(newData);
        message.success('驳回成功');
      },
    });
  };

  const handleComplete = (record: InboundOrder) => {
    Modal.confirm({
      title: '确认完成',
      content: `确定要完成入库单 ${record.inboundNo} 吗？`,
      onOk: () => {
        const newData = data.map(item => 
          item.id === record.id 
            ? { 
                ...item, 
                status: 'completed' as const, 
                statusText: '已完成',
                operator: '当前用户',
                operateDate: dayjs().format('YYYY-MM-DD HH:mm')
              }
            : item
        );
        setData(newData);
        setFilteredData(newData);
        message.success('入库完成');
      },
    });
  };

  const handleBatchImport = () => {
    setIsBatchModalVisible(true);
  };

  const handleExport = () => {
    message.success('导出成功');
  };

  const handlePrint = () => {
    message.success('打印成功');
  };

  const handleViewItems = (record: InboundOrder) => {
    setSelectedRecord(record);
    setSelectedItems(record.items);
    setIsItemModalVisible(true);
  };

  const handleBatchUpload = (info: any) => {
    if (info.file.status === 'uploading') {
      setBatchUploadProgress(info.file.percent || 0);
    }
    if (info.file.status === 'done') {
      setBatchUploadProgress(100);
      message.success('批量导入成功');
      setIsBatchModalVisible(false);
    } else if (info.file.status === 'error') {
      message.error('批量导入失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const newRecord: InboundOrder = {
        id: editingRecord?.id || Date.now().toString(),
        inboundNo: editingRecord?.inboundNo || `IN${dayjs().format('YYYYMMDD')}${String(data.length + 1).padStart(3, '0')}`,
        type: values.type,
        typeText: values.type === 'purchase' ? '采购入库' : values.type === 'transfer' ? '调拨入库' : values.type === 'return' ? '退货入库' : '其他入库',
        sourceNo: values.sourceNo,
        warehouse: values.warehouse,
        warehouseName: values.warehouseName,
        applicant: values.applicant,
        applyDate: values.applyDate.format('YYYY-MM-DD'),
        inboundDate: values.inboundDate.format('YYYY-MM-DD'),
        status: 'draft',
        statusText: '草稿',
        priority: values.priority || 'medium',
        priorityText: values.priority === 'high' ? '高' : values.priority === 'low' ? '低' : values.priority === 'urgent' ? '紧急' : '中',
        totalItems: values.totalItems || 0,
        totalQuantity: values.totalQuantity || 0,
        totalAmount: values.totalAmount || 0,
        remarks: values.remarks || '',
        items: []
      };

      let newData;
      if (editingRecord) {
        newData = data.map(item => item.id === editingRecord.id ? newRecord : item);
        message.success('修改成功');
      } else {
        newData = [...data, newRecord];
        message.success('添加成功');
      }

      setData(newData);
      setFilteredData(newData);
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'default',
      pending: 'processing',
      approved: 'success',
      rejected: 'error',
      completed: 'success',
    };
    return colors[status] || 'default';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'green',
      medium: 'blue',
      high: 'orange',
      urgent: 'red',
    };
    return colors[priority] || 'blue';
  };

  const columns: ColumnsType<InboundOrder> = [
    {
      title: '序号',
      key: 'index',
      width: 60,
      fixed: 'left',
      render: (_, __, index) => index + 1,
    },
    {
      title: '入库单号',
      dataIndex: 'inboundNo',
      key: 'inboundNo',
      width: 150,
      fixed: 'left',
    },
    {
      title: '入库类型',
      dataIndex: 'typeText',
      key: 'typeText',
      width: 100,
    },
    {
      title: '来源单号',
      dataIndex: 'sourceNo',
      key: 'sourceNo',
      width: 150,
    },
    {
      title: '仓库',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
      width: 120,
    },
    {
      title: '申请人',
      dataIndex: 'applicant',
      key: 'applicant',
      width: 100,
    },
    {
      title: '申请日期',
      dataIndex: 'applyDate',
      key: 'applyDate',
      width: 120,
    },
    {
      title: '入库日期',
      dataIndex: 'inboundDate',
      key: 'inboundDate',
      width: 120,
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority: string, record: InboundOrder) => (
        <Tag color={getPriorityColor(priority)}>{record.priorityText}</Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string, record: InboundOrder) => (
        <div>
          <Tag color={getStatusColor(status)}>{record.statusText}</Tag>
          {record.isBatch && <Tag color="purple">批量</Tag>}
        </div>
      ),
    },
    {
      title: '物料数量',
      dataIndex: 'totalItems',
      key: 'totalItems',
      width: 100,
    },
    {
      title: '总数量',
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
      width: 100,
    },
    {
      title: '总金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      render: (amount: number) => `¥${amount.toLocaleString()}`,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record: InboundOrder) => (
        <Space size="small" wrap>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            详情
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => handleViewItems(record)}
          >
            明细
          </Button>
          {record.status === 'draft' && (
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              编辑
            </Button>
          )}
          {record.status === 'pending' && (
            <>
              <Button
                type="link"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => handleApprove(record)}
              >
                审批
              </Button>
              <Button
                type="link"
                size="small"
                danger
                icon={<CloseOutlined />}
                onClick={() => handleReject(record)}
              >
                驳回
              </Button>
            </>
          )}
          {record.status === 'approved' && (
            <Button
              type="link"
              size="small"
              onClick={() => handleComplete(record)}
            >
              完成入库
            </Button>
          )}
          {(record.status === 'draft' || record.status === 'rejected') && (
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
            >
              删除
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const itemColumns: ColumnsType<InboundItem> = [
    {
      title: '物料编码',
      dataIndex: 'itemCode',
      key: 'itemCode',
      width: 120,
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
      width: 150,
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      width: 80,
    },
    {
      title: '计划数量',
      dataIndex: 'plannedQuantity',
      key: 'plannedQuantity',
      width: 100,
    },
    {
      title: '实际数量',
      dataIndex: 'actualQuantity',
      key: 'actualQuantity',
      width: 100,
    },
    {
      title: '单价',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 100,
      render: (price: number) => `¥${price.toFixed(2)}`,
    },
    {
      title: '总金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      render: (amount: number) => `¥${amount.toLocaleString()}`,
    },
    {
      title: '批次号',
      dataIndex: 'batchNo',
      key: 'batchNo',
      width: 120,
    },
    {
      title: '库位',
      dataIndex: 'location',
      key: 'location',
      width: 100,
    },
    {
      title: '备注',
      dataIndex: 'remarks',
      key: 'remarks',
      width: 150,
    },
  ];

  const getTabData = () => {
    switch (activeTab) {
      case 'draft':
        return filteredData.filter(item => item.status === 'draft');
      case 'pending':
        return filteredData.filter(item => item.status === 'pending');
      case 'approved':
        return filteredData.filter(item => item.status === 'approved');
      case 'completed':
        return filteredData.filter(item => item.status === 'completed');
      default:
        return filteredData;
    }
  };

  const getStatistics = () => {
    const total = data.length;
    const draft = data.filter(item => item.status === 'draft').length;
    const pending = data.filter(item => item.status === 'pending').length;
    const approved = data.filter(item => item.status === 'approved').length;
    const completed = data.filter(item => item.status === 'completed').length;
    const totalAmount = data.reduce((sum, item) => sum + item.totalAmount, 0);

    return { total, draft, pending, approved, completed, totalAmount };
  };

  const statistics = getStatistics();

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={4}>
            <Statistic title="总入库单" value={statistics.total} />
          </Col>
          <Col span={4}>
            <Statistic title="草稿" value={statistics.draft} valueStyle={{ color: '#999' }} />
          </Col>
          <Col span={4}>
            <Statistic title="待审批" value={statistics.pending} valueStyle={{ color: '#1890ff' }} />
          </Col>
          <Col span={4}>
            <Statistic title="已审批" value={statistics.approved} valueStyle={{ color: '#52c41a' }} />
          </Col>
          <Col span={4}>
            <Statistic title="已完成" value={statistics.completed} valueStyle={{ color: '#52c41a' }} />
          </Col>
          <Col span={4}>
            <Statistic title="总金额" value={statistics.totalAmount} prefix="¥" precision={2} />
          </Col>
        </Row>

        <Divider />

        <Form
          form={searchForm}
          layout="inline"
          onFinish={handleSearch}
          style={{ marginBottom: 16 }}
        >
          <Form.Item name="inboundNo" label="入库单号">
            <Input placeholder="请输入入库单号" style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="type" label="入库类型">
            <Select placeholder="请选择入库类型" style={{ width: 120 }} allowClear>
              <Option value="purchase">采购入库</Option>
              <Option value="transfer">调拨入库</Option>
              <Option value="return">退货入库</Option>
              <Option value="other">其他入库</Option>
            </Select>
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择状态" style={{ width: 120 }} allowClear>
              <Option value="draft">草稿</Option>
              <Option value="pending">待审批</Option>
              <Option value="approved">已审批</Option>
              <Option value="rejected">已驳回</Option>
              <Option value="completed">已完成</Option>
            </Select>
          </Form.Item>
          <Form.Item name="warehouse" label="仓库">
            <Select placeholder="请选择仓库" style={{ width: 120 }} allowClear>
              <Option value="WH001">主仓库</Option>
              <Option value="WH002">分仓库A</Option>
              <Option value="WH003">分仓库B</Option>
            </Select>
          </Form.Item>
          <Form.Item name="dateRange" label="申请日期">
            <DatePicker.RangePicker />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                搜索
              </Button>
              <Button onClick={handleReset}>重置</Button>
            </Space>
          </Form.Item>
        </Form>

        <div style={{ marginBottom: 16 }}>
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增入库单
            </Button>
            <Button icon={<UploadOutlined />} onClick={handleBatchImport}>
              批量导入
            </Button>
            <Button icon={<DownloadOutlined />} onClick={handleExport}>
              导出
            </Button>
            <Button icon={<PrinterOutlined />} onClick={handlePrint}>
              打印
            </Button>
          </Space>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="全部" key="all" />
          <TabPane tab="草稿" key="draft" />
          <TabPane tab="待审批" key="pending" />
          <TabPane tab="已审批" key="approved" />
          <TabPane tab="已完成" key="completed" />
        </Tabs>

        <Table
          columns={columns}
          dataSource={getTabData()}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1500 }}
          pagination={{
            total: getTabData().length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      {/* 新增/编辑模态框 */}
      <Modal
        title={editingRecord ? '编辑入库单' : '新增入库单'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="入库类型"
                rules={[{ required: true, message: '请选择入库类型' }]}
              >
                <Select placeholder="请选择入库类型">
                  <Option value="purchase">采购入库</Option>
                  <Option value="transfer">调拨入库</Option>
                  <Option value="return">退货入库</Option>
                  <Option value="other">其他入库</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="sourceNo"
                label="来源单号"
                rules={[{ required: true, message: '请输入来源单号' }]}
              >
                <Input placeholder="请输入来源单号" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="warehouse"
                label="仓库"
                rules={[{ required: true, message: '请选择仓库' }]}
              >
                <Select placeholder="请选择仓库">
                  <Option value="WH001">主仓库</Option>
                  <Option value="WH002">分仓库A</Option>
                  <Option value="WH003">分仓库B</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="warehouseName"
                label="仓库名称"
                rules={[{ required: true, message: '请输入仓库名称' }]}
              >
                <Input placeholder="请输入仓库名称" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="applicant"
                label="申请人"
                rules={[{ required: true, message: '请输入申请人' }]}
              >
                <Input placeholder="请输入申请人" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="priority"
                label="优先级"
                rules={[{ required: true, message: '请选择优先级' }]}
              >
                <Select placeholder="请选择优先级">
                  <Option value="low">低</Option>
                  <Option value="medium">中</Option>
                  <Option value="high">高</Option>
                  <Option value="urgent">紧急</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="applyDate"
                label="申请日期"
                rules={[{ required: true, message: '请选择申请日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="inboundDate"
                label="入库日期"
                rules={[{ required: true, message: '请选择入库日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="remarks" label="备注">
            <TextArea rows={3} placeholder="请输入备注" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                确定
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 详情模态框 */}
      <Modal
        title="入库单详情"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {selectedRecord && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="入库单号">{selectedRecord.inboundNo}</Descriptions.Item>
            <Descriptions.Item label="入库类型">{selectedRecord.typeText}</Descriptions.Item>
            <Descriptions.Item label="来源单号">{selectedRecord.sourceNo}</Descriptions.Item>
            <Descriptions.Item label="仓库">{selectedRecord.warehouseName}</Descriptions.Item>
            <Descriptions.Item label="申请人">{selectedRecord.applicant}</Descriptions.Item>
            <Descriptions.Item label="申请日期">{selectedRecord.applyDate}</Descriptions.Item>
            <Descriptions.Item label="入库日期">{selectedRecord.inboundDate}</Descriptions.Item>
            <Descriptions.Item label="优先级">
              <Tag color={getPriorityColor(selectedRecord.priority)}>{selectedRecord.priorityText}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={getStatusColor(selectedRecord.status)}>{selectedRecord.statusText}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="物料数量">{selectedRecord.totalItems}</Descriptions.Item>
            <Descriptions.Item label="总数量">{selectedRecord.totalQuantity}</Descriptions.Item>
            <Descriptions.Item label="总金额">¥{selectedRecord.totalAmount.toLocaleString()}</Descriptions.Item>
            {selectedRecord.operator && (
              <Descriptions.Item label="操作人">{selectedRecord.operator}</Descriptions.Item>
            )}
            {selectedRecord.operateDate && (
              <Descriptions.Item label="操作时间">{selectedRecord.operateDate}</Descriptions.Item>
            )}
            {selectedRecord.approver && (
              <Descriptions.Item label="审批人">{selectedRecord.approver}</Descriptions.Item>
            )}
            {selectedRecord.approveDate && (
              <Descriptions.Item label="审批时间">{selectedRecord.approveDate}</Descriptions.Item>
            )}
            <Descriptions.Item label="备注" span={2}>{selectedRecord.remarks}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* 明细模态框 */}
      <Modal
        title="入库明细"
        open={isItemModalVisible}
        onCancel={() => setIsItemModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsItemModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={1200}
      >
        <Table
          columns={itemColumns}
          dataSource={selectedItems}
          rowKey="id"
          pagination={false}
          scroll={{ x: 1000 }}
        />
      </Modal>

      {/* 批量导入模态框 */}
      <Modal
        title="批量导入入库单"
        open={isBatchModalVisible}
        onCancel={() => setIsBatchModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsBatchModalVisible(false)}>
            关闭
          </Button>
        ]}
      >
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Upload.Dragger
            name="file"
            multiple={false}
            action="/api/upload"
            onChange={handleBatchUpload}
            accept=".xlsx,.xls"
          >
            <p className="ant-upload-drag-icon">
              <FileExcelOutlined style={{ fontSize: 48, color: '#1890ff' }} />
            </p>
            <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
            <p className="ant-upload-hint">
              支持单个文件上传，仅支持 .xlsx 和 .xls 格式
            </p>
          </Upload.Dragger>
          {batchUploadProgress > 0 && batchUploadProgress < 100 && (
            <Progress percent={batchUploadProgress} style={{ marginTop: 16 }} />
          )}
        </div>
      </Modal>
    </div>
  );
};

export default InventoryIn;