import React, { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Tag,
  Descriptions,
  Row,
  Col,
  Tree,
  Layout,
  message,
  InputNumber,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Option } = Select;
const { Sider, Content } = Layout;

interface DeviceTypeNode {
  key: string;
  title: string;
  parentKey?: string;
  level: number;
  deviceType: 'main' | 'auxiliary' | 'spare' | 'special' | 'general';
  description: string;
  children?: DeviceTypeNode[];
}

interface AssetRecord {
  id: string;
  assetCode: string;
  assetName: string;
  deviceTypeKey: string;
  deviceTypeName: string;
  deviceType: 'main' | 'auxiliary' | 'spare' | 'special' | 'general';
  batchNo?: string;
  specification?: string;
  model?: string;
  brand?: string;
  manufacturer?: string;
  supplier?: string;
  purchaseDate?: string;
  storageDate?: string;
  usageYears?: number;
  location?: string;
  maintenanceCycle?: string;
  warrantyPeriod?: number;
  warrantyYears?: number;
  warrantyExpiry?: string;
  serialNumber?: string;
  qrCode?: string;
  description?: string;
  attachments?: string[];
  createUser?: string;
  createDate?: string;
  updateUser?: string;
  updateDate?: string;
}

const initialDeviceTypeTree: DeviceTypeNode[] = [
  {
    key: 'main',
    title: '主设备',
    level: 1,
    deviceType: 'main',
    description: '主要生产设备',
    children: [
      {
        key: 'heat-exchange',
        title: '换热设备',
        parentKey: 'main',
        level: 2,
        deviceType: 'main',
        description: '换热设备',
        children: [
          {
            key: 'plate-heat-exchanger',
            title: '板式换热器',
            parentKey: 'heat-exchange',
            level: 3,
            deviceType: 'main',
            description: '板式换热器',
          },
          {
            key: 'absorption-heat-unit',
            title: '吸收式换热机组',
            parentKey: 'heat-exchange',
            level: 3,
            deviceType: 'main',
            description: '吸收式换热机组',
          },
          {
            key: 'tube-heat-exchanger',
            title: '管式换热器',
            parentKey: 'heat-exchange',
            level: 3,
            deviceType: 'main',
            description: '管式换热器',
          },
        ],
      },
    ],
  },
  {
    key: 'pump',
    title: '附属设备',
    level: 1,
    deviceType: 'auxiliary',
    description: '各类泵类设备',
    children: [
      { key: 'circulation-pump', title: '循环泵', parentKey: 'pump', level: 2, deviceType: 'auxiliary', description: '循环泵' },
      { key: 'water-supply-pump', title: '供水泵', parentKey: 'pump', level: 2, deviceType: 'auxiliary', description: '供水泵' },
      { key: 'pressure-pump', title: '加压泵', parentKey: 'pump', level: 2, deviceType: 'auxiliary', description: '加压泵' },
      { key: 'sewage-pump', title: '污水泵', parentKey: 'pump', level: 2, deviceType: 'auxiliary', description: '污水泵' },
      { key: 'cooling-water-pump', title: '冷却水泵', parentKey: 'pump', level: 2, deviceType: 'auxiliary', description: '冷却水泵' },
      { key: 'fire-pump', title: '消防泵', parentKey: 'pump', level: 2, deviceType: 'auxiliary', description: '消防泵' },
      { key: 'benefit-pump', title: '引水泵', parentKey: 'pump', level: 2, deviceType: 'auxiliary', description: '引水泵' },
      { key: 'motor', title: '电机', parentKey: 'pump', level: 2, deviceType: 'auxiliary', description: '电机' },
      { key: 'pump-body', title: '泵体', parentKey: 'pump', level: 2, deviceType: 'auxiliary', description: '泵体' },
    ],
  },
  {
    key: 'valve',
    title: '备品备件',
    level: 1,
    deviceType: 'spare',
    description: '各类阀门设备',
    children: [
      { key: 'sewage-valve-waste', title: '污水阀（废）', parentKey: 'valve', level: 2, deviceType: 'spare', description: '污水阀（废）' },
      { key: 'electric-valve', title: '电动阀', parentKey: 'valve', level: 2, deviceType: 'spare', description: '电动阀' },
      { key: 'solenoid-valve', title: '电磁阀', parentKey: 'valve', level: 2, deviceType: 'spare', description: '电磁阀' },
      { key: 'connecting-valve', title: '连接阀', parentKey: 'valve', level: 2, deviceType: 'spare', description: '连接阀' },
      { key: 'manual-control-valve', title: '调节阀（手动）', parentKey: 'valve', level: 2, deviceType: 'spare', description: '调节阀（手动）' },
      { key: 'constant-pressure-valve', title: '定压阀', parentKey: 'valve', level: 2, deviceType: 'spare', description: '定压阀' },
      { key: 'self-acting-pressure-diff-valve', title: '自力式压差调节阀', parentKey: 'valve', level: 2, deviceType: 'spare', description: '自力式压差调节阀' },
      { key: 'needle-valve', title: '针型阀', parentKey: 'valve', level: 2, deviceType: 'spare', description: '针型阀' },
      { key: 'check-valve', title: '止回阀', parentKey: 'valve', level: 2, deviceType: 'spare', description: '止回阀' },
    ],
  },
  {
    key: 'special',
    title: '特种设备',
    level: 1,
    deviceType: 'special',
    description: '特种行业设备',
    children: [
      { key: 'special-pressure', title: '压力容器', parentKey: 'special', level: 2, deviceType: 'special', description: '压力容器设备' },
      { key: 'special-lifting', title: '起重设备', parentKey: 'special', level: 2, deviceType: 'special', description: '起重机械设备' },
    ],
  },
  {
    key: 'general',
    title: '非特种设备',
    level: 1,
    deviceType: 'general',
    description: '一般通用设备',
    children: [
      { key: 'general-tools', title: '通用工具', parentKey: 'general', level: 2, deviceType: 'general', description: '通用工具设备' },
      { key: 'general-furniture', title: '办公家具', parentKey: 'general', level: 2, deviceType: 'general', description: '办公家具设备' },
    ],
  },
];

