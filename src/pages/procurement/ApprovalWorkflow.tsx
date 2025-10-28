import React, { useState } from 'react';
import { Button, Table, Modal, Form, Input, Select, Card, Space, Row, Col, Switch, DatePicker, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';

const { Option } = Select;
const { RangePicker } = DatePicker;

// 筛选条件接口
interface FilterParams {
  workflowName?: string;
  applicableType?: string;
  status?: string;
  createdDateRange?: [string, string];
  updatedDateRange?: [string, string];
  stepCountRange?: [number, number];
  description?: string;
  approverType?: string;
  approver?: string;
}

// 审批步骤接口
interface ApprovalStep {
  id: number;
  stepName: string;
  approverType: 'user' | 'role' | 'department';
  approvers: string[];
  isRequired: boolean;
  order: number;
}

// 审批流程接口
interface ApprovalWorkflow {
  id: number;
  workflowName: string;
  description: string;
  applicableType: string; // 适用类型：normal, emergency, all
  status: 'active' | 'inactive';
  steps: ApprovalStep[];
  createdAt: string;
  updatedAt: string;
}

const ApprovalWorkflowManagement: React.FC = () => {
  const [workflows, setWorkflows] = useState<ApprovalWorkflow[]>([
    {
      id: 1,
      workflowName: '正常采购审批流程',
      description: '适用于正常采购申请的审批流程',
      applicableType: 'normal',
      status: 'active',
      steps: [
        {
          id: 1,
          stepName: '部门经理审批',
          approverType: 'role',
          approvers: ['部门经理'],
          isRequired: true,
          order: 1
        },
        {
          id: 2,
          stepName: '财务审批',
          approverType: 'department',
          approvers: ['财务部'],
          isRequired: true,
          order: 2
        },
        {
          id: 3,
          stepName: '总经理审批',
          approverType: 'user',
          approvers: ['张总'],
          isRequired: true,
          order: 3
        }
      ],
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    },
    {
      id: 2,
      workflowName: '应急采购审批流程',
      description: '适用于应急采购申请的快速审批流程',
      applicableType: 'emergency',
      status: 'active',
      steps: [
        {
          id: 1,
          stepName: '部门经理审批',
          approverType: 'role',
          approvers: ['部门经理'],
          isRequired: true,
          order: 1
        },
        {
          id: 2,
          stepName: '总经理审批',
          approverType: 'user',
          approvers: ['张总'],
          isRequired: true,
          order: 2
        }
      ],
      createdAt: '2024-01-16',
      updatedAt: '2024-01-16'
    }
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isStepModalVisible, setIsStepModalVisible] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<ApprovalWorkflow | null>(null);
  const [editingStep, setEditingStep] = useState<ApprovalStep | null>(null);
  const [currentWorkflowSteps, setCurrentWorkflowSteps] = useState<ApprovalStep[]>([]);
  const [form] = Form.useForm();
  const [stepForm] = Form.useForm();
  const [filterForm] = Form.useForm();
  const [filters, setFilters] = useState<FilterParams>({});

  // 模拟用户和角色数据
  const users = ['张总', '李经理', '王主管', '赵总监'];
  const roles = ['部门经理', '财务经理', '采购经理', '总经理'];
  const departments = ['财务部', '采购部', '行政部', 'IT部'];

  // 筛选逻辑
  const filteredWorkflows = workflows.filter(workflow => {
    // 流程名称筛选
    if (filters.workflowName && !workflow.workflowName.toLowerCase().includes(filters.workflowName.toLowerCase())) {
      return false;
    }

    // 适用类型筛选
    if (filters.applicableType && workflow.applicableType !== filters.applicableType) {
      return false;
    }

    // 状态筛选
    if (filters.status && workflow.status !== filters.status) {
      return false;
    }

    // 描述筛选
    if (filters.description && !workflow.description.toLowerCase().includes(filters.description.toLowerCase())) {
      return false;
    }

    // 创建时间范围筛选
    if (filters.createdDateRange && filters.createdDateRange.length === 2) {
      const [startDate, endDate] = filters.createdDateRange;
      if (workflow.createdAt < startDate || workflow.createdAt > endDate) {
        return false;
      }
    }

    // 更新时间范围筛选
    if (filters.updatedDateRange && filters.updatedDateRange.length === 2) {
      const [startDate, endDate] = filters.updatedDateRange;
      if (workflow.updatedAt < startDate || workflow.updatedAt > endDate) {
        return false;
      }
    }

    // 步骤数量范围筛选
    if (filters.stepCountRange && filters.stepCountRange.length === 2) {
      const [minCount, maxCount] = filters.stepCountRange;
      const stepCount = workflow.steps.length;
      if (stepCount < minCount || stepCount > maxCount) {
        return false;
      }
    }

    // 审批人类型筛选
    if (filters.approverType) {
      const hasApproverType = workflow.steps.some(step => step.approverType === filters.approverType);
      if (!hasApproverType) {
        return false;
      }
    }

    // 审批人筛选
    if (filters.approver) {
      const hasApprover = workflow.steps.some(step => 
        step.approvers.some(approver => 
          approver.toLowerCase().includes(filters.approver!.toLowerCase())
        )
      );
      if (!hasApprover) {
        return false;
      }
    }

    return true;
  });

  // 处理筛选
  const handleFilter = (values: FilterParams) => {
    const processedFilters = { ...values };
    
    // 处理日期范围
    if (values.createdDateRange) {
      processedFilters.createdDateRange = [
        values.createdDateRange[0],
        values.createdDateRange[1]
      ];
    }
    
    if (values.updatedDateRange) {
      processedFilters.updatedDateRange = [
        values.updatedDateRange[0],
        values.updatedDateRange[1]
      ];
    }

    // 处理步骤数量范围
    if (values.stepCountRange) {
      processedFilters.stepCountRange = [
        values.stepCountRange[0] || 0,
        values.stepCountRange[1] || 999
      ];
    }

    setFilters(processedFilters);
  };

  // 重置筛选
  const handleResetFilter = () => {
    filterForm.resetFields();
    setFilters({});
  };

  const columns: TableProps<ApprovalWorkflow>['columns'] = [
    {
      title: '序号',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: '流程名称',
      dataIndex: 'workflowName',
      key: 'workflowName',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '适用类型',
      dataIndex: 'applicableType',
      key: 'applicableType',
      render: (type: string) => {
        const typeMap = {
          normal: '正常采购',
          emergency: '应急采购',
          all: '全部类型'
        };
        return typeMap[type as keyof typeof typeMap] || type;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <span style={{ color: status === 'active' ? '#52c41a' : '#ff4d4f' }}>
          {status === 'active' ? '启用' : '禁用'}
        </span>
      ),
    },
    {
      title: '步骤数',
      key: 'stepCount',
      render: (_, record) => record.steps.length,
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const stepColumns: TableProps<ApprovalStep>['columns'] = [
    {
      title: '步骤顺序',
      dataIndex: 'order',
      key: 'order',
      width: 80,
    },
    {
      title: '步骤名称',
      dataIndex: 'stepName',
      key: 'stepName',
    },
    {
      title: '审批人类型',
      dataIndex: 'approverType',
      key: 'approverType',
      render: (type: string) => {
        const typeMap = {
          user: '指定用户',
          role: '角色',
          department: '部门'
        };
        return typeMap[type as keyof typeof typeMap] || type;
      },
    },
    {
      title: '审批人',
      dataIndex: 'approvers',
      key: 'approvers',
      render: (approvers: string[]) => approvers.join(', '),
    },
    {
      title: '是否必须',
      dataIndex: 'isRequired',
      key: 'isRequired',
      render: (required: boolean) => required ? '是' : '否',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleEditStep(record)}>
            编辑
          </Button>
          <Button type="link" danger onClick={() => handleDeleteStep(record.id)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingWorkflow(null);
    setCurrentWorkflowSteps([]);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (workflow: ApprovalWorkflow) => {
    setEditingWorkflow(workflow);
    setCurrentWorkflowSteps([...workflow.steps]);
    form.setFieldsValue(workflow);
    setIsModalVisible(true);
  };

  const handleDelete = (id: number) => {
    setWorkflows(workflows.filter(w => w.id !== id));
  };

  const handleAddStep = () => {
    setEditingStep(null);
    stepForm.resetFields();
    setIsStepModalVisible(true);
  };

  const handleEditStep = (step: ApprovalStep) => {
    setEditingStep(step);
    stepForm.setFieldsValue(step);
    setIsStepModalVisible(true);
  };

  const handleDeleteStep = (stepId: number) => {
    setCurrentWorkflowSteps(currentWorkflowSteps.filter(s => s.id !== stepId));
  };

  const handleOk = () => {
    form.validateFields().then(values => {
      const workflowData = {
        ...values,
        steps: currentWorkflowSteps,
        updatedAt: new Date().toISOString().split('T')[0]
      };

      if (editingWorkflow) {
        setWorkflows(workflows.map(w => 
          w.id === editingWorkflow.id ? { ...w, ...workflowData } : w
        ));
      } else {
        const newWorkflow = {
          id: Date.now(),
          ...workflowData,
          createdAt: new Date().toISOString().split('T')[0]
        };
        setWorkflows([...workflows, newWorkflow]);
      }
      setIsModalVisible(false);
    });
  };

  const handleStepOk = () => {
    stepForm.validateFields().then(values => {
      const stepData = {
        ...values,
        order: editingStep ? editingStep.order : currentWorkflowSteps.length + 1
      };

      if (editingStep) {
        setCurrentWorkflowSteps(currentWorkflowSteps.map(s => 
          s.id === editingStep.id ? { ...s, ...stepData } : s
        ));
      } else {
        const newStep = {
          id: Date.now(),
          ...stepData
        };
        setCurrentWorkflowSteps([...currentWorkflowSteps, newStep]);
      }
      setIsStepModalVisible(false);
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setIsStepModalVisible(false);
  };

  const getApproverOptions = (type: string) => {
    switch (type) {
      case 'user':
        return users.map(user => <Option key={user} value={user}>{user}</Option>);
      case 'role':
        return roles.map(role => <Option key={role} value={role}>{role}</Option>);
      case 'department':
        return departments.map(dept => <Option key={dept} value={dept}>{dept}</Option>);
      default:
        return [];
    }
  };

  return (
    <div>
      {/* 筛选条件 */}
      <Card style={{ marginBottom: 16 }}>
        <Form
          form={filterForm}
          layout="inline"
          onFinish={handleFilter}
          style={{ marginBottom: 16 }}
        >
          <Row gutter={[16, 16]} style={{ width: '100%' }}>
            <Col span={6}>
              <Form.Item name="workflowName" label="流程名称">
                <Input placeholder="请输入流程名称" allowClear />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="applicableType" label="适用类型">
                <Select placeholder="请选择适用类型" allowClear>
                  <Option value="normal">正常采购</Option>
                  <Option value="emergency">应急采购</Option>
                  <Option value="all">全部类型</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="status" label="状态">
                <Select placeholder="请选择状态" allowClear>
                  <Option value="active">启用</Option>
                  <Option value="inactive">禁用</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="description" label="流程描述">
                <Input placeholder="请输入描述关键词" allowClear />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="approverType" label="审批人类型">
                <Select placeholder="请选择审批人类型" allowClear>
                  <Option value="user">指定用户</Option>
                  <Option value="role">角色</Option>
                  <Option value="department">部门</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="approver" label="审批人">
                <Input placeholder="请输入审批人" allowClear />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="createdDateRange" label="创建时间">
                <RangePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="updatedDateRange" label="更新时间">
                <RangePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="步骤数量">
<Space.Compact>
                  <Form.Item name={['stepCountRange', 0]} noStyle>
                    <InputNumber placeholder="最小" style={{ width: '50%' }} min={0} />
                  </Form.Item>
                  <Form.Item name={['stepCountRange', 1]} noStyle>
                    <InputNumber placeholder="最大" style={{ width: '50%' }} min={0} />
                  </Form.Item>
</Space.Compact>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Space>
                <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
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

      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增审批流程
        </Button>
      </div>
      
      <Table
        columns={columns}
        dataSource={filteredWorkflows}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`,
        }}
      />

      {/* 新增/编辑流程模态框 */}
      <Modal
        title={editingWorkflow ? '编辑审批流程' : '新增审批流程'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={1000}
destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="workflowName"
                label="流程名称"
                rules={[{ required: true, message: '请输入流程名称' }]}
              >
                <Input placeholder="请输入流程名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="applicableType"
                label="适用类型"
                rules={[{ required: true, message: '请选择适用类型' }]}
              >
                <Select placeholder="请选择适用类型">
                  <Option value="normal">正常采购</Option>
                  <Option value="emergency">应急采购</Option>
                  <Option value="all">全部类型</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={18}>
              <Form.Item
                name="description"
                label="流程描述"
                rules={[{ required: true, message: '请输入流程描述' }]}
              >
                <Input.TextArea rows={3} placeholder="请输入流程描述" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="status"
                label="状态"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch checkedChildren="启用" unCheckedChildren="禁用" />
              </Form.Item>
            </Col>
          </Row>
        </Form>

        <Card title="审批步骤配置" style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 16 }}>
            <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddStep}>
              添加审批步骤
            </Button>
          </div>
          <Table
            columns={stepColumns}
            dataSource={currentWorkflowSteps}
            rowKey="id"
            pagination={false}
            size="small"
          />
        </Card>
      </Modal>

      {/* 新增/编辑步骤模态框 */}
      <Modal
        title={editingStep ? '编辑审批步骤' : '新增审批步骤'}
        open={isStepModalVisible}
        onOk={handleStepOk}
        onCancel={handleCancel}
destroyOnHidden
      >
        <Form form={stepForm} layout="vertical">
          <Form.Item
            name="stepName"
            label="步骤名称"
            rules={[{ required: true, message: '请输入步骤名称' }]}
          >
            <Input placeholder="请输入步骤名称" />
          </Form.Item>
          <Form.Item
            name="approverType"
            label="审批人类型"
            rules={[{ required: true, message: '请选择审批人类型' }]}
          >
            <Select placeholder="请选择审批人类型" onChange={() => stepForm.setFieldsValue({ approvers: [] })}>
              <Option value="user">指定用户</Option>
              <Option value="role">角色</Option>
              <Option value="department">部门</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="approvers"
            label="审批人"
            rules={[{ required: true, message: '请选择审批人' }]}
          >
            <Select
              mode="multiple"
              placeholder="请选择审批人"
              disabled={!stepForm.getFieldValue('approverType')}
            >
              {getApproverOptions(stepForm.getFieldValue('approverType'))}
            </Select>
          </Form.Item>
          <Form.Item
            name="isRequired"
            label="是否必须"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch checkedChildren="是" unCheckedChildren="否" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ApprovalWorkflowManagement;