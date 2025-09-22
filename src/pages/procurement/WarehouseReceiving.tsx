import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Modal, Form, Input, Select, DatePicker, Space, Tag, message, Descriptions, InputNumber, Row, Col, Upload, Image, Statistic, Typography } from 'antd';
import { PlusOutlined, EyeOutlined, CheckOutlined, CloseOutlined, UploadOutlined, CameraOutlined, InboxOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload/interface';

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

// 入库单接口
interface ReceivingRecord {
  id: string;
  receivingNo: string;
  purchaseOrderNo: string;
  supplierName: string;
  receivingDate: string;
  receiver: string;
  department: string;
  warehouse?: string | null;
  warehouseName?: string | null;
  status: 'pending' | 'partial' | 'completed' | 'rejected';
  statusText: string;
  totalAmount: number;
  items: ReceivingItem[];
  attachments: string[];
  remarks: string;
  qualityCheck: QualityCheck;
}

// 入库项目接口
interface ReceivingItem {
  id: string;
  itemName: string;
  specification: string;
  unit: string;
  orderedQuantity: number;
  receivedQuantity: number;
  unitPrice: number;
  totalPrice: number;
  qualityStatus: 'pass' | 'fail' | 'pending';
  remarks: string;
  currentStock?: number; // 当前库存数量
}

// 质检信息接口
interface QualityCheck {
  checker: string;
  checkDate: string;
  checkResult: 'pass' | 'fail' | 'partial';
  checkRemarks: string;
  attachments: string[];
}

// 采购订单接口（用于选择）
interface PurchaseOrder {
  id: string;
  orderNo: string;
  supplierName: string;
  orderDate: string;
  totalAmount: number;
  status: string;
}

const WarehouseReceiving: React.FC = () => {
  const [data, setData] = useState<ReceivingRecord[]>([]);
  const [filteredData, setFilteredData] = useState<ReceivingRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isReceivingModalVisible, setIsReceivingModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ReceivingRecord | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<ReceivingRecord | null>(null);
  const [form] = Form.useForm();
  const [receivingForm] = Form.useForm();
  const [filterForm] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  // 模拟采购订单数据
  const purchaseOrders: PurchaseOrder[] = [
    { id: '1', orderNo: 'PO202401001', supplierName: '北京科技有限公司', orderDate: '2024-01-15', totalAmount: 43000, status: '已确认' },
    { id: '2', orderNo: 'PO202401002', supplierName: '上海设备制造厂', orderDate: '2024-01-18', totalAmount: 480000, status: '已确认' },
    { id: '3', orderNo: 'PO202401003', supplierName: '广州电子科技', orderDate: '2024-01-20', totalAmount: 25000, status: '已确认' },
  ];

  // 模拟数据
  const mockData: ReceivingRecord[] = [
    {
      id: '1',
      receivingNo: 'WR202401001',
      purchaseOrderNo: 'PO202401001',
      supplierName: '北京科技有限公司',
      receivingDate: '2024-01-25',
      receiver: '张三',
      department: '采购部',
      warehouse: 'warehouse1',
      warehouseName: '主仓库',
      status: 'completed',
      statusText: '已完成',
      totalAmount: 43000,
      items: [
        {
          id: '1',
          itemName: '台式电脑',
          specification: 'Intel i5, 8GB内存, 256GB SSD',
          unit: '台',
          orderedQuantity: 10,
          receivedQuantity: 10,
          unitPrice: 3800,
          totalPrice: 38000,
          qualityStatus: 'pass',
          remarks: '外观完好，功能正常',
          currentStock: 15 // 当前库存15台
        },
        {
          id: '2',
          itemName: '激光打印机',
          specification: 'A4黑白激光打印机',
          unit: '台',
          orderedQuantity: 2,
          receivedQuantity: 2,
          unitPrice: 2500,
          totalPrice: 5000,
          qualityStatus: 'pass',
          remarks: '包装完整，测试正常',
          currentStock: 5 // 当前库存5台
        },
      ],
      attachments: ['入库单.pdf', '质检报告.pdf'],
      remarks: '货物按时到达，质量符合要求',
      qualityCheck: {
        checker: '李四',
        checkDate: '2024-01-25',
        checkResult: 'pass',
        checkRemarks: '所有货物质量检查合格',
        attachments: ['质检照片1.jpg', '质检照片2.jpg']
      }
    },
    {
      id: '2',
      receivingNo: 'WR202401002',
      purchaseOrderNo: 'PO202401002',
      supplierName: '上海设备制造厂',
      receivingDate: '2024-01-28',
      receiver: '王五',
      department: '仓储部',
      warehouse: 'warehouse2',
      warehouseName: '分仓库A',
      status: 'pending',
      statusText: '待处理',
      totalAmount: 480000,
      items: [
        {
          id: '3',
          itemName: '数控机床',
          specification: 'CNC加工中心',
          unit: '台',
          orderedQuantity: 1,
          receivedQuantity: 0,
          unitPrice: 480000,
          totalPrice: 480000,
          qualityStatus: 'pending',
          remarks: '设备尚未到货',
          currentStock: 0 // 当前库存0台
        },
      ],
      attachments: [],
      remarks: '设备延期交货，预计下周到达',
      qualityCheck: {
        checker: '',
        checkDate: '',
        checkResult: 'pending',
        checkRemarks: '',
        attachments: []
      }
    },
    {
      id: '3',
      receivingNo: 'WR202401003',
      purchaseOrderNo: 'PO202401003',
      supplierName: '广州电子科技',
      receivingDate: null,
      receiver: null,
      department: null,
      warehouse: null,
      warehouseName: null,
      status: 'rejected',
      statusText: '已拒绝',
      totalAmount: 25000,
      items: [
        {
          id: '4',
          itemName: '监控摄像头',
          specification: '4K高清网络摄像头',
          unit: '个',
          orderedQuantity: 20,
          receivedQuantity: 0,
          unitPrice: 1250,
          totalPrice: 25000,
          qualityStatus: 'fail',
          remarks: '产品质量不符合要求',
          currentStock: 8 // 当前库存8个
        },
      ],
      attachments: ['拒收通知.pdf'],
      remarks: '产品质量问题，已通知供应商重新发货',
      qualityCheck: {
        checker: '李四',
        checkDate: '2024-01-30',
        checkResult: 'fail',
        checkRemarks: '产品外观有明显瑕疵，功能测试不通过',
        attachments: ['质量问题照片1.jpg', '质量问题照片2.jpg']
      }
    },
    {
      id: '4',
      receivingNo: 'WR202401004',
      purchaseOrderNo: 'PO202401004',
      supplierName: '深圳科技有限公司',
      receivingDate: '2024-02-01',
      receiver: '钱七',
      department: '仓储部',
      status: 'pending',
      statusText: '待处理',
      totalAmount: 15000,
      items: [
        {
          id: '5',
          itemName: '办公椅',
          specification: '人体工学办公椅',
          unit: '把',
          orderedQuantity: 20,
          receivedQuantity: 20,
          unitPrice: 750,
          totalPrice: 15000,
          qualityStatus: 'pending',
          remarks: '待质检'
        },
      ],
      attachments: ['送货单.pdf'],
      remarks: '货物已到达，等待质检',
      qualityCheck: {
        checker: '',
        checkDate: '',
        checkResult: 'pending',
        checkRemarks: '',
        attachments: []
      }
    },
  ];

  useEffect(() => {
    setData(mockData);
    setFilteredData(mockData);
  }, []);

  const handleView = (record: ReceivingRecord) => {
    setSelectedRecord(record);
    setIsDetailModalVisible(true);
  };

  const handleReceiving = (record: ReceivingRecord) => {
    setSelectedRecord(record);
    receivingForm.resetFields();
    setIsReceivingModalVisible(true);
  };

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setFileList([]);
    setIsModalVisible(true);
  };



  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const newRecord: ReceivingRecord = {
        id: editingRecord?.id || Date.now().toString(),
        receivingNo: editingRecord?.receivingNo || `WR${Date.now()}`,
        ...values,
        receivingDate: values.receivingDate.format('YYYY-MM-DD'),
        status: editingRecord?.status || 'pending',
        statusText: editingRecord?.statusText || '待处理',
        items: editingRecord?.items || [],
        attachments: fileList.map(file => file.name),
        qualityCheck: editingRecord?.qualityCheck || {
          checker: '',
          checkDate: '',
          checkResult: 'pending',
          checkRemarks: '',
          attachments: []
        }
      };

      if (editingRecord) {
        const updatedData = data.map(item => 
          item.id === editingRecord.id ? newRecord : item
        );
        setData(updatedData);
        setFilteredData(updatedData);
        message.success('入库单更新成功');
      } else {
        const updatedData = [...data, newRecord];
        setData(updatedData);
        setFilteredData(updatedData);
        message.success('入库单创建成功');
      }

      setIsModalVisible(false);
      form.resetFields();
      setFileList([]);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setFileList([]);
  };

  const handleReceivingSubmit = async () => {
    try {
      const values = await receivingForm.validateFields();
      if (!selectedRecord) return;

      const updatedRecord = {
        ...selectedRecord,
        status: values.qualityStatus === 'passed' ? 'completed' as const : 
                values.qualityStatus === 'failed' ? 'rejected' as const : 'partial' as const,
        statusText: values.qualityStatus === 'passed' ? '已完成' : 
                   values.qualityStatus === 'failed' ? '待处理' : '待处理',
        qualityCheck: {
          ...selectedRecord.qualityCheck,
          checker: values.operator,
          checkDate: new Date().toISOString().split('T')[0],
          checkResult: values.qualityStatus === 'passed' ? 'pass' : 
                      values.qualityStatus === 'failed' ? 'fail' : 'pending',
          checkRemarks: values.remarks || ''
        }
      };

      const updatedData = data.map(item => 
        item.id === selectedRecord.id ? updatedRecord : item
      );

      setData(updatedData);
      setFilteredData(updatedData);
      setIsReceivingModalVisible(false);
      message.success('入库处理完成');
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handleReject = (record: ReceivingRecord) => {
    Modal.confirm({
      title: '确认拒绝入库',
      content: `确定要拒绝入库单 ${record.receivingNo} 吗？拒绝后该入库单状态将变为"待处理"。`,
      okText: '确认拒绝',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        const updatedRecord = {
          ...record,
          status: 'rejected' as const,
          statusText: '待处理',
          qualityCheck: {
            ...record.qualityCheck,
            checkResult: 'fail' as const,
            checkRemarks: record.qualityCheck.checkRemarks || '入库被拒绝',
            checkDate: record.qualityCheck.checkDate || new Date().toISOString().split('T')[0],
            checker: record.qualityCheck.checker || '系统操作'
          }
        };

        const updatedData = data.map(item => 
          item.id === record.id ? updatedRecord : item
        );

        setData(updatedData);
        setFilteredData(updatedData);
        message.success('入库单已拒绝');
      }
    });
  };

  // 查询函数
  const handleSearch = () => {
    const values = filterForm.getFieldsValue();
    let filtered = [...data];

    // 按入库单号筛选
    if (values.receivingNo) {
      filtered = filtered.filter(item => 
        item.receivingNo.toLowerCase().includes(values.receivingNo.toLowerCase())
      );
    }

    // 按采购订单号筛选
    if (values.purchaseOrderNo) {
      filtered = filtered.filter(item => 
        item.purchaseOrderNo.toLowerCase().includes(values.purchaseOrderNo.toLowerCase())
      );
    }

    // 按供应商筛选
    if (values.supplierName) {
      filtered = filtered.filter(item => 
        item.supplierName.toLowerCase().includes(values.supplierName.toLowerCase())
      );
    }

    // 按状态筛选
    if (values.status) {
      filtered = filtered.filter(item => item.status === values.status);
    }

    // 按收货人筛选
    if (values.receiver) {
      filtered = filtered.filter(item => 
        item.receiver && item.receiver.toLowerCase().includes(values.receiver.toLowerCase())
      );
    }

    // 按日期范围筛选
    if (values.dateRange && values.dateRange.length === 2) {
      const [startDate, endDate] = values.dateRange;
      filtered = filtered.filter(item => {
        if (!item.receivingDate) return false;
        const itemDate = new Date(item.receivingDate);
        return itemDate >= startDate.toDate() && itemDate <= endDate.toDate();
      });
    }

    setFilteredData(filtered);
  };

  // 重置函数
  const handleReset = () => {
    filterForm.resetFields();
    setFilteredData(data);
  };

  const handleFilter = (status: string) => {
    if (status === 'all') {
      setFilteredData(data);
    } else {
      setFilteredData(data.filter(item => item.status === status));
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'processing',
      partial: 'warning',
      completed: 'success',
      rejected: 'error',
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getQualityStatusColor = (status: string) => {
    const colors = {
      pass: 'success',
      fail: 'error',
      pending: 'processing',
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const columns: ColumnsType<ReceivingRecord> = [
    {
      title: '序号',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: '入库单号',
      dataIndex: 'receivingNo',
      key: 'receivingNo',
      width: 120,
    },
    {
      title: '采购订单号',
      dataIndex: 'purchaseOrderNo',
      key: 'purchaseOrderNo',
      width: 120,
    },
    {
      title: '供应商',
      dataIndex: 'supplierName',
      key: 'supplierName',
      width: 150,
    },
    {
      title: '入库日期',
      dataIndex: 'receivingDate',
      key: 'receivingDate',
      width: 100,
    },
    {
      title: '收货人',
      dataIndex: 'receiver',
      key: 'receiver',
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
      width: 220,
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
          {record.status === 'pending' && (
            <Button
              type="link"
              size="small"
              icon={<InboxOutlined />}
              onClick={() => handleReceiving(record)}
            >
              入库处理
            </Button>
          )}

          {record.status === 'pending' && (
            <Button
              type="link"
              size="small"
              danger
              icon={<CloseOutlined />}
              onClick={() => handleReject(record)}
            >
              拒绝入库
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card>
        {/* 筛选条件区域 */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
          <Form form={filterForm} layout="inline">
            <Row gutter={[16, 16]} className="w-full">
              <Col span={4}>
                <Form.Item name="receivingNo" label="入库单号">
                  <Input placeholder="请输入入库单号" />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item name="purchaseOrderNo" label="采购订单号">
                  <Input placeholder="请输入采购订单号" />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item name="supplierName" label="供应商">
                  <Input placeholder="请输入供应商名称" />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item name="status" label="状态">
                  <Select placeholder="请选择状态" allowClear>
                    <Option value="pending">待处理</Option>
                    <Option value="completed">已完成</Option>
                    <Option value="rejected">已拒绝</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item name="receiver" label="收货人">
                  <Input placeholder="请输入收货人" />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item name="dateRange" label="入库日期">
                  <DatePicker.RangePicker placeholder={['开始日期', '结束日期']} />
                </Form.Item>
              </Col>
              <Col span={24} className="text-right">
                <Space>
                  <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                    查询
                  </Button>
                  <Button onClick={handleReset}>
                    重置
                  </Button>
                </Space>
              </Col>
            </Row>
          </Form>
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

      {/* 新建/编辑入库单模态框 */}
      <Modal
        title={editingRecord ? '编辑入库单' : '新建入库单'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={800}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="purchaseOrderNo"
                label="采购订单"
                rules={[{ required: true, message: '请选择采购订单' }]}
              >
                <Select placeholder="请选择采购订单">
                  {purchaseOrders.map(order => (
                    <Option key={order.id} value={order.orderNo}>
                      {order.orderNo} - {order.supplierName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="receivingDate"
                label="入库日期"
                rules={[{ required: true, message: '请选择入库日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="receiver"
                label="收货人"
                rules={[{ required: true, message: '请输入收货人' }]}
              >
                <Input placeholder="请输入收货人" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="department"
                label="收货部门"
                rules={[{ required: true, message: '请选择收货部门' }]}
              >
                <Select placeholder="请选择收货部门">
                  <Option value="仓储部">仓储部</Option>
                  <Option value="生产部">生产部</Option>
                  <Option value="技术部">技术部</Option>
                  <Option value="行政部">行政部</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="remarks"
            label="备注"
          >
            <TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>
          <Form.Item label="附件上传">
            <Upload
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              beforeUpload={() => false}
            >
              <Button icon={<UploadOutlined />}>上传文件</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      {/* 详情模态框 */}
      <Modal
        title="入库单详情"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={null}
        width={1000}
      >
        {selectedRecord && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="入库单号">{selectedRecord.receivingNo}</Descriptions.Item>
              <Descriptions.Item label="采购订单号">{selectedRecord.purchaseOrderNo}</Descriptions.Item>
              <Descriptions.Item label="供应商">{selectedRecord.supplierName}</Descriptions.Item>
              {selectedRecord.status !== 'rejected' && selectedRecord.warehouseName && (
                <Descriptions.Item label="入库仓库">{selectedRecord.warehouseName}</Descriptions.Item>
              )}
              {selectedRecord.status !== 'rejected' && selectedRecord.receivingDate && (
                <Descriptions.Item label="入库日期">{selectedRecord.receivingDate}</Descriptions.Item>
              )}
              {selectedRecord.status !== 'rejected' && selectedRecord.receiver && (
                <Descriptions.Item label="收货人">{selectedRecord.receiver}</Descriptions.Item>
              )}
              {selectedRecord.status !== 'rejected' && selectedRecord.department && (
                <Descriptions.Item label="收货部门">{selectedRecord.department}</Descriptions.Item>
              )}
              <Descriptions.Item label="总金额">¥{selectedRecord.totalAmount.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={getStatusColor(selectedRecord.status)}>{selectedRecord.statusText}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="备注" span={2}>{selectedRecord.remarks}</Descriptions.Item>
            </Descriptions>

            {/* 库存信息展示区域 */}
            <div className="mt-4">
              <h4 style={{ marginBottom: 12 }}>库存变化信息</h4>
              {selectedRecord.items?.map((item, index) => (
                <Card key={item.id} size="small" style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ flex: 1 }}>
                      <Text strong>{item.itemName}</Text>
                      <br />
                      <Text type="secondary">{item.specification}</Text>
                    </div>
                    <div style={{ display: 'flex', gap: 16 }}>
                      <Statistic
                        title="入库前库存"
                        value={item.currentStock || 0}
                        suffix={item.unit}
                        valueStyle={{ fontSize: 16 }}
                      />
                      <Statistic
                        title="本次入库"
                        value={item.receivedQuantity || 0}
                        suffix={item.unit}
                        valueStyle={{ fontSize: 16, color: '#1890ff' }}
                      />
                      <Statistic
                        title="入库后库存"
                        value={(item.currentStock || 0) + (item.receivedQuantity || 0)}
                        suffix={item.unit}
                        valueStyle={{ fontSize: 16, color: '#52c41a' }}
                      />
                      <Statistic
                        title="库存变化"
                        value={`+${item.receivedQuantity || 0}`}
                        suffix={item.unit}
                        valueStyle={{ fontSize: 16, color: '#fa8c16' }}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="mt-4">
              <h4>入库明细</h4>
              <Table
                size="small"
                dataSource={selectedRecord.items}
                rowKey="id"
                pagination={false}
                columns={[
                  { title: '物品名称', dataIndex: 'itemName', key: 'itemName' },
                  { title: '规格型号', dataIndex: 'specification', key: 'specification' },
                  { title: '单位', dataIndex: 'unit', key: 'unit', width: 60 },
                  { title: '订购数量', dataIndex: 'orderedQuantity', key: 'orderedQuantity', width: 80 },
                  { title: '实收数量', dataIndex: 'receivedQuantity', key: 'receivedQuantity', width: 80 },
                  { title: '入库前库存', dataIndex: 'currentStock', key: 'currentStock', width: 90, render: (value) => `${value || 0}` },
                  { 
                    title: '入库后库存', 
                    key: 'afterStock', 
                    width: 90,
                    render: (_, record) => `${(record.currentStock || 0) + (record.receivedQuantity || 0)}`
                  },
                  { title: '单价', dataIndex: 'unitPrice', key: 'unitPrice', width: 100, render: (value) => `¥${value}` },
                  { title: '总价', dataIndex: 'totalPrice', key: 'totalPrice', width: 100, render: (value) => `¥${value}` },
                  { 
                    title: '质检状态', 
                    dataIndex: 'qualityStatus', 
                    key: 'qualityStatus', 
                    width: 80,
                    render: (status) => (
                      <Tag color={getQualityStatusColor(status)}>
                        {status === 'pass' ? '合格' : status === 'fail' ? '不合格' : '待检'}
                      </Tag>
                    )
                  },
                  { title: '备注', dataIndex: 'remarks', key: 'remarks' },
                ]}
              />
            </div>

            <div className="mt-4">
              <h4>质检信息</h4>
              <Descriptions bordered column={2}>
                <Descriptions.Item label="质检员">{selectedRecord.qualityCheck.checker || '未指定'}</Descriptions.Item>
                <Descriptions.Item label="质检日期">{selectedRecord.qualityCheck.checkDate || '未检查'}</Descriptions.Item>
                <Descriptions.Item label="质检结果">
                  {selectedRecord.qualityCheck.checkResult === 'pass' && <Tag color="success">合格</Tag>}
                  {selectedRecord.qualityCheck.checkResult === 'fail' && <Tag color="error">不合格</Tag>}
                  {selectedRecord.qualityCheck.checkResult === 'partial' && <Tag color="warning">部分合格</Tag>}
                  {selectedRecord.qualityCheck.checkResult === 'pending' && <Tag color="processing">待检查</Tag>}
                </Descriptions.Item>
                <Descriptions.Item label="质检备注" span={2}>
                  {selectedRecord.qualityCheck.checkRemarks || '无'}
                </Descriptions.Item>
              </Descriptions>
            </div>


          </div>
        )}
      </Modal>

      {/* 入库处理模态框 */}
      <Modal
        title="入库处理"
        open={isReceivingModalVisible}
        onOk={handleReceivingSubmit}
        onCancel={() => setIsReceivingModalVisible(false)}
        width={800}
        destroyOnClose
      >
        {selectedRecord && (
          <>
            {/* 订单信息 */}
            <Descriptions title="订单信息" bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="订单编号">{selectedRecord.purchaseOrderNo}</Descriptions.Item>
              <Descriptions.Item label="供应商">{selectedRecord.supplierName}</Descriptions.Item>
              <Descriptions.Item label="订单金额">¥{selectedRecord.totalAmount?.toLocaleString()}</Descriptions.Item>
            </Descriptions>

            {/* 物品库存信息 */}
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ marginBottom: 12 }}>物品库存信息</h4>
              {selectedRecord.items?.map((item, index) => (
                <Card key={item.id} size="small" style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ flex: 1 }}>
                      <Text strong>{item.itemName}</Text>
                      <br />
                      <Text type="secondary">{item.specification}</Text>
                    </div>
                    <div style={{ display: 'flex', gap: 16 }}>
                      <Statistic
                        title="当前库存"
                        value={item.currentStock || 0}
                        suffix={item.unit}
                        valueStyle={{ fontSize: 16 }}
                      />
                      <div>
                        <div style={{ marginBottom: 4, fontSize: 12, color: '#666' }}>入库数量</div>
                        <Input
                          style={{ width: 80 }}
                          placeholder="0"
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0;
                            // 这里可以添加状态管理逻辑
                          }}
                        />
                      </div>
                      <Statistic
                        title="入库后库存"
                        value={(item.currentStock || 0) + (item.receivedQuantity || 0)}
                        suffix={item.unit}
                        valueStyle={{ fontSize: 16, color: '#52c41a' }}
                      />
                      <Statistic
                        title="库存变化"
                        value={`+${item.receivedQuantity || 0}`}
                        suffix={item.unit}
                        valueStyle={{ fontSize: 16, color: '#1890ff' }}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* 入库信息表单 */}
            <Form form={receivingForm} layout="vertical">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="warehouse"
                    label="入库仓库"
                    rules={[{ required: true, message: '请选择入库仓库' }]}
                  >
                    <Select placeholder="请选择仓库">
                      <Option value="warehouse1">主仓库</Option>
                      <Option value="warehouse2">分仓库A</Option>
                      <Option value="warehouse3">分仓库B</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="operator"
                    label="入库人员"
                    rules={[{ required: true, message: '请输入入库人员姓名' }]}
                  >
                    <Input placeholder="请输入入库人员姓名" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="qualityStatus"
                    label="质检状态"
                    rules={[{ required: true, message: '请选择质检状态' }]}
                  >
                    <Select placeholder="请选择质检状态">
                      <Option value="passed">质检通过</Option>
                      <Option value="failed">质检不通过</Option>
                      <Option value="pending">待质检</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item
                name="remarks"
                label="备注"
              >
                <TextArea rows={3} placeholder="请输入备注信息" />
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </div>
  );
};

export default WarehouseReceiving;