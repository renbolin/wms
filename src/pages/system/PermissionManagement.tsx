import React, { useState } from 'react';
import { Table, Button, Input, Space, Modal, Form, Select, Tag, message, Tree } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { DataNode } from 'antd/es/tree';

interface Permission {
  id: number;
  name: string;
  code: string;
  description: string;
  type: 'menu' | 'button' | 'api';
  status: 'active' | 'inactive';
  createdAt: string;
}

const initialPermissions: Permission[] = [
  {
    id: 1,
    name: '用户管理',
    code: 'user:manage',
    description: '用户管理模块权限',
    type: 'menu',
    status: 'active',
    createdAt: '2023-01-01',
  },
  {
    id: 2,
    name: '用户查看',
    code: 'user:read',
    description: '查看用户信息权限',
    type: 'button',
    status: 'active',
    createdAt: '2023-01-01',
  },
  {
    id: 3,
    name: '用户编辑',
    code: 'user:write',
    description: '编辑用户信息权限',
    type: 'button',
    status: 'active',
    createdAt: '2023-01-01',
  },
  {
    id: 4,
    name: '角色管理',
    code: 'role:manage',
    description: '角色管理模块权限',
    type: 'menu',
    status: 'active',
    createdAt: '2023-01-02',
  },
  {
    id: 5,
    name: '角色查看',
    code: 'role:read',
    description: '查看角色信息权限',
    type: 'button',
    status: 'active',
    createdAt: '2023-01-02',
  },
  {
    id: 6,
    name: '角色编辑',
    code: 'role:write',
    description: '编辑角色信息权限',
    type: 'button',
    status: 'active',
    createdAt: '2023-01-02',
  },
  {
    id: 7,
    name: '权限管理',
    code: 'permission:manage',
    description: '权限管理模块权限',
    type: 'menu',
    status: 'active',
    createdAt: '2023-01-03',
  },
  {
    id: 8,
    name: '权限查看',
    code: 'permission:read',
    description: '查看权限信息权限',
    type: 'button',
    status: 'active',
    createdAt: '2023-01-03',
  },
  {
    id: 9,
    name: '权限编辑',
    code: 'permission:write',
    description: '编辑权限信息权限',
    type: 'button',
    status: 'active',
    createdAt: '2023-01-03',
  },
];

// 权限树结构
const permissionTreeData: DataNode[] = [
  {
    title: '系统管理',
    key: 'system',
    children: [
      {
        title: '用户管理',
        key: 'user:manage',
        children: [
          {
            title: '用户查看',
            key: 'user:read',
          },
          {
            title: '用户编辑',
            key: 'user:write',
          },
        ],
      },
      {
        title: '角色管理',
        key: 'role:manage',
        children: [
          {
            title: '角色查看',
            key: 'role:read',
          },
          {
            title: '角色编辑',
            key: 'role:write',
          },
        ],
      },
      {
        title: '权限管理',
        key: 'permission:manage',
        children: [
          {
            title: '权限查看',
            key: 'permission:read',
          },
          {
            title: '权限编辑',
            key: 'permission:write',
          },
        ],
      },
    ],
  },
];

const PermissionManagement: React.FC = () => {
  const [permissions, setPermissions] = useState<Permission[]>(initialPermissions);
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isTreeModalVisible, setIsTreeModalVisible] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [form] = Form.useForm();

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const filteredPermissions = permissions.filter(
    (permission) =>
      permission.name.toLowerCase().includes(searchText.toLowerCase()) ||
      permission.code.toLowerCase().includes(searchText.toLowerCase()) ||
      permission.description.toLowerCase().includes(searchText.toLowerCase())
  );

  const showModal = (permission?: Permission) => {
    if (permission) {
      setEditingPermission(permission);
      form.setFieldsValue(permission);
    } else {
      setEditingPermission(null);
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
      if (editingPermission) {
        // 更新权限
        const updatedPermissions = permissions.map((permission) =>
          permission.id === editingPermission.id ? { ...permission, ...values } : permission
        );
        setPermissions(updatedPermissions);
        message.success('权限更新成功');
      } else {
        // 添加新权限
        const newPermission: Permission = {
          id: Math.max(...permissions.map((permission) => permission.id)) + 1,
          ...values,
          createdAt: new Date().toISOString().split('T')[0],
        };
        setPermissions([...permissions, newPermission]);
        message.success('权限添加成功');
      }
      setIsModalVisible(false);
      form.resetFields();
    });
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个权限吗？此操作不可撤销。',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        setPermissions(permissions.filter((permission) => permission.id !== id));
        message.success('权限删除成功');
      },
    });
  };

  const showTreeModal = () => {
    setIsTreeModalVisible(true);
  };

  const handleTreeModalCancel = () => {
    setIsTreeModalVisible(false);
  };

  const columns: ColumnsType<Permission> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: '权限名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '权限编码',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        let color = 'blue';
        if (type === 'menu') {
          color = 'green';
        } else if (type === 'button') {
          color = 'blue';
        } else if (type === 'api') {
          color = 'purple';
        }
        return <Tag color={color}>{type.toUpperCase()}</Tag>;
      },
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
        <h2 className="text-2xl font-bold">权限管理</h2>
        <Space>
          <Button onClick={showTreeModal}>查看权限树</Button>
          <Input
            placeholder="搜索权限"
            prefix={<SearchOutlined />}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 200 }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
          >
            添加权限
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={filteredPermissions}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingPermission ? '编辑权限' : '添加权限'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="权限名称"
            rules={[{ required: true, message: '请输入权限名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="code"
            label="权限编码"
            rules={[{ required: true, message: '请输入权限编码' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
            rules={[{ required: true, message: '请输入权限描述' }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item
            name="type"
            label="类型"
            rules={[{ required: true, message: '请选择权限类型' }]}
          >
            <Select>
              <Select.Option value="menu">菜单</Select.Option>
              <Select.Option value="button">按钮</Select.Option>
              <Select.Option value="api">API</Select.Option>
            </Select>
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

      <Modal
        title="权限结构树"
        open={isTreeModalVisible}
        onCancel={handleTreeModalCancel}
        footer={null}
        width={600}
      >
        <Tree
          defaultExpandAll
          treeData={permissionTreeData}
          showLine
          showIcon
        />
      </Modal>
    </div>
  );
};

export default PermissionManagement;