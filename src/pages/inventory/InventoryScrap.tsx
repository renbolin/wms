import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Modal, Form, Input, Select, DatePicker, Space, Tag, message, Descriptions, Row, Col, InputNumber, Upload } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined, SearchOutlined, CheckOutlined, CloseOutlined, UploadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

// 报损报废单接口
interface ScrapOrder {
  id: string;
  scrapNo: string;
  type: 'damage' | 'scrap';
  typeText: string;
  warehouse: string;
  applicant: string;
  applyDate: string;
  processDate: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'processed';
  statusText: string;
  totalItems: number;
  totalQuantity: number;
  totalValue: number;
  approver?: string;
  approveDate?: string;
  processor?: string;
  reason: string;
  remarks: string;
}

// 报损报废明细接口
interface ScrapItem {
  id: string;
  itemCode: string;
  itemName: string;
  specification: string;
  brand?: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  reason: string;
  remarks: string;
}

const InventoryScrap: React.FC = () => {
  const [data, setData] = useState<ScrapOrder[]>([]);
  const [filteredData, setFilteredData] = useState<ScrapOrder[]>([]);
  const [loading, _setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ScrapOrder | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<ScrapOrder | null>(null);
  const [scrapItems, setScrapItems] = useState<ScrapItem[]>([]);
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();

  // 模拟数据
  const mockData: ScrapOrder[] = [
    {
      id: '1',
      scrapNo: 'SC202401001',
      type: 'damage',
      typeText: '报损',
      warehouse: '主仓库',
      applicant: '张三',
      applyDate: '2024-01-25',
      processDate: '2024-01-26',
      status: 'processed',
      statusText: '已处理',
      totalItems: 2,
      totalQuantity: 3,
      totalValue: 1800,
      approver: '李经理',
      approveDate: '2024-01-25',
      processor: '王五',
      reason: '运输过程中损坏',
      remarks: '包装不当导致设备损坏'
    },
    {
      id: '2',
      scrapNo: 'SC202401002',
      type: 'scrap',
      typeText: '报废',
      warehouse: '主仓库',
      applicant: '李四',
      applyDate: '2024-01-26',
      processDate: '',
      status: 'approved',
      statusText: '已审批',
      totalItems: 1,
      totalQuantity: 1,
      totalValue: 2500,
      approver: '李经理',
      approveDate: '2024-01-26',
      processor: '',
      reason: '设备老化无法使用',
      remarks: '超过使用年限，无维修价值'
    },
    {
      id: '3',
      scrapNo: 'SC202401003',
      type: 'damage',
      typeText: '报损',
      warehouse: '分仓库',
      applicant: '王五',
      applyDate: '2024-01-27',
      processDate: '',
      status: 'pending',
      statusText: '待审批',
      totalItems: 3,
      totalQuantity: 5,
      totalValue: 3200,
      approver: '',
      approveDate: '',
      processor: '',
      reason: '仓库漏水导致物料受潮',
      remarks: '需要紧急处理，避免影响其他物料'
    },
    {
      id: '4',
      scrapNo: 'SC202401004',
      type: 'scrap',
      typeText: '报废',
      warehouse: '主仓库',
      applicant: '赵六',
      applyDate: '2024-01-28',
      processDate: '',
      status: 'rejected',
      statusText: '已拒绝',
      totalItems: 1,
      totalQuantity: 2,
      totalValue: 1600,
      approver: '李经理',
      approveDate: '2024-01-28',
      processor: '',
      reason: '设备故障',
      remarks: '建议先尝试维修'
    },
  ];

  // 模拟报损报废明细数据
  const mockScrapItems: ScrapItem[] = [
    {
      id: '1',
      itemCode: 'OF001',
      itemName: '办公桌',
      specification: '1.2m*0.6m 钢木结构',
      brand: '宜家IKEA',
      unit: '张',
      quantity: 2,
      unitPrice: 800,
      totalAmount: 1600,
      reason: '运输损坏',
      remarks: '桌面划伤严重'
    },
    {
      id: '2',
      itemCode: 'OF002',
      itemName: '办公椅',
      specification: '人体工学设计，可调节高度',
      brand: '西昊SIHOO',
      unit: '把',
      quantity: 1,
      unitPrice: 450,
      totalAmount: 450,
      reason: '运输损坏',
      remarks: '椅背断裂'
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

  const handleEdit = (record: ScrapOrder) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      applyDate: dayjs(record.applyDate),
      processDate: record.processDate ? dayjs(record.processDate) : null,
    });
    setIsModalVisible(true);
  };

  const handleView = (record: ScrapOrder) => {
    setSelectedRecord(record);
    setScrapItems(mockScrapItems);
    setIsDetailModalVisible(true);
  };

  const handleDelete = (record: ScrapOrder) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除${record.typeText}单 ${record.scrapNo} 吗？`,
      onOk: () => {
        const newData = data.filter(item => item.id !== record.id);
        setData(newData);
        setFilteredData(newData);
        message.success('删除成功');
      },
    });
  };

  const handleApprove = (record: ScrapOrder) => {
    Modal.confirm({
      title: '确认审批',
      content: `确定要审批通过${record.typeText}单 ${record.scrapNo} 吗？`,
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

  const handleReject = (record: ScrapOrder) => {
    Modal.confirm({
      title: '确认拒绝',
      content: `确定要拒绝${record.typeText}单 ${record.scrapNo} 吗？`,
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

  const handleProcess = (record: ScrapOrder) => {
    Modal.confirm({
      title: '确认处理',
      content: `确定要处理${record.typeText}单 ${record.scrapNo} 吗？处理后将从库存中扣除相应物料。`,
      onOk: () => {
        const newData = data.map(item => 
          item.id === record.id 
            ? { 
                ...item, 
                status: 'processed' as const, 
                statusText: '已处理',
                processor: '当前用户',
                processDate: dayjs().format('YYYY-MM-DD')
              }
            : item
        );
        setData(newData);
        setFilteredData(newData);
        message.success('处理成功');
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const newRecord: ScrapOrder = {
        id: editingRecord?.id || Date.now().toString(),
        scrapNo: editingRecord?.scrapNo || `SC${dayjs().format('YYYYMMDD')}${String(data.length + 1).padStart(3, '0')}`,
        type: values.type,
        typeText: values.type === 'damage' ? '报损' : '报废',
        warehouse: values.warehouse,
        applicant: values.applicant,
        applyDate: values.applyDate.format('YYYY-MM-DD'),
        processDate: values.processDate ? values.processDate.format('YYYY-MM-DD') : '',
        status: editingRecord?.status || 'draft',
        statusText: editingRecord?.statusText || '草稿',
        totalItems: values.totalItems || 0,
        totalQuantity: values.totalQuantity || 0,
        totalValue: values.totalValue || 0,
        approver: editingRecord?.approver || '',
        approveDate: editingRecord?.approveDate || '',
        processor: editingRecord?.processor || '',
        reason: values.reason,
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

      if (values.scrapNo) {
        filtered = filtered.filter(item => item.scrapNo.includes(values.scrapNo));
      }

      if (values.type) {
        filtered = filtered.filter(item => item.type === values.type);
      }

      if (values.warehouse) {
        filtered = filtered.filter(item => item.warehouse === values.warehouse);
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
      processed: 'success',
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getTypeColor = (type: string) => {
    const colors = {
      damage: 'warning',
      scrap: 'error',
    };
    return colors[type as keyof typeof colors] || 'default';
  };

  const columns: ColumnsType<ScrapOrder> = [
    {
      title: '序号',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: '单据号',
      dataIndex: 'scrapNo',
      key: 'scrapNo',
      width: 120,
    },
    {
      title: '类型',
      dataIndex: 'typeText',
      key: 'type',
      width: 80,
      render: (text, record) => (
        <Tag color={getTypeColor(record.type)}>{text}</Tag>
      ),
    },
    {
      title: '仓库',
      dataIndex: 'warehouse',
      key: 'warehouse',
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
      title: '处理日期',
      dataIndex: 'processDate',
      key: 'processDate',
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
      title: '总金额',
      dataIndex: 'totalValue',
      key: 'totalValue',
      width: 100,
      align: 'right',
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
      title: '原因',
      dataIndex: 'reason',
      key: 'reason',
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
              onClick={() => handleProcess(record)}
              style={{ color: '#1890ff' }}
            >
              处理
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

  const itemColumns: ColumnsType<ScrapItem> = [
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
      title: '品牌',
      dataIndex: 'brand',
      key: 'brand',
      width: 120,
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      width: 60,
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
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
      title: '原因',
      dataIndex: 'reason',
      key: 'reason',
      width: 120,
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
      {/* 统计卡片 */}
      <Row gutter={16} className="mb-6">
        <Col span={4}>
          <Card className="text-center">
            <div className="text-2xl font-bold text-blue-600">{data.length}</div>
            <div className="text-gray-500">总单据</div>
          </Card>
        </Col>
        <Col span={4}>
          <Card className="text-center">
            <div className="text-2xl font-bold text-orange-500">
              {data.filter(item => item.status === 'pending').length}
            </div>
            <div className="text-gray-500">待审批</div>
          </Card>
        </Col>
        <Col span={4}>
          <Card className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {data.filter(item => item.status === 'approved').length}
            </div>
            <div className="text-gray-500">已审批</div>
          </Card>
        </Col>
        <Col span={4}>
          <Card className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {data.filter(item => item.status === 'processed').length}
            </div>
            <div className="text-gray-500">已处理</div>
          </Card>
        </Col>
        <Col span={4}>
          <Card className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {data.filter(item => item.type === 'damage').length}
            </div>
            <div className="text-gray-500">报损单</div>
          </Card>
        </Col>
        <Col span={4}>
          <Card className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {data.filter(item => item.type === 'scrap').length}
            </div>
            <div className="text-gray-500">报废单</div>
          </Card>
        </Col>
      </Row>

      <Card>
        {/* 搜索表单 */}
        <Form form={searchForm} layout="inline" className="mb-4">
          <Form.Item name="scrapNo" label="单据号">
            <Input placeholder="请输入单据号" style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="type" label="类型">
            <Select placeholder="请选择类型" style={{ width: 100 }}>
              <Option value="damage">报损</Option>
              <Option value="scrap">报废</Option>
            </Select>
          </Form.Item>
          <Form.Item name="warehouse" label="仓库">
            <Select placeholder="请选择仓库" style={{ width: 120 }}>
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
              <Option value="processed">已处理</Option>
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
                新增报损报废
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
        title={editingRecord ? '编辑报损报废单' : '新增报损报废单'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="类型"
                rules={[{ required: true, message: '请选择类型' }]}
              >
                <Select placeholder="请选择类型">
                  <Option value="damage">报损</Option>
                  <Option value="scrap">报废</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="warehouse"
                label="仓库"
                rules={[{ required: true, message: '请选择仓库' }]}
              >
                <Select placeholder="请选择仓库">
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
            <Col span={8}>
              <Form.Item name="totalItems" label="物料种类">
                <InputNumber min={0} placeholder="物料种类数" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="totalQuantity" label="总数量">
                <InputNumber min={0} placeholder="总数量" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="totalValue" label="总金额">
                <InputNumber min={0} placeholder="总金额" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="reason"
            label="原因"
            rules={[{ required: true, message: '请输入原因' }]}
          >
            <TextArea rows={2} placeholder="请输入报损报废原因" />
          </Form.Item>
          <Form.Item name="remarks" label="备注">
            <TextArea rows={2} placeholder="请输入备注信息" />
          </Form.Item>
          <Form.Item name="attachments" label="附件">
            <Upload>
              <Button icon={<UploadOutlined />}>上传附件</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      {/* 详情模态框 */}
      <Modal
        title="报损报废单详情"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={null}
        width={1200}
      >
        {selectedRecord && (
          <div>
            <Descriptions bordered column={3} className="mb-4">
              <Descriptions.Item label="单据号">{selectedRecord.scrapNo}</Descriptions.Item>
              <Descriptions.Item label="类型">
                <Tag color={getTypeColor(selectedRecord.type)}>{selectedRecord.typeText}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="仓库">{selectedRecord.warehouse}</Descriptions.Item>
              <Descriptions.Item label="申请人">{selectedRecord.applicant}</Descriptions.Item>
              <Descriptions.Item label="申请日期">{selectedRecord.applyDate}</Descriptions.Item>
              <Descriptions.Item label="处理日期">{selectedRecord.processDate || '未处理'}</Descriptions.Item>
              <Descriptions.Item label="物料种类">{selectedRecord.totalItems}种</Descriptions.Item>
              <Descriptions.Item label="总数量">{selectedRecord.totalQuantity}</Descriptions.Item>
              <Descriptions.Item label="总金额">¥{selectedRecord.totalValue.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={getStatusColor(selectedRecord.status)}>{selectedRecord.statusText}</Tag>
              </Descriptions.Item>
              {selectedRecord.approver && (
                <>
                  <Descriptions.Item label="审批人">{selectedRecord.approver}</Descriptions.Item>
                  <Descriptions.Item label="审批日期">{selectedRecord.approveDate}</Descriptions.Item>
                </>
              )}
              {selectedRecord.processor && (
                <Descriptions.Item label="处理人">{selectedRecord.processor}</Descriptions.Item>
              )}
              <Descriptions.Item label="原因" span={3}>{selectedRecord.reason}</Descriptions.Item>
              <Descriptions.Item label="备注" span={3}>{selectedRecord.remarks}</Descriptions.Item>
            </Descriptions>

            <h4>报损报废明细</h4>
            <Table
              columns={itemColumns}
              dataSource={scrapItems}
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

export default InventoryScrap;