// 设备类型选项（与“设备类型”页面保持一致的四类）
const equipmentTypes = [
  { code: 'main' as const, name: '主设备', category: '设备', form: '独立设备' },
  { code: 'auxiliary' as const, name: '附属设备', category: '设备', form: '附属设备' },
  { code: 'special' as const, name: '特种设备', category: '设备', form: '独立设备' },
  { code: 'general' as const, name: '非特种设备', category: '设备', form: '独立设备' },
];

const mockAssetData: AssetRecord[] = [
  {
    id: '1',
    assetCode: 'FA001',
    batchNo: 'B2023-001',
    assetName: '板式换热器',
    deviceTypeKey: 'plate-heat-exchanger',
    deviceTypeName: '板式换热器',
    deviceType: 'main',
    specification: 'BR0.5-20-1.0-4/7',
    model: 'BR0.5-20',
    brand: '阿法拉伐',
    manufacturer: '阿法拉伐集团',
    supplier: '阿法拉伐（上海）有限公司',
    purchaseDate: '2023-01-10',
    storageDate: '2023-01-15',
    usageYears: 15,
    location: '热力站A区',
    maintenanceCycle: '每年一次',
    warrantyPeriod: 36,
    warrantyYears: 3,
    warrantyExpiry: '2026-01-15',
    serialNumber: 'ALF2023001',
    qrCode: 'QR_FA001',
    description: '主要换热设备，用于换热供暖',
    attachments: ['采购合同.pdf', '质保卡.jpg'],
    createUser: '管理员',
    createDate: '2023-01-15 10:30:00',
    updateUser: '李三',
    updateDate: '2023-06-20 14:20:00',
  },
  {
    id: '2',
    assetCode: 'FA002',
    batchNo: 'B2023-001',
    assetName: '循环泵',
    deviceTypeKey: 'circulation-pump',
    deviceTypeName: '循环泵',
    deviceType: 'auxiliary',
    specification: 'ISG50-160',
    model: 'ISG50-160',
    brand: '南方泵业',
    manufacturer: '南方泵业集团',
    supplier: '南方泵业股份有限公司',
    purchaseDate: '2023-02-15',
    storageDate: '2023-02-20',
    usageYears: 10,
    location: '热力站B区',
    maintenanceCycle: '每半年一次',
    warrantyPeriod: 24,
    warrantyYears: 2,
    warrantyExpiry: '2025-02-20',
    serialNumber: 'NF2023002',
    qrCode: 'QR_FA002',
    description: '热水循环系统主泵',
    attachments: ['采购协议.pdf'],
    createUser: '管理员',
    createDate: '2023-02-20 09:15:00',
    updateUser: '王四',
    updateDate: '2023-05-10 11:30:00',
  },
  {
    id: '3',
    assetCode: 'FA003',
    batchNo: 'B2023-002',
    assetName: '电动阀',
    deviceTypeKey: 'electric-valve',
    deviceTypeName: '电动阀',
    deviceType: 'spare',
    specification: 'VB-7000',
    model: 'VB-7000-DN50',
    brand: '霍尼韦尔',
    manufacturer: '霍尼韦尔国际公司',
    supplier: '霍尼韦尔（中国）有限公司',
    purchaseDate: '2023-03-05',
    storageDate: '2023-03-10',
    usageYears: 8,
    location: '热力站管道系统',
    maintenanceCycle: '每季度一次',
    warrantyPeriod: 24,
    warrantyYears: 2,
    warrantyExpiry: '2025-03-10',
    serialNumber: 'HW2023003',
    qrCode: 'QR_FA003',
    description: '热水系统流量调节阀门',
    attachments: ['设备铭牌.pdf', '安装图纸.dwg'],
    createUser: '管理员',
    createDate: '2023-03-10 16:45:00',
    updateUser: '赵五',
    updateDate: '2023-04-15 09:20:00',
  },
];

