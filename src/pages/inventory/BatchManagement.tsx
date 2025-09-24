import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Modal, Form, Input, Select, DatePicker, Space, Tag, message, Descriptions, Row, Col, Statistic, Progress, Tooltip } from 'antd';
import { EyeOutlined, SearchOutlined, DownloadOutlined, PrinterOutlined, BarChartOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

// 批次信息接口
interface BatchInfo {
  id: string;
  batchNo: string;
  itemCode: string;
  itemName: string;
  specification: string;
  unit: string;
  category: string;
  warehouse: string;
  location: string;
  supplier: string;
  productionDate: string;
  expiryDate: string;
  inboundDate: string;
  inboundQuantity: number;
  currentQuantity: number;
  unitPrice: number;
  totalValue: number;
  status: 'normal' | 'warning' | 'expired' | 'exhausted';
  statusText: string;
  daysToExpiry: number;
  remarks: string;
}

// 批次流水接口
interface BatchTransaction {
  id: string;
  date: string;
  type: 'in' | 'out' | 'transfer' | 'adjust';
  typeText: string;
  quantity: number;
  balance: number;
  reference: string;
  operator: string;
  remarks: string;
}

const BatchManagement: React.FC = () => {
  const [data, setData] = useState<BatchInfo[]>([]);
  const [filteredData, setFilteredData] = useState<BatchInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isTransactionModalVisible, setIsTransactionModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<BatchInfo | null>(null);
  const [transactions, setTransactions] = useState<BatchTransaction[]>([]);
  const [form] = Form.useForm();

  // 模拟数据
  const mockData: BatchInfo[] = [
    {
      id: '1',
      batchNo: 'B20240115001',
      itemCode: 'M001',
      itemName: '钢材',
      specification: 'Q235 20*30mm',
      unit: '根',
      category: '原材料',
      warehouse: '主仓库',
      location: 'A区-01',
      supplier: '钢铁有限公司',
      productionDate: '2024-01-10',
      expiryDate: '2025-01-10',
      inboundDate: '2024-01-15',
      inboundQuantity: 100,
      currentQuantity: 75,
      unitPrice: 50,
      totalValue: 3750,
      status: 'normal',
      statusText: '正常',
      daysToExpiry: 350,
      remarks: '批次状态正常'
    },
    {
      id: '2',
      batchNo: 'B20240120001',
      itemCode: 'C001',
      itemName: '化学试剂A',
      specification: '分析纯 500ml',
      unit: '瓶',
      category: '化学品',
      warehouse: '主仓库',
      location: 'C区-01',
      supplier: '化工材料公司',
      productionDate: '2024-01-18',
      expiryDate: '2024-07-18',
      inboundDate: '2024-01-20',
      inboundQuantity: 50,
      currentQuantity: 30,
      unitPrice: 120,
      totalValue: 3600,
      status: 'warning',
      statusText: '即将过期',
      daysToExpiry: 45,
      remarks: '注意保质期'
    },
    {
      id: '3',
      batchNo: 'B20231201001',
      itemCode: 'F001',
      itemName: '食品添加剂',
      specification: '食品级 1kg',
      unit: '袋',
      category: '食品原料',
      warehouse: '主仓库',
      location: 'D区-01',
      supplier: '食品添加剂公司',
      productionDate: '2023-11-25',
      expiryDate: '2024-01-25',
      inboundDate: '2023-12-01',
      inboundQuantity: 20,
      currentQuantity: 5,
      unitPrice: 80,
      totalValue: 400,
      status: 'expired',
      statusText: '已过期',
      daysToExpiry: -5,
      remarks: '已过期，需要处理'
    },
    {
      id: '4',
      batchNo: 'B20240110001',
      itemCode: 'E001',
      itemName: '电子元件',
      specification: '集成电路 IC-001',
      unit: '个',
      category: '电子器件',
      warehouse: '主仓库',
      location: 'B区-01',
      supplier: '电子科技公司',
      productionDate: '2024-01-08',
      expiryDate: '2026-01-08',
      inboundDate: '2024-01-10',
      inboundQuantity: 200,
      currentQuantity: 0,
      unitPrice: 25,
      totalValue: 0,
      status: 'exhausted',
      statusText: '已用完',
      daysToExpiry: 700,
      remarks: '库存已用完'
    }
  ];

  // 模拟批次流水数据
  const mockTransactions: BatchTransaction[] = [
    {
      id: '1',
      date: '2024-01-15',
      type: 'in',
      typeText: '入库',
      quantity: 100,
      balance: 100,
      reference: 'IN202401001',
      operator: '张三',
      remarks: '采购入库'
    },
    {
      id: '2',
      date: '2024-01-20',
      type: 'out',
      typeText: '出库',
      quantity: 15,
      balance: 85,
      reference: 'OUT202401001',
      operator: '李四',
      remarks: '生产领用'
    },
    {
      id: '3',
      date: '2024-01-25',
      type: 'out',
      typeText: '出库',
      quantity: 10,
      balance: 75,
      reference: 'OUT202401002',
      operator: '王五',
      remarks: '生产领用'
    }
  ];

  useEffect(() => {
    setData(mockData);
    setFilteredData(mockData);
  }, []);

  const handleView = (record: BatchInfo) => {
    setSelectedRecord(record);
    setIsDetailModalVisible(true);
  };

  const handleViewTransactions = (record: BatchInfo) => {
    setSelectedRecord(record);
    setTransactions(mockTransactions);
    setIsTransactionModalVisible(true);
  };

  const handleSearch = async () => {
    try {
      const values = await form.validateFields();
      let filtered = data;

      if (values.batchNo) {
        filtered = filtered.filter(item => 
          item.batchNo.includes(values.batchNo)
        );
      }

      if (values.itemName) {
        filtered = filtered.filter(item => 
          item.itemName.includes(values.itemName) || 
          item.itemCode.includes(values.itemName)
        );
      }

      if (values.category) {
        filtered = filtered.filter(item => item.category === values.category);
      }

      if (values.warehouse) {
        filtered = filtered.filter(item => item.warehouse === values.warehouse);
      }

      if (values.status) {
        filtered = filtered.filter(item => item.status === values.status);
      }

      if (values.expiryDateRange) {
        const [start, end] = values.expiryDateRange;
        filtered = filtered.filter(item => {
          const expiryDate = dayjs(item.expiryDate);
          return expiryDate.isAfter(start) && expiryDate.isBefore(end);
        });
      }

      setFilteredData(filtered);
    } catch (error) {
      console.error('搜索失败:', error);
    }
  };

  const handleReset = () => {
    form.resetFields();
    setFilteredData(data);
  };

  const handleExport = () => {
    message.success('导出功能开发中...');
  };

  const handlePrint = () => {
    message.success('打印功能开发中...');
  };

  const getStatusColor = (status: string) => {
    const colors = {
      normal: 'success',
      warning: 'warning',
      expired: 'error',
      exhausted: 'default',
    };
    return colors[status as keyof typeof colors] || 'default';
  };



  const getTransactionTypeColor = (type: string) => {
    const colors = {
      in: 'success',
      out: 'error',
      transfer: 'processing',
      adjust: 'warning',
    };
    return colors[type as keyof typeof colors] || 'default';
  };

  const getExpiryProgress = (daysToExpiry: number) => {
    if (daysToExpiry < 0) return { percent: 100, status: 'exception' as const };
    if (daysToExpiry <= 30) return { percent: 90, status: 'exception' as const };
    if (daysToExpiry <= 90) return { percent: 70, status: 'active' as const };
    return { percent: 30, status: 'normal' as const };
  };

  // 计算统计数据
  const totalBatches = filteredData.length;
  const normalBatches = filteredData.filter(item => item.status === 'normal').length;
  const warningBatches = filteredData.filter(item => item.status === 'warning').length;
  const expiredBatches = filteredData.filter(item => item.status === 'expired').length;
  const totalValue = filteredData.reduce((sum, item) => sum + item.totalValue, 0);

  const columns: ColumnsType<BatchInfo> = [
    {
      title: '序号',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: '批次号',
      dataIndex: 'batchNo',
      key: 'batchNo',
      width: 120,
      render: (text) => <strong>{text}</strong>,
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
      title: '规格型号',
      dataIndex: 'specification',
      key: 'specification',
      width: 200,
      ellipsis: true,
    },
    {
      title: '供应商',
      dataIndex: 'supplier',
      key: 'supplier',
      width: 120,
      ellipsis: true,
    },
    {
      title: '生产日期',
      dataIndex: 'productionDate',
      key: 'productionDate',
      width: 100,
    },
    {
      title: '有效期至',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 100,
      render: (text, record) => (
        <div>
          <div>{text}</div>
          <div style={{ fontSize: '12px', color: record.daysToExpiry < 0 ? '#ff4d4f' : record.daysToExpiry <= 30 ? '#faad14' : '#52c41a' }}>
            {record.daysToExpiry < 0 ? `已过期${Math.abs(record.daysToExpiry)}天` : `剩余${record.daysToExpiry}天`}
          </div>
        </div>
      ),
    },
    {
      title: '保质期进度',
      key: 'expiryProgress',
      width: 120,
      render: (_, record) => {
        const progress = getExpiryProgress(record.daysToExpiry);
        return (
          <Tooltip title={`${record.daysToExpiry < 0 ? '已过期' : '剩余'}${Math.abs(record.daysToExpiry)}天`}>
            <Progress 
              percent={progress.percent} 
              status={progress.status}
              size="small"
              showInfo={false}
            />
          </Tooltip>
        );
      },
    },
    {
      title: '入库数量',
      dataIndex: 'inboundQuantity',
      key: 'inboundQuantity',
      width: 80,
      align: 'right',
    },
    {
      title: '当前库存',
      dataIndex: 'currentQuantity',
      key: 'currentQuantity',
      width: 80,
      align: 'right',
      render: (value, record) => (
        <span style={{ 
          color: value === 0 ? '#999' : value < record.inboundQuantity * 0.2 ? '#ff4d4f' : '#000',
          fontWeight: 'bold'
        }}>
          {value}
        </span>
      ),
    },
    {
      title: '库存金额',
      dataIndex: 'totalValue',
      key: 'totalValue',
      width: 100,
      align: 'right',
      render: (value) => `¥${value.toLocaleString()}`,
    },
    {
      title: '批次状态',
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
      width: 150,
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
          <Button
            type="link"
            size="small"
            icon={<BarChartOutlined />}
            onClick={() => handleViewTransactions(record)}
          >
            流水
          </Button>
          {record.status === 'expired' && (
            <Button
              type="link"
              size="small"
              danger
              icon={<ExclamationCircleOutlined />}
              onClick={() => message.info('过期处理功能开发中...')}
            >
              处理
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const transactionColumns: ColumnsType<BatchTransaction> = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      width: 100,
    },
    {
      title: '业务类型',
      dataIndex: 'typeText',
      key: 'type',
      width: 80,
      render: (text, record) => (
        <Tag color={getTransactionTypeColor(record.type)}>{text}</Tag>
      ),
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
      align: 'right',
      render: (value, record) => (
        <span style={{ 
          color: record.type === 'in' ? '#52c41a' : '#ff4d4f' 
        }}>
          {record.type === 'in' ? '+' : '-'}{value}
        </span>
      ),
    },
    {
      title: '结存',
      dataIndex: 'balance',
      key: 'balance',
      width: 80,
      align: 'right',
      render: (value) => <strong>{value}</strong>,
    },
    {
      title: '单据号',
      dataIndex: 'reference',
      key: 'reference',
      width: 120,
    },
    {
      title: '操作员',
      dataIndex: 'operator',
      key: 'operator',
      width: 80,
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
      <Row gutter={16} className="mb-4">
        <Col span={6}>
          <Card>
            <Statistic
              title="批次总数"
              value={totalBatches}
              suffix="个"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="正常批次"
              value={normalBatches}
              suffix="个"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="预警批次"
              value={warningBatches}
              suffix="个"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="过期批次"
              value={expiredBatches}
              suffix="个"
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        {/* 搜索表单 */}
        <Form form={form} layout="inline" className="mb-4">
          <Form.Item name="batchNo" label="批次号">
            <Input placeholder="请输入批次号" style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="itemName" label="物料名称/编码">
            <Input placeholder="请输入物料名称或编码" style={{ width: 200 }} />
          </Form.Item>
          <Form.Item name="category" label="物料分类">
            <Select placeholder="请选择分类" style={{ width: 120 }}>
              <Option value="原材料">原材料</Option>
              <Option value="化学品">化学品</Option>
              <Option value="食品原料">食品原料</Option>
              <Option value="电子器件">电子器件</Option>
            </Select>
          </Form.Item>
          <Form.Item name="warehouse" label="仓库">
            <Select placeholder="请选择仓库" style={{ width: 120 }}>
              <Option value="主仓库">主仓库</Option>
              <Option value="分仓库">分仓库</Option>
              <Option value="临时仓库">临时仓库</Option>
            </Select>
          </Form.Item>
          <Form.Item name="status" label="批次状态">
            <Select placeholder="请选择状态" style={{ width: 120 }}>
              <Option value="normal">正常</Option>
              <Option value="warning">即将过期</Option>
              <Option value="expired">已过期</Option>
              <Option value="exhausted">已用完</Option>
            </Select>
          </Form.Item>
          <Form.Item name="expiryDateRange" label="有效期范围">
            <RangePicker style={{ width: 240 }} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                搜索
              </Button>
              <Button onClick={handleReset}>重置</Button>
              <Button icon={<DownloadOutlined />} onClick={handleExport}>
                导出
              </Button>
              <Button icon={<PrinterOutlined />} onClick={handlePrint}>
                打印
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

      {/* 详情模态框 */}
      <Modal
        title="批次详情"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedRecord && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="批次号">{selectedRecord.batchNo}</Descriptions.Item>
              <Descriptions.Item label="物料编码">{selectedRecord.itemCode}</Descriptions.Item>
              <Descriptions.Item label="物料名称">{selectedRecord.itemName}</Descriptions.Item>
              <Descriptions.Item label="规格型号">{selectedRecord.specification}</Descriptions.Item>
              <Descriptions.Item label="单位">{selectedRecord.unit}</Descriptions.Item>
              <Descriptions.Item label="分类">{selectedRecord.category}</Descriptions.Item>
              <Descriptions.Item label="仓库">{selectedRecord.warehouse}</Descriptions.Item>
              <Descriptions.Item label="库位">{selectedRecord.location}</Descriptions.Item>
              <Descriptions.Item label="供应商" span={2}>{selectedRecord.supplier}</Descriptions.Item>
              <Descriptions.Item label="生产日期">{selectedRecord.productionDate}</Descriptions.Item>
              <Descriptions.Item label="有效期至">{selectedRecord.expiryDate}</Descriptions.Item>
              <Descriptions.Item label="入库日期">{selectedRecord.inboundDate}</Descriptions.Item>
              <Descriptions.Item label="剩余天数">
                <span style={{ 
                  color: selectedRecord.daysToExpiry < 0 ? '#ff4d4f' : 
                         selectedRecord.daysToExpiry <= 30 ? '#faad14' : '#52c41a' 
                }}>
                  {selectedRecord.daysToExpiry < 0 ? `已过期${Math.abs(selectedRecord.daysToExpiry)}天` : `剩余${selectedRecord.daysToExpiry}天`}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="入库数量">{selectedRecord.inboundQuantity}</Descriptions.Item>
              <Descriptions.Item label="当前库存">{selectedRecord.currentQuantity}</Descriptions.Item>
              <Descriptions.Item label="单价">¥{selectedRecord.unitPrice}</Descriptions.Item>
              <Descriptions.Item label="库存金额">¥{selectedRecord.totalValue.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="批次状态">
                <Tag color={getStatusColor(selectedRecord.status)}>{selectedRecord.statusText}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="备注" span={2}>{selectedRecord.remarks}</Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>

      {/* 批次流水模态框 */}
      <Modal
        title={`批次流水 - ${selectedRecord?.batchNo}`}
        open={isTransactionModalVisible}
        onCancel={() => setIsTransactionModalVisible(false)}
        footer={null}
        width={1000}
      >
        <Table
          columns={transactionColumns}
          dataSource={transactions}
          rowKey="id"
          size="small"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Modal>
    </div>
  );
};

export default BatchManagement;