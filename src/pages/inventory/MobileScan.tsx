import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Form, Input, Select, Space, Tag, message, Descriptions, Row, Col, List, Avatar, Divider, QRCode, Alert } from 'antd';
import { ScanOutlined, QrcodeOutlined, SearchOutlined, PlusOutlined, MinusOutlined, SwapOutlined, EyeOutlined, HistoryOutlined, CameraOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Option } = Select;
const { TextArea } = Input;

// 扫码记录接口
interface ScanRecord {
  id: string;
  itemCode: string;
  itemName: string;
  specification: string;
  unit: string;
  warehouse: string;
  location: string;
  operationType: 'in' | 'out' | 'transfer' | 'check';
  operationTypeText: string;
  quantity: number;
  operator: string;
  scanTime: string;
  remarks: string;
  batchNo?: string;
  expiryDate?: string;
}

// 库存信息接口
interface StockInfo {
  itemCode: string;
  itemName: string;
  specification: string;
  unit: string;
  warehouse: string;
  location: string;
  currentStock: number;
  safetyStock: number;
  unitPrice: number;
  totalValue: number;
  lastInDate: string;
  lastOutDate: string;
  supplier: string;
}

const MobileScan: React.FC = () => {
  const [scanRecords, setScanRecords] = useState<ScanRecord[]>([]);
  const [stockInfo, setStockInfo] = useState<StockInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [isScanModalVisible, setIsScanModalVisible] = useState(false);
  const [isOperationModalVisible, setIsOperationModalVisible] = useState(false);
  const [isStockModalVisible, setIsStockModalVisible] = useState(false);
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
  const [isQRCodeModalVisible, setIsQRCodeModalVisible] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<string>('');
  const [scannedCode, setScannedCode] = useState<string>('');
  const [form] = Form.useForm();

  // 模拟扫码记录数据
  const mockScanRecords: ScanRecord[] = [
    {
      id: '1',
      itemCode: 'IT001',
      itemName: '台式电脑',
      specification: 'Intel i5, 8GB内存, 256GB SSD',
      unit: '台',
      warehouse: '主仓库',
      location: 'A区-01',
      operationType: 'in',
      operationTypeText: '入库',
      quantity: 5,
      operator: '张三',
      scanTime: '2024-01-30 14:30:25',
      remarks: '新采购入库',
      batchNo: 'B20240130001',
    },
    {
      id: '2',
      itemCode: 'OF002',
      itemName: '办公椅',
      specification: '人体工学设计，可调节高度',
      unit: '把',
      warehouse: '主仓库',
      location: 'B区-02',
      operationType: 'out',
      operationTypeText: '出库',
      quantity: 2,
      operator: '李四',
      scanTime: '2024-01-30 10:15:30',
      remarks: '部门领用',
    },
    {
      id: '3',
      itemCode: 'ST001',
      itemName: '文件柜',
      specification: '四抽屉钢制文件柜',
      unit: '个',
      warehouse: '主仓库',
      location: 'B区-03',
      operationType: 'transfer',
      operationTypeText: '调拨',
      quantity: 3,
      operator: '王五',
      scanTime: '2024-01-29 16:45:10',
      remarks: '调拨到分仓库',
    },
    {
      id: '4',
      itemCode: 'FD001',
      itemName: '食品原料A',
      specification: '有机食品原料',
      unit: 'kg',
      warehouse: '冷藏仓库',
      location: 'C区-01',
      operationType: 'check',
      operationTypeText: '盘点',
      quantity: 50,
      operator: '赵六',
      scanTime: '2024-01-29 09:20:15',
      remarks: '月度盘点',
      batchNo: 'B20240115001',
      expiryDate: '2024-02-15',
    },
  ];

  // 模拟库存信息
  const mockStockInfo: StockInfo = {
    itemCode: 'IT001',
    itemName: '台式电脑',
    specification: 'Intel i5, 8GB内存, 256GB SSD',
    unit: '台',
    warehouse: '主仓库',
    location: 'A区-01',
    currentStock: 15,
    safetyStock: 5,
    unitPrice: 3800,
    totalValue: 57000,
    lastInDate: '2024-01-30',
    lastOutDate: '2024-01-28',
    supplier: '联想科技',
  };

  useEffect(() => {
    setScanRecords(mockScanRecords);
  }, []);

  // 模拟扫码功能
  const handleScan = () => {
    setIsScanModalVisible(true);
  };

  // 模拟扫码结果
  const simulateScan = () => {
    const codes = ['IT001', 'OF002', 'ST001', 'FD001'];
    const randomCode = codes[Math.floor(Math.random() * codes.length)];
    setScannedCode(randomCode);
    setIsScanModalVisible(false);
    
    // 获取库存信息
    setStockInfo(mockStockInfo);
    setIsStockModalVisible(true);
    
    message.success(`扫码成功：${randomCode}`);
  };

  // 选择操作类型
  const handleSelectOperation = (operation: string) => {
    setSelectedOperation(operation);
    setIsStockModalVisible(false);
    setIsOperationModalVisible(true);
    form.setFieldsValue({
      itemCode: stockInfo?.itemCode,
      itemName: stockInfo?.itemName,
      warehouse: stockInfo?.warehouse,
      location: stockInfo?.location,
      operationType: operation,
    });
  };

  // 提交操作
  const handleSubmitOperation = async () => {
    try {
      const values = await form.validateFields();
      
      const newRecord: ScanRecord = {
        id: Date.now().toString(),
        itemCode: values.itemCode,
        itemName: stockInfo?.itemName || '',
        specification: stockInfo?.specification || '',
        unit: stockInfo?.unit || '',
        warehouse: values.warehouse,
        location: values.location,
        operationType: values.operationType,
        operationTypeText: getOperationTypeText(values.operationType),
        quantity: values.quantity,
        operator: '当前用户',
        scanTime: new Date().toLocaleString(),
        remarks: values.remarks || '',
        batchNo: values.batchNo,
        expiryDate: values.expiryDate,
      };

      setScanRecords([newRecord, ...scanRecords]);
      setIsOperationModalVisible(false);
      form.resetFields();
      message.success('操作记录已保存');
    } catch (error) {
      console.error('提交失败:', error);
    }
  };

  const getOperationTypeText = (type: string) => {
    const types = {
      in: '入库',
      out: '出库',
      transfer: '调拨',
      check: '盘点',
    };
    return types[type as keyof typeof types] || type;
  };

  const getOperationTypeColor = (type: string) => {
    const colors = {
      in: 'success',
      out: 'warning',
      transfer: 'processing',
      check: 'default',
    };
    return colors[type as keyof typeof colors] || 'default';
  };

  const getOperationIcon = (type: string) => {
    const icons = {
      in: <PlusOutlined />,
      out: <MinusOutlined />,
      transfer: <SwapOutlined />,
      check: <EyeOutlined />,
    };
    return icons[type as keyof typeof icons] || null;
  };

  // 查看历史记录
  const handleViewHistory = () => {
    setIsHistoryModalVisible(true);
  };

  // 生成二维码
  const handleGenerateQRCode = () => {
    setIsQRCodeModalVisible(true);
  };

  return (
    <div className="p-4" style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      {/* 功能按钮区域 */}
      <Row gutter={[16, 16]} className="mb-4">
        <Col span={12}>
          <Card className="text-center" style={{ height: '120px' }}>
            <Button
              type="primary"
              size="large"
              icon={<ScanOutlined />}
              onClick={handleScan}
              style={{ width: '100%', height: '60px', fontSize: '16px' }}
            >
              扫码操作
            </Button>
          </Card>
        </Col>
        <Col span={12}>
          <Card className="text-center" style={{ height: '120px' }}>
            <Button
              size="large"
              icon={<QrcodeOutlined />}
              onClick={handleGenerateQRCode}
              style={{ width: '100%', height: '60px', fontSize: '16px' }}
            >
              生成二维码
            </Button>
          </Card>
        </Col>
        <Col span={12}>
          <Card className="text-center" style={{ height: '120px' }}>
            <Button
              size="large"
              icon={<HistoryOutlined />}
              onClick={handleViewHistory}
              style={{ width: '100%', height: '60px', fontSize: '16px' }}
            >
              操作历史
            </Button>
          </Card>
        </Col>
        <Col span={12}>
          <Card className="text-center" style={{ height: '120px' }}>
            <Button
              size="large"
              icon={<SearchOutlined />}
              style={{ width: '100%', height: '60px', fontSize: '16px' }}
            >
              库存查询
            </Button>
          </Card>
        </Col>
      </Row>

      {/* 最近操作记录 */}
      <Card title="最近操作记录" className="mb-4">
        <List
          dataSource={scanRecords.slice(0, 5)}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Avatar 
                    icon={getOperationIcon(item.operationType)} 
                    style={{ 
                      backgroundColor: getOperationTypeColor(item.operationType) === 'success' ? '#52c41a' :
                                       getOperationTypeColor(item.operationType) === 'warning' ? '#faad14' :
                                       getOperationTypeColor(item.operationType) === 'processing' ? '#1890ff' : '#d9d9d9'
                    }}
                  />
                }
                title={
                  <div>
                    <span>{item.itemName}</span>
                    <Tag color={getOperationTypeColor(item.operationType)} style={{ marginLeft: 8 }}>
                      {item.operationTypeText}
                    </Tag>
                  </div>
                }
                description={
                  <div>
                    <div>数量：{item.quantity} {item.unit} | 操作人：{item.operator}</div>
                    <div style={{ color: '#999', fontSize: '12px' }}>{item.scanTime}</div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      {/* 扫码模态框 */}
      <Modal
        title="扫码识别"
        open={isScanModalVisible}
        onCancel={() => setIsScanModalVisible(false)}
        footer={null}
        width={400}
      >
        <div className="text-center" style={{ padding: '40px 0' }}>
          <div style={{ 
            width: '200px', 
            height: '200px', 
            border: '2px dashed #1890ff', 
            margin: '0 auto 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px'
          }}>
            <CameraOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
          </div>
          <p style={{ marginBottom: '20px' }}>请将二维码对准扫描框</p>
          <Button type="primary" onClick={simulateScan}>
            模拟扫码
          </Button>
        </div>
      </Modal>

      {/* 库存信息模态框 */}
      <Modal
        title="库存信息"
        open={isStockModalVisible}
        onCancel={() => setIsStockModalVisible(false)}
        footer={null}
        width={400}
      >
        {stockInfo && (
          <div>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="物料编码">{stockInfo.itemCode}</Descriptions.Item>
              <Descriptions.Item label="物料名称">{stockInfo.itemName}</Descriptions.Item>
              <Descriptions.Item label="规格型号">{stockInfo.specification}</Descriptions.Item>
              <Descriptions.Item label="当前库存">
                <span style={{ color: '#1890ff', fontWeight: 'bold', fontSize: '16px' }}>
                  {stockInfo.currentStock} {stockInfo.unit}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="仓库位置">{stockInfo.warehouse} - {stockInfo.location}</Descriptions.Item>
              <Descriptions.Item label="单价">¥{stockInfo.unitPrice}</Descriptions.Item>
              <Descriptions.Item label="库存金额">¥{stockInfo.totalValue.toLocaleString()}</Descriptions.Item>
            </Descriptions>
            
            <Divider />
            
            <div style={{ textAlign: 'center' }}>
              <p style={{ marginBottom: '16px', fontWeight: 'bold' }}>请选择操作类型：</p>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={() => handleSelectOperation('in')}
                  style={{ width: '100%' }}
                >
                  入库
                </Button>
                <Button 
                  icon={<MinusOutlined />} 
                  onClick={() => handleSelectOperation('out')}
                  style={{ width: '100%' }}
                >
                  出库
                </Button>
                <Button 
                  icon={<SwapOutlined />} 
                  onClick={() => handleSelectOperation('transfer')}
                  style={{ width: '100%' }}
                >
                  调拨
                </Button>
                <Button 
                  icon={<EyeOutlined />} 
                  onClick={() => handleSelectOperation('check')}
                  style={{ width: '100%' }}
                >
                  盘点
                </Button>
              </Space>
            </div>
          </div>
        )}
      </Modal>

      {/* 操作表单模态框 */}
      <Modal
        title={`${getOperationTypeText(selectedOperation)}操作`}
        open={isOperationModalVisible}
        onOk={handleSubmitOperation}
        onCancel={() => setIsOperationModalVisible(false)}
        width={400}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="itemCode" label="物料编码">
            <Input disabled />
          </Form.Item>
          <Form.Item name="itemName" label="物料名称">
            <Input disabled />
          </Form.Item>
          <Form.Item name="warehouse" label="仓库">
            <Select>
              <Option value="主仓库">主仓库</Option>
              <Option value="分仓库">分仓库</Option>
              <Option value="冷藏仓库">冷藏仓库</Option>
            </Select>
          </Form.Item>
          <Form.Item name="location" label="库位">
            <Input placeholder="请输入库位" />
          </Form.Item>
          <Form.Item 
            name="quantity" 
            label="数量" 
            rules={[{ required: true, message: '请输入数量' }]}
          >
            <Input type="number" placeholder="请输入数量" />
          </Form.Item>
          {(selectedOperation === 'in' || selectedOperation === 'check') && (
            <Form.Item name="batchNo" label="批次号">
              <Input placeholder="请输入批次号" />
            </Form.Item>
          )}
          {selectedOperation === 'in' && (
            <Form.Item name="expiryDate" label="过期日期">
              <Input type="date" />
            </Form.Item>
          )}
          <Form.Item name="remarks" label="备注">
            <TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 历史记录模态框 */}
      <Modal
        title="操作历史"
        open={isHistoryModalVisible}
        onCancel={() => setIsHistoryModalVisible(false)}
        footer={null}
        width={600}
      >
        <List
          dataSource={scanRecords}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Avatar 
                    icon={getOperationIcon(item.operationType)} 
                    style={{ 
                      backgroundColor: getOperationTypeColor(item.operationType) === 'success' ? '#52c41a' :
                                       getOperationTypeColor(item.operationType) === 'warning' ? '#faad14' :
                                       getOperationTypeColor(item.operationType) === 'processing' ? '#1890ff' : '#d9d9d9'
                    }}
                  />
                }
                title={
                  <div>
                    <span>{item.itemName}</span>
                    <Tag color={getOperationTypeColor(item.operationType)} style={{ marginLeft: 8 }}>
                      {item.operationTypeText}
                    </Tag>
                  </div>
                }
                description={
                  <div>
                    <div>编码：{item.itemCode} | 数量：{item.quantity} {item.unit}</div>
                    <div>位置：{item.warehouse} - {item.location}</div>
                    <div>操作人：{item.operator} | 时间：{item.scanTime}</div>
                    {item.remarks && <div>备注：{item.remarks}</div>}
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Modal>

      {/* 二维码生成模态框 */}
      <Modal
        title="生成二维码"
        open={isQRCodeModalVisible}
        onCancel={() => setIsQRCodeModalVisible(false)}
        footer={null}
        width={400}
      >
        <div className="text-center">
          <Form layout="vertical">
            <Form.Item label="物料编码">
              <Input placeholder="请输入物料编码" />
            </Form.Item>
          </Form>
          <div style={{ marginTop: '20px' }}>
            <QRCode value="IT001" size={200} />
          </div>
          <p style={{ marginTop: '16px', color: '#666' }}>
            扫描此二维码可快速查看物料信息
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default MobileScan;