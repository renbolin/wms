import React, { useEffect, useMemo, useState } from 'react';
import { Card, Row, Col, Form, Input, Select, Space, Button, Table, Modal, InputNumber, Tag, message, Tree } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';

type EquipmentTypeNode = { id: string; name: string; children?: EquipmentTypeNode[] };

type EquipmentModelRecord = {
  id: string;
  modelCode: string;
  modelName: string;
  typeId?: string; // 关联设备类型
  usingYears: number; // 使用年限（必填）
  maintenanceCycleMonths: number; // 检修周期（月）（必填）
  warrantyYears: number; // 保修年限（必填）
  description?: string;
};

const TYPES_KEY = 'equipment_types';
const MODELS_KEY = 'equipment_models';

const flattenTypes = (nodes: EquipmentTypeNode[]): EquipmentTypeNode[] => {
  const res: EquipmentTypeNode[] = [];
  const walk = (arr: EquipmentTypeNode[]) => {
    arr.forEach(n => {
      res.push({ id: n.id, name: n.name });
      if (n.children && n.children.length) walk(n.children);
    });
  };
  walk(nodes);
  return res;
};

const fabricateModels = (types: EquipmentTypeNode[]): EquipmentModelRecord[] => {
  const flat = flattenTypes(types).filter(t => !t.children); // 仅叶子类型
  const sampleNames = ['标准型', '加强型', '经济型'];
  const models: EquipmentModelRecord[] = [];
  for (let i = 0; i < Math.max(3, flat.length); i++) {
    const type = flat[i % Math.max(1, flat.length)];
    models.push({
      id: `mdl-${Date.now()}-${i}`,
      modelCode: `MDL-${100 + i}`,
      modelName: `${type ? type.name : '通用设备'}-${sampleNames[i % sampleNames.length]}`,
      typeId: type?.id,
      usingYears: 8 - (i % 3),
      maintenanceCycleMonths: 12 - (i % 4) * 3,
      warrantyYears: 2 + (i % 2),
      description: i % 2 === 0 ? '适用于常规工况' : '适用于高强度工况',
    });
  }
  return models;
};

