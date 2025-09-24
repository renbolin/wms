import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Form, Input, Select, Space, Tag, message, Descriptions, Row, Col, Statistic, Modal, DatePicker } from 'antd';
import { SearchOutlined, EyeOutlined, DownloadOutlined, PrinterOutlined, ReloadOutlined, BarChartOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

// 库存信息接口
interface StockInfo {
  id: string;
  itemCode: string;
  itemName: string;
  specification: string;
  unit: string;
  category: string;
  warehouse: string;
  location: string;
  currentStock: number;
  safetyStock: number;
  maxStock: number;
  unitPrice: number;
  totalValue: number;
  lastInDate: string;
  lastOutDate: string;
  supplier: string;
  status: 'normal' | 'low' | 'out' | 'excess';
  statusText: string;
  batchCount: number;
  ageInDays: number;
  turnoverRate: number;
  abc: 'A' | 'B' | 'C';
  frozen: boolean;
}

const InventoryStock: React.FC = () => {
  const [data, setData] = useState<StockInfo[]>([]);
  const [filteredData, setFilteredData] = useState<StockInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<StockInfo | null>(null);
  const [form] = Form.useForm();

  // 模拟数据
  const mockData: StockInfo[] = [
    {
      id: '1',
      itemCode: 'IT001',
      itemName: '联想ThinkPad笔记本',
      specification: 'T14 Gen3 i5-1235U 16G 512G',
      unit: '台',
      category: '办公设备',
      warehouse: '总仓',
      location: 'A-01-01',
      currentStock: 25,
      safetyStock: 10,
      maxStock: 50,
      unitPrice: 6500,
      totalValue: 162500,
      lastInDate: '2024-01-15',
      lastOutDate: '2024-01-20',
      supplier: '联想科技有限公司',
      status: 'normal',
      statusText: '正常',
      batchCount: 3,
      ageInDays: 15,
      turnoverRate: 2.5,
      abc: 'A',
      frozen: false,
    },
    {
      id: '2',
      itemCode: 'OF001',
      itemName: 'A4复印纸',
      specification: '70g 500张/包',
      unit: '包',
      category: '办公用品',
      warehouse: '总仓',
      location: 'B-02-03',
      currentStock: 5,
      safetyStock: 20,
      maxStock: 100,
      unitPrice: 25,
      totalValue: 125,
      lastInDate: '2024-01-10',
      lastOutDate: '2024-01-22',
      supplier: '晨光文具股份有限公司',
      status: 'low',
      statusText: '库存不足',
      batchCount: 1,
      ageInDays: 25,
      turnoverRate: 4.2,
      abc: 'B',
      frozen: false,
    },
    {
      id: '3',
      itemCode: 'EL001',
      itemName: 'LED显示器',
      specification: '24寸 1080P IPS',
      unit: '台',
      category: '电子设备',
      warehouse: '分仓A',
      location: 'C-01-05',
      currentStock: 0,
      safetyStock: 5,
      maxStock: 30,
      unitPrice: 1200,
      totalValue: 0,
      lastInDate: '2024-01-05',
      lastOutDate: '2024-01-23',
      supplier: '戴尔科技有限公司',
      status: 'out',
      statusText: '缺货',
      batchCount: 0,
      ageInDays: 0,
      turnoverRate: 3.8,
      abc: 'A',
      frozen: false,
    },
    {
      id: '4',
      itemCode: 'FU001',
      itemName: '办公桌椅套装',
      specification: '1.2m桌+人体工学椅',
      unit: '套',
      category: '办公家具',
      warehouse: '总仓',
      location: 'D-03-01',
      currentStock: 80,
      safetyStock: 10,
      maxStock: 50,
      unitPrice: 1500,
      totalValue: 120000,
      lastInDate: '2023-12-20',
      lastOutDate: '2024-01-18',
      supplier: '震旦办公家具',
      status: 'excess',
      statusText: '库存过量',
      batchCount: 2,
      ageInDays: 45,
      turnoverRate: 1.2,
      abc: 'C',
      frozen: false,
    },
    {
      id: '5',
      itemCode: 'ST001',
      itemName: '文件柜',
      specification: '四抽屉钢制文件柜',
      unit: '个',
      category: '办公家具',
      warehouse: '分仓B',
      location: 'E-02-02',
      currentStock: 15,
      safetyStock: 8,
      maxStock: 25,
      unitPrice: 800,
      totalValue: 12000,
      lastInDate: '2024-01-12',
      lastOutDate: '2024-01-21',
      supplier: '美时办公家具',
      status: 'normal',
      statusText: '正常',
      batchCount: 1,
      ageInDays: 20,
      turnoverRate: 2.1,
      abc: 'B',
      frozen: true,
    },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    // 模拟API调用
    setTimeout(() => {
      setData(mockData);
      setFilteredData(mockData);
      setLoading(false);
    }, 1000);
  };

  // 搜索功能
  const handleSearch = (values: any) => {
    let filtered = [...data];

    if (values.itemCode) {
      filtered = filtered.filter(item => 
        item.itemCode.toLowerCase().includes(values.itemCode.toLowerCase())
      );
    }

    if (values.itemName) {
      filtered = filtered.filter(item => 
        item.itemName.toLowerCase().includes(values.itemName.toLowerCase())
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

    if (values.abc) {
      filtered = filtered.filter(item => item.abc === values.abc);
    }

    if (values.stockRange && values.stockRange.length === 2) {
      const [min, max] = values.stockRange;
      filtered = filtered.filter(item => 
        item.currentStock >= min && item.currentStock <= max
      );
    }

    setFilteredData(filtered);
  };

  // 重置搜索
  const handleReset = () => {
    form.resetFields();
    setFilteredData(data);
  };

  // 查看详情
  const handleViewDetail = (record: StockInfo) => {
    setSelectedRecord(record);
    setIsDetailModalVisible(true);
  };

  // 导出数据
  const handleExport = () => {
    message.success('导出成功');
  };

  // 打印
  const handlePrint = () => {
    message.success('打印成功');
  };

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'green';
      case 'low': return 'orange';
      case 'out': return 'red';
      case 'excess': return 'blue';
      default: return 'default';
    }
  };

  // 获取ABC分类颜色
  const getAbcColor = (abc: string) => {
    switch (abc) {
      case 'A': return 'red';
      case 'B': return 'orange';
      case 'C': return 'green';
      default: return 'default';
    }
  };

  // 表格列定义
  const columns: ColumnsType<StockInfo> = [
    {
      title: '物料编码',
      dataIndex: 'itemCode',
      key: 'itemCode',
      width: 120,
      fixed: 'left',
    },
    {
      title: '物料名称',
      dataIndex: 'itemName',
      key: 'itemName',
      width: 200,
      fixed: 'left',
    },
    {
      title: '规格型号',
      dataIndex: 'specification',
      key: 'specification',
      width: 180,
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      width: 60,
      align: 'center',
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
      width: 100,
    },
    {
      title: '当前库存',
      dataIndex: 'currentStock',
      key: 'currentStock',
      width: 100,
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
      title: '安全库存',
      dataIndex: 'safetyStock',
      key: 'safetyStock',
      width: 100,
      align: 'right',
    },
    {
      title: '最大库存',
      dataIndex: 'maxStock',
      key: 'maxStock',
      width: 100,
      align: 'right',
    },
    {
      title: '单价',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 100,
      align: 'right',
      render: (value) => `¥${value.toLocaleString()}`,
    },
    {
      title: '库存金额',
      dataIndex: 'totalValue',
      key: 'totalValue',
      width: 120,
      align: 'right',
      render: (value) => `¥${value.toLocaleString()}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (value, record) => (
        <Tag color={getStatusColor(value)}>{record.statusText}</Tag>
      ),
    },
    {
      title: 'ABC分类',
      dataIndex: 'abc',
      key: 'abc',
      width: 80,
      align: 'center',
      render: (value) => (
        <Tag color={getAbcColor(value)}>{value}</Tag>
      ),
    },
    {
      title: '批次数',
      dataIndex: 'batchCount',
      key: 'batchCount',
      width: 80,
      align: 'center',
    },
    {
      title: '库龄(天)',
      dataIndex: 'ageInDays',
      key: 'ageInDays',
      width: 100,
      align: 'right',
    },
    {
      title: '周转率',
      dataIndex: 'turnoverRate',
      key: 'turnoverRate',
      width: 100,
      align: 'right',
      render: (value) => value.toFixed(1),
    },
    {
      title: '冻结',
      dataIndex: 'frozen',
      key: 'frozen',
      width: 80,
      align: 'center',
      render: (value) => (
        <Tag color={value ? 'red' : 'green'}>
          {value ? '已冻结' : '正常'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
        </Space>
      ),
    },
  ];

  // 计算统计数据
  const totalItems = filteredData.length;
  const totalValue = filteredData.reduce((sum, item) => sum + item.totalValue, 0);
  const lowStockItems = filteredData.filter(item => item.status === 'low' || item.status === 'out').length;
  const excessStockItems = filteredData.filter(item => item.status === 'excess').length;

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="物料总数"
              value={totalItems}
              suffix="种"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="库存总值"
              value={totalValue}
              prefix="¥"
              precision={0}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="库存不足"
              value={lowStockItems}
              suffix="种"
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="库存过量"
              value={excessStockItems}
              suffix="种"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="库存查询" extra={
        <Space>
          <Button icon={<ReloadOutlined />} onClick={loadData}>
            刷新
          </Button>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>
            导出
          </Button>
          <Button icon={<PrinterOutlined />} onClick={handlePrint}>
            打印
          </Button>
          <Button 
            icon={<BarChartOutlined />} 
            onClick={() => window.open('/inventory/age-analysis', '_blank')}
          >
            库龄分析
          </Button>
        </Space>
      }>
        {/* 搜索表单 */}
        <Form
          form={form}
          layout="inline"
          onFinish={handleSearch}
          style={{ marginBottom: 16 }}
        >
          <Form.Item name="itemCode" label="物料编码">
            <Input placeholder="请输入物料编码" style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="itemName" label="物料名称">
            <Input placeholder="请输入物料名称" style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="category" label="分类">
            <Select placeholder="请选择分类" style={{ width: 120 }} allowClear>
              <Option value="办公设备">办公设备</Option>
              <Option value="办公用品">办公用品</Option>
              <Option value="电子设备">电子设备</Option>
              <Option value="办公家具">办公家具</Option>
            </Select>
          </Form.Item>
          <Form.Item name="warehouse" label="仓库">
            <Select placeholder="请选择仓库" style={{ width: 120 }} allowClear>
              <Option value="总仓">总仓</Option>
              <Option value="分仓A">分仓A</Option>
              <Option value="分仓B">分仓B</Option>
            </Select>
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择状态" style={{ width: 120 }} allowClear>
              <Option value="normal">正常</Option>
              <Option value="low">库存不足</Option>
              <Option value="out">缺货</Option>
              <Option value="excess">库存过量</Option>
            </Select>
          </Form.Item>
          <Form.Item name="abc" label="ABC分类">
            <Select placeholder="请选择ABC分类" style={{ width: 120 }} allowClear>
              <Option value="A">A类</Option>
              <Option value="B">B类</Option>
              <Option value="C">C类</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                搜索
              </Button>
              <Button onClick={handleReset}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>

        {/* 数据表格 */}
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
        title="库存详情"
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
              <Descriptions.Item label="当前库存">
                <span style={{ 
                  color: selectedRecord.status === 'low' || selectedRecord.status === 'out' ? '#ff4d4f' : 
                         selectedRecord.status === 'excess' ? '#1890ff' : '#000',
                  fontWeight: 'bold'
                }}>
                  {selectedRecord.currentStock}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="安全库存">{selectedRecord.safetyStock}</Descriptions.Item>
              <Descriptions.Item label="最大库存">{selectedRecord.maxStock}</Descriptions.Item>
              <Descriptions.Item label="单价">¥{selectedRecord.unitPrice.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="库存金额">¥{selectedRecord.totalValue.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={getStatusColor(selectedRecord.status)}>{selectedRecord.statusText}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="ABC分类">
                <Tag color={getAbcColor(selectedRecord.abc)}>{selectedRecord.abc}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="批次数量">{selectedRecord.batchCount}</Descriptions.Item>
              <Descriptions.Item label="库龄">{selectedRecord.ageInDays} 天</Descriptions.Item>
              <Descriptions.Item label="周转率">{selectedRecord.turnoverRate.toFixed(1)}</Descriptions.Item>
              <Descriptions.Item label="冻结状态">
                <Tag color={selectedRecord.frozen ? 'red' : 'green'}>
                  {selectedRecord.frozen ? '已冻结' : '正常'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="最后入库日期">{selectedRecord.lastInDate}</Descriptions.Item>
              <Descriptions.Item label="最后出库日期">{selectedRecord.lastOutDate}</Descriptions.Item>
              <Descriptions.Item label="主要供应商" span={2}>{selectedRecord.supplier}</Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default InventoryStock;