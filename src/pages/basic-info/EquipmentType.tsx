import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Radio,
  message,
  Popconfirm,
  Row,
  Col,
  Divider,
  Badge,
  Drawer,
  Tag,
  Tree,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  UnorderedListOutlined,
  UpOutlined,
  DownOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
// 移除不兼容的类型导入，使用宽松类型以通过构建

interface EquipmentAttribute {
  key: string;
  name: string;
  unit: string;
  valueType: 'input' | 'select';
  remarks: string;
  options?: string[]; // 下拉选项改为单一文本数组
}

interface EquipmentType {
  id: string;
  name: string;
  category: '设备' | '低值易耗品';
  form: '独立设备' | '附属设备';
  isAsset: boolean;
  attributes: EquipmentAttribute[];
  assetCount: number; // 添加资产数量字段
  specialCategory?: '普通设备' | '特种设备';
}

// 资产信息接口
interface Asset {
  id: string;
  name: string;
  code: string;
  status: '在用' | '闲置' | '维修中' | '报废';
  department: string;
  purchaseDate: string;
  batchNumber: string;  // 批次号
  location: string;  // 设备存放地点（库位）
  borrower: string;  // 领用人
  borrowTime: string;  // 领用时间
  specification: string; // 规格型号
  unit: string; // 单位
  warehouse: string; // 所在仓库
  unitPrice: number; // 单价
  attributes: Record<string, string>;
}

// 模拟数据（固定四类设备类型）
const mockData: EquipmentType[] = [
  {
    id: '1',
    name: '主设备',
    category: '设备',
    form: '独立设备',
    isAsset: true,
    assetCount: 0,
    attributes: [
      { key: 'attr-main-power', name: '功率', unit: 'kW', valueType: 'input', remarks: '额定功率' },
      { key: 'attr-main-flow', name: '流量', unit: 'm³/h', valueType: 'input', remarks: '额定流量' },
      { key: 'attr-main-model', name: '型号', unit: '', valueType: 'input', remarks: '设备型号' },
    ],
  },
  {
    id: '2',
    name: '附属设备',
    category: '设备',
    form: '附属设备',
    isAsset: true,
    assetCount: 0,
    attributes: [
      { key: 'attr-sub-material', name: '材质', unit: '', valueType: 'select', remarks: '不锈钢/碳钢/铸铁' },
      { key: 'attr-sub-size', name: '尺寸', unit: 'mm', valueType: 'input', remarks: '长度或直径' },
      { key: 'attr-sub-conn', name: '连接方式', unit: '', valueType: 'select', remarks: '法兰/卡箍/焊接' },
    ],
  },
  {
    id: '3',
    name: '特种设备',
    category: '设备',
    form: '独立设备',
    isAsset: true,
    assetCount: 0,
    attributes: [
      { key: 'attr-ts-cert', name: '检验合格证', unit: '', valueType: 'select', remarks: '有效/过期' },
      { key: 'attr-ts-reg', name: '使用登记证', unit: '', valueType: 'select', remarks: '有效/过期' },
      { key: 'attr-ts-pressure', name: '压力等级', unit: 'MPa', valueType: 'input', remarks: '设计压力' },
    ],
  },
  {
    id: '4',
    name: '非特种设备',
    category: '设备',
    form: '独立设备',
    isAsset: true,
    assetCount: 0,
    attributes: [
      { key: 'attr-pt-model', name: '型号', unit: '', valueType: 'input', remarks: '设备型号' },
      { key: 'attr-pt-brand', name: '厂家', unit: '', valueType: 'input', remarks: '生产厂商' },
      { key: 'attr-pt-maint', name: '维护周期', unit: '', valueType: 'select', remarks: '月/季/年' },
    ],
  },
];

