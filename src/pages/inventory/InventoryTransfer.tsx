import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Modal, Form, Input, Select, DatePicker, Space, Tag, message, Descriptions, Row, Col, InputNumber } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined, SearchOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

// 调拨单接口
interface TransferOrder {
  id: string;
  transferNo: string;
  fromWarehouse: string;
  toWarehouse: string;
  applicant: string;
  applyDate: string;
  transferDate: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'transferred' | 'received';
  statusText: string;
  totalItems: number;
  totalQuantity: number;
  approver?: string;
  approveDate?: string;
  transferer?: string;
  receiver?: string;
  receiveDate?: string;
  remarks: string;
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
      fromWarehouse: '主仓库',
      toWarehouse: '分仓库',
      applicant: '张三',
      applyDate: '2024-01-25',
      transferDate: '2024-01-26',
      status: 'transferred',
      statusText: '已调出',
      totalItems: 3,
      totalQuantity: 15,
      approver: '李经理',
      approveDate: '2024-01-25',
      transferer: '王五',
      receiver: '',
      receiveDate: '',
      remarks: '分仓库急需补充办公用品'
    },
    {
      id: '2',
      transferNo: 'TR202401002',
      fromWarehouse: '分仓库',
      toWarehouse: '主仓库',
      applicant: '李四',
      applyDate: '2024-01-26',
      transferDate: '',
      status: 'approved',
      statusText: '已审批',
      totalItems: 2,
      totalQuantity: 8,
      approver: '李经理',
      approveDate: '2024-01-26',
      transferer: '',
      receiver: '',
      receiveDate: '',
      remarks: '退回多余库存'
    },
    {
      id: '3',
      transferNo: 'TR202401003',
      fromWarehouse: '主仓库',
      toWarehouse: '临时仓库',
      applicant: '王五',
      applyDate: '2024-01-27',
      transferDate: '',
      status: 'pending',
      statusText: '待审批',
      totalItems: 1,
      totalQuantity: 5,
      approver: '',
      approveDate: '',
      transferer: '',
      receiver: '',
      receiveDate: '',
      remarks: '项目临时需要'
    },
    {
      id: '4',
      transferNo: 'TR202401004',
      fromWarehouse: '主仓库',
      toWarehouse: '分仓库',
      applicant: '赵六',
      applyDate: '2024-01-28',
      transferDate: '2024-01-29',
      status: 'received',
      statusText: '已接收',
      totalItems: 4,
      totalQuantity: 20,
      approver: '李经理',
      approveDate: '2024-01-28',
      transferer: '王五',
      receiver: '钱七',
      receiveDate: '2024-01-29',
      remarks: '月度库存调整'
    },
  ];

  // 模拟调拨明细数据
  const mockTransferItems: TransferItem[] = [
    {
      id: '1',
      itemCode: 'IT001',
      itemName: '台式电脑',
      specification: 'Intel i5, 8GB内存, 256GB SSD',
      unit: '台',
      requestQuantity: 5,
      transferQuantity: 5,
      receiveQuantity: 5,
      unitPrice: 3800,
      totalAmount: 19000,
      remarks: ''
    },
    {
      id: '2',
      itemCode: 'OF001',
      itemName: '办公桌',
      specification: '1.2m*0.6m 钢木结构',
      unit: '张',
      requestQuantity: 8,
      transferQuantity: 8,
      receiveQuantity: 8,
      unitPrice: 800,
      totalAmount: 6400,
      remarks: ''
    },
    {
      id: '3',
      itemCode: 'ST001',
      itemName: '文件柜',
      specification: '四抽屉钢制文件柜',
      unit: '个',
      requestQuantity: 2,
      transferQuantity: 2,
      receiveQuantity: 2,
      unitPrice: 600,
      totalAmount: 1200,
      remarks: ''
    },
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
    });
    setIsModalVisible(true);
  };

  const handleView = (record: TransferOrder) => {
    setSelectedRecord(record);
    setTransferItems(mockTransferItems);
    setIsDetailModalVisible(true);
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

  const handleApprove = (record: TransferOrder) => {
    Modal.confirm({
      title: '确认审批',
      content: `确定要审批通过调拨单 ${record.transferNo} 吗？`,
      onOk: () => {
        const newData = data.map(item => 
          item.id === record.id 
            ? { 
                ...item, 
                status: 'approved' as const, 
                statusText: '已审批',
                approver: '当前用户',
                approveDate: dayjs().format('YYYY-MM-DD')
              }
            : item
        );
        setData(newData);
        setFilteredData(newData);
        message.success('审批成功');
      },
    });
  };

  const handleReject = (record: TransferOrder) => {
    Modal.confirm({
      title: '确认拒绝',
      content: `确定要拒绝调拨单 ${record.transferNo} 吗？`,
      onOk: () => {
        const newData = data.map(item => 
          item.id === record.id 
            ? { 
                ...item, 
                status: 'rejected' as const, 
                statusText: '已拒绝',
                approver: '当前用户',
                approveDate: dayjs().format('YYYY-MM-DD')
              }
            : item
        );
        setData(newData);
        setFilteredData(newData);
        message.success('已拒绝');
      },
    });
  };

  const handleTransfer = (record: TransferOrder) => {
    Modal.confirm({
      title: '确认调出',
      content: `确定要执行调拨单 ${record.transferNo} 的调出操作吗？`,
      onOk: () => {
        const newData = data.map(item => 
          item.id === record.id 
            ? { 
                ...item, 
                status: 'transferred' as const, 
                statusText: '已调出',
                transferer: '当前用户',
                transferDate: dayjs().format('YYYY-MM-DD')
              }
            : item
        );
        setData(newData);
        setFilteredData(newData);
        message.success('调出成功');
      },
    });
  };

  const handleReceive = (record: TransferOrder) => {
    Modal.confirm({
      title: '确认接收',
      content: `确定要接收调拨单 ${record.transferNo} 的物料吗？`,
      onOk: () => {
        const newData = data.map(item => 
          item.id === record.id 
            ? { 
                ...item, 
                status: 'received' as const, 
                statusText: '已接收',
                receiver: '当前用户',
                receiveDate: dayjs().format('YYYY-MM-DD')
              }
            : item
        );
        setData(newData);
        setFilteredData(newData);
        message.success('接收成功');
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const newRecord: TransferOrder = {
        id: editingRecord?.id || Date.now().toString(),
        transferNo: editingRecord?.transferNo || `TR${dayjs().format('YYYYMMDD')}${String(data.length + 1).padStart(3, '0')}`,
        fromWarehouse: values.fromWarehouse,
        toWarehouse: values.toWarehouse,
        applicant: values.applicant,
        applyDate: values.applyDate.format('YYYY-MM-DD'),
        transferDate: values.transferDate ? values.transferDate.format('YYYY-MM-DD') : '',
        status: editingRecord?.status || 'draft',
        statusText: editingRecord?.statusText || '草稿',
        totalItems: values.totalItems || 0,
        totalQuantity: values.totalQuantity || 0,
        approver: editingRecord?.approver || '',
        approveDate: editingRecord?.approveDate || '',
        transferer: editingRecord?.transferer || '',
        receiver: editingRecord?.receiver || '',
        receiveDate: editingRecord?.receiveDate || '',
        remarks: values.remarks || '',
      };

      let newData;
      if (editingRecord) {
        newData = data.map(item => item.id === editingRecord.id ? newRecord : item);
        message.success('修改成功');
      } else {
        newData = [...data, newRecord];
        message.success('新增成功');
      }

      setData(newData);
      setFilteredData(newData);
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

      if (values.transferNo) {
        filtered = filtered.filter(item => item.transferNo.includes(values.transferNo));
      }

      if (values.fromWarehouse) {
        filtered = filtered.filter(item => item.fromWarehouse === values.fromWarehouse);
      }

      if (values.toWarehouse) {
        filtered = filtered.filter(item => item.toWarehouse === values.toWarehouse);
      }

      if (values.status) {
        filtered = filtered.filter(item => item.status === values.status);
      }

      if (values.dateRange && values.dateRange.length === 2) {
        const [startDate, endDate] = values.dateRange;
        filtered = filtered.filter(item => {
          const applyDate = dayjs(item.applyDate);
          return applyDate.isAfter(startDate.subtract(1, 'day')) && applyDate.isBefore(endDate.add(1, 'day'));
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
    };
    return colors[status as keyof typeof colors] || 'default';
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
      dataIndex: 'fromWarehouse',
      key: 'fromWarehouse',
      width: 100,
    },
    {
      title: '调入仓库',
      dataIndex: 'toWarehouse',
      key: 'toWarehouse',
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
      title: '调拨日期',
      dataIndex: 'transferDate',
      key: 'transferDate',
      width: 100,
      render: (value) => value || '-',
    },
    {
      title: '物料种类',
      dataIndex: 'totalItems',
      key: 'totalItems',
      width: 80,
      align: 'right',
      render: (value) => `${value}种`,
    },
    {
      title: '总数量',
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
      width: 80,
      align: 'right',
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
      title: '备注',
      dataIndex: 'remarks',
      key: 'remarks',
      width: 150,
      ellipsis: true,
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
                style={{ color: '#52c41a' }}
              >
                审批
              </Button>
              <Button
                type="link"
                size="small"
                icon={<CloseOutlined />}
                onClick={() => handleReject(record)}
                style={{ color: '#ff4d4f' }}
              >
                拒绝
              </Button>
            </>
          )}
          {record.status === 'approved' && (
            <Button
              type="link"
              size="small"
              onClick={() => handleTransfer(record)}
              style={{ color: '#fa8c16' }}
            >
              调出
            </Button>
          )}
          {record.status === 'transferred' && (
            <Button
              type="link"
              size="small"
              onClick={() => handleReceive(record)}
              style={{ color: '#1890ff' }}
            >
              接收
            </Button>
          )}
          {(record.status === 'draft' || record.status === 'rejected') && (
            <Button
              type="link"
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
              danger
            >
              删除
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const itemColumns: ColumnsType<TransferItem> = [
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
      width: 200,
      ellipsis: true,
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      width: 60,
    },
    {
      title: '申请数量',
      dataIndex: 'requestQuantity',
      key: 'requestQuantity',
      width: 80,
      align: 'right',
    },
    {
      title: '调出数量',
      dataIndex: 'transferQuantity',
      key: 'transferQuantity',
      width: 80,
      align: 'right',
    },
    {
      title: '接收数量',
      dataIndex: 'receiveQuantity',
      key: 'receiveQuantity',
      width: 80,
      align: 'right',
    },
    {
      title: '单价',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 80,
      align: 'right',
      render: (value) => `¥${value}`,
    },
    {
      title: '金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 100,
      align: 'right',
      render: (value) => `¥${value.toLocaleString()}`,
    },
    {
      title: '备注',
      dataIndex: 'remarks',
      key: 'remarks',
      ellipsis: true,
    },
  ];

  return (
    <div className="p-6">
      <Card>
        {/* 搜索表单 */}
        <Form form={searchForm} layout="inline" className="mb-4">
          <Form.Item name="transferNo" label="调拨单号">
            <Input placeholder="请输入调拨单号" style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="fromWarehouse" label="调出仓库">
            <Select placeholder="请选择调出仓库" style={{ width: 120 }}>
              <Option value="主仓库">主仓库</Option>
              <Option value="分仓库">分仓库</Option>
              <Option value="临时仓库">临时仓库</Option>
            </Select>
          </Form.Item>
          <Form.Item name="toWarehouse" label="调入仓库">
            <Select placeholder="请选择调入仓库" style={{ width: 120 }}>
              <Option value="主仓库">主仓库</Option>
              <Option value="分仓库">分仓库</Option>
              <Option value="临时仓库">临时仓库</Option>
            </Select>
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择状态" style={{ width: 100 }}>
              <Option value="draft">草稿</Option>
              <Option value="pending">待审批</Option>
              <Option value="approved">已审批</Option>
              <Option value="rejected">已拒绝</Option>
              <Option value="transferred">已调出</Option>
              <Option value="received">已接收</Option>
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
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                新增调拨
              </Button>
            </Space>
          </Form.Item>
        </Form>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1400 }}
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
              <Form.Item
                name="fromWarehouse"
                label="调出仓库"
                rules={[{ required: true, message: '请选择调出仓库' }]}
              >
                <Select placeholder="请选择调出仓库">
                  <Option value="主仓库">主仓库</Option>
                  <Option value="分仓库">分仓库</Option>
                  <Option value="临时仓库">临时仓库</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="toWarehouse"
                label="调入仓库"
                rules={[{ required: true, message: '请选择调入仓库' }]}
              >
                <Select placeholder="请选择调入仓库">
                  <Option value="主仓库">主仓库</Option>
                  <Option value="分仓库">分仓库</Option>
                  <Option value="临时仓库">临时仓库</Option>
                </Select>
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
                name="applyDate"
                label="申请日期"
                rules={[{ required: true, message: '请选择申请日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="totalItems" label="物料种类">
                <InputNumber min={0} placeholder="物料种类数" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="totalQuantity" label="总数量">
                <InputNumber min={0} placeholder="总数量" style={{ width: '100%' }} />
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
        width={1200}
      >
        {selectedRecord && (
          <div>
            <Descriptions bordered column={3} className="mb-4">
              <Descriptions.Item label="调拨单号">{selectedRecord.transferNo}</Descriptions.Item>
              <Descriptions.Item label="调出仓库">{selectedRecord.fromWarehouse}</Descriptions.Item>
              <Descriptions.Item label="调入仓库">{selectedRecord.toWarehouse}</Descriptions.Item>
              <Descriptions.Item label="申请人">{selectedRecord.applicant}</Descriptions.Item>
              <Descriptions.Item label="申请日期">{selectedRecord.applyDate}</Descriptions.Item>
              <Descriptions.Item label="调拨日期">{selectedRecord.transferDate || '未调拨'}</Descriptions.Item>
              <Descriptions.Item label="物料种类">{selectedRecord.totalItems}种</Descriptions.Item>
              <Descriptions.Item label="总数量">{selectedRecord.totalQuantity}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={getStatusColor(selectedRecord.status)}>{selectedRecord.statusText}</Tag>
              </Descriptions.Item>
              {selectedRecord.approver && (
                <>
                  <Descriptions.Item label="审批人">{selectedRecord.approver}</Descriptions.Item>
                  <Descriptions.Item label="审批日期">{selectedRecord.approveDate}</Descriptions.Item>
                </>
              )}
              {selectedRecord.transferer && (
                <>
                  <Descriptions.Item label="调出人">{selectedRecord.transferer}</Descriptions.Item>
                </>
              )}
              {selectedRecord.receiver && (
                <>
                  <Descriptions.Item label="接收人">{selectedRecord.receiver}</Descriptions.Item>
                  <Descriptions.Item label="接收日期">{selectedRecord.receiveDate}</Descriptions.Item>
                </>
              )}
              <Descriptions.Item label="备注" span={3}>{selectedRecord.remarks}</Descriptions.Item>
            </Descriptions>

            <h4>调拨明细</h4>
            <Table
              columns={itemColumns}
              dataSource={transferItems}
              rowKey="id"
              size="small"
              pagination={false}
              scroll={{ x: 1000 }}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default InventoryTransfer;