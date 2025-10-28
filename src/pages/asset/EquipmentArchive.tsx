import React, { useEffect, useMemo, useState } from 'react';
import { 
  Layout,
  Tree,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Drawer,
  Tag,
  Space,
  message,
  Checkbox,
  Tabs,
  Alert,
  Card,
} from 'antd';
import type { DataNode } from 'antd/es/tree';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Sider, Content } = Layout;

// 本页遵循“设备资产档案”与“设备技术档案”同步建档逻辑：一次录入，双端写入
// localStorage 键约定
const ASSET_KEY = 'equipment_type_assets'; // Record<typeId, AssetRecord[]>
const TECH_KEY = 'equipment_tech_archives'; // Record<typeId, TechRecord[]>
const TYPES_KEY = 'equipment_types'; // 设备类型树

// 设备类型节点
type DeviceTypeNode = {
  id: string;
  name: string;
  children?: DeviceTypeNode[];
};

// 资产档案（资产侧）
type AssetRecord = {
  id: string;
  typeId: string;
  code: string;
  name: string;
  location?: string;
  status?: '在用' | '闲置' | '维修' | '报废';
  purchaseDate?: string; // ISO string
  supplier?: string;
  cost?: number;
};

// 技术档案（技术侧）
type TechRecord = {
  id: string;
  typeId: string;
  model?: string; // 型号
  spec?: string; // 规格
  power?: string; // 功率/容量等
  parameters?: Record<string, string>; // 其他技术参数
  docs: {
    manual: boolean; // 说明书
    installDiagram: boolean; // 安装图
    maintenanceManual: boolean; // 维护手册
    certificate: '有效' | '过期'; // 合格证
    inspection: '合格' | '不合格'; // 检验报告
  };
  techNotes?: string;
};

type CombinedRow = {
  id: string;
  typeId: string;
  asset: AssetRecord;
  tech: TechRecord;
};

// 构造一个可用的设备类型树（若本地无数据则使用该默认）
const defaultDeviceTypeTree: DeviceTypeNode[] = [
  {
    id: 'type-power',
    name: '动力设备',
    children: [
      { id: 'type-pump', name: '泵' },
      { id: 'type-motor', name: '电机' },
    ],
  },
  {
    id: 'type-instrument',
    name: '仪器仪表',
    children: [
      { id: 'type-gauge', name: '压力表' },
      { id: 'type-thermo', name: '温度计' },
    ],
  },
  {
    id: 'type-general',
    name: '通用设备',
    children: [
      { id: 'type-forklift', name: '叉车' },
      { id: 'type-air', name: '空压机' },
    ],
  },
];

// 将设备类型树转为 antd TreeData 结构
const toTreeData = (nodes: DeviceTypeNode[]): DataNode[] =>
  nodes.map((n): DataNode => ({
    key: n.id,
    title: n.name,
    children: n.children ? toTreeData(n.children) : undefined,
  }));

// 生成编造数据：每个叶子类型三条示例记录（资产+技术同步）
const fabricateData = (types: DeviceTypeNode[]) => {
  const leaves: DeviceTypeNode[] = [];
  const walk = (arr: DeviceTypeNode[]) => {
    arr.forEach((x) => {
      if (x.children && x.children.length) walk(x.children);
      else leaves.push(x);
    });
  };
  walk(types);

  const assetsByType: Record<string, AssetRecord[]> = {};
  const techByType: Record<string, TechRecord[]> = {};

  leaves.forEach((leaf, i) => {
    const baseName = leaf.name;
    const baseCode = leaf.id.split('-').pop() || 'dev';
    const assetList: AssetRecord[] = [];
    const techList: TechRecord[] = [];

    for (let k = 1; k <= 3; k++) {
      const id = `${leaf.id}-${Date.now()}-${k}`;
      assetList.push({
        id,
        typeId: leaf.id,
        code: `${baseCode.toUpperCase()}-${100 + i * 3 + k}`,
        name: `${baseName}${k}号`,
        location: ['A区', 'B区', 'C区'][k % 3],
        status: ['在用', '维修', '闲置'][k % 3] as AssetRecord['status'],
        purchaseDate: dayjs().subtract(300 + k, 'day').toISOString(),
        supplier: ['供应商甲', '供应商乙', '供应商丙'][k % 3],
        cost: 5000 + k * 1200,
      });

      techList.push({
        id,
        typeId: leaf.id,
        model: `M-${k}${i}`,
        spec: `${k * 10}L/min`,
        power: `${k * 2}kW`,
        parameters: { 压力: `${k * 0.5}MPa`, 重量: `${k * 30}kg` },
        docs: {
          manual: k % 2 === 0,
          installDiagram: true,
          maintenanceManual: k % 3 !== 0,
          certificate: k % 2 === 0 ? '有效' : '过期',
          inspection: k % 2 === 1 ? '合格' : '不合格',
        },
        techNotes: k % 2 === 0 ? '例行保养完成' : '待更换密封件',
      });
    }

    assetsByType[leaf.id] = assetList;
    techByType[leaf.id] = techList;
  });

  return { assetsByType, techByType };
};

