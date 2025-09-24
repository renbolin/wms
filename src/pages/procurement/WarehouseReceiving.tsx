import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Modal, Form, Input, Select, DatePicker, Space, Tag, message, Descriptions, Row, Col, Upload, Statistic, Typography } from 'antd';
import { EyeOutlined, CloseOutlined, UploadOutlined, InboxOutlined, SearchOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload/interface';
import { DeliveryNote } from '../../types/procurement';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

// 入库单接口
interface ReceivingRecord {
  id: string;
  receivingNo: string;
  purchaseOrderNo: string;
  supplierName: string;
  receivingDate: string | null;
  receiver: string | null;
  department: string | null;
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
  warehouseId?: string; // 入库仓库ID
  warehouseName?: string; // 入库仓库名称
  lastInboundDate?: string; // 最近一次入库时间
  lastInboundWarehouse?: string; // 最近一次入库仓库
}

// 质检信息接口
interface QualityCheck {
  checker: string;
  checkDate: string;
  checkResult: 'pass' | 'fail' | 'partial' | 'pending';
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
  const [loading, _setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isReceivingModalVisible, setIsReceivingModalVisible] = useState(false);
  const [editingRecord, _setEditingRecord] = useState<ReceivingRecord | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<ReceivingRecord | null>(null);
  const [deliveryNotes, setDeliveryNotes] = useState<DeliveryNote[]>([]);
  const [itemWarehouses, setItemWarehouses] = useState<Record<string, string>>({});
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [receivingForm] = Form.useForm();
  const [filterForm] = Form.useForm();

  const [fileList, setFileList] = useState<UploadFile[]>([]);

  // 获取仓库名称的辅助函数
  const getWarehouseName = (warehouseId: string) => {
    const warehouseMap: Record<string, string> = {
      'warehouse1': '主仓库',
      'warehouse2': '分仓库A',
      'warehouse3': '分仓库B',
      'warehouse4': '临时仓库'
    };
    return warehouseMap[warehouseId] || '未知仓库';
  };

  // 模拟采购订单数据
  const purchaseOrders: PurchaseOrder[] = [
    { id: '1', orderNo: 'PO202401001', supplierName: '北京科技有限公司', orderDate: '2024-01-15', totalAmount: 43000, status: '已确认' },
    { id: '2', orderNo: 'PO2024005', supplierName: '上海设备制造厂', orderDate: '2024-01-18', totalAmount: 480000, status: '已确认' },
    { id: '3', orderNo: 'PO202401003', supplierName: '广州电子科技', orderDate: '2024-01-20', totalAmount: 25000, status: '已确认' },
  ];

  // 模拟到货单数据（已接收状态，可以创建入库单）
  const mockDeliveryNotes: DeliveryNote[] = [
    {
      id: '1',
      deliveryNo: 'DN202401001',
      purchaseOrderNo: 'PO202401001',
      supplierName: '北京科技有限公司',
      supplierContact: '张经理',
      supplierPhone: '13800138001',
      deliveryDate: '2024-01-25',
      receivedDate: '2024-01-25',
      receiver: '李收货',
      department: '采购部',
      status: 'received',
      statusText: '已接收',
      totalAmount: 43000,
      items: [
        {
          id: '1',
          itemName: '台式电脑',
          specification: 'Intel i5-12400F, 16GB内存, 512GB SSD',
          unit: '台',
          orderedQuantity: 5,
          deliveredQuantity: 5,
          receivedQuantity: 5,
          unitPrice: 3800,
          totalPrice: 19000,
          qualityStatus: 'pass',
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
          qualityStatus: 'pass',
          remarks: '包装完整',
          batchNo: 'B20240125002'
        }
      ],
      attachments: ['delivery_receipt.pdf'],
      remarks: '货物完好，已接收',
      transportInfo: {
        carrier: '顺丰速运',
        trackingNo: 'SF1234567890',
        vehicleNo: '京A12345',
        driverName: '王师傅',
        driverPhone: '13900139001',
        estimatedArrival: '2024-01-25 10:00',
        actualArrival: '2024-01-25 09:45'
      },
      qualityCheck: {
        checker: '质检员小李',
        checkDate: '2024-01-25',
        checkResult: 'pass',
        checkRemarks: '所有物品质量合格',
        attachments: ['quality_check_report.pdf']
      }
    },
    {
      id: '2',
      deliveryNo: 'DN202401003',
      purchaseOrderNo: 'PO202401003',
      supplierName: '广州电子科技',
      supplierContact: '黄经理',
      supplierPhone: '13800138003',
      deliveryDate: '2024-01-30',
      receivedDate: '2024-01-30',
      receiver: '王收货',
      department: '采购部',
      status: 'received',
      statusText: '已接收',
      totalAmount: 12000,
      items: [
        {
          id: '5',
          itemName: '监控摄像头',
          specification: '4K高清网络摄像头',
          unit: '个',
          orderedQuantity: 15,
          deliveredQuantity: 15,
          receivedQuantity: 15,
          unitPrice: 800,
          totalPrice: 12000,
          qualityStatus: 'pass',
          remarks: '设备完好',
          batchNo: 'B20240130001'
        }
      ],
      attachments: ['delivery_receipt.pdf'],
      remarks: '货物完好，已接收',
      transportInfo: {
        carrier: '中通快递',
        trackingNo: 'ZT2024013001',
        vehicleNo: '粤A54321',
        driverName: '陈师傅',
        driverPhone: '13900139003',
        estimatedArrival: '2024-01-30 16:00',
        actualArrival: '2024-01-30 15:30'
      },
      qualityCheck: {
        checker: '质检员小王',
        checkDate: '2024-01-30',
        checkResult: 'pass',
        checkRemarks: '设备质量合格',
        attachments: ['quality_check_report.pdf']
      }
    }
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
          currentStock: 15, // 当前库存15台
          warehouseName: '主仓库', // 入库仓库名称
          lastInboundDate: '2024-01-20', // 最近一次入库时间
          lastInboundWarehouse: '主仓库' // 最近一次入库仓库
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
          currentStock: 5, // 当前库存5台
          warehouseName: '分仓库A', // 入库仓库名称
          lastInboundDate: '2024-01-18', // 最近一次入库时间
          lastInboundWarehouse: '分仓库A' // 最近一次入库仓库
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
      purchaseOrderNo: 'PO2024005',
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
          remarks: '设备需要专业安装',
          currentStock: 0, // 当前库存0台
          warehouseName: '分仓库A' // 入库仓库名称
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
          currentStock: 8, // 当前库存8个
          warehouseName: undefined // 入库仓库名称（已拒绝）
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
          remarks: '待质检',
          currentStock: 0, // 当前库存0把
          warehouseName: '主仓库' // 入库仓库名称
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
    setDeliveryNotes(mockDeliveryNotes);
  }, []);

  // 处理从到货单创建入库单
  const handleCreateFromDeliveryNote = (deliveryNote: DeliveryNote) => {
    const newReceivingRecord: ReceivingRecord = {
      id: `WR${Date.now()}`,
      receivingNo: `WR${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      purchaseOrderNo: deliveryNote.purchaseOrderNo,
      supplierName: deliveryNote.supplierName,
      receivingDate: null,
      receiver: null,
      department: null,
      warehouse: null,
      warehouseName: null,
      status: 'pending',
      statusText: '待处理',
      totalAmount: deliveryNote.totalAmount,
      items: deliveryNote.items.map(item => ({
          id: `item_${Date.now()}_${Math.random()}`,
          itemName: item.itemName,
          specification: item.specification,
          unit: item.unit,
          orderedQuantity: item.orderedQuantity,
          receivedQuantity: 0,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          qualityStatus: 'pending' as const,
          remarks: '',
          currentStock: Math.floor(Math.random() * 50) + 10 // 模拟当前库存
        })),
      attachments: [],
      remarks: `基于到货单 ${deliveryNote.deliveryNo} 创建`,
      qualityCheck: {
        checker: '',
        checkDate: '',
        checkResult: 'pending',
        checkRemarks: '',
        attachments: []
      }
    };

    const updatedData = [...data, newReceivingRecord];
    setData(updatedData);
    setFilteredData(updatedData);
    message.success('已基于到货单创建入库单');
  };



  const handleView = (record: ReceivingRecord) => {
    setSelectedRecord(record);
    setIsDetailModalVisible(true);
  };

  const handleReceiving = (record: ReceivingRecord) => {
    setSelectedRecord(record);
    receivingForm.resetFields();
    // 重置物品仓库选择状态
    setItemWarehouses({});
    setIsReceivingModalVisible(true);
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

      // 检查是否所有物品都选择了入库仓库
      const missingWarehouses = selectedRecord.items?.filter(item => !itemWarehouses[item.id]);
      if (missingWarehouses && missingWarehouses.length > 0) {
        message.warning('请为所有物品选择入库仓库');
        return;
      }

      // 更新物品信息，包含入库仓库信息
      const updatedItems = selectedRecord.items?.map(item => ({
        ...item,
        warehouseId: itemWarehouses[item.id],
        warehouseName: getWarehouseName(itemWarehouses[item.id])
      }));

      const updatedRecord = {
        ...selectedRecord,
        items: updatedItems,
        status: values.qualityStatus === 'passed' ? 'completed' as const : 
                values.qualityStatus === 'failed' ? 'rejected' as const : 'partial' as const,
        statusText: values.qualityStatus === 'passed' ? '已完成' : 
                   values.qualityStatus === 'failed' ? '待处理' : '待处理',
        qualityCheck: {
          ...selectedRecord.qualityCheck,
          checker: values.operator,
          checkDate: new Date().toISOString().split('T')[0],
          checkResult: (values.qualityStatus === 'passed' ? 'pass' : 
                      values.qualityStatus === 'failed' ? 'fail' : 'pending') as 'pass' | 'fail' | 'partial' | 'pending',
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



  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'processing',
      partial: 'warning',
      completed: 'success',
      rejected: 'error',
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
          <div className="flex justify-between items-center mb-4">
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setIsCreateModalVisible(true)}
            >
              创建入库单
            </Button>
          </div>
          <Form form={filterForm} layout="inline">
            <Row gutter={[16, 16]} className="w-full">
              <Col span={4}>
                <Form.Item name="receivingNo" label="入库单号">
                  <Input placeholder="请输入入库单号" />
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
              {selectedRecord.items?.map((item, _index) => (
                <Card key={item.id} size="small" style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ flex: 1 }}>
                      <Text strong>{item.itemName}</Text>
                      <br />
                      <Text type="secondary">{item.specification}</Text>
                      {item.lastInboundDate && (
                        <>
                          <br />
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            最近入库：{item.lastInboundDate} ({item.lastInboundWarehouse})
                          </Text>
                        </>
                      )}
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

            {selectedRecord.status === 'completed' && (
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
                    { title: '入库仓库', dataIndex: 'warehouseName', key: 'warehouseName', width: 100, render: (value) => value || '主仓库' },
                    { title: '备注', dataIndex: 'remarks', key: 'remarks' },
                  ]}
                />
              </div>
            )}




          </div>
        )}
      </Modal>

      {/* 入库处理模态框 - 复用到货单详情页面布局 */}
      <Modal
        title="入库处理详情"
        open={isReceivingModalVisible}
        onOk={handleReceivingSubmit}
        onCancel={() => setIsReceivingModalVisible(false)}
        width={1200}
        destroyOnClose
        okText="确认入库"
        cancelText="取消"
      >
        {selectedRecord && (
          <>
            {/* 基本信息 - 一行两列布局 */}
            <Descriptions title="入库单基本信息" bordered size="small" column={2} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="入库单号">{selectedRecord.receivingNo}</Descriptions.Item>
              <Descriptions.Item label="采购订单号">{selectedRecord.purchaseOrderNo}</Descriptions.Item>
              <Descriptions.Item label="供应商">{selectedRecord.supplierName}</Descriptions.Item>
              <Descriptions.Item label="入库日期">{selectedRecord.receivingDate || '待确定'}</Descriptions.Item>
              <Descriptions.Item label="收货人">{selectedRecord.receiver || '待确定'}</Descriptions.Item>
              <Descriptions.Item label="收货部门">{selectedRecord.department || '待确定'}</Descriptions.Item>
              <Descriptions.Item label="总金额">¥{selectedRecord.totalAmount?.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={selectedRecord.status === 'pending' ? 'orange' : selectedRecord.status === 'completed' ? 'green' : 'red'}>
                  {selectedRecord.statusText}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="备注" span={2}>{selectedRecord.remarks || '无'}</Descriptions.Item>
            </Descriptions>



            {/* 货物明细 - 复用到货单详情页面的表格布局 */}
            <div style={{ marginBottom: 16 }}>
              <Typography.Title level={5}>货物明细</Typography.Title>
              <Table
                size="small"
                dataSource={selectedRecord.items}
                rowKey="id"
                pagination={false}
                columns={[
                  { title: '物品名称', dataIndex: 'itemName', key: 'itemName', width: 120 },
                  { title: '规格型号', dataIndex: 'specification', key: 'specification', width: 150 },
                  { title: '单位', dataIndex: 'unit', key: 'unit', width: 60, align: 'center' },
                  { title: '订购数量', dataIndex: 'orderedQuantity', key: 'orderedQuantity', width: 80, align: 'center' },
                  { title: '实收数量', dataIndex: 'receivedQuantity', key: 'receivedQuantity', width: 80, align: 'center' },
                  { title: '入库前库存', dataIndex: 'currentStock', key: 'currentStock', width: 90, align: 'center', render: (value) => `${value || 0}` },
                  { title: '单价', dataIndex: 'unitPrice', key: 'unitPrice', width: 80, align: 'right', render: (price: number) => `¥${price.toLocaleString()}` },
                  { title: '总价', dataIndex: 'totalPrice', key: 'totalPrice', width: 100, align: 'right', render: (price: number) => `¥${price.toLocaleString()}` },
                  { title: '备注', dataIndex: 'remarks', key: 'remarks', width: 120, ellipsis: true }
                ]}
                scroll={{ x: 1050 }}
              />
            </div>

            {/* 入库操作表单 */}

            <Form form={receivingForm} layout="vertical">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="operator"
                    label="操作员"
                    rules={[{ required: true, message: '请输入操作员' }]}
                  >
                    <Input placeholder="请输入操作员姓名" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="operationDate"
                    label="操作日期"
                    initialValue={dayjs()}
                  >
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item
                name="remarks"
                label="入库备注"
              >
                <TextArea rows={3} placeholder="请输入入库备注信息" />
              </Form.Item>
            </Form>

            {/* 备注信息 */}
            {selectedRecord.remarks && (
              <div style={{ marginTop: 16 }}>
                <Typography.Text strong>原始备注：</Typography.Text>
                <Typography.Text>{selectedRecord.remarks}</Typography.Text>
              </div>
            )}
          </>
        )}
      </Modal>

      {/* 创建入库单对话框 */}
      <Modal
        title="创建入库单"
        open={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        footer={null}
        width={1200}
        destroyOnClose
      >
        <div className="mb-4">
          <p className="text-gray-600">请从以下已接收的到货单中选择一个来创建入库单：</p>
        </div>
        <Table
          columns={[
            {
              title: '到货单号',
              dataIndex: 'deliveryNo',
              key: 'deliveryNo',
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
              title: '到货日期',
              dataIndex: 'deliveryDate',
              key: 'deliveryDate',
              width: 100,
            },
            {
              title: '总金额',
              dataIndex: 'totalAmount',
              key: 'totalAmount',
              width: 100,
              render: (amount: number) => `¥${amount.toLocaleString()}`,
            },
            {
              title: '状态',
              dataIndex: 'status',
              key: 'status',
              width: 80,
              render: (status: string) => (
                <Tag color={status === 'received' ? 'success' : 'processing'}>
                  {status === 'received' ? '已接收' : '待接收'}
                </Tag>
              ),
            },
            {
              title: '操作',
              key: 'action',
              width: 120,
              render: (_, record: DeliveryNote) => (
                <Space size="small">
                  <Button
                    type="primary"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      handleCreateFromDeliveryNote(record);
                      setIsCreateModalVisible(false);
                    }}
                  >
                    创建入库单
                  </Button>
                </Space>
              ),
            },
          ]}
          dataSource={deliveryNotes.filter(note => note.status === 'received')}
          rowKey="id"
          pagination={{
            pageSize: 5,
            showSizeChanger: false,
            showQuickJumper: false,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          scroll={{ x: 800 }}
        />
      </Modal>
    </div>
  );
};

export default WarehouseReceiving;