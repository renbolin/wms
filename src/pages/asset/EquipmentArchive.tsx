import React, { useEffect, useMemo, useState } from 'react';
import {
  Layout,
  Tree,
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Tag,
  Space,
  message,
  Tabs,
  Descriptions,
} from 'antd';
import type { DataNode } from 'antd/es/tree';
import dayjs from 'dayjs';
import BrandSelect from '../../components/BrandSelect';

const { Sider, Content } = Layout;

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
  // 建档元信息
  archiveDate?: string;
  archivist?: string;
  archiveNo?: string;
  archiveRemarks?: string;
  // 设备档案（三大块）
  equipmentArchive?: {
    technical: {
      equipmentCode?: string;
      name?: string;
      modelSpec?: string;
      brand?: string;
      serialNo?: string;
      category?: string;
      form?: string;
      typeName?: string;
      specialCategory?: string;
      performanceParams?: string;
      structureParams?: string;
      supportingSystems?: string;
      mediaRequirements?: string;
      installationLocation?: string;
      useDepartment?: string;
      installationDate?: string;
      firstUseDate?: string;
      equipmentStatus?: string;
    };
    asset: {
      assetCode?: string;
      assetCategory?: string;
      purchaseAmount?: number;
      taxRate?: number;
      depreciationYears?: number;
      residualRate?: number;
      monthlyDepreciation?: number;
      accumulatedDepreciation?: number;
      netValue?: number;
      purchaseDate?: string;
      supplierInfo?: string;
      ownershipDepartment?: string;
      contractNo?: string;
      assetStatus?: string;
      changeRecords?: string;
      lastInventoryDate?: string;
      scrapInfo?: {
        plannedScrapDate?: string;
        scrapReportNo?: string;
        disposalMethod?: string;
      };
    };
  };
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

// 默认设备类型树
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

// TreeData 转换
const toTreeData = (nodes: DeviceTypeNode[]): DataNode[] =>
  nodes.map((n): DataNode => ({
    key: n.id,
    title: n.name,
    children: n.children ? toTreeData(n.children) : undefined,
  }));

