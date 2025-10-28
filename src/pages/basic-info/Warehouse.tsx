import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Form,
  Input,
  Select,
  Modal,
  Space,
  Tag,
  message,
  Descriptions,
  Row,
  Col,
  Tree,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Option } = Select;
const { TreeNode } = Tree;
const { TextArea } = Input;

// 仓库节点接口
interface WarehouseNode {
  key: string;
  title: string;
  level: number;
  type: 'warehouse' | 'area' | 'location';
  code: string;
  description?: string;
  capacity?: number;
  currentStock?: number;
  manager?: string;
  contact?: string;
  address?: string;
  status: 'active' | 'inactive' | 'maintenance';
  children?: WarehouseNode[];
}

// 仓库信息接口
interface WarehouseInfo {
  id: string;
  code: string;
  name: string;
  type: 'warehouse' | 'area' | 'location';
  parentKey?: string;
  parentName?: string;
  capacity: number;
  currentStock: number;
  manager: string;
  contact: string;
  address: string;
  status: 'active' | 'inactive' | 'maintenance';
  statusText: string;
  description: string;
  createUser: string;
  createDate: string;
  updateUser: string;
  updateDate: string;
}

const Warehouse: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [warehouseTree, setWarehouseTree] = useState<WarehouseNode[]>([]);
  const [warehouseData, setWarehouseData] = useState<WarehouseInfo[]>([]);
  const [filteredData, setFilteredData] = useState<WarehouseInfo[]>([]);
  const [selectedWarehouseKey, setSelectedWarehouseKey] = useState<string>('');
  
  // 仓库树搜索状态
  const [warehouseSearchText, setWarehouseSearchText] = useState<string>('');
  const [filteredWarehouseTree, setFilteredWarehouseTree] = useState<WarehouseNode[]>([]);
  
  // 模态框状态
  const [isWarehouseModalVisible, setIsWarehouseModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isTreeModalVisible, setIsTreeModalVisible] = useState(false);
  
  // 编辑状态
  const [editingWarehouse, setEditingWarehouse] = useState<WarehouseInfo | null>(null);
  const [editingTreeNode, setEditingTreeNode] = useState<WarehouseNode | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<WarehouseInfo | null>(null);
  
  // 表单实例
  const [searchForm] = Form.useForm();
  const [warehouseForm] = Form.useForm();
  const [treeForm] = Form.useForm();

  // 初始化仓库树数据
  useEffect(() => {
    const initialTree: WarehouseNode[] = [
      {
        key: 'warehouse-main',
        title: '主仓库',
        level: 1,
        type: 'warehouse',
        code: 'WH001',
        description: '公司主要仓库',
        capacity: 10000,
        currentStock: 6500,
        manager: '张三',
        contact: '13800138001',
        address: 'A栋1楼',
        status: 'active',
        children: [
          {
            key: 'area-office',
            title: '办公设备区',
            level: 2,
            type: 'area',
            code: 'AR001',
            description: '存放办公设备',
            capacity: 3000,
            currentStock: 2100,
            manager: '李四',
            contact: '13800138002',
            address: 'A栋1楼东区',
            status: 'active',
            children: [
              {
                key: 'location-computer',
                title: '计算机存放区',
                level: 3,
                type: 'location',
                code: 'LOC001',
                description: '存放各类计算机设备',
                capacity: 1000,
                currentStock: 650,
                manager: '王五',
                contact: '13800138003',
                address: 'A栋1楼东区A1',
                status: 'active',
              },
              {
                key: 'location-printer',
                title: '打印设备存放区',
                level: 3,
                type: 'location',
                code: 'LOC002',
                description: '存放打印机等设备',
                capacity: 500,
                currentStock: 320,
                manager: '王五',
                contact: '13800138003',
                address: 'A栋1楼东区A2',
                status: 'active',
              },
            ],
          },
          {
            key: 'area-production',
            title: '生产设备区',
            level: 2,
            type: 'area',
            code: 'AR002',
            description: '存放生产设备',
            capacity: 5000,
            currentStock: 3200,
            manager: '赵六',
            contact: '13800138004',
            address: 'A栋1楼西区',
            status: 'active',
            children: [
              {
                key: 'location-machine',
                title: '机械设备存放区',
                level: 3,
                type: 'location',
                code: 'LOC003',
                description: '存放各类机械设备',
                capacity: 3000,
                currentStock: 1800,
                manager: '孙七',
                contact: '13800138005',
                address: 'A栋1楼西区B1',
                status: 'active',
              },
            ],
          },
        ],
      },
      {
        key: 'warehouse-spare',
        title: '备件仓库',
        level: 1,
        type: 'warehouse',
        code: 'WH002',
        description: '存放备品备件',
        capacity: 2000,
        currentStock: 1200,
        manager: '钱八',
        contact: '13800138006',
        address: 'B栋地下室',
        status: 'active',
        children: [
          {
            key: 'area-spare-parts',
            title: '备件存放区',
            level: 2,
            type: 'area',
            code: 'AR003',
            description: '存放各类备件',
            capacity: 2000,
            currentStock: 1200,
            manager: '钱八',
            contact: '13800138006',
            address: 'B栋地下室',
            status: 'active',
          },
        ],
      },
    ];
    
    setWarehouseTree(initialTree);
    loadWarehouseData();
  }, []);

  // 加载仓库数据
  const loadWarehouseData = () => {
    setLoading(true);
    
    // 模拟仓库信息数据
    const mockWarehouseData: WarehouseInfo[] = [
      {
        id: '1',
        code: 'WH001',
        name: '主仓库',
        type: 'warehouse',
        capacity: 10000,
        currentStock: 6500,
        manager: '张三',
        contact: '13800138001',
        address: 'A栋1楼',
        status: 'active',
        statusText: '正常',
        description: '公司主要仓库，存放各类设备',
        createUser: '管理员',
        createDate: '2023-01-15 10:30:00',
        updateUser: '张三',
        updateDate: '2023-06-20 14:20:00',
      },
      {
        id: '2',
        code: 'AR001',
        name: '办公设备区',
        type: 'area',
        parentKey: 'warehouse-main',
        parentName: '主仓库',
        capacity: 3000,
        currentStock: 2100,
        manager: '李四',
        contact: '13800138002',
        address: 'A栋1楼东区',
        status: 'active',
        statusText: '正常',
        description: '存放办公设备',
        createUser: '管理员',
        createDate: '2023-01-15 11:00:00',
        updateUser: '李四',
        updateDate: '2023-06-21 09:15:00',
      },
      {
        id: '3',
        code: 'LOC001',
        name: '计算机存放区',
        type: 'location',
        parentKey: 'area-office',
        parentName: '办公设备区',
        capacity: 1000,
        currentStock: 650,
        manager: '王五',
        contact: '13800138003',
        address: 'A栋1楼东区A1',
        status: 'active',
        statusText: '正常',
        description: '存放各类计算机设备',
        createUser: '管理员',
        createDate: '2023-01-15 11:30:00',
        updateUser: '王五',
        updateDate: '2023-06-22 10:45:00',
      },
    ];

    setWarehouseData(mockWarehouseData);
    setFilteredData(mockWarehouseData);
    setLoading(false);
  };

  // 获取仓库类型图标
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'warehouse': return '🏢';
      case 'area': return '📦';
      case 'location': return '📍';
      default: return '📁';
    }
  };

  // 表格列配置
  const columns: ColumnsType<WarehouseInfo> = [
    {
      title: '仓库编码',
      dataIndex: 'code',
      key: 'code',
      width: 120,
    },
    {
      title: '仓库名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => {
        const typeMap = {
          warehouse: '仓库',
          area: '区域',
          location: '库位',
        };
        return (
          <Space>
            {getTypeIcon(type)}
            {typeMap[type as keyof typeof typeMap] || type}
          </Space>
        );
      },
    },
    {
      title: '上级仓库',
      dataIndex: 'parentName',
      key: 'parentName',
      width: 150,
    },
    {
      title: '容量',
      dataIndex: 'capacity',
      key: 'capacity',
      width: 100,
      render: (capacity: number) => `${capacity} m³`,
    },
    {
      title: '当前库存',
      dataIndex: 'currentStock',
      key: 'currentStock',
      width: 100,
      render: (currentStock: number) => `${currentStock} m³`,
    },
    {
      title: '负责人',
      dataIndex: 'manager',
      key: 'manager',
      width: 100,
    },
    {
      title: '联系方式',
      dataIndex: 'contact',
      key: 'contact',
      width: 120,
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
      width: 150,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusMap = {
          active: { color: 'success', text: '正常' },
          inactive: { color: 'default', text: '停用' },
          maintenance: { color: 'warning', text: '维护中' },
        };
        const { color, text } = statusMap[status as keyof typeof statusMap] || { color: 'default', text: status };
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            查看
          </Button>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  // 处理查看操作
  const handleView = (record: WarehouseInfo) => {
    setSelectedWarehouse(record);
    setIsDetailModalVisible(true);
  };

  // 处理编辑操作
  const handleEdit = (record: WarehouseInfo) => {
    setEditingWarehouse(record);
    warehouseForm.setFieldsValue(record);
    setIsWarehouseModalVisible(true);
  };

  // 处理删除操作
  const handleDelete = (record: WarehouseInfo) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除仓库 "${record.name}" 吗？`,
      onOk() {
        // 实现删除逻辑
        message.success('删除成功');
      },
    });
  };

  // 处理搜索操作
  const handleSearch = (values: any) => {
    const filtered = warehouseData.filter((item) => {
      return (
        (!values.code || item.code.toLowerCase().includes(values.code.toLowerCase())) &&
        (!values.name || item.name.toLowerCase().includes(values.name.toLowerCase())) &&
        (!values.type || item.type === values.type) &&
        (!values.status || item.status === values.status)
      );
    });
    setFilteredData(filtered);
  };

  // 处理仓库树搜索
  const handleWarehouseTreeSearch = (value: string) => {
    setWarehouseSearchText(value);
    if (!value) {
      setFilteredWarehouseTree(warehouseTree);
      return;
    }

    const searchTree = (nodes: WarehouseNode[]): WarehouseNode[] => {
      return nodes
        .map((node) => {
          const matchNode = { ...node };
          if (node.children) {
            matchNode.children = searchTree(node.children);
          }
          if (
            matchNode.title.toLowerCase().includes(value.toLowerCase()) ||
            matchNode.code.toLowerCase().includes(value.toLowerCase()) ||
            (matchNode.children && matchNode.children.length > 0)
          ) {
            return matchNode;
          }
          return null;
        })
        .filter((node): node is WarehouseNode => node !== null);
    };

    const filtered = searchTree(warehouseTree);
    setFilteredWarehouseTree(filtered);
  };

  // 渲染仓库树节点
  const renderTreeNodes = (nodes: WarehouseNode[]) => {
    return nodes.map((node) => (
      <TreeNode
        key={node.key}
        title={
          <Space>
            {getTypeIcon(node.type)}
            {node.title}
            <Tag color="blue">{node.code}</Tag>
          </Space>
        }
      >
        {node.children && renderTreeNodes(node.children)}
      </TreeNode>
    ));
  };

  return (
    <div>
      <Card title="仓库管理">
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Card title="仓库结构" size="small">
              <Input.Search
                placeholder="搜索仓库"
                allowClear
                onChange={(e) => handleWarehouseTreeSearch(e.target.value)}
                style={{ marginBottom: 8 }}
              />
              <Tree
                showLine
                defaultExpandAll
                onSelect={(selectedKeys) => {
                  if (selectedKeys.length > 0) {
                    setSelectedWarehouseKey(selectedKeys[0] as string);
                  }
                }}
                treeData={
                  (warehouseSearchText ? filteredWarehouseTree : warehouseTree).map(node => ({
                    key: node.key,
                    title: (
                      <Space>
                        {getTypeIcon(node.type)}
                        {node.title}
                        <Tag color="blue">{node.code}</Tag>
                      </Space>
                    ),
                    children: node.children?.map(child => ({
                      key: child.key,
                      title: (
                        <Space>
                          {getTypeIcon(child.type)}
                          {child.title}
                          <Tag color="blue">{child.code}</Tag>
                        </Space>
                      ),
                      children: child.children?.map(grandChild => ({
                        key: grandChild.key,
                        title: (
                          <Space>
                            {getTypeIcon(grandChild.type)}
                            {grandChild.title}
                            <Tag color="blue">{grandChild.code}</Tag>
                          </Space>
                        ),
                      })),
                    })),
                  }))
                }
              />
              <div style={{ marginTop: 16 }}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setIsTreeModalVisible(true)}
                  block
                >
                  添加节点
                </Button>
              </div>
            </Card>
          </Col>
          <Col span={18}>
            {/* 搜索表单 */}
            <Form
              form={searchForm}
              layout="inline"
              onFinish={handleSearch}
              style={{ marginBottom: 16 }}
            >
              <Form.Item name="code" label="仓库编码">
                <Input placeholder="请输入仓库编码" />
              </Form.Item>
              <Form.Item name="name" label="仓库名称">
                <Input placeholder="请输入仓库名称" />
              </Form.Item>
              <Form.Item name="type" label="类型">
                <Select placeholder="请选择类型" style={{ width: 120 }}>
                  <Option value="warehouse">仓库</Option>
                  <Option value="area">区域</Option>
                  <Option value="location">库位</Option>
                </Select>
              </Form.Item>
              <Form.Item name="status" label="状态">
                <Select placeholder="请选择状态" style={{ width: 120 }}>
                  <Option value="active">正常</Option>
                  <Option value="inactive">停用</Option>
                  <Option value="maintenance">维护中</Option>
                </Select>
              </Form.Item>
              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                    查询
                  </Button>
                  <Button onClick={() => {
                    searchForm.resetFields();
                    setFilteredData(warehouseData);
                  }}>
                    重置
                  </Button>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setEditingWarehouse(null);
                      warehouseForm.resetFields();
                      setIsWarehouseModalVisible(true);
                    }}
                  >
                    新增仓库
                  </Button>
                </Space>
              </Form.Item>
            </Form>

            {/* 仓库数据表格 */}
            <Table
              columns={columns}
              dataSource={filteredData}
              loading={loading}
              rowKey="id"
              scroll={{ x: 1500 }}
              pagination={{
                total: filteredData.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
            />
          </Col>
        </Row>

        {/* 仓库详情模态框 */}
        <Modal
          title="仓库详情"
          open={isDetailModalVisible}
          onCancel={() => setIsDetailModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
              关闭
            </Button>,
          ]}
          width={800}
          destroyOnHidden
        >
          {selectedWarehouse && (
            <Descriptions column={2} bordered>
              <Descriptions.Item label="仓库编码">{selectedWarehouse.code}</Descriptions.Item>
              <Descriptions.Item label="仓库名称">{selectedWarehouse.name}</Descriptions.Item>
              <Descriptions.Item label="类型">
                <Space>
                  {getTypeIcon(selectedWarehouse.type)}
                  {selectedWarehouse.type === 'warehouse' ? '仓库' : 
                   selectedWarehouse.type === 'area' ? '区域' : '库位'}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="状态">{selectedWarehouse.statusText}</Descriptions.Item>
              <Descriptions.Item label="上级仓库">{selectedWarehouse.parentName || '-'}</Descriptions.Item>
              <Descriptions.Item label="容量">{selectedWarehouse.capacity} m³</Descriptions.Item>
              <Descriptions.Item label="当前库存">{selectedWarehouse.currentStock} m³</Descriptions.Item>
              <Descriptions.Item label="负责人">{selectedWarehouse.manager}</Descriptions.Item>
              <Descriptions.Item label="联系方式">{selectedWarehouse.contact}</Descriptions.Item>
              <Descriptions.Item label="地址" span={2}>{selectedWarehouse.address}</Descriptions.Item>
              <Descriptions.Item label="描述" span={2}>{selectedWarehouse.description}</Descriptions.Item>
              <Descriptions.Item label="创建人">{selectedWarehouse.createUser}</Descriptions.Item>
              <Descriptions.Item label="创建时间">{selectedWarehouse.createDate}</Descriptions.Item>
              <Descriptions.Item label="更新人">{selectedWarehouse.updateUser}</Descriptions.Item>
              <Descriptions.Item label="更新时间">{selectedWarehouse.updateDate}</Descriptions.Item>
            </Descriptions>
          )}
        </Modal>

        {/* 仓库编辑模态框 */}
        <Modal
          title={editingWarehouse ? '编辑仓库' : '新增仓库'}
          open={isWarehouseModalVisible}
          onOk={() => {
            warehouseForm.validateFields().then((values) => {
              // 实现保存逻辑
              message.success(editingWarehouse ? '更新成功' : '添加成功');
              setIsWarehouseModalVisible(false);
              loadWarehouseData();
            });
          }}
          onCancel={() => setIsWarehouseModalVisible(false)}
          width={800}
          destroyOnHidden
        >
          <Form
            form={warehouseForm}
            layout="vertical"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="code"
                  label="仓库编码"
                  rules={[{ required: true, message: '请输入仓库编码' }]}
                >
                  <Input placeholder="请输入仓库编码" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="仓库名称"
                  rules={[{ required: true, message: '请输入仓库名称' }]}
                >
                  <Input placeholder="请输入仓库名称" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="type"
                  label="类型"
                  rules={[{ required: true, message: '请选择类型' }]}
                >
                  <Select placeholder="请选择类型">
                    <Option value="warehouse">仓库</Option>
                    <Option value="area">区域</Option>
                    <Option value="location">库位</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="status"
                  label="状态"
                  rules={[{ required: true, message: '请选择状态' }]}
                >
                  <Select placeholder="请选择状态">
                    <Option value="active">正常</Option>
                    <Option value="inactive">停用</Option>
                    <Option value="maintenance">维护中</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="capacity"
                  label="容量"
                  rules={[{ required: true, message: '请输入容量' }]}
                >
                  <Input type="number" placeholder="请输入容量" addonAfter="m³" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="currentStock"
                  label="当前库存"
                  rules={[{ required: true, message: '请输入当前库存' }]}
                >
                  <Input type="number" placeholder="请输入当前库存" addonAfter="m³" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="manager"
                  label="负责人"
                  rules={[{ required: true, message: '请输入负责人' }]}
                >
                  <Input placeholder="请输入负责人" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="contact"
                  label="联系方式"
                  rules={[{ required: true, message: '请输入联系方式' }]}
                >
                  <Input placeholder="请输入联系方式" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              name="address"
              label="地址"
              rules={[{ required: true, message: '请输入地址' }]}
            >
              <Input placeholder="请输入地址" />
            </Form.Item>
            <Form.Item
              name="description"
              label="描述"
            >
              <TextArea rows={4} placeholder="请输入描述" />
            </Form.Item>
          </Form>
        </Modal>

        {/* 仓库树节点编辑模态框 */}
        <Modal
          title={editingTreeNode ? '编辑节点' : '添加节点'}
          open={isTreeModalVisible}
          onOk={() => {
            treeForm.validateFields().then((values) => {
              // 实现保存逻辑
              message.success(editingTreeNode ? '更新成功' : '添加成功');
              setIsTreeModalVisible(false);
              // 重新加载树数据
            });
          }}
          onCancel={() => setIsTreeModalVisible(false)}
          width={600}
          destroyOnHidden
        >
          <Form
            form={treeForm}
            layout="vertical"
          >
            <Form.Item
              name="title"
              label="节点名称"
              rules={[{ required: true, message: '请输入节点名称' }]}
            >
              <Input placeholder="请输入节点名称" />
            </Form.Item>
            <Form.Item
              name="type"
              label="节点类型"
              rules={[{ required: true, message: '请选择节点类型' }]}
            >
              <Select placeholder="请选择节点类型">
                <Option value="warehouse">仓库</Option>
                <Option value="area">区域</Option>
                <Option value="location">库位</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="code"
              label="编码"
              rules={[{ required: true, message: '请输入编码' }]}
            >
              <Input placeholder="请输入编码" />
            </Form.Item>
            <Form.Item
              name="description"
              label="描述"
            >
              <TextArea rows={4} placeholder="请输入描述" />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default Warehouse;