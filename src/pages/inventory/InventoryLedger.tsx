import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Modal, Form, Input, Select, Space, Tag, message, Descriptions, Row, Col, Statistic } from 'antd';
import { EyeOutlined, SearchOutlined, DownloadOutlined, PrinterOutlined, BarChartOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Option } = Select;

// 库存台账接口
interface InventoryLedger {
  id: string;
  itemCode: string;
  itemName: string;
  specification: string;
  unit: string;
  category: string;
  warehouse: string;
  location: string;
  openingStock: number;
  inQuantity: number;
  outQuantity: number;
  currentStock: number;
  unitPrice: number;
  totalValue: number;
  safetyStock: number;
  maxStock: number;
  lastInDate: string;
  lastOutDate: string;
  status: 'normal' | 'low' | 'out' | 'excess';
  statusText: string;
  // 新增字段
  batchCount: number; // 批次数量
  ageInDays: number; // 库龄天数
  turnoverRate: number; // 周转率
  supplier: string; // 主要供应商
  abc: 'A' | 'B' | 'C'; // ABC分类
  frozen: boolean; // 是否冻结
}

// 库存流水接口
interface InventoryTransaction {
  id: string;
  date: string;
  type: 'in' | 'out' | 'transfer' | 'adjust';
  typeText: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  balance: number;
  reference: string;
  operator: string;
  remarks: string;
}

