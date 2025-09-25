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

const WarehouseManagement: React.FC = () => {
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
        description: '存放办公设备的区域',
        createUser: '管理员',
        createDate: '2023-01-15 10:30:00',
        updateUser: '李四',
        updateDate: '2023-05-10 11:30:00',
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
        description: '专门存放计算机设备的位置',
        createUser: '管理员',
        createDate: '2023-01-15 10:30:00',
        updateUser: '王五',
        updateDate: '2023-04-15 09:20:00',
      },
      {
        id: '4',
        code: 'WH002',
        name: '备件仓库',
        type: 'warehouse',
        capacity: 2000,
        currentStock: 1200,
        manager: '钱八',
        contact: '13800138006',
        address: 'B栋地下室',
        status: 'active',
        statusText: '正常',
        description: '存放备品备件的仓库',
        createUser: '管理员',
        createDate: '2023-02-01 09:00:00',
        updateUser: '钱八',
        updateDate: '2023-06-01 16:00:00',
      },
    ];

    // 模拟API调用
    setTimeout(() => {
      setWarehouseData(mockWarehouseData);
      setFilteredData(mockWarehouseData);
      setLoading(false);
    }, 1000);
  };

  // 仓库树过滤功能
  useEffect(() => {
    filterWarehouseTree();
  }, [warehouseTree, warehouseSearchText]);

  const filterWarehouseTree = () => {
    if (!warehouseSearchText.trim()) {
      setFilteredWarehouseTree(warehouseTree);
      return;
    }

    const filterNodes = (nodes: WarehouseNode[]): WarehouseNode[] => {
      return nodes.reduce((filtered: WarehouseNode[], node) => {
        const matchesSearch = 
          node.title.toLowerCase().includes(warehouseSearchText.toLowerCase()) ||
          node.code.toLowerCase().includes(warehouseSearchText.toLowerCase()) ||
          (node.description && node.description.toLowerCase().includes(warehouseSearchText.toLowerCase()));

        if (matchesSearch) {
          // 如果当前节点匹配，包含所有子节点
          filtered.push({ ...node });
        } else if (node.children) {
          // 如果当前节点不匹配，检查子节点
          const filteredChildren = filterNodes(node.children);
          if (filteredChildren.length > 0) {
            filtered.push({
              ...node,
              children: filteredChildren
            });
          }
        }
        return filtered;
      }, []);
    };

    setFilteredWarehouseTree(filterNodes(warehouseTree));
  };

  // 生成仓库编号
  const generateWarehouseCode = (type: string) => {
    const typeCode = type === 'warehouse' ? 'WH' : type === 'area' ? 'AR' : 'LOC';
    const sequence = String(warehouseData.length + 1).padStart(3, '0');
    return `${typeCode}${sequence}`;
  };

  // 搜索功能
  const handleSearch = (values: any) => {
    let filtered = [...warehouseData];
    
    if (values.code) {
      filtered = filtered.filter(item => 
        item.code.toLowerCase().includes(values.code.toLowerCase())
      );
    }
    
    if (values.name) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(values.name.toLowerCase())
      );
    }
    
    if (values.type) {
      filtered = filtered.filter(item => item.type === values.type);
    }
    
    if (values.status) {
      filtered = filtered.filter(item => item.status === values.status);
    }
    
    if (values.manager) {
      filtered = filtered.filter(item => 
        item.manager.toLowerCase().includes(values.manager.toLowerCase())
      );
    }
    
    setFilteredData(filtered);
  };

  // 仓库树选择
  const handleWarehouseSelect = (selectedKeys: React.Key[], info: any) => {
    if (selectedKeys.length > 0) {
      setSelectedWarehouseKey(selectedKeys[0] as string);
      // 根据选中的仓库节点过滤数据
      const selectedNode = findNodeByKey(warehouseTree, selectedKeys[0] as string);
      if (selectedNode) {
        const filtered = warehouseData.filter(item => 
          item.code === selectedNode.code || 
          item.parentKey === selectedKeys[0]
        );
        setFilteredData(filtered);
      }
    }
  };

  // 查找树节点
  const findNodeByKey = (nodes: WarehouseNode[], key: string): WarehouseNode | null => {
    for (const node of nodes) {
      if (node.key === key) {
        return node;
      }
      if (node.children) {
        const found = findNodeByKey(node.children, key);
        if (found) return found;
      }
    }
    return null;
  };

  // 仓库信息管理
  const handleAdd = () => {
    setEditingWarehouse(null);
    warehouseForm.resetFields();
    setIsWarehouseModalVisible(true);
  };

  const handleEdit = (record: WarehouseInfo) => {
    setEditingWarehouse(record);
    warehouseForm.setFieldsValue(record);
    setIsWarehouseModalVisible(true);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个仓库信息吗？',
      onOk: () => {
        const newData = warehouseData.filter(item => item.id !== id);
        setWarehouseData(newData);
        setFilteredData(newData);
        message.success('删除成功');
      }
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await warehouseForm.validateFields();
      
      if (editingWarehouse) {
        // 编辑
        const newData = warehouseData.map(item => 
          item.id === editingWarehouse.id 
            ? {
                ...item,
                ...values,
                statusText: values.status === 'active' ? '正常' : values.status === 'inactive' ? '停用' : '维护中',
                updateUser: '当前用户',
                updateDate: new Date().toLocaleString(),
              }
            : item
        );
        setWarehouseData(newData);
        setFilteredData(newData);
        message.success('修改成功');
      } else {
        // 新增
        const newWarehouse: WarehouseInfo = {
          id: String(Date.now()),
          ...values,
          code: generateWarehouseCode(values.type),
          statusText: values.status === 'active' ? '正常' : values.status === 'inactive' ? '停用' : '维护中',
          createUser: '当前用户',
          createDate: new Date().toLocaleString(),
          updateUser: '当前用户',
          updateDate: new Date().toLocaleString(),
        };
        
        const newData = [...warehouseData, newWarehouse];
        setWarehouseData(newData);
        setFilteredData(newData);
        message.success('添加成功');
      }
      
      setIsWarehouseModalVisible(false);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handleDetail = (record: WarehouseInfo) => {
    setSelectedWarehouse(record);
    setIsDetailModalVisible(true);
  };

  // 仓库树管理
  const handleAddTreeNode = (parentKey?: string) => {
    setEditingTreeNode(null);
    treeForm.resetFields();
    if (parentKey) {
      treeForm.setFieldsValue({ parentKey });
    }
    setIsTreeModalVisible(true);
  };

  const handleEditTreeNode = (node: WarehouseNode) => {
    setEditingTreeNode(node);
    treeForm.setFieldsValue(node);
    setIsTreeModalVisible(true);
  };

  const handleDeleteTreeNode = (key: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '删除仓库节点将同时删除其下所有子节点，确定要删除吗？',
      onOk: () => {
        const deleteNode = (nodes: WarehouseNode[]): WarehouseNode[] => {
          return nodes.filter(node => {
            if (node.key === key) {
              return false;
            }
            if (node.children) {
              node.children = deleteNode(node.children);
            }
            return true;
          });
        };
        setWarehouseTree(deleteNode(warehouseTree));
        message.success('删除成功');
      }
    });
  };

  const handleTreeSubmit = async () => {
    try {
      const values = await treeForm.validateFields();
      
      if (editingTreeNode) {
        // 编辑节点
        const updateNode = (nodes: WarehouseNode[]): WarehouseNode[] => {
          return nodes.map(node => {
            if (node.key === editingTreeNode.key) {
              return { ...node, ...values };
            }
            if (node.children) {
              node.children = updateNode(node.children);
            }
            return node;
          });
        };
        setWarehouseTree(updateNode(warehouseTree));
        message.success('修改成功');
      } else {
        // 新增节点
        const newNode: WarehouseNode = {
          key: `node-${Date.now()}`,
          title: values.title,
          level: values.parentKey ? 2 : 1,
          type: values.type,
          code: values.code,
          description: values.description,
          capacity: values.capacity,
          currentStock: values.currentStock || 0,
          manager: values.manager,
          contact: values.contact,
          address: values.address,
          status: values.status,
        };

        if (values.parentKey) {
          // 添加到父节点下
          const addToParent = (nodes: WarehouseNode[]): WarehouseNode[] => {
            return nodes.map(node => {
              if (node.key === values.parentKey) {
                return {
                  ...node,
                  children: [...(node.children || []), newNode]
                };
              }
              if (node.children) {
                node.children = addToParent(node.children);
              }
              return node;
            });
          };
          setWarehouseTree(addToParent(warehouseTree));
        } else {
          // 添加为根节点
          setWarehouseTree([...warehouseTree, newNode]);
        }
        message.success('添加成功');
      }
      
      setIsTreeModalVisible(false);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 渲染仓库树节点
  const renderTreeNode = (node: WarehouseNode) => {
    const getIcon = (type: string) => {
      switch (type) {
        case 'warehouse': return '🏢';
        case 'area': return '📦';
        case 'location': return '📍';
        default: return '📁';
      }
    };

    return (
      <TreeNode
        key={node.key}
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>
              {getIcon(node.type)} {node.title} ({node.code})
            </span>
            <div className="tree-actions">
              <Space size="small">
                <Button
                  type="text"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddTreeNode(node.key);
                  }}
                  title="添加子节点"
                />
                <Button
                  type="text"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditTreeNode(node);
                  }}
                  title="编辑"
                />
                <Button
                  type="text"
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTreeNode(node.key);
                  }}
                  title="删除"
                  danger
                />
              </Space>
            </div>
          </div>
        }
      >
        {node.children?.map(child => renderTreeNode(child))}
      </TreeNode>
    );
  };

  const columns: ColumnsType<WarehouseInfo> = [
    {
      title: '编号',
      dataIndex: 'code',
      key: 'code',
      width: 100,
    },
    {
      title: '名称',
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
          location: '位置',
        };
        return typeMap[type as keyof typeof typeMap] || type;
      },
    },
    {
      title: '容量',
      dataIndex: 'capacity',
      key: 'capacity',
      width: 100,
      render: (value: number) => value.toLocaleString(),
    },
    {
      title: '当前库存',
      dataIndex: 'currentStock',
      key: 'currentStock',
      width: 100,
      render: (value: number) => value.toLocaleString(),
    },
    {
      title: '使用率',
      key: 'usage',
      width: 100,
      render: (_, record) => {
        const usage = record.capacity > 0 ? (record.currentStock / record.capacity * 100).toFixed(1) : '0.0';
        const color = parseFloat(usage) > 80 ? 'red' : parseFloat(usage) > 60 ? 'orange' : 'green';
        return <Tag color={color}>{usage}%</Tag>;
      },
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
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string, record: WarehouseInfo) => {
        const colors = {
          active: 'success',
          inactive: 'default',
          maintenance: 'warning',
        };
        return (
          <Tag color={colors[status as keyof typeof colors]}>
            {record.statusText}
          </Tag>
        );
      },
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
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            danger
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="warehouse-management">
      <style>{`
        .tree-node:hover .tree-actions {
          display: block !important;
        }
      `}</style>
      
      <Row gutter={16}>
        {/* 左侧仓库树 */}
        <Col flex="300px">
          <Card 
            title="仓库目录"
            extra={
              <Button 
                type="primary" 
                size="small" 
                icon={<PlusOutlined />}
                onClick={() => handleAddTreeNode()}
              >
                添加仓库
              </Button>
            }
          >
            <div style={{ marginBottom: 8 }}>
              <Input.Search
                placeholder="搜索仓库"
                value={warehouseSearchText}
                onChange={(e) => setWarehouseSearchText(e.target.value)}
                allowClear
                size="small"
              />
            </div>
            <div style={{ flex: 1, overflow: 'auto' }}>
              <Tree
                showLine
                selectedKeys={selectedWarehouseKey ? [selectedWarehouseKey] : []}
                onSelect={handleWarehouseSelect}
              >
                {filteredWarehouseTree.map(node => renderTreeNode(node))}
              </Tree>
            </div>
          </Card>
        </Col>

        {/* 右侧仓库信息列表 */}
        <Col flex="auto">
          <Card 
            title="仓库信息管理"
          >
            <div style={{ marginBottom: 16 }}>
              <Form form={searchForm} layout="inline" onFinish={handleSearch}>
                <Form.Item name="code" label="仓库编号">
                  <Input placeholder="请输入编号" style={{ width: 120 }} />
                </Form.Item>
                <Form.Item name="name" label="仓库名称">
                  <Input placeholder="请输入名称" style={{ width: 150 }} />
                </Form.Item>
                <Form.Item name="type" label="类型">
                  <Select placeholder="请选择类型" style={{ width: 120 }} allowClear>
                    <Option value="warehouse">仓库</Option>
                    <Option value="area">区域</Option>
                    <Option value="location">位置</Option>
                  </Select>
                </Form.Item>
                <Form.Item name="status" label="状态">
                  <Select placeholder="请选择状态" style={{ width: 120 }} allowClear>
                    <Option value="active">正常</Option>
                    <Option value="inactive">停用</Option>
                    <Option value="maintenance">维护中</Option>
                  </Select>
                </Form.Item>
                <Form.Item name="manager" label="负责人">
                  <Input placeholder="请输入负责人" style={{ width: 120 }} />
                </Form.Item>
                <Form.Item>
                  <Space>
                    <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                      搜索
                    </Button>
                    <Button onClick={() => {
                      searchForm.resetFields();
                      setFilteredData(warehouseData);
                    }}>
                      重置
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </div>

            <div style={{ marginBottom: 16 }}>
              <Space>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                  新增仓库信息
                </Button>
              </Space>
            </div>

            <Table
              columns={columns}
              dataSource={filteredData}
              rowKey="id"
              loading={loading}
              pagination={{
                total: filteredData.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
              scroll={{ x: 1200 }}
            />
          </Card>
        </Col>
      </Row>

      {/* 仓库信息新增/编辑模态框 */}
      <Modal
        title={editingWarehouse ? '编辑仓库信息' : '新增仓库信息'}
        open={isWarehouseModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsWarehouseModalVisible(false)}
        width={800}
        okText="确定"
        cancelText="取消"
      >
        <Form form={warehouseForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                label="仓库名称" 
                name="name"
                rules={[{ required: true, message: '请输入仓库名称' }]}
              >
                <Input placeholder="请输入仓库名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                label="类型" 
                name="type"
                rules={[{ required: true, message: '请选择类型' }]}
              >
                <Select placeholder="请选择类型">
                  <Option value="warehouse">仓库</Option>
                  <Option value="area">区域</Option>
                  <Option value="location">位置</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                label="容量" 
                name="capacity"
                rules={[{ required: true, message: '请输入容量' }]}
              >
                <Input placeholder="请输入容量" type="number" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="当前库存" name="currentStock">
                <Input placeholder="请输入当前库存" type="number" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                label="负责人" 
                name="manager"
                rules={[{ required: true, message: '请输入负责人' }]}
              >
                <Input placeholder="请输入负责人" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                label="联系方式" 
                name="contact"
                rules={[{ required: true, message: '请输入联系方式' }]}
              >
                <Input placeholder="请输入联系方式" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                label="地址" 
                name="address"
                rules={[{ required: true, message: '请输入地址' }]}
              >
                <Input placeholder="请输入地址" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                label="状态" 
                name="status"
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
            <Col span={24}>
              <Form.Item label="描述" name="description">
                <TextArea 
                  placeholder="请输入描述" 
                  rows={3}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* 仓库详情模态框 */}
      <Modal
        title="仓库详情"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedWarehouse && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="编号">{selectedWarehouse.code}</Descriptions.Item>
            <Descriptions.Item label="名称">{selectedWarehouse.name}</Descriptions.Item>
            <Descriptions.Item label="类型">
              {selectedWarehouse.type === 'warehouse' ? '仓库' : 
               selectedWarehouse.type === 'area' ? '区域' : '位置'}
            </Descriptions.Item>
            <Descriptions.Item label="容量">{selectedWarehouse.capacity.toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="当前库存">{selectedWarehouse.currentStock.toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="使用率">
              {selectedWarehouse.capacity > 0 ? (selectedWarehouse.currentStock / selectedWarehouse.capacity * 100).toFixed(1) : '0.0'}%
            </Descriptions.Item>
            <Descriptions.Item label="负责人">{selectedWarehouse.manager}</Descriptions.Item>
            <Descriptions.Item label="联系方式">{selectedWarehouse.contact}</Descriptions.Item>
            <Descriptions.Item label="地址">{selectedWarehouse.address}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={selectedWarehouse.status === 'active' ? 'success' : 'default'}>
                {selectedWarehouse.statusText}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="创建人">{selectedWarehouse.createUser}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{selectedWarehouse.createDate}</Descriptions.Item>
            <Descriptions.Item label="描述" span={2}>{selectedWarehouse.description}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* 仓库树节点管理模态框 */}
      <Modal
        title={editingTreeNode ? '编辑仓库节点' : '新增仓库节点'}
        open={isTreeModalVisible}
        onOk={handleTreeSubmit}
        onCancel={() => setIsTreeModalVisible(false)}
        width={600}
        okText="确定"
        cancelText="取消"
      >
        <Form form={treeForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                label="节点名称" 
                name="title"
                rules={[{ required: true, message: '请输入节点名称' }]}
              >
                <Input placeholder="请输入节点名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                label="编号" 
                name="code"
                rules={[{ required: true, message: '请输入编号' }]}
              >
                <Input placeholder="请输入编号" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                label="类型" 
                name="type"
                rules={[{ required: true, message: '请选择类型' }]}
              >
                <Select placeholder="请选择类型">
                  <Option value="warehouse">仓库</Option>
                  <Option value="area">区域</Option>
                  <Option value="location">位置</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="父级节点" name="parentKey">
                <Select placeholder="请选择父级节点" allowClear>
                  {warehouseTree.map(node => (
                    <Option key={node.key} value={node.key}>{node.title}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                label="容量" 
                name="capacity"
                rules={[{ required: true, message: '请输入容量' }]}
              >
                <Input placeholder="请输入容量" type="number" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="当前库存" name="currentStock">
                <Input placeholder="请输入当前库存" type="number" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                label="负责人" 
                name="manager"
                rules={[{ required: true, message: '请输入负责人' }]}
              >
                <Input placeholder="请输入负责人" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                label="联系方式" 
                name="contact"
                rules={[{ required: true, message: '请输入联系方式' }]}
              >
                <Input placeholder="请输入联系方式" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                label="地址" 
                name="address"
                rules={[{ required: true, message: '请输入地址' }]}
              >
                <Input placeholder="请输入地址" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                label="状态" 
                name="status"
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
            <Col span={24}>
              <Form.Item label="描述" name="description">
                <TextArea 
                  placeholder="请输入描述" 
                  rows={3}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default WarehouseManagement;