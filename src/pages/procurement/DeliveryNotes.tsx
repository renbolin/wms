import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Modal, Form, Input, Select, DatePicker, Space, Tag, message, Descriptions, Row, Col, Statistic, Typography, Divider, InputNumber, Radio, Tabs } from 'antd';
import { EyeOutlined, CheckOutlined, InboxOutlined, SearchOutlined, ReloadOutlined, FileDoneOutlined, DatabaseOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

import { DeliveryNote } from '../../types/procurement';
import { useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  getStatusColor,
  filterDeliveryNotes,
  validateAmountRange,
  validateHeaderForm,
  validateReceiveItems,
  canReceive,
  canInspect,
  canArchive,
  canWarehouseOrAllocate,
} from './deliveryNotesLogic';

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
  const [isInspectModalVisible, setIsInspectModalVisible] = useState(false);
  const [isArchiveModalVisible, setIsArchiveModalVisible] = useState(false);
  const [isWarehouseModalVisible, setIsWarehouseModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DeliveryNote | null>(null);
  const [receiveForm] = Form.useForm();
  const [inspectForm] = Form.useForm();
  const [archiveForm] = Form.useForm();
  const [warehouseForm] = Form.useForm();
  const [filterForm] = Form.useForm();

  const [itemReceiveQuantities, setItemReceiveQuantities] = useState<Record<string, number>>({});
  const [itemReceiveStatus, setItemReceiveStatus] = useState<Record<string, 'pending' | 'received' | 'rejected' | undefined>>({});
  const [itemInspectionStatus, setItemInspectionStatus] = useState<Record<string, 'passed' | 'failed' | undefined>>({});
  const [itemInspectionHandling, setItemInspectionHandling] = useState<Record<string, 'return' | 'destroy' | 'repair' | undefined>>({});
  const [itemInspectionRemarks, setItemInspectionRemarks] = useState<Record<string, string>>({});
  // 列表选择与批量导出
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<DeliveryNote[]>([]);

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
      status: 'pending_receive',
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
      status: 'pending_receive',
      statusText: '待接收',
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

  // 到货单数据持久化到本地存储，便于跨页面关联
  useEffect(() => {
    try {
      localStorage.setItem('deliveryNotesData', JSON.stringify(data));
    } catch (e) {
      // 忽略本地存储异常
    }
  }, [data]);

  // 使用逻辑层的getStatusColor，不再在页面内重复定义



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
      title: '验收摘要',
      key: 'inspectionSummary',
      width: 200,
      render: (_, record: DeliveryNote) => {
        const items = record.items || [];
        const hasInspection = items.some(i => i.inspectionStatus);
        if (!hasInspection) return '-';
        const accepted = items.reduce((sum, it) => sum + (it.acceptedQuantity || 0), 0);
        const rejected = items.reduce((sum, it) => sum + (it.rejectedQuantity || 0), 0);
        return (
          <Space size={4}>
            <Tag color="green">合格 {accepted}</Tag>
            <Tag color="red">不合格 {rejected}</Tag>
          </Space>
        );
      }
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
      width: 300,
      fixed: 'right',
      render: (_, record: DeliveryNote) => (
        <Space size="small" style={{ justifyContent: 'flex-end', width: '100%' }}>
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewDetails(record)}>详情</Button>
          {canReceive(record) && (
            <Button type="link" icon={<CheckOutlined />} onClick={() => handleReceive(record)}>接收</Button>
          )}
          {canInspect(record) && (
            <Button type="link" icon={<CheckOutlined />} onClick={() => handleInspect(record)}>验收</Button>
          )}
          {(record.items || []).some(i => i.inspectionStatus) && (
            <Button type="link" icon={<FileDoneOutlined />} onClick={() => exportInspectionReport(record)}>导出验收报告</Button>
          )}
          {canArchive(record) && record.qualityCheckStatus === 'passed' && (
            <Button type="link" icon={<FileDoneOutlined />} onClick={() => handleArchive(record)}>建档</Button>
          )}
          {canWarehouseOrAllocate(record) && (
            <Button type="link" icon={<DatabaseOutlined />} onClick={() => handleWarehouseOrAllocate(record)}>入库/分配使用</Button>
          )}
        </Space>
      )
    }
  ];

  // 仅允许勾选已经有验收数据的到货单
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[], rows: DeliveryNote[]) => {
      setSelectedRowKeys(keys);
      setSelectedRows(rows);
    }
  };

  // 查看详情
  const handleViewDetails = (record: DeliveryNote) => {
    setSelectedRecord(record);
    setIsDetailModalVisible(true);
  };

  // 导出验收报告（CSV）
  const exportInspectionReport = (record: DeliveryNote) => {
    const items = record.items || [];
    if (!items.some(i => i.inspectionStatus)) {
      message.warning('该到货单尚未录入验收数据');
      return;
    }

    const csvHeader = [
      '到货单号','采购订单号','供应商','到货日期','验收日期','验收人','合格数量合计','不合格数量合计'
    ];
    const acceptedTotal = items.reduce((sum, it) => sum + (it.acceptedQuantity || 0), 0);
    const rejectedTotal = items.reduce((sum, it) => sum + (it.rejectedQuantity || 0), 0);

    const noteInfoRow = [
      record.deliveryNo || '',
      record.purchaseOrderNo || '',
      record.supplierName || '',
      record.deliveryDate || '',
      record.inspectionDate || '',
      record.inspector || '',
      String(acceptedTotal),
      String(rejectedTotal)
    ];

    const itemHeader = [
      '物品名称','规格','单位','到货数量','接收数量','合格数量','不合格数量','验收结果','不合格处理','备注'
    ];
    const itemRows = items.map(it => [
      it.itemName || '',
      it.specification || '',
      it.unit || '',
      String(it.deliveredQuantity ?? ''),
      String(it.receivedQuantity ?? ''),
      String(it.acceptedQuantity ?? ''),
      String(it.rejectedQuantity ?? ''),
      it.inspectionStatus === 'passed' ? '合格' : it.inspectionStatus === 'failed' ? '不合格' : '',
      it.inspectionHandling === 'return' ? '退回' : it.inspectionHandling === 'destroy' ? '销毁' : it.inspectionHandling === 'repair' ? '返修' : '',
      it.inspectionRemarks || ''
    ]);

    // 生成CSV文本（含BOM，便于Excel识别中文）
    const toCsvLine = (arr: string[]) => arr.map(v => `"${(v || '').replace(/"/g, '""')}"`).join(',');
    const lines: string[] = [];
    lines.push(toCsvLine(csvHeader));
    lines.push(toCsvLine(noteInfoRow));
    lines.push('');
    lines.push(toCsvLine(itemHeader));
    itemRows.forEach(r => lines.push(toCsvLine(r)));
    const csvContent = '\ufeff' + lines.join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `验收报告_${record.deliveryNo || '未命名'}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 批量导出验收报告（合并为一份CSV）
  const exportInspectionReportBatch = (notes: DeliveryNote[]) => {
    const validNotes = (notes || []).filter(n => (n.items || []).some(i => i.inspectionStatus));
    if (validNotes.length === 0) {
      message.warning('请选择至少一张存在验收数据的到货单');
      return;
    }

    const header = [
      '到货单号','采购订单号','供应商','到货日期','验收日期','验收人',
      '物品名称','规格','单位','到货数量','接收数量','合格数量','不合格数量','验收结果','不合格处理','备注'
    ];

    const toCsvLine = (arr: string[]) => arr.map(v => `"${(v || '').replace(/"/g, '""')}"`).join(',');
    const lines: string[] = [];
    lines.push(toCsvLine(header));

    validNotes.forEach(record => {
      (record.items || []).forEach(it => {
        if (!it.inspectionStatus) return; // 仅导出已验收项
        lines.push(toCsvLine([
          record.deliveryNo || '',
          record.purchaseOrderNo || '',
          record.supplierName || '',
          record.deliveryDate || '',
          record.inspectionDate || '',
          record.inspector || '',
          it.itemName || '',
          it.specification || '',
          it.unit || '',
          String(it.deliveredQuantity ?? ''),
          String(it.receivedQuantity ?? ''),
          String(it.acceptedQuantity ?? ''),
          String(it.rejectedQuantity ?? ''),
          it.inspectionStatus === 'passed' ? '合格' : it.inspectionStatus === 'failed' ? '不合格' : '',
          it.inspectionHandling === 'return' ? '退回' : it.inspectionHandling === 'destroy' ? '销毁' : it.inspectionHandling === 'repair' ? '返修' : '',
          it.inspectionRemarks || ''
        ]));
      });
    });

    const csvContent = '\ufeff' + lines.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `验收报告_批量_${dayjs().format('YYYYMMDD_HHmmss')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

  // 验收
  const handleInspect = (record: DeliveryNote) => {
    setSelectedRecord(record);
    const currentUser = localStorage.getItem('username') || '管理员';
    inspectForm.setFieldsValue({
      inspectionDate: dayjs(),
      inspector: currentUser,
      inspectionResult: 'passed',
      inspectionDiff: '',
      inspectionRemarks: ''
    });
    // 初始化每项验收状态与处置
    const initStatus: Record<string, 'passed' | 'failed' | undefined> = {};
    const initHandling: Record<string, 'return' | 'destroy' | 'repair' | undefined> = {};
    const initRemarks: Record<string, string> = {};
    record.items?.forEach(it => {
      initStatus[it.id] = undefined; // 默认未选择，强制逐项确认
      initHandling[it.id] = undefined;
      initRemarks[it.id] = it.inspectionRemarks || '';
    });
    setItemInspectionStatus(initStatus);
    setItemInspectionHandling(initHandling);
    setItemInspectionRemarks(initRemarks);
    setIsInspectModalVisible(true);
  };

  // 建档
  const handleArchive = (record: DeliveryNote) => {
    setSelectedRecord(record);
    const currentUser = localStorage.getItem('username') || '管理员';
    archiveForm.setFieldsValue({
      archiveDate: dayjs(),
      archivist: currentUser,
      archiveNo: '',
      archiveRemarks: ''
    });
    setIsArchiveModalVisible(true);
  };

  // 入库/分配使用
  const handleWarehouseOrAllocate = (record: DeliveryNote) => {
    setSelectedRecord(record);
    warehouseForm.setFieldsValue({
      action: 'warehouse',
      warehouseLocation: '',
      warehouseName: '',
      allocationDepartment: '',
      allocationAssignee: '',
      allocationRemarks: ''
    });
    setIsWarehouseModalVisible(true);
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
    receiveForm
      .validateFields()
      .then((values) => {
        if (!selectedRecord) {
          message.error('未选择到货单');
          return;
        }

        const headerErrors = validateHeaderForm(values);
        if (headerErrors.length) {
          message.error(headerErrors[0]);
          return;
        }

        // 按数量自动判定接收/拒收：数量>0视为接收，=0视为拒收
        const autoStatus: Record<string, 'pending' | 'received' | 'rejected' | undefined> = {};
        selectedRecord.items?.forEach(it => {
          const qty = Number(itemReceiveQuantities[it.id] ?? 0);
          autoStatus[it.id] = qty > 0 ? 'received' : 'rejected';
        });

        const { errors, updatedItems, summary } = validateReceiveItems(
          selectedRecord,
          itemReceiveQuantities,
          autoStatus
        );

        if (errors.length) {
          message.error(errors[0]);
          return;
        }

        const allReceived = summary.rejectedCount === 0 && updatedItems.every((it) => (it.receivedQuantity || 0) === (it.deliveredQuantity || 0));

        const nextRecord: DeliveryNote = {
          ...selectedRecord,
          status: 'pending_inspection',
          statusText: '待验收',
          receivedDate: values.receivedDate.format('YYYY-MM-DD'),
          receiver: values.receiver,
          department: values.department,
          remarks: values.remarks,
          items: updatedItems,
        } as DeliveryNote;

        const updatedData = data.map((item) => (item.id === selectedRecord.id ? nextRecord : item));
        setData(updatedData);
        setFilteredData(updatedData);

        message.success('货物接收成功，状态已更新为待验收');
        setIsReceiveModalVisible(false);
        
      })
      .catch(() => {
        message.error('请完整填写接收表单后再提交');
      });
  };

  // 验收确认
  const handleInspectConfirm = () => {
    inspectForm
      .validateFields()
      .then((values) => {
        if (!selectedRecord) {
          message.error('未选择到货单');
          return;
        }
        // 校验逐项验收结果
        const missingStatus = selectedRecord.items?.find(it => (it.receivedQuantity || 0) > 0 && !itemInspectionStatus[it.id]);
        if (missingStatus) {
          message.error('请为所有实收货物选择验收结果');
          return;
        }
        const missingHandling = selectedRecord.items?.find(it => itemInspectionStatus[it.id] === 'failed' && !itemInspectionHandling[it.id]);
        if (missingHandling) {
          message.error('请为不合格货物选择处理方式');
          return;
        }
        // 生成更新后的明细
        const updatedItems = (selectedRecord.items || []).map(it => {
          const status = itemInspectionStatus[it.id];
          const handling = itemInspectionHandling[it.id];
          const remark = itemInspectionRemarks[it.id];
          const accepted = status === 'passed' ? (it.receivedQuantity || 0) : 0;
          const rejected = (it.receivedQuantity || 0) - accepted;
          return {
            ...it,
            inspectionStatus: status,
            inspectionHandling: handling,
            inspectionRemarks: remark,
            acceptedQuantity: accepted,
            rejectedQuantity: rejected,
          };
        });
        const allPassed = updatedItems.every(it => (it.receivedQuantity || 0) === 0 || it.inspectionStatus === 'passed');
        const nextRecord: DeliveryNote = {
          ...selectedRecord,
          status: 'pending_archive',
          statusText: '待建档',
          inspectionDate: values.inspectionDate.format('YYYY-MM-DD'),
          inspector: values.inspector,
          inspectionResult: allPassed ? 'passed' : 'failed',
          inspectionDiff: values.inspectionDiff,
          inspectionRemarks: values.inspectionRemarks,
          qualityCheckStatus: allPassed ? 'passed' : 'failed',
          items: updatedItems,
        };
        const updatedData = data.map((item) => (item.id === selectedRecord.id ? nextRecord : item));
        setData(updatedData);
        setFilteredData(updatedData);
        message.success('验收完成，状态已更新为待建档');
        setIsInspectModalVisible(false);
      })
      .catch(() => message.error('请完整填写验收表单'));
  };

  // 建档确认
  const handleArchiveConfirm = () => {
    archiveForm
      .validateFields()
      .then((values) => {
        if (!selectedRecord) {
          message.error('未选择到货单');
          return;
        }
        const year = dayjs(values.archiveDate).format('YYYY');
        const seq = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
        const equipmentCode = `EQ-${year}-${seq}`;

        const purchaseAmount = Number(values.asset_purchaseAmount || 0);
        const residualRatePct = Number(values.asset_residualRate || 0);
        const residualRate = residualRatePct / 100;
        const depreciationYears = Number(values.asset_depreciationYears || 0);
        const monthlyDepreciation = depreciationYears > 0 ? Number(((purchaseAmount * (1 - residualRate)) / (depreciationYears * 12)).toFixed(2)) : 0;
        const accumulatedDepreciation = Number(values.asset_accumulatedDepreciation || 0);
        const netValue = Number((purchaseAmount - accumulatedDepreciation).toFixed(2));

        const nextRecord: DeliveryNote = {
          ...selectedRecord,
          status: 'pending_warehouse',
          statusText: '待入库',
          archiveDate: values.archiveDate.format('YYYY-MM-DD'),
          archivist: values.archivist,
          archiveNo: values.archiveNo,
          archiveRemarks: values.archiveRemarks,
          equipmentCode,
          equipmentArchive: {
            technical: {
              equipmentCode,
              name: values.tech_equipmentName,
              modelSpec: values.tech_modelSpec,
              brand: values.tech_brand,
              serialNo: values.tech_serialNumber,
              performanceParams: values.tech_performanceParams,
              structureParams: values.tech_structureParams,
              supportingSystems: values.tech_supportingSystems,
              mediaRequirements: values.tech_mediaRequirements,
              installationLocation: values.tech_installLocation,
              useDepartment: values.tech_useDepartment,
              installationDate: values.tech_installationDate?.format('YYYY-MM-DD') || undefined,
              firstUseDate: values.tech_firstUseDate?.format('YYYY-MM-DD') || undefined,
              equipmentStatus: values.tech_equipmentStatus,
            },
            asset: {
              assetCode: values.asset_assetCode,
              assetCategory: values.asset_assetCategory,
              purchaseAmount,
              taxRate: Number(values.asset_taxRate || 0),
              depreciationYears,
              residualRate: residualRatePct,
              monthlyDepreciation,
              accumulatedDepreciation,
              netValue,
              purchaseDate: values.asset_purchaseDate?.format('YYYY-MM-DD') || undefined,
              supplierInfo: values.asset_supplierInfo,
              ownershipDepartment: values.asset_ownershipDepartment,
              contractNo: values.asset_contractNo,
              assetStatus: values.asset_assetStatus,
              changeRecords: values.asset_changeRecords,
              lastInventoryDate: values.asset_lastInventoryDate?.format('YYYY-MM-DD') || undefined,
              scrapInfo: values.asset_disposalMethod || values.asset_scrapReportNo || values.asset_scrapPlannedDate
                ? {
                    plannedScrapDate: values.asset_scrapPlannedDate?.format('YYYY-MM-DD') || undefined,
                    scrapReportNo: values.asset_scrapReportNo,
                    disposalMethod: values.asset_disposalMethod,
                  }
                : undefined,
            },
          },
        } as DeliveryNote;
        const updatedData = data.map((item) => (item.id === selectedRecord.id ? nextRecord : item));
        setData(updatedData);
        setFilteredData(updatedData);
        message.success('建档完成，状态已更新为待入库');
        setIsArchiveModalVisible(false);
      })
      .catch(() => message.error('请完整填写建档表单'));
  };

  // 入库/分配确认
  const handleWarehouseOrAllocateConfirm = () => {
    warehouseForm
      .validateFields()
      .then((values) => {
        if (!selectedRecord) {
          message.error('未选择到货单');
          return;
        }
        const action = values.action as 'warehouse' | 'allocate';
        const nextRecord: DeliveryNote = {
          ...selectedRecord,
          status: 'completed',
          statusText: '已完成',
          warehouseOrAllocateAction: action,
          warehouseName: values.warehouseName,
          warehouseLocation: values.warehouseLocation,
          allocationDepartment: values.allocationDepartment,
          allocationAssignee: values.allocationAssignee,
          allocationDate: dayjs().format('YYYY-MM-DD'),
          allocationRemarks: values.allocationRemarks,
          enablementRecord: action === 'allocate'
            ? {
                department: values.allocationDepartment,
                assignee: values.allocationAssignee,
                date: dayjs().format('YYYY-MM-DD'),
                remarks: values.allocationRemarks,
                equipmentCode: selectedRecord.equipmentCode,
              }
            : undefined,
        };
        const updatedData = data.map((item) => (item.id === selectedRecord.id ? nextRecord : item));
        setData(updatedData);
        setFilteredData(updatedData);
        message.success(action === 'warehouse' ? '入库完成，状态已更新为已完成' : '分配完成，状态已更新为已完成');
        setIsWarehouseModalVisible(false);
      })
      .catch(() => message.error('请完整填写入库/分配表单'));
  };

  // 筛选功能
  const handleFilter = () => {
    filterForm.validateFields().then((values) => {
      const [minAmount, maxAmount] = values.totalAmountRange || [];
      const amtErr = validateAmountRange(minAmount, maxAmount);
      if (amtErr) {
        message.error(amtErr);
        return;
      }
      try {
        const filtered = filterDeliveryNotes(data, values);
        setFilteredData(filtered);
      } catch {
        message.error('筛选失败，请检查输入');
      }
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
              value={data.filter(item => item.status === 'pending_receive').length}
              valueStyle={{ color: '#faad14' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="待验收/待建档/待入库"
              value={data.filter(item => ['pending_inspection','pending_archive','pending_warehouse'].includes(item.status)).length}
              valueStyle={{ color: '#1890ff' }}
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
                    <Option value="pending_receive">待接收</Option>
                    <Option value="pending_inspection">待验收</Option>
                    <Option value="pending_archive">待建档</Option>
                    <Option value="pending_warehouse">待入库</Option>
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
        <Space style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
          <Text>已选择 {selectedRows.length} 条</Text>
          <Button
            type="primary"
            icon={<FileDoneOutlined />}
            disabled={selectedRows.length === 0}
            onClick={() => exportInspectionReportBatch(selectedRows)}
          >
            批量导出验收报告
          </Button>
        </Space>
        <Table
          rowSelection={rowSelection}
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
            <Tabs defaultActiveKey="basic" destroyInactiveTabPane>
              <Tabs.TabPane tab="基本信息" key="basic">
                <Descriptions bordered size="small" style={{ marginBottom: 16 }}>
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

                {selectedRecord.transportInfo ? (
                  <Descriptions title="运输信息" bordered size="small">
                    <Descriptions.Item label="承运商">{selectedRecord.transportInfo.carrier}</Descriptions.Item>
                    <Descriptions.Item label="运单号">{selectedRecord.transportInfo.trackingNo}</Descriptions.Item>
                    <Descriptions.Item label="车牌号">{selectedRecord.transportInfo.vehicleNo}</Descriptions.Item>
                    <Descriptions.Item label="司机">{selectedRecord.transportInfo.driverName}</Descriptions.Item>
                    <Descriptions.Item label="司机电话">{selectedRecord.transportInfo.driverPhone}</Descriptions.Item>
                    <Descriptions.Item label="预计到达">{selectedRecord.transportInfo.estimatedArrival}</Descriptions.Item>
                    <Descriptions.Item label="实际到达">{selectedRecord.transportInfo.actualArrival || '未到达'}</Descriptions.Item>
                  </Descriptions>
                ) : (
                  <Card size="small" style={{ marginTop: 8 }}><Text>暂无运输信息</Text></Card>
                )}
              </Tabs.TabPane>

              <Tabs.TabPane tab="货物明细" key="items">
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
                    { title: '备注', dataIndex: 'remarks', key: 'remarks' },
                    { title: '验收结果', key: 'inspectionStatus', width: 100, render: (_, it) => (it.inspectionStatus === 'passed' ? '合格' : it.inspectionStatus === 'failed' ? '不合格' : '-') },
                    { title: '处理方式', dataIndex: 'inspectionHandling', key: 'inspectionHandling', width: 120, render: (val) => (val === 'return' ? '退回' : val === 'destroy' ? '销毁' : val === 'repair' ? '返修' : '-') }
                  ]}
                />
              </Tabs.TabPane>

              <Tabs.TabPane tab="验收汇总" key="inspection">
                {(() => {
                  const items = selectedRecord.items || [];
                  const acceptedTotal = items.reduce((sum, it) => {
                    if (it.acceptedQuantity != null) return sum + it.acceptedQuantity;
                    if (it.inspectionStatus === 'passed') return sum + (it.receivedQuantity || 0);
                    if (!it.inspectionStatus && selectedRecord.qualityCheckStatus === 'passed') {
                      return sum + (it.receivedQuantity || 0);
                    }
                    return sum;
                  }, 0);
                  const rejectedTotal = items.reduce((sum, it) => {
                    if (it.rejectedQuantity != null) return sum + it.rejectedQuantity;
                    return sum + (it.inspectionStatus === 'failed' ? (it.receivedQuantity || 0) : 0);
                  }, 0);
                  const passedItems = items.filter(i => i.inspectionStatus === 'passed' || (!i.inspectionStatus && selectedRecord.qualityCheckStatus === 'passed'));
                  const failedItems = items.filter(i => i.inspectionStatus === 'failed');

                  return (
                    <>
                      <Descriptions bordered size="small" style={{ marginBottom: 12 }}>
                        <Descriptions.Item label="合格数量合计">{acceptedTotal}</Descriptions.Item>
                        <Descriptions.Item label="不合格数量合计">{rejectedTotal}</Descriptions.Item>
                      </Descriptions>
                      {passedItems.length > 0 ? (
                        <Card size="small" title="合格货物" style={{ marginBottom: 12 }}>
                          <Table
                            size="small"
                            dataSource={passedItems}
                            rowKey="id"
                            pagination={false}
                            columns={[
                              { title: '物品名称', dataIndex: 'itemName', key: 'itemName' },
                              { title: '规格', dataIndex: 'specification', key: 'specification' },
                              { title: '合格数量', dataIndex: 'acceptedQuantity', key: 'acceptedQuantity', width: 100, render: (v, it) => v ?? it.receivedQuantity ?? 0 },
                              { title: '备注', dataIndex: 'inspectionRemarks', key: 'inspectionRemarks' },
                            ]}
                          />
                        </Card>
                      ) : (
                        <Card size="small"><Text>暂无合格明细</Text></Card>
                      )}
                      {failedItems.length > 0 ? (
                        <Card size="small" title="不合格货物">
                          <Table
                            size="small"
                            dataSource={failedItems}
                            rowKey="id"
                            pagination={false}
                            columns={[
                              { title: '物品名称', dataIndex: 'itemName', key: 'itemName' },
                              { title: '规格', dataIndex: 'specification', key: 'specification' },
                              { title: '不合格数量', dataIndex: 'rejectedQuantity', key: 'rejectedQuantity', width: 110, render: (v, it) => v ?? it.receivedQuantity ?? 0 },
                              { title: '处理方式', dataIndex: 'inspectionHandling', key: 'inspectionHandling', width: 120, render: (val) => (val === 'return' ? '退回' : val === 'destroy' ? '销毁' : val === 'repair' ? '返修' : '-') },
                              { title: '备注', dataIndex: 'inspectionRemarks', key: 'inspectionRemarks' },
                            ]}
                          />
                        </Card>
                      ) : (
                        <Card size="small" style={{ marginTop: 12 }}><Text>暂无不合格明细</Text></Card>
                      )}
                    </>
                  );
                })()}
              </Tabs.TabPane>

              <Tabs.TabPane tab="建档信息" key="archive">
                <Card size="small" title="设备建档">
                  <Descriptions bordered size="small">
                    <Descriptions.Item label="设备编号">{selectedRecord.equipmentCode || '未生成'}</Descriptions.Item>
                    <Descriptions.Item label="设备名称">{selectedRecord.equipmentArchive?.technical?.name || '-'}</Descriptions.Item>
                    <Descriptions.Item label="型号规格">{selectedRecord.equipmentArchive?.technical?.modelSpec || '-'}</Descriptions.Item>
                    <Descriptions.Item label="品牌">{selectedRecord.equipmentArchive?.technical?.brand || '-'}</Descriptions.Item>
                    <Descriptions.Item label="序列号">{selectedRecord.equipmentArchive?.technical?.serialNo || '-'}</Descriptions.Item>
                    <Descriptions.Item label="使用部门">{selectedRecord.equipmentArchive?.technical?.useDepartment || '-'}</Descriptions.Item>
                    <Descriptions.Item label="安装日期">{selectedRecord.equipmentArchive?.technical?.installationDate || '-'}</Descriptions.Item>
                    <Descriptions.Item label="资产编号">{selectedRecord.equipmentArchive?.asset?.assetCode || '-'}</Descriptions.Item>
                    <Descriptions.Item label="购置金额">{selectedRecord.equipmentArchive?.asset?.purchaseAmount != null ? `¥${selectedRecord.equipmentArchive?.asset?.purchaseAmount}` : '-'}</Descriptions.Item>
                    <Descriptions.Item label="折旧年限">{selectedRecord.equipmentArchive?.asset?.depreciationYears ?? '-'}</Descriptions.Item>
                    <Descriptions.Item label="残值率(%)">{selectedRecord.equipmentArchive?.asset?.residualRate ?? '-'}</Descriptions.Item>
                    <Descriptions.Item label="建档备注" span={2}>{selectedRecord.archiveRemarks || '-'}</Descriptions.Item>
                  </Descriptions>
                </Card>
              </Tabs.TabPane>

              <Tabs.TabPane tab="入库信息" key="warehouse">
                {(() => {
                  try {
                    const receiving = JSON.parse(localStorage.getItem('warehouseReceivingData') || '[]');
                    const related = (receiving || []).filter((r: any) => r.deliveryNo === selectedRecord.deliveryNo);
                    if (!related || related.length === 0) {
                      return <Card size="small"><Text>暂无入库记录</Text></Card>;
                    }
                    return (
                      <Card size="small" title="入库记录">
                        {related.map((rec: any) => (
                          <div key={rec.id} style={{ marginBottom: 12 }}>
                            <Descriptions bordered size="small" column={4}>
                              <Descriptions.Item label="入库单号">{rec.receivingNo || rec.id}</Descriptions.Item>
                              <Descriptions.Item label="到货单号">{rec.deliveryNo}</Descriptions.Item>
                              <Descriptions.Item label="状态">{rec.statusText || '待处理'}</Descriptions.Item>
                              <Descriptions.Item label="仓库">{rec.warehouseName || '-'}</Descriptions.Item>
                              <Descriptions.Item label="入库日期">{rec.receivingDate || '-'}</Descriptions.Item>
                              <Descriptions.Item label="入库员">{rec.receiver || '-'}</Descriptions.Item>
                              <Descriptions.Item label="设备编号">{rec.equipmentCode || selectedRecord.equipmentCode || '-'}</Descriptions.Item>
                              <Descriptions.Item label="备注" span={2}>{rec.remarks || '-'}</Descriptions.Item>
                            </Descriptions>
                            <Table
                              style={{ marginTop: 8 }}
                              size="small"
                              dataSource={rec.items || []}
                              rowKey={(it: any) => it.id || `${rec.id}_${Math.random()}`}
                              pagination={false}
                              columns={[
                                { title: '物品名称', dataIndex: 'itemName', key: 'itemName' },
                                { title: '规格', dataIndex: 'specification', key: 'specification' },
                                { title: '入库数量', dataIndex: 'inboundQuantity', key: 'inboundQuantity', width: 100 },
                                { title: '入库仓库', dataIndex: 'inboundWarehouseName', key: 'inboundWarehouseName', width: 120 },
                                { title: '单价', dataIndex: 'unitPrice', key: 'unitPrice', width: 80, render: (p: number) => `¥${p}` },
                                { title: '总价', dataIndex: 'totalPrice', key: 'totalPrice', width: 100, render: (p: number) => `¥${p?.toLocaleString?.() || p}` },
                              ]}
                            />
                            <Divider style={{ margin: '12px 0' }} />
                          </div>
                        ))}
                      </Card>
                    );
                  } catch (e) {
                    return <Card size="small"><Text>暂无入库记录</Text></Card>;
                  }
                })()}
              </Tabs.TabPane>

              {selectedRecord.enablementRecord && (
                <Tabs.TabPane tab="分配/启用记录" key="enablement">
                  <Card size="small" title="分配/启用记录">
                    <Descriptions bordered size="small">
                      <Descriptions.Item label="启用日期">{selectedRecord.enablementRecord.date}</Descriptions.Item>
                      <Descriptions.Item label="设备编号">{selectedRecord.enablementRecord.equipmentCode || selectedRecord.equipmentCode || '-'}</Descriptions.Item>
                      <Descriptions.Item label="分配部门">{selectedRecord.enablementRecord.department}</Descriptions.Item>
                      <Descriptions.Item label="领用人">{selectedRecord.enablementRecord.assignee}</Descriptions.Item>
                      <Descriptions.Item label="备注" span={2}>{selectedRecord.enablementRecord.remarks || '-'}</Descriptions.Item>
                    </Descriptions>
                  </Card>
                </Tabs.TabPane>
              )}

              {selectedRecord.remarks && (
                <Tabs.TabPane tab="备注" key="remarks">
                  <Card size="small"><Text>{selectedRecord.remarks}</Text></Card>
                </Tabs.TabPane>
              )}
            </Tabs>
          </div>
        )}
      </Modal>

      {/* 验收模态框 */}
      <Modal
        title="验收"
        open={isInspectModalVisible}
        onOk={handleInspectConfirm}
        onCancel={() => setIsInspectModalVisible(false)}
        okText="确认验收"
        cancelText="取消"
        width={1150}
        destroyOnHidden
      >
        {selectedRecord && (
          <>
            <Descriptions title="到货单信息" bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="到货单号">{selectedRecord.deliveryNo}</Descriptions.Item>
              <Descriptions.Item label="采购订单号">{selectedRecord.purchaseOrderNo}</Descriptions.Item>
              <Descriptions.Item label="供应商">{selectedRecord.supplierName}</Descriptions.Item>
              <Descriptions.Item label="到货日期">{selectedRecord.deliveryDate}</Descriptions.Item>
              <Descriptions.Item label="总金额">¥{selectedRecord.totalAmount?.toLocaleString()}</Descriptions.Item>
            </Descriptions>
            <Card size="small" title="验收明细" style={{ marginBottom: 12 }}>
              <Table
                dataSource={selectedRecord.items}
                pagination={false}
                size="middle"
                bordered
                sticky
                rowKey="id"
                columns={[
                  { title: '物品名称', dataIndex: 'itemName', key: 'itemName', width: 160, ellipsis: true },
                  { title: '规格', dataIndex: 'specification', key: 'specification', width: 220, ellipsis: true },
                  { title: '单位', dataIndex: 'unit', key: 'unit', width: 60, align: 'center' },
                  { title: '接收数量', dataIndex: 'receivedQuantity', key: 'receivedQuantity', width: 100, align: 'center' },
                  {
                    title: '验收结果',
                    key: 'inspectionStatus',
                    width: 160,
                    render: (_, it) => (
                      <Radio.Group
                        value={itemInspectionStatus[it.id]}
                        onChange={(e) => {
                          const v = e.target.value as 'passed' | 'failed';
                          setItemInspectionStatus(prev => ({ ...prev, [it.id]: v }));
                          // 切换为不合格时清空处置，避免脏值
                          if (v !== 'failed') {
                            setItemInspectionHandling(prev => ({ ...prev, [it.id]: undefined }));
                          }
                        }}
                      >
                        <Radio value="passed">通过</Radio>
                        <Radio value="failed">不通过</Radio>
                      </Radio.Group>
                    )
                  },
                  {
                    title: '不合格处理',
                    key: 'inspectionHandling',
                    width: 160,
                    render: (_, it) => (
                      <Select
                        placeholder="选择处理方式"
                        value={itemInspectionHandling[it.id]}
                        disabled={itemInspectionStatus[it.id] !== 'failed'}
                        style={{ width: 150 }}
                        onChange={(val) => setItemInspectionHandling(prev => ({ ...prev, [it.id]: val }))}
                        options={[
                          { label: '退回', value: 'return' },
                          { label: '销毁', value: 'destroy' },
                          { label: '返修', value: 'repair' },
                        ]}
                      />
                    )
                  },
                  {
                    title: '备注',
                    key: 'inspectionRemarks',
                    width: 200,
                    render: (_, it, index) => (
                      <Input
                        placeholder="可填写验收备注"
                        value={itemInspectionRemarks[it.id]}
                        onChange={(e) => setItemInspectionRemarks(prev => ({ ...prev, [it.id]: e.target.value }))}
                      />
                    )
                  }
                ]}
              />
            </Card>
            <Form form={inspectForm} layout="vertical">
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="inspectionDate"
                    label="验收日期"
                    rules={[{ required: true, message: '请选择验收日期' }]}
                  >
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="inspector"
                    label="验收人"
                    rules={[{ required: true, message: '请输入验收人' }]}
                  >
                    <Input
                      placeholder="请输入验收人"
                      readOnly
                      style={{ backgroundColor: '#f5f5f5', color: '#999999', cursor: 'not-allowed' }}
                    />
                  </Form.Item>
                </Col>
                {/* 汇总结果由逐项决定，不再提供单选 */}
              </Row>
              <Form.Item name="inspectionDiff" label="差异说明">
                <Input placeholder="如有差异，请填写说明" />
              </Form.Item>
              <Form.Item name="inspectionRemarks" label="验收备注">
                <TextArea rows={3} placeholder="请输入验收备注" />
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>

      {/* 建档模态框 */}
      <Modal
        title="建档"
        open={isArchiveModalVisible}
        onOk={handleArchiveConfirm}
        onCancel={() => setIsArchiveModalVisible(false)}
        width={800}
        destroyOnHidden
      >
        {selectedRecord && (
          <>
            <Descriptions title="到货单信息" bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="到货单号">{selectedRecord.deliveryNo}</Descriptions.Item>
              <Descriptions.Item label="采购订单号">{selectedRecord.purchaseOrderNo}</Descriptions.Item>
              <Descriptions.Item label="供应商">{selectedRecord.supplierName}</Descriptions.Item>
              <Descriptions.Item label="到货日期">{selectedRecord.deliveryDate}</Descriptions.Item>
              <Descriptions.Item label="总金额">¥{selectedRecord.totalAmount?.toLocaleString()}</Descriptions.Item>
            </Descriptions>
            <Form form={archiveForm} layout="vertical">
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="archiveDate"
                    label="建档日期"
                    rules={[{ required: true, message: '请选择建档日期' }]}
                  >
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="archivist"
                    label="建档人"
                    rules={[{ required: true, message: '请输入建档人' }]}
                  >
                    <Input
                      placeholder="请输入建档人"
                      readOnly
                      style={{ backgroundColor: '#f5f5f5', color: '#999999', cursor: 'not-allowed' }}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="archiveNo" label="档案编号" rules={[{ required: true, message: '请输入档案编号' }]}> 
                    <Input placeholder="请输入档案编号" />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="archiveRemarks" label="建档备注">
                <TextArea rows={3} placeholder="请输入建档备注" />
              </Form.Item>
              <Divider orientation="left">设备技术信息</Divider>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="tech_equipmentName" label="设备名称" rules={[{ required: true, message: '请输入设备名称' }]}>
                    <Input placeholder="例如：激光打印机" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="tech_modelSpec" label="型号规格" rules={[{ required: true, message: '请输入型号规格' }]}>
                    <Input placeholder="例如：HP M404dn" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="tech_brand" label="品牌">
                    <Input placeholder="例如：HP" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="tech_serialNumber" label="序列号">
                    <Input placeholder="设备序列号/出厂编号" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="tech_supportingSystems" label="配套系统">
                    <Input placeholder="如驱动、管理系统等" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="tech_mediaRequirements" label="介质需求">
                    <Input placeholder="如电源/网络/气源等" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="tech_installLocation" label="安装位置">
                    <Input placeholder="如A区3楼打印室" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="tech_useDepartment" label="使用部门">
                    <Input placeholder="如综合管理部" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="tech_installationDate" label="安装日期">
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="tech_firstUseDate" label="首次使用日期">
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="tech_equipmentStatus" label="设备状态">
                <Input placeholder="在库/在用/闲置/停用等" />
              </Form.Item>
              <Form.Item name="tech_performanceParams" label="性能参数">
                <TextArea rows={2} placeholder="如打印速度、分辨率等" />
              </Form.Item>
              <Form.Item name="tech_structureParams" label="结构参数">
                <TextArea rows={2} placeholder="如尺寸、重量等" />
              </Form.Item>

              <Divider orientation="left">资产信息</Divider>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="asset_assetCode" label="资产编号">
                    <Input placeholder="固定资产编号" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="asset_assetCategory" label="资产分类">
                    <Input placeholder="如：办公设备/IT设备" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="asset_purchaseAmount" label="购置金额" rules={[{ required: true, message: '请输入购置金额' }]}>
                    <InputNumber style={{ width: '100%' }} min={0} placeholder="¥" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="asset_taxRate" label="税率(%)">
                    <InputNumber style={{ width: '100%' }} min={0} max={100} placeholder="%" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="asset_depreciationYears" label="折旧年限(年)">
                    <InputNumber style={{ width: '100%' }} min={0} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="asset_residualRate" label="残值率(%)">
                    <InputNumber style={{ width: '100%' }} min={0} max={100} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="asset_accumulatedDepreciation" label="累计折旧">
                    <InputNumber style={{ width: '100%' }} min={0} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="asset_purchaseDate" label="购置日期">
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="asset_supplierInfo" label="供应商信息">
                    <Input placeholder="如联系人、电话等" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="asset_ownershipDepartment" label="归口部门">
                    <Input placeholder="资产归口管理部门" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="asset_contractNo" label="合同编号">
                    <Input placeholder="合同编号" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="asset_assetStatus" label="资产状态">
                    <Input placeholder="在用/闲置/报废等" />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="asset_changeRecords" label="变更记录">
                <TextArea rows={2} placeholder="资产变更历史" />
              </Form.Item>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="asset_lastInventoryDate" label="最近盘点日期">
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="asset_scrapPlannedDate" label="计划报废日期">
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="asset_scrapReportNo" label="报废报告编号">
                    <Input placeholder="如有填写" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="asset_disposalMethod" label="处置方式">
                    <Input placeholder="如：出售/拆解/销毁等" />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </>
        )}
      </Modal>

      {/* 入库/分配使用模态框 */}
      <Modal
        title="入库/分配使用"
        open={isWarehouseModalVisible}
        onOk={handleWarehouseOrAllocateConfirm}
        onCancel={() => setIsWarehouseModalVisible(false)}
        width={900}
        destroyOnHidden
      >
        {selectedRecord && (
          <>
            <Descriptions title="到货单信息" bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="到货单号">{selectedRecord.deliveryNo}</Descriptions.Item>
              <Descriptions.Item label="采购订单号">{selectedRecord.purchaseOrderNo}</Descriptions.Item>
              <Descriptions.Item label="供应商">{selectedRecord.supplierName}</Descriptions.Item>
              <Descriptions.Item label="到货日期">{selectedRecord.deliveryDate}</Descriptions.Item>
              <Descriptions.Item label="总金额">¥{selectedRecord.totalAmount?.toLocaleString()}</Descriptions.Item>
            </Descriptions>
            <Form form={warehouseForm} layout="vertical">
              <Form.Item
                name="action"
                label="操作类型"
                rules={[{ required: true, message: '请选择操作类型' }]}
              >
                <Radio.Group>
                  <Radio value="warehouse">入库</Radio>
                  <Radio value="allocate">分配使用</Radio>
                </Radio.Group>
              </Form.Item>

              {/* 根据操作类型切换输入项 */}
              <Form.Item noStyle shouldUpdate={(prev, curr) => prev.action !== curr.action}>
                {() => {
                  const action = warehouseForm.getFieldValue('action') || 'warehouse';
                  if (action === 'warehouse') {
                    return (
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item
                            name="warehouseName"
                            label="仓库名称"
                            rules={[{ required: true, message: '请输入仓库名称' }]}
                          >
                            <Input placeholder="请输入仓库名称" />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            name="warehouseLocation"
                            label="库位/位置"
                            rules={[{ required: true, message: '请输入库位/位置' }]}
                          >
                            <Input placeholder="请输入库位/位置" />
                          </Form.Item>
                        </Col>
                      </Row>
                    );
                  }
                  return (
                    <>
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item
                            name="allocationDepartment"
                            label="分配部门"
                            rules={[{ required: true, message: '请输入分配部门' }]}
                          >
                            <Input placeholder="请输入分配部门" />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            name="allocationAssignee"
                            label="领用人"
                            rules={[{ required: true, message: '请输入领用人' }]}
                          >
                            <Input placeholder="请输入领用人" />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Form.Item name="allocationRemarks" label="分配备注">
                        <TextArea rows={3} placeholder="请输入分配备注" />
                      </Form.Item>
                    </>
                  );
                }}
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>

      {/* 接收货物模态框 */}
      <Modal
        title="接收货物"
        open={isReceiveModalVisible}
        onOk={handleReceiveConfirm}
        onCancel={() => setIsReceiveModalVisible(false)}
        okText="确认接收"
        cancelText="取消"
        width={1150}
        destroyOnHidden
      >
        {selectedRecord && (
          <>
            {/* 基本信息 */}
            <Card size="small" title="到货单信息" style={{ marginBottom: 12 }}>
              <Descriptions bordered size="small" column={5}>
                <Descriptions.Item label="到货单号">{selectedRecord.deliveryNo}</Descriptions.Item>
                <Descriptions.Item label="采购订单号">{selectedRecord.purchaseOrderNo}</Descriptions.Item>
                <Descriptions.Item label="供应商">{selectedRecord.supplierName}</Descriptions.Item>
                <Descriptions.Item label="到货日期">{selectedRecord.deliveryDate}</Descriptions.Item>
                <Descriptions.Item label="总金额">¥{selectedRecord.totalAmount?.toLocaleString()}</Descriptions.Item>
              </Descriptions>
            </Card>

            {/* 货物明细 */}
            <Card size="small" title="货物明细" style={{ marginBottom: 12 }}>
              <Table
                dataSource={selectedRecord.items}
                pagination={false}
                size="middle"
                bordered
                sticky
                scroll={{ x: 'max-content' }}
                rowKey="id"
                columns={[
                  {
                    title: '物品名称',
                    dataIndex: 'itemName',
                    key: 'itemName',
                    width: 160,
                    ellipsis: true,
                  },
                  {
                    title: '规格',
                    dataIndex: 'specification',
                    key: 'specification',
                    width: 220,
                    ellipsis: true,
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
                    width: 100,
                    align: 'right',
                    render: (price: number) => `¥${price.toLocaleString()}`
                  },
                  {
                    title: '总价',
                    dataIndex: 'totalPrice',
                    key: 'totalPrice',
                    width: 120,
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
                    width: 120,
                    align: 'center',
                    render: (_, record) => (
                      <InputNumber
                        style={{ width: 100 }}
                        min={0}
                        max={record.deliveredQuantity || 0}
                        controls={false}
                        value={itemReceiveQuantities[record.id]}
                        onChange={(value) => {
                          const v = Number(value || 0);
                          setItemReceiveQuantities(prev => ({
                            ...prev,
                            [record.id]: v
                          }));
                        }}
                      />
                    )
                  },
                  {
                    // 删除“接收状态”列，改由数量自动判定接收/拒收
                  },
                  {
                    title: '备注',
                    dataIndex: 'remarks',
                    key: 'remarks',
                    width: 180,
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
            </Card>

            {/* 接收信息表单 */}
            <Card size="small" title="接收信息">
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
            </Card>
          </>
        )}
      </Modal>
    </div>
  );
};

export default DeliveryNotes;