const EquipmentArchive: React.FC = () => {
  const [deviceTypes, setDeviceTypes] = useState<DeviceTypeNode[]>([]);
  const [selectedTypeIds, setSelectedTypeIds] = useState<string[]>([]);

  const [assetsByType, setAssetsByType] = useState<Record<string, AssetRecord[]>>({});
  const [techByType, setTechByType] = useState<Record<string, TechRecord[]>>({});

  const [rows, setRows] = useState<CombinedRow[]>([]);

  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [detailRow, setDetailRow] = useState<CombinedRow | null>(null);

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingRow, setEditingRow] = useState<CombinedRow | null>(null);
  const [form] = Form.useForm();

  // 初始化：加载设备类型树与两套档案，无则编造并写入
  useEffect(() => {
    const typeStr = localStorage.getItem(TYPES_KEY);
    const types: DeviceTypeNode[] = typeStr ? JSON.parse(typeStr) : defaultDeviceTypeTree;
    setDeviceTypes(types);
    if (!typeStr) localStorage.setItem(TYPES_KEY, JSON.stringify(types));

    const assetStr = localStorage.getItem(ASSET_KEY);
    const techStr = localStorage.getItem(TECH_KEY);

    if (assetStr && techStr) {
      setAssetsByType(JSON.parse(assetStr));
      setTechByType(JSON.parse(techStr));
    } else {
      const { assetsByType, techByType } = fabricateData(types);
      setAssetsByType(assetsByType);
      setTechByType(techByType);
      localStorage.setItem(ASSET_KEY, JSON.stringify(assetsByType));
      localStorage.setItem(TECH_KEY, JSON.stringify(techByType));
    }
  }, []);

  // 组合视图数据
  useEffect(() => {
    const allTypeIds = Object.keys(assetsByType);
    const res: CombinedRow[] = [];
    allTypeIds.forEach((tid) => {
      const aset = assetsByType[tid] || [];
      const tset = techByType[tid] || [];
      const techMap = new Map<string, TechRecord>(tset.map((t) => [t.id, t]));
      aset.forEach((a) => {
        const t = techMap.get(a.id);
        if (t) res.push({ id: a.id, typeId: tid, asset: a, tech: t });
      });
    });
    setRows(res);
  }, [assetsByType, techByType]);

  const filteredRows = useMemo(() => {
    if (!selectedTypeIds.length) return rows;
    const setIds = new Set(selectedTypeIds);
    return rows.filter((r) => setIds.has(r.typeId));
  }, [rows, selectedTypeIds]);

  // 树选择
  const onTreeSelect = (keys: React.Key[]) => {
    setSelectedTypeIds(keys.map(String));
  };

  // 表格列
  const columns = [
    { title: '资产编码', dataIndex: ['asset', 'code'], key: 'code' },
    { title: '设备名称', dataIndex: ['asset', 'name'], key: 'name' },
    { title: '使用位置', dataIndex: ['asset', 'location'], key: 'location' },
    {
      title: '状态',
      dataIndex: ['asset', 'status'],
      key: 'status',
      render: (s: AssetRecord['status']) => {
        const color = s === '在用' ? 'green' : s === '维修' ? 'orange' : s === '闲置' ? 'geekblue' : 'red';
        return <Tag color={color}>{s}</Tag>;
      },
    },
    { title: '采购日期', dataIndex: ['asset', 'purchaseDate'], key: 'pd', render: (v: string) => (v ? dayjs(v).format('YYYY-MM-DD') : '-') },
    {
      title: '同步状态',
      key: 'sync',
      render: (_: any, row: CombinedRow) => <Tag color="green">已同步</Tag>,
    },
    {
      title: '技术资料',
      key: 'docs',
      render: (_: any, row: CombinedRow) => {
        const d = row.tech.docs;
        const complete = d.manual && d.installDiagram && d.maintenanceManual && d.certificate === '有效' && d.inspection === '合格';
        return <Tag color={complete ? 'green' : 'volcano'}>{complete ? '齐全' : '缺失'}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, row: CombinedRow) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => openDetail(row)}>查看</Button>
          <Button size="small" type="primary" icon={<EditOutlined />} onClick={() => openEdit(row)}>编辑</Button>
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => removeRow(row)}>删除</Button>
        </Space>
      ),
    },
  ];

  // 详情抽屉
  const openDetail = (row: CombinedRow) => {
    setDetailRow(row);
    setDrawerOpen(true);
  };

  // 新增/编辑
  const openEdit = (row?: CombinedRow) => {
    setEditingRow(row || null);
    setModalOpen(true);
    if (row) {
      form.setFieldsValue({
        // 资产
        code: row.asset.code,
        name: row.asset.name,
        location: row.asset.location,
        status: row.asset.status,
        purchaseDate: row.asset.purchaseDate ? dayjs(row.asset.purchaseDate) : undefined,
        supplier: row.asset.supplier,
        cost: row.asset.cost,
        // 技术
        model: row.tech.model,
        spec: row.tech.spec,
        power: row.tech.power,
        techNotes: row.tech.techNotes,
        manual: row.tech.docs.manual,
        installDiagram: row.tech.docs.installDiagram,
        maintenanceManual: row.tech.docs.maintenanceManual,
        certificate: row.tech.docs.certificate,
        inspection: row.tech.docs.inspection,
      });
    } else {
      form.resetFields();
    }
  };

  const ensurePersist = (ab: Record<string, AssetRecord[]>, tb: Record<string, TechRecord[]>) => {
    localStorage.setItem(ASSET_KEY, JSON.stringify(ab));
    localStorage.setItem(TECH_KEY, JSON.stringify(tb));
    window.dispatchEvent(new CustomEvent('equipmentAssetsUpdated'));
    window.dispatchEvent(new CustomEvent('equipmentTechUpdated'));
  };

  const saveEdit = async () => {
    const vals = await form.validateFields();
    const typeId = editingRow?.typeId || selectedTypeIds[0];
    if (!typeId) {
      message.warning('请先在左侧选择一个设备类型，再进行新增');
      return;
    }

    const id = editingRow?.id || `${typeId}-${Date.now()}`;
    const newAsset: AssetRecord = {
      id,
      typeId,
      code: vals.code,
      name: vals.name,
      location: vals.location,
      status: vals.status,
      purchaseDate: vals.purchaseDate ? vals.purchaseDate.toISOString() : undefined,
      supplier: vals.supplier,
      cost: vals.cost ? Number(vals.cost) : undefined,
    };
    const newTech: TechRecord = {
      id,
      typeId,
      model: vals.model,
      spec: vals.spec,
      power: vals.power,
      parameters: undefined,
      docs: {
        manual: !!vals.manual,
        installDiagram: !!vals.installDiagram,
        maintenanceManual: !!vals.maintenanceManual,
        certificate: vals.certificate,
        inspection: vals.inspection,
      },
      techNotes: vals.techNotes,
    };

    const ab = { ...assetsByType };
    const tb = { ...techByType };
    const aset = (ab[typeId] || []).filter((x) => x.id !== id);
    const tset = (tb[typeId] || []).filter((x) => x.id !== id);
    aset.push(newAsset);
    tset.push(newTech);
    ab[typeId] = aset;
    tb[typeId] = tset;

    setAssetsByType(ab);
    setTechByType(tb);
    ensurePersist(ab, tb);
    setModalOpen(false);
    setEditingRow(null);
    form.resetFields();
    message.success(editingRow ? '已更新并同步到两套档案' : '已新增并同步到两套档案');
  };

  const removeRow = (row: CombinedRow) => {
    Modal.confirm({
      title: '删除确认',
      content: '将从资产档案与技术档案同时删除，是否继续？',
      okText: '删除',
      okButtonProps: { danger: true },
      onOk: () => {
        const ab = { ...assetsByType };
        const tb = { ...techByType };
        ab[row.typeId] = (ab[row.typeId] || []).filter((x) => x.id !== row.id);
        tb[row.typeId] = (tb[row.typeId] || []).filter((x) => x.id !== row.id);
        setAssetsByType(ab);
        setTechByType(tb);
        ensurePersist(ab, tb);
        message.success('已从两套档案同步删除');
      },
    });
  };

  // 资产视图列
  const assetColumns = [
    { title: '资产编码', dataIndex: 'code', key: 'code' },
    { title: '设备名称', dataIndex: 'name', key: 'name' },
    { title: '使用位置', dataIndex: 'location', key: 'location' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (s: AssetRecord['status']) => <Tag>{s}</Tag> },
    { title: '采购日期', dataIndex: 'purchaseDate', key: 'pd', render: (v: string) => (v ? dayjs(v).format('YYYY-MM-DD') : '-') },
    { title: '供应商', dataIndex: 'supplier', key: 'supplier' },
    { title: '成本', dataIndex: 'cost', key: 'cost' },
  ];

  // 技术视图列
  const techColumns = [
    { title: '型号', dataIndex: 'model', key: 'model' },
    { title: '规格', dataIndex: 'spec', key: 'spec' },
    { title: '功率/容量', dataIndex: 'power', key: 'power' },
    { title: '检验报告', dataIndex: ['docs', 'inspection'], key: 'inspection', render: (v: TechRecord['docs']['inspection']) => <Tag color={v === '合格' ? 'green' : 'volcano'}>{v}</Tag> },
    { title: '合格证', dataIndex: ['docs', 'certificate'], key: 'certificate', render: (v: TechRecord['docs']['certificate']) => <Tag color={v === '有效' ? 'green' : 'volcano'}>{v}</Tag> },
    { title: '说明书', dataIndex: ['docs', 'manual'], key: 'manual', render: (v: boolean) => (v ? '有' : '无') },
    { title: '安装图', dataIndex: ['docs', 'installDiagram'], key: 'installDiagram', render: (v: boolean) => (v ? '有' : '无') },
    { title: '维护手册', dataIndex: ['docs', 'maintenanceManual'], key: 'maintenanceManual', render: (v: boolean) => (v ? '有' : '无') },
    { title: '备注', dataIndex: 'techNotes', key: 'techNotes' },
  ];

  const assetRowsByFilter = useMemo(() => {
    const tids = selectedTypeIds.length ? selectedTypeIds : Object.keys(assetsByType);
    const res: AssetRecord[] = [];
    tids.forEach(tid => res.push(...(assetsByType[tid] || [])));
    return res;
  }, [selectedTypeIds, assetsByType]);

  const techRowsByFilter = useMemo(() => {
    const tids = selectedTypeIds.length ? selectedTypeIds : Object.keys(techByType);
    const res: TechRecord[] = [];
    tids.forEach(tid => res.push(...(techByType[tid] || [])));
    return res;
  }, [selectedTypeIds, techByType]);

  return (
    <Layout style={{ height: '100%', background: '#fff' }}>
      <Sider width={280} style={{ background: '#fff', borderRight: '1px solid #f0f0f0', padding: 12 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>设备类型目录</div>
        <Tree treeData={toTreeData(deviceTypes)} onSelect={onTreeSelect} multiple defaultExpandAll />
        <div style={{ marginTop: 12 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openEdit()} disabled={!selectedTypeIds.length}>新增档案（一次录入、双端建档）</Button>
        </div>
      </Sider>

      <Content style={{ padding: 16 }}>
        <Card style={{ marginBottom: 12 }}>
          <Alert
            type="info"
            showIcon
            message="一次录入、双端建档逻辑已启用"
            description="在此页面新增/编辑/删除档案，会同时更新‘设备资产档案’与‘设备技术档案’，两侧记录以相同ID同步。"
          />
        </Card>

        <Tabs
          defaultActiveKey="combined"
          items={[
            {
              key: 'combined',
              label: '综合视图（资产+技术）',
              children: (
                <Table
                  rowKey={(r) => r.id}
                  dataSource={filteredRows}
                  columns={columns}
                  pagination={{ pageSize: 8 }}
                />
              ),
            },
            {
              key: 'asset',
              label: '资产档案视图',
              children: (
                <Table
                  rowKey={(r) => r.id}
                  dataSource={assetRowsByFilter}
                  columns={assetColumns}
                  pagination={{ pageSize: 8 }}
                />
              ),
            },
            {
              key: 'tech',
              label: '技术档案视图',
              children: (
                <Table
                  rowKey={(r) => r.id}
                  dataSource={techRowsByFilter}
                  columns={techColumns}
                  pagination={{ pageSize: 8 }}
                />
              ),
            },
          ]}
        />

        <Drawer
          title="档案详情（资产+技术）"
          open={drawerOpen}
          width={640}
          onClose={() => setDrawerOpen(false)}
        >
          {detailRow ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 12 }}>资产档案</div>
                <div>资产编码：{detailRow.asset.code}</div>
                <div>设备名称：{detailRow.asset.name}</div>
                <div>位置：{detailRow.asset.location || '-'}</div>
                <div>状态：{detailRow.asset.status || '-'}</div>
                <div>采购日期：{detailRow.asset.purchaseDate ? dayjs(detailRow.asset.purchaseDate).format('YYYY-MM-DD') : '-'}</div>
                <div>供应商：{detailRow.asset.supplier || '-'}</div>
                <div>采购成本：{detailRow.asset.cost ?? '-'}</div>
              </div>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 12 }}>技术档案</div>
                <div>型号：{detailRow.tech.model || '-'}</div>
                <div>规格：{detailRow.tech.spec || '-'}</div>
                <div>功率/容量：{detailRow.tech.power || '-'}</div>
                <div>检验报告：<Tag color={detailRow.tech.docs.inspection === '合格' ? 'green' : 'volcano'}>{detailRow.tech.docs.inspection}</Tag></div>
                <div>合格证：<Tag color={detailRow.tech.docs.certificate === '有效' ? 'green' : 'volcano'}>{detailRow.tech.docs.certificate}</Tag></div>
                <div>说明书：{detailRow.tech.docs.manual ? '有' : '无'}</div>
                <div>安装图：{detailRow.tech.docs.installDiagram ? '有' : '无'}</div>
                <div>维护手册：{detailRow.tech.docs.maintenanceManual ? '有' : '无'}</div>
                <div>备注：{detailRow.tech.techNotes || '-'}</div>
              </div>
            </div>
          ) : null}
        </Drawer>

        <Modal
          title={editingRow ? '编辑档案（同步技术与资产）' : '新增档案（同步技术与资产）'}
          open={modalOpen}
          onCancel={() => setModalOpen(false)}
          onOk={saveEdit}
          okText={editingRow ? '保存' : '创建'}
          width={720}
        >
          <Form form={form} layout="vertical">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>资产信息</div>
                <Form.Item label="资产编码" name="code" rules={[{ required: true, message: '请输入资产编码' }]}>
                  <Input placeholder="如 PUMP-101" />
                </Form.Item>
                <Form.Item label="设备名称" name="name" rules={[{ required: true, message: '请输入设备名称' }]}>
                  <Input placeholder="如 循环水泵1号" />
                </Form.Item>
                <Form.Item label="使用位置" name="location">
                  <Input placeholder="如 A区-1#泵房" />
                </Form.Item>
                <Form.Item label="状态" name="status" rules={[{ required: true }] }>
                  <Select options={[{ value: '在用', label: '在用' }, { value: '维修', label: '维修' }, { value: '闲置', label: '闲置' }, { value: '报废', label: '报废' }]} />
                </Form.Item>
                <Form.Item label="采购日期" name="purchaseDate">
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item label="供应商" name="supplier">
                  <Input />
                </Form.Item>
                <Form.Item label="采购成本" name="cost">
                  <Input type="number" min={0} />
                </Form.Item>
              </div>

              <div>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>技术信息</div>
                <Form.Item label="型号" name="model">
                  <Input placeholder="如 M-101" />
                </Form.Item>
                <Form.Item label="规格" name="spec">
                  <Input placeholder="如 20L/min" />
                </Form.Item>
                <Form.Item label="功率/容量" name="power">
                  <Input placeholder="如 2kW" />
                </Form.Item>
                <Form.Item label="检验报告" name="inspection" rules={[{ required: true }]}>
                  <Select options={[{ value: '合格', label: '合格' }, { value: '不合格', label: '不合格' }]} />
                </Form.Item>
                <Form.Item label="合格证" name="certificate" rules={[{ required: true }]}>
                  <Select options={[{ value: '有效', label: '有效' }, { value: '过期', label: '过期' }]} />
                </Form.Item>
                <Form.Item name="manual" valuePropName="checked">
                  <Checkbox>说明书</Checkbox>
                </Form.Item>
                <Form.Item name="installDiagram" valuePropName="checked">
                  <Checkbox>安装图</Checkbox>
                </Form.Item>
                <Form.Item name="maintenanceManual" valuePropName="checked">
                  <Checkbox>维护手册</Checkbox>
                </Form.Item>
                <Form.Item label="备注" name="techNotes">
                  <Input.TextArea rows={3} />
                </Form.Item>
              </div>
            </div>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
};

export default EquipmentArchive;