import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Space,
  Tag,
  Popconfirm,
  message,
  Row,
  Col,
  InputNumber,
  Upload,
  Descriptions,
  Divider
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, UploadOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

// 维修记录接口
interface MaintenanceRecord {
  id: string;
  assetId: string;
  assetName: string;
  assetCode: string;
  maintenanceType: 'preventive' | 'corrective' | 'emergency';
  faultDescription: string;
  maintenanceDescription: string;
  applicant: string;
  department: string;
  applyDate: string;
  status: 'pending' | 'approved' | 'in_progress' | 'completed' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedCost: number;
  actualCost?: number;
  maintenanceCompany?: string;
  technician?: string;
  startDate?: string;
  completedDate?: string;
  approver?: string;
  approveDate?: string;
  approveRemark?: string;
  attachments?: string[];
  nextMaintenanceDate?: string;
}

// 资产信息接口
interface AssetInfo {
  id: string;
  code: string;
  name: string;
  category: string;
  department: string;
  location: string;
  status: string;
}

const AssetMaintenance: React.FC = () => {
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<MaintenanceRecord[]>([]);
  const [assets, setAssets] = useState<AssetInfo[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isApproveModalVisible, setIsApproveModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MaintenanceRecord | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceRecord | null>(null);
  const [form] = Form.useForm();
  const [approveForm] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 筛选表单
  const [searchForm] = Form.useForm();

  // 模拟数据
  useEffect(() => {
    // 模拟资产数据
    const mockAssets: AssetInfo[] = [
      { id: '1', code: 'PC001', name: '联想台式机', category: '办公设备', department: '技术部', location: '办公楼3F-301', status: '正常' },
      { id: '2', code: 'PR001', name: 'HP激光打印机', category: '办公设备', department: '行政部', location: '办公楼2F-201', status: '正常' },
      { id: '3', code: 'AC001', name: '格力空调', category: '电器设备', department: '会议室', location: '办公楼1F-会议室A', status: '故障' },
      { id: '4', code: 'CAR001', name: '丰田凯美瑞', category: '车辆', department: '总经办', location: '地下车库', status: '正常' },
    ];

    // 模拟维修记录数据
    const mockRecords: MaintenanceRecord[] = [
      {
        id: '1',
        assetId: '3',
        assetName: '格力空调',
        assetCode: 'AC001',
        maintenanceType: 'corrective',
        faultDescription: '空调制冷效果差，噪音大',
        maintenanceDescription: '清洗过滤网，检查制冷剂，更换压缩机',
        applicant: '张三',
        department: '行政部',
        applyDate: '2024-01-15',
        status: 'completed',
        priority: 'high',
        estimatedCost: 800,
        actualCost: 750,
        maintenanceCompany: '格力售后服务中心',
        technician: '李师傅',
        startDate: '2024-01-16',
        completedDate: '2024-01-17',
        approver: '王经理',
        approveDate: '2024-01-15',
        approveRemark: '同意维修',
        nextMaintenanceDate: '2024-07-15'
      },
      {
        id: '2',
        assetId: '2',
        assetName: 'HP激光打印机',
        assetCode: 'PR001',
        maintenanceType: 'preventive',
        faultDescription: '',
        maintenanceDescription: '定期保养，清洁内部，更换硒鼓',
        applicant: '李四',
        department: '行政部',
        applyDate: '2024-01-20',
        status: 'in_progress',
        priority: 'medium',
        estimatedCost: 300,
        maintenanceCompany: 'HP授权服务商',
        technician: '赵师傅',
        startDate: '2024-01-21',
        approver: '王经理',
        approveDate: '2024-01-20',
        approveRemark: '同意保养',
        nextMaintenanceDate: '2024-07-20'
      },
      {
        id: '3',
        assetId: '1',
        assetName: '联想台式机',
        assetCode: 'PC001',
        maintenanceType: 'corrective',
        faultDescription: '电脑频繁蓝屏，运行缓慢',
        maintenanceDescription: '检查硬件，重装系统，升级内存',
        applicant: '王五',
        department: '技术部',
        applyDate: '2024-01-22',
        status: 'pending',
        priority: 'medium',
        estimatedCost: 500
      }
    ];

    setAssets(mockAssets);
    setMaintenanceRecords(mockRecords);
    setFilteredRecords(mockRecords);
  }, []);

  // 筛选逻辑
  const handleSearch = (values: any) => {
    let filtered = maintenanceRecords;

    // 维修单号筛选
    if (values.id) {
      filtered = filtered.filter(item =>
        item.id.toLowerCase().includes(values.id.toLowerCase())
      );
    }

    // 资产编码筛选
    if (values.assetCode) {
      filtered = filtered.filter(item =>
        item.assetCode.toLowerCase().includes(values.assetCode.toLowerCase())
      );
    }

    // 资产名称筛选
    if (values.assetName) {
      filtered = filtered.filter(item =>
        item.assetName.toLowerCase().includes(values.assetName.toLowerCase())
      );
    }

    // 维修类型筛选
    if (values.maintenanceType) {
      filtered = filtered.filter(item => item.maintenanceType === values.maintenanceType);
    }

    // 故障描述筛选
    if (values.faultDescription) {
      filtered = filtered.filter(item =>
        item.faultDescription.toLowerCase().includes(values.faultDescription.toLowerCase())
      );
    }

    // 维修内容筛选
    if (values.maintenanceDescription) {
      filtered = filtered.filter(item =>
        item.maintenanceDescription.toLowerCase().includes(values.maintenanceDescription.toLowerCase())
      );
    }

    // 申请人筛选
    if (values.applicant) {
      filtered = filtered.filter(item =>
        item.applicant.toLowerCase().includes(values.applicant.toLowerCase())
      );
    }

    // 申请部门筛选
    if (values.department) {
      filtered = filtered.filter(item =>
        item.department.toLowerCase().includes(values.department.toLowerCase())
      );
    }

    // 状态筛选
    if (values.status) {
      filtered = filtered.filter(item => item.status === values.status);
    }

    // 优先级筛选
    if (values.priority) {
      filtered = filtered.filter(item => item.priority === values.priority);
    }

    // 预估费用范围筛选
    if (values.estimatedCostRange) {
      const [minCost, maxCost] = values.estimatedCostRange;
      if (minCost !== undefined || maxCost !== undefined) {
        filtered = filtered.filter(item => {
          if (minCost !== undefined && maxCost !== undefined) {
            return item.estimatedCost >= minCost && item.estimatedCost <= maxCost;
          } else if (minCost !== undefined) {
            return item.estimatedCost >= minCost;
          } else if (maxCost !== undefined) {
            return item.estimatedCost <= maxCost;
          }
          return true;
        });
      }
    }

    // 实际费用范围筛选
    if (values.actualCostRange) {
      const [minCost, maxCost] = values.actualCostRange;
      if (minCost !== undefined || maxCost !== undefined) {
        filtered = filtered.filter(item => {
          if (!item.actualCost) return false;
          if (minCost !== undefined && maxCost !== undefined) {
            return item.actualCost >= minCost && item.actualCost <= maxCost;
          } else if (minCost !== undefined) {
            return item.actualCost >= minCost;
          } else if (maxCost !== undefined) {
            return item.actualCost <= maxCost;
          }
          return true;
        });
      }
    }

    // 维修公司筛选
    if (values.maintenanceCompany) {
      filtered = filtered.filter(item =>
        item.maintenanceCompany?.toLowerCase().includes(values.maintenanceCompany.toLowerCase())
      );
    }

    // 技术员筛选
    if (values.technician) {
      filtered = filtered.filter(item =>
        item.technician?.toLowerCase().includes(values.technician.toLowerCase())
      );
    }

    // 申请日期范围筛选
    if (values.applyDateRange && values.applyDateRange.length === 2) {
      const [startDate, endDate] = values.applyDateRange;
      filtered = filtered.filter(item => {
        const itemDate = dayjs(item.applyDate);
        return itemDate.isAfter(startDate.startOf('day')) && itemDate.isBefore(endDate.endOf('day'));
      });
    }

    // 开始日期范围筛选
    if (values.startDateRange && values.startDateRange.length === 2) {
      const [startDate, endDate] = values.startDateRange;
      filtered = filtered.filter(item => {
        if (!item.startDate) return false;
        const itemDate = dayjs(item.startDate);
        return itemDate.isAfter(startDate.startOf('day')) && itemDate.isBefore(endDate.endOf('day'));
      });
    }

    // 完成日期范围筛选
    if (values.completedDateRange && values.completedDateRange.length === 2) {
      const [startDate, endDate] = values.completedDateRange;
      filtered = filtered.filter(item => {
        if (!item.completedDate) return false;
        const itemDate = dayjs(item.completedDate);
        return itemDate.isAfter(startDate.startOf('day')) && itemDate.isBefore(endDate.endOf('day'));
      });
    }

    // 审批人筛选
    if (values.approver) {
      filtered = filtered.filter(item =>
        item.approver?.toLowerCase().includes(values.approver.toLowerCase())
      );
    }

    // 审批日期范围筛选
    if (values.approveDateRange && values.approveDateRange.length === 2) {
      const [startDate, endDate] = values.approveDateRange;
      filtered = filtered.filter(item => {
        if (!item.approveDate) return false;
        const itemDate = dayjs(item.approveDate);
        return itemDate.isAfter(startDate.startOf('day')) && itemDate.isBefore(endDate.endOf('day'));
      });
    }

    // 下次维修日期范围筛选
    if (values.nextMaintenanceDateRange && values.nextMaintenanceDateRange.length === 2) {
      const [startDate, endDate] = values.nextMaintenanceDateRange;
      filtered = filtered.filter(item => {
        if (!item.nextMaintenanceDate) return false;
        const itemDate = dayjs(item.nextMaintenanceDate);
        return itemDate.isAfter(startDate.startOf('day')) && itemDate.isBefore(endDate.endOf('day'));
      });
    }

    setFilteredRecords(filtered);
  };

  // 重置筛选条件
  const handleReset = () => {
    searchForm.resetFields();
    setFilteredRecords(maintenanceRecords);
  };

  // 监听筛选条件变化，自动触发搜索
  useEffect(() => {
    if (maintenanceRecords.length > 0) {
      handleSearch({});
    }
  }, [maintenanceRecords]);

  // 状态标签颜色
  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'orange',
      approved: 'blue',
      in_progress: 'purple',
      completed: 'green',
      rejected: 'red'
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  // 优先级标签颜色
  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'green',
      medium: 'orange',
      high: 'red',
      urgent: 'magenta'
    };
    return colors[priority as keyof typeof colors] || 'default';
  };

  // 维修类型标签颜色
  const getMaintenanceTypeColor = (type: string) => {
    const colors = {
      preventive: 'blue',
      corrective: 'orange',
      emergency: 'red'
    };
    return colors[type as keyof typeof colors] || 'default';
  };

  // 表格列定义
  const columns: ColumnsType<MaintenanceRecord> = [
    {
      title: '序号',
      key: 'index',
      width: 60,
      fixed: 'left',
      render: (_, __, index) => index + 1,
    },
    {
      title: '维修单号',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (text) => `MR${text.padStart(4, '0')}`
    },
    {
      title: '资产信息',
      key: 'asset',
      width: 200,
      render: (_, record) => (
        <div>
          <div>{record.assetName}</div>
          <div style={{ color: '#666', fontSize: '12px' }}>{record.assetCode}</div>
        </div>
      )
    },
    {
      title: '维修类型',
      dataIndex: 'maintenanceType',
      key: 'maintenanceType',
      width: 100,
      render: (type) => {
        const typeMap = {
          preventive: '预防性维修',
          corrective: '纠正性维修',
          emergency: '紧急维修'
        };
        return (
          <Tag color={getMaintenanceTypeColor(type)}>
            {typeMap[type as keyof typeof typeMap]}
          </Tag>
        );
      }
    },
    {
      title: '申请人',
      dataIndex: 'applicant',
      key: 'applicant',
      width: 80
    },
    {
      title: '申请部门',
      dataIndex: 'department',
      key: 'department',
      width: 100
    },
    {
      title: '申请日期',
      dataIndex: 'applyDate',
      key: 'applyDate',
      width: 100
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      render: (priority) => {
        const priorityMap = {
          low: '低',
          medium: '中',
          high: '高',
          urgent: '紧急'
        };
        return (
          <Tag color={getPriorityColor(priority)}>
            {priorityMap[priority as keyof typeof priorityMap]}
          </Tag>
        );
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusMap = {
          pending: '待审批',
          approved: '已审批',
          in_progress: '维修中',
          completed: '已完成',
          rejected: '已拒绝'
        };
        return (
          <Tag color={getStatusColor(status)}>
            {statusMap[status as keyof typeof statusMap]}
          </Tag>
        );
      }
    },
    {
      title: '预估费用',
      dataIndex: 'estimatedCost',
      key: 'estimatedCost',
      width: 100,
      render: (cost) => `¥${cost?.toFixed(2) || '0.00'}`
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleDetail(record)}
          >
            详情
          </Button>
          {record.status === 'pending' && (
            <>
              <Button
                type="link"
                size="small"
                onClick={() => handleApprove(record)}
              >
                审批
              </Button>
              <Button
                type="link"
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
              >
                编辑
              </Button>
            </>
          )}
          {record.status === 'approved' && (
            <Button
              type="link"
              size="small"
              onClick={() => handleStartMaintenance(record)}
            >
              开始维修
            </Button>
          )}
          {record.status === 'in_progress' && (
            <Button
              type="link"
              size="small"
              onClick={() => handleCompleteMaintenance(record)}
            >
              完成维修
            </Button>
          )}
          <Popconfirm
            title="确定删除这条维修记录吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // 处理新增
  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // 处理编辑
  const handleEdit = (record: MaintenanceRecord) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      applyDate: dayjs(record.applyDate),
      startDate: record.startDate ? dayjs(record.startDate) : undefined,
      completedDate: record.completedDate ? dayjs(record.completedDate) : undefined,
      nextMaintenanceDate: record.nextMaintenanceDate ? dayjs(record.nextMaintenanceDate) : undefined
    });
    setIsModalVisible(true);
  };

  // 处理删除
  const handleDelete = (id: string) => {
    setMaintenanceRecords(prev => prev.filter(record => record.id !== id));
    message.success('删除成功');
  };

  // 处理详情查看
  const handleDetail = (record: MaintenanceRecord) => {
    setSelectedRecord(record);
    setIsDetailModalVisible(true);
  };

  // 处理审批
  const handleApprove = (record: MaintenanceRecord) => {
    setSelectedRecord(record);
    approveForm.resetFields();
    setIsApproveModalVisible(true);
  };

  // 处理开始维修
  const handleStartMaintenance = (record: MaintenanceRecord) => {
    const updatedRecords = maintenanceRecords.map(r =>
      r.id === record.id
        ? { ...r, status: 'in_progress' as const, startDate: dayjs().format('YYYY-MM-DD') }
        : r
    );
    setMaintenanceRecords(updatedRecords);
    message.success('维修已开始');
  };

  // 处理完成维修
  const handleCompleteMaintenance = (record: MaintenanceRecord) => {
    Modal.confirm({
      title: '完成维修',
      content: (
        <Form layout="vertical">
          <Form.Item label="实际费用" name="actualCost">
            <InputNumber
              style={{ width: '100%' }}
              placeholder="请输入实际费用"
              min={0}
              precision={2}
              addonBefore="¥"
            />
          </Form.Item>
          <Form.Item label="维修总结" name="summary">
            <TextArea rows={3} placeholder="请输入维修总结" />
          </Form.Item>
        </Form>
      ),
      onOk: () => {
        const updatedRecords = maintenanceRecords.map(r =>
          r.id === record.id
            ? { 
                ...r, 
                status: 'completed' as const, 
                completedDate: dayjs().format('YYYY-MM-DD'),
                actualCost: record.estimatedCost // 这里应该从表单获取实际值
              }
            : r
        );
        setMaintenanceRecords(updatedRecords);
        message.success('维修已完成');
      }
    });
  };

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const newRecord: MaintenanceRecord = {
        id: editingRecord ? editingRecord.id : Date.now().toString(),
        assetId: values.assetId,
        assetName: assets.find(a => a.id === values.assetId)?.name || '',
        assetCode: assets.find(a => a.id === values.assetId)?.code || '',
        maintenanceType: values.maintenanceType,
        faultDescription: values.faultDescription || '',
        maintenanceDescription: values.maintenanceDescription,
        applicant: values.applicant,
        department: values.department,
        applyDate: values.applyDate.format('YYYY-MM-DD'),
        status: 'pending',
        priority: values.priority,
        estimatedCost: values.estimatedCost,
        maintenanceCompany: values.maintenanceCompany,
        technician: values.technician,
        nextMaintenanceDate: values.nextMaintenanceDate?.format('YYYY-MM-DD')
      };

      if (editingRecord) {
        setMaintenanceRecords(prev =>
          prev.map(record => record.id === editingRecord.id ? { ...record, ...newRecord } : record)
        );
        message.success('维修记录更新成功');
      } else {
        setMaintenanceRecords(prev => [...prev, newRecord]);
        message.success('维修记录创建成功');
      }

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('表单验证失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 处理审批提交
  const handleApproveSubmit = async () => {
    try {
      const values = await approveForm.validateFields();
      
      if (selectedRecord) {
        const updatedRecords = maintenanceRecords.map(record =>
          record.id === selectedRecord.id
            ? {
                ...record,
                status: values.action === 'approve' ? 'approved' as const : 'rejected' as const,
                approver: '当前用户', // 实际应该从用户上下文获取
                approveDate: dayjs().format('YYYY-MM-DD'),
                approveRemark: values.remark
              }
            : record
        );
        setMaintenanceRecords(updatedRecords);
        message.success(values.action === 'approve' ? '审批通过' : '审批拒绝');
      }

      setIsApproveModalVisible(false);
      approveForm.resetFields();
    } catch (error) {
      console.error('审批失败:', error);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title="资产维修管理"
      >
        {/* 筛选条件 */}
        <div style={{ marginBottom: 16, padding: 16, backgroundColor: '#fafafa', borderRadius: 6 }}>
          <Form
            form={searchForm}
            layout="vertical"
            onFinish={handleSearch}
          >
            <Row gutter={[16, 8]}>
              <Col span={6}>
                <Form.Item name="id" label="维修单号">
                  <Input placeholder="请输入维修单号" allowClear />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="assetCode" label="资产编码">
                  <Input placeholder="请输入资产编码" allowClear />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="assetName" label="资产名称">
                  <Input placeholder="请输入资产名称" allowClear />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="maintenanceType" label="维修类型">
                  <Select placeholder="请选择维修类型" allowClear>
                    <Option value="preventive">预防性维修</Option>
                    <Option value="corrective">纠正性维修</Option>
                    <Option value="emergency">紧急维修</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 8]}>
              <Col span={6}>
                <Form.Item name="faultDescription" label="故障描述">
                  <Input placeholder="请输入故障描述" allowClear />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="maintenanceDescription" label="维修内容">
                  <Input placeholder="请输入维修内容" allowClear />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="applicant" label="申请人">
                  <Input placeholder="请输入申请人" allowClear />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="department" label="申请部门">
                  <Input placeholder="请输入申请部门" allowClear />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 8]}>
              <Col span={6}>
                <Form.Item name="status" label="状态">
                  <Select placeholder="请选择状态" allowClear>
                    <Option value="pending">待审批</Option>
                    <Option value="approved">已审批</Option>
                    <Option value="in_progress">维修中</Option>
                    <Option value="completed">已完成</Option>
                    <Option value="rejected">已拒绝</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="priority" label="优先级">
                  <Select placeholder="请选择优先级" allowClear>
                    <Option value="low">低</Option>
                    <Option value="medium">中</Option>
                    <Option value="high">高</Option>
                    <Option value="urgent">紧急</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                 <Form.Item label="预估费用范围">
                   <Input.Group compact>
                     <Form.Item name={['estimatedCostRange', 0]} noStyle>
                       <InputNumber
                         style={{ width: '45%' }}
                         placeholder="最小值"
                         min={0}
                         precision={2}
                       />
                     </Form.Item>
                     <Input
                       style={{ width: '10%', textAlign: 'center', pointerEvents: 'none' }}
                       placeholder="~"
                       disabled
                     />
                     <Form.Item name={['estimatedCostRange', 1]} noStyle>
                       <InputNumber
                         style={{ width: '45%' }}
                         placeholder="最大值"
                         min={0}
                         precision={2}
                       />
                     </Form.Item>
                   </Input.Group>
                 </Form.Item>
               </Col>
               <Col span={6}>
                 <Form.Item label="实际费用范围">
                   <Input.Group compact>
                     <Form.Item name={['actualCostRange', 0]} noStyle>
                       <InputNumber
                         style={{ width: '45%' }}
                         placeholder="最小值"
                         min={0}
                         precision={2}
                       />
                     </Form.Item>
                     <Input
                       style={{ width: '10%', textAlign: 'center', pointerEvents: 'none' }}
                       placeholder="~"
                       disabled
                     />
                     <Form.Item name={['actualCostRange', 1]} noStyle>
                       <InputNumber
                         style={{ width: '45%' }}
                         placeholder="最大值"
                         min={0}
                         precision={2}
                       />
                     </Form.Item>
                   </Input.Group>
                 </Form.Item>
               </Col>
            </Row>

            <Row gutter={[16, 8]}>
              <Col span={6}>
                <Form.Item name="maintenanceCompany" label="维修公司">
                  <Input placeholder="请输入维修公司" allowClear />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="technician" label="技术员">
                  <Input placeholder="请输入技术员" allowClear />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="applyDateRange" label="申请日期">
                  <RangePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="startDateRange" label="开始维修日期">
                  <RangePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 8]}>
              <Col span={6}>
                <Form.Item name="completedDateRange" label="完成日期">
                  <RangePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="approver" label="审批人">
                  <Input placeholder="请输入审批人" allowClear />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="approveDateRange" label="审批日期">
                  <RangePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="nextMaintenanceDateRange" label="下次维修日期">
                  <RangePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Row>
              <Col span={24}>
                <Space>
                  <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                    搜索
                  </Button>
                  <Button onClick={handleReset}>
                    重置
                  </Button>
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                    新增维修申请
                  </Button>
                </Space>
              </Col>
            </Row>
          </Form>
        </div>

        <Table
          columns={columns}
          dataSource={filteredRecords}
          rowKey="id"
          pagination={{
            total: filteredRecords.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 新增/编辑模态框 */}
      <Modal
        title={editingRecord ? '编辑维修记录' : '新增维修申请'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        width={800}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="资产"
                name="assetId"
                rules={[{ required: true, message: '请选择资产' }]}
              >
                <Select placeholder="请选择资产" showSearch>
                  {assets.map(asset => (
                    <Option key={asset.id} value={asset.id}>
                      {asset.name} ({asset.code})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="维修类型"
                name="maintenanceType"
                rules={[{ required: true, message: '请选择维修类型' }]}
              >
                <Select placeholder="请选择维修类型">
                  <Option value="preventive">预防性维修</Option>
                  <Option value="corrective">纠正性维修</Option>
                  <Option value="emergency">紧急维修</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="申请人"
                name="applicant"
                rules={[{ required: true, message: '请输入申请人' }]}
              >
                <Input placeholder="请输入申请人" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="申请部门"
                name="department"
                rules={[{ required: true, message: '请输入申请部门' }]}
              >
                <Input placeholder="请输入申请部门" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="申请日期"
                name="applyDate"
                rules={[{ required: true, message: '请选择申请日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="优先级"
                name="priority"
                rules={[{ required: true, message: '请选择优先级' }]}
              >
                <Select placeholder="请选择优先级">
                  <Option value="low">低</Option>
                  <Option value="medium">中</Option>
                  <Option value="high">高</Option>
                  <Option value="urgent">紧急</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="故障描述"
            name="faultDescription"
          >
            <TextArea rows={3} placeholder="请描述故障现象（预防性维修可不填）" />
          </Form.Item>

          <Form.Item
            label="维修内容"
            name="maintenanceDescription"
            rules={[{ required: true, message: '请输入维修内容' }]}
          >
            <TextArea rows={3} placeholder="请详细描述维修内容和要求" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="预估费用"
                name="estimatedCost"
                rules={[{ required: true, message: '请输入预估费用' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="请输入预估费用"
                  min={0}
                  precision={2}
                  addonBefore="¥"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="维修公司"
                name="maintenanceCompany"
              >
                <Input placeholder="请输入维修公司" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="技术员"
                name="technician"
              >
                <Input placeholder="请输入技术员姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="下次维修日期"
                name="nextMaintenanceDate"
              >
                <DatePicker style={{ width: '100%' }} placeholder="请选择下次维修日期" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* 详情模态框 */}
      <Modal
        title="维修记录详情"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {selectedRecord && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="维修单号">
              MR{selectedRecord.id.padStart(4, '0')}
            </Descriptions.Item>
            <Descriptions.Item label="资产信息">
              {selectedRecord.assetName} ({selectedRecord.assetCode})
            </Descriptions.Item>
            <Descriptions.Item label="维修类型">
              <Tag color={getMaintenanceTypeColor(selectedRecord.maintenanceType)}>
                {selectedRecord.maintenanceType === 'preventive' ? '预防性维修' :
                 selectedRecord.maintenanceType === 'corrective' ? '纠正性维修' : '紧急维修'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="优先级">
              <Tag color={getPriorityColor(selectedRecord.priority)}>
                {selectedRecord.priority === 'low' ? '低' :
                 selectedRecord.priority === 'medium' ? '中' :
                 selectedRecord.priority === 'high' ? '高' : '紧急'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="申请人">{selectedRecord.applicant}</Descriptions.Item>
            <Descriptions.Item label="申请部门">{selectedRecord.department}</Descriptions.Item>
            <Descriptions.Item label="申请日期">{selectedRecord.applyDate}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={getStatusColor(selectedRecord.status)}>
                {selectedRecord.status === 'pending' ? '待审批' :
                 selectedRecord.status === 'approved' ? '已审批' :
                 selectedRecord.status === 'in_progress' ? '维修中' :
                 selectedRecord.status === 'completed' ? '已完成' : '已拒绝'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="故障描述" span={2}>
              {selectedRecord.faultDescription || '无'}
            </Descriptions.Item>
            <Descriptions.Item label="维修内容" span={2}>
              {selectedRecord.maintenanceDescription}
            </Descriptions.Item>
            <Descriptions.Item label="预估费用">
              ¥{selectedRecord.estimatedCost?.toFixed(2)}
            </Descriptions.Item>
            <Descriptions.Item label="实际费用">
              {selectedRecord.actualCost ? `¥${selectedRecord.actualCost.toFixed(2)}` : '未填写'}
            </Descriptions.Item>
            <Descriptions.Item label="维修公司">
              {selectedRecord.maintenanceCompany || '未指定'}
            </Descriptions.Item>
            <Descriptions.Item label="技术员">
              {selectedRecord.technician || '未指定'}
            </Descriptions.Item>
            <Descriptions.Item label="开始日期">
              {selectedRecord.startDate || '未开始'}
            </Descriptions.Item>
            <Descriptions.Item label="完成日期">
              {selectedRecord.completedDate || '未完成'}
            </Descriptions.Item>
            <Descriptions.Item label="审批人">
              {selectedRecord.approver || '未审批'}
            </Descriptions.Item>
            <Descriptions.Item label="审批日期">
              {selectedRecord.approveDate || '未审批'}
            </Descriptions.Item>
            <Descriptions.Item label="审批备注" span={2}>
              {selectedRecord.approveRemark || '无'}
            </Descriptions.Item>
            <Descriptions.Item label="下次维修日期">
              {selectedRecord.nextMaintenanceDate || '未设置'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* 审批模态框 */}
      <Modal
        title="维修审批"
        open={isApproveModalVisible}
        onOk={handleApproveSubmit}
        onCancel={() => {
          setIsApproveModalVisible(false);
          approveForm.resetFields();
        }}
        width={600}
      >
        <Form form={approveForm} layout="vertical">
          <Form.Item
            label="审批动作"
            name="action"
            rules={[{ required: true, message: '请选择审批动作' }]}
          >
            <Select placeholder="请选择审批动作">
              <Option value="approve">通过</Option>
              <Option value="reject">拒绝</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="审批备注"
            name="remark"
            rules={[{ required: true, message: '请输入审批备注' }]}
          >
            <TextArea rows={4} placeholder="请输入审批意见或拒绝原因" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AssetMaintenance;