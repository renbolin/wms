import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Modal, Form, Input, Select, Space, message, DatePicker, Row, Col, Descriptions, Tag, Radio } from 'antd';
import { PlusOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

// 资产领用接口
interface AssetBorrow {
  id: string;
  borrowNo: string;
  assetCode: string;
  assetName: string;
  assetType: string;
  specification: string;
  borrower: string;
  borrowerDept: string;
  borrowerPhone: string;
  borrowDate: string;
  expectedReturnDate: string;
  actualReturnDate?: string;
  borrowReason: string;
  borrowLocation: string;
  useLocation: string;
  status: 'pending' | 'approved' | 'rejected' | 'borrowed' | 'returned' | 'overdue';
  statusText: string;
  approver?: string;
  approveDate?: string;
  approveRemark?: string;
  rejectReason?: string;
  returnCondition?: string;
  returnRemark?: string;
  attachments?: string[];
  createUser: string;
  createDate: string;
  updateUser?: string;
  updateDate?: string;
}

// 资产信息接口
interface AssetInfo {
  assetCode: string;
  assetName: string;
  assetType: string;
  specification: string;
  brand: string;
  model: string;
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  location: string;
  status: string;
  custodian: string;
  isAvailable: boolean;
}

const AssetBorrow: React.FC = () => {
  const [data, setData] = useState<AssetBorrow[]>([]);
  const [filteredData, setFilteredData] = useState<AssetBorrow[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isApproveModalVisible, setIsApproveModalVisible] = useState(false);
  const [isReturnModalVisible, setIsReturnModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AssetBorrow | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<AssetBorrow | null>(null);
  const [assetList, setAssetList] = useState<AssetInfo[]>([]);
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [approveForm] = Form.useForm();
  const [returnForm] = Form.useForm();

  // 模拟资产数据
  const mockAssetList: AssetInfo[] = [
    {
      assetCode: 'FA001',
      assetName: '笔记本电脑',
      assetType: '电子设备',
      specification: 'ThinkPad X1 Carbon',
      brand: '联想',
      model: 'X1 Carbon Gen 9',
      purchaseDate: '2023-06-15',
      purchasePrice: 12000,
      currentValue: 9600,
      location: '办公室A-101',
      status: '正常',
      custodian: '张三',
      isAvailable: true,
    },
    {
      assetCode: 'FA002',
      assetName: '投影仪',
      assetType: '办公设备',
      specification: '4K高清投影仪',
      brand: '爱普生',
      model: 'EB-2247U',
      purchaseDate: '2023-08-20',
      purchasePrice: 8500,
      currentValue: 7650,
      location: '会议室B-201',
      status: '正常',
      custodian: '李四',
      isAvailable: true,
    },
  ];

  // 模拟数据
  const mockData: AssetBorrow[] = [
    {
      id: '1',
      borrowNo: 'BR20240130001',
      assetCode: 'FA001',
      assetName: '笔记本电脑',
      assetType: '电子设备',
      specification: 'ThinkPad X1 Carbon',
      borrower: '王五',
      borrowerDept: '市场部',
      borrowerPhone: '13800138001',
      borrowDate: '2024-01-30',
      expectedReturnDate: '2024-02-15',
      borrowReason: '出差使用',
      borrowLocation: '办公室A-101',
      useLocation: '客户现场',
      status: 'pending',
      statusText: '待审批',
      createUser: '王五',
      createDate: '2024-01-30 09:00:00',
    },
    {
      id: '2',
      borrowNo: 'BR20240129001',
      assetCode: 'FA002',
      assetName: '投影仪',
      assetType: '办公设备',
      specification: '4K高清投影仪',
      borrower: '赵六',
      borrowerDept: '销售部',
      borrowerPhone: '13800138002',
      borrowDate: '2024-01-29',
      expectedReturnDate: '2024-02-05',
      actualReturnDate: '2024-02-03',
      borrowReason: '客户演示',
      borrowLocation: '会议室B-201',
      useLocation: '客户会议室',
      status: 'returned',
      statusText: '已归还',
      approver: '张三',
      approveDate: '2024-01-29',
      approveRemark: '同意借用',
      returnCondition: '完好',
      returnRemark: '设备状态良好，按时归还',
      createUser: '赵六',
      createDate: '2024-01-29 10:30:00',
      updateUser: '张三',
      updateDate: '2024-02-03 16:00:00',
    },
    {
      id: '3',
      borrowNo: 'BR20240128001',
      assetCode: 'FA003',
      assetName: '数码相机',
      assetType: '电子设备',
      specification: '佳能EOS R5',
      borrower: '孙七',
      borrowerDept: '宣传部',
      borrowerPhone: '13800138003',
      borrowDate: '2024-01-28',
      expectedReturnDate: '2024-02-10',
      borrowReason: '活动拍摄',
      borrowLocation: '设备室C-301',
      useLocation: '活动现场',
      status: 'borrowed',
      statusText: '已借出',
      approver: '李四',
      approveDate: '2024-01-28',
      approveRemark: '同意借用，注意保护设备',
      createUser: '孙七',
      createDate: '2024-01-28 14:20:00',
      updateUser: '李四',
      updateDate: '2024-01-28 15:00:00',
    },
    {
      id: '4',
      borrowNo: 'BR20240127001',
      assetCode: 'FA004',
      assetName: '打印机',
      assetType: '办公设备',
      specification: 'HP LaserJet Pro',
      borrower: '周八',
      borrowerDept: '财务部',
      borrowerPhone: '13800138004',
      borrowDate: '2024-01-27',
      expectedReturnDate: '2024-02-01',
      borrowReason: '临时办公需要',
      borrowLocation: '办公室D-401',
      useLocation: '临时办公室',
      status: 'rejected',
      statusText: '已拒绝',
      approver: '张三',
      approveDate: '2024-01-27',
      rejectReason: '该设备正在维修中，暂不可借用',
      createUser: '周八',
      createDate: '2024-01-27 11:15:00',
      updateUser: '张三',
      updateDate: '2024-01-27 13:30:00',
    },
    {
      id: '5',
      borrowNo: 'BR20240125001',
      assetCode: 'FA005',
      assetName: '平板电脑',
      assetType: '电子设备',
      specification: 'iPad Pro 12.9',
      borrower: '吴九',
      borrowerDept: '技术部',
      borrowerPhone: '13800138005',
      borrowDate: '2024-01-25',
      expectedReturnDate: '2024-02-08',
      borrowReason: '移动办公',
      borrowLocation: '办公室E-501',
      useLocation: '家庭办公',
      status: 'overdue',
      statusText: '已逾期',
      approver: '李四',
      approveDate: '2024-01-25',
      approveRemark: '同意借用',
      createUser: '吴九',
      createDate: '2024-01-25 16:45:00',
      updateUser: '李四',
      updateDate: '2024-01-25 17:00:00',
    },
  ];

  useEffect(() => {
    setData(mockData);
    setFilteredData(mockData);
    setAssetList(mockAssetList);
  }, []);

  const handleAdd = () => {
    setEditingRecord(null);
    setIsModalVisible(true);
    form.resetFields();
    form.setFieldsValue({
      borrowDate: dayjs(),
      expectedReturnDate: dayjs().add(7, 'day'),
    });
  };

  const handleEdit = (record: AssetBorrow) => {
    setEditingRecord(record);
    setIsModalVisible(true);
    form.setFieldsValue({
      ...record,
      borrowDate: dayjs(record.borrowDate),
      expectedReturnDate: dayjs(record.expectedReturnDate),
      actualReturnDate: record.actualReturnDate ? dayjs(record.actualReturnDate) : undefined,
    });
  };



  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const newRecord: AssetBorrow = {
        id: editingRecord ? editingRecord.id : Date.now().toString(),
        borrowNo: editingRecord ? editingRecord.borrowNo : `BR${dayjs().format('YYYYMMDD')}${String(data.length + 1).padStart(3, '0')}`,
        assetCode: values.assetCode,
        assetName: values.assetName,
        assetType: values.assetType,
        specification: values.specification,
        borrower: values.borrower,
        borrowerDept: values.borrowerDept,
        borrowerPhone: values.borrowerPhone,
        borrowDate: values.borrowDate.format('YYYY-MM-DD'),
        expectedReturnDate: values.expectedReturnDate.format('YYYY-MM-DD'),
        actualReturnDate: values.actualReturnDate ? values.actualReturnDate.format('YYYY-MM-DD') : undefined,
        borrowReason: values.borrowReason,
        borrowLocation: values.borrowLocation,
        useLocation: values.useLocation,
        status: editingRecord ? editingRecord.status : 'pending',
        statusText: editingRecord ? editingRecord.statusText : '待审批',
        createUser: editingRecord ? editingRecord.createUser : '当前用户',
        createDate: editingRecord ? editingRecord.createDate : dayjs().format('YYYY-MM-DD HH:mm:ss'),
        updateUser: '当前用户',
        updateDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      };

      if (editingRecord) {
        const newData = data.map(item => item.id === editingRecord.id ? newRecord : item);
        setData(newData);
        setFilteredData(newData);
        message.success('修改成功');
      } else {
        const newData = [newRecord, ...data];
        setData(newData);
        setFilteredData(newData);
        message.success('添加成功');
      }

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('提交失败:', error);
    }
  };



  const handleSearch = async () => {
    try {
      const values = await searchForm.validateFields();
      let filtered = data;

      if (values.borrowNo) {
        filtered = filtered.filter(item => item.borrowNo.includes(values.borrowNo));
      }

      if (values.assetName) {
        filtered = filtered.filter(item => 
          item.assetName.includes(values.assetName) || 
          item.assetCode.includes(values.assetName)
        );
      }

      if (values.borrower) {
        filtered = filtered.filter(item => item.borrower.includes(values.borrower));
      }

      if (values.borrowerDept) {
        filtered = filtered.filter(item => item.borrowerDept === values.borrowerDept);
      }

      if (values.status) {
        filtered = filtered.filter(item => item.status === values.status);
      }

      if (values.dateRange && values.dateRange.length === 2) {
        const [startDate, endDate] = values.dateRange;
        filtered = filtered.filter(item => {
          const borrowDate = dayjs(item.borrowDate);
          return borrowDate.isAfter(startDate.subtract(1, 'day')) && borrowDate.isBefore(endDate.add(1, 'day'));
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

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'processing',
      approved: 'success',
      rejected: 'error',
      borrowed: 'warning',
      returned: 'default',
      overdue: 'error',
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const handleApprove = (record: AssetBorrow) => {
    setSelectedRecord(record);
    setIsApproveModalVisible(true);
    approveForm.resetFields();
  };

  const handleReturn = (record: AssetBorrow) => {
    setSelectedRecord(record);
    setIsReturnModalVisible(true);
    returnForm.setFieldsValue({
      actualReturnDate: dayjs(),
    });
  };

  const handleApproveSubmit = async () => {
    try {
      const values = await approveForm.validateFields();
      if (!selectedRecord) return;

      const isApproved = values.action === 'approve';
      const updatedRecord: AssetBorrow = {
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

  const handleBorrow = (record: AssetBorrow) => {
    Modal.confirm({
      title: '确认借出',
      content: `确定要将资产 ${record.assetName} 借出给 ${record.borrower} 吗？`,
      onOk: () => {
        const updatedRecord: AssetBorrow = {
          ...record,
          status: 'borrowed',
          statusText: '已借出',
          updateUser: '当前用户',
          updateDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        };

        const newData = data.map(item => 
          item.id === record.id ? updatedRecord : item
        );
        setData(newData);
        setFilteredData(newData);
        message.success('借出成功');
      },
    });
  };

  const handleReturnSubmit = async () => {
    try {
      const values = await returnForm.validateFields();
      if (!selectedRecord) return;

      const updatedRecord: AssetBorrow = {
        ...selectedRecord,
        status: 'returned',
        statusText: '已归还',
        actualReturnDate: values.actualReturnDate.format('YYYY-MM-DD'),
        returnCondition: values.returnCondition,
        returnRemark: values.returnRemark,
        updateUser: '当前用户',
        updateDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      };

      const newData = data.map(item => 
        item.id === selectedRecord.id ? updatedRecord : item
      );
      setData(newData);
      setFilteredData(newData);
      
      message.success('归还成功');
      setIsReturnModalVisible(false);
      returnForm.resetFields();
      setSelectedRecord(null);
    } catch (error) {
      console.error('归还失败:', error);
    }
  };

  const handleDetail = (record: AssetBorrow) => {
    setSelectedRecord(record);
    setIsDetailModalVisible(true);
  };

  const columns: ColumnsType<AssetBorrow> = [
    {
      title: '序号',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: '借用单号',
      dataIndex: 'borrowNo',
      key: 'borrowNo',
      width: 140,
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
      width: 120,
    },
    {
      title: '资产类型',
      dataIndex: 'assetType',
      key: 'assetType',
      width: 100,
    },
    {
      title: '借用人',
      dataIndex: 'borrower',
      key: 'borrower',
      width: 80,
    },
    {
      title: '部门',
      dataIndex: 'borrowerDept',
      key: 'borrowerDept',
      width: 80,
    },
    {
      title: '借用日期',
      dataIndex: 'borrowDate',
      key: 'borrowDate',
      width: 100,
    },
    {
      title: '预计归还',
      dataIndex: 'expectedReturnDate',
      key: 'expectedReturnDate',
      width: 100,
    },
    {
      title: '实际归还',
      dataIndex: 'actualReturnDate',
      key: 'actualReturnDate',
      width: 100,
      render: (text) => text || '-',
    },
    {
      title: '借用原因',
      dataIndex: 'borrowReason',
      key: 'borrowReason',
      width: 120,
      ellipsis: true,
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
              onClick={() => handleBorrow(record)}
            >
              借出
            </Button>
          )}
          {record.status === 'borrowed' && (
            <Button 
              type="link" 
              size="small"
              onClick={() => handleReturn(record)}
            >
              归还
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card>
        {/* 搜索表单 */}
        <Form form={searchForm} layout="inline" className="mb-4">
          <Form.Item name="borrowNo" label="借用单号">
            <Input placeholder="请输入借用单号" style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="assetName" label="资产名称/编码">
            <Input placeholder="请输入资产名称或编码" style={{ width: 180 }} />
          </Form.Item>
          <Form.Item name="borrower" label="借用人">
            <Input placeholder="请输入借用人" style={{ width: 120 }} />
          </Form.Item>
          <Form.Item name="borrowerDept" label="部门">
            <Select placeholder="请选择部门" style={{ width: 120 }}>
              <Option value="市场部">市场部</Option>
              <Option value="销售部">销售部</Option>
              <Option value="技术部">技术部</Option>
              <Option value="财务部">财务部</Option>
              <Option value="宣传部">宣传部</Option>
            </Select>
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择状态" style={{ width: 120 }}>
              <Option value="pending">待审批</Option>
              <Option value="approved">已审批</Option>
              <Option value="rejected">已拒绝</Option>
              <Option value="borrowed">已借出</Option>
              <Option value="returned">已归还</Option>
              <Option value="overdue">已逾期</Option>
            </Select>
          </Form.Item>
          <Form.Item name="dateRange" label="借用日期">
            <RangePicker style={{ width: 240 }} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                搜索
              </Button>
              <Button onClick={handleReset}>重置</Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                新增借用
              </Button>
            </Space>
          </Form.Item>
        </Form>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
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

      {/* 新增/编辑模态框 */}
      <Modal
        title={editingRecord ? '编辑借用申请' : '新增借用申请'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
        width={800}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="assetCode" 
                label="资产编码" 
                rules={[{ required: true, message: '请选择资产' }]}
              >
                <Select 
                  placeholder="请选择资产"
                  showSearch
                  filterOption={(input, option) =>
                    (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                  onChange={(value) => {
                    const asset = assetList.find(item => item.assetCode === value);
                    if (asset) {
                      form.setFieldsValue({
                        assetName: asset.assetName,
                        assetType: asset.assetType,
                        specification: asset.specification,
                        borrowLocation: asset.location,
                      });
                    }
                  }}
                >
                  {assetList.map(asset => (
                    <Option key={asset.assetCode} value={asset.assetCode}>
                      {asset.assetCode} - {asset.assetName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="assetName" label="资产名称">
                <Input disabled />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="assetType" label="资产类型">
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="specification" label="规格型号">
                <Input disabled />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item 
                name="borrower" 
                label="借用人" 
                rules={[{ required: true, message: '请输入借用人' }]}
              >
                <Input placeholder="请输入借用人" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item 
                name="borrowerDept" 
                label="部门" 
                rules={[{ required: true, message: '请选择部门' }]}
              >
                <Select placeholder="请选择部门">
                  <Option value="市场部">市场部</Option>
                  <Option value="销售部">销售部</Option>
                  <Option value="技术部">技术部</Option>
                  <Option value="财务部">财务部</Option>
                  <Option value="宣传部">宣传部</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item 
                name="borrowerPhone" 
                label="联系电话" 
                rules={[{ required: true, message: '请输入联系电话' }]}
              >
                <Input placeholder="请输入联系电话" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="borrowDate" 
                label="借用日期" 
                rules={[{ required: true, message: '请选择借用日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="expectedReturnDate" 
                label="预计归还日期" 
                rules={[{ required: true, message: '请选择预计归还日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="borrowLocation" label="借出位置">
                <Input placeholder="请输入借出位置" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="useLocation" 
                label="使用位置" 
                rules={[{ required: true, message: '请输入使用位置' }]}
              >
                <Input placeholder="请输入使用位置" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item 
            name="borrowReason" 
            label="借用原因" 
            rules={[{ required: true, message: '请输入借用原因' }]}
          >
            <TextArea rows={3} placeholder="请输入借用原因" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 详情模态框 */}
      <Modal
        title="借用申请详情"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedRecord && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="借用单号">{selectedRecord.borrowNo}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={getStatusColor(selectedRecord.status)}>{selectedRecord.statusText}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="资产编码">{selectedRecord.assetCode}</Descriptions.Item>
              <Descriptions.Item label="资产名称">{selectedRecord.assetName}</Descriptions.Item>
              <Descriptions.Item label="资产类型">{selectedRecord.assetType}</Descriptions.Item>
              <Descriptions.Item label="规格型号">{selectedRecord.specification}</Descriptions.Item>
              <Descriptions.Item label="借用人">{selectedRecord.borrower}</Descriptions.Item>
              <Descriptions.Item label="部门">{selectedRecord.borrowerDept}</Descriptions.Item>
              <Descriptions.Item label="联系电话">{selectedRecord.borrowerPhone}</Descriptions.Item>
              <Descriptions.Item label="借用日期">{selectedRecord.borrowDate}</Descriptions.Item>
              <Descriptions.Item label="预计归还日期">{selectedRecord.expectedReturnDate}</Descriptions.Item>
              <Descriptions.Item label="实际归还日期">{selectedRecord.actualReturnDate || '-'}</Descriptions.Item>
              <Descriptions.Item label="借出位置">{selectedRecord.borrowLocation}</Descriptions.Item>
              <Descriptions.Item label="使用位置">{selectedRecord.useLocation}</Descriptions.Item>
              <Descriptions.Item label="借用原因" span={2}>{selectedRecord.borrowReason}</Descriptions.Item>
              
              {selectedRecord.approver && (
                <>
                  <Descriptions.Item label="审批人">{selectedRecord.approver}</Descriptions.Item>
                  <Descriptions.Item label="审批日期">{selectedRecord.approveDate}</Descriptions.Item>
                  {selectedRecord.approveRemark && (
                    <Descriptions.Item label="审批备注" span={2}>{selectedRecord.approveRemark}</Descriptions.Item>
                  )}
                  {selectedRecord.rejectReason && (
                    <Descriptions.Item label="拒绝原因" span={2}>
                      <span style={{ color: '#ff4d4f' }}>{selectedRecord.rejectReason}</span>
                    </Descriptions.Item>
                  )}
                </>
              )}
              
              {selectedRecord.returnCondition && (
                <>
                  <Descriptions.Item label="归还状态">{selectedRecord.returnCondition}</Descriptions.Item>
                  <Descriptions.Item label="归还备注">{selectedRecord.returnRemark}</Descriptions.Item>
                </>
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
        title="审批借用申请"
        open={isApproveModalVisible}
        onOk={handleApproveSubmit}
        onCancel={() => {
          setIsApproveModalVisible(false);
          approveForm.resetFields();
          setSelectedRecord(null);
        }}
        width={600}
      >
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

      {/* 归还模态框 */}
      <Modal
        title="资产归还"
        open={isReturnModalVisible}
        onOk={handleReturnSubmit}
        onCancel={() => setIsReturnModalVisible(false)}
        width={600}
      >
        <Form form={returnForm} layout="vertical">
          <Form.Item 
            name="actualReturnDate" 
            label="归还日期" 
            rules={[{ required: true, message: '请选择归还日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item 
            name="returnCondition" 
            label="归还状态" 
            rules={[{ required: true, message: '请选择归还状态' }]}
          >
            <Select placeholder="请选择归还状态">
              <Option value="完好">完好</Option>
              <Option value="轻微损坏">轻微损坏</Option>
              <Option value="严重损坏">严重损坏</Option>
              <Option value="丢失">丢失</Option>
            </Select>
          </Form.Item>
          <Form.Item name="returnRemark" label="归还备注">
            <TextArea rows={3} placeholder="请输入归还备注" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AssetBorrow;