const InventoryLedger: React.FC = () => {
  const [data, setData] = useState<InventoryLedger[]>([]);
  const [filteredData, setFilteredData] = useState<InventoryLedger[]>([]);
  const [loading, _setLoading] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isTransactionModalVisible, setIsTransactionModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<InventoryLedger | null>(null);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [form] = Form.useForm();

  // 模拟数据
  const mockData: InventoryLedger[] = [
    {
      id: '1',
      itemCode: 'IT001',
      itemName: '台式电脑',
      specification: 'Intel i5, 8GB内存, 256GB SSD',
      unit: '台',
      category: '办公设备',
      warehouse: '主仓库',
      location: 'A区-01',
      openingStock: 0,
      inQuantity: 10,
      outQuantity: 3,
      currentStock: 7,
      unitPrice: 3800,
      totalValue: 26600,
      safetyStock: 5,
      maxStock: 20,
      lastInDate: '2024-01-25',
      lastOutDate: '2024-01-28',
      status: 'normal',
      statusText: '正常',
      batchCount: 2,
      ageInDays: 15,
      turnoverRate: 2.5,
      supplier: '科技设备公司',
      abc: 'A',
      frozen: false
    },
    {
      id: '2',
      itemCode: 'IT002',
      itemName: '激光打印机',
      specification: 'A4黑白激光打印机',
      unit: '台',
      category: '办公设备',
      warehouse: '主仓库',
      location: 'A区-02',
      openingStock: 0,
      inQuantity: 2,
      outQuantity: 0,
      currentStock: 2,
      unitPrice: 2500,
      totalValue: 5000,
      safetyStock: 1,
      maxStock: 5,
      lastInDate: '2024-01-25',
      lastOutDate: '',
      status: 'normal',
      statusText: '正常',
      batchCount: 1,
      ageInDays: 5,
      turnoverRate: 1.8,
      supplier: '办公设备公司',
      abc: 'B',
      frozen: false
    },
    {
      id: '3',
      itemCode: 'OF001',
      itemName: '办公桌',
      specification: '1.2m*0.6m 钢木结构',
      unit: '张',
      category: '办公家具',
      warehouse: '主仓库',
      location: 'B区-01',
      openingStock: 5,
      inQuantity: 10,
      outQuantity: 12,
      currentStock: 3,
      unitPrice: 800,
      totalValue: 2400,
      safetyStock: 5,
      maxStock: 20,
      lastInDate: '2024-01-20',
      lastOutDate: '2024-01-30',
      status: 'low',
      statusText: '库存不足',
      batchCount: 1,
      ageInDays: 45,
      turnoverRate: 3.2,
      supplier: '家具制造公司',
      abc: 'A',
      frozen: false
    },
    {
      id: '4',
      itemCode: 'OF002',
      itemName: '办公椅',
      specification: '人体工学设计，可调节高度',
      unit: '把',
      category: '办公家具',
      warehouse: '主仓库',
      location: 'B区-02',
      openingStock: 0,
      inQuantity: 0,
      outQuantity: 0,
      currentStock: 0,
      unitPrice: 450,
      totalValue: 0,
      safetyStock: 3,
      maxStock: 15,
      lastInDate: '',
      lastOutDate: '',
      status: 'out',
      statusText: '缺货',
      batchCount: 0,
      ageInDays: 0,
      turnoverRate: 0,
      supplier: '家具制造公司',
      abc: 'B',
      frozen: false
    },
    {
      id: '5',
      itemCode: 'ST001',
      itemName: '文件柜',
      specification: '四抽屉钢制文件柜',
      unit: '个',
      category: '办公家具',
      warehouse: '主仓库',
      location: 'B区-03',
      openingStock: 2,
      inQuantity: 20,
      outQuantity: 1,
      currentStock: 21,
      unitPrice: 600,
      totalValue: 12600,
      safetyStock: 2,
      maxStock: 10,
      lastInDate: '2024-01-22',
      lastOutDate: '2024-01-29',
      status: 'excess',
      statusText: '库存过量',
      batchCount: 3,
      ageInDays: 8,
      turnoverRate: 0.5,
      supplier: '钢制家具公司',
      abc: 'C',
      frozen: true
    },
  ];

  // 模拟库存流水数据
  const mockTransactions: InventoryTransaction[] = [
    {
      id: '1',
      date: '2024-01-25',
      type: 'in',
      typeText: '入库',
      quantity: 10,
      unitPrice: 3800,
      totalAmount: 38000,
      balance: 10,
      reference: 'WR202401001',
      operator: '张三',
      remarks: '采购入库'
    },
    {
      id: '2',
      date: '2024-01-26',
      type: 'out',
      typeText: '出库',
      quantity: 2,
      unitPrice: 3800,
      totalAmount: 7600,
      balance: 8,
      reference: 'WO202401001',
      operator: '李四',
      remarks: '部门领用'
    },
    {
      id: '3',
      date: '2024-01-28',
      type: 'out',
      typeText: '出库',
      quantity: 1,
      unitPrice: 3800,
      totalAmount: 3800,
      balance: 7,
      reference: 'WO202401002',
      operator: '王五',
      remarks: '部门领用'
    },
  ];

  useEffect(() => {
    setData(mockData);
    setFilteredData(mockData);
  }, []);

  const handleView = (record: InventoryLedger) => {
    setSelectedRecord(record);
    setIsDetailModalVisible(true);
  };

  const handleViewTransactions = (record: InventoryLedger) => {
    setSelectedRecord(record);
    setTransactions(mockTransactions);
    setIsTransactionModalVisible(true);
  };

  const handleSearch = async () => {
    try {
      const values = await form.validateFields();
      let filtered = data;

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
      low: 'warning',
      out: 'error',
      excess: 'processing',
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

  // 计算统计数据
  const totalValue = filteredData.reduce((sum, item) => sum + (item.totalValue || 0), 0);
  const totalItems = filteredData.length;
  const lowStockItems = filteredData.filter(item => item.status === 'low' || item.status === 'out').length;
  const excessStockItems = filteredData.filter(item => item.status === 'excess').length;
  const totalBatches = filteredData.reduce((sum, item) => sum + (item.batchCount || 0), 0);
  const avgAge = filteredData.length > 0 ? Math.round(filteredData.reduce((sum, item) => sum + (item.ageInDays || 0), 0) / filteredData.length) : 0;
  const avgTurnover = filteredData.length > 0 ? (filteredData.reduce((sum, item) => sum + (item.turnoverRate || 0), 0) / filteredData.length).toFixed(1) : '0.0';
  const frozenItems = filteredData.filter(item => item.frozen).length;

  const columns: ColumnsType<InventoryLedger> = [
    {
      title: '序号',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1,
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
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      width: 60,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
    },
    {
      title: '仓库',
      dataIndex: 'warehouse',
      key: 'warehouse',
      width: 100,
    },
    {
      title: '库位',
      dataIndex: 'location',
      key: 'location',
      width: 80,
    },
    {
      title: '期初库存',
      dataIndex: 'openingStock',
      key: 'openingStock',
      width: 80,
      align: 'right',
    },
    {
      title: '入库数量',
      dataIndex: 'inQuantity',
      key: 'inQuantity',
      width: 80,
      align: 'right',
      render: (value) => <span style={{ color: '#52c41a' }}>+{value}</span>,
    },
    {
      title: '出库数量',
      dataIndex: 'outQuantity',
      key: 'outQuantity',
      width: 80,
      align: 'right',
      render: (value) => <span style={{ color: '#ff4d4f' }}>-{value}</span>,
    },
    {
      title: '当前库存',
      dataIndex: 'currentStock',
      key: 'currentStock',
      width: 80,
      align: 'right',
      render: (value, record) => (
        <span style={{ 
          color: record.status === 'low' || record.status === 'out' ? '#ff4d4f' : 
                 record.status === 'excess' ? '#1890ff' : '#000',
          fontWeight: 'bold'
        }}>
          {value}
        </span>
      ),
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
      title: '库存金额',
      dataIndex: 'totalValue',
      key: 'totalValue',
      width: 100,
      align: 'right',
      render: (value) => `¥${value.toLocaleString()}`,
    },
    {
      title: '批次数',
      dataIndex: 'batchCount',
      key: 'batchCount',
      width: 60,
      align: 'right',
      render: (value) => value > 0 ? value : '-',
    },
    {
      title: '库龄(天)',
      dataIndex: 'ageInDays',
      key: 'ageInDays',
      width: 80,
      align: 'right',
      render: (value) => (
        <span style={{ 
          color: value <= 30 ? '#52c41a' : value <= 90 ? '#faad14' : '#ff4d4f',
          fontWeight: 'bold'
        }}>
          {value > 0 ? value : '-'}
        </span>
      ),
    },
    {
      title: '周转率',
      dataIndex: 'turnoverRate',
      key: 'turnoverRate',
      width: 70,
      align: 'right',
      render: (value) => (
        <span style={{ 
          color: value >= 2 ? '#52c41a' : value >= 1 ? '#faad14' : '#ff4d4f',
          fontWeight: 'bold'
        }}>
          {value > 0 ? value.toFixed(1) : '-'}
        </span>
      ),
    },
    {
      title: 'ABC分类',
      dataIndex: 'abc',
      key: 'abc',
      width: 70,
      align: 'center',
      render: (value) => (
        <Tag color={value === 'A' ? 'red' : value === 'B' ? 'orange' : 'green'}>
          {value}
        </Tag>
      ),
    },
    {
      title: '供应商',
      dataIndex: 'supplier',
      key: 'supplier',
      width: 120,
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'statusText',
      key: 'status',
      width: 80,
      render: (text, record) => (
        <div>
          <Tag color={getStatusColor(record.status)}>{text}</Tag>
          {record.frozen && <Tag color="blue">冻结</Tag>}
        </div>
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
        </Space>
      ),
    },
  ];

  const transactionColumns: ColumnsType<InventoryTransaction> = [
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
              title="库存总金额"
              value={totalValue}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="物料品种数"
              value={totalItems}
              suffix="种"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="库存不足"
              value={lowStockItems}
              suffix="种"
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="库存过量"
              value={excessStockItems}
              suffix="种"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 扩展统计卡片 */}
      <Row gutter={16} className="mb-4">
        <Col span={6}>
          <Card>
            <Statistic
              title="总批次数"
              value={totalBatches}
              suffix="批"
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均库龄"
              value={avgAge}
              suffix="天"
              valueStyle={{ color: avgAge <= 30 ? '#52c41a' : avgAge <= 90 ? '#faad14' : '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均周转率"
              value={avgTurnover}
              valueStyle={{ color: parseFloat(avgTurnover) >= 2 ? '#52c41a' : parseFloat(avgTurnover) >= 1 ? '#faad14' : '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="冻结物料"
              value={frozenItems}
              suffix="种"
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        {/* 搜索表单 */}
        <Form form={form} layout="inline" className="mb-4">
          <Form.Item name="itemName" label="物料名称/编码">
            <Input placeholder="请输入物料名称或编码" style={{ width: 200 }} />
          </Form.Item>
          <Form.Item name="category" label="物料分类">
            <Select placeholder="请选择分类" style={{ width: 120 }}>
              <Option value="办公设备">办公设备</Option>
              <Option value="办公家具">办公家具</Option>
              <Option value="生产设备">生产设备</Option>
              <Option value="原材料">原材料</Option>
            </Select>
          </Form.Item>
          <Form.Item name="warehouse" label="仓库">
            <Select placeholder="请选择仓库" style={{ width: 120 }}>
              <Option value="主仓库">主仓库</Option>
              <Option value="分仓库">分仓库</Option>
              <Option value="临时仓库">临时仓库</Option>
            </Select>
          </Form.Item>
          <Form.Item name="status" label="库存状态">
            <Select placeholder="请选择状态" style={{ width: 120 }}>
              <Option value="normal">正常</Option>
              <Option value="low">库存不足</Option>
              <Option value="out">缺货</Option>
              <Option value="excess">库存过量</Option>
            </Select>
          </Form.Item>
          <Form.Item name="abc" label="ABC分类">
            <Select placeholder="请选择分类" style={{ width: 100 }}>
              <Option value="A">A类</Option>
              <Option value="B">B类</Option>
              <Option value="C">C类</Option>
            </Select>
          </Form.Item>
          <Form.Item name="frozen" label="冻结状态">
            <Select placeholder="请选择" style={{ width: 100 }}>
              <Option value={true}>已冻结</Option>
              <Option value={false}>未冻结</Option>
            </Select>
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
              <Button 
                type="dashed" 
                onClick={() => window.open('/inventory/batch-management', '_blank')}
              >
                批次管理
              </Button>
              <Button 
                type="dashed" 
                onClick={() => window.open('/inventory/age-analysis', '_blank')}
              >
                库龄分析
              </Button>
            </Space>
          </Form.Item>
        </Form>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1600 }}
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
        title="库存台账详情"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedRecord && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="物料编码">{selectedRecord.itemCode}</Descriptions.Item>
              <Descriptions.Item label="物料名称">{selectedRecord.itemName}</Descriptions.Item>
              <Descriptions.Item label="规格型号" span={2}>{selectedRecord.specification}</Descriptions.Item>
              <Descriptions.Item label="单位">{selectedRecord.unit}</Descriptions.Item>
              <Descriptions.Item label="分类">{selectedRecord.category}</Descriptions.Item>
              <Descriptions.Item label="仓库">{selectedRecord.warehouse}</Descriptions.Item>
              <Descriptions.Item label="库位">{selectedRecord.location}</Descriptions.Item>
              <Descriptions.Item label="期初库存">{selectedRecord.openingStock}</Descriptions.Item>
              <Descriptions.Item label="入库数量">
                <span style={{ color: '#52c41a' }}>+{selectedRecord.inQuantity}</span>
              </Descriptions.Item>
              <Descriptions.Item label="出库数量">
                <span style={{ color: '#ff4d4f' }}>-{selectedRecord.outQuantity}</span>
              </Descriptions.Item>
              <Descriptions.Item label="当前库存">
                <span style={{ 
                  color: selectedRecord.status === 'low' || selectedRecord.status === 'out' ? '#ff4d4f' : 
                         selectedRecord.status === 'excess' ? '#1890ff' : '#000',
                  fontWeight: 'bold'
                }}>
                  {selectedRecord.currentStock}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="单价">¥{selectedRecord.unitPrice}</Descriptions.Item>
              <Descriptions.Item label="库存金额">¥{selectedRecord.totalValue.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="安全库存">{selectedRecord.safetyStock}</Descriptions.Item>
              <Descriptions.Item label="最大库存">{selectedRecord.maxStock}</Descriptions.Item>
              <Descriptions.Item label="最后入库日期">{selectedRecord.lastInDate || '无'}</Descriptions.Item>
              <Descriptions.Item label="最后出库日期">{selectedRecord.lastOutDate || '无'}</Descriptions.Item>
              <Descriptions.Item label="库存状态">
                <Tag color={getStatusColor(selectedRecord.status)}>{selectedRecord.statusText}</Tag>
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>

      {/* 库存流水模态框 */}
      <Modal
        title={`库存流水 - ${selectedRecord?.itemName}`}
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

export default InventoryLedger;