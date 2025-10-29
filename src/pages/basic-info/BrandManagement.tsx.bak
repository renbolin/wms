import React, { useEffect, useMemo, useState } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, Select, Tag, message, Row, Col, Switch, Tree } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface BrandRecord {
  id: string;
  brandCode: string;
  brandName: string;
  manufacturer?: string;
  deviceType?: string;
  status: 'enabled' | 'disabled';
  suppliers: string[];
  description?: string;
  createUser?: string;
  createDate?: string;
  updateUser?: string;
  updateDate?: string;
}

const DEFAULT_BRANDS: BrandRecord[] = [
  {
    id: 'b-001',
    brandCode: 'BRD001',
    brandName: '华仪',
    manufacturer: '华仪集团',
    deviceType: '电气测试设备',
    status: 'enabled',
    suppliers: ['华仪官方渠道', '宁波华仪经销'],
    description: '电气测试与测量设备品牌',
  },
  {
    id: 'b-002',
    brandCode: 'BRD002',
    brandName: '德瑞',
    manufacturer: '德瑞测控',
    deviceType: '环境监测设备',
    status: 'enabled',
    suppliers: ['德瑞一级代理'],
    description: '环境与气体监测设备品牌',
  },
  {
    id: 'b-003',
    brandCode: 'BRD003',
    brandName: '精测',
    manufacturer: '精测仪器',
    deviceType: '计量检测设备',
    status: 'disabled',
    suppliers: ['精测区域代理'],
    description: '计量检测与校准设备品牌（停用示例）',
  },
];

const STORAGE_KEY = 'basic_brand_dict';