// 模拟资产数据
const mockAssets: Record<string, Asset[]> = {
  '1': [
    {
      id: '1',
      name: '一号循环泵',
      code: 'XHB-001',
      status: '在用',
      department: '供热一部',
      purchaseDate: '2023-01-15',
      batchNumber: 'BATCH-2023-001',
      location: '主机房A-1位',
      specification: '50-125 单级离心泵',
      unit: '台',
      warehouse: '一号换热站主机房',
      unitPrice: 16800,
      borrower: '张工',
      borrowTime: '2023-11-01',
      attributes: {
        '功率': '7.5kW',
        '流量': '50m³/h',
      },
    },
    {
      id: '2',
      name: '二号循环泵',
      code: 'XHB-002',
      status: '闲置',
      department: '供热二部',
      purchaseDate: '2023-02-20',
      batchNumber: 'BATCH-2023-002',
      location: '主机房B-2位',
      specification: '65-160 单级离心泵',
      unit: '台',
      warehouse: '二号换热站主机房',
      unitPrice: 21500,
      borrower: '李工',
      borrowTime: '2023-11-15',
      attributes: {
        '功率': '11kW',
        '流量': '80m³/h',
      },
    },
    {
      id: '3',
      name: '三号循环泵',
      code: 'XHB-003',
      status: '维修中',
      department: '供热一部',
      purchaseDate: '2023-03-10',
      batchNumber: 'BATCH-2023-003',
      location: '检修工位-3',
      specification: '40-100 单级离心泵',
      unit: '台',
      warehouse: '一号换热站主机房',
      unitPrice: 13200,
      borrower: '王工',
      borrowTime: '2023-12-01',
      attributes: {
        '功率': '5.5kW',
        '流量': '30m³/h',
      },
    },
  ],
  '2': [
    {
      id: '1',
      name: '一号板式换热器',
      code: 'HRQ-001',
      status: '在用',
      department: '供热一部',
      purchaseDate: '2023-04-01',
      batchNumber: 'BATCH-2023-004',
      location: '主机房A-5位',
      specification: '换热面积200m²，304不锈钢板片',
      unit: '台',
      warehouse: '一号换热站主机房',
      unitPrice: 98500,
      borrower: '张工',
      borrowTime: '2023-11-01',
      attributes: {
        '换热面积': '200m²',
      },
    },
    {
      id: '2',
      name: '二号板式换热器',
      code: 'HRQ-002',
      status: '在用',
      department: '供热二部',
      purchaseDate: '2023-04-15',
      batchNumber: 'BATCH-2023-005',
      location: '主机房B-6位',
      specification: '换热面积150m²，钛板片',
      unit: '台',
      warehouse: '二号换热站主机房',
      unitPrice: 87600,
      borrower: '李工',
      borrowTime: '2023-11-15',
      attributes: {
        '换热面积': '150m²',
      },
    },
  ],
  '3': [
    {
      id: '1',
      name: '压力容器-一号',
      code: 'TSB-001',
      status: '在用',
      department: '安全管理部',
      purchaseDate: '2022-06-10',
      batchNumber: 'BATCH-TS-001',
      location: '仓库A-特种-01位',
      specification: '容积2.0m³，设计压力1.6MPa',
      unit: '台',
      warehouse: '特种设备仓库',
      unitPrice: 156000,
      borrower: '赵工',
      borrowTime: '2024-01-05',
      attributes: {
        '检验合格证': '有效',
        '使用登记证': '有效',
      },
    },
    {
      id: '2',
      name: '压力容器-二号',
      code: 'TSB-002',
      status: '闲置',
      department: '安全管理部',
      purchaseDate: '2023-03-18',
      batchNumber: 'BATCH-TS-002',
      location: '仓库B-特种-02位',
      specification: '容积1.2m³，设计压力1.0MPa',
      unit: '台',
      warehouse: '特种设备仓库',
      unitPrice: 118000,
      borrower: '钱工',
      borrowTime: '2024-02-12',
      attributes: {
        '检验合格证': '有效',
        '使用登记证': '有效',
      },
    },
  ],
  '4': [
    {
      id: '1',
      name: '普通水泵-一号',
      code: 'PTSB-001',
      status: '在用',
      department: '设备运维部',
      purchaseDate: '2021-11-20',
      batchNumber: 'BATCH-PT-001',
      location: '设备库房C区-C1位',
      specification: 'IS80-65-160 管道泵',
      unit: '台',
      warehouse: '设备库房',
      unitPrice: 7800,
      borrower: '孙工',
      borrowTime: '2024-01-20',
      attributes: {
        '功率': '5.5kW',
        '流量': '40m³/h',
      },
    },
    {
      id: '2',
      name: '普通水泵-二号',
      code: 'PTSB-002',
      status: '维修中',
      department: '设备运维部',
      purchaseDate: '2022-02-15',
      batchNumber: 'BATCH-PT-002',
      location: '维修工位-3',
      specification: 'IS100-80-200 管道泵',
      unit: '台',
      warehouse: '设备库房',
      unitPrice: 9200,
      borrower: '周工',
      borrowTime: '2024-03-02',
      attributes: {
        '功率': '7.5kW',
        '流量': '55m³/h',
      },
    },
  ],
};