const EquipmentModelPage: React.FC = () => {
  const [types, setTypes] = useState<EquipmentTypeNode[]>([]);
  const [models, setModels] = useState<EquipmentModelRecord[]>([]);
  const [filtered, setFiltered] = useState<EquipmentModelRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);

  const [searchForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editing, setEditing] = useState<EquipmentModelRecord | null>(null);

  useEffect(() => {
    const typeStr = localStorage.getItem(TYPES_KEY);
    const typesData: EquipmentTypeNode[] = typeStr ? JSON.parse(typeStr) : [];
    setTypes(typesData);

    const modelStr = localStorage.getItem(MODELS_KEY);
    if (modelStr) {
      const list = JSON.parse(modelStr) as EquipmentModelRecord[];
      setModels(list);
      setFiltered(list);
    } else {
      const fabricated = fabricateModels(typesData.length ? typesData : [{ id: 'type-general', name: '通用设备' }]);
      setModels(fabricated);
      setFiltered(fabricated);
      localStorage.setItem(MODELS_KEY, JSON.stringify(fabricated));
    }
    setLoading(false);
  }, []);

  const typeOptions = useMemo(() => {
    const flat = flattenTypes(types);
    return flat.map(t => ({ value: t.id, label: t.name }));
  }, [types]);

  const treeData = useMemo(() => {
    const nodes = types.length ? types : [
      { id: '1', name: '主设备' },
      { id: '2', name: '附属设备' },
      { id: '3', name: '特种设备' },
      { id: '4', name: '非特种设备' },
    ];
    return [
      {
        title: '设备类型目录', key: 'root', children: nodes.map(n => ({ title: n.name, key: n.id }))
      }
    ];
  }, [types]);

  const columns = [
    { title: '型号编码', dataIndex: 'modelCode', key: 'modelCode', width: 140 },
    { title: '型号名称', dataIndex: 'modelName', key: 'modelName', width: 200 },
    { title: '设备类型', dataIndex: 'typeId', key: 'typeId', width: 160, render: (v: string) => typeOptions.find(o => o.value === v)?.label || '-' },
    { title: '使用年限', dataIndex: 'usingYears', key: 'usingYears', width: 120, render: (v: number) => <Tag color={v >= 8 ? 'green' : v >= 5 ? 'geekblue' : 'orange'}>{v} 年</Tag> },
    { title: '检修周期', dataIndex: 'maintenanceCycleMonths', key: 'maintenanceCycleMonths', width: 140, render: (v: number) => <Tag color={v <= 6 ? 'volcano' : 'blue'}>{v} 月</Tag> },
    { title: '保修年限', dataIndex: 'warrantyYears', key: 'warrantyYears', width: 120, render: (v: number) => `${v} 年` },
    { title: '说明', dataIndex: 'description', key: 'description' },
    {
      title: '操作', key: 'actions', width: 220, fixed: 'right' as const,
      render: (_: any, record: EquipmentModelRecord) => (
        <Space>
          <Button size="small" type="primary" icon={<EditOutlined />} onClick={() => openEdit(record)}>编辑</Button>
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => removeRecord(record)}>删除</Button>
        </Space>
      )
    }
  ];

  const handleSearch = () => {
    const vals = searchForm.getFieldsValue();
    let list = [...models];
    if (vals.keyword) list = list.filter(m => (m.modelCode + m.modelName).includes(vals.keyword));
    if (vals.typeId) list = list.filter(m => m.typeId === vals.typeId);
    setFiltered(list);
  };

  const handleReset = () => {
    searchForm.resetFields();
    setFiltered(models);
  };

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
    editForm.resetFields();
  };

  const openEdit = (record: EquipmentModelRecord) => {
    setEditing(record);
    setModalOpen(true);
    editForm.setFieldsValue({
      modelCode: record.modelCode,
      modelName: record.modelName,
      typeId: record.typeId,
      usingYears: record.usingYears,
      maintenanceCycleMonths: record.maintenanceCycleMonths,
      warrantyYears: record.warrantyYears,
      description: record.description,
    });
  };

  const persist = (list: EquipmentModelRecord[]) => {
    localStorage.setItem(MODELS_KEY, JSON.stringify(list));
  };

  const saveEdit = async () => {
    const vals = await editForm.validateFields();
    const list = [...models];
    if (editing) {
      const idx = list.findIndex(m => m.id === editing.id);
      list[idx] = { ...list[idx], ...vals };
      setModels(list);
      setFiltered(list);
      persist(list);
      setModalOpen(false);
      message.success('型号已更新');
    } else {
      const newItem: EquipmentModelRecord = {
        id: `mdl-${Date.now()}`,
        modelCode: vals.modelCode,
        modelName: vals.modelName,
        typeId: vals.typeId,
        usingYears: vals.usingYears,
        maintenanceCycleMonths: vals.maintenanceCycleMonths,
        warrantyYears: vals.warrantyYears,
        description: vals.description,
      };
      const newList = [newItem, ...list];
      setModels(newList);
      setFiltered(newList);
      persist(newList);
      setModalOpen(false);
      message.success('型号已创建');
    }
  };

  const removeRecord = (record: EquipmentModelRecord) => {
    Modal.confirm({
      title: '删除确认',
      content: `确定要删除型号 ${record.modelName} 吗？`,
      okText: '删除',
      okButtonProps: { danger: true },
      onOk: () => {
        const list = models.filter(m => m.id !== record.id);
        setModels(list);
        setFiltered(list);
        persist(list);
        message.success('已删除');
      }
    });
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
            treeData={treeData as any}
          />
        </Card>
      </Col>
      <Col span={18}>
      <div style={{ background: 'transparent' }}>
      <Card title="设备型号管理" style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Form form={searchForm} layout="inline" onFinish={handleSearch}>
              <Form.Item name="keyword" label="关键字">
                <Input placeholder="按型号编码/名称搜索" style={{ width: 220 }} />
              </Form.Item>
              <Form.Item name="typeId" label="设备类型">
                <Select options={typeOptions} allowClear placeholder="选择类型" style={{ width: 220 }} />
              </Form.Item>
              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>查询</Button>
                  <Button onClick={handleReset} icon={<ReloadOutlined />}>重置</Button>
                </Space>
              </Form.Item>
            </Form>
          </Col>
          <Col>
            <Space>
              <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>新增型号</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Card>
        <Table
          dataSource={selectedTypeId ? filtered.filter(m => m.typeId === selectedTypeId) : filtered}
          columns={columns}
          loading={loading}
          rowKey="id"
          scroll={{ x: 1000 }}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editing ? '编辑型号' : '新增型号'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={saveEdit}
        okText={editing ? '保存' : '创建'}
        destroyOnClose
      >
        <Form form={editForm} layout="vertical">
          <Form.Item label="型号编码" name="modelCode" rules={[{ required: true, message: '请输入型号编码' }] }>
            <Input placeholder="如 MDL-100" />
          </Form.Item>
          <Form.Item label="型号名称" name="modelName" rules={[{ required: true, message: '请输入型号名称' }] }>
            <Input placeholder="如 泵-标准型" />
          </Form.Item>
          <Form.Item label="设备类型" name="typeId">
            <Select options={typeOptions} placeholder="请选择关联设备类型" allowClear />
          </Form.Item>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="使用年限（年）" name="usingYears" rules={[{ required: true, message: '请输入使用年限' }]}>
                <InputNumber min={1} max={30} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="检修周期（月）" name="maintenanceCycleMonths" rules={[{ required: true, message: '请输入检修周期' }]}>
                <InputNumber min={1} max={60} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="保修年限（年）" name="warrantyYears" rules={[{ required: true, message: '请输入保修年限' }]}>
                <InputNumber min={1} max={10} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="说明" name="description">
            <Input.TextArea rows={3} placeholder="可添加适用工况、备注等" />
          </Form.Item>
        </Form>
      </Modal>
      </div>
      </Col>
    </Row>
  );
};

export default EquipmentModelPage;