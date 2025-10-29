import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Modal, Form, Input, Select, DatePicker, Space, Tag, message, Descriptions, Row, Col, InputNumber, Tabs, Upload, Progress, Statistic, Divider, Tooltip, Alert } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined, SearchOutlined, CheckOutlined, CloseOutlined, UploadOutlined, DownloadOutlined, PrinterOutlined, FileExcelOutlined, UnorderedListOutlined, ThunderboltOutlined, InfoCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { selectBatchesByFIFO, getMockBatchesForItem, getBatchStatus, calculateBatchAge, type BatchInfo, type FIFOResult } from '../../utils/fifoUtils';

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

// 出库单接口
interface OutboundOrder {
  id: string;
  outboundNo: string;
  type: 'material' | 'transfer' | 'return' | 'other';
  typeText: string;
  warehouse: string;
  warehouseName: string;
  applicant: string;
  department: string;
  applyDate: string;
  outboundDate: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'completed' | 'picking' | 'shipped';
  statusText: string;
  totalItems: number;
  totalQuantity: number;
  totalAmount: number;
  operator?: string;
  operateDate?: string;
  approver?: string;
  approveDate?: string;
  purpose: string; // 用途
  targetWarehouse?: string; // 目标仓库（调拨出库时使用）
  targetWarehouseName?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent'; // 优先级
  urgentReason?: string; // 紧急原因
  expectedDate?: string; // 期望出库日期
  actualDate?: string; // 实际出库日期
  picker?: string; // 拣货员
  pickDate?: string; // 拣货日期
  isBatch: boolean; // 是否批量导入
  batchId?: string; // 批量导入批次ID
  trackingNo?: string; // 跟踪号
  remarks: string;
  items: OutboundItem[];
}

// 出库明细接口
interface OutboundItem {
  id: string;
  itemCode: string;
  itemName: string;
  specification: string;
  brand?: string;
  unit: string;
  requestQuantity: number;
  approvedQuantity: number;
  actualQuantity: number;
  pickedQuantity: number; // 已拣货数量
  unitPrice: number;
  totalAmount: number;
  currentStock: number;
  batchNo?: string;
  serialNo?: string; // 序列号
  location?: string; // 库位
  expiryDate?: string; // 有效期
  pickStatus: 'pending' | 'picking' | 'picked' | 'shortage'; // 拣货状态
  pickDate?: string; // 拣货日期
  picker?: string; // 拣货员
  supplier?: string; // 供应商
  remarks: string;
  // FIFO相关字段
  batchAllocations?: BatchAllocation[]; // 批次分配详情
  fifoRecommended?: boolean; // 是否为FIFO推荐
  inboundDate?: string; // 入库日期
  batchAge?: number; // 批次库龄
}

// 批次分配接口
interface BatchAllocation {
  batchNo: string;
  batchId: string;
  allocatedQuantity: number;
  remainingQuantity: number;
  unitPrice: number;
  location: string;
  inboundDate: string;
  expiryDate?: string;
  isRecommended: boolean;
}

