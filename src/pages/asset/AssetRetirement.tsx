import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Row,
  Col,
  Tag,
  Descriptions,
  Upload,
  message,
  Statistic,
  Progress,
  Radio,
  InputNumber,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  CheckOutlined,
  CloseOutlined,
  FileTextOutlined,
  UploadOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

// 资产报废记录接口
interface RetirementRecord {
  id: string;
  applicationNo: string;
  assetCode: string;
  assetName: string;
  assetType: string;
  specification: string;
  model: string;
  serialNumber: string;
  originalValue: number;
  currentValue: number;
  depreciationRate: number;
  purchaseDate: string;
  usageYears: number;
  department: string;
  custodian: string;
  location: string;
  retirementReason: string;
  retirementType: string;
  retirementTypeText: string;
  applicationDate: string;
  applicant: string;
  status: string;
  statusText: string;
  approver?: string;
  approveDate?: string;
  approveRemarks?: string;
  rejectReason?: string;
  disposalMethod: string;
  disposalMethodText: string;
  disposalValue?: number;
  disposalDate?: string;
  disposalRemarks?: string;
  attachments?: string[];
  createUser: string;
  createDate: string;
  updateUser?: string;
  updateDate?: string;
}

// 资产信息接口
interface AssetInfo {
  code: string;
  name: string;
  type: string;
  specification: string;
  model: string;
  serialNumber: string;
  originalValue: number;
  currentValue: number;
  depreciationRate: number;
  purchaseDate: string;
  usageYears: number;
  department: string;
  custodian: string;
  location: string;
  status: string;
}

