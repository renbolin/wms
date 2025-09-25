import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Space,
  Tag,
  Card,
  Row,
  Col,
  Descriptions,
  Steps,
  Timeline,
  message,
  Divider,
  Popconfirm
} from 'antd';
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  MinusCircleOutlined
} from '@ant-design/icons';
import type { TableProps } from 'antd';
import dayjs from 'dayjs';
import { ProcurementApplication, ProcurementApplicationItem, ApprovalRecord } from '@/types/procurement';

const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;

const ProcurementApplicationPage: React.FC = () => {
  const [form] = Form.useForm();
  const [itemForm] = Form.useForm();
  const [applications, setApplications] = useState<ProcurementApplication[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isItemModalVisible, setIsItemModalVisible] = useState(false);
  const [editingApplication, setEditingApplication] = useState<ProcurementApplication | null>(null);
  const [viewingApplication, setViewingApplication] = useState<ProcurementApplication | null>(null);
  const [currentItems, setCurrentItems] = useState<ProcurementApplicationItem[]>([]);
  const [editingItemIndex, setEditingItemIndex] = useState<number>(-1);

  // 模拟数据
  const mockData: ProcurementApplication[] = [
    {
      id: '1',
      applicationNo: 'PA2024001',
      title: '办公用品采购申请',
      applicant: '张三',
      applicantId: 'user001',
      department: '行政部',
      applicationDate: '2024-01-15',
      requiredDate: '2024-01-25',
      urgencyLevel: 'high',
      reason: '办公用品库存不足，需要及时补充',
      items: [
        {
          id: '1-1',
          itemName: '打印纸',
          description: 'A4复印纸',
          category: '办公用品',
          specifications: '70g/m² 500张/包',
          quantity: 100,
          unit: '包',
          estimatedUnitPrice: 15,
          estimatedTotalPrice: 1500,
          suggestedSuppliers: ['上海办公用品公司'],
          purpose: '日常办公使用'
        },
        {
          id: '1-2',
          itemName: '签字笔',
          description: '黑色签字笔',
          category: '办公用品',
          specifications: '0.5mm',
          quantity: 200,
          unit: '支',
          estimatedUnitPrice: 2,
          estimatedTotalPrice: 400,
          suggestedSuppliers: ['上海办公用品公司'],
          purpose: '日常办公使用'
        }
      ],
      totalEstimatedAmount: 1900,
      status: 'reviewing',
      approvalHistory: [
        {
          id: 'approval-1',
          approver: '李经理',
          approverId: 'manager001',
          approverRole: '部门经理',
          action: 'approve',
          comments: '同意采购申请，建议优化供应商选择',
          timestamp: '2024-01-16 10:00:00',
          level: 1
        }
      ],
      attachments: [],
      notes: '请优先处理',
      createdAt: '2024-01-15 09:00:00',
      updatedAt: '2024-01-16 10:00:00'
    },
    {
      id: '2',
      applicationNo: 'PA2024002',
      title: '服务器设备采购申请',
      applicant: '李四',
      applicantId: 'user002',
      department: 'IT部',
      applicationDate: '2024-01-16',
      requiredDate: '2024-02-15',
      urgencyLevel: 'medium',
      reason: '现有服务器性能不足，需要升级',
      items: [
        {
          id: '2-1',
          itemName: '服务器',
          description: '高性能服务器',
          category: 'IT设备',
          specifications: 'Intel Xeon 16核 64GB内存 2TB SSD',
          quantity: 2,
          unit: '台',
          estimatedUnitPrice: 25000,
          estimatedTotalPrice: 50000,
          suggestedSuppliers: ['深圳电子设备厂'],
          purpose: '业务系统部署'
        }
      ],
      totalEstimatedAmount: 50000,
      status: 'approved',
      approvalHistory: [
        {
          id: 'approval-2-1',
          approver: '王经理',
          approverId: 'manager002',
          approverRole: '部门经理',
          action: 'approve',
          comments: '技术方案合理',
          timestamp: '2024-01-17 14:00:00',
          level: 1
        },
        {
          id: 'approval-2-2',
          approver: '总经理',
          approverId: 'ceo001',
          approverRole: '总经理',
          action: 'approve',
          comments: '批准采购',
          timestamp: '2024-01-18 16:00:00',
          level: 2
        }
      ],
      attachments: [],
      createdAt: '2024-01-16 14:00:00',
      updatedAt: '2024-01-18 16:00:00'
    }
  ];

  useEffect(() => {
    setApplications(mockData);
  }, []);

  const columns: TableProps<ProcurementApplication>['columns'] = [
    {
      title: '申请单号',
      dataIndex: 'applicationNo',
      key: 'applicationNo',
      width: 120,
    },
    {
      title: '申请标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
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
      title: '紧急程度',
      dataIndex: 'urgencyLevel',
      key: 'urgencyLevel',
      width: 100,
      render: (level: string) => {
        const config = {
          low: { color: 'default', text: '低' },
          medium: { color: 'warning', text: '中' },
          high: { color: 'orange', text: '高' },
          urgent: { color: 'error', text: '紧急' }
        };
        const { color, text } = config[level as keyof typeof config] || config.low;
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: '预估金额',
      dataIndex: 'totalEstimatedAmount',
      key: 'totalEstimatedAmount',
      width: 120,
      render: (amount: number) => `¥${amount?.toLocaleString() || 0}`,
    },
    {
      title: '申请日期',
      dataIndex: 'applicationDate',
      key: 'applicationDate',
      width: 120,
    },
    {
      title: '要求日期',
      dataIndex: 'requiredDate',
      key: 'requiredDate',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const config = {
          draft: { color: 'default', text: '草稿' },
          submitted: { color: 'processing', text: '已提交' },
          reviewing: { color: 'warning', text: '审批中' },
          approved: { color: 'success', text: '已批准' },
          rejected: { color: 'error', text: '已拒绝' },
          cancelled: { color: 'default', text: '已取消' },
          completed: { color: 'success', text: '已完成' }
        };
        const { color, text } = config[status as keyof typeof config] || config.draft;
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            查看
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
          {record.status === 'approved' && (
            <Button
              type="link"
              size="small"
              onClick={() => handleCreateInquiry(record)}
            >
              创建询价
            </Button>
          )}
          {record.status === 'draft' && (
            <Popconfirm
              title="确定删除此申请吗？"
              onConfirm={() => handleDelete(record.id)}
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
          )}
        </Space>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingApplication(null);
    setCurrentItems([]);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: ProcurementApplication) => {
    setEditingApplication(record);
    setCurrentItems([...record.items]);
    form.setFieldsValue({
      ...record,
      applicationDate: dayjs(record.applicationDate),
      requiredDate: dayjs(record.requiredDate),
    });
    setIsModalVisible(true);
  };

  const handleView = (record: ProcurementApplication) => {
    setViewingApplication(record);
    setIsDetailModalVisible(true);
  };

  const handleDelete = (id: string) => {
    setApplications(prev => prev.filter(item => item.id !== id));
    message.success('删除成功');
  };

  const handleCreateInquiry = (record: ProcurementApplication) => {
    // 这里应该跳转到询价页面或创建询价单
    message.info(`为申请单 ${record.applicationNo} 创建询价单`);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const newApplication: ProcurementApplication = {
        id: editingApplication?.id || Date.now().toString(),
        applicationNo: editingApplication?.applicationNo || `PA${Date.now()}`,
        title: values.title,
        applicant: values.applicant,
        applicantId: values.applicantId || 'current_user',
        department: values.department,
        applicationDate: values.applicationDate.format('YYYY-MM-DD'),
        requiredDate: values.requiredDate.format('YYYY-MM-DD'),
        urgencyLevel: values.urgencyLevel,
        reason: values.reason,
        items: currentItems,
        totalEstimatedAmount: currentItems.reduce((sum, item) => sum + item.estimatedTotalPrice, 0),
        status: values.status || 'draft',
        approvalHistory: editingApplication?.approvalHistory || [],
        attachments: values.attachments || [],
        notes: values.notes,
        createdAt: editingApplication?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (editingApplication) {
        setApplications(prev => prev.map(item => 
          item.id === editingApplication.id ? newApplication : item
        ));
        message.success('更新成功');
      } else {
        setApplications(prev => [...prev, newApplication]);
        message.success('创建成功');
      }

      setIsModalVisible(false);
      form.resetFields();
      setCurrentItems([]);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handleAddItem = () => {
    setEditingItemIndex(-1);
    itemForm.resetFields();
    setIsItemModalVisible(true);
  };

  const handleEditItem = (index: number) => {
    setEditingItemIndex(index);
    itemForm.setFieldsValue(currentItems[index]);
    setIsItemModalVisible(true);
  };

  const handleDeleteItem = (index: number) => {
    setCurrentItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleItemSubmit = async () => {
    try {
      const values = await itemForm.validateFields();
      const newItem: ProcurementApplicationItem = {
        id: editingItemIndex >= 0 ? currentItems[editingItemIndex].id : Date.now().toString(),
        itemName: values.itemName,
        description: values.description,
        category: values.category,
        specifications: values.specifications,
        quantity: values.quantity,
        unit: values.unit,
        estimatedUnitPrice: values.estimatedUnitPrice,
        estimatedTotalPrice: values.quantity * values.estimatedUnitPrice,
        suggestedSuppliers: values.suggestedSuppliers || [],
        purpose: values.purpose,
        remarks: values.remarks
      };

      if (editingItemIndex >= 0) {
        setCurrentItems(prev => prev.map((item, index) => 
          index === editingItemIndex ? newItem : item
        ));
      } else {
        setCurrentItems(prev => [...prev, newItem]);
      }

      setIsItemModalVisible(false);
      itemForm.resetFields();
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const getStatusSteps = (application: ProcurementApplication) => {
    const steps = [
      { title: '创建申请', status: 'finish' },
      { title: '部门审批', status: application.status === 'draft' ? 'wait' : 'finish' },
      { title: '财务审批', status: ['approved', 'completed'].includes(application.status) ? 'finish' : 'wait' },
      { title: '采购执行', status: application.status === 'completed' ? 'finish' : 'wait' }
    ];

    if (application.status === 'rejected') {
      steps[1].status = 'error';
    }

    return steps;
  };

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新建采购申请
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={applications}
          rowKey="id"
          scroll={{ x: 1200 }}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      {/* 新建/编辑申请模态框 */}
      <Modal
        title={editingApplication ? '编辑采购申请' : '新建采购申请'}
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
                name="title"
                label="申请标题"
                rules={[{ required: true, message: '请输入申请标题' }]}
              >
                <Input placeholder="请输入申请标题" />
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
                  <Option value="行政部">行政部</Option>
                  <Option value="IT部">IT部</Option>
                  <Option value="财务部">财务部</Option>
                  <Option value="人事部">人事部</Option>
                  <Option value="市场部">市场部</Option>
                  <Option value="生产部">生产部</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="urgencyLevel"
                label="紧急程度"
                rules={[{ required: true, message: '请选择紧急程度' }]}
              >
                <Select placeholder="请选择紧急程度">
                  <Option value="low">低</Option>
                  <Option value="medium">中</Option>
                  <Option value="high">高</Option>
                  <Option value="urgent">紧急</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="applicationDate"
                label="申请日期"
                rules={[{ required: true, message: '请选择申请日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="requiredDate"
                label="要求日期"
                rules={[{ required: true, message: '请选择要求日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="reason"
            label="申请原因"
            rules={[{ required: true, message: '请输入申请原因' }]}
          >
            <TextArea rows={3} placeholder="请输入申请原因" />
          </Form.Item>

          <Form.Item label="采购项目">
            <div style={{ marginBottom: 8 }}>
              <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddItem}>
                添加项目
              </Button>
            </div>
            <Table
              size="small"
              dataSource={currentItems}
              rowKey="id"
              pagination={false}
              columns={[
                { title: '项目名称', dataIndex: 'itemName', key: 'itemName' },
                { title: '规格', dataIndex: 'specifications', key: 'specifications' },
                { title: '数量', dataIndex: 'quantity', key: 'quantity' },
                { title: '单位', dataIndex: 'unit', key: 'unit' },
                { title: '预估单价', dataIndex: 'estimatedUnitPrice', key: 'estimatedUnitPrice' },
                { title: '预估总价', dataIndex: 'estimatedTotalPrice', key: 'estimatedTotalPrice' },
                {
                  title: '操作',
                  key: 'action',
                  render: (_, __, index) => (
                    <Space>
                      <Button size="small" onClick={() => handleEditItem(index)}>编辑</Button>
                      <Button size="small" danger onClick={() => handleDeleteItem(index)}>删除</Button>
                    </Space>
                  )
                }
              ]}
            />
          </Form.Item>

          <Form.Item name="notes" label="备注">
            <TextArea rows={2} placeholder="请输入备注信息" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 项目详情模态框 */}
      <Modal
        title={editingItemIndex >= 0 ? '编辑项目' : '添加项目'}
        open={isItemModalVisible}
        onOk={handleItemSubmit}
        onCancel={() => setIsItemModalVisible(false)}
        width={600}
        destroyOnClose
      >
        <Form form={itemForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="itemName"
                label="项目名称"
                rules={[{ required: true, message: '请输入项目名称' }]}
              >
                <Input placeholder="请输入项目名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="category"
                label="项目类别"
                rules={[{ required: true, message: '请输入项目类别' }]}
              >
                <Input placeholder="请输入项目类别" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="项目描述"
            rules={[{ required: true, message: '请输入项目描述' }]}
          >
            <TextArea rows={2} placeholder="请输入项目描述" />
          </Form.Item>

          <Form.Item
            name="specifications"
            label="规格要求"
            rules={[{ required: true, message: '请输入规格要求' }]}
          >
            <TextArea rows={2} placeholder="请输入规格要求" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="quantity"
                label="数量"
                rules={[{ required: true, message: '请输入数量' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} placeholder="数量" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="unit"
                label="单位"
                rules={[{ required: true, message: '请输入单位' }]}
              >
                <Input placeholder="单位" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="estimatedUnitPrice"
                label="预估单价"
                rules={[{ required: true, message: '请输入预估单价' }]}
              >
                <InputNumber min={0} step={0.01} style={{ width: '100%' }} placeholder="预估单价" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="purpose" label="用途">
            <TextArea rows={2} placeholder="请输入用途" />
          </Form.Item>

          <Form.Item name="remarks" label="备注">
            <TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 查看详情模态框 */}
      <Modal
        title="采购申请详情"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {viewingApplication && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="申请单号">{viewingApplication.applicationNo}</Descriptions.Item>
              <Descriptions.Item label="申请标题">{viewingApplication.title}</Descriptions.Item>
              <Descriptions.Item label="申请人">{viewingApplication.applicant}</Descriptions.Item>
              <Descriptions.Item label="申请部门">{viewingApplication.department}</Descriptions.Item>
              <Descriptions.Item label="申请日期">{viewingApplication.applicationDate}</Descriptions.Item>
              <Descriptions.Item label="要求日期">{viewingApplication.requiredDate}</Descriptions.Item>
              <Descriptions.Item label="紧急程度">
                <Tag color={
                  viewingApplication.urgencyLevel === 'urgent' ? 'red' :
                  viewingApplication.urgencyLevel === 'high' ? 'orange' :
                  viewingApplication.urgencyLevel === 'medium' ? 'yellow' : 'default'
                }>
                  {viewingApplication.urgencyLevel === 'urgent' ? '紧急' :
                   viewingApplication.urgencyLevel === 'high' ? '高' :
                   viewingApplication.urgencyLevel === 'medium' ? '中' : '低'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="预估总金额">¥{viewingApplication.totalEstimatedAmount.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="申请原因" span={2}>{viewingApplication.reason}</Descriptions.Item>
              {viewingApplication.notes && (
                <Descriptions.Item label="备注" span={2}>{viewingApplication.notes}</Descriptions.Item>
              )}
            </Descriptions>

            <Divider>采购项目清单</Divider>
            <Table
              size="small"
              dataSource={viewingApplication.items}
              rowKey="id"
              pagination={false}
              columns={[
                { title: '项目名称', dataIndex: 'itemName', key: 'itemName' },
                { title: '描述', dataIndex: 'description', key: 'description' },
                { title: '规格', dataIndex: 'specifications', key: 'specifications' },
                { title: '数量', dataIndex: 'quantity', key: 'quantity' },
                { title: '单位', dataIndex: 'unit', key: 'unit' },
                { title: '预估单价', dataIndex: 'estimatedUnitPrice', key: 'estimatedUnitPrice', render: (price: number) => `¥${price}` },
                { title: '预估总价', dataIndex: 'estimatedTotalPrice', key: 'estimatedTotalPrice', render: (price: number) => `¥${price}` },
              ]}
            />

            <Divider>审批流程</Divider>
            <Steps current={getStatusSteps(viewingApplication).findIndex(step => step.status === 'wait')}>
              {getStatusSteps(viewingApplication).map((step, index) => (
                <Step key={index} title={step.title} status={step.status as any} />
              ))}
            </Steps>

            {viewingApplication.approvalHistory.length > 0 && (
              <>
                <Divider>审批历史</Divider>
                <Timeline>
                  {viewingApplication.approvalHistory.map((record) => (
                    <Timeline.Item
                      key={record.id}
                      color={record.action === 'approve' ? 'green' : 'red'}
                      dot={record.action === 'approve' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                    >
                      <div>
                        <strong>{record.approver}</strong> ({record.approverRole})
                        <span style={{ marginLeft: 8, color: '#666' }}>{record.timestamp}</span>
                      </div>
                      <div style={{ marginTop: 4 }}>
                        {record.action === 'approve' ? '批准' : '拒绝'}: {record.comments}
                      </div>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProcurementApplicationPage;