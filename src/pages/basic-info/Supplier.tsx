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
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Option } = Select;
const { TextArea } = Input;

// 供应商信息接口
interface SupplierInfo {
  id: string;
  code: string;
  name: string;
  type: string;
  // 新增字段：产品类型、合作关系等级、供应商资质（用于表单）
  productType?: string;
  relationshipLevel?: string;
  qualification?: string;
  deviceTypeCategory?: string; // 左侧设备类型树关联（主设备/附属设备/特种设备/非特种设备）
  contact: string;
  phone: string;
  email: string;
  address: string;
  status: 'active' | 'inactive' | 'blacklist';
  statusText: string;
  description: string;
  createUser: string;
  createDate: string;
  updateUser: string;
  updateDate: string;
}

const Supplier: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [supplierData, setSupplierData] = useState<SupplierInfo[]>([]);
  const [filteredData, setFilteredData] = useState<SupplierInfo[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<SupplierInfo | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierInfo | null>(null);

  const [searchForm] = Form.useForm();
  const [supplierForm] = Form.useForm();

  // 初始化供应商数据
  useEffect(() => {
    loadSupplierData();
  }, []);

  // 加载供应商数据
  const loadSupplierData = () => {
    setLoading(true);
    
    // 模拟供应商数据
    const mockSupplierData: SupplierInfo[] = [
      {
        id: '1',
        code: 'SP001',
        name: '上海电子设备有限公司',
        type: '电子设备',
        deviceTypeCategory: '主设备',
        contact: '张三',
        phone: '13800138001',
        email: 'zhangsan@example.com',
        address: '上海市浦东新区XX路XX号',
        status: 'active',
        statusText: '正常',
        description: '主要电子设备供应商',
        createUser: '管理员',
        createDate: '2023-01-15 10:30:00',
        updateUser: '张三',
        updateDate: '2023-06-20 14:20:00',
      },
      {
        id: '2',
        code: 'SP002',
        name: '北京办公用品有限公司',
        type: '办公用品',
        deviceTypeCategory: '附属设备',
        contact: '李四',
        phone: '13800138002',
        email: 'lisi@example.com',
        address: '北京市朝阳区XX街XX号',
        status: 'active',
        statusText: '正常',
        description: '办公用品供应商',
        createUser: '管理员',
        createDate: '2023-02-20 09:15:00',
        updateUser: '李四',
        updateDate: '2023-06-25 16:30:00',
      },
      // ... 其他供应商数据
    ];

    setSupplierData(mockSupplierData);
    setFilteredData(mockSupplierData);
    try {
      const names = mockSupplierData.map(s => s.name);
      localStorage.setItem('supplierList', JSON.stringify(names));
    } catch {}
    setLoading(false);
  };

  // 设备类型树数据
  const equipmentTypes = React.useMemo(() => {
    try {
      const raw = localStorage.getItem('equipment_types');
      if (raw) {
        return (JSON.parse(raw) as { id: string; name: string }[]);
      }
    } catch {}
    return [
      { id: '1', name: '主设备' },
      { id: '2', name: '附属设备' },
      { id: '3', name: '特种设备' },
      { id: '4', name: '非特种设备' },
    ];
  }, []);

  const typeIdToNameMap = React.useMemo(() => {
    const m: Record<string, string> = {};
    equipmentTypes.forEach(t => { m[t.id] = t.name; });
    return m;
  }, [equipmentTypes]);

  // 表格列配置
  const columns: ColumnsType<SupplierInfo> = [
    {
      title: '供应商编码',
      dataIndex: 'code',
      key: 'code',
      width: 120,
    },
    {
      title: '供应商名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '联系人',
      dataIndex: 'contact',
      key: 'contact',
      width: 100,
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 120,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 180,
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
      width: 250,
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
          blacklist: { color: 'error', text: '黑名单' },
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
  const handleView = (record: SupplierInfo) => {
    setSelectedSupplier(record);
    setIsDetailModalVisible(true);
  };

  // 处理编辑操作
  const handleEdit = (record: SupplierInfo) => {
    setEditingSupplier(record);
    supplierForm.setFieldsValue(record);
    setIsModalVisible(true);
  };

  // 处理删除操作
  const handleDelete = (record: SupplierInfo) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除供应商 "${record.name}" 吗？`,
      onOk() {
        // 实现删除逻辑
        message.success('删除成功');
      },
    });
  };

  // 处理搜索操作
  const handleSearch = (values: any) => {
    const filtered = supplierData.filter((item) => {
      return (
        (!values.code || item.code.toLowerCase().includes(values.code.toLowerCase())) &&
        (!values.name || item.name.toLowerCase().includes(values.name.toLowerCase())) &&
        (!values.status || item.status === values.status)
      );
    });
    setFilteredData(filtered);
  };

  return (
    <Row gutter={16}>
      <Col span={6}>
        <Card title="设备类型目录" size="small">
          <Tree
            defaultExpandAll
            selectedKeys={selectedTypeId ? [selectedTypeId] : []}
            onSelect={(keys) => {
              const k = (keys as React.Key[])[0] as string;
              setSelectedTypeId(k === 'root' ? null : k);
            }}
            treeData={[
              { title: '设备类型目录', key: 'root', children: equipmentTypes.map(t => ({ title: t.name, key: t.id })) }
            ]}
          />
        </Card>
      </Col>
      <Col span={18}>
      <div>
      <Card title="供应商管理">
        {/* 搜索表单 */}
        <Form
          form={searchForm}
          layout="inline"
          onFinish={handleSearch}
          style={{ marginBottom: 16 }}
        >
          <Form.Item name="code" label="供应商编码">
            <Input placeholder="请输入供应商编码" />
          </Form.Item>
          <Form.Item name="name" label="供应商名称">
            <Input placeholder="请输入供应商名称" />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择状态" style={{ width: 120 }}>
              <Option value="active">正常</Option>
              <Option value="inactive">停用</Option>
              <Option value="blacklist">黑名单</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                查询
              </Button>
              <Button onClick={() => {
                searchForm.resetFields();
                setFilteredData(supplierData);
              }}>
                重置
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingSupplier(null);
                  supplierForm.resetFields();
                  setIsModalVisible(true);
                }}
              >
                新增供应商
              </Button>
            </Space>
          </Form.Item>
        </Form>

        {/* 供应商数据表格 */}
        <Table
          columns={columns}
          dataSource={selectedTypeId ? filteredData.filter(d => (d.deviceTypeCategory || '') === typeIdToNameMap[selectedTypeId!]) : filteredData}
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

        {/* 供应商详情模态框 */}
        <Modal
          title="供应商详情"
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
          {selectedSupplier && (
            <Descriptions column={2} bordered>
              <Descriptions.Item label="供应商编码">{selectedSupplier.code}</Descriptions.Item>
              <Descriptions.Item label="供应商名称">{selectedSupplier.name}</Descriptions.Item>
              <Descriptions.Item label="状态">{selectedSupplier.statusText}</Descriptions.Item>
              <Descriptions.Item label="联系人">{selectedSupplier.contact}</Descriptions.Item>
              <Descriptions.Item label="联系电话">{selectedSupplier.phone}</Descriptions.Item>
              <Descriptions.Item label="邮箱">{selectedSupplier.email}</Descriptions.Item>
              <Descriptions.Item label="地址" span={2}>{selectedSupplier.address}</Descriptions.Item>
              <Descriptions.Item label="描述" span={2}>{selectedSupplier.description}</Descriptions.Item>
              <Descriptions.Item label="创建人">{selectedSupplier.createUser}</Descriptions.Item>
              <Descriptions.Item label="创建时间">{selectedSupplier.createDate}</Descriptions.Item>
              <Descriptions.Item label="更新人">{selectedSupplier.updateUser}</Descriptions.Item>
              <Descriptions.Item label="更新时间">{selectedSupplier.updateDate}</Descriptions.Item>
            </Descriptions>
          )}
        </Modal>

        {/* 供应商编辑模态框 */}
        <Modal
          title={editingSupplier ? '编辑供应商' : '新增供应商'}
          open={isModalVisible}
          onOk={() => {
            supplierForm.validateFields().then((values) => {
              // 实现保存逻辑
              message.success(editingSupplier ? '更新成功' : '添加成功');
              setIsModalVisible(false);
              loadSupplierData();
            });
          }}
          onCancel={() => setIsModalVisible(false)}
          width={800}
          destroyOnHidden
        >
          <Form
            form={supplierForm}
            layout="vertical"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="code"
                  label="供应商编码"
                  rules={[{ required: true, message: '请输入供应商编码' }]}
                >
                  <Input placeholder="请输入供应商编码" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="供应商名称"
                  rules={[{ required: true, message: '请输入供应商名称' }]}
                >
                  <Input placeholder="请输入供应商名称" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="productType"
                  label="产品类型"
                  rules={[{ required: true, message: '请选择产品类型' }]}
                >
                  <Select placeholder="请选择产品类型">
                    <Option value="生产设备类">生产设备类</Option>
                    <Option value="办公类器械">办公类器械</Option>
                    <Option value="配件耗材类">配件耗材类</Option>
                    <Option value="设备服务类">设备服务类</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="relationshipLevel"
                  label="合作关系等级"
                  rules={[{ required: true, message: '请选择合作关系等级' }]}
                >
                  <Select placeholder="请选择合作关系等级">
                    <Option value="战略供应商">战略供应商</Option>
                    <Option value="优选供应商">优选供应商</Option>
                    <Option value="普通供应商">普通供应商</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="qualification"
                  label="供应商资质"
                  rules={[{ required: true, message: '请选择供应商资质' }]}
                >
                  <Select placeholder="请选择供应商资质">
                    <Option value="原厂">原厂</Option>
                    <Option value="授权">授权</Option>
                    <Option value="合规">合规</Option>
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
                    <Option value="blacklist">黑名单</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="contact"
                  label="联系人"
                  rules={[{ required: true, message: '请输入联系人' }]}
                >
                  <Input placeholder="请输入联系人" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="phone"
                  label="联系电话"
                  rules={[{ required: true, message: '请输入联系电话' }]}
                >
                  <Input placeholder="请输入联系电话" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              name="email"
              label="邮箱"
              rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '请输入有效的邮箱地址' },
              ]}
            >
              <Input placeholder="请输入邮箱" />
            </Form.Item>
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
      </Card>
      </div>
      </Col>
    </Row>
  );
};

export default Supplier;