// 编造示例数据
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
  // 查看/编辑/新增弹窗
  const [isViewVisible, setIsViewVisible] = useState<boolean>(false);
  const [viewRow, setViewRow] = useState<CombinedRow | null>(null);
  const [isEditVisible, setIsEditVisible] = useState<boolean>(false);
  const [editForm] = Form.useForm();
  const [editingRow, setEditingRow] = useState<CombinedRow | null>(null);

  // 建档信息弹窗
  const [isArchiveModalVisible, setIsArchiveModalVisible] = useState<boolean>(false);
  const [archiveForm] = Form.useForm();
  const [archiveRow, setArchiveRow] = useState<CombinedRow | null>(null);
  const [isArchiveEditing, setIsArchiveEditing] = useState<boolean>(false);

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

  // 组合视图数据（资产与技术根据相同 id 合并）
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
    const base = !selectedTypeIds.length ? rows : rows.filter((r) => new Set(selectedTypeIds).has(r.typeId));
    return base;
  }, [rows, selectedTypeIds]);

  // 树选择
  const onTreeSelect = (keys: React.Key[]) => {
    setSelectedTypeIds(keys.map(String));
  };

  // 设备类型名称映射，用于在列表显示类型名
  const typeNameMap = useMemo(() => {
    const m: Record<string, string> = {};
    const walk = (arr: DeviceTypeNode[]) => arr.forEach(n => {
      m[n.id] = n.name;
      if (n.children && n.children.length) walk(n.children);
    });
    walk(deviceTypes);
    return m;
  }, [deviceTypes]);

  // 设备类型选项（扁平化，含叶子与非叶子）
  const typeOptions = useMemo(() => {
    const opts: { value: string; label: string }[] = [];
    const walk = (arr: DeviceTypeNode[]) => arr.forEach(n => {
      opts.push({ value: n.id, label: n.name });
      if (n.children && n.children.length) walk(n.children);
    });
    walk(deviceTypes);
    return opts;
  }, [deviceTypes]);

  // 供应商字典（基础信息：basic_supplier_dict）
  const supplierOptions = useMemo(() => {
    try {
      const raw = localStorage.getItem('basic_supplier_dict');
      if (!raw) return [];
      const arr = JSON.parse(raw) as { supplierName: string }[];
      return arr.map(s => ({ value: s.supplierName, label: s.supplierName }));
    } catch {
      return [];
    }
  }, []);

  // 型号字典（基础信息：equipment_models）
  const modelOptions = useMemo(() => {
    try {
      const raw = localStorage.getItem('equipment_models');
      if (!raw) return [];
      const arr = JSON.parse(raw) as { modelCode: string; modelName: string }[];
      return arr.map(m => ({ value: m.modelName, label: `${m.modelName} (${m.modelCode})` }));
    } catch {
      return [];
    }
  }, []);

  // 简洁设备列表列定义：设备类型、设备型号、品牌、供应商、状态、采购日期、操作
  const columns = [
    { title: '设备类型', key: 'type', render: (_: any, r: CombinedRow) => typeNameMap[r.typeId] || '-' },
    { title: '设备名称', dataIndex: ['asset', 'name'], key: 'name' },
    { title: '设备型号', key: 'model', render: (_: any, r: CombinedRow) => r.asset.equipmentArchive?.technical?.modelSpec || r.tech.model || '-' },
    { title: '品牌', key: 'brand', render: (_: any, r: CombinedRow) => r.asset.equipmentArchive?.technical?.brand || '-' },
    { title: '供应商', key: 'supplier', render: (_: any, r: CombinedRow) => r.asset.equipmentArchive?.asset?.supplierInfo || r.asset.supplier || '-' },
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
      title: '操作',
      key: 'actions',
      render: (_: any, row: CombinedRow) => (
        <Space>
          <Button size="small" onClick={() => openView(row)}>查看</Button>
          <Button size="small" type="primary" onClick={() => openEdit(row)}>编辑</Button>
          <Button size="small" danger onClick={() => removeRow(row)}>删除</Button>
          <Button size="small" onClick={() => openArchive(row)}>建档信息</Button>
        </Space>
      ),
    },
  ];

  const ensurePersist = (ab: Record<string, AssetRecord[]>, tb: Record<string, TechRecord[]>) => {
    localStorage.setItem(ASSET_KEY, JSON.stringify(ab));
    localStorage.setItem(TECH_KEY, JSON.stringify(tb));
    window.dispatchEvent(new CustomEvent('equipmentAssetsUpdated'));
    window.dispatchEvent(new CustomEvent('equipmentTechUpdated'));
  };

  // 打开建档弹窗，预填已有数据
  const openArchive = (row: CombinedRow) => {
    setArchiveRow(row);
    setIsArchiveModalVisible(true);
    setIsArchiveEditing(false); // 默认只读
    archiveForm.resetFields();
    const a = row.asset;
    const t = row.tech;
    const arch = a.equipmentArchive;
    archiveForm.setFieldsValue({
      // 元信息
      archiveDate: a.archiveDate ? dayjs(a.archiveDate) : undefined,
      archivist: a.archivist || '系统用户',
      archiveNo: a.archiveNo,
      archiveRemarks: a.archiveRemarks,
      // 技术信息
      tech_equipmentName: arch?.technical?.name ?? a.name,
      tech_modelSpec: arch?.technical?.modelSpec ?? t.spec,
      tech_category: arch?.technical?.category,
      tech_form: arch?.technical?.form,
      tech_typeName: arch?.technical?.typeName,
      tech_specialCategory: arch?.technical?.specialCategory,
      tech_brand: arch?.technical?.brand,
      tech_serialNumber: arch?.technical?.serialNo,
      tech_supportingSystems: arch?.technical?.supportingSystems,
      tech_mediaRequirements: arch?.technical?.mediaRequirements,
      tech_installLocation: arch?.technical?.installationLocation,
      tech_useDepartment: arch?.technical?.useDepartment,
      tech_installationDate: arch?.technical?.installationDate ? dayjs(arch?.technical?.installationDate) : undefined,
      tech_firstUseDate: arch?.technical?.firstUseDate ? dayjs(arch?.technical?.firstUseDate) : undefined,
      tech_equipmentStatus: arch?.technical?.equipmentStatus,
      tech_performanceParams: arch?.technical?.performanceParams,
      tech_structureParams: arch?.technical?.structureParams,
      // 资产信息
      asset_assetCode: arch?.asset?.assetCode,
      asset_assetCategory: arch?.asset?.assetCategory,
      asset_purchaseAmount: arch?.asset?.purchaseAmount,
      asset_taxRate: arch?.asset?.taxRate,
      asset_depreciationYears: arch?.asset?.depreciationYears,
      asset_residualRate: arch?.asset?.residualRate,
      asset_monthlyDepreciation: arch?.asset?.monthlyDepreciation,
      asset_accumulatedDepreciation: arch?.asset?.accumulatedDepreciation,
      asset_netValue: arch?.asset?.netValue,
      asset_purchaseDate: arch?.asset?.purchaseDate ? dayjs(arch?.asset?.purchaseDate) : undefined,
      asset_supplierInfo: arch?.asset?.supplierInfo,
      asset_ownershipDepartment: arch?.asset?.ownershipDepartment,
      asset_contractNo: arch?.asset?.contractNo,
      asset_assetStatus: arch?.asset?.assetStatus,
      asset_changeRecords: arch?.asset?.changeRecords,
      asset_lastInventoryDate: arch?.asset?.lastInventoryDate ? dayjs(arch?.asset?.lastInventoryDate) : undefined,
      asset_scrapPlannedDate: arch?.asset?.scrapInfo?.plannedScrapDate ? dayjs(arch?.asset?.scrapInfo?.plannedScrapDate) : undefined,
      asset_scrapReportNo: arch?.asset?.scrapInfo?.scrapReportNo,
      asset_disposalMethod: arch?.asset?.scrapInfo?.disposalMethod,
    });
  };

  // 查看
  const openView = (row: CombinedRow) => {
    setViewRow(row);
    setIsViewVisible(true);
  };

  // 新增
  const openCreate = () => {
    setEditingRow(null);
    setIsEditVisible(true);
    editForm.resetFields();
    // 若已选择单一类型，默认填入
    const defaultType = selectedTypeIds.length === 1 ? selectedTypeIds[0] : undefined;
    editForm.setFieldsValue({
      typeId: defaultType,
      status: '在用',
      purchaseDate: dayjs(),
    });
  };

  // 编辑
  const openEdit = (row: CombinedRow) => {
    setEditingRow(row);
    setIsEditVisible(true);
    editForm.resetFields();
    const a = row.asset;
    const t = row.tech;
    editForm.setFieldsValue({
      typeId: row.typeId,
      name: a.name,
      modelSpec: a.equipmentArchive?.technical?.modelSpec || t.model,
      brandCode: a.equipmentArchive?.technical?.brand,
      supplierName: a.equipmentArchive?.asset?.supplierInfo || a.supplier,
      status: a.status,
      purchaseDate: a.purchaseDate ? dayjs(a.purchaseDate) : undefined,
      location: a.location,
      cost: a.cost,
    });
  };

  const handleEditConfirm = async () => {
    try {
      const vals = await editForm.validateFields();
      const newTypeId = vals.typeId as string;
      if (!newTypeId) {
        message.error('请选择设备类型');
        return;
      }
      const ab = { ...assetsByType };
      const tb = { ...techByType };

      // 确保数组存在
      ab[newTypeId] = (ab[newTypeId] || []).slice();
      tb[newTypeId] = (tb[newTypeId] || []).slice();

      if (editingRow) {
        // 更新：若类型变更，需要从旧类型中移除并添加到新类型
        const oldTypeId = editingRow.typeId;
        const id = editingRow.id;
        // 从旧类型删除
        ab[oldTypeId] = (ab[oldTypeId] || []).filter(x => x.id !== id);
        tb[oldTypeId] = (tb[oldTypeId] || []).filter(x => x.id !== id);
        // 写入新类型
        const updatedAsset: AssetRecord = {
          id,
          typeId: newTypeId,
          code: editingRow.asset.code, // 保留原编码
          name: vals.name,
          location: vals.location,
          status: vals.status,
          purchaseDate: vals.purchaseDate ? vals.purchaseDate.format('YYYY-MM-DD') : undefined,
          supplier: vals.supplierName,
          cost: vals.cost != null ? Number(vals.cost) : undefined,
          equipmentArchive: editingRow.asset.equipmentArchive, // 不改动建档信息
          archiveDate: editingRow.asset.archiveDate,
          archivist: editingRow.asset.archivist,
          archiveNo: editingRow.asset.archiveNo,
          archiveRemarks: editingRow.asset.archiveRemarks,
        };

        const updatedTech: TechRecord = {
          id,
          typeId: newTypeId,
          model: vals.modelSpec,
          spec: editingRow.tech.spec,
          power: editingRow.tech.power,
          parameters: editingRow.tech.parameters,
          docs: editingRow.tech.docs,
          techNotes: editingRow.tech.techNotes,
        };

        ab[newTypeId].push(updatedAsset);
        tb[newTypeId].push(updatedTech);
      } else {
        // 新增
        const id = `${newTypeId}-${Date.now()}`;
        const newAsset: AssetRecord = {
          id,
          typeId: newTypeId,
          code: `NEW-${Math.floor(Math.random() * 10000)}`,
          name: vals.name,
          location: vals.location,
          status: vals.status,
          purchaseDate: vals.purchaseDate ? vals.purchaseDate.format('YYYY-MM-DD') : undefined,
          supplier: vals.supplierName,
          cost: vals.cost != null ? Number(vals.cost) : undefined,
        };
        const newTech: TechRecord = {
          id,
          typeId: newTypeId,
          model: vals.modelSpec,
          spec: undefined,
          power: undefined,
          parameters: {},
          docs: { manual: false, installDiagram: false, maintenanceManual: false, certificate: '有效', inspection: '合格' },
        };
        ab[newTypeId].push(newAsset);
        tb[newTypeId].push(newTech);
      }

      setAssetsByType(ab);
      setTechByType(tb);
      ensurePersist(ab, tb);
      setIsEditVisible(false);
      setEditingRow(null);
      editForm.resetFields();
      message.success(editingRow ? '设备已更新' : '设备已新增');
    } catch (e) {
      message.error('请完整填写设备信息');
    }
  };

  const removeRow = (row: CombinedRow) => {
    Modal.confirm({
      title: '删除设备',
      content: `确认删除设备【${row.asset.name}】吗？该操作不可恢复。`,
      okText: '删除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: () => {
        const ab = { ...assetsByType };
        const tb = { ...techByType };
        const listA = (ab[row.typeId] || []).filter(x => x.id !== row.id);
        const listT = (tb[row.typeId] || []).filter(x => x.id !== row.id);
        ab[row.typeId] = listA;
        tb[row.typeId] = listT;
        setAssetsByType(ab);
        setTechByType(tb);
        ensurePersist(ab, tb);
        message.success('已删除');
      }
    });
  };

  const handleArchiveConfirm = async () => {
    try {
      const vals = await archiveForm.validateFields();
      if (!archiveRow) return;
      const typeId = archiveRow.typeId;
      const ab = { ...assetsByType };
      const aset = (ab[typeId] || []).slice();
      const idx = aset.findIndex((x) => x.id === archiveRow.id);
      if (idx === -1) return;
      const prev = aset[idx];
      const arch = {
        technical: {
          equipmentCode: prev.code,
          name: vals.tech_equipmentName,
          modelSpec: vals.tech_modelSpec,
          brand: vals.tech_brand,
          serialNo: vals.tech_serialNumber,
          category: vals.tech_category,
          form: vals.tech_form,
          typeName: vals.tech_typeName,
          specialCategory: vals.tech_specialCategory,
          performanceParams: vals.tech_performanceParams,
          structureParams: vals.tech_structureParams,
          supportingSystems: vals.tech_supportingSystems,
          mediaRequirements: vals.tech_mediaRequirements,
          installationLocation: vals.tech_installLocation,
          useDepartment: vals.tech_useDepartment,
          installationDate: vals.tech_installationDate ? vals.tech_installationDate.format('YYYY-MM-DD') : undefined,
          firstUseDate: vals.tech_firstUseDate ? vals.tech_firstUseDate.format('YYYY-MM-DD') : undefined,
          equipmentStatus: vals.tech_equipmentStatus,
        },
        asset: {
          assetCode: vals.asset_assetCode,
          assetCategory: vals.asset_assetCategory,
          purchaseAmount: vals.asset_purchaseAmount != null ? Number(vals.asset_purchaseAmount) : undefined,
          taxRate: vals.asset_taxRate != null ? Number(vals.asset_taxRate) : undefined,
          depreciationYears: vals.asset_depreciationYears != null ? Number(vals.asset_depreciationYears) : undefined,
          residualRate: vals.asset_residualRate != null ? Number(vals.asset_residualRate) : undefined,
          monthlyDepreciation: vals.asset_monthlyDepreciation != null ? Number(vals.asset_monthlyDepreciation) : undefined,
          accumulatedDepreciation: vals.asset_accumulatedDepreciation != null ? Number(vals.asset_accumulatedDepreciation) : undefined,
          netValue: vals.asset_netValue != null ? Number(vals.asset_netValue) : undefined,
          purchaseDate: vals.asset_purchaseDate ? vals.asset_purchaseDate.format('YYYY-MM-DD') : undefined,
          supplierInfo: vals.asset_supplierInfo,
          ownershipDepartment: vals.asset_ownershipDepartment,
          contractNo: vals.asset_contractNo,
          assetStatus: vals.asset_assetStatus,
          changeRecords: vals.asset_changeRecords,
          lastInventoryDate: vals.asset_lastInventoryDate ? vals.asset_lastInventoryDate.format('YYYY-MM-DD') : undefined,
          scrapInfo: (vals.asset_scrapPlannedDate || vals.asset_scrapReportNo || vals.asset_disposalMethod) ? {
            plannedScrapDate: vals.asset_scrapPlannedDate ? vals.asset_scrapPlannedDate.format('YYYY-MM-DD') : undefined,
            scrapReportNo: vals.asset_scrapReportNo,
            disposalMethod: vals.asset_disposalMethod,
          } : undefined,
        },
      } as AssetRecord['equipmentArchive'];

      aset[idx] = {
        ...prev,
        archiveDate: vals.archiveDate ? vals.archiveDate.format('YYYY-MM-DD') : undefined,
        archivist: vals.archivist,
        archiveNo: vals.archiveNo,
        archiveRemarks: vals.archiveRemarks,
        equipmentArchive: arch,
      };
      ab[typeId] = aset;
      setAssetsByType(ab);
      ensurePersist(ab, techByType);
      setIsArchiveModalVisible(false);
      setArchiveRow(null);
      archiveForm.resetFields();
      message.success('建档信息已保存');
    } catch (e) {
      message.error('请完整填写建档表单');
    }
  };

  return (
    <Layout style={{ height: '100%', background: '#fff' }}>
      <Sider width={280} style={{ background: '#fff', borderRight: '1px solid #f0f0f0', padding: 12 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>设备类型目录</div>
        <Tree treeData={toTreeData(deviceTypes)} onSelect={onTreeSelect} multiple defaultExpandAll />
      </Sider>

      <Content style={{ padding: 16 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>设备列表</div>
        <Space style={{ marginBottom: 12 }}>
          <Button type="primary" onClick={openCreate}>新增设备</Button>
        </Space>
        <Table
          rowKey={(r) => r.id}
          dataSource={filteredRows}
          columns={columns}
          pagination={{ pageSize: 8 }}
        />

        {/* 建档信息弹窗 */}
        <Modal
          title="建档信息"
          open={isArchiveModalVisible}
          onCancel={() => setIsArchiveModalVisible(false)}
          width={860}
          footer={
            <Space>
              <Button onClick={() => setIsArchiveModalVisible(false)}>关闭</Button>
              {!isArchiveEditing ? (
                <Button type="primary" onClick={() => setIsArchiveEditing(true)}>编辑</Button>
              ) : (
                <Button onClick={() => setIsArchiveEditing(false)}>退出编辑</Button>
              )}
              <Button type="primary" onClick={handleArchiveConfirm} disabled={!isArchiveEditing}>保存</Button>
            </Space>
          }
        >
          <Form form={archiveForm} layout="vertical" disabled={!isArchiveEditing}>
            <Tabs
              defaultActiveKey="meta"
              items={[
                {
                  key: 'meta',
                  label: '建档元信息',
                  children: (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <Form.Item label="建档日期" name="archiveDate">
                        <DatePicker style={{ width: '100%' }} />
                      </Form.Item>
                      <Form.Item label="建档人" name="archivist">
                        <Input placeholder="如 张三" />
                      </Form.Item>
                      <Form.Item label="档案编号" name="archiveNo">
                        <Input placeholder="如 ARCH-2024-001" />
                      </Form.Item>
                      <Form.Item label="建档备注" name="archiveRemarks">
                        <Input.TextArea rows={3} />
                      </Form.Item>
                    </div>
                  ),
                },
                {
                  key: 'tech',
                  label: '设备技术信息',
                  children: (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <Form.Item label="设备名称" name="tech_equipmentName">
                        <Input placeholder="如 循环泵1号" />
                      </Form.Item>
                      <Form.Item label="型号规格" name="tech_modelSpec">
                        <Input placeholder="如 M-100 / 20L/min" />
                      </Form.Item>
                      <Form.Item label="设备类别" name="tech_category">
                        <Input />
                      </Form.Item>
                      <Form.Item label="设备形态" name="tech_form">
                        <Input />
                      </Form.Item>
                      <Form.Item label="设备类型名称" name="tech_typeName">
                        <Input />
                      </Form.Item>
                      <Form.Item label="是否特种设备" name="tech_specialCategory">
                        <Select
                          options={[
                            { value: '是', label: '是' },
                            { value: '否', label: '否' },
                          ]}
                        />
                      </Form.Item>
                      <Form.Item label="品牌" name="tech_brand">
                        <Input />
                      </Form.Item>
                      <Form.Item label="序列号" name="tech_serialNumber">
                        <Input />
                      </Form.Item>
                      <Form.Item label="配套系统" name="tech_supportingSystems">
                        <Input />
                      </Form.Item>
                      <Form.Item label="介质需求" name="tech_mediaRequirements">
                        <Input />
                      </Form.Item>
                      <Form.Item label="安装位置" name="tech_installLocation">
                        <Input />
                      </Form.Item>
                      <Form.Item label="使用部门" name="tech_useDepartment">
                        <Input />
                      </Form.Item>
                      <Form.Item label="安装日期" name="tech_installationDate">
                        <DatePicker style={{ width: '100%' }} />
                      </Form.Item>
                      <Form.Item label="首次使用日期" name="tech_firstUseDate">
                        <DatePicker style={{ width: '100%' }} />
                      </Form.Item>
                      <Form.Item label="设备状态" name="tech_equipmentStatus">
                        <Select
                          options={[
                            { value: '在用', label: '在用' },
                            { value: '闲置', label: '闲置' },
                            { value: '维修', label: '维修' },
                            { value: '报废', label: '报废' },
                          ]}
                        />
                      </Form.Item>
                      <Form.Item label="性能参数" name="tech_performanceParams">
                        <Input.TextArea rows={3} />
                      </Form.Item>
                      <Form.Item label="结构参数" name="tech_structureParams">
                        <Input.TextArea rows={3} />
                      </Form.Item>
                    </div>
                  ),
                },
                {
                  key: 'asset',
                  label: '设备资产信息',
                  children: (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <Form.Item label="资产编号" name="asset_assetCode">
                        <Input />
                      </Form.Item>
                      <Form.Item label="资产分类" name="asset_assetCategory">
                        <Input />
                      </Form.Item>
                      <Form.Item label="购置金额" name="asset_purchaseAmount">
                        <InputNumber style={{ width: '100%' }} min={0} />
                      </Form.Item>
                      <Form.Item label="税率(%)" name="asset_taxRate">
                        <InputNumber style={{ width: '100%' }} min={0} />
                      </Form.Item>
                      <Form.Item label="折旧年限(年)" name="asset_depreciationYears">
                        <InputNumber style={{ width: '100%' }} min={0} />
                      </Form.Item>
                      <Form.Item label="残值率(%)" name="asset_residualRate">
                        <InputNumber style={{ width: '100%' }} min={0} />
                      </Form.Item>
                      <Form.Item label="月折旧额" name="asset_monthlyDepreciation">
                        <InputNumber style={{ width: '100%' }} min={0} />
                      </Form.Item>
                      <Form.Item label="累计折旧" name="asset_accumulatedDepreciation">
                        <InputNumber style={{ width: '100%' }} min={0} />
                      </Form.Item>
                      <Form.Item label="净值" name="asset_netValue">
                        <InputNumber style={{ width: '100%' }} min={0} />
                      </Form.Item>
                      <Form.Item label="购置日期" name="asset_purchaseDate">
                        <DatePicker style={{ width: '100%' }} />
                      </Form.Item>
                      <Form.Item label="供应商信息" name="asset_supplierInfo">
                        <Input />
                      </Form.Item>
                      <Form.Item label="归口部门" name="asset_ownershipDepartment">
                        <Input />
                      </Form.Item>
                      <Form.Item label="合同编号" name="asset_contractNo">
                        <Input />
                      </Form.Item>
                      <Form.Item label="资产状态" name="asset_assetStatus">
                        <Select
                          options={[
                            { value: '在用', label: '在用' },
                            { value: '闲置', label: '闲置' },
                            { value: '维修', label: '维修' },
                            { value: '报废', label: '报废' },
                          ]}
                        />
                      </Form.Item>
                      <Form.Item label="变更记录" name="asset_changeRecords">
                        <Input.TextArea rows={3} />
                      </Form.Item>
                      <Form.Item label="最近盘点日期" name="asset_lastInventoryDate">
                        <DatePicker style={{ width: '100%' }} />
                      </Form.Item>
                      <Form.Item label="计划报废日期" name="asset_scrapPlannedDate">
                        <DatePicker style={{ width: '100%' }} />
                      </Form.Item>
                      <Form.Item label="报废报告编号" name="asset_scrapReportNo">
                        <Input />
                      </Form.Item>
                      <Form.Item label="处置方式" name="asset_disposalMethod">
                        <Input />
                      </Form.Item>
                    </div>
                  ),
                },
              ]}
            />
          </Form>
        </Modal>

        {/* 查看详情弹窗 */}
        <Modal
          title="设备详情"
          open={isViewVisible}
          onCancel={() => setIsViewVisible(false)}
          footer={<Button onClick={() => setIsViewVisible(false)}>关闭</Button>}
          width={720}
        >
          {viewRow && (
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="设备类型">{typeNameMap[viewRow.typeId] || '-'}</Descriptions.Item>
              <Descriptions.Item label="设备名称">{viewRow.asset.name}</Descriptions.Item>
              <Descriptions.Item label="设备型号">{viewRow.asset.equipmentArchive?.technical?.modelSpec || viewRow.tech.model || '-'}</Descriptions.Item>
              <Descriptions.Item label="品牌">{viewRow.asset.equipmentArchive?.technical?.brand || '-'}</Descriptions.Item>
              <Descriptions.Item label="供应商">{viewRow.asset.equipmentArchive?.asset?.supplierInfo || viewRow.asset.supplier || '-'}</Descriptions.Item>
              <Descriptions.Item label="状态">{viewRow.asset.status}</Descriptions.Item>
              <Descriptions.Item label="采购日期">{viewRow.asset.purchaseDate ? dayjs(viewRow.asset.purchaseDate).format('YYYY-MM-DD') : '-'}</Descriptions.Item>
              <Descriptions.Item label="位置">{viewRow.asset.location || '-'}</Descriptions.Item>
              <Descriptions.Item label="成本">{viewRow.asset.cost ?? '-'}</Descriptions.Item>
            </Descriptions>
          )}
        </Modal>

        {/* 新增/编辑弹窗 */}
        <Modal
          title={editingRow ? '编辑设备' : '新增设备'}
          open={isEditVisible}
          onCancel={() => { setIsEditVisible(false); setEditingRow(null); }}
          onOk={handleEditConfirm}
          width={720}
        >
          <Form form={editForm} layout="vertical">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Form.Item name="typeId" label="设备类型" rules={[{ required: true, message: '请选择设备类型' }]}>
                <Select options={typeOptions} placeholder="请选择设备类型" showSearch />
              </Form.Item>
              <Form.Item name="name" label="设备名称" rules={[{ required: true, message: '请输入设备名称' }]}>
                <Input placeholder="如 循环泵1号" />
              </Form.Item>
              <Form.Item name="modelSpec" label="设备型号">
                <Select options={modelOptions} placeholder="选择型号（支持字典）" allowClear showSearch />
              </Form.Item>
              <Form.Item name="brandCode" label="品牌">
                <BrandSelect placeholder="选择品牌" />
              </Form.Item>
              <Form.Item name="supplierName" label="供应商">
                <Select options={supplierOptions} placeholder="选择供应商（支持字典）" allowClear showSearch />
              </Form.Item>
              <Form.Item name="status" label="状态" rules={[{ required: true, message: '请选择状态' }]}>
                <Select
                  options={[
                    { value: '在用', label: '在用' },
                    { value: '闲置', label: '闲置' },
                    { value: '维修', label: '维修' },
                    { value: '报废', label: '报废' },
                  ]}
                />
              </Form.Item>
              <Form.Item name="purchaseDate" label="采购日期">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="location" label="位置">
                <Input />
              </Form.Item>
              <Form.Item name="cost" label="成本">
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </div>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
};

export default EquipmentArchive;