import React, { useState } from 'react';
import { Table, Button, Input, Space, Modal, Form, Select, Tag, message, Checkbox } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface Role {
  id: number;
  name: string;
  description: string;
  permissions: string[];
  status: 'active' | 'inactive';
  createdAt: string;
}

const initialRoles: Role[] = [
  {
    id: 1,
    name: '超级管理员',
    description: '拥有所有权限',
    permissions: ['user:read', 'user:write', 'role:read', 'role:write', 'permission:read', 'permission:write'],
    status: 'active',
    createdAt: '2023-01-01',
  },
  {
    id: 2,
    name: '管理员',
    description: '拥有大部分权限',
    permissions: ['user:read', 'user:write', 'role:read', 'permission:read'],
    status: 'active',
    createdAt: '2023-01-02',
  },
  {
    id: 3,
    name: '编辑者',
    description: '拥有内容编辑权限',
    permissions: ['user:read', 'role:read', 'permission:read'],
    status: 'active',
    createdAt: '2023-01-03',
  },
  {
    id: 4,
    name: '访客',
    description: '仅拥有查看权限',
    permissions: ['user:read', 'role:read'],
    status: 'active',
    createdAt: '2023-01-04',
  },
];

const permissionOptions = [
  { label: '用户查看', value: 'user:read' },
  { label: '用户编辑', value: 'user:write' },
  { label: '角色查看', value: 'role:read' },
  { label: '角色编辑', value: 'role:write' },
  { label: '权限查看', value: 'permission:read' },
  { label: '权限编辑', value: 'permission:write' },
];

const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [form] = Form.useForm();

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchText.toLowerCase()) ||
      role.description.toLowerCase().includes(searchText.toLowerCase())
  );

  const showModal = (role?: Role) => {
    if (role) {
      setEditingRole(role);
      form.setFieldsValue(role);
    } else {
      setEditingRole(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (editingRole) {
        // 更新角色
        const updatedRoles = roles.map((role) =>
          role.id === editingRole.id ? { ...role, ...values } : role
        );
        setRoles(updatedRoles);
        message.success('角色更新成功');
      } else {
        // 添加新角色
        const newRole: Role = {
          id: Math.max(...roles.map((role) => role.id)) + 1,
          ...values,
          createdAt: new Date().toISOString().split('T')[0],
        };
        setRoles([...roles, newRole]);
        message.success('角色添加成功');
      }
      setIsModalVisible(false);
      form.resetFields();
    });
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个角色吗？此操作不可撤销。',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        setRoles(roles.filter((role) => role.id !== id));
        message.success('角色删除成功');
      },
    });
  };

  const columns: ColumnsType<Role> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: '角色名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '权限',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissions: string[]) => (
        <div>
          {permissions.map((permission) => {
            const permissionLabel = permissionOptions.find(
              (option) => option.value === permission
            )?.label || permission;
            return (
              <Tag color="blue" key={permission} className="mb-1">
                {permissionLabel}
              </Tag>
            );
          })}
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = status === 'active' ? 'green' : 'volcano';
        const text = status === 'active' ? '启用' : '禁用';
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
          >
            编辑
          </Button>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            disabled={record.id === 1} // 禁止删除超级管理员
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h2 className="text-2xl font-bold">角色管理</h2>
        <Space>
          <Input
            placeholder="搜索角色"
            prefix={<SearchOutlined />}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 200 }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
          >
            添加角色
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={filteredRoles}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingRole ? '编辑角色' : '添加角色'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        okText="保存"
        cancelText="取消"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="角色名称"
            rules={[{ required: true, message: '请输入角色名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
            rules={[{ required: true, message: '请输入角色描述' }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item
            name="permissions"
            label="权限"
            rules={[{ required: true, message: '请选择至少一个权限' }]}
          >
            <Checkbox.Group options={permissionOptions} />
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select>
              <Select.Option value="active">启用</Select.Option>
              <Select.Option value="inactive">禁用</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RoleManagement;