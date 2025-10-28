import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Modal, Form, Input, Select, DatePicker, Space, Tag, message, Descriptions, Row, Col, Statistic, Typography, Divider, InputNumber } from 'antd';
import { EyeOutlined, CheckOutlined, InboxOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

import { DeliveryNote } from '../../types/procurement';
import { useLocation } from 'react-router-dom';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { Text, Title } = Typography;

const DeliveryNotes: React.FC = () => {
  const location = useLocation();
  const [data, setData] = useState<DeliveryNote[]>([]);
  const [filteredData, setFilteredData] = useState<DeliveryNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isReceiveModalVisible, setIsReceiveModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DeliveryNote | null>(null);
  const [receiveForm] = Form.useForm();
  const [filterForm] = Form.useForm();

  const [itemReceiveQuantities, setItemReceiveQuantities] = useState<Record<string, number>>({});
  const [itemReceiveStatus, setItemReceiveStatus] = useState<Record<string, 'pending' | 'received' | 'rejected' | undefined>>({});

  // 模拟到货单数据
  const mockData: DeliveryNote[] = [
    {
      id: '1',
      deliveryNo: 'DN202401001',
      purchaseOrderNo: 'PO202401001',
      purchaseOrderId: 'po_001',
      supplierName: '北京科技有限公司',
      supplierId: 'supplier_001',
      supplierContact: '张经理',
      supplierPhone: '13800138001',
      deliveryDate: '2024-01-25',
      receivedDate: '2024-01-25',
      receiver: '李收货',
      department: '采购部',
      status: 'completed',
      statusText: '已完成',
      totalAmount: 45800,
      qualityCheckRequired: true,
      qualityCheckStatus: 'passed',
      items: [
        {
          id: '1',
          itemName: '台式电脑',
          specification: 'Intel i5-12400F 16GB内存 512GB SSD',
          unit: '台',
          orderedQuantity: 5,
          deliveredQuantity: 5,
          receivedQuantity: 5,
          unitPrice: 3800,
          totalPrice: 19000,
          remarks: '设备完好',
          batchNo: 'B20240125001'
        },
        {
          id: '2',
          itemName: '激光打印机',
          specification: 'HP LaserJet Pro M404dn',
          unit: '台',
          orderedQuantity: 2,
          deliveredQuantity: 2,
          receivedQuantity: 2,
          unitPrice: 2000,
          totalPrice: 4000,
          remarks: '包装完整',
          batchNo: 'B20240125002'
        },
        {
          id: '3',
          itemName: '办公椅',
          specification: '人体工学办公椅',
          unit: '把',
          orderedQuantity: 10,
          deliveredQuantity: 10,
          receivedQuantity: 10,
          unitPrice: 500,
          totalPrice: 5000,
          remarks: '质量良好',
          batchNo: 'B20240125003'
        },
        {
          id: '4',
          itemName: '显示器',
          specification: '27英寸 4K IPS显示器',
          unit: '台',
          orderedQuantity: 8,
          deliveredQuantity: 8,
          receivedQuantity: 8,
          unitPrice: 1200,
          totalPrice: 9600,
          remarks: '显示效果良好',
          batchNo: 'B20240125004'
        },
        {
          id: '5',
          itemName: '键盘鼠标套装',
          specification: '无线机械键盘+光电鼠标',
          unit: '套',
          orderedQuantity: 15,
          deliveredQuantity: 15,
          receivedQuantity: 15,
          unitPrice: 280,
          totalPrice: 4200,
          remarks: '手感良好',
          batchNo: 'B20240125005'
        },
        {
          id: '6',
          itemName: '文件柜',
          specification: '四抽屉钢制文件柜',
          unit: '个',
          orderedQuantity: 6,
          deliveredQuantity: 6,
          receivedQuantity: 6,
          unitPrice: 680,
          totalPrice: 4080,
          remarks: '结构牢固',
          batchNo: 'B20240125006'
        }
      ],
      attachments: ['delivery_receipt.pdf'],
      remarks: '货物完好，按时到达',
      transportInfo: {
        carrier: '顺丰速运',
        trackingNo: 'SF1234567890',
        vehicleNo: '京A12345',
        driverName: '王师傅',
        driverPhone: '13900139001',
        estimatedArrival: '2024-01-25 10:00',
        actualArrival: '2024-01-25 09:45'
      }
    },
    {
      id: '2',
      deliveryNo: 'DN202401002',
      purchaseOrderNo: 'PO2024005',
      purchaseOrderId: 'po_002',
      supplierName: '上海设备制造厂',
      supplierId: 'supplier_002',
      supplierContact: '陈总',
      supplierPhone: '13800138002',
      deliveryDate: '2024-01-28',
      status: 'pending',
      statusText: '待接收',
      totalAmount: 1229000,
      qualityCheckRequired: true,
      items: [
        {
          id: '4',
          itemName: '数控机床',
          specification: 'CNC加工中心',
          unit: '台',
          orderedQuantity: 1,
          deliveredQuantity: 1,
          receivedQuantity: 0,
          unitPrice: 480000,
          totalPrice: 480000,
          remarks: '大型设备，需专业安装',
          batchNo: 'B20240128001'
        },
        {
          id: '7',
          itemName: '工业机器人',
          specification: '六轴工业机器人 负载20kg',
          unit: '台',
          orderedQuantity: 2,
          deliveredQuantity: 2,
          receivedQuantity: 0,
          unitPrice: 180000,
          totalPrice: 360000,
          remarks: '需要专业调试',
          batchNo: 'B20240128002'
        },
        {
          id: '8',
          itemName: '激光切割机',
          specification: '光纤激光切割机 3000W',
          unit: '台',
          orderedQuantity: 1,
          deliveredQuantity: 1,
          receivedQuantity: 0,
          unitPrice: 320000,
          totalPrice: 320000,
          remarks: '需要专业安装和调试',
          batchNo: 'B20240128003'
        },
        {
          id: '9',
          itemName: '空压机',
          specification: '螺杆式空压机 15kW',
          unit: '台',
          orderedQuantity: 1,
          deliveredQuantity: 1,
          receivedQuantity: 0,
          unitPrice: 45000,
          totalPrice: 45000,
          remarks: '配套设备',
          batchNo: 'B20240128004'
        },
        {
          id: '10',
          itemName: '工具柜',
          specification: '重型工具柜 12抽屉',
          unit: '个',
          orderedQuantity: 3,
          deliveredQuantity: 3,
          receivedQuantity: 0,
          unitPrice: 8000,
          totalPrice: 24000,
          remarks: '车间配套设施',
          batchNo: 'B20240128005'
        }
      ],
      attachments: ['delivery_notice.pdf'],
      remarks: '大型设备运输，需要吊装',
      transportInfo: {
        carrier: '专业设备运输公司',
        trackingNo: 'EQ2024012801',
        vehicleNo: '沪B98765',
        driverName: '刘师傅',
        driverPhone: '13900139002',
        estimatedArrival: '2024-01-28 14:00'
      }
    },
    {
      id: '3',
      deliveryNo: 'DN202401003',
      purchaseOrderNo: 'PO202401003',
      purchaseOrderId: 'po_003',
      supplierName: '广州电子科技',
      supplierId: 'supplier_003',
      supplierContact: '黄经理',
      supplierPhone: '13800138003',
      deliveryDate: '2024-01-30',
      status: 'partial',
      statusText: '部分接收',
      totalAmount: 58500,
      qualityCheckRequired: false,
      items: [
        {
          id: '5',
          itemName: '监控摄像头',
          specification: '4K高清网络摄像头',
          unit: '个',
          orderedQuantity: 20,
          deliveredQuantity: 15,
          receivedQuantity: 15,
          unitPrice: 800,
          totalPrice: 12000,
          remarks: '部分货物延期',
          batchNo: 'B20240130001'
        },
        {
          id: '6',
          itemName: '网络交换机',
          specification: '24口千兆交换机',
          unit: '台',
          orderedQuantity: 5,
          deliveredQuantity: 0,
          receivedQuantity: 0,
          unitPrice: 1200,
          totalPrice: 6000,
          remarks: '货物延期，预计下周到达'
        },
        {
          id: '11',
          itemName: '无线路由器',
          specification: 'WiFi6 企业级路由器',
          unit: '台',
          orderedQuantity: 8,
          deliveredQuantity: 8,
          receivedQuantity: 8,
          unitPrice: 1500,
          totalPrice: 12000,
          remarks: '已完成接收',
          batchNo: 'B20240130002'
        },
        {
          id: '12',
          itemName: '网线',
          specification: '超六类网线 305米/箱',
          unit: '箱',
          orderedQuantity: 10,
          deliveredQuantity: 10,
          receivedQuantity: 10,
          unitPrice: 800,
          totalPrice: 8000,
          remarks: '已完成接收',
          batchNo: 'B20240130003'
        },
        {
          id: '13',
          itemName: '服务器机柜',
          specification: '42U标准机柜',
          unit: '台',
          orderedQuantity: 2,
          deliveredQuantity: 2,
          receivedQuantity: 2,
          unitPrice: 3500,
          totalPrice: 7000,
          remarks: '已完成接收',
          batchNo: 'B20240130004'
        },
        {
          id: '14',
          itemName: 'UPS电源',
          specification: '3000VA在线式UPS',
          unit: '台',
          orderedQuantity: 3,
          deliveredQuantity: 3,
          receivedQuantity: 3,
          unitPrice: 4500,
          totalPrice: 13500,
          remarks: '已完成接收',
          batchNo: 'B20240130005'
        }
      ],
      attachments: ['partial_delivery.pdf'],
      remarks: '部分货物因供应商库存不足延期交货',
      transportInfo: {
        carrier: '中通快递',
        trackingNo: 'ZT2024013001',
        vehicleNo: '粤A54321',
        driverName: '陈师傅',
        driverPhone: '13900139003',
        estimatedArrival: '2024-01-30 16:00',
        actualArrival: '2024-01-30 15:30'
      }
    }
  ];

  useEffect(() => {
    setLoading(true);
    // 模拟API调用
    setTimeout(() => {
      setData(mockData);
      
      // 检查URL参数中是否有orderNumber
      const searchParams = new URLSearchParams(location.search);
      const orderNumber = searchParams.get('orderNumber');
      
      if (orderNumber) {
        // 根据采购订单号过滤到货单数据
        const filtered = mockData.filter(item => item.purchaseOrderNo === orderNumber);
        setFilteredData(filtered);
        
        // 如果找到对应的到货单，显示提示信息
        if (filtered.length > 0) {
          message.success(`已为您筛选出采购订单 ${orderNumber} 的 ${filtered.length} 条到货单记录`);
        } else {
          message.info(`未找到采购订单 ${orderNumber} 对应的到货单记录`);
        }
      } else {
        setFilteredData(mockData);
      }
      
      setLoading(false);
    }, 1000);
  }, [location.search]);

  // 状态颜色映射
  const getStatusColor = (status: string) => {
    const colorMap = {
      pending: 'orange',
      received: 'blue',
      partial: 'yellow',
      completed: 'green',
      rejected: 'red'
    };
    return colorMap[status as keyof typeof colorMap] || 'default';
  };



  // 表格列定义
  const columns: ColumnsType<DeliveryNote> = [
    {
      title: '序号',
      key: 'index',
      width: 60,
      fixed: 'left',
      render: (_, __, index) => index + 1,
    },
    {
      title: '到货单号',
      dataIndex: 'deliveryNo',
      key: 'deliveryNo',
      width: 120,
      fixed: 'left'
    },
    {
      title: '采购订单号',
      dataIndex: 'purchaseOrderNo',
      key: 'purchaseOrderNo',
      width: 120
    },
    {
      title: '供应商',
      dataIndex: 'supplierName',
      key: 'supplierName',
      width: 150
    },
    {
      title: '到货日期',
      dataIndex: 'deliveryDate',
      key: 'deliveryDate',
      width: 100,
      render: (date: string) => date || '-'
    },
    {
      title: '接收日期',
      dataIndex: 'receivedDate',
      key: 'receivedDate',
      width: 100,
      render: (date: string) => date || '-'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string, record: DeliveryNote) => (
        <Tag color={getStatusColor(status)}>{record.statusText}</Tag>
      )
    },
    {
      title: '总金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      render: (amount: number) => `¥${amount.toLocaleString()}`
    },
    {
      title: '接收人',
      dataIndex: 'receiver',
      key: 'receiver',
      width: 100,
      render: (receiver: string) => receiver || '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record: DeliveryNote) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          >
            详情
          </Button>
          {record.status === 'pending' && (
            <Button
              type="link"
              icon={<CheckOutlined />}
              onClick={() => handleReceive(record)}
            >
              接收
            </Button>
          )}
          {record.status === 'received' && (
            <Button
              type="link"
              onClick={() => handleCreateReceiving(record)}
            >
              入库
            </Button>
          )}
        </Space>
      )
    }
  ];

  // 查看详情
  const handleViewDetails = (record: DeliveryNote) => {
    setSelectedRecord(record);
    setIsDetailModalVisible(true);
  };

  // 接收货物
  const handleReceive = (record: DeliveryNote) => {
    setSelectedRecord(record);
    
    // 获取当前登录用户
    const currentUser = localStorage.getItem('username') || '管理员';
    
    receiveForm.setFieldsValue({
      deliveryNo: record.deliveryNo,
      receivedDate: dayjs(),
      receiver: currentUser,
      department: '采购部'
    });
    
    // 初始化货物接收状态和数量
    const initialQuantities: Record<string, number> = {};
    const initialStatus: Record<string, 'pending' | 'received' | 'rejected' | undefined> = {};
    
    record.items?.forEach(item => {
      initialQuantities[item.id] = item.deliveredQuantity || 0;
      initialStatus[item.id] = undefined;
    });
    
    setItemReceiveQuantities(initialQuantities);
    setItemReceiveStatus(initialStatus);
    setIsReceiveModalVisible(true);
  };

  // 创建入库单
  const handleCreateReceiving = (record: DeliveryNote) => {
    Modal.confirm({
      title: '创建入库单',
      content: `确认为到货单 ${record.deliveryNo} 创建入库单吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        message.success('入库单创建成功，请前往入库管理页面处理');
        // 这里可以跳转到入库页面或者调用API创建入库单
      }
    });
  };

  // 直接进入入库操作
  const handleDirectWarehouseEntry = (record: DeliveryNote) => {
    // 创建入库单数据
    const warehouseReceivingData = {
      id: `WR${Date.now()}`,
      deliveryNo: record.deliveryNo,
      purchaseOrderNo: record.purchaseOrderNo,
      supplierName: record.supplierName,
      receivedDate: record.receivedDate,
      receiver: record.receiver,
      department: record.department,
      status: 'pending',
      statusText: '待入库',
      items: record.items?.filter(item => itemReceiveStatus[item.id] === 'received').map(item => ({
        id: item.id,
        itemName: item.itemName,
        specification: item.specification,
        unit: item.unit,
        receivedQuantity: item.receivedQuantity || 0,
        unitPrice: item.unitPrice,
        totalAmount: (item.receivedQuantity || 0) * item.unitPrice,
        warehouseId: '', // 待选择
        warehouseName: '', // 待选择
      })) || []
    };

    // 模拟保存入库单到本地存储或状态管理
    const existingReceivingData = JSON.parse(localStorage.getItem('warehouseReceivingData') || '[]');
    existingReceivingData.push(warehouseReceivingData);
    localStorage.setItem('warehouseReceivingData', JSON.stringify(existingReceivingData));

    message.success('入库单创建成功，正在跳转到入库管理页面...');
    
    // 这里可以使用路由跳转到入库管理页面
    // 例如：navigate('/procurement/warehouse-receiving');
    // 或者触发父组件的回调来切换页面
    setTimeout(() => {
      message.info('请在左侧菜单中选择"入库管理"页面进行入库操作');
    }, 1000);
  };

  // 确认接收
  const handleReceiveConfirm = () => {
    receiveForm.validateFields().then(values => {
      if (selectedRecord) {
        // 验证所有货物是否都已处理
        const unprocessedItems = selectedRecord.items?.filter(item => 
          itemReceiveStatus[item.id] === 'pending'
        );

        if (unprocessedItems && unprocessedItems.length > 0) {
          message.warning('请先处理所有货物的接收状态');
          return;
        }

        // 检查已接收货物的数量
        const receivedItems = selectedRecord.items?.filter(item => 
          itemReceiveStatus[item.id] === 'received'
        );

        if (!receivedItems || receivedItems.length === 0) {
          message.warning('至少需要接收一个货物');
          return;
        }

        // 更新货物明细，包含实收数量和接收状态
        const updatedItems = selectedRecord.items?.map(item => ({
          ...item,
          receivedQuantity: itemReceiveStatus[item.id] === 'received' ? itemReceiveQuantities[item.id] : item.receivedQuantity
        }));

        const updatedRecord = {
          ...selectedRecord,
          status: 'received' as const,
          statusText: '已接收',
          receivedDate: values.receivedDate.format('YYYY-MM-DD'),
          receiver: values.receiver,
          department: values.department,
          remarks: values.remarks,
          items: updatedItems
        };

        const updatedData = data.map(item => 
          item.id === selectedRecord.id ? updatedRecord : item
        );
        setData(updatedData);
        setFilteredData(updatedData);
        
        message.success('货物接收成功');
        setIsReceiveModalVisible(false);

        // 询问是否直接进入入库操作
        Modal.confirm({
          title: '接收完成',
          content: '货物接收成功！是否立即创建入库单并进入入库操作？',
          okText: '立即入库',
          cancelText: '稍后处理',
          onOk: () => {
            handleDirectWarehouseEntry(updatedRecord);
          }
        });
      }
    }).catch(errorInfo => {
      console.log('验证失败:', errorInfo);
    });
  };

  // 筛选功能
  const handleFilter = () => {
    filterForm.validateFields().then(values => {
      let filtered = [...data];
      
      // 到货单号筛选
      if (values.deliveryNo) {
        filtered = filtered.filter(item => 
          item.deliveryNo.toLowerCase().includes(values.deliveryNo.toLowerCase())
        );
      }
      
      // 采购订单号筛选
      if (values.purchaseOrderNo) {
        filtered = filtered.filter(item => 
          item.purchaseOrderNo.toLowerCase().includes(values.purchaseOrderNo.toLowerCase())
        );
      }
      
      // 供应商筛选
      if (values.supplierName) {
        filtered = filtered.filter(item => 
          item.supplierName.toLowerCase().includes(values.supplierName.toLowerCase())
        );
      }
      
      // 联系人筛选
      if (values.supplierContact) {
        filtered = filtered.filter(item => 
          item.supplierContact?.toLowerCase().includes(values.supplierContact.toLowerCase())
        );
      }
      
      // 联系电话筛选
      if (values.supplierPhone) {
        filtered = filtered.filter(item => 
          item.supplierPhone?.includes(values.supplierPhone)
        );
      }
      
      // 接收人筛选
      if (values.receiver) {
        filtered = filtered.filter(item => 
          item.receiver?.toLowerCase().includes(values.receiver.toLowerCase())
        );
      }
      
      // 部门筛选
      if (values.department) {
        filtered = filtered.filter(item => 
          item.department?.toLowerCase().includes(values.department.toLowerCase())
        );
      }
      
      // 状态筛选
      if (values.status) {
        filtered = filtered.filter(item => item.status === values.status);
      }
      
      // 到货日期范围筛选
      if (values.deliveryDateRange && values.deliveryDateRange.length === 2) {
        const [startDate, endDate] = values.deliveryDateRange;
        filtered = filtered.filter(item => {
          const itemDate = dayjs(item.deliveryDate);
          return itemDate.isAfter(startDate.startOf('day')) && itemDate.isBefore(endDate.endOf('day'));
        });
      }
      
      // 接收日期范围筛选
      if (values.receivedDateRange && values.receivedDateRange.length === 2) {
        const [startDate, endDate] = values.receivedDateRange;
        filtered = filtered.filter(item => {
          if (!item.receivedDate) return false;
          const itemDate = dayjs(item.receivedDate);
          return itemDate.isAfter(startDate.startOf('day')) && itemDate.isBefore(endDate.endOf('day'));
        });
      }
      
      // 总金额范围筛选
      if (values.totalAmountRange && (values.totalAmountRange[0] || values.totalAmountRange[1])) {
        const [minAmount, maxAmount] = values.totalAmountRange;
        filtered = filtered.filter(item => {
          if (minAmount && item.totalAmount < minAmount) return false;
          if (maxAmount && item.totalAmount > maxAmount) return false;
          return true;
        });
      }
      
      // 承运商筛选
      if (values.carrier) {
        filtered = filtered.filter(item => 
          item.transportInfo?.carrier?.toLowerCase().includes(values.carrier.toLowerCase())
        );
      }
      
      // 运单号筛选
      if (values.trackingNo) {
        filtered = filtered.filter(item => 
          item.transportInfo?.trackingNo?.toLowerCase().includes(values.trackingNo.toLowerCase())
        );
      }
      
      // 备注筛选
      if (values.remarks) {
        filtered = filtered.filter(item => 
          item.remarks?.toLowerCase().includes(values.remarks.toLowerCase())
        );
      }
      
      setFilteredData(filtered);
    });
  };

  // 重置筛选
  const handleResetFilter = () => {
    filterForm.resetFields();
    setFilteredData(data);
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Title level={4}>到货单管理</Title>
          <Text type="secondary">管理和跟踪所有到货单，支持货物接收和入库处理</Text>
        </div>

        {/* 统计信息 */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Statistic
              title="总到货单数"
              value={data.length}
              prefix={<InboxOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="待接收"
              value={data.filter(item => item.status === 'pending').length}
              valueStyle={{ color: '#faad14' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="已完成"
              value={data.filter(item => item.status === 'completed').length}
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="总金额"
              value={data.reduce((sum, item) => sum + item.totalAmount, 0)}
              precision={0}
              prefix="¥"
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
        </Row>

        <Divider />

        {/* 筛选表单 */}
        <Card size="small" style={{ marginBottom: 16 }}>
          <Form form={filterForm} layout="inline">
            <Row gutter={[16, 16]} style={{ width: '100%' }}>
              <Col span={6}>
                <Form.Item name="deliveryNo" label="到货单号">
                  <Input placeholder="请输入到货单号" allowClear />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="purchaseOrderNo" label="采购订单号">
                  <Input placeholder="请输入采购订单号" allowClear />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="supplierName" label="供应商">
                  <Input placeholder="请输入供应商名称" allowClear />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="supplierContact" label="联系人">
                  <Input placeholder="请输入联系人" allowClear />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="supplierPhone" label="联系电话">
                  <Input placeholder="请输入联系电话" allowClear />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="receiver" label="接收人">
                  <Input placeholder="请输入接收人" allowClear />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="department" label="部门">
                  <Input placeholder="请输入部门" allowClear />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="status" label="状态">
                  <Select placeholder="请选择状态" allowClear>
                    <Option value="pending">待接收</Option>
                    <Option value="received">已接收</Option>
                    <Option value="partial">部分接收</Option>
                    <Option value="completed">已完成</Option>
                    <Option value="rejected">已拒绝</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="deliveryDateRange" label="到货日期">
                  <DatePicker.RangePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="receivedDateRange" label="接收日期">
                  <DatePicker.RangePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="总金额范围">
            <Space.Compact>
                    <Form.Item name={['totalAmountRange', 0]} noStyle>
                      <InputNumber placeholder="最小金额" style={{ width: '50%' }} min={0} />
                    </Form.Item>
                    <Form.Item name={['totalAmountRange', 1]} noStyle>
                      <InputNumber placeholder="最大金额" style={{ width: '50%' }} min={0} />
                    </Form.Item>
            </Space.Compact>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="carrier" label="承运商">
                  <Input placeholder="请输入承运商" allowClear />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="trackingNo" label="运单号">
                  <Input placeholder="请输入运单号" allowClear />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="remarks" label="备注">
                  <Input placeholder="请输入备注关键词" allowClear />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Space>
                  <Button type="primary" icon={<SearchOutlined />} onClick={handleFilter}>
                    查询
                  </Button>
                  <Button onClick={handleResetFilter} icon={<ReloadOutlined />}>
                    重置
                  </Button>
                </Space>
              </Col>
            </Row>
          </Form>
        </Card>

        {/* 数据表格 */}
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

      {/* 详情模态框 */}
      <Modal
        title="到货单详情"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={1350}
      >
        {selectedRecord && (
          <div>
            <Descriptions title="基本信息" bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="到货单号">{selectedRecord.deliveryNo}</Descriptions.Item>
              <Descriptions.Item label="采购订单号">{selectedRecord.purchaseOrderNo}</Descriptions.Item>
              <Descriptions.Item label="采购订单ID">{selectedRecord.purchaseOrderId || '未关联'}</Descriptions.Item>
              <Descriptions.Item label="供应商">{selectedRecord.supplierName}</Descriptions.Item>
              <Descriptions.Item label="供应商ID">{selectedRecord.supplierId || '未关联'}</Descriptions.Item>
              <Descriptions.Item label="联系人">{selectedRecord.supplierContact}</Descriptions.Item>
              <Descriptions.Item label="联系电话">{selectedRecord.supplierPhone}</Descriptions.Item>
              <Descriptions.Item label="到货日期">{selectedRecord.deliveryDate}</Descriptions.Item>
              <Descriptions.Item label="接收日期">{selectedRecord.receivedDate || '未接收'}</Descriptions.Item>
              <Descriptions.Item label="接收人">{selectedRecord.receiver || '未接收'}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={getStatusColor(selectedRecord.status)}>{selectedRecord.statusText}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="质量检查">
                {selectedRecord.qualityCheckRequired ? (
                  <Tag color={
                    selectedRecord.qualityCheckStatus === 'passed' ? 'success' :
                    selectedRecord.qualityCheckStatus === 'failed' ? 'error' :
                    selectedRecord.qualityCheckStatus === 'waived' ? 'warning' : 'processing'
                  }>
                    {selectedRecord.qualityCheckStatus === 'passed' ? '已通过' :
                     selectedRecord.qualityCheckStatus === 'failed' ? '未通过' :
                     selectedRecord.qualityCheckStatus === 'waived' ? '已免检' : '待检查'}
                  </Tag>
                ) : (
                  <Tag color="default">无需检查</Tag>
                )}
              </Descriptions.Item>
            </Descriptions>

            {selectedRecord.transportInfo && (
              <Descriptions title="运输信息" bordered size="small" style={{ marginBottom: 16 }}>
                <Descriptions.Item label="承运商">{selectedRecord.transportInfo.carrier}</Descriptions.Item>
                <Descriptions.Item label="运单号">{selectedRecord.transportInfo.trackingNo}</Descriptions.Item>
                <Descriptions.Item label="车牌号">{selectedRecord.transportInfo.vehicleNo}</Descriptions.Item>
                <Descriptions.Item label="司机">{selectedRecord.transportInfo.driverName}</Descriptions.Item>
                <Descriptions.Item label="司机电话">{selectedRecord.transportInfo.driverPhone}</Descriptions.Item>
                <Descriptions.Item label="预计到达">{selectedRecord.transportInfo.estimatedArrival}</Descriptions.Item>
                <Descriptions.Item label="实际到达">{selectedRecord.transportInfo.actualArrival || '未到达'}</Descriptions.Item>
              </Descriptions>
            )}

            <Title level={5}>货物明细</Title>
            <Table
              size="small"
              dataSource={selectedRecord.items}
              rowKey="id"
              pagination={false}
              columns={[
                { title: '物品名称', dataIndex: 'itemName', key: 'itemName' },
                { title: '规格', dataIndex: 'specification', key: 'specification' },
                { title: '单位', dataIndex: 'unit', key: 'unit', width: 60 },
                { title: '订购数量', dataIndex: 'orderedQuantity', key: 'orderedQuantity', width: 80 },
                { title: '到货数量', dataIndex: 'deliveredQuantity', key: 'deliveredQuantity', width: 80 },
                { title: '接收数量', dataIndex: 'receivedQuantity', key: 'receivedQuantity', width: 80 },
                { title: '单价', dataIndex: 'unitPrice', key: 'unitPrice', width: 80, render: (price: number) => `¥${price}` },
                { title: '总价', dataIndex: 'totalPrice', key: 'totalPrice', width: 100, render: (price: number) => `¥${price.toLocaleString()}` },
                { title: '批次号', dataIndex: 'batchNo', key: 'batchNo', width: 100 },
                { title: '备注', dataIndex: 'remarks', key: 'remarks' }
              ]}
            />

            {selectedRecord.remarks && (
              <div style={{ marginTop: 16 }}>
                <Text strong>备注：</Text>
                <Text>{selectedRecord.remarks}</Text>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* 接收货物模态框 */}
      <Modal
        title="接收货物"
        open={isReceiveModalVisible}
        onOk={handleReceiveConfirm}
        onCancel={() => setIsReceiveModalVisible(false)}
        width={1300}
        destroyOnHidden
      >
        {selectedRecord && (
          <>
            {/* 基本信息 */}
            <Descriptions title="到货单信息" bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="到货单号">{selectedRecord.deliveryNo}</Descriptions.Item>
              <Descriptions.Item label="采购订单号">{selectedRecord.purchaseOrderNo}</Descriptions.Item>
              <Descriptions.Item label="供应商">{selectedRecord.supplierName}</Descriptions.Item>
              <Descriptions.Item label="到货日期">{selectedRecord.deliveryDate}</Descriptions.Item>
              <Descriptions.Item label="总金额">¥{selectedRecord.totalAmount?.toLocaleString()}</Descriptions.Item>
            </Descriptions>

            {/* 货物明细 */}
            <div style={{ marginBottom: 16 }}>
              <Title level={5}>货物明细</Title>
              <Table
                dataSource={selectedRecord.items}
                pagination={false}
                size="small"
                rowKey="id"
                columns={[
                  {
                    title: '物品名称',
                    dataIndex: 'itemName',
                    key: 'itemName',
                    width: 120,
                  },
                  {
                    title: '规格',
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
                    title: '订购数量',
                    dataIndex: 'orderedQuantity',
                    key: 'orderedQuantity',
                    width: 80,
                    align: 'center',
                  },
                  {
                    title: '单价',
                    dataIndex: 'unitPrice',
                    key: 'unitPrice',
                    width: 80,
                    align: 'right',
                    render: (price: number) => `¥${price.toLocaleString()}`
                  },
                  {
                    title: '总价',
                    dataIndex: 'totalPrice',
                    key: 'totalPrice',
                    width: 100,
                    align: 'right',
                    render: (price: number) => `¥${price.toLocaleString()}`
                  },
                  {
                    title: '批次号',
                    dataIndex: 'batchNo',
                    key: 'batchNo',
                    width: 120,
                  },
                  {
                    title: '实收数量',
                    key: 'receivedQuantity',
                    width: 100,
                    align: 'center',
                    render: (_, record) => (
                      <Input
                        type="number"
                        style={{ width: 80 }}
                        value={itemReceiveQuantities[record.id]}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          setItemReceiveQuantities(prev => ({
                            ...prev,
                            [record.id]: value
                          }));
                        }}
                      />
                    )
                  },
                  {
                    title: '接收状态',
                    key: 'receiveStatus',
                    width: 120,
                    align: 'center',
                    render: (_, record) => (
                      <Select
                        style={{ width: 100 }}
                        placeholder="请选择"
                        value={itemReceiveStatus[record.id]}
                        onChange={(value) => {
                          setItemReceiveStatus(prev => ({
                            ...prev,
                            [record.id]: value
                          }));
                        }}
                      >
                        <Option value="received">接收</Option>
                        <Option value="rejected">拒收</Option>
                      </Select>
                    )
                  },
                  {
                    title: '备注',
                    dataIndex: 'remarks',
                    key: 'remarks',
                    width: 150,
                    render: (text: string, _record: any, index: number) => (
                      <Input
                        placeholder="请输入备注（可选）"
                        defaultValue={text}
                        onChange={(e) => {
                          // 更新对应行的备注数据
                          const newItems = [...selectedRecord.items];
                          newItems[index].remarks = e.target.value;
                          setSelectedRecord({
                            ...selectedRecord,
                            items: newItems
                          });
                        }}
                        size="small"
                      />
                    )
                  }
                ]}
              />
            </div>

            {/* 接收信息表单 */}
            <Form form={receiveForm} layout="vertical">
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="receivedDate"
                    label="接收日期"
                    rules={[{ required: true, message: '请选择接收日期' }]}
                  >
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="receiver"
                    label="接收人"
                    rules={[{ required: true, message: '请输入接收人' }]}
                  >
                    <Input 
                      placeholder="请输入接收人姓名" 
                      readOnly 
                      style={{ 
                        backgroundColor: '#f5f5f5', 
                        color: '#999999',
                        cursor: 'not-allowed'
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="department"
                    label="接收部门"
                    rules={[{ required: true, message: '请输入接收部门' }]}
                  >
                    <Input 
                      placeholder="请输入接收部门" 
                      readOnly 
                      style={{ 
                        backgroundColor: '#f5f5f5', 
                        color: '#999999',
                        cursor: 'not-allowed'
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="remarks" label="接收备注">
                <TextArea rows={3} placeholder="请输入接收备注" />
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </div>
  );
};

export default DeliveryNotes;