import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Card, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Space, 
  message, 
  DatePicker, 
  Row, 
  Col, 
  Descriptions, 
  Tag,
  Radio,
  InputNumber
} from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

// 资产调拨接口
interface AssetTransfer {
  id: string;
  transferNo: string;
  assetCode: string;
  assetName: string;
  assetCategory: string;
  currentDepartment: string;
  currentLocation: string;
  targetDepartment: string;
  targetLocation: string;
  transferReason: string;
  applicant: string;
  applyDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'transferred' | 'completed' | 'archived';
  statusText: string;
  approver?: string;
  approveDate?: string;
  approveRemark?: string;
  rejectReason?: string;
  transferDate?: string;
  transferOperator?: string;
  receiveDate?: string;
  receiver?: string;
  receiveRemark?: string;
  archiveDate?: string;
  archiveOperator?: string;
  archiveRemark?: string;
  createUser: string;
  createDate: string;
  updateUser: string;
  updateDate: string;
}

// 部门信息接口
interface Department {
  id: string;
  name: string;
  code: string;
}

// 位置信息接口
interface Location {
  id: string;
  name: string;
  code: string;
  departmentId: string;
}

const AssetTransfer: React.FC = () => {
  const [data, setData] = useState<AssetTransfer[]>([]);
  const [filteredData, setFilteredData] = useState<AssetTransfer[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isApproveModalVisible, setIsApproveModalVisible] = useState(false);
  const [isTransferModalVisible, setIsTransferModalVisible] = useState(false);
  const [isReceiveModalVisible, setIsReceiveModalVisible] = useState(false);
  const [isArchiveModalVisible, setIsArchiveModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AssetTransfer | null>(null);

  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [approveForm] = Form.useForm();
  const [transferForm] = Form.useForm();
  const [receiveForm] = Form.useForm();
  const [archiveForm] = Form.useForm();

  // 模拟部门数据
  const departments: Department[] = [
    { id: '1', name: '行政部', code: 'ADMIN' },
    { id: '2', name: '财务部', code: 'FINANCE' },
    { id: '3', name: '技术部', code: 'TECH' },
    { id: '4', name: '销售部', code: 'SALES' },
    { id: '5', name: '人事部', code: 'HR' },
  ];

  // 模拟位置数据
  const locations: Location[] = [
    { id: '1', name: '办公室A', code: 'OFFICE_A', departmentId: '1' },
    { id: '2', name: '办公室B', code: 'OFFICE_B', departmentId: '1' },
    { id: '3', name: '财务室', code: 'FINANCE_ROOM', departmentId: '2' },
    { id: '4', name: '会议室', code: 'MEETING_ROOM', departmentId: '2' },
    { id: '5', name: '开发区A', code: 'DEV_A', departmentId: '3' },
    { id: '6', name: '开发区B', code: 'DEV_B', departmentId: '3' },
    { id: '7', name: '销售大厅', code: 'SALES_HALL', departmentId: '4' },
    { id: '8', name: '客户接待室', code: 'RECEPTION', departmentId: '4' },
    { id: '9', name: '人事办公室', code: 'HR_OFFICE', departmentId: '5' },
    { id: '10', name: '培训室', code: 'TRAINING_ROOM', departmentId: '5' },
  ];

  // 模拟数据
  const mockData: AssetTransfer[] = [
    {
      id: '1',
      transferNo: 'TF202401001',
      assetCode: 'PC001',
      assetName: '联想台式电脑',
      assetCategory: '办公设备',
      currentDepartment: '技术部',
      currentLocation: '开发区A',
      targetDepartment: '销售部',
      targetLocation: '销售大厅',
      transferReason: '部门调整，需要将设备调拨至销售部使用',
      applicant: '张三',
      applyDate: '2024-01-15',
      status: 'pending',
      statusText: '待审批',
      createUser: '张三',
      createDate: '2024-01-15 09:00:00',
      updateUser: '张三',
      updateDate: '2024-01-15 09:00:00',
    },
    {
      id: '2',
      transferNo: 'TF202401002',
      assetCode: 'PR001',
      assetName: 'HP激光打印机',
      assetCategory: '办公设备',
      currentDepartment: '行政部',
      currentLocation: '办公室A',
      targetDepartment: '财务部',
      targetLocation: '财务室',
      transferReason: '财务部打印机故障，临时调拨使用',
      applicant: '李四',
      applyDate: '2024-01-14',
      status: 'approved',
      statusText: '已审批',
      approver: '王五',
      approveDate: '2024-01-14',
      approveRemark: '同意调拨',
      createUser: '李四',
      createDate: '2024-01-14 10:30:00',
      updateUser: '王五',
      updateDate: '2024-01-14 14:20:00',
    },
    {
      id: '3',
      transferNo: 'TF202401003',
      assetCode: 'CH001',
      assetName: '办公椅',
      assetCategory: '办公家具',
      currentDepartment: '人事部',
      currentLocation: '人事办公室',
      targetDepartment: '技术部',
      targetLocation: '开发区B',
      transferReason: '新员工入职，需要增加办公椅',
      applicant: '赵六',
      applyDate: '2024-01-13',
      status: 'transferred',
      statusText: '已调出',
      approver: '王五',
      approveDate: '2024-01-13',
      approveRemark: '同意调拨',
      transferDate: '2024-01-14',
      transferOperator: '孙七',
      createUser: '赵六',
      createDate: '2024-01-13 11:15:00',
      updateUser: '孙七',
      updateDate: '2024-01-14 16:45:00',
    },
    {
      id: '4',
      transferNo: 'TF202401004',
      assetCode: 'TB001',
      assetName: '会议桌',
      assetCategory: '办公家具',
      currentDepartment: '销售部',
      currentLocation: '客户接待室',
      targetDepartment: '人事部',
      targetLocation: '培训室',
      transferReason: '培训室需要会议桌进行培训活动',
      applicant: '周八',
      applyDate: '2024-01-12',
      status: 'completed',
      statusText: '已完成',
      approver: '王五',
      approveDate: '2024-01-12',
      approveRemark: '同意调拨',
      transferDate: '2024-01-13',
      transferOperator: '孙七',
      receiveDate: '2024-01-13',
      receiver: '吴九',
      receiveRemark: '设备状态良好，已接收',
      createUser: '周八',
      createDate: '2024-01-12 14:20:00',
      updateUser: '吴九',
      updateDate: '2024-01-13 17:30:00',
    },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      setTimeout(() => {
        setData(mockData);
        setFilteredData(mockData);
        setLoading(false);
      }, 1000);
    } catch (error) {
      message.error('加载数据失败');
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      const values = await searchForm.validateFields();
      let filtered = data;

      // 调拨单号筛选
      if (values.transferNo) {
        filtered = filtered.filter(item => 
          item.transferNo.toLowerCase().includes(values.transferNo.toLowerCase())
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

      // 资产类别筛选
      if (values.assetCategory) {
        filtered = filtered.filter(item => item.assetCategory === values.assetCategory);
      }

      // 当前部门筛选
      if (values.currentDepartment) {
        filtered = filtered.filter(item => item.currentDepartment === values.currentDepartment);
      }

      // 当前位置筛选
      if (values.currentLocation) {
        filtered = filtered.filter(item => 
          item.currentLocation.toLowerCase().includes(values.currentLocation.toLowerCase())
        );
      }

      // 目标部门筛选
      if (values.targetDepartment) {
        filtered = filtered.filter(item => item.targetDepartment === values.targetDepartment);
      }

      // 目标位置筛选
      if (values.targetLocation) {
        filtered = filtered.filter(item => 
          item.targetLocation.toLowerCase().includes(values.targetLocation.toLowerCase())
        );
      }

      // 调拨原因筛选
      if (values.transferReason) {
        filtered = filtered.filter(item => 
          item.transferReason.toLowerCase().includes(values.transferReason.toLowerCase())
        );
      }

      // 申请人筛选
      if (values.applicant) {
        filtered = filtered.filter(item => 
          item.applicant.toLowerCase().includes(values.applicant.toLowerCase())
        );
      }

      // 状态筛选
      if (values.status) {
        filtered = filtered.filter(item => item.status === values.status);
      }

      // 审批人筛选
      if (values.approver) {
        filtered = filtered.filter(item => 
          item.approver && item.approver.toLowerCase().includes(values.approver.toLowerCase())
        );
      }

      // 审批备注筛选
      if (values.approveRemark) {
        filtered = filtered.filter(item => 
          item.approveRemark && item.approveRemark.toLowerCase().includes(values.approveRemark.toLowerCase())
        );
      }

      // 拒绝原因筛选
      if (values.rejectReason) {
        filtered = filtered.filter(item => 
          item.rejectReason && item.rejectReason.toLowerCase().includes(values.rejectReason.toLowerCase())
        );
      }

      // 调拨操作员筛选
      if (values.transferOperator) {
        filtered = filtered.filter(item => 
          item.transferOperator && item.transferOperator.toLowerCase().includes(values.transferOperator.toLowerCase())
        );
      }

      // 接收人筛选
      if (values.receiver) {
        filtered = filtered.filter(item => 
          item.receiver && item.receiver.toLowerCase().includes(values.receiver.toLowerCase())
        );
      }

      // 接收备注筛选
      if (values.receiveRemark) {
        filtered = filtered.filter(item => 
          item.receiveRemark && item.receiveRemark.toLowerCase().includes(values.receiveRemark.toLowerCase())
        );
      }

      // 归档操作员筛选
      if (values.archiveOperator) {
        filtered = filtered.filter(item => 
          item.archiveOperator && item.archiveOperator.toLowerCase().includes(values.archiveOperator.toLowerCase())
        );
      }

      // 归档备注筛选
      if (values.archiveRemark) {
        filtered = filtered.filter(item => 
          item.archiveRemark && item.archiveRemark.toLowerCase().includes(values.archiveRemark.toLowerCase())
        );
      }

      // 创建人筛选
      if (values.createUser) {
        filtered = filtered.filter(item => 
          item.createUser.toLowerCase().includes(values.createUser.toLowerCase())
        );
      }

      // 更新人筛选
      if (values.updateUser) {
        filtered = filtered.filter(item => 
          item.updateUser.toLowerCase().includes(values.updateUser.toLowerCase())
        );
      }

      // 申请日期范围筛选
      if (values.applyDateRange && values.applyDateRange.length === 2) {
        const [startDate, endDate] = values.applyDateRange;
        filtered = filtered.filter(item => {
          const applyDate = dayjs(item.applyDate);
          return applyDate.isAfter(startDate.subtract(1, 'day')) && 
                 applyDate.isBefore(endDate.add(1, 'day'));
        });
      }

      // 审批日期范围筛选
      if (values.approveDateRange && values.approveDateRange.length === 2) {
        const [startDate, endDate] = values.approveDateRange;
        filtered = filtered.filter(item => {
          if (!item.approveDate) return false;
          const approveDate = dayjs(item.approveDate);
          return approveDate.isAfter(startDate.subtract(1, 'day')) && 
                 approveDate.isBefore(endDate.add(1, 'day'));
        });
      }

      // 调拨日期范围筛选
      if (values.transferDateRange && values.transferDateRange.length === 2) {
        const [startDate, endDate] = values.transferDateRange;
        filtered = filtered.filter(item => {
          if (!item.transferDate) return false;
          const transferDate = dayjs(item.transferDate);
          return transferDate.isAfter(startDate.subtract(1, 'day')) && 
                 transferDate.isBefore(endDate.add(1, 'day'));
        });
      }

      // 接收日期范围筛选
      if (values.receiveDateRange && values.receiveDateRange.length === 2) {
        const [startDate, endDate] = values.receiveDateRange;
        filtered = filtered.filter(item => {
          if (!item.receiveDate) return false;
          const receiveDate = dayjs(item.receiveDate);
          return receiveDate.isAfter(startDate.subtract(1, 'day')) && 
                 receiveDate.isBefore(endDate.add(1, 'day'));
        });
      }

      // 归档日期范围筛选
      if (values.archiveDateRange && values.archiveDateRange.length === 2) {
        const [startDate, endDate] = values.archiveDateRange;
        filtered = filtered.filter(item => {
          if (!item.archiveDate) return false;
          const archiveDate = dayjs(item.archiveDate);
          return archiveDate.isAfter(startDate.subtract(1, 'day')) && 
                 archiveDate.isBefore(endDate.add(1, 'day'));
        });
      }

      // 创建时间范围筛选
      if (values.createDateRange && values.createDateRange.length === 2) {
        const [startDate, endDate] = values.createDateRange;
        filtered = filtered.filter(item => {
          const createDate = dayjs(item.createDate);
          return createDate.isAfter(startDate.subtract(1, 'second')) && 
                 createDate.isBefore(endDate.add(1, 'second'));
        });
      }

      // 更新时间范围筛选
      if (values.updateDateRange && values.updateDateRange.length === 2) {
        const [startDate, endDate] = values.updateDateRange;
        filtered = filtered.filter(item => {
          const updateDate = dayjs(item.updateDate);
          return updateDate.isAfter(startDate.subtract(1, 'second')) && 
                 updateDate.isBefore(endDate.add(1, 'second'));
        });
      }

      setFilteredData(filtered);
    } catch (error) {
      console.error('搜索失败:', error);
    }
  };

  const handleReset = () => {
    searchForm.resetFields();
    setFilteredData(data);
  };

  const handleAdd = () => {
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleEdit = (record: AssetTransfer) => {
    setSelectedRecord(record);
    setIsEditModalVisible(true);
    form.setFieldsValue({
      ...record,
      applyDate: dayjs(record.applyDate),
    });
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条调拨记录吗？',
      onOk: () => {
        const newData = data.filter(item => item.id !== id);
        setData(newData);
        setFilteredData(newData);
        message.success('删除成功');
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const newRecord: AssetTransfer = {
        id: Date.now().toString(),
        transferNo: `TF${dayjs().format('YYYYMMDD')}${String(data.length + 1).padStart(3, '0')}`,
        assetCode: values.assetCode,
        assetName: values.assetName,
        assetCategory: values.assetCategory,
        currentDepartment: values.currentDepartment,
        currentLocation: values.currentLocation,
        targetDepartment: values.targetDepartment,
        targetLocation: values.targetLocation,
        transferReason: values.transferReason,
        applicant: values.applicant,
        applyDate: values.applyDate.format('YYYY-MM-DD'),
        status: 'pending',
        statusText: '待审批',
        createUser: '当前用户',
        createDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        updateUser: '当前用户',
        updateDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      };

      const newData = [...data, newRecord];
      setData(newData);
      setFilteredData(newData);
      setIsModalVisible(false);
      form.resetFields();
      message.success('添加成功');
    } catch (error) {
      console.error('添加失败:', error);
    }
  };

  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (!selectedRecord) return;

      const updatedRecord: AssetTransfer = {
        ...selectedRecord,
        assetCode: values.assetCode,
        assetName: values.assetName,
        assetCategory: values.assetCategory,
        currentDepartment: values.currentDepartment,
        currentLocation: values.currentLocation,
        targetDepartment: values.targetDepartment,
        targetLocation: values.targetLocation,
        transferReason: values.transferReason,
        applicant: values.applicant,
        applyDate: values.applyDate.format('YYYY-MM-DD'),
        updateUser: '当前用户',
        updateDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      };

      const newData = data.map(item => 
        item.id === selectedRecord.id ? updatedRecord : item
      );
      setData(newData);
      setFilteredData(newData);
      setIsEditModalVisible(false);
      form.resetFields();
      setSelectedRecord(null);
      message.success('更新成功');
    } catch (error) {
      console.error('更新失败:', error);
    }
  };

  const handleDetail = (record: AssetTransfer) => {
    setSelectedRecord(record);
    setIsDetailModalVisible(true);
  };

  const handleApprove = (record: AssetTransfer) => {
    setSelectedRecord(record);
    setIsApproveModalVisible(true);
    approveForm.resetFields();
  };

  const handleApproveSubmit = async () => {
    try {
      const values = await approveForm.validateFields();
      if (!selectedRecord) return;

      const isApproved = values.action === 'approve';
      const updatedRecord: AssetTransfer = {
        ...selectedRecord,
        status: isApproved ? 'approved' : 'rejected',
        statusText: isApproved ? '已审批' : '已拒绝',
        approver: '当前用户',
        approveDate: dayjs().format('YYYY-MM-DD'),
        approveRemark: values.approveRemark,
        rejectReason: isApproved ? undefined : values.rejectReason,
        updateUser: '当前用户',
        updateDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      };

      const newData = data.map(item => 
        item.id === selectedRecord.id ? updatedRecord : item
      );
      setData(newData);
      setFilteredData(newData);
      
      message.success(isApproved ? '审批通过' : '审批拒绝');
      setIsApproveModalVisible(false);
      approveForm.resetFields();
      setSelectedRecord(null);
    } catch (error) {
      console.error('审批失败:', error);
    }
  };

  const handleTransfer = (record: AssetTransfer) => {
    setSelectedRecord(record);
    setIsTransferModalVisible(true);
    transferForm.setFieldsValue({
      transferDate: dayjs(),
    });
  };

  const handleTransferSubmit = async () => {
    try {
      const values = await transferForm.validateFields();
      if (!selectedRecord) return;

      const updatedRecord: AssetTransfer = {
        ...selectedRecord,
        status: 'transferred',
        statusText: '已调出',
        transferDate: values.transferDate.format('YYYY-MM-DD'),
        transferOperator: '当前用户',
        updateUser: '当前用户',
        updateDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      };

      const newData = data.map(item => 
        item.id === selectedRecord.id ? updatedRecord : item
      );
      setData(newData);
      setFilteredData(newData);
      
      message.success('调拨执行成功');
      setIsTransferModalVisible(false);
      transferForm.resetFields();
      setSelectedRecord(null);
    } catch (error) {
      console.error('调拨执行失败:', error);
    }
  };

  const handleReceive = (record: AssetTransfer) => {
    setSelectedRecord(record);
    setIsReceiveModalVisible(true);
    receiveForm.setFieldsValue({
      receiveDate: dayjs(),
    });
  };

  const handleReceiveSubmit = async () => {
    try {
      const values = await receiveForm.validateFields();
      if (!selectedRecord) return;

      const updatedRecord: AssetTransfer = {
        ...selectedRecord,
        status: 'completed',
        statusText: '已完成',
        receiveDate: values.receiveDate.format('YYYY-MM-DD'),
        receiver: '当前用户',
        receiveRemark: values.receiveRemark,
        updateUser: '当前用户',
        updateDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      };

      const newData = data.map(item => 
        item.id === selectedRecord.id ? updatedRecord : item
      );
      setData(newData);
      setFilteredData(newData);
      
      message.success('接收确认成功');
      setIsReceiveModalVisible(false);
      receiveForm.resetFields();
      setSelectedRecord(null);
    } catch (error) {
      console.error('接收确认失败:', error);
    }
  };

  const handleArchive = (record: AssetTransfer) => {
    setSelectedRecord(record);
    setIsArchiveModalVisible(true);
    archiveForm.resetFields();
  };

  const handleArchiveSubmit = async () => {
    try {
      const values = await archiveForm.validateFields();
      if (!selectedRecord) return;

      const updatedRecord: AssetTransfer = {
        ...selectedRecord,
        status: 'archived',
        statusText: '已归档',
        archiveDate: dayjs().format('YYYY-MM-DD'),
        archiveOperator: '当前用户',
        archiveRemark: values.archiveRemark,
        updateUser: '当前用户',
        updateDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      };

      const newData = data.map(item => 
        item.id === selectedRecord.id ? updatedRecord : item
      );
      setData(newData);
      setFilteredData(newData);
      
      message.success('归档成功');
      setIsArchiveModalVisible(false);
      archiveForm.resetFields();
      setSelectedRecord(null);
    } catch (error) {
      console.error('归档失败:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'orange',
      approved: 'blue',
      rejected: 'red',
      transferred: 'purple',
      completed: 'green',
      archived: 'gray',
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getLocationsByDepartment = (departmentName: string) => {
    const department = departments.find(d => d.name === departmentName);
    if (!department) return [];
    return locations.filter(l => l.departmentId === department.id);
  };

  const columns: ColumnsType<AssetTransfer> = [
    {
      title: '序号',
      key: 'index',
      width: 60,
      fixed: 'left',
      render: (_, __, index) => index + 1,
    },
    {
      title: '调拨单号',
      dataIndex: 'transferNo',
      key: 'transferNo',
      width: 120,
      fixed: 'left',
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
    },
    {
      title: '资产类别',
      dataIndex: 'assetCategory',
      key: 'assetCategory',
      width: 100,
    },
    {
      title: '当前部门',
      dataIndex: 'currentDepartment',
      key: 'currentDepartment',
      width: 100,
    },
    {
      title: '当前位置',
      dataIndex: 'currentLocation',
      key: 'currentLocation',
      width: 100,
    },
    {
      title: '目标部门',
      dataIndex: 'targetDepartment',
      key: 'targetDepartment',
      width: 100,
    },
    {
      title: '目标位置',
      dataIndex: 'targetLocation',
      key: 'targetLocation',
      width: 100,
    },
    {
      title: '申请人',
      dataIndex: 'applicant',
      key: 'applicant',
      width: 80,
    },
    {
      title: '申请日期',
      dataIndex: 'applyDate',
      key: 'applyDate',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'statusText',
      key: 'statusText',
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
                onClick={() => handleEdit(record)}
              >
                编辑
              </Button>
              <Button 
                type="link" 
                size="small" 
                danger
                onClick={() => handleDelete(record.id)}
              >
                删除
              </Button>
            </>
          )}
          {record.status === 'approved' && (
            <Button 
              type="link" 
              size="small"
              onClick={() => handleTransfer(record)}
            >
              执行调拨
            </Button>
          )}
          {record.status === 'transferred' && (
            <Button 
              type="link" 
              size="small"
              onClick={() => handleReceive(record)}
            >
              接收确认
            </Button>
          )}
          {record.status === 'completed' && (
            <Button 
              type="link" 
              size="small"
              onClick={() => handleArchive(record)}
            >
              归档
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Form form={searchForm} layout="vertical" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item label="调拨单号" name="transferNo">
                <Input placeholder="请输入调拨单号" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="资产编码" name="assetCode">
                <Input placeholder="请输入资产编码" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="资产名称" name="assetName">
                <Input placeholder="请输入资产名称" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="资产类别" name="assetCategory">
                <Select placeholder="请选择资产类别" allowClear>
                  <Option value="办公设备">办公设备</Option>
                  <Option value="办公家具">办公家具</Option>
                  <Option value="电子设备">电子设备</Option>
                  <Option value="车辆">车辆</Option>
                  <Option value="其他">其他</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item label="当前部门" name="currentDepartment">
                <Select placeholder="请选择当前部门" allowClear>
                  {departments.map(dept => (
                    <Option key={dept.id} value={dept.name}>{dept.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="当前位置" name="currentLocation">
                <Input placeholder="请输入当前位置" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="目标部门" name="targetDepartment">
                <Select placeholder="请选择目标部门" allowClear>
                  {departments.map(dept => (
                    <Option key={dept.id} value={dept.name}>{dept.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="目标位置" name="targetLocation">
                <Input placeholder="请输入目标位置" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item label="调拨原因" name="transferReason">
                <Input placeholder="请输入调拨原因" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="申请人" name="applicant">
                <Input placeholder="请输入申请人" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="状态" name="status">
                <Select placeholder="请选择状态" allowClear>
                  <Option value="pending">待审批</Option>
                  <Option value="approved">已审批</Option>
                  <Option value="rejected">已拒绝</Option>
                  <Option value="transferred">已调出</Option>
                  <Option value="completed">已完成</Option>
                  <Option value="archived">已归档</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="审批人" name="approver">
                <Input placeholder="请输入审批人" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item label="审批备注" name="approveRemark">
                <Input placeholder="请输入审批备注" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="拒绝原因" name="rejectReason">
                <Input placeholder="请输入拒绝原因" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="调拨操作员" name="transferOperator">
                <Input placeholder="请输入调拨操作员" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="接收人" name="receiver">
                <Input placeholder="请输入接收人" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item label="接收备注" name="receiveRemark">
                <Input placeholder="请输入接收备注" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="归档操作员" name="archiveOperator">
                <Input placeholder="请输入归档操作员" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="归档备注" name="archiveRemark">
                <Input placeholder="请输入归档备注" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="创建人" name="createUser">
                <Input placeholder="请输入创建人" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item label="更新人" name="updateUser">
                <Input placeholder="请输入更新人" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="申请日期" name="applyDateRange">
                <RangePicker placeholder={['开始日期', '结束日期']} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="审批日期" name="approveDateRange">
                <RangePicker placeholder={['开始日期', '结束日期']} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="调拨日期" name="transferDateRange">
                <RangePicker placeholder={['开始日期', '结束日期']} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item label="接收日期" name="receiveDateRange">
                <RangePicker placeholder={['开始日期', '结束日期']} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="归档日期" name="archiveDateRange">
                <RangePicker placeholder={['开始日期', '结束日期']} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="创建时间" name="createDateRange">
                <RangePicker showTime placeholder={['开始时间', '结束时间']} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="更新时间" name="updateDateRange">
                <RangePicker showTime placeholder={['开始时间', '结束时间']} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          
          <Row>
            <Col span={24}>
              <Form.Item>
                <Space>
                  <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                    搜索
                  </Button>
                  <Button onClick={handleReset}>重置</Button>
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                    新增调拨
                  </Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1400 }}
          pagination={{
            total: filteredData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      {/* 新增/编辑模态框 */}
      <Modal
        title={selectedRecord ? '编辑调拨申请' : '新增调拨申请'}
        open={isModalVisible || isEditModalVisible}
        onOk={selectedRecord ? handleEditSubmit : handleSubmit}
        onCancel={() => {
          setIsModalVisible(false);
          setIsEditModalVisible(false);
          form.resetFields();
          setSelectedRecord(null);
        }}
        width={800}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="assetCode"
                label="资产编码"
                rules={[{ required: true, message: '请输入资产编码' }]}
              >
                <Input placeholder="请输入资产编码" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="assetName"
                label="资产名称"
                rules={[{ required: true, message: '请输入资产名称' }]}
              >
                <Input placeholder="请输入资产名称" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="assetCategory"
                label="资产类别"
                rules={[{ required: true, message: '请选择资产类别' }]}
              >
                <Select placeholder="请选择资产类别">
                  <Option value="办公设备">办公设备</Option>
                  <Option value="办公家具">办公家具</Option>
                  <Option value="电子设备">电子设备</Option>
                  <Option value="车辆">车辆</Option>
                  <Option value="其他">其他</Option>
                </Select>
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
                name="currentDepartment"
                label="当前部门"
                rules={[{ required: true, message: '请选择当前部门' }]}
              >
                <Select 
                  placeholder="请选择当前部门"
                  onChange={() => form.setFieldsValue({ currentLocation: undefined })}
                >
                  {departments.map(dept => (
                    <Option key={dept.id} value={dept.name}>{dept.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="currentLocation"
                label="当前位置"
                rules={[{ required: true, message: '请选择当前位置' }]}
              >
                <Select placeholder="请选择当前位置">
                  {form.getFieldValue('currentDepartment') && 
                    getLocationsByDepartment(form.getFieldValue('currentDepartment')).map(loc => (
                      <Option key={loc.id} value={loc.name}>{loc.name}</Option>
                    ))
                  }
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="targetDepartment"
                label="目标部门"
                rules={[{ required: true, message: '请选择目标部门' }]}
              >
                <Select 
                  placeholder="请选择目标部门"
                  onChange={() => form.setFieldsValue({ targetLocation: undefined })}
                >
                  {departments.map(dept => (
                    <Option key={dept.id} value={dept.name}>{dept.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="targetLocation"
                label="目标位置"
                rules={[{ required: true, message: '请选择目标位置' }]}
              >
                <Select placeholder="请选择目标位置">
                  {form.getFieldValue('targetDepartment') && 
                    getLocationsByDepartment(form.getFieldValue('targetDepartment')).map(loc => (
                      <Option key={loc.id} value={loc.name}>{loc.name}</Option>
                    ))
                  }
                </Select>
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
          </Row>

          <Form.Item
            name="transferReason"
            label="调拨原因"
            rules={[{ required: true, message: '请输入调拨原因' }]}
          >
            <TextArea rows={3} placeholder="请输入调拨原因" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 详情模态框 */}
      <Modal
        title="调拨详情"
        open={isDetailModalVisible}
        onCancel={() => {
          setIsDetailModalVisible(false);
          setSelectedRecord(null);
        }}
        footer={null}
        width={800}
      >
        {selectedRecord && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="调拨单号">{selectedRecord.transferNo}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={getStatusColor(selectedRecord.status)}>{selectedRecord.statusText}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="资产编码">{selectedRecord.assetCode}</Descriptions.Item>
            <Descriptions.Item label="资产名称">{selectedRecord.assetName}</Descriptions.Item>
            <Descriptions.Item label="资产类别">{selectedRecord.assetCategory}</Descriptions.Item>
            <Descriptions.Item label="申请人">{selectedRecord.applicant}</Descriptions.Item>
            <Descriptions.Item label="申请日期">{selectedRecord.applyDate}</Descriptions.Item>
            <Descriptions.Item label="当前部门">{selectedRecord.currentDepartment}</Descriptions.Item>
            <Descriptions.Item label="当前位置">{selectedRecord.currentLocation}</Descriptions.Item>
            <Descriptions.Item label="目标部门">{selectedRecord.targetDepartment}</Descriptions.Item>
            <Descriptions.Item label="目标位置">{selectedRecord.targetLocation}</Descriptions.Item>
            <Descriptions.Item label="调拨原因" span={2}>{selectedRecord.transferReason}</Descriptions.Item>
            
            {selectedRecord.approver && (
              <>
                <Descriptions.Item label="审批人">{selectedRecord.approver}</Descriptions.Item>
                <Descriptions.Item label="审批日期">{selectedRecord.approveDate}</Descriptions.Item>
                {selectedRecord.approveRemark && (
                  <Descriptions.Item label="审批备注" span={2}>{selectedRecord.approveRemark}</Descriptions.Item>
                )}
                {selectedRecord.rejectReason && (
                  <Descriptions.Item label="拒绝原因" span={2}>{selectedRecord.rejectReason}</Descriptions.Item>
                )}
              </>
            )}
            
            {selectedRecord.transferOperator && (
              <>
                <Descriptions.Item label="调拨执行人">{selectedRecord.transferOperator}</Descriptions.Item>
                <Descriptions.Item label="调拨日期">{selectedRecord.transferDate}</Descriptions.Item>
              </>
            )}
            
            {selectedRecord.receiver && (
              <>
                <Descriptions.Item label="接收人">{selectedRecord.receiver}</Descriptions.Item>
                <Descriptions.Item label="接收日期">{selectedRecord.receiveDate}</Descriptions.Item>
                {selectedRecord.receiveRemark && (
                  <Descriptions.Item label="接收备注" span={2}>{selectedRecord.receiveRemark}</Descriptions.Item>
                )}
              </>
            )}
            
            <Descriptions.Item label="创建人">{selectedRecord.createUser}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{selectedRecord.createDate}</Descriptions.Item>
            <Descriptions.Item label="更新人">{selectedRecord.updateUser}</Descriptions.Item>
            <Descriptions.Item label="更新时间">{selectedRecord.updateDate}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* 审批模态框 */}
      <Modal
        title="审批调拨申请"
        open={isApproveModalVisible}
        onOk={handleApproveSubmit}
        onCancel={() => {
          setIsApproveModalVisible(false);
          approveForm.resetFields();
          setSelectedRecord(null);
        }}
        width={800}
      >
        {/* 调拨详情信息 */}
        {selectedRecord && (
          <Card title="调拨详情" style={{ marginBottom: 16 }}>
            <Descriptions column={2} size="small">
              <Descriptions.Item label="调拨单号">{selectedRecord.transferNo}</Descriptions.Item>
              <Descriptions.Item label="申请时间">{selectedRecord.applyDate}</Descriptions.Item>
              <Descriptions.Item label="申请人">{selectedRecord.applicant}</Descriptions.Item>
              <Descriptions.Item label="当前状态">
                <Tag color={
                  selectedRecord.status === 'pending' ? 'orange' :
                  selectedRecord.status === 'approved' ? 'green' :
                  selectedRecord.status === 'rejected' ? 'red' :
                  selectedRecord.status === 'transferred' ? 'blue' : 'purple'
                }>
                  {selectedRecord.statusText}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="资产编号">{selectedRecord.assetCode}</Descriptions.Item>
              <Descriptions.Item label="资产名称">{selectedRecord.assetName}</Descriptions.Item>
              <Descriptions.Item label="资产类别">{selectedRecord.assetCategory}</Descriptions.Item>
              <Descriptions.Item label="调拨原因">{selectedRecord.transferReason}</Descriptions.Item>
              <Descriptions.Item label="原部门">{selectedRecord.currentDepartment}</Descriptions.Item>
              <Descriptions.Item label="目标部门">{selectedRecord.targetDepartment}</Descriptions.Item>
              <Descriptions.Item label="原位置">{selectedRecord.currentLocation}</Descriptions.Item>
              <Descriptions.Item label="目标位置">{selectedRecord.targetLocation}</Descriptions.Item>
              {selectedRecord.approver && (
                <>
                  <Descriptions.Item label="审批人">{selectedRecord.approver}</Descriptions.Item>
                  <Descriptions.Item label="审批时间">{selectedRecord.approveDate}</Descriptions.Item>
                  {selectedRecord.approveRemark && (
                    <Descriptions.Item label="审批备注" span={2}>{selectedRecord.approveRemark}</Descriptions.Item>
                  )}
                </>
              )}
              {selectedRecord.rejectReason && (
                <Descriptions.Item label="拒绝原因" span={2}>{selectedRecord.rejectReason}</Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        )}

        <Form form={approveForm} layout="vertical">
          <Form.Item
            name="action"
            label="审批动作"
            rules={[{ required: true, message: '请选择审批动作' }]}
          >
            <Radio.Group>
              <Radio value="approve">通过</Radio>
              <Radio value="reject">拒绝</Radio>
            </Radio.Group>
          </Form.Item>
          
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => 
              prevValues.action !== currentValues.action
            }
          >
            {({ getFieldValue }) => {
              const action = getFieldValue('action');
              return action === 'approve' ? (
                <Form.Item
                  name="approveRemark"
                  label="审批备注"
                >
                  <TextArea rows={3} placeholder="请输入审批备注（可选）" />
                </Form.Item>
              ) : action === 'reject' ? (
                <Form.Item
                  name="rejectReason"
                  label="拒绝原因"
                  rules={[{ required: true, message: '请输入拒绝原因' }]}
                >
                  <TextArea rows={3} placeholder="请输入拒绝原因" />
                </Form.Item>
              ) : null;
            }}
          </Form.Item>
        </Form>
      </Modal>

      {/* 调拨执行模态框 */}
      <Modal
        title="执行调拨"
        open={isTransferModalVisible}
        onOk={handleTransferSubmit}
        onCancel={() => {
          setIsTransferModalVisible(false);
          transferForm.resetFields();
          setSelectedRecord(null);
        }}
        width={800}
      >
        {selectedRecord && (
          <div style={{ marginBottom: 24 }}>
            <Card title="调拨详情" size="small">
              <Descriptions column={2} size="small">
                <Descriptions.Item label="调拨单号">
                  {selectedRecord.transferNo}
                </Descriptions.Item>
                <Descriptions.Item label="申请时间">
                  {selectedRecord.applyDate}
                </Descriptions.Item>
                <Descriptions.Item label="申请人">
                  {selectedRecord.applicant}
                </Descriptions.Item>
                <Descriptions.Item label="目标接收人">
                  {selectedRecord.receiver || '待确认'}
                </Descriptions.Item>
                <Descriptions.Item label="资产编号">
                  {selectedRecord.assetCode}
                </Descriptions.Item>
                <Descriptions.Item label="资产名称">
                  {selectedRecord.assetName}
                </Descriptions.Item>
                <Descriptions.Item label="资产类别">
                  {selectedRecord.assetCategory}
                </Descriptions.Item>
                <Descriptions.Item label="调拨原因">
                  {selectedRecord.transferReason}
                </Descriptions.Item>
                <Descriptions.Item label="原部门">
                  {selectedRecord.currentDepartment}
                </Descriptions.Item>
                <Descriptions.Item label="目标部门">
                  {selectedRecord.targetDepartment}
                </Descriptions.Item>
                <Descriptions.Item label="原位置">
                  {selectedRecord.currentLocation}
                </Descriptions.Item>
                <Descriptions.Item label="目标位置">
                  {selectedRecord.targetLocation}
                </Descriptions.Item>
                {selectedRecord.approver && (
                  <Descriptions.Item label="审批人">
                    {selectedRecord.approver}
                  </Descriptions.Item>
                )}
                {selectedRecord.approveDate && (
                  <Descriptions.Item label="审批时间">
                    {selectedRecord.approveDate}
                  </Descriptions.Item>
                )}
                {selectedRecord.approveRemark && (
                  <Descriptions.Item label="审批备注" span={2}>
                    {selectedRecord.approveRemark}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          </div>
        )}
        
        <Form form={transferForm} layout="vertical">
          <Form.Item
            name="transferDate"
            label="调拨日期"
            rules={[{ required: true, message: '请选择调拨日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="transferOperator"
            label="调拨执行人"
            rules={[{ required: true, message: '请输入调拨执行人姓名' }]}
          >
            <Input placeholder="请输入调拨执行人姓名" />
          </Form.Item>
          <Form.Item
            name="transferRemark"
            label="调拨备注"
          >
            <TextArea rows={3} placeholder="请输入调拨备注（可选）" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 接收确认模态框 */}
      <Modal
        title="接收确认"
        open={isReceiveModalVisible}
        onOk={handleReceiveSubmit}
        onCancel={() => {
          setIsReceiveModalVisible(false);
          receiveForm.resetFields();
          setSelectedRecord(null);
        }}
        width={800}
      >
        {selectedRecord && (
          <div style={{ marginBottom: 24 }}>
            <Card title="调拨详情" size="small">
              <Descriptions column={2} size="small">
                <Descriptions.Item label="调拨单号">
                  {selectedRecord.transferNo}
                </Descriptions.Item>
                <Descriptions.Item label="调拨时间">
                  {selectedRecord.transferDate || selectedRecord.applyDate}
                </Descriptions.Item>
                <Descriptions.Item label="调拨人">
                  {selectedRecord.transferOperator || selectedRecord.applicant}
                </Descriptions.Item>
                <Descriptions.Item label="接收人">
                  {selectedRecord.receiver || '待确认'}
                </Descriptions.Item>
                <Descriptions.Item label="资产编号">
                  {selectedRecord.assetCode}
                </Descriptions.Item>
                <Descriptions.Item label="资产名称">
                  {selectedRecord.assetName}
                </Descriptions.Item>
                <Descriptions.Item label="资产类别">
                  {selectedRecord.assetCategory}
                </Descriptions.Item>
                <Descriptions.Item label="调拨原因">
                  {selectedRecord.transferReason}
                </Descriptions.Item>
                <Descriptions.Item label="原部门">
                  {selectedRecord.currentDepartment}
                </Descriptions.Item>
                <Descriptions.Item label="目标部门">
                  {selectedRecord.targetDepartment}
                </Descriptions.Item>
                <Descriptions.Item label="原位置">
                  {selectedRecord.currentLocation}
                </Descriptions.Item>
                <Descriptions.Item label="目标位置">
                  {selectedRecord.targetLocation}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </div>
        )}
        
        <Form form={receiveForm} layout="vertical">
          <Form.Item
            name="receiveDate"
            label="接收日期"
            rules={[{ required: true, message: '请选择接收日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="receiver"
            label="接收人"
            rules={[{ required: true, message: '请输入接收人姓名' }]}
          >
            <Input placeholder="请输入接收人姓名" />
          </Form.Item>
          <Form.Item
            name="receiveRemark"
            label="接收备注"
          >
            <TextArea rows={3} placeholder="请输入接收备注（可选）" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 归档模态框 */}
      <Modal
        title="记录归档"
        open={isArchiveModalVisible}
        onOk={handleArchiveSubmit}
        onCancel={() => {
          setIsArchiveModalVisible(false);
          archiveForm.resetFields();
          setSelectedRecord(null);
        }}
        width={800}
      >
        {selectedRecord && (
          <div style={{ marginBottom: 24 }}>
            <Card title="调拨详情" size="small">
              <Descriptions column={2} size="small">
                <Descriptions.Item label="调拨单号">
                  {selectedRecord.transferNo}
                </Descriptions.Item>
                <Descriptions.Item label="申请日期">
                  {selectedRecord.applyDate}
                </Descriptions.Item>
                <Descriptions.Item label="申请人">
                  {selectedRecord.applicant}
                </Descriptions.Item>
                <Descriptions.Item label="接收人">
                  {selectedRecord.receiver}
                </Descriptions.Item>
                <Descriptions.Item label="资产编号">
                  {selectedRecord.assetCode}
                </Descriptions.Item>
                <Descriptions.Item label="资产名称">
                  {selectedRecord.assetName}
                </Descriptions.Item>
                <Descriptions.Item label="资产类别">
                  {selectedRecord.assetCategory}
                </Descriptions.Item>
                <Descriptions.Item label="调拨原因">
                  {selectedRecord.transferReason}
                </Descriptions.Item>
                <Descriptions.Item label="原部门">
                  {selectedRecord.currentDepartment}
                </Descriptions.Item>
                <Descriptions.Item label="目标部门">
                  {selectedRecord.targetDepartment}
                </Descriptions.Item>
                <Descriptions.Item label="原位置">
                  {selectedRecord.currentLocation}
                </Descriptions.Item>
                <Descriptions.Item label="目标位置">
                  {selectedRecord.targetLocation}
                </Descriptions.Item>
                <Descriptions.Item label="接收日期">
                  {selectedRecord.receiveDate}
                </Descriptions.Item>
                <Descriptions.Item label="当前状态">
                  <Tag color={getStatusColor(selectedRecord.status)}>
                    {selectedRecord.statusText}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </div>
        )}
        
        <Form form={archiveForm} layout="vertical">
          <Form.Item
            name="archiveDate"
            label="归档日期"
            rules={[{ required: true, message: '请选择归档日期' }]}
            initialValue={dayjs()}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="archiveOperator"
            label="归档操作人"
            rules={[{ required: true, message: '请输入归档操作人姓名' }]}
            initialValue="当前用户"
          >
            <Input placeholder="请输入归档操作人姓名" />
          </Form.Item>
          <Form.Item
            name="archiveRemark"
            label="归档备注"
          >
            <TextArea rows={3} placeholder="请输入归档备注（可选）" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AssetTransfer;