const AssetRetirement: React.FC = () => {
  const [data, setData] = useState<RetirementRecord[]>([]);
  const [filteredData, setFilteredData] = useState<RetirementRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isApproveModalVisible, setIsApproveModalVisible] = useState(false);
  const [isAssetSelectModalVisible, setIsAssetSelectModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<RetirementRecord | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<RetirementRecord | null>(null);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [approveAction, setApproveAction] = useState<'approve' | 'reject'>('approve');

  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [approveForm] = Form.useForm();

  // 模拟资产数据
  const mockAssets: AssetInfo[] = [
    {
      code: 'IT001',
      name: 'Dell OptiPlex 7090',
      type: '电子设备',
      specification: 'i7-11700/16GB/512GB SSD',
      model: 'OptiPlex 7090',
      serialNumber: 'DL2021001',
      originalValue: 8500,
      currentValue: 3400,
      depreciationRate: 60,
      purchaseDate: '2021-03-15',
      usageYears: 3,
      department: '技术部',
      custodian: '张三',
      location: '技术部-研发室1',
      status: 'in_use',
    },
    {
      code: 'OF002',
      name: '办公桌椅套装',
      type: '办公家具',
      specification: '1.6m*0.8m办公桌+人体工学椅',
      model: 'OD-1680',
      serialNumber: 'OF2020002',
      originalValue: 2800,
      currentValue: 1120,
      depreciationRate: 60,
      purchaseDate: '2020-06-10',
      usageYears: 4,
      department: '行政部',
      custodian: '李四',
      location: '行政部-办公室2',
      status: 'in_use',
    },
  ];

  // 模拟数据
  const mockData: RetirementRecord[] = [
    {
      id: '1',
      applicationNo: 'RT202401001',
      assetCode: 'IT001',
      assetName: 'Dell OptiPlex 7090',
      assetType: '电子设备',
      specification: 'i7-11700/16GB/512GB SSD',
      model: 'OptiPlex 7090',
      serialNumber: 'DL2021001',
      originalValue: 8500,
      currentValue: 3400,
      depreciationRate: 60,
      purchaseDate: '2021-03-15',
      usageYears: 3,
      department: '技术部',
      custodian: '张三',
      location: '技术部-研发室1',
      retirementReason: '设备老化，性能不足，影响工作效率',
      retirementType: 'normal',
      retirementTypeText: '正常报废',
      applicationDate: '2024-01-15',
      applicant: '张三',
      status: 'approved',
      statusText: '已审批',
      approver: '王经理',
      approveDate: '2024-01-16',
      approveRemarks: '同意报废，设备确实已达到使用年限',
      disposalMethod: 'recycle',
      disposalMethodText: '回收处理',
      disposalValue: 500,
      disposalDate: '2024-01-20',
      disposalRemarks: '已联系回收公司处理',
      attachments: ['设备检测报告.pdf', '报废申请表.pdf'],
      createUser: '张三',
      createDate: '2024-01-15 09:30:00',
      updateUser: '王经理',
      updateDate: '2024-01-16 14:20:00',
    },
    {
      id: '2',
      applicationNo: 'RT202401002',
      assetCode: 'OF002',
      assetName: '办公桌椅套装',
      assetType: '办公家具',
      specification: '1.6m*0.8m办公桌+人体工学椅',
      model: 'OD-1680',
      serialNumber: 'OF2020002',
      originalValue: 2800,
      currentValue: 1120,
      depreciationRate: 60,
      purchaseDate: '2020-06-10',
      usageYears: 4,
      department: '行政部',
      custodian: '李四',
      location: '行政部-办公室2',
      retirementReason: '桌面损坏严重，椅子机械故障',
      retirementType: 'damage',
      retirementTypeText: '损坏报废',
      applicationDate: '2024-01-18',
      applicant: '李四',
      status: 'pending',
      statusText: '待审批',
      disposalMethod: 'discard',
      disposalMethodText: '废弃处理',
      createUser: '李四',
      createDate: '2024-01-18 10:15:00',
    },
    {
      id: '3',
      applicationNo: 'RT202401003',
      assetCode: 'IT003',
      assetName: 'HP LaserJet Pro M404n',
      assetType: '电子设备',
      specification: '黑白激光打印机',
      model: 'M404n',
      serialNumber: 'HP2019003',
      originalValue: 1800,
      currentValue: 360,
      depreciationRate: 80,
      purchaseDate: '2019-08-20',
      usageYears: 5,
      department: '财务部',
      custodian: '赵五',
      location: '财务部-会计室',
      retirementReason: '打印质量下降，维修成本过高',
      retirementType: 'normal',
      retirementTypeText: '正常报废',
      applicationDate: '2024-01-20',
      applicant: '赵五',
      status: 'rejected',
      statusText: '已拒绝',
      approver: '王经理',
      approveDate: '2024-01-21',
      rejectReason: '设备仍可维修使用，建议先进行维修',
      disposalMethod: 'repair',
      disposalMethodText: '维修后继续使用',
      createUser: '赵五',
      createDate: '2024-01-20 11:45:00',
      updateUser: '王经理',
      updateDate: '2024-01-21 16:30:00',
    },
  ];

  useEffect(() => {
    setData(mockData);
    setFilteredData(mockData);
  }, []);

  // 统计数据
  const totalApplications = data.length;
  const pendingApplications = data.filter(item => item.status === 'pending').length;
  const approvedApplications = data.filter(item => item.status === 'approved').length;
  const totalRetirementValue = data
    .filter(item => item.status === 'approved')
    .reduce((sum, item) => sum + item.currentValue, 0);

  // 事件处理函数
  const handleAdd = () => {
    setEditingRecord(null);
    setIsAssetSelectModalVisible(true);
  };

  const handleEdit = (record: RetirementRecord) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      applicationDate: dayjs(record.applicationDate),
      disposalDate: record.disposalDate ? dayjs(record.disposalDate) : undefined,
    });
    setIsModalVisible(true);
  };

  const handleView = (record: RetirementRecord) => {
    setSelectedRecord(record);
    setIsDetailModalVisible(true);
  };

  const handleDelete = (record: RetirementRecord) => {
    Modal.confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除报废申请 ${record.applicationNo} 吗？`,
      onOk() {
        const newData = data.filter(item => item.id !== record.id);
        setData(newData);
        setFilteredData(newData);
        message.success('删除成功');
      },
    });
  };

  const handleApprove = (record: RetirementRecord) => {
    setSelectedRecord(record);
    setApproveAction('approve');
    approveForm.resetFields();
    setIsApproveModalVisible(true);
  };

  const handleReject = (record: RetirementRecord) => {
    setSelectedRecord(record);
    setApproveAction('reject');
    approveForm.resetFields();
    setIsApproveModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const newRecord: RetirementRecord = {
        id: editingRecord?.id || Date.now().toString(),
        applicationNo: editingRecord?.applicationNo || `RT${dayjs().format('YYYYMMDD')}${String(data.length + 1).padStart(3, '0')}`,
        ...values,
        applicationDate: values.applicationDate.format('YYYY-MM-DD'),
        disposalDate: values.disposalDate?.format('YYYY-MM-DD'),
        status: editingRecord?.status || 'pending',
        statusText: editingRecord?.statusText || '待审批',
        retirementTypeText: values.retirementType === 'normal' ? '正常报废' : 
                           values.retirementType === 'damage' ? '损坏报废' : 
                           values.retirementType === 'obsolete' ? '技术淘汰' : '其他',
        disposalMethodText: values.disposalMethod === 'recycle' ? '回收处理' : 
                           values.disposalMethod === 'discard' ? '废弃处理' : 
                           values.disposalMethod === 'donate' ? '捐赠处理' : 
                           values.disposalMethod === 'sell' ? '出售处理' : '维修后继续使用',
        createUser: editingRecord?.createUser || '当前用户',
        createDate: editingRecord?.createDate || dayjs().format('YYYY-MM-DD HH:mm:ss'),
        updateUser: editingRecord ? '当前用户' : undefined,
        updateDate: editingRecord ? dayjs().format('YYYY-MM-DD HH:mm:ss') : undefined,
      };

      if (editingRecord) {
        const newData = data.map(item => item.id === editingRecord.id ? newRecord : item);
        setData(newData);
        setFilteredData(newData);
        message.success('更新成功');
      } else {
        const newData = [...data, newRecord];
        setData(newData);
        setFilteredData(newData);
        message.success('添加成功');
      }

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handleApproveSubmit = async () => {
    try {
      const values = await approveForm.validateFields();
      if (!selectedRecord) return;

      const updatedRecord: RetirementRecord = {
        ...selectedRecord,
        status: approveAction === 'approve' ? 'approved' : 'rejected',
        statusText: approveAction === 'approve' ? '已审批' : '已拒绝',
        approver: '当前用户',
        approveDate: dayjs().format('YYYY-MM-DD'),
        approveRemarks: approveAction === 'approve' ? values.remarks : undefined,
        rejectReason: approveAction === 'reject' ? values.remarks : undefined,
        updateUser: '当前用户',
        updateDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      };

      const newData = data.map(item => item.id === selectedRecord.id ? updatedRecord : item);
      setData(newData);
      setFilteredData(newData);
      
      message.success(approveAction === 'approve' ? '审批通过' : '审批拒绝');
      setIsApproveModalVisible(false);
      setSelectedRecord(null);
      approveForm.resetFields();
    } catch (error) {
      console.error('审批失败:', error);
    }
  };

  const handleAssetSelect = () => {
    if (selectedAssets.length === 0) {
      message.warning('请选择要报废的资产');
      return;
    }

    const selectedAsset = mockAssets.find(asset => asset.code === selectedAssets[0]);
    if (!selectedAsset) return;

    form.setFieldsValue({
      assetCode: selectedAsset.code,
      assetName: selectedAsset.name,
      assetType: selectedAsset.type,
      specification: selectedAsset.specification,
      model: selectedAsset.model,
      serialNumber: selectedAsset.serialNumber,
      originalValue: selectedAsset.originalValue,
      currentValue: selectedAsset.currentValue,
      depreciationRate: selectedAsset.depreciationRate,
      purchaseDate: dayjs(selectedAsset.purchaseDate),
      usageYears: selectedAsset.usageYears,
      department: selectedAsset.department,
      custodian: selectedAsset.custodian,
      location: selectedAsset.location,
      applicant: selectedAsset.custodian,
      applicationDate: dayjs(),
    });

    setIsAssetSelectModalVisible(false);
    setIsModalVisible(true);
  };

  const handleSearch = () => {
    const values = searchForm.getFieldsValue();
    let filtered = [...data];

    // 申请单号
    if (values.applicationNo) {
      filtered = filtered.filter(item => 
        item.applicationNo.toLowerCase().includes(values.applicationNo.toLowerCase())
      );
    }

    // 资产编码
    if (values.assetCode) {
      filtered = filtered.filter(item => 
        item.assetCode.toLowerCase().includes(values.assetCode.toLowerCase())
      );
    }

    // 资产名称
    if (values.assetName) {
      filtered = filtered.filter(item => 
        item.assetName.toLowerCase().includes(values.assetName.toLowerCase())
      );
    }

    // 资产类型
    if (values.assetType) {
      filtered = filtered.filter(item => 
        item.assetType.toLowerCase().includes(values.assetType.toLowerCase())
      );
    }

    // 规格型号
    if (values.specification) {
      filtered = filtered.filter(item => 
        item.specification.toLowerCase().includes(values.specification.toLowerCase())
      );
    }

    // 型号
    if (values.model) {
      filtered = filtered.filter(item => 
        item.model.toLowerCase().includes(values.model.toLowerCase())
      );
    }

    // 序列号
    if (values.serialNumber) {
      filtered = filtered.filter(item => 
        item.serialNumber.toLowerCase().includes(values.serialNumber.toLowerCase())
      );
    }

    // 使用部门
    if (values.department) {
      filtered = filtered.filter(item => item.department === values.department);
    }

    // 保管人
    if (values.custodian) {
      filtered = filtered.filter(item => 
        item.custodian.toLowerCase().includes(values.custodian.toLowerCase())
      );
    }

    // 存放位置
    if (values.location) {
      filtered = filtered.filter(item => 
        item.location.toLowerCase().includes(values.location.toLowerCase())
      );
    }

    // 报废原因
    if (values.retirementReason) {
      filtered = filtered.filter(item => 
        item.retirementReason.toLowerCase().includes(values.retirementReason.toLowerCase())
      );
    }

    // 报废类型
    if (values.retirementType) {
      filtered = filtered.filter(item => item.retirementType === values.retirementType);
    }

    // 申请人
    if (values.applicant) {
      filtered = filtered.filter(item => 
        item.applicant.toLowerCase().includes(values.applicant.toLowerCase())
      );
    }

    // 状态
    if (values.status) {
      filtered = filtered.filter(item => item.status === values.status);
    }

    // 审批人
    if (values.approver) {
      filtered = filtered.filter(item => 
        item.approver && item.approver.toLowerCase().includes(values.approver.toLowerCase())
      );
    }

    // 审批备注
    if (values.approveRemarks) {
      filtered = filtered.filter(item => 
        item.approveRemarks && item.approveRemarks.toLowerCase().includes(values.approveRemarks.toLowerCase())
      );
    }

    // 拒绝原因
    if (values.rejectReason) {
      filtered = filtered.filter(item => 
        item.rejectReason && item.rejectReason.toLowerCase().includes(values.rejectReason.toLowerCase())
      );
    }

    // 处置方式
    if (values.disposalMethod) {
      filtered = filtered.filter(item => 
        item.disposalMethod.toLowerCase().includes(values.disposalMethod.toLowerCase())
      );
    }

    // 处置备注
    if (values.disposalRemarks) {
      filtered = filtered.filter(item => 
        item.disposalRemarks && item.disposalRemarks.toLowerCase().includes(values.disposalRemarks.toLowerCase())
      );
    }

    // 创建人
    if (values.createUser) {
      filtered = filtered.filter(item => 
        item.createUser.toLowerCase().includes(values.createUser.toLowerCase())
      );
    }

    // 更新人
    if (values.updateUser) {
      filtered = filtered.filter(item => 
        item.updateUser && item.updateUser.toLowerCase().includes(values.updateUser.toLowerCase())
      );
    }

    // 申请日期范围
    if (values.applicationDateRange && values.applicationDateRange.length === 2) {
      const [startDate, endDate] = values.applicationDateRange;
      filtered = filtered.filter(item => {
        const itemDate = dayjs(item.applicationDate);
        return itemDate.isAfter(startDate.subtract(1, 'day')) && 
               itemDate.isBefore(endDate.add(1, 'day'));
      });
    }

    // 审批日期范围
    if (values.approveDateRange && values.approveDateRange.length === 2) {
      const [startDate, endDate] = values.approveDateRange;
      filtered = filtered.filter(item => {
        if (!item.approveDate) return false;
        const itemDate = dayjs(item.approveDate);
        return itemDate.isAfter(startDate.subtract(1, 'day')) && 
               itemDate.isBefore(endDate.add(1, 'day'));
      });
    }

    // 处置日期范围
    if (values.disposalDateRange && values.disposalDateRange.length === 2) {
      const [startDate, endDate] = values.disposalDateRange;
      filtered = filtered.filter(item => {
        if (!item.disposalDate) return false;
        const itemDate = dayjs(item.disposalDate);
        return itemDate.isAfter(startDate.subtract(1, 'day')) && 
               itemDate.isBefore(endDate.add(1, 'day'));
      });
    }

    // 购买日期范围
    if (values.purchaseDateRange && values.purchaseDateRange.length === 2) {
      const [startDate, endDate] = values.purchaseDateRange;
      filtered = filtered.filter(item => {
        const itemDate = dayjs(item.purchaseDate);
        return itemDate.isAfter(startDate.subtract(1, 'day')) && 
               itemDate.isBefore(endDate.add(1, 'day'));
      });
    }

    // 创建时间范围
    if (values.createDateRange && values.createDateRange.length === 2) {
      const [startDate, endDate] = values.createDateRange;
      filtered = filtered.filter(item => {
        const itemDate = dayjs(item.createDate);
        return itemDate.isAfter(startDate.subtract(1, 'day')) && 
               itemDate.isBefore(endDate.add(1, 'day'));
      });
    }

    // 更新时间范围
    if (values.updateDateRange && values.updateDateRange.length === 2) {
      const [startDate, endDate] = values.updateDateRange;
      filtered = filtered.filter(item => {
        if (!item.updateDate) return false;
        const itemDate = dayjs(item.updateDate);
        return itemDate.isAfter(startDate.subtract(1, 'day')) && 
               itemDate.isBefore(endDate.add(1, 'day'));
      });
    }

    setFilteredData(filtered);
  };

  const handleReset = () => {
    searchForm.resetFields();
    setFilteredData(data);
  };

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'orange';
      case 'approved': return 'green';
      case 'rejected': return 'red';
      case 'disposed': return 'blue';
      default: return 'default';
    }
  };

  // 获取报废类型颜色
  const getRetirementTypeColor = (type: string) => {
    switch (type) {
      case 'normal': return 'blue';
      case 'damage': return 'red';
      case 'obsolete': return 'orange';
      case 'other': return 'default';
      default: return 'default';
    }
  };

  // 表格列定义
  const columns: ColumnsType<RetirementRecord> = [
    {
      title: '序号',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: '申请单号',
      dataIndex: 'applicationNo',
      key: 'applicationNo',
      width: 120,
    },
    {
      title: '资产编码',
      dataIndex: 'assetCode',
      key: 'assetCode',
      width: 100,
    },
    {
      title: '资产名称',
      dataIndex: 'assetName',
      key: 'assetName',
      width: 150,
      ellipsis: true,
    },
    {
      title: '资产类型',
      dataIndex: 'assetType',
      key: 'assetType',
      width: 100,
    },
    {
      title: '原值(元)',
      dataIndex: 'originalValue',
      key: 'originalValue',
      width: 100,
      render: (value) => value?.toLocaleString(),
    },
    {
      title: '现值(元)',
      dataIndex: 'currentValue',
      key: 'currentValue',
      width: 100,
      render: (value) => value?.toLocaleString(),
    },
    {
      title: '报废类型',
      dataIndex: 'retirementTypeText',
      key: 'retirementType',
      width: 100,
      render: (text, record) => (
        <Tag color={getRetirementTypeColor(record.retirementType)}>{text}</Tag>
      ),
    },
    {
      title: '申请人',
      dataIndex: 'applicant',
      key: 'applicant',
      width: 80,
    },
    {
      title: '申请日期',
      dataIndex: 'applicationDate',
      key: 'applicationDate',
      width: 100,
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
      width: 250,
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
            <>
              <Button
                type="link"
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
              >
                编辑
              </Button>
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
              <Button
                type="link"
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record)}
                danger
              >
                删除
              </Button>
            </>
          )}
          {record.status === 'approved' && (
            <Button
              type="link"
              size="small"
              icon={<FileTextOutlined />}
              style={{ color: '#722ed1' }}
            >
              处置
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const assetColumns: ColumnsType<AssetInfo> = [
    {
      title: '资产编码',
      dataIndex: 'code',
      key: 'code',
      width: 100,
    },
    {
      title: '资产名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '资产类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
    },
    {
      title: '规格型号',
      dataIndex: 'specification',
      key: 'specification',
      width: 200,
      ellipsis: true,
    },
    {
      title: '原值(元)',
      dataIndex: 'originalValue',
      key: 'originalValue',
      width: 100,
      render: (value) => value?.toLocaleString(),
    },
    {
      title: '现值(元)',
      dataIndex: 'currentValue',
      key: 'currentValue',
      width: 100,
      render: (value) => value?.toLocaleString(),
    },
    {
      title: '使用部门',
      dataIndex: 'department',
      key: 'department',
      width: 100,
    },
    {
      title: '保管人',
      dataIndex: 'custodian',
      key: 'custodian',
      width: 80,
    },
  ];

  return (
    <div className="p-6">
      {/* 统计卡片 */}
      <Row gutter={16} className="mb-4">
        <Col span={6}>
          <Card>
            <Statistic
              title="报废申请总数"
              value={totalApplications}
              suffix="件"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待审批申请"
              value={pendingApplications}
              suffix="件"
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已审批申请"
              value={approvedApplications}
              suffix="件"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="报废资产价值"
              value={totalRetirementValue}
              suffix="元"
              valueStyle={{ color: '#722ed1' }}
              formatter={(value) => `${Number(value).toLocaleString()}`}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        {/* 搜索表单 */}
        <Form form={searchForm} layout="inline" className="mb-4">
          <Form.Item name="applicationNo" label="申请单号">
            <Input placeholder="请输入申请单号" style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="assetCode" label="资产编码">
            <Input placeholder="请输入资产编码" style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="assetName" label="资产名称">
            <Input placeholder="请输入资产名称" style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="assetType" label="资产类型">
            <Input placeholder="请输入资产类型" style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="specification" label="规格型号">
            <Input placeholder="请输入规格型号" style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="model" label="型号">
            <Input placeholder="请输入型号" style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="serialNumber" label="序列号">
            <Input placeholder="请输入序列号" style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="department" label="使用部门">
            <Select placeholder="请选择部门" style={{ width: 120 }} allowClear>
              <Option value="技术部">技术部</Option>
              <Option value="行政部">行政部</Option>
              <Option value="财务部">财务部</Option>
              <Option value="生产部">生产部</Option>
              <Option value="后勤部">后勤部</Option>
            </Select>
          </Form.Item>
          <Form.Item name="custodian" label="保管人">
            <Input placeholder="请输入保管人" style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="location" label="存放位置">
            <Input placeholder="请输入存放位置" style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="retirementReason" label="报废原因">
            <Input placeholder="请输入报废原因" style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="retirementType" label="报废类型">
            <Select placeholder="请选择报废类型" style={{ width: 120 }} allowClear>
              <Option value="normal">正常报废</Option>
              <Option value="damage">损坏报废</Option>
              <Option value="obsolete">技术淘汰</Option>
              <Option value="other">其他</Option>
            </Select>
          </Form.Item>
          <Form.Item name="applicant" label="申请人">
            <Input placeholder="请输入申请人" style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择状态" style={{ width: 120 }} allowClear>
              <Option value="pending">待审批</Option>
              <Option value="approved">已审批</Option>
              <Option value="rejected">已拒绝</Option>
              <Option value="disposed">已处置</Option>
            </Select>
          </Form.Item>
          <Form.Item name="approver" label="审批人">
            <Input placeholder="请输入审批人" style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="approveRemarks" label="审批备注">
            <Input placeholder="请输入审批备注" style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="rejectReason" label="拒绝原因">
            <Input placeholder="请输入拒绝原因" style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="disposalMethod" label="处置方式">
            <Input placeholder="请输入处置方式" style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="disposalRemarks" label="处置备注">
            <Input placeholder="请输入处置备注" style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="createUser" label="创建人">
            <Input placeholder="请输入创建人" style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="updateUser" label="更新人">
            <Input placeholder="请输入更新人" style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="applicationDateRange" label="申请日期">
            <RangePicker style={{ width: 240 }} />
          </Form.Item>
          <Form.Item name="approveDateRange" label="审批日期">
            <RangePicker style={{ width: 240 }} />
          </Form.Item>
          <Form.Item name="disposalDateRange" label="处置日期">
            <RangePicker style={{ width: 240 }} />
          </Form.Item>
          <Form.Item name="purchaseDateRange" label="购买日期">
            <RangePicker style={{ width: 240 }} />
          </Form.Item>
          <Form.Item name="createDateRange" label="创建时间">
            <RangePicker style={{ width: 240 }} />
          </Form.Item>
          <Form.Item name="updateDateRange" label="更新时间">
            <RangePicker style={{ width: 240 }} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                搜索
              </Button>
              <Button onClick={handleReset}>重置</Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                新增申请
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

      {/* 资产选择模态框 */}
      <Modal
        title="选择要报废的资产"
        open={isAssetSelectModalVisible}
        onOk={handleAssetSelect}
        onCancel={() => setIsAssetSelectModalVisible(false)}
        width={1000}
      >
        <Table
          columns={assetColumns}
          dataSource={mockAssets}
          rowKey="code"
          rowSelection={{
            type: 'radio',
            selectedRowKeys: selectedAssets,
            onChange: (selectedRowKeys) => {
              setSelectedAssets(selectedRowKeys as string[]);
            },
          }}
          pagination={false}
          scroll={{ x: 800 }}
        />
      </Modal>

      {/* 新增/编辑模态框 */}
      <Modal
        title={editingRecord ? '编辑报废申请' : '新增报废申请'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
        width={1000}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Divider orientation="left">资产信息</Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="assetCode" label="资产编码">
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="assetName" label="资产名称">
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="assetType" label="资产类型">
                <Input disabled />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="specification" label="规格型号">
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="originalValue" label="原值(元)">
                <InputNumber disabled style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="currentValue" label="现值(元)">
                <InputNumber disabled style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="department" label="使用部门">
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="custodian" label="保管人">
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="location" label="存放位置">
                <Input disabled />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">报废信息</Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item 
                name="retirementType" 
                label="报废类型" 
                rules={[{ required: true, message: '请选择报废类型' }]}
              >
                <Select placeholder="请选择报废类型">
                  <Option value="normal">正常报废</Option>
                  <Option value="damage">损坏报废</Option>
                  <Option value="obsolete">技术淘汰</Option>
                  <Option value="other">其他</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item 
                name="applicant" 
                label="申请人" 
                rules={[{ required: true, message: '请输入申请人' }]}
              >
                <Input placeholder="请输入申请人" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item 
                name="applicationDate" 
                label="申请日期" 
                rules={[{ required: true, message: '请选择申请日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item 
            name="retirementReason" 
            label="报废原因" 
            rules={[{ required: true, message: '请输入报废原因' }]}
          >
            <TextArea rows={3} placeholder="请详细说明报废原因" />
          </Form.Item>

          <Divider orientation="left">处置方式</Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item 
                name="disposalMethod" 
                label="处置方式" 
                rules={[{ required: true, message: '请选择处置方式' }]}
              >
                <Select placeholder="请选择处置方式">
                  <Option value="recycle">回收处理</Option>
                  <Option value="discard">废弃处理</Option>
                  <Option value="donate">捐赠处理</Option>
                  <Option value="sell">出售处理</Option>
                  <Option value="repair">维修后继续使用</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="disposalValue" label="处置价值(元)">
                <InputNumber 
                  placeholder="请输入处置价值" 
                  style={{ width: '100%' }}
                  min={0}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="disposalDate" label="预计处置日期">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="disposalRemarks" label="处置备注">
            <TextArea rows={2} placeholder="请输入处置相关备注" />
          </Form.Item>

          <Form.Item name="attachments" label="附件上传">
            <Upload>
              <Button icon={<UploadOutlined />}>上传文件</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      {/* 详情模态框 */}
      <Modal
        title="报废申请详情"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={null}
        width={900}
      >
        {selectedRecord && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="申请单号">{selectedRecord.applicationNo}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={getStatusColor(selectedRecord.status)}>{selectedRecord.statusText}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="资产编码">{selectedRecord.assetCode}</Descriptions.Item>
              <Descriptions.Item label="资产名称">{selectedRecord.assetName}</Descriptions.Item>
              <Descriptions.Item label="资产类型">{selectedRecord.assetType}</Descriptions.Item>
              <Descriptions.Item label="规格型号">{selectedRecord.specification}</Descriptions.Item>
              <Descriptions.Item label="序列号">{selectedRecord.serialNumber}</Descriptions.Item>
              <Descriptions.Item label="使用年限">{selectedRecord.usageYears}年</Descriptions.Item>
              <Descriptions.Item label="原值">{selectedRecord.originalValue?.toLocaleString()}元</Descriptions.Item>
              <Descriptions.Item label="现值">{selectedRecord.currentValue?.toLocaleString()}元</Descriptions.Item>
              <Descriptions.Item label="折旧率">{selectedRecord.depreciationRate}%</Descriptions.Item>
              <Descriptions.Item label="购买日期">{selectedRecord.purchaseDate}</Descriptions.Item>
              <Descriptions.Item label="使用部门">{selectedRecord.department}</Descriptions.Item>
              <Descriptions.Item label="保管人">{selectedRecord.custodian}</Descriptions.Item>
              <Descriptions.Item label="存放位置" span={2}>{selectedRecord.location}</Descriptions.Item>
              <Descriptions.Item label="报废类型">
                <Tag color={getRetirementTypeColor(selectedRecord.retirementType)}>
                  {selectedRecord.retirementTypeText}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="申请人">{selectedRecord.applicant}</Descriptions.Item>
              <Descriptions.Item label="申请日期">{selectedRecord.applicationDate}</Descriptions.Item>
              <Descriptions.Item label="处置方式">{selectedRecord.disposalMethodText}</Descriptions.Item>
              {selectedRecord.disposalValue && (
                <Descriptions.Item label="处置价值">{selectedRecord.disposalValue.toLocaleString()}元</Descriptions.Item>
              )}
              {selectedRecord.disposalDate && (
                <Descriptions.Item label="处置日期">{selectedRecord.disposalDate}</Descriptions.Item>
              )}
              <Descriptions.Item label="报废原因" span={2}>{selectedRecord.retirementReason}</Descriptions.Item>
              {selectedRecord.disposalRemarks && (
                <Descriptions.Item label="处置备注" span={2}>{selectedRecord.disposalRemarks}</Descriptions.Item>
              )}
              {selectedRecord.approver && (
                <>
                  <Descriptions.Item label="审批人">{selectedRecord.approver}</Descriptions.Item>
                  <Descriptions.Item label="审批日期">{selectedRecord.approveDate}</Descriptions.Item>
                </>
              )}
              {selectedRecord.approveRemarks && (
                <Descriptions.Item label="审批备注" span={2}>{selectedRecord.approveRemarks}</Descriptions.Item>
              )}
              {selectedRecord.rejectReason && (
                <Descriptions.Item label="拒绝原因" span={2}>{selectedRecord.rejectReason}</Descriptions.Item>
              )}
              <Descriptions.Item label="创建人">{selectedRecord.createUser}</Descriptions.Item>
              <Descriptions.Item label="创建时间">{selectedRecord.createDate}</Descriptions.Item>
              {selectedRecord.updateUser && (
                <>
                  <Descriptions.Item label="更新人">{selectedRecord.updateUser}</Descriptions.Item>
                  <Descriptions.Item label="更新时间">{selectedRecord.updateDate}</Descriptions.Item>
                </>
              )}
            </Descriptions>
          </div>
        )}
      </Modal>

      {/* 审批模态框 */}
      <Modal
        title={approveAction === 'approve' ? '审批通过' : '审批拒绝'}
        open={isApproveModalVisible}
        onOk={handleApproveSubmit}
        onCancel={() => {
          setIsApproveModalVisible(false);
          setSelectedRecord(null);
          approveForm.resetFields();
        }}
        width={600}
      >
        <Form form={approveForm} layout="vertical">
          <Form.Item name="action" label="审批动作">
            <Radio.Group 
              value={approveAction} 
              onChange={(e) => setApproveAction(e.target.value)}
            >
              <Radio value="approve">通过</Radio>
              <Radio value="reject">拒绝</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item 
            name="remarks" 
            label={approveAction === 'approve' ? '审批备注' : '拒绝原因'}
            rules={[{ required: true, message: `请输入${approveAction === 'approve' ? '审批备注' : '拒绝原因'}` }]}
          >
            <TextArea 
              rows={4} 
              placeholder={`请输入${approveAction === 'approve' ? '审批备注' : '拒绝原因'}`} 
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AssetRetirement;