const EquipmentTypePage: React.FC = () => {
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [data, setData] = useState<EquipmentType[]>(mockData);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  // 移除未使用的 attributeForm
  const [assetDrawerVisible, setAssetDrawerVisible] = useState(false);
  const [selectedType, setSelectedType] = useState<EquipmentType | null>(null);
  const [attributeDrawerVisible, setAttributeDrawerVisible] = useState(false);
  const [attrRefresh, setAttrRefresh] = useState(0); // 触发表格联动刷新
  // 抽屉-属性列表行内编辑所需表单与状态
  const [attrEditForm] = Form.useForm();
  const [attrEditKey, setAttrEditKey] = useState<string | null>(null);

  // 初始化时从 localStorage 加载设备类型数据
  useEffect(() => {
    try {
      const saved = localStorage.getItem('equipment_types');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setData(parsed as EquipmentType[]);
        }
      }
    } catch (e) {
      // 忽略解析错误，继续使用默认数据
      console.warn('加载设备类型失败，使用默认数据');
    }

    // 将关联资产同步到 localStorage，供库存查询页面联动展示
    try {
      localStorage.setItem('equipment_type_assets', JSON.stringify(mockAssets));
      // 派发事件通知其他页面刷新资产数据
      window.dispatchEvent(new CustomEvent('equipmentAssetsUpdated'));
    } catch (e) {
      console.warn('保存设备类型关联资产到本地失败');
    }
  }, []);

  // 数据变化时，持久化到 localStorage
  useEffect(() => {
    try {
      localStorage.setItem('equipment_types', JSON.stringify(data));
    } catch (e) {
      console.warn('保存设备类型到本地失败');
    }
  }, [data]);

  // 获取状态对应的标签颜色
  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      '在用': 'green',
      '闲置': 'orange',
      '维修中': 'blue',
      '报废': 'red',
    };
    return colorMap[status] || 'default';
  };

  // 资产列表列定义
  const assetColumns: ColumnsType<Asset> = [
    {
      title: '资产编号',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: '资产名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '批次号',
      dataIndex: 'batchNumber',
      key: 'batchNumber',
    },
    {
      title: '设备存放地点',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: '领用人',
      dataIndex: 'borrower',
      key: 'borrower',
    },
    {
      title: '领用时间',
      dataIndex: 'borrowTime',
      key: 'borrowTime',
    },
    {
      title: '使用部门',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: '购置日期',
      dataIndex: 'purchaseDate',
      key: 'purchaseDate',
    },
    {
      title: '属性信息',
      key: 'attributes',
      render: (_, record) => (
        <Space direction="vertical">
          {Object.entries(record.attributes).map(([key, value]) => (
            <div key={key}>
              {key}: {value}
            </div>
          ))}
        </Space>
      ),
    },
  ];

  // 保存属性到后端（若后端不可用则返回false）
  const updateAttributeApi = async (typeId: string, attr: EquipmentAttribute) => {
    try {
      const res = await fetch(`/api/equipment-types/${typeId}/attributes/${attr.key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attr),
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  };

  // 抽屉-属性查看列定义（支持单行编辑）
  const attributeViewColumns: ColumnsType<EquipmentAttribute> = [
    {
      title: '属性名称',
      dataIndex: 'name',
      key: 'name',
      width: '20%',
      render: (text: string, record) => (
        attrEditKey === record.key ? (
          <Form.Item name="name" rules={[{ required: true, message: '请输入属性名称' }]} style={{ margin: 0 }}>
            <Input placeholder="请输入属性名称" />
          </Form.Item>
        ) : (
          <span>{record.name}</span>
        )
      ),
    },
    {
      title: '属性单位',
      dataIndex: 'unit',
      key: 'unit',
      width: '18%',
      render: (_: string, record) => (
        attrEditKey === record.key ? (
          <Form.Item name="unit" rules={[{ required: true, message: '请输入属性单位' }]} style={{ margin: 0 }}>
            <Input placeholder="请输入属性单位" />
          </Form.Item>
        ) : (
          <span>{record.unit}</span>
        )
      ),
    },
    {
      title: '属性值类型',
      dataIndex: 'valueType',
      key: 'valueType',
      width: '18%',
      render: (v: 'input' | 'select', record) => (
        attrEditKey === record.key ? (
          <Form.Item name="valueType" rules={[{ required: true, message: '请选择属性值类型' }]} style={{ margin: 0 }}>
            <Select
              onChange={(val) => {
                const vt = attrEditForm.getFieldValue('valueType');
                const opts = attrEditForm.getFieldValue('options');
                if (val === 'select' && (!opts || !Array.isArray(opts))) {
                  attrEditForm.setFieldsValue({ options: [''] });
                }
                if (val === 'input') {
                  attrEditForm.setFieldsValue({ options: undefined });
                }
              }}
            >
              <Select.Option value="input">输入框</Select.Option>
              <Select.Option value="select">下拉选择框</Select.Option>
            </Select>
          </Form.Item>
        ) : (
          v === 'input' ? '输入框' : '下拉选择框'
        )
      ),
    },
    {
      title: '下拉选项',
      key: 'options',
      width: '24%',
      render: (_: any, record) => (
        attrEditKey === record.key ? (
          <Form.Item noStyle shouldUpdate>
            {() => {
              const vt = attrEditForm.getFieldValue('valueType');
              if (vt !== 'select') return <span style={{ color: '#999' }}>仅下拉类型可编辑</span>;
              const move = (from: number, to: number) => {
                const opts: string[] = attrEditForm.getFieldValue('options') || [];
                if (from < 0 || to < 0 || from >= opts.length || to >= opts.length) return;
                const newOpts = [...opts];
                const [m] = newOpts.splice(from, 1);
                newOpts.splice(to, 0, m);
                attrEditForm.setFieldsValue({ options: newOpts });
              };
              return (
                <Form.List name="options">
                  {(optFields, { add, remove }) => (
                    <div>
                      {optFields.map((field, i) => (
                        <Space key={field.key} align="baseline" style={{ marginBottom: 8 }}>
                          <Form.Item name={[field.name]} rules={[{ required: true, message: '请输入选项文本' }]} style={{ margin: 0 }}>
                            <Input placeholder="选项文本" style={{ width: 200 }} />
                          </Form.Item>
                          <Button size="small" onClick={() => move(i, i - 1)} disabled={i === 0}>上移</Button>
                          <Button size="small" onClick={() => move(i, i + 1)} disabled={i === optFields.length - 1}>下移</Button>
                          <Button size="small" danger onClick={() => remove(field.name)}>删除</Button>
                        </Space>
                      ))}
                      <Button type="dashed" size="small" onClick={() => add('')}>添加选项</Button>
                    </div>
                  )}
                </Form.List>
              );
            }}
          </Form.Item>
        ) : (
          record.valueType === 'select' ? (record.options?.join('、') || '-') : <span style={{ color: '#999' }}>—</span>
        )
      ),
    },
    {
      title: '备注',
      dataIndex: 'remarks',
      key: 'remarks',
      width: '12%',
      render: (text: string, record) => (
        attrEditKey === record.key ? (
          <Form.Item name="remarks" style={{ margin: 0 }}>
            <Input placeholder="请输入备注" />
          </Form.Item>
        ) : (
          <span>{record.remarks}</span>
        )
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: '8%',
      render: (_: any, record) => (
        attrEditKey === record.key ? (
          <Button
            type="link"
            onClick={async () => {
              try {
                const vals = await attrEditForm.validateFields();
                const updated: EquipmentAttribute = {
                  key: record.key,
                  name: vals.name,
                  unit: vals.unit,
                  valueType: vals.valueType,
                  remarks: vals.remarks,
                  options: vals.valueType === 'select' ? (vals.options || []).filter((s: string) => s && s.trim()) : undefined,
                };
                const ok = await updateAttributeApi(selectedType!.id, updated);
                const newData = data.map(d => {
                  if (d.id !== selectedType!.id) return d;
                  const newAttrs = d.attributes.map(a => a.key === record.key ? updated : a);
                  return { ...d, attributes: newAttrs };
                });
                setData(newData);
                localStorage.setItem('equipment_types', JSON.stringify(newData));
                const refreshed = newData.find(d => d.id === selectedType!.id) || null;
                setSelectedType(refreshed);
                setAttrEditKey(null);
                window.dispatchEvent(new CustomEvent('equipmentTypesUpdated'));
                message[ok ? 'success' : 'warning'](ok ? '保存成功' : '保存到后端失败，已本地更新');
              } catch (e) {
                message.error('请完善必填项');
              }
            }}
          >
            完成
          </Button>
        ) : (
          <Button
            type="link"
            onClick={() => {
              setAttrEditKey(record.key);
              attrEditForm.setFieldsValue({
                key: record.key,
                name: record.name,
                unit: record.unit,
                valueType: record.valueType,
                remarks: record.remarks,
                options: record.options || [],
              });
            }}
          >
            编辑
          </Button>
        )
      ),
    },
  ];

  // 表格列定义
  const columns: ColumnsType<EquipmentType> = [
    {
      title: '设备类型名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '设备类别',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: '设备形态',
      dataIndex: 'form',
      key: 'form',
    },
    {
      title: '是否特种设备',
      dataIndex: 'specialCategory',
      key: 'specialCategory',
    },
    {
      title: '是否资产',
      dataIndex: 'isAsset',
      key: 'isAsset',
      render: (isAsset: boolean) => (isAsset ? '是' : '否'),
    },
    {
      title: '属性数量',
      key: 'attributeCount',
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => showAttributeList(record)}
          icon={<UnorderedListOutlined />}
        >
          {record.attributes.length}
        </Button>
      ),
    },
    {
      title: '关联资产',
      key: 'assetCount',
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => showAssetList(record)}
          icon={<UnorderedListOutlined />}
        >
          {(mockAssets[record.id]?.length || 0)} 个资产
        </Button>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个设备类型吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 属性表格列定义
  const attributeColumns: ColumnsType<any> = [
    {
      title: '属性名称',
      dataIndex: 'name',
      key: 'name',
      width: '25%',
      render: (_, __, index) => (
        <Form.Item
          name={['attributes', index, 'name']}
          rules={[{ required: true, message: '请输入属性名称' }]}
          style={{ margin: 0 }}
        >
          <Input placeholder="请输入属性名称" />
        </Form.Item>
      ),
    },
    {
      title: '属性单位',
      dataIndex: 'unit',
      key: 'unit',
      width: '20%',
      render: (_, __, index) => (
        <Form.Item
          name={['attributes', index, 'unit']}
          rules={[{ required: true, message: '请输入属性单位' }]}
          style={{ margin: 0 }}
        >
          <Input placeholder="请输入属性单位" />
        </Form.Item>
      ),
    },
    {
      title: '属性值类型',
      dataIndex: 'valueType',
      key: 'valueType',
      width: '20%',
      render: (_, __, index) => (
        <Form.Item
          name={['attributes', index, 'valueType']}
          rules={[{ required: true, message: '请选择属性值类型' }]}
          style={{ margin: 0 }}
        >
          <Select
            onChange={(val) => {
              const attrs = form.getFieldValue('attributes') || [];
              const curr = attrs[index] || {};
              if (val === 'select') {
                const initOpts = curr.options && curr.options.length > 0 ? curr.options : [''];
                attrs[index] = { ...curr, valueType: 'select', options: initOpts };
              } else {
                if (curr.options) delete curr.options;
                attrs[index] = { ...curr, valueType: 'input' };
              }
              form.setFieldsValue({ attributes: attrs });
              setAttrRefresh((k) => k + 1);
            }}
          >
            <Select.Option value="input">输入框</Select.Option>
            <Select.Option value="select">下拉选择框</Select.Option>
          </Select>
        </Form.Item>
      ),
    },
    {
      title: '下拉选项',
      key: 'options',
      width: '25%',
      render: (_, __, index) => (
        <Form.Item noStyle shouldUpdate={(prev, curr) =>
          prev?.attributes?.[index]?.valueType !== curr?.attributes?.[index]?.valueType
        }>
          {({ getFieldValue }) => {
            const vt = getFieldValue(['attributes', index, 'valueType']);
            if (vt !== 'select') {
              return <Tag color="default">仅下拉类型可编辑</Tag>;
            }
            const move = (from: number, to: number) => {
              const attrs = getFieldValue('attributes') || [];
              const opts: string[] = attrs[index]?.options || [];
              if (from < 0 || to < 0 || from >= opts.length || to >= opts.length) return;
              const newOpts = [...opts];
              const [m] = newOpts.splice(from, 1);
              newOpts.splice(to, 0, m);
              attrs[index] = { ...attrs[index], options: newOpts };
              form.setFieldsValue({ attributes: attrs });
            };
            return (
              <Form.List name={['attributes', index, 'options']}>
                {(optFields, { add, remove }) => (
                  <div>
                    {optFields.map((field, i) => (
                      <Space key={field.key} align="center" wrap style={{ marginBottom: 8 }}>
                        <Form.Item
                          name={[field.name]}
                          rules={[{ required: true, message: '请输入选项文本' }]}
                          style={{ margin: 0 }}
                        >
                          <Input placeholder="选项文本" allowClear size="small" style={{ width: 220 }} />
                        </Form.Item>
                        <Button
                          size="small"
                          type="text"
                          icon={<UpOutlined />}
                          onClick={() => move(i, i - 1)}
                          disabled={i === 0}
                        />
                        <Button
                          size="small"
                          type="text"
                          icon={<DownOutlined />}
                          onClick={() => move(i, i + 1)}
                          disabled={i === optFields.length - 1}
                        />
                        <Button
                          size="small"
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => remove(field.name)}
                        />
                      </Space>
                    ))}
                    <Button type="link" size="small" onClick={() => add('')} icon={<PlusOutlined />}>添加</Button>
                  </div>
                )}
              </Form.List>
            );
          }}
        </Form.Item>
      ),
    },
    {
      title: '备注',
      dataIndex: 'remarks',
      key: 'remarks',
      width: '20%',
      render: (_, __, index) => (
        <Form.Item
          name={['attributes', index, 'remarks']}
          style={{ margin: 0 }}
        >
          <Input placeholder="请输入备注" />
        </Form.Item>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: '10%',
      render: (_, __, index) => (
        <Button
          type="link"
          danger
          onClick={() => {
            const attributes = form.getFieldValue('attributes') || [];
            attributes.splice(index, 1);
            form.setFieldsValue({ attributes });
          }}
        >
          删除
        </Button>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({
      specialCategory: '普通设备',
      attributes: [{ key: Date.now().toString() }],
    });
    setModalVisible(true);
  };

  const handleEdit = (record: EquipmentType) => {
    setEditingId(record.id);
    form.setFieldsValue({
      ...record,
      attributes: record.attributes.map(attr => ({
        ...attr,
        key: attr.key || Date.now().toString(),
      })),
    });
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    setData(data.filter(item => item.id !== id));
    message.success('删除成功');
    // 派发更新事件，通知其他页面刷新
    window.dispatchEvent(new CustomEvent('equipmentTypesUpdated'));
  };

  const handleAddAttribute = () => {
    const attributes = form.getFieldValue('attributes') || [];
    form.setFieldsValue({
      attributes: [...attributes, { key: Date.now().toString() }],
    });
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingId) {
        setData(data.map(item =>
          item.id === editingId ? { ...values, id: editingId, assetCount: item.assetCount } : item
        ));
      } else {
        setData([...data, { ...values, id: Date.now().toString(), assetCount: 0 }]);
      }
      setModalVisible(false);
      message.success(editingId ? '编辑成功' : '添加成功');
      // 派发更新事件，通知其他页面刷新
      window.dispatchEvent(new CustomEvent('equipmentTypesUpdated'));
    } catch (error) {
      console.error('Validate Failed:', error);
    }
  };

  const handleSearch = () => {
    const values = searchForm.getFieldsValue();
    // 实现搜索逻辑
    console.log('Search values:', values);
  };

  const showAssetList = (type: EquipmentType) => {
    setSelectedType(type);
    setAssetDrawerVisible(true);
  };

  const showAttributeList = (type: EquipmentType) => {
    setSelectedType(type);
    setAttributeDrawerVisible(true);
  };

  // 左侧设备类型树与筛选
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
  const treeData = React.useMemo(() => {
    const nodes = data?.length ? data : mockData;
    return [
      { title: '设备类型目录', key: 'root', children: nodes.map(n => ({ title: n.name, key: n.id })) }
    ];
  }, [data]);

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
      <div>
      <Card>
        <Form form={searchForm} layout="inline" style={{ marginBottom: 16 }}>
          <Form.Item name="name" label="设备类型名称">
            <Input placeholder="请输入设备类型名称" maxLength={50} />
          </Form.Item>
          <Form.Item name="category" label="设备类别">
            <Select style={{ width: 160 }} allowClear>
              <Select.Option value="设备">设备</Select.Option>
              <Select.Option value="低值易耗品">低值易耗品</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleSearch}
              >
                搜索
              </Button>
              <Button onClick={() => searchForm.resetFields()}>重置</Button>
            </Space>
          </Form.Item>
        </Form>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          style={{ marginBottom: 16 }}
        >
          新增设备类型
        </Button>

        <Table
          columns={columns}
          dataSource={selectedTypeId ? data.filter(d => d.id === selectedTypeId) : data}
          rowKey="id"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: total => `共 ${total} 条`,
          }}
        />
      </Card>

      <Modal
         title={editingId ? '编辑设备类型' : '新增设备类型'}
         open={modalVisible}
         onOk={handleModalOk}
         onCancel={() => setModalVisible(false)}
         width={1000}
         destroyOnHidden
       >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            isAsset: true,
            specialCategory: '普通设备',
            attributes: [{ key: Date.now().toString() }],
          }}
        >
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="name"
                label="设备类型名称"
                rules={[
                  { required: true, message: '请输入设备类型名称' },
                  { max: 50, message: '不超过50个字符' },
                ]}
              >
                <Input placeholder="请输入设备类型名称" maxLength={50} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="category"
                label="设备类别"
                rules={[{ required: true, message: '请选择设备类别' }]}
              >
                <Select placeholder="请选择">
                  <Select.Option value="设备">设备</Select.Option>
                  <Select.Option value="低值易耗品">低值易耗品</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="form"
                label="设备形态"
                rules={[{ required: true, message: '请选择设备形态' }]}
              >
                <Select placeholder="请选择">
                  <Select.Option value="独立设备">独立设备</Select.Option>
                  <Select.Option value="附属设备">附属设备</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="specialCategory"
                label="是否特种设备"
                rules={[{ required: true, message: '请选择是否特种设备' }]}
              >
                <Select placeholder="请选择">
                  <Select.Option value="普通设备">普通设备</Select.Option>
                  <Select.Option value="特种设备">特种设备</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="isAsset"
                label="是否资产"
                rules={[{ required: true, message: '请选择是否为资产' }]}
              >
                <Select placeholder="请选择">
                  <Select.Option value={true}>是</Select.Option>
                  <Select.Option value={false}>否</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">设备属性</Divider>
          
          <Form.List name="attributes">
            {fields => (
              <>
                <Table
                  columns={attributeColumns as any}
                  dataSource={fields as any}
                  pagination={false}
                  rowKey="key"
                  size="small"
                />
                <Button
                  type="dashed"
                  onClick={handleAddAttribute}
                  style={{ marginTop: 16, width: '100%' }}
                  icon={<PlusOutlined />}
                >
                  添加属性
                </Button>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>

      <Drawer
        title={`${selectedType?.name || ''} - 关联资产列表`}
        placement="right"
        width={1000}
        onClose={() => setAssetDrawerVisible(false)}
        open={assetDrawerVisible}
      >
        <Table
          columns={assetColumns}
          dataSource={selectedType ? (mockAssets[selectedType.id] || []) : []}
          rowKey="id"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: total => `共 ${total} 条`,
          }}
        />
      </Drawer>

      <Drawer
        title={`${selectedType?.name || ''} - 属性列表`}
        placement="right"
        width={800}
        onClose={() => setAttributeDrawerVisible(false)}
        open={attributeDrawerVisible}
      >
        <Form form={attrEditForm} layout="vertical">
          <Table
            columns={attributeViewColumns}
            dataSource={selectedType?.attributes || []}
            rowKey={(row) => row.key}
            pagination={false}
          />
        </Form>
      </Drawer>
      </div>
      </Col>
    </Row>
  );
};

export default EquipmentTypePage;