const BrandManagement: React.FC = () => {
  const [data, setData] = useState<BrandRecord[]>([]);
  const [filtered, setFiltered] = useState<BrandRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BrandRecord | null>(null);
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);

  // 设备类型树数据源（来自 localStorage，缺省为四类）
  const equipmentTypes = useMemo(() => {
    try {
      const raw = localStorage.getItem('equipment_types');
      if (raw) {
        const arr = JSON.parse(raw) as { id: string; name: string; children?: any[] }[];
        return arr;
      }
    } catch {}
    return [
      { id: '1', name: '主设备' },
      { id: '2', name: '附属设备' },
      { id: '3', name: '特种设备' },
      { id: '4', name: '非特种设备' },
    ];
  }, []);

  const typeIdToNameMap = useMemo(() => {
    const m: Record<string, string> = {};
    equipmentTypes.forEach(t => { m[t.id] = t.name; });
    return m;
  }, [equipmentTypes]);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const arr = JSON.parse(raw) as BrandRecord[];
          setData(arr);
          setFiltered(arr);
        } else {
          setData(DEFAULT_BRANDS);
          setFiltered(DEFAULT_BRANDS);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_BRANDS));
        }
      } catch {
        setData(DEFAULT_BRANDS);
        setFiltered(DEFAULT_BRANDS);
      }
      setLoading(false);
    }, 200);
  }, []);

  const columns: ColumnsType<BrandRecord> = [
    { title: '品牌编码', dataIndex: 'brandCode', key: 'brandCode', width: 140 },
    { title: '品牌名称', dataIndex: 'brandName', key: 'brandName', width: 160 },
    { title: '制造商/厂商', dataIndex: 'manufacturer', key: 'manufacturer', width: 180 },
    { title: '设备类型', dataIndex: 'deviceType', key: 'deviceType', width: 160 },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 120,
      render: (v: BrandRecord['status']) => v === 'enabled' ? <Tag color="green">启用</Tag> : <Tag color="gray">停用</Tag>
    },
    {
      title: '关联供应商', dataIndex: 'suppliers', key: 'suppliers',
      render: (arr: string[]) => arr?.length ? arr.map(s => <Tag key={s}>{s}</Tag>) : '-'
    },
    { title: '备注', dataIndex: 'description', key: 'description' },
    {
      title: '操作', key: 'action', width: 160,
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} type="link" onClick={() => onEdit(record)}>编辑</Button>
          <Button icon={<DeleteOutlined />} type="link" danger onClick={() => onDelete(record)}>删除</Button>
        </Space>
      )
    }
  ];

  const onSearch = () => {
    const { brandName, status } = searchForm.getFieldsValue();
    let arr = [...data];
    if (brandName) {
      arr = arr.filter(d => d.brandName.includes(brandName) || d.brandCode.includes(brandName));
    }
    if (status && status !== 'all') {
      arr = arr.filter(d => d.status === status);
    }
    setFiltered(arr);
  };

  const onReset = () => {
    searchForm.resetFields();
    setFiltered(data);
  };

  const onAdd = () => {
    setEditing(null);
    editForm.resetFields();
    setModalOpen(true);
  };

  const onEdit = (r: BrandRecord) => {
    setEditing(r);
    editForm.setFieldsValue({
      ...r,
      statusSwitch: r.status === 'enabled'
    });
    setModalOpen(true);
  };

  const onDelete = (r: BrandRecord) => {
    const arr = data.filter(d => d.id !== r.id);
    setData(arr);
    setFiltered(arr);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    message.success('删除成功');
  };

  const supplierOptions = useMemo(() => {
    try {
      const raw = localStorage.getItem('basic_supplier_dict');
      if (!raw) return [];
      const arr = JSON.parse(raw) as { supplierName: string }[];
      return arr.map(s => ({ label: s.supplierName, value: s.supplierName }));
    } catch {
      return [];
    }
  }, []);

  const onSubmit = async () => {
    const values = await editForm.validateFields();
    const payload: BrandRecord = {
      id: editing?.id ?? String(Date.now()),
      brandCode: values.brandCode,
      brandName: values.brandName,
      manufacturer: values.manufacturer,
      deviceType: values.deviceType,
      suppliers: values.suppliers ?? [],
      description: values.description,
      status: values.statusSwitch ? 'enabled' : 'disabled',
      updateUser: '管理员',
      updateDate: new Date().toISOString(),
      createUser: editing?.createUser ?? '管理员',
      createDate: editing?.createDate ?? new Date().toISOString(),
    };
    const existsCode = data.find(d => d.brandCode === payload.brandCode && d.id !== editing?.id);
    if (existsCode) {
      message.error('品牌编码已存在，请更换');
      return;
    }
    let arr = [...data];
    if (editing) {
      arr = arr.map(d => d.id === editing.id ? payload : d);
      message.success('编辑成功');
    } else {
      arr = [payload, ...arr];
      message.success('新增成功');
    }
    setData(arr);
    setFiltered(arr);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    setModalOpen(false);
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
              {
                title: '设备类型目录', key: 'root', children: equipmentTypes.map(t => ({
                  title: t.name,
                  key: t.id,
                }))
              }
            ]}
          />
        </Card>
      </Col>
      <Col span={18}>
        <Card title="品牌管理" extra={
          <Space>
            <Button icon={<PlusOutlined />} type="primary" onClick={onAdd}>新增品牌</Button>
          </Space>
        }>
      <Form form={searchForm} layout="inline" onFinish={onSearch} style={{ marginBottom: 16 }}>
        <Form.Item name="brandName" label="品牌/编码">
          <Input placeholder="输入品牌名称或编码" allowClear />
        </Form.Item>
        <Form.Item name="status" label="状态" initialValue="all">
          <Select style={{ width: 160 }}
            options={[
              { label: '全部', value: 'all' },
              { label: '启用', value: 'enabled' },
              { label: '停用', value: 'disabled' },
            ]}
          />
        </Form.Item>
        <Space>
          <Button htmlType="submit" icon={<SearchOutlined />}>查询</Button>
          <Button icon={<ReloadOutlined />} onClick={onReset}>重置</Button>
        </Space>
      </Form>

      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={
          selectedTypeId ? filtered.filter(b => (b.deviceType || '') === typeIdToNameMap[selectedTypeId!]) : filtered
        }
        pagination={{ pageSize: 8 }}
      />

      <Modal
        title={editing ? '编辑品牌' : '新增品牌'}
        open={modalOpen}
        onOk={onSubmit}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
      >
        <Form form={editForm} labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
          <Form.Item name="brandCode" label="品牌编码" rules={[{ required: true, message: '请输入品牌编码' }]}>
            <Input placeholder="唯一编码" />
          </Form.Item>
          <Form.Item name="brandName" label="品牌名称" rules={[{ required: true, message: '请输入品牌名称' }]}>
            <Input placeholder="品牌中文/英文" />
          </Form.Item>
          <Form.Item name="manufacturer" label="制造商/厂商">
            <Input placeholder="公司名称" />
          </Form.Item>
          <Form.Item name="deviceType" label="设备类型">
            <Input placeholder="如：电气测试设备" />
          </Form.Item>
          <Form.Item name="suppliers" label="关联供应商">
            <Select mode="tags" placeholder="选择或输入供应商" options={supplierOptions} />
          </Form.Item>
          <Form.Item name="statusSwitch" label="启用状态" valuePropName="checked" initialValue>
            <Switch />
          </Form.Item>
          <Form.Item name="description" label="备注">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
        </Card>
      </Col>
    </Row>
  );
};

export default BrandManagement;