const AssetRegister: React.FC = () => {
  const [assetOptions, setAssetOptions] = useState<{ value: string; label: string }[]>([]);
  const [assetMap, setAssetMap] = useState<Record<string, InventoryAsset>>({});

  // 同步库存页资产数据到“资产编码”下拉（从 localStorage 的 equipment_type_assets 扁平化）
  useEffect(() => {
    try {
      const saved = localStorage.getItem('equipment_type_assets');
      if (saved) {
        const byType = JSON.parse(saved) as Record<string, InventoryAsset[]>;
        const flat: InventoryAsset[] = Object.values(byType || {}).flat();
        const options = flat.map(a => ({
          value: a.code,
          label: `${a.code} ${a.name}${a.specification ? ' ' + a.specification : ''}`,
        }));
        const map: Record<string, InventoryAsset> = {};
        flat.forEach(a => { if (a?.code) map[a.code] = a; });
        setAssetOptions(options);
        setAssetMap(map);
      }
    } catch {}
  }, []);
  const [deviceTypeTree, setDeviceTypeTree] = useState<DeviceTypeNode[]>(initialDeviceTypeTree);
  const [assetData, setAssetData] = useState<AssetRecord[]>([]);
  const [filteredData, setFilteredData] = useState<AssetRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAssetModalVisible, setIsAssetModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [editingAsset, setEditingAsset] = useState<AssetRecord | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<AssetRecord | null>(null);
  const [selectedTypeKey, setSelectedTypeKey] = useState<string>('all');
  const [typeSearchText, setTypeSearchText] = useState<string>('');
  const [assetForm] = Form.useForm();
  const [searchForm] = Form.useForm();

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      try {
        const saved = localStorage.getItem('fixed_asset_archives');
        if (saved) {
          const arr = JSON.parse(saved) as AssetRecord[];
          setAssetData(arr);
          setFilteredData(arr);
        } else {
          setAssetData(mockAssetData);
          setFilteredData(mockAssetData);
          localStorage.setItem('fixed_asset_archives', JSON.stringify(mockAssetData));
        }
      } catch {
        setAssetData(mockAssetData);
        setFilteredData(mockAssetData);
      }
      setLoading(false);
    }, 300);
  }, []);

  const handleSearch = (values: any) => {
    let filtered = [...assetData];

    if (values.assetCode) {
      filtered = filtered.filter(item => item.assetCode.toLowerCase().includes(values.assetCode.toLowerCase()));
    }
    if (values.assetName) {
      filtered = filtered.filter(item => item.assetName.toLowerCase().includes(values.assetName.toLowerCase()));
    }
    if (values.deviceTypeName) {
      filtered = filtered.filter(item => item.deviceTypeName.toLowerCase().includes(values.deviceTypeName.toLowerCase()));
    }
    if (values.batchNo) {
      filtered = filtered.filter(item => item.batchNo && item.batchNo.toLowerCase().includes(values.batchNo.toLowerCase()));
    }
    if (values.deviceType) {
      filtered = filtered.filter(item => item.deviceType === values.deviceType);
    }
    if (values.createDate && values.createDate.length === 2) {
      const [startDate, endDate] = values.createDate;
      filtered = filtered.filter(item => {
        const d = dayjs(item.createDate);
        return d.isAfter(dayjs(startDate).startOf('day')) && d.isBefore(dayjs(endDate).endOf('day'));
      });
    }

    setFilteredData(filtered);
  };

  const handleReset = () => {
    searchForm.resetFields();
    setFilteredData(assetData);
  };

  const handleAdd = () => {
    setEditingAsset(null);
    setIsAssetModalVisible(true);
    assetForm.resetFields();
  };

  const handleEdit = (record: AssetRecord) => {
    setEditingAsset(record);
    setIsAssetModalVisible(true);
    assetForm.setFieldsValue(record);
  };

  const handleDelete = (record: AssetRecord) => {
    const updated = assetData.filter(a => a.id !== record.id);
    setAssetData(updated);
    setFilteredData(updated);
    localStorage.setItem('fixed_asset_archives', JSON.stringify(updated));
    message.success('删除成功');
  };

  const handleSubmit = async () => {
    try {
      const values = await assetForm.validateFields();
      if (editingAsset) {
        const updated = assetData.map(item => (
          item.id === editingAsset.id 
            ? { 
                ...editingAsset, 
                ...values,
                updateUser: '管理员',
                updateDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                purchaseDate: values.purchaseDate ? values.purchaseDate.format('YYYY-MM-DD') : undefined,
                storageDate: values.storageDate ? values.storageDate.format('YYYY-MM-DD') : undefined,
                warrantyExpiry: values.warrantyExpiry ? values.warrantyExpiry.format('YYYY-MM-DD') : undefined,
              } 
            : item
        ));
        setAssetData(updated);
        setFilteredData(updated);
        localStorage.setItem('fixed_asset_archives', JSON.stringify(updated));
        message.success('编辑成功');
      } else {
        const newItem: AssetRecord = {
          id: String(Date.now()),
          assetCode: values.assetCode || `NEW${assetData.length + 1}`,
          assetName: values.assetName,
          deviceTypeKey: values.deviceTypeKey,
          deviceTypeName: values.deviceTypeName,
          deviceType: values.deviceType,
          batchNo: values.batchNo,
          specification: values.specification,
          model: values.model,
          brand: values.brand,
          manufacturer: values.manufacturer,
          supplier: values.supplier,
          purchaseDate: values.purchaseDate ? values.purchaseDate.format('YYYY-MM-DD') : undefined,
          storageDate: values.storageDate ? values.storageDate.format('YYYY-MM-DD') : undefined,
          usageYears: values.usageYears,
          location: values.location,
          maintenanceCycle: values.maintenanceCycle,
          warrantyPeriod: values.warrantyPeriod,
          warrantyYears: values.warrantyYears,
          warrantyExpiry: values.warrantyExpiry ? values.warrantyExpiry.format('YYYY-MM-DD') : undefined,
          serialNumber: values.serialNumber,
          qrCode: values.qrCode,
          description: values.description,
          attachments: [],
          createUser: '管理员',
          createDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        };
        const updated = [newItem, ...assetData];
        setAssetData(updated);
        setFilteredData(updated);
        localStorage.setItem('fixed_asset_archives', JSON.stringify(updated));
        message.success('新增成功');
      }
      setIsAssetModalVisible(false);
      setEditingAsset(null);
      assetForm.resetFields();
    } catch (e) {
      // 校验失败
    }
  };

  const columns: ColumnsType<AssetRecord> = [
    {
      title: '序号',
      key: 'index',
      width: 60,
      render: (_text, _record, index) => index + 1,
      fixed: 'left',
    },
    { title: '资产编码', dataIndex: 'assetCode', key: 'assetCode', width: 120 },
    { title: '资产名称', dataIndex: 'assetName', key: 'assetName', width: 150 },
    { title: '设备类别', dataIndex: 'deviceTypeName', key: 'deviceTypeName', width: 140 },
    { title: '批次号', dataIndex: 'batchNo', key: 'batchNo', width: 120, render: (text) => text ? <Tag color="blue">{text}</Tag> : '-' },
    { title: '型号', dataIndex: 'model', key: 'model', width: 120 },
    { title: '品牌', dataIndex: 'brand', key: 'brand', width: 120 },
    { title: '供应商', dataIndex: 'supplier', key: 'supplier', width: 150 },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 160,
      render: (_text, record) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => { setSelectedAsset(record); setIsDetailModalVisible(true); }}>详情</Button>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm title="确定删除该资产？" onConfirm={() => handleDelete(record)}>
            <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 渲染“全部”为根节点，顶级设备类型为其子节点
  const renderTreeWithAllRoot = (nodes: DeviceTypeNode[]) => (
    <Tree.TreeNode title="全部" key="all">
      {nodes.map(node => (
        <Tree.TreeNode title={node.title} key={node.key} />
      ))}
    </Tree.TreeNode>
  );

  // 顶级节点 key 到资产 deviceType 的映射（用于表格筛选）
  const topKeyToType: Record<string, AssetRecord['deviceType']> = {
    main: 'main',
    pump: 'auxiliary',
    valve: 'spare',
    special: 'special',
    general: 'general',
  };

  return (
    <Layout>
      <Sider width={260} style={{ background: '#fff', padding: 16 }}>
        <div style={{ marginBottom: 12, fontWeight: 600 }}>设备类型目录</div>
        <Input
          placeholder="搜索类型名称"
          value={typeSearchText}
          onChange={(e) => setTypeSearchText(e.target.value)}
          style={{ marginBottom: 8 }}
        />
        <Tree
          defaultExpandAll
          onSelect={(keys) => setSelectedTypeKey((keys[0] as string) || 'all')}
        >
          {renderTreeWithAllRoot(
            deviceTypeTree.filter(n =>
              !typeSearchText || n.title.toLowerCase().includes(typeSearchText.toLowerCase())
            )
          )}
        </Tree>
      </Sider>

      <Content style={{ padding: 16 }}>
        <Card>
          <Form form={searchForm} layout="inline" onFinish={handleSearch}>
            <Form.Item name="assetCode" label="资产编码">
              <Input placeholder="请输入资产编码" style={{ width: 160 }} />
            </Form.Item>
            <Form.Item name="assetName" label="资产名称">
              <Input placeholder="请输入资产名称" style={{ width: 160 }} />
            </Form.Item>
            <Form.Item name="deviceTypeName" label="设备类别">
              <Input placeholder="请输入设备类别" style={{ width: 160 }} />
            </Form.Item>
            <Form.Item name="batchNo" label="批次号">
              <Input placeholder="请输入批次号" style={{ width: 140 }} />
            </Form.Item>
            <Form.Item name="deviceType" label="类型">
              <Select placeholder="请选择类型" allowClear style={{ width: 140 }}>
                <Option value="main">主设备</Option>
                <Option value="auxiliary">附属设备</Option>
                <Option value="spare">备品备件</Option>
                <Option value="special">特种设备</Option>
                <Option value="general">一般设备</Option>
              </Select>
            </Form.Item>
            <Form.Item name="createDate" label="创建时间">
              <DatePicker.RangePicker />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>搜索</Button>
                <Button onClick={handleReset} icon={<ReloadOutlined />}>重置</Button>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增资产</Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>

        <Card style={{ marginTop: 12 }}>
          <Table
            columns={columns}
            dataSource={filteredData.filter(item =>
              selectedTypeKey === 'all' ||
              item.deviceTypeKey === selectedTypeKey ||
              (topKeyToType[selectedTypeKey] && item.deviceType === topKeyToType[selectedTypeKey])
            )}
            rowKey="id"
            loading={loading}
            scroll={{ x: 1200 }}
            pagination={{ pageSize: 10, showSizeChanger: true }}
          />
        </Card>

        <Modal
          title={editingAsset ? '编辑资产' : '新增资产'}
          open={isAssetModalVisible}
          onOk={handleSubmit}
          onCancel={() => { setIsAssetModalVisible(false); setEditingAsset(null); }}
          width={800}
        >
          <Form form={assetForm} layout="vertical">
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="assetCode" label="资产编码">
                  <Select
                    placeholder="请选择或搜索资产编码"
                    showSearch
                    allowClear
                    options={assetOptions}
                    filterOption={(input, option) => {
                      const label = (option?.label ?? '') as string;
                      return label.toLowerCase().includes(input.toLowerCase());
                    }}
                    onChange={(code) => {
                      const a = code ? assetMap[code as string] : undefined;
                      if (a) {
                        assetForm.setFieldsValue({
                          assetCode: a.code,
                          assetName: a.name,
                          model: a.specification,
                          brand: a.brand,
                          supplier: a.supplier,
                          purchaseDate: a.purchaseDate ? dayjs(a.purchaseDate) : undefined,
                          location: [a.warehouse, a.location].filter(Boolean).join('-') || undefined,
                        });
                      } else {
                        assetForm.setFieldsValue({ assetName: undefined, model: undefined, brand: undefined, supplier: undefined, purchaseDate: undefined, location: undefined });
                      }
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="assetName" label="资产名称" rules={[{ required: true, message: '请输入资产名称' }]}> 
                  <Input placeholder="请输入资产名称" />
                </Form.Item>
              </Col>
              {/* 批次号移除 */}
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="deviceTypeName" label="设备类别">
                  <Input placeholder="设备类别将随设备类型自动填充" disabled />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="deviceType" label="设备类型" rules={[{ required: true, message: '请选择设备类型' }]}> 
                  <Select placeholder="请选择设备类型" onChange={(value) => {
                    const selected = equipmentTypes.find(t => t.code === value);
                    if (selected) {
                      assetForm.setFieldsValue({ deviceTypeName: selected.category, deviceForm: selected.form });
                    }
                  }}>
                    {equipmentTypes.map(t => (
                      <Option key={t.code} value={t.code}>{t.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="deviceForm" label="设备形态">
                  <Input placeholder="设备形态将随设备类型自动填充" disabled />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="model" label="型号">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="brand" label="品牌">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="supplier" label="供应商">
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="purchaseDate" label="购买日期">
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="storageDate" label="入库日期">
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="usageYears" label="使用年限">
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="location" label="位置">
                  <Input />
                </Form.Item>
              </Col>
              {/* 序列号移除 */}
            </Row>
            <Form.Item name="description" label="描述">
              <Input.TextArea rows={3} />
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title="资产详情"
          open={isDetailModalVisible}
          onCancel={() => setIsDetailModalVisible(false)}
          footer={null}
          width={800}
        >
          {selectedAsset && (
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="资产编码">{selectedAsset.assetCode}</Descriptions.Item>
              <Descriptions.Item label="资产名称">{selectedAsset.assetName}</Descriptions.Item>
              <Descriptions.Item label="设备类别">{selectedAsset.deviceTypeName}</Descriptions.Item>
              <Descriptions.Item label="类型">{selectedAsset.deviceType}</Descriptions.Item>
              <Descriptions.Item label="批次号">{selectedAsset.batchNo || '-'}</Descriptions.Item>
              <Descriptions.Item label="型号">{selectedAsset.model || '-'}</Descriptions.Item>
              <Descriptions.Item label="品牌">{selectedAsset.brand || '-'}</Descriptions.Item>
              <Descriptions.Item label="供应商">{selectedAsset.supplier || '-'}</Descriptions.Item>
              <Descriptions.Item label="购买日期">{selectedAsset.purchaseDate || '-'}</Descriptions.Item>
              <Descriptions.Item label="入库日期">{selectedAsset.storageDate || '-'}</Descriptions.Item>
              <Descriptions.Item label="位置">{selectedAsset.location || '-'}</Descriptions.Item>
              <Descriptions.Item label="序列号">{selectedAsset.serialNumber || '-'}</Descriptions.Item>
              <Descriptions.Item label="描述" span={2}>{selectedAsset.description || '-'}</Descriptions.Item>
              <Descriptions.Item label="创建人">{selectedAsset.createUser || '-'}</Descriptions.Item>
              <Descriptions.Item label="创建时间">{selectedAsset.createDate || '-'}</Descriptions.Item>
            </Descriptions>
          )}
        </Modal>
      </Content>
    </Layout>
  );
};

export default AssetRegister;
// 库存页资产数据结构（用于从本地缓存同步下拉选项）
type InventoryAsset = {
  id: string;
  name: string;
  code: string;
  specification?: string;
  brand?: string;
  supplier?: string;
  purchaseDate?: string;
  warehouse?: string;
  location?: string;
};