const InventoryOut: React.FC = () => {
  const [data, setData] = useState<OutboundOrder[]>([]);
  const [filteredData, setFilteredData] = useState<OutboundOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isItemModalVisible, setIsItemModalVisible] = useState(false);
  const [isBatchModalVisible, setIsBatchModalVisible] = useState(false);
  const [isFifoModalVisible, setIsFifoModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<OutboundOrder | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<OutboundOrder | null>(null);
  const [selectedItems, setSelectedItems] = useState<OutboundItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<OutboundItem | null>(null);
  const [batchUploadProgress, setBatchUploadProgress] = useState(0);
  const [fifoResult, setFifoResult] = useState<FIFOResult | null>(null);
  const [availableBatches, setAvailableBatches] = useState<BatchInfo[]>([]);
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [itemForm] = Form.useForm();
  const [fifoForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('all');

  // 模拟数据
  const mockData: OutboundOrder[] = [
    {
      id: '1',
      outboundNo: 'OUT202401001',
      type: 'material',
      typeText: '领料出库',
      warehouse: 'WH001',
      warehouseName: '主仓库',
      applicant: '张三',
      department: '生产部',
      applyDate: '2024-01-15',
      outboundDate: '2024-01-16',
      status: 'completed',
      statusText: '已完成',
      totalItems: 2,
      totalQuantity: 50,
      totalAmount: 5000,
      operator: '李四',
      operateDate: '2024-01-16 10:30',
      approver: '王五',
      approveDate: '2024-01-15 14:20',
      purpose: '生产用料',
      priority: 'high',
      expectedDate: '2024-01-16',
      actualDate: '2024-01-16',
      picker: '李四',
      pickDate: '2024-01-16 09:30',
      isBatch: false,
      trackingNo: 'TK20240116001',
      remarks: '生产线急需物料',
      items: [
        {
          id: '1',
          itemCode: 'M001',
          itemName: '钢材',
          specification: 'Q235 20*30mm',
          brand: '宝钢Baosteel',
          unit: '根',
          requestQuantity: 50,
          approvedQuantity: 50,
          actualQuantity: 50,
          pickedQuantity: 50,
          unitPrice: 50,
          totalAmount: 2500,
          currentStock: 200,
          batchNo: 'B20240115001',
          serialNo: 'SN001-050',
          location: 'A01-01-01',
          expiryDate: '2025-01-15',
          pickStatus: 'picked',
          pickDate: '2024-01-16 09:30',
          picker: '李四',
          supplier: '钢材供应商A',
          remarks: '质量良好'
        }
      ]
    },
    {
      id: '2',
      outboundNo: 'OUT202401002',
      type: 'transfer',
      typeText: '调拨出库',
      warehouse: 'WH001',
      warehouseName: '主仓库',
      applicant: '赵六',
      department: '仓储部',
      applyDate: '2024-01-16',
      outboundDate: '2024-01-17',
      status: 'pending',
      statusText: '待审批',
      totalItems: 1,
      totalQuantity: 30,
      totalAmount: 3000,
      purpose: '仓库调拨',
      targetWarehouse: 'WH002',
      targetWarehouseName: '分仓库A',
      priority: 'medium',
      expectedDate: '2024-01-17',
      isBatch: false,
      remarks: '分仓库库存不足，需要调拨',
      items: []
    },
    {
      id: '3',
      outboundNo: 'OUT202401003',
      type: 'return',
      typeText: '退货出库',
      warehouse: 'WH001',
      warehouseName: '主仓库',
      applicant: '孙七',
      department: '质检部',
      applyDate: '2024-01-17',
      outboundDate: '2024-01-18',
      status: 'picking',
      statusText: '拣货中',
      totalItems: 1,
      totalQuantity: 20,
      totalAmount: 2000,
      purpose: '质量问题退货',
      priority: 'urgent',
      urgentReason: '客户投诉，需紧急处理',
      expectedDate: '2024-01-18',
      picker: '王八',
      isBatch: true,
      batchId: 'BATCH20240117001',
      remarks: '质量不合格，需要退回供应商',
      items: []
    }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    setTimeout(() => {
      setData(mockData);
      setFilteredData(mockData);
      setLoading(false);
    }, 1000);
  };

  const handleSearch = (values: any) => {
    let filtered = data;
    
    if (values.outboundNo) {
      filtered = filtered.filter(item => 
        item.outboundNo.toLowerCase().includes(values.outboundNo.toLowerCase())
      );
    }
    
    if (values.type) {
      filtered = filtered.filter(item => item.type === values.type);
    }
    
    if (values.status) {
      filtered = filtered.filter(item => item.status === values.status);
    }
    
    if (values.warehouse) {
      filtered = filtered.filter(item => item.warehouse === values.warehouse);
    }
    
    if (values.department) {
      filtered = filtered.filter(item => item.department === values.department);
    }
    
    if (values.dateRange && values.dateRange.length === 2) {
      const [startDate, endDate] = values.dateRange;
      filtered = filtered.filter(item => {
        const itemDate = dayjs(item.outboundDate);
        return itemDate.isAfter(startDate.startOf('day')) && itemDate.isBefore(endDate.endOf('day'));
      });
    }
    
    setFilteredData(filtered);
  };

  const handleReset = () => {
    searchForm.resetFields();
    setFilteredData(data);
  };

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: OutboundOrder) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      outboundDate: record.outboundDate ? dayjs(record.outboundDate) : null,
      applyDate: record.applyDate ? dayjs(record.applyDate) : null,
    });
    setIsModalVisible(true);
  };

  const handleDelete = (record: OutboundOrder) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除出库单 ${record.outboundNo} 吗？`,
      onOk: () => {
        const newData = data.filter(item => item.id !== record.id);
        setData(newData);
        setFilteredData(newData);
        message.success('删除成功');
      },
    });
  };

  const handleView = (record: OutboundOrder) => {
    setSelectedRecord(record);
    setIsDetailModalVisible(true);
  };

  const handleApprove = (record: OutboundOrder) => {
    Modal.confirm({
      title: '确认审批',
      content: `确定要审批通过出库单 ${record.outboundNo} 吗？`,
      onOk: () => {
        const newData = data.map(item => 
          item.id === record.id 
            ? { 
                ...item, 
                status: 'approved' as const, 
                statusText: '已审批',
                approver: '当前用户',
                approveDate: dayjs().format('YYYY-MM-DD HH:mm')
              }
            : item
        );
        setData(newData);
        setFilteredData(newData);
        message.success('审批成功');
      },
    });
  };

  const handleReject = (record: OutboundOrder) => {
    Modal.confirm({
      title: '确认驳回',
      content: `确定要驳回出库单 ${record.outboundNo} 吗？`,
      onOk: () => {
        const newData = data.map(item => 
          item.id === record.id 
            ? { 
                ...item, 
                status: 'rejected' as const, 
                statusText: '已驳回',
                approver: '当前用户',
                approveDate: dayjs().format('YYYY-MM-DD HH:mm')
              }
            : item
        );
        setData(newData);
        setFilteredData(newData);
        message.success('驳回成功');
      },
    });
  };

  const handleSubmit = async (values: any) => {
    try {
      const typeTextMap = {
        material: '领料出库',
        transfer: '调拨出库',
        return: '退货出库',
        other: '其他出库'
      };

      const newRecord: OutboundOrder = {
        id: editingRecord?.id || Date.now().toString(),
        outboundNo: editingRecord?.outboundNo || `OUT${dayjs().format('YYYYMMDD')}${String(data.length + 1).padStart(3, '0')}`,
        type: values.type,
        typeText: typeTextMap[values.type as keyof typeof typeTextMap],
        warehouse: values.warehouse,
        warehouseName: values.warehouseName,
        applicant: values.applicant,
        department: values.department,
        applyDate: values.applyDate.format('YYYY-MM-DD'),
        outboundDate: values.outboundDate.format('YYYY-MM-DD'),
        status: 'draft',
        statusText: '草稿',
        totalItems: values.totalItems || 0,
        totalQuantity: values.totalQuantity || 0,
        totalAmount: values.totalAmount || 0,
        purpose: values.purpose,
        targetWarehouse: values.targetWarehouse,
        targetWarehouseName: values.targetWarehouseName,
        priority: values.priority || 'medium',
        expectedDate: values.expectedDate?.format('YYYY-MM-DD'),
        urgentReason: values.urgentReason,
        isBatch: false,
        remarks: values.remarks || '',
        items: []
      };

      let newData;
      if (editingRecord) {
        newData = data.map(item => item.id === editingRecord.id ? newRecord : item);
        message.success('修改成功');
      } else {
        newData = [...data, newRecord];
        message.success('添加成功');
      }

      setData(newData);
      setFilteredData(newData);
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('操作失败');
    }
  };

  // 处理拣货
  const handlePicking = (record: OutboundOrder) => {
    Modal.confirm({
      title: '确认拣货',
      content: `确定要开始拣货出库单 ${record.outboundNo} 吗？`,
      onOk: () => {
        const newData = data.map(item => 
          item.id === record.id 
            ? { 
                ...item, 
                status: 'picking' as const, 
                statusText: '拣货中',
                picker: '当前用户',
                pickDate: dayjs().format('YYYY-MM-DD HH:mm')
              }
            : item
        );
        setData(newData);
        setFilteredData(newData);
        message.success('开始拣货');
      },
    });
  };

  // 处理批量导入
  const handleBatchImport = () => {
    setIsBatchModalVisible(true);
  };

  // 处理导出
  const handleExport = () => {
    message.success('导出成功');
  };

  // 处理打印
  const handlePrint = () => {
    message.success('打印成功');
  };

  // 查看出库明细
  const handleViewItems = (record: OutboundOrder) => {
    setSelectedRecord(record);
    setSelectedItems(record.items);
    setIsItemModalVisible(true);
  };

  // FIFO批次选择
  const handleFifoSelection = (item: OutboundItem) => {
    setSelectedItem(item);
    
    // 获取该物料的可用批次
    const batches = getMockBatchesForItem(item.itemCode, selectedRecord?.warehouse || 'WH001');
    setAvailableBatches(batches);
    
    // 执行FIFO选择
    const result = selectBatchesByFIFO(
      item.itemCode,
      selectedRecord?.warehouse || 'WH001',
      item.requestQuantity,
      batches
    );
    
    setFifoResult(result);
    setIsFifoModalVisible(true);
    
    // 设置表单初始值
    fifoForm.setFieldsValue({
      itemCode: item.itemCode,
      itemName: item.itemName,
      requestQuantity: item.requestQuantity,
      allocations: result.allocations
    });
  };

  // 确认FIFO批次分配
  const handleConfirmFifoAllocation = () => {
    if (!selectedItem || !fifoResult) return;
    
    const values = fifoForm.getFieldsValue();
    const allocations = values.allocations || [];
    
    // 更新出库明细的批次信息
    const updatedItems = selectedItems.map(item => {
      if (item.id === selectedItem.id) {
        return {
          ...item,
          batchAllocations: allocations,
          fifoRecommended: true,
          batchNo: allocations[0]?.batchNo || '',
          location: allocations[0]?.location || '',
          inboundDate: allocations[0]?.inboundDate || '',
          expiryDate: allocations[0]?.expiryDate || '',
          batchAge: allocations[0]?.inboundDate ? calculateBatchAge(allocations[0].inboundDate) : 0,
          unitPrice: allocations[0]?.unitPrice || item.unitPrice,
          totalAmount: allocations.reduce((sum: number, alloc: any) => sum + (alloc.allocatedQuantity * alloc.unitPrice), 0)
        };
      }
      return item;
    });
    
    setSelectedItems(updatedItems);
    
    // 更新主数据中的出库单
    if (selectedRecord) {
      const updatedData = data.map(order => {
        if (order.id === selectedRecord.id) {
          return {
            ...order,
            items: updatedItems
          };
        }
        return order;
      });
      
      setData(updatedData);
      setFilteredData(updatedData);
    }
    
    setIsFifoModalVisible(false);
    message.success('FIFO批次分配成功');
  };

  // 手动调整批次分配
  const handleAdjustBatchAllocation = (index: number, field: string, value: any) => {
    if (!fifoResult) return;
    
    const newAllocations = [...fifoResult.allocations];
    newAllocations[index] = {
      ...newAllocations[index],
      [field]: value
    };
    
    // 重新计算总分配数量
    const totalAllocated = newAllocations.reduce((sum, alloc) => sum + alloc.allocatedQuantity, 0);
    const shortageQuantity = (selectedItem?.requestQuantity || 0) - totalAllocated;
    
    const updatedResult: FIFOResult = {
      ...fifoResult,
      allocations: newAllocations,
      totalAllocated,
      shortageQuantity,
      success: shortageQuantity === 0
    };
    
    setFifoResult(updatedResult);
    fifoForm.setFieldsValue({ allocations: newAllocations });
  };

  // 处理批量上传
  const handleBatchUpload = (info: any) => {
    setBatchUploadProgress(0);
    const timer = setInterval(() => {
      setBatchUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          message.success('批量导入成功');
          setIsBatchModalVisible(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'default',
      pending: 'processing',
      approved: 'success',
      rejected: 'error',
      completed: 'success',
      picking: 'warning',
      shipped: 'cyan'
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'green',
      medium: 'blue',
      high: 'orange',
      urgent: 'red'
    };
    return colors[priority as keyof typeof colors] || 'blue';
  };

  const getPickStatusColor = (status: string) => {
    const colors = {
      pending: 'default',
      picking: 'processing',
      picked: 'success',
      shortage: 'error'
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const columns: ColumnsType<OutboundOrder> = [
    {
      title: '序号',
      key: 'index',
      width: 60,
      fixed: 'left',
      render: (_, __, index) => index + 1,
    },
    {
      title: '出库单号',
      dataIndex: 'outboundNo',
      key: 'outboundNo',
      width: 120,
    },
    {
      title: '出库类型',
      dataIndex: 'typeText',
      key: 'typeText',
      width: 100,
    },
    {
      title: '出库仓库',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
      width: 120,
    },
    {
      title: '申请人',
      dataIndex: 'applicant',
      key: 'applicant',
      width: 100,
    },
    {
      title: '申请部门',
      dataIndex: 'department',
      key: 'department',
      width: 100,
    },
    {
      title: '申请日期',
      dataIndex: 'applyDate',
      key: 'applyDate',
      width: 120,
    },
    {
      title: '出库日期',
      dataIndex: 'outboundDate',
      key: 'outboundDate',
      width: 120,
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      render: (priority: string) => {
        const text = priority === 'low' ? '低' : priority === 'medium' ? '中' : priority === 'high' ? '高' : '紧急';
        return <Tag color={getPriorityColor(priority)}>{text}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string, record: OutboundOrder) => (
        <Space>
          <Tag color={getStatusColor(status)}>{record.statusText}</Tag>
          {record.isBatch && <Tag color="purple">批量</Tag>}
        </Space>
      ),
    },
    {
      title: '物料数量',
      dataIndex: 'totalItems',
      key: 'totalItems',
      width: 100,
    },
    {
      title: '总数量',
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
      width: 100,
    },
    {
      title: '总金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      render: (amount: number) => `¥${amount.toLocaleString()}`,
    },
    {
      title: '用途',
      dataIndex: 'purpose',
      key: 'purpose',
      width: 120,
    },
    {
      title: '操作',
      key: 'action',
      width: 250,
      fixed: 'right',
      render: (_, record: OutboundOrder) => (
        <Space size="small" wrap>
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
            icon={<UnorderedListOutlined />}
            onClick={() => handleViewItems(record)}
          >
            明细
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
              >
                审批
              </Button>
              <Button
                type="link"
                size="small"
                danger
                icon={<CloseOutlined />}
                onClick={() => handleReject(record)}
              >
                驳回
              </Button>
            </>
          )}
          {record.status === 'approved' && (
            <Button
              type="link"
              size="small"
              onClick={() => handlePicking(record)}
            >
              拣货
            </Button>
          )}
          {(record.status === 'draft' || record.status === 'rejected') && (
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
            >
              删除
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const getFilteredDataByTab = () => {
    if (activeTab === 'all') return filteredData;
    if (activeTab === 'material') return filteredData.filter(item => item.type === 'material');
    if (activeTab === 'transfer') return filteredData.filter(item => item.type === 'transfer');
    return filteredData;
  };

  return (
    <div>
      <Card>
        <Form
          form={searchForm}
          layout="inline"
          onFinish={handleSearch}
          style={{ marginBottom: 16 }}
        >
          <Form.Item name="outboundNo" label="出库单号">
            <Input placeholder="请输入出库单号" style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="type" label="出库类型">
            <Select placeholder="请选择出库类型" style={{ width: 120 }} allowClear>
              <Option value="material">领料出库</Option>
              <Option value="transfer">调拨出库</Option>
              <Option value="return">退货出库</Option>
              <Option value="other">其他出库</Option>
            </Select>
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择状态" style={{ width: 120 }} allowClear>
              <Option value="draft">草稿</Option>
              <Option value="pending">待审批</Option>
              <Option value="approved">已审批</Option>
              <Option value="rejected">已驳回</Option>
              <Option value="completed">已完成</Option>
              <Option value="picking">拣货中</Option>
              <Option value="shipped">已发货</Option>
            </Select>
          </Form.Item>
          <Form.Item name="priority" label="优先级">
            <Select placeholder="请选择优先级" style={{ width: 120 }} allowClear>
              <Option value="low">低</Option>
              <Option value="medium">中</Option>
              <Option value="high">高</Option>
              <Option value="urgent">紧急</Option>
            </Select>
          </Form.Item>
          <Form.Item name="warehouse" label="仓库">
            <Select placeholder="请选择仓库" style={{ width: 120 }} allowClear>
              <Option value="WH001">主仓库</Option>
              <Option value="WH002">分仓库A</Option>
              <Option value="WH003">分仓库B</Option>
            </Select>
          </Form.Item>
          <Form.Item name="department" label="申请部门">
            <Select placeholder="请选择部门" style={{ width: 120 }} allowClear>
              <Option value="生产部">生产部</Option>
              <Option value="技术部">技术部</Option>
              <Option value="仓储部">仓储部</Option>
              <Option value="行政部">行政部</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                搜索
              </Button>
              <Button onClick={handleReset}>重置</Button>
            </Space>
          </Form.Item>
        </Form>

        {/* 统计卡片 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={3}>
            <Card>
              <Statistic
                title="总出库单"
                value={data.length}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={3}>
            <Card>
              <Statistic
                title="待审批"
                value={data.filter(item => item.status === 'pending').length}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col span={3}>
            <Card>
              <Statistic
                title="拣货中"
                value={data.filter(item => item.status === 'picking').length}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col span={3}>
            <Card>
              <Statistic
                title="已完成"
                value={data.filter(item => item.status === 'completed').length}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={3}>
            <Card>
              <Statistic
                title="紧急单据"
                value={data.filter(item => item.priority === 'urgent').length}
                valueStyle={{ color: '#f5222d' }}
              />
            </Card>
          </Col>
          <Col span={3}>
            <Card>
              <Statistic
                title="批量导入"
                value={data.filter(item => item.isBatch).length}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col span={3}>
            <Card>
              <Statistic
                title="草稿"
                value={data.filter(item => item.status === 'draft').length}
                valueStyle={{ color: '#8c8c8c' }}
              />
            </Card>
          </Col>
        </Row>

        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增出库单
            </Button>
            <Button icon={<UploadOutlined />} onClick={handleBatchImport}>
              批量导入
            </Button>
          </Space>
          <Space>
            <Button icon={<DownloadOutlined />} onClick={handleExport}>
              导出
            </Button>
            <Button icon={<PrinterOutlined />} onClick={handlePrint}>
              打印
            </Button>
            <Button icon={<FileExcelOutlined />}>
              模板下载
            </Button>
          </Space>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="全部" key="all" />
          <TabPane tab="领料出库" key="material" />
          <TabPane tab="调拨出库" key="transfer" />
        </Tabs>

        <Table
          columns={columns}
          dataSource={getFilteredDataByTab()}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1500 }}
          pagination={{
            total: getFilteredDataByTab().length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      {/* 新增/编辑模态框 */}
      <Modal
        title={editingRecord ? '编辑出库单' : '新增出库单'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="出库类型"
                rules={[{ required: true, message: '请选择出库类型' }]}
              >
                <Select placeholder="请选择出库类型">
                  <Option value="material">领料出库</Option>
                  <Option value="transfer">调拨出库</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="warehouse"
                label="出库仓库"
                rules={[{ required: true, message: '请选择出库仓库' }]}
              >
                <Select placeholder="请选择出库仓库">
                  <Option value="WH001">主仓库</Option>
                  <Option value="WH002">分仓库A</Option>
                  <Option value="WH003">分仓库B</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
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
                name="applicant"
                label="申请人"
                rules={[{ required: true, message: '请输入申请人' }]}
              >
                <Input placeholder="请输入申请人" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="department"
                label="申请部门"
                rules={[{ required: true, message: '请选择申请部门' }]}
              >
                <Select placeholder="请选择申请部门">
                  <Option value="生产部">生产部</Option>
                  <Option value="技术部">技术部</Option>
                  <Option value="仓储部">仓储部</Option>
                  <Option value="行政部">行政部</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="purpose"
                label="用途"
                rules={[{ required: true, message: '请输入用途' }]}
              >
                <Input placeholder="请输入用途" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="applyDate"
                label="申请日期"
                rules={[{ required: true, message: '请选择申请日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="outboundDate"
                label="出库日期"
                rules={[{ required: true, message: '请选择出库日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          
          {/* 调拨出库时显示目标仓库 */}
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}
          >
            {({ getFieldValue }) =>
              getFieldValue('type') === 'transfer' ? (
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="targetWarehouse"
                      label="目标仓库"
                      rules={[{ required: true, message: '请选择目标仓库' }]}
                    >
                      <Select placeholder="请选择目标仓库">
                        <Option value="WH001">主仓库</Option>
                        <Option value="WH002">分仓库A</Option>
                        <Option value="WH003">分仓库B</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="targetWarehouseName"
                      label="目标仓库名称"
                      rules={[{ required: true, message: '请输入目标仓库名称' }]}
                    >
                      <Input placeholder="请输入目标仓库名称" />
                    </Form.Item>
                  </Col>
                </Row>
              ) : null
            }
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="totalItems"
                label="物料数量"
              >
                <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入物料数量" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="totalQuantity"
                label="总数量"
              >
                <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入总数量" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="totalAmount"
            label="总金额"
          >
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入总金额" />
          </Form.Item>
          <Form.Item
            name="remarks"
            label="备注"
          >
            <TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                确定
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 详情模态框 */}
      <Modal
        title="出库单详情"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={null}
        width={1000}
      >
        {selectedRecord && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="出库单号">{selectedRecord.outboundNo}</Descriptions.Item>
              <Descriptions.Item label="出库类型">{selectedRecord.typeText}</Descriptions.Item>
              <Descriptions.Item label="出库仓库">{selectedRecord.warehouseName}</Descriptions.Item>
              <Descriptions.Item label="申请人">{selectedRecord.applicant}</Descriptions.Item>
              <Descriptions.Item label="申请部门">{selectedRecord.department}</Descriptions.Item>
              <Descriptions.Item label="申请日期">{selectedRecord.applyDate}</Descriptions.Item>
              <Descriptions.Item label="出库日期">{selectedRecord.outboundDate}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={getStatusColor(selectedRecord.status)}>{selectedRecord.statusText}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="用途">{selectedRecord.purpose}</Descriptions.Item>
              {selectedRecord.targetWarehouseName && (
                <Descriptions.Item label="目标仓库">{selectedRecord.targetWarehouseName}</Descriptions.Item>
              )}
              <Descriptions.Item label="物料数量">{selectedRecord.totalItems}</Descriptions.Item>
              <Descriptions.Item label="总数量">{selectedRecord.totalQuantity}</Descriptions.Item>
              <Descriptions.Item label="总金额">¥{selectedRecord.totalAmount.toLocaleString()}</Descriptions.Item>
              {selectedRecord.operator && (
                <Descriptions.Item label="操作员">{selectedRecord.operator}</Descriptions.Item>
              )}
              {selectedRecord.operateDate && (
                <Descriptions.Item label="操作日期">{selectedRecord.operateDate}</Descriptions.Item>
              )}
              {selectedRecord.approver && (
                <Descriptions.Item label="审批人">{selectedRecord.approver}</Descriptions.Item>
              )}
              {selectedRecord.approveDate && (
                <Descriptions.Item label="审批日期">{selectedRecord.approveDate}</Descriptions.Item>
              )}
              <Descriptions.Item label="备注" span={2}>{selectedRecord.remarks}</Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>

      {/* 出库明细模态框 */}
      <Modal
        title="出库明细"
        open={isItemModalVisible}
        onCancel={() => setIsItemModalVisible(false)}
        footer={null}
        width={1400}
      >
        {selectedRecord && (
          <div>
            <Descriptions bordered column={3} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="出库单号">{selectedRecord.outboundNo}</Descriptions.Item>
              <Descriptions.Item label="出库类型">{selectedRecord.typeText}</Descriptions.Item>
              <Descriptions.Item label="来源单号">{selectedRecord.outboundNo}</Descriptions.Item>
              <Descriptions.Item label="出库仓库">{selectedRecord.warehouseName}</Descriptions.Item>
              <Descriptions.Item label="申请人">{selectedRecord.applicant}</Descriptions.Item>
              <Descriptions.Item label="申请日期">{selectedRecord.applyDate}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={getStatusColor(selectedRecord.status)}>{selectedRecord.statusText}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="优先级">
                <Tag color={getPriorityColor(selectedRecord.priority)}>
                  {selectedRecord.priority === 'low' ? '低' : 
                   selectedRecord.priority === 'medium' ? '中' : 
                   selectedRecord.priority === 'high' ? '高' : '紧急'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="拣货员">{selectedRecord.picker || '-'}</Descriptions.Item>
            </Descriptions>
            
            <Table
              dataSource={selectedRecord.items}
              rowKey="id"
              pagination={false}
              scroll={{ x: 1200 }}
              columns={[
                {
                  title: '物料编码',
                  dataIndex: 'itemCode',
                  width: 120,
                  fixed: 'left',
                },
                {
                  title: '物料名称',
                  dataIndex: 'itemName',
                  width: 150,
                },
                {
                  title: '规格型号',
                  dataIndex: 'specification',
                  width: 120,
                },
                {
                  title: '品牌',
                  dataIndex: 'brand',
                  width: 120,
                },
                {
                  title: '单位',
                  dataIndex: 'unit',
                  width: 80,
                },
                {
                  title: '申请数量',
                  dataIndex: 'requestQuantity',
                  width: 100,
                },
                {
                  title: '批准数量',
                  dataIndex: 'approvedQuantity',
                  width: 100,
                },
                {
                  title: '实际数量',
                  dataIndex: 'actualQuantity',
                  width: 100,
                },
                {
                  title: '已拣数量',
                  dataIndex: 'pickedQuantity',
                  width: 100,
                  render: (value: number) => (
                    <span style={{ color: value > 0 ? '#52c41a' : '#8c8c8c' }}>
                      {value}
                    </span>
                  ),
                },
                {
                  title: '单价',
                  dataIndex: 'unitPrice',
                  width: 100,
                  render: (value: number) => `¥${value.toFixed(2)}`,
                },
                {
                  title: '金额',
                  dataIndex: 'totalAmount',
                  width: 100,
                  render: (value: number) => `¥${value.toFixed(2)}`,
                },
                {
                  title: '批次号',
                  dataIndex: 'batchNo',
                  width: 120,
                },
                {
                  title: '库位',
                  dataIndex: 'location',
                  width: 100,
                },
                {
                  title: '拣货状态',
                  dataIndex: 'pickStatus',
                  width: 100,
                  render: (status: string) => (
                    <Tag color={getPickStatusColor(status)}>
                      {status === 'pending' ? '待拣货' :
                       status === 'picking' ? '拣货中' :
                       status === 'picked' ? '已拣货' : '缺货'}
                    </Tag>
                  ),
                },
                {
                  title: '入库日期',
                  dataIndex: 'inboundDate',
                  width: 120,
                  render: (date: string) => date || '-',
                },
                {
                  title: '批次天数',
                  dataIndex: 'batchAge',
                  width: 100,
                  render: (age: number) => age ? `${age}天` : '-',
                },
                {
                  title: 'FIFO状态',
                  dataIndex: 'fifoRecommended',
                  width: 100,
                  render: (recommended: boolean) => (
                    <Tag color={recommended ? 'green' : 'default'} icon={recommended ? <ThunderboltOutlined /> : undefined}>
                      {recommended ? 'FIFO推荐' : '手动选择'}
                    </Tag>
                  ),
                },
                {
                  title: '备注',
                  dataIndex: 'remarks',
                  width: 150,
                },
                {
                  title: '操作',
                  key: 'action',
                  width: 120,
                  fixed: 'right',
                  render: (_, record: OutboundItem) => (
                    <Space size="small">
                      <Tooltip title="FIFO批次选择">
                        <Button
                          type="primary"
                          size="small"
                          icon={<ThunderboltOutlined />}
                          onClick={() => handleFifoSelection(record)}
                          disabled={selectedRecord?.status === 'completed'}
                        >
                          FIFO
                        </Button>
                      </Tooltip>
                    </Space>
                  ),
                },
              ]}
            />
          </div>
        )}
      </Modal>

      {/* 批量导入模态框 */}
      <Modal
        title="批量导入出库单"
        open={isBatchModalVisible}
        onCancel={() => setIsBatchModalVisible(false)}
        footer={null}
        width={800}
      >
        <div>
          <div style={{ marginBottom: 16 }}>
            <h4>导入说明：</h4>
            <ul>
              <li>支持Excel格式文件（.xlsx, .xls）</li>
              <li>单次最多导入1000条记录</li>
              <li>请确保数据格式正确，必填字段不能为空</li>
              <li>导入前请下载模板文件，按照模板格式填写数据</li>
            </ul>
          </div>
          
          <Divider />
          
          <div style={{ marginBottom: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Button icon={<FileExcelOutlined />} type="link">
                  下载导入模板
                </Button>
              </div>
              
              <Upload.Dragger
                name="file"
                multiple={false}
                accept=".xlsx,.xls"
                beforeUpload={() => false}
                onChange={handleBatchUpload}
              >
                <p className="ant-upload-drag-icon">
                  <UploadOutlined />
                </p>
                <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
                <p className="ant-upload-hint">
                  支持单个文件上传，仅支持Excel格式
                </p>
              </Upload.Dragger>
              
              {batchUploadProgress > 0 && (
                <div>
                  <div style={{ marginBottom: 8 }}>上传进度：</div>
                  <Progress percent={batchUploadProgress} />
                </div>
              )}
            </Space>
          </div>
          
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsBatchModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" disabled={batchUploadProgress === 0}>
                确认导入
              </Button>
            </Space>
          </div>
        </div>
      </Modal>

      {/* FIFO批次选择模态框 */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ThunderboltOutlined style={{ color: '#1890ff' }} />
            FIFO批次自动选择
          </div>
        }
        open={isFifoModalVisible}
        onCancel={() => setIsFifoModalVisible(false)}
        width={1000}
        footer={[
          <Button key="cancel" onClick={() => setIsFifoModalVisible(false)}>
            取消
          </Button>,
          <Button key="confirm" type="primary" onClick={handleConfirmFifoAllocation}>
            确认分配
          </Button>,
        ]}
      >
        {selectedItem && fifoResult && (
          <div>
            {/* 物料信息 */}
            <Descriptions bordered column={2} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="物料编码">{selectedItem.itemCode}</Descriptions.Item>
              <Descriptions.Item label="物料名称">{selectedItem.itemName}</Descriptions.Item>
              <Descriptions.Item label="申请数量">{selectedItem.requestQuantity}</Descriptions.Item>
              <Descriptions.Item label="单位">{selectedItem.unit}</Descriptions.Item>
            </Descriptions>

            {/* FIFO分配结果 */}
            <div style={{ marginBottom: 16 }}>
              <Alert
                type={fifoResult.success ? 'success' : 'warning'}
                message={
                  <div>
                    <div>
                      <strong>FIFO分配结果：</strong>
                      总分配数量 {fifoResult.totalAllocated}，
                      {fifoResult.success ? '分配完成' : `缺货 ${fifoResult.shortageQuantity}`}
                    </div>
                    {!fifoResult.success && (
                      <div style={{ marginTop: 4, fontSize: '12px' }}>
                        建议：联系采购部门补充库存或调整出库数量
                      </div>
                    )}
                  </div>
                }
                showIcon
              />
            </div>

            {/* 批次分配表格 */}
            <Form form={fifoForm} layout="vertical">
              <Form.Item label="批次分配详情">
                <Table
                  dataSource={fifoResult.allocations}
                  rowKey="batchNo"
                  pagination={false}
                  size="small"
                  scroll={{ x: 800 }}
                  columns={[
                    {
                      title: '批次号',
                      dataIndex: 'batchNo',
                      width: 120,
                      render: (batchNo: string, record: any) => {
                        const batchStatus = getBatchStatus(record);
                        return (
                          <div>
                            <div>{batchNo}</div>
                            <Tag color={batchStatus.color}>
                              {batchStatus.statusText}
                            </Tag>
                          </div>
                        );
                      },
                    },
                    {
                      title: '库位',
                      dataIndex: 'location',
                      width: 100,
                    },
                    {
                      title: '入库日期',
                      dataIndex: 'inboundDate',
                      width: 120,
                      render: (date: string) => (
                        <div>
                          <div>{date}</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            {calculateBatchAge(date)}天
                          </div>
                        </div>
                      ),
                    },
                    {
                      title: '有效期',
                      dataIndex: 'expiryDate',
                      width: 120,
                    },
                    {
                      title: '库存数量',
                      dataIndex: 'availableQuantity',
                      width: 100,
                    },
                    {
                      title: '分配数量',
                      dataIndex: 'allocatedQuantity',
                      width: 120,
                      render: (quantity: number, record: any, index: number) => (
                        <InputNumber
                          min={0}
                          max={record.availableQuantity}
                          value={quantity}
                          onChange={(value) => handleAdjustBatchAllocation(index, 'allocatedQuantity', value || 0)}
                          style={{ width: '100%' }}
                        />
                      ),
                    },
                    {
                      title: '单价',
                      dataIndex: 'unitPrice',
                      width: 100,
                      render: (price: number) => `¥${price.toFixed(2)}`,
                    },
                    {
                      title: '金额',
                      width: 100,
                      render: (_, record: any) => `¥${(record.allocatedQuantity * record.unitPrice).toFixed(2)}`,
                    },
                  ]}
                />
              </Form.Item>
            </Form>

            {/* 可用批次信息 */}
            <div style={{ marginTop: 16 }}>
              <h4>
                <InfoCircleOutlined style={{ marginRight: 8 }} />
                所有可用批次
              </h4>
              <Table
                dataSource={availableBatches}
                rowKey="batchNo"
                pagination={false}
                size="small"
                scroll={{ x: 600 }}
                columns={[
                  {
                    title: '批次号',
                    dataIndex: 'batchNo',
                    width: 120,
                  },
                  {
                    title: '库位',
                    dataIndex: 'location',
                    width: 100,
                  },
                  {
                    title: '入库日期',
                    dataIndex: 'inboundDate',
                    width: 120,
                  },
                  {
                    title: '有效期',
                    dataIndex: 'expiryDate',
                    width: 120,
                  },
                  {
                    title: '库存数量',
                    dataIndex: 'availableQuantity',
                    width: 100,
                  },
                  {
                    title: '状态',
                    width: 100,
                    render: (_, record: BatchInfo) => {
                      const batchStatus = getBatchStatus(record);
                      return (
                        <Tag color={batchStatus.color}>
                          {batchStatus.statusText}
                        </Tag>
                      );
                    },
                  },
                ]}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default InventoryOut;