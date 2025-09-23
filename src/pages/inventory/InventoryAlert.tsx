import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Modal, Form, Input, Select, Space, Tag, message, Descriptions, Row, Col, Alert, Statistic, Progress } from 'antd';
import { EyeOutlined, SearchOutlined, BellOutlined, WarningOutlined, ExclamationCircleOutlined, CheckCircleOutlined, SettingOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Option } = Select;

// 库存预警接口
interface InventoryAlert {
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
  alertType: 'low' | 'out' | 'excess' | 'expiry';
  alertTypeText: string;
  alertLevel: 'high' | 'medium' | 'low';
  alertLevelText: string;
  alertDate: string;
  lastInDate: string;
  lastOutDate: string;
  unitPrice: number;
  totalValue: number;
  supplier: string;
  leadTime: number;
  expiryDate?: string;
  status: 'active' | 'handled' | 'ignored';
  statusText: string;
  handler?: string;
  handleDate?: string;
  remarks: string;
}

// 预警设置接口
interface AlertSetting {
  id: string;
  itemCode: string;
  itemName: string;
  safetyStock: number;
  maxStock: number;
  lowStockAlert: boolean;
  outStockAlert: boolean;
  excessStockAlert: boolean;
  expiryAlert: boolean;
  expiryDays: number;
}

const InventoryAlert: React.FC = () => {
  const [data, setData] = useState<InventoryAlert[]>([]);
  const [filteredData, setFilteredData] = useState<InventoryAlert[]>([]);
  const [loading, _setLoading] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isSettingModalVisible, setIsSettingModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<InventoryAlert | null>(null);
  const [_alertSettings, setAlertSettings] = useState<AlertSetting[]>([]);
  const [form] = Form.useForm();
  const [_settingForm] = Form.useForm();

  // 模拟数据
  const mockData: InventoryAlert[] = [
    {
      id: '1',
      itemCode: 'IT001',
      itemName: '台式电脑',
      specification: 'Intel i5, 8GB内存, 256GB SSD',
      unit: '台',
      category: '办公设备',
      warehouse: '主仓库',
      location: 'A区-01',
      currentStock: 2,
      safetyStock: 5,
      maxStock: 20,
      alertType: 'low',
      alertTypeText: '库存不足',
      alertLevel: 'high',
      alertLevelText: '高',
      alertDate: '2024-01-30',
      lastInDate: '2024-01-25',
      lastOutDate: '2024-01-28',
      unitPrice: 3800,
      totalValue: 7600,
      supplier: '联想科技',
      leadTime: 7,
      status: 'active',
      statusText: '待处理',
      handler: '',
      handleDate: '',
      remarks: '库存已低于安全库存，需要及时补货'
    },
    {
      id: '2',
      itemCode: 'OF002',
      itemName: '办公椅',
      specification: '人体工学设计，可调节高度',
      unit: '把',
      category: '办公家具',
      warehouse: '主仓库',
      location: 'B区-02',
      currentStock: 0,
      safetyStock: 3,
      maxStock: 15,
      alertType: 'out',
      alertTypeText: '缺货',
      alertLevel: 'high',
      alertLevelText: '高',
      alertDate: '2024-01-29',
      lastInDate: '2024-01-20',
      lastOutDate: '2024-01-28',
      unitPrice: 450,
      totalValue: 0,
      supplier: '办公家具厂',
      leadTime: 5,
      status: 'active',
      statusText: '待处理',
      handler: '',
      handleDate: '',
      remarks: '库存为零，急需补货'
    },
    {
      id: '3',
      itemCode: 'ST001',
      itemName: '文件柜',
      specification: '四抽屉钢制文件柜',
      unit: '个',
      category: '办公家具',
      warehouse: '主仓库',
      location: 'B区-03',
      currentStock: 25,
      safetyStock: 2,
      maxStock: 10,
      alertType: 'excess',
      alertTypeText: '库存过量',
      alertLevel: 'medium',
      alertLevelText: '中',
      alertDate: '2024-01-28',
      lastInDate: '2024-01-22',
      lastOutDate: '2024-01-29',
      unitPrice: 600,
      totalValue: 15000,
      supplier: '钢制家具厂',
      leadTime: 10,
      status: 'handled',
      statusText: '已处理',
      handler: '张三',
      handleDate: '2024-01-30',
      remarks: '库存过量，已安排调拨到分仓库'
    },
    {
      id: '4',
      itemCode: 'FD001',
      itemName: '食品原料A',
      specification: '有机食品原料',
      unit: 'kg',
      category: '食品原料',
      warehouse: '冷藏仓库',
      location: 'C区-01',
      currentStock: 50,
      safetyStock: 10,
      maxStock: 100,
      alertType: 'expiry',
      alertTypeText: '临期预警',
      alertLevel: 'high',
      alertLevelText: '高',
      alertDate: '2024-01-30',
      lastInDate: '2024-01-15',
      lastOutDate: '2024-01-25',
      unitPrice: 25,
      totalValue: 1250,
      supplier: '有机食品供应商',
      leadTime: 3,
      expiryDate: '2024-02-05',
      status: 'active',
      statusText: '待处理',
      handler: '',
      handleDate: '',
      remarks: '距离过期还有5天，需要尽快处理'
    },
    {
      id: '5',
      itemCode: 'OF001',
      itemName: '办公桌',
      specification: '1.2m*0.6m 钢木结构',
      unit: '张',
      category: '办公家具',
      warehouse: '主仓库',
      location: 'B区-01',
      currentStock: 3,
      safetyStock: 5,
      maxStock: 20,
      alertType: 'low',
      alertTypeText: '库存不足',
      alertLevel: 'medium',
      alertLevelText: '中',
      alertDate: '2024-01-29',
      lastInDate: '2024-01-20',
      lastOutDate: '2024-01-30',
      unitPrice: 800,
      totalValue: 2400,
      supplier: '办公家具厂',
      leadTime: 7,
      status: 'ignored',
      statusText: '已忽略',
      handler: '李四',
      handleDate: '2024-01-30',
      remarks: '暂时不需要补货，已忽略预警'
    },
  ];

  // 模拟预警设置数据
  const mockAlertSettings: AlertSetting[] = [
    {
      id: '1',
      itemCode: 'IT001',
      itemName: '台式电脑',
      safetyStock: 5,
      maxStock: 20,
      lowStockAlert: true,
      outStockAlert: true,
      excessStockAlert: true,
      expiryAlert: false,
      expiryDays: 0,
    },
    {
      id: '2',
      itemCode: 'OF002',
      itemName: '办公椅',
      safetyStock: 3,
      maxStock: 15,
      lowStockAlert: true,
      outStockAlert: true,
      excessStockAlert: true,
      expiryAlert: false,
      expiryDays: 0,
    },
  ];

  useEffect(() => {
    setData(mockData);
    setFilteredData(mockData);
    setAlertSettings(mockAlertSettings);
  }, []);

  const handleView = (record: InventoryAlert) => {
    setSelectedRecord(record);
    setIsDetailModalVisible(true);
  };

  const handleSetting = () => {
    setIsSettingModalVisible(true);
  };

  const handleProcess = (record: InventoryAlert) => {
    Modal.confirm({
      title: '确认处理',
      content: `确定要标记预警 ${record.itemName} 为已处理吗？`,
      onOk: () => {
        const newData = data.map(item => 
          item.id === record.id 
            ? { 
                ...item, 
                status: 'handled' as const, 
                statusText: '已处理',
                handler: '当前用户',
                handleDate: new Date().toISOString().split('T')[0]
              }
            : item
        );
        setData(newData);
        setFilteredData(newData);
        message.success('处理成功');
      },
    });
  };

  const handleIgnore = (record: InventoryAlert) => {
    Modal.confirm({
      title: '确认忽略',
      content: `确定要忽略预警 ${record.itemName} 吗？`,
      onOk: () => {
        const newData = data.map(item => 
          item.id === record.id 
            ? { 
                ...item, 
                status: 'ignored' as const, 
                statusText: '已忽略',
                handler: '当前用户',
                handleDate: new Date().toISOString().split('T')[0]
              }
            : item
        );
        setData(newData);
        setFilteredData(newData);
        message.success('已忽略');
      },
    });
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

      if (values.alertType) {
        filtered = filtered.filter(item => item.alertType === values.alertType);
      }

      if (values.alertLevel) {
        filtered = filtered.filter(item => item.alertLevel === values.alertLevel);
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

  const getAlertTypeColor = (type: string) => {
    const colors = {
      low: 'warning',
      out: 'error',
      excess: 'processing',
      expiry: 'error',
    };
    return colors[type as keyof typeof colors] || 'default';
  };

  const getAlertLevelColor = (level: string) => {
    const colors = {
      high: 'error',
      medium: 'warning',
      low: 'default',
    };
    return colors[level as keyof typeof colors] || 'default';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'processing',
      handled: 'success',
      ignored: 'default',
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getStockProgress = (current: number, safety: number, max: number) => {
    const percent = (current / max) * 100;
    let status: 'success' | 'exception' | 'active' | 'normal' = 'normal';
    
    if (current === 0) {
      status = 'exception';
    } else if (current < safety) {
      status = 'exception';
    } else if (current > max) {
      status = 'active';
    } else {
      status = 'success';
    }
    
    return { percent: Math.min(percent, 100), status };
  };

  // 计算统计数据
  const totalAlerts = filteredData.length;
  const activeAlerts = filteredData.filter(item => item.status === 'active').length;
  const highLevelAlerts = filteredData.filter(item => item.alertLevel === 'high' && item.status === 'active').length;
  const outOfStockAlerts = filteredData.filter(item => item.alertType === 'out' && item.status === 'active').length;

  const columns: ColumnsType<InventoryAlert> = [
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
      title: '库存状态',
      key: 'stockStatus',
      width: 120,
      render: (_, record) => {
        const { percent, status } = getStockProgress(record.currentStock, record.safetyStock, record.maxStock);
        return (
          <div>
            <div style={{ marginBottom: 4 }}>
              <span style={{ fontSize: '12px' }}>
                {record.currentStock}/{record.maxStock}
              </span>
            </div>
            <Progress 
              percent={percent} 
              status={status} 
              size="small" 
              showInfo={false}
            />
          </div>
        );
      },
    },
    {
      title: '预警类型',
      dataIndex: 'alertTypeText',
      key: 'alertType',
      width: 100,
      render: (text, record) => (
        <Tag color={getAlertTypeColor(record.alertType)} icon={
          record.alertType === 'out' ? <ExclamationCircleOutlined /> :
          record.alertType === 'low' ? <WarningOutlined /> :
          record.alertType === 'expiry' ? <ExclamationCircleOutlined /> :
          <BellOutlined />
        }>
          {text}
        </Tag>
      ),
    },
    {
      title: '预警级别',
      dataIndex: 'alertLevelText',
      key: 'alertLevel',
      width: 80,
      render: (text, record) => (
        <Tag color={getAlertLevelColor(record.alertLevel)}>{text}</Tag>
      ),
    },
    {
      title: '预警日期',
      dataIndex: 'alertDate',
      key: 'alertDate',
      width: 100,
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
      title: '供应商',
      dataIndex: 'supplier',
      key: 'supplier',
      width: 120,
      ellipsis: true,
    },
    {
      title: '交期',
      dataIndex: 'leadTime',
      key: 'leadTime',
      width: 60,
      align: 'right',
      render: (value) => `${value}天`,
    },
    {
      title: '状态',
      dataIndex: 'statusText',
      key: 'status',
      width: 80,
      render: (text, record) => (
        <Tag color={getStatusColor(record.status)} icon={
          record.status === 'handled' ? <CheckCircleOutlined /> : 
          record.status === 'active' ? <ExclamationCircleOutlined /> : 
          undefined
        }>
          {text}
        </Tag>
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
          {record.status === 'active' && (
            <>
              <Button
                type="link"
                size="small"
                onClick={() => handleProcess(record)}
                style={{ color: '#52c41a' }}
              >
                处理
              </Button>
              <Button
                type="link"
                size="small"
                onClick={() => handleIgnore(record)}
                style={{ color: '#999' }}
              >
                忽略
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* 统计卡片 */}
      <Row gutter={16} className="mb-4">
        <Col span={6}>
          <Card>
            <Statistic
              title="总预警数"
              value={totalAlerts}
              suffix="条"
              valueStyle={{ color: '#1890ff' }}
              prefix={<BellOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待处理预警"
              value={activeAlerts}
              suffix="条"
              valueStyle={{ color: '#fa8c16' }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="高级别预警"
              value={highLevelAlerts}
              suffix="条"
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="缺货预警"
              value={outOfStockAlerts}
              suffix="条"
              valueStyle={{ color: '#cf1322' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 预警提示 */}
      {activeAlerts > 0 && (
        <Alert
          message={`当前有 ${activeAlerts} 条待处理预警，其中 ${highLevelAlerts} 条为高级别预警，请及时处理！`}
          type="warning"
          showIcon
          className="mb-4"
        />
      )}

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
              <Option value="食品原料">食品原料</Option>
              <Option value="生产设备">生产设备</Option>
            </Select>
          </Form.Item>
          <Form.Item name="warehouse" label="仓库">
            <Select placeholder="请选择仓库" style={{ width: 120 }}>
              <Option value="主仓库">主仓库</Option>
              <Option value="分仓库">分仓库</Option>
              <Option value="冷藏仓库">冷藏仓库</Option>
            </Select>
          </Form.Item>
          <Form.Item name="alertType" label="预警类型">
            <Select placeholder="请选择预警类型" style={{ width: 120 }}>
              <Option value="low">库存不足</Option>
              <Option value="out">缺货</Option>
              <Option value="excess">库存过量</Option>
              <Option value="expiry">临期预警</Option>
            </Select>
          </Form.Item>
          <Form.Item name="alertLevel" label="预警级别">
            <Select placeholder="请选择预警级别" style={{ width: 100 }}>
              <Option value="high">高</Option>
              <Option value="medium">中</Option>
              <Option value="low">低</Option>
            </Select>
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择状态" style={{ width: 100 }}>
              <Option value="active">待处理</Option>
              <Option value="handled">已处理</Option>
              <Option value="ignored">已忽略</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                搜索
              </Button>
              <Button onClick={handleReset}>重置</Button>
              <Button icon={<SettingOutlined />} onClick={handleSetting}>
                预警设置
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
        title="库存预警详情"
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
                  color: selectedRecord.alertType === 'low' || selectedRecord.alertType === 'out' ? '#ff4d4f' : 
                         selectedRecord.alertType === 'excess' ? '#1890ff' : '#000',
                  fontWeight: 'bold'
                }}>
                  {selectedRecord.currentStock}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="安全库存">{selectedRecord.safetyStock}</Descriptions.Item>
              <Descriptions.Item label="最大库存">{selectedRecord.maxStock}</Descriptions.Item>
              <Descriptions.Item label="单价">¥{selectedRecord.unitPrice}</Descriptions.Item>
              <Descriptions.Item label="库存金额">¥{selectedRecord.totalValue.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="供应商">{selectedRecord.supplier}</Descriptions.Item>
              <Descriptions.Item label="交期">{selectedRecord.leadTime}天</Descriptions.Item>
              <Descriptions.Item label="最后入库日期">{selectedRecord.lastInDate}</Descriptions.Item>
              <Descriptions.Item label="最后出库日期">{selectedRecord.lastOutDate}</Descriptions.Item>
              {selectedRecord.expiryDate && (
                <Descriptions.Item label="过期日期" span={2}>
                  <span style={{ color: '#ff4d4f' }}>{selectedRecord.expiryDate}</span>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="预警类型">
                <Tag color={getAlertTypeColor(selectedRecord.alertType)}>{selectedRecord.alertTypeText}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="预警级别">
                <Tag color={getAlertLevelColor(selectedRecord.alertLevel)}>{selectedRecord.alertLevelText}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="预警日期">{selectedRecord.alertDate}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={getStatusColor(selectedRecord.status)}>{selectedRecord.statusText}</Tag>
              </Descriptions.Item>
              {selectedRecord.handler && (
                <>
                  <Descriptions.Item label="处理人">{selectedRecord.handler}</Descriptions.Item>
                  <Descriptions.Item label="处理日期">{selectedRecord.handleDate}</Descriptions.Item>
                </>
              )}
              <Descriptions.Item label="备注" span={2}>{selectedRecord.remarks}</Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>

      {/* 预警设置模态框 */}
      <Modal
        title="预警设置"
        open={isSettingModalVisible}
        onCancel={() => setIsSettingModalVisible(false)}
        footer={null}
        width={800}
      >
        <div>
          <p>预警设置功能开发中...</p>
        </div>
      </Modal>
    </div>
  );
};

export default InventoryAlert;