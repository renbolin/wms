import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Modal, Form, Input, Select, DatePicker, Space, Tag, message, Descriptions, Row, Col, InputNumber, Statistic, Divider } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined, SearchOutlined, CheckOutlined, UploadOutlined, DownloadOutlined, UnorderedListOutlined, SwapOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;


// 调拨单接口
interface TransferOrder {
  id: string;
  transferNo: string;
  fromWarehouse: string;
  fromWarehouseName: string;
  toWarehouse: string;
  toWarehouseName: string;
  applicant: string;
  department: string;
  applyDate: string;
  transferDate: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'transferred' | 'received' | 'in_transit';
  statusText: string;
  totalItems: number;
  totalQuantity: number;
  totalAmount: number;
  approver?: string;
  approveDate?: string;
  transferer?: string;
  receiver?: string;
  receiveDate?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  urgentReason?: string;
  expectedDate?: string;
  actualDate?: string;
  purpose: string;
  isBatch: boolean;
  batchId?: string;
  trackingNo?: string;
  transportMethod?: string;
  transportCost?: number;
  remarks: string;
  items: TransferItem[];
}

// 调拨明细接口
interface TransferItem {
  id: string;
  itemCode: string;
  itemName: string;
  specification: string;
  unit: string;
  requestQuantity: number;
  transferQuantity: number;
  receiveQuantity: number;
  unitPrice: number;
  totalAmount: number;
  currentStock: number;
  batchNo?: string;
  serialNo?: string;
  fromLocation?: string;
  toLocation?: string;
  expiryDate?: string;
  transferStatus: 'pending' | 'transferred' | 'in_transit' | 'received' | 'shortage';
  transferDate?: string;
  receiveDate?: string;
  supplier?: string;
  remarks: string;
}

const InventoryTransfer: React.FC = () => {
  const [data, setData] = useState<TransferOrder[]>([]);
  const [filteredData, setFilteredData] = useState<TransferOrder[]>([]);
  const [loading, _setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  const [editingRecord, setEditingRecord] = useState<TransferOrder | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<TransferOrder | null>(null);
  const [transferItems, setTransferItems] = useState<TransferItem[]>([]);
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();

  // 模拟数据
  const mockData: TransferOrder[] = [
    {
      id: '1',
      transferNo: 'TR202401001',
      fromWarehouse: 'WH001',
      fromWarehouseName: '主仓库',
      toWarehouse: 'WH002',
      toWarehouseName: '分仓库',
      applicant: '张三',
      department: '采购部',
      applyDate: '2024-01-25',
      transferDate: '2024-01-26',
      status: 'pending',
      statusText: '待审批',
      totalItems: 3,
      totalQuantity: 150,
      totalAmount: 45000,
      priority: 'medium',
      expectedDate: '2024-01-28',
      purpose: '库存调整',
      isBatch: false,
      remarks: '紧急调拨',
      items: []
    },
    {
      id: '2',
      transferNo: 'TR202401002',
      fromWarehouse: 'WH002',
      fromWarehouseName: '分仓库',
      toWarehouse: 'WH001',
      toWarehouseName: '主仓库',
      applicant: '李四',
      department: '仓储部',
      applyDate: '2024-01-24',
      transferDate: '2024-01-25',
      status: 'approved',
      statusText: '已审批',
      totalItems: 2,
      totalQuantity: 80,
      totalAmount: 32000,
      approver: '王五',
      approveDate: '2024-01-25',
      priority: 'high',
      expectedDate: '2024-01-27',
      purpose: '补充库存',
      isBatch: false,
      remarks: '常规调拨',
      items: []
    }
  ];

  const mockTransferItems: TransferItem[] = [
    {
      id: '1',
      itemCode: 'IT001',
      itemName: '台式电脑',
      specification: 'Intel i5, 8GB内存, 256GB SSD',
      unit: '台',
      requestQuantity: 50,
      transferQuantity: 50,
      receiveQuantity: 48,
      unitPrice: 3800,
      totalAmount: 190000,
      currentStock: 120,
      batchNo: 'B20240125001',
      fromLocation: 'A区-01',
      toLocation: 'B区-02',
      transferStatus: 'received',
      transferDate: '2024-01-26',
      receiveDate: '2024-01-27',
      supplier: '联想科技',
      remarks: '2台损坏'
    }
  ];

  useEffect(() => {
    setData(mockData);
    setFilteredData(mockData);
  }, []);

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: TransferOrder) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      applyDate: dayjs(record.applyDate),
      transferDate: record.transferDate ? dayjs(record.transferDate) : null,
      expectedDate: record.expectedDate ? dayjs(record.expectedDate) : null,
    });
    setIsModalVisible(true);
  };

  const handleDelete = (record: TransferOrder) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除调拨单 ${record.transferNo} 吗？`,
      onOk: () => {
        const newData = data.filter(item => item.id !== record.id);
        setData(newData);
        setFilteredData(newData);
        message.success('删除成功');
      },
    });
  };

  const handleView = (record: TransferOrder) => {
    setSelectedRecord(record);
    setTransferItems(mockTransferItems);
    setIsDetailModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const newRecord: TransferOrder = {
        id: editingRecord ? editingRecord.id : Date.now().toString(),
        transferNo: editingRecord ? editingRecord.transferNo : `TR${Date.now()}`,
        fromWarehouse: values.fromWarehouse,
        fromWarehouseName: values.fromWarehouseName || '主仓库',
        toWarehouse: values.toWarehouse,
        toWarehouseName: values.toWarehouseName || '分仓库',
        applicant: values.applicant,
        department: values.department,
        applyDate: values.applyDate.format('YYYY-MM-DD'),
        transferDate: values.transferDate ? values.transferDate.format('YYYY-MM-DD') : '',
        status: 'draft',
        statusText: '草稿',
        totalItems: 0,
        totalQuantity: 0,
        totalAmount: 0,
        priority: values.priority,
        expectedDate: values.expectedDate ? values.expectedDate.format('YYYY-MM-DD') : '',
        purpose: values.purpose,
        isBatch: false,
        remarks: values.remarks || '',
        items: []
      };

      if (editingRecord) {
        const newData = data.map(item => 
          item.id === editingRecord.id ? { ...newRecord, status: editingRecord.status, statusText: editingRecord.statusText } : item
        );
        setData(newData);
        setFilteredData(newData);
        message.success('修改成功');
      } else {
        const newData = [newRecord, ...data];
        setData(newData);
        setFilteredData(newData);
        message.success('新增成功');
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
      let filtered = [...data];

      if (values.transferNo) {
        filtered = filtered.filter(item => 
          item.transferNo.toLowerCase().includes(values.transferNo.toLowerCase())
        );
      }

      if (values.status) {
        filtered = filtered.filter(item => item.status === values.status);
      }

      if (values.fromWarehouse) {
        filtered = filtered.filter(item => item.fromWarehouse === values.fromWarehouse);
      }

      if (values.toWarehouse) {
        filtered = filtered.filter(item => item.toWarehouse === values.toWarehouse);
      }

      if (values.dateRange && values.dateRange.length === 2) {
        const [startDate, endDate] = values.dateRange;
        filtered = filtered.filter(item => {
          const itemDate = dayjs(item.applyDate);
          return itemDate.isAfter(startDate.subtract(1, 'day')) && itemDate.isBefore(endDate.add(1, 'day'));
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

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'default',
      pending: 'processing',
      approved: 'success',
      rejected: 'error',
      transferred: 'warning',
      received: 'success',
      in_transit: 'processing'
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'default',
      medium: 'processing',
      high: 'warning',
      urgent: 'error'
    };
    return colors[priority as keyof typeof colors] || 'default';
  };

  const columns: ColumnsType<TransferOrder> = [
    {
      title: '序号',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: '调拨单号',
      dataIndex: 'transferNo',
      key: 'transferNo',
      width: 120,
    },
    {
      title: '调出仓库',
      dataIndex: 'fromWarehouseName',
      key: 'fromWarehouseName',
      width: 100,
    },
    {
      title: '调入仓库',
      dataIndex: 'toWarehouseName',
      key: 'toWarehouseName',
      width: 100,
    },
    {
      title: '申请人',
      dataIndex: 'applicant',
      key: 'applicant',
      width: 80,
    },
    {
      title: '申请日期',
      dataIndex: 'applyDate',
      key: 'applyDate',
      width: 100,
    },
    {
      title: '预计调拨日期',
      dataIndex: 'expectedDate',
      key: 'expectedDate',
      width: 120,
    },
    {
      title: '物料种类',
      dataIndex: 'totalItems',
      key: 'totalItems',
      width: 80,
      render: (value) => `${value} 种`,
    },
    {
      title: '总数量',
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
      width: 80,
    },
    {
      title: '总金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 100,
      render: (value) => `¥${value.toLocaleString()}`,
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      render: (priority) => {
        const priorityMap = {
          low: '低',
          medium: '中',
          high: '高',
          urgent: '紧急'
        };
        return (
          <Tag color={getPriorityColor(priority)}>
            {priorityMap[priority as keyof typeof priorityMap]}
          </Tag>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status, record) => (
        <Tag color={getStatusColor(status)}>
          {record.statusText}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleView(record)}>
            详情
          </Button>
          {record.status === 'draft' && (
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
              编辑
            </Button>
          )}
          {(record.status === 'draft' || record.status === 'rejected') && (
            <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
              删除
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // 统计数据
  const totalOrders = data.length;
  const pendingOrders = data.filter(item => item.status === 'pending').length;
  const approvedOrders = data.filter(item => item.status === 'approved').length;
  const completedOrders = data.filter(item => item.status === 'received').length;

  return (
    <div className="p-6">
      {/* 统计卡片 */}
      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card>
            <Statistic
              title="总调拨单"
              value={totalOrders}
              prefix={<UnorderedListOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待审批"
              value={pendingOrders}
              prefix={<SwapOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已审批"
              value={approvedOrders}
              prefix={<CheckOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已完成"
              value={completedOrders}
              prefix={<CheckOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 搜索表单 */}
      <Card className="mb-4">
        <Form form={searchForm} layout="inline">
          <Form.Item name="transferNo" label="调拨单号">
            <Input placeholder="请输入调拨单号" style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择状态" style={{ width: 120 }} allowClear>
              <Option value="draft">草稿</Option>
              <Option value="pending">待审批</Option>
              <Option value="approved">已审批</Option>
              <Option value="rejected">已拒绝</Option>
              <Option value="transferred">已调拨</Option>
              <Option value="received">已接收</Option>
            </Select>
          </Form.Item>
          <Form.Item name="fromWarehouse" label="调出仓库">
            <Select placeholder="请选择调出仓库" style={{ width: 120 }} allowClear>
              <Option value="WH001">主仓库</Option>
              <Option value="WH002">分仓库</Option>
              <Option value="WH003">冷藏仓库</Option>
            </Select>
          </Form.Item>
          <Form.Item name="toWarehouse" label="调入仓库">
            <Select placeholder="请选择调入仓库" style={{ width: 120 }} allowClear>
              <Option value="WH001">主仓库</Option>
              <Option value="WH002">分仓库</Option>
              <Option value="WH003">冷藏仓库</Option>
            </Select>
          </Form.Item>
          <Form.Item name="dateRange" label="申请日期">
            <DatePicker.RangePicker />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                搜索
              </Button>
              <Button onClick={handleReset}>重置</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* 调拨单表格 */}
      <Card
        title="调拨单列表"
        extra={
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增调拨单
            </Button>
            <Button icon={<UploadOutlined />}>
              批量导入
            </Button>
            <Button icon={<DownloadOutlined />}>
              导出
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
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
        title={editingRecord ? '编辑调拨单' : '新增调拨单'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="fromWarehouse" label="调出仓库" rules={[{ required: true, message: '请选择调出仓库' }]}>
                <Select placeholder="请选择调出仓库">
                  <Option value="WH001">主仓库</Option>
                  <Option value="WH002">分仓库</Option>
                  <Option value="WH003">冷藏仓库</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="toWarehouse" label="调入仓库" rules={[{ required: true, message: '请选择调入仓库' }]}>
                <Select placeholder="请选择调入仓库">
                  <Option value="WH001">主仓库</Option>
                  <Option value="WH002">分仓库</Option>
                  <Option value="WH003">冷藏仓库</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="applicant" label="申请人" rules={[{ required: true, message: '请输入申请人' }]}>
                <Input placeholder="请输入申请人" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="department" label="申请部门" rules={[{ required: true, message: '请输入申请部门' }]}>
                <Input placeholder="请输入申请部门" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="applyDate" label="申请日期" rules={[{ required: true, message: '请选择申请日期' }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="expectedDate" label="预计调拨日期">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="priority" label="优先级" rules={[{ required: true, message: '请选择优先级' }]}>
                <Select placeholder="请选择优先级">
                  <Option value="low">低</Option>
                  <Option value="medium">中</Option>
                  <Option value="high">高</Option>
                  <Option value="urgent">紧急</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="purpose" label="调拨目的" rules={[{ required: true, message: '请输入调拨目的' }]}>
                <Input placeholder="请输入调拨目的" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="remarks" label="备注">
            <TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 详情模态框 */}
      <Modal
        title="调拨单详情"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedRecord && (
          <div>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="调拨单号">{selectedRecord.transferNo}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={getStatusColor(selectedRecord.status)}>
                  {selectedRecord.statusText}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="调出仓库">{selectedRecord.fromWarehouseName}</Descriptions.Item>
              <Descriptions.Item label="调入仓库">{selectedRecord.toWarehouseName}</Descriptions.Item>
              <Descriptions.Item label="申请人">{selectedRecord.applicant}</Descriptions.Item>
              <Descriptions.Item label="申请部门">{selectedRecord.department}</Descriptions.Item>
              <Descriptions.Item label="申请日期">{selectedRecord.applyDate}</Descriptions.Item>
              <Descriptions.Item label="预计调拨日期">{selectedRecord.expectedDate}</Descriptions.Item>
              <Descriptions.Item label="优先级">
                <Tag color={getPriorityColor(selectedRecord.priority)}>
                  {selectedRecord.priority === 'low' ? '低' : 
                   selectedRecord.priority === 'medium' ? '中' : 
                   selectedRecord.priority === 'high' ? '高' : '紧急'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="调拨目的">{selectedRecord.purpose}</Descriptions.Item>
              <Descriptions.Item label="物料种类">{selectedRecord.totalItems} 种</Descriptions.Item>
              <Descriptions.Item label="总数量">{selectedRecord.totalQuantity}</Descriptions.Item>
              <Descriptions.Item label="总金额" span={2}>¥{selectedRecord.totalAmount.toLocaleString()}</Descriptions.Item>
              {selectedRecord.approver && (
                <>
                  <Descriptions.Item label="审批人">{selectedRecord.approver}</Descriptions.Item>
                  <Descriptions.Item label="审批日期">{selectedRecord.approveDate}</Descriptions.Item>
                </>
              )}
              <Descriptions.Item label="备注" span={2}>{selectedRecord.remarks}</Descriptions.Item>
            </Descriptions>

            <Divider>调拨明细</Divider>
            <Table
              columns={[
                { title: '物料编码', dataIndex: 'itemCode', key: 'itemCode' },
                { title: '物料名称', dataIndex: 'itemName', key: 'itemName' },
                { title: '规格型号', dataIndex: 'specification', key: 'specification' },
                { title: '单位', dataIndex: 'unit', key: 'unit' },
                { title: '申请数量', dataIndex: 'requestQuantity', key: 'requestQuantity' },
                { title: '调拨数量', dataIndex: 'transferQuantity', key: 'transferQuantity' },
                { title: '接收数量', dataIndex: 'receiveQuantity', key: 'receiveQuantity' },
                { title: '单价', dataIndex: 'unitPrice', key: 'unitPrice', render: (value) => `¥${value}` },
                { title: '金额', dataIndex: 'totalAmount', key: 'totalAmount', render: (value) => `¥${value.toLocaleString()}` },
              ]}
              dataSource={transferItems}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default InventoryTransfer;