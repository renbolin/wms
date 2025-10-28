import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Form, Input, InputNumber, Select, Space, Tag, message, Descriptions, Row, Col, Statistic, Modal, DatePicker, Layout, Tree, Divider, Upload } from 'antd';
import { SearchOutlined, EyeOutlined, DownloadOutlined, PrinterOutlined, ReloadOutlined, BarChartOutlined, ExportOutlined, ImportOutlined, SwapOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { pickBrandByCode, pickSupplierForBrand } from '../../data/inventoryBrandSupplierMock';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Sider, Content } = Layout;

// 库存信息接口
interface StockInfo {
  id: string;
  itemCode: string;
  itemName: string;
  specification: string;
  unit: string;
  category: string;
  warehouse: string;
  location: string;
  currentStock: number;
  safetyStock: number;
  maxStock: number;
  unitPrice: number;
  totalValue: number;
  lastInDate: string;
  lastOutDate: string;
  brand: string;
  supplier: string;
  status: 'normal' | 'low' | 'out' | 'excess';
  statusText: string;
  batchCount: number;
  ageInDays: number;
  turnoverRate: number;
  abc: 'A' | 'B' | 'C';
  frozen: boolean;
}

const InventoryStock: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<StockInfo[]>([]);
  const [filteredData, setFilteredData] = useState<StockInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<StockInfo | null>(null);
  const [form] = Form.useForm();
  const [selectionMode, setSelectionMode] = useState<'single' | 'multiple'>('multiple');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // 新增单据弹窗表单与显隐状态
  const [isOutModalVisible, setIsOutModalVisible] = useState(false);
  const [outForm] = Form.useForm();
  const [isInModalVisible, setIsInModalVisible] = useState(false);
  const [inForm] = Form.useForm();
  const [isTransferModalVisible, setIsTransferModalVisible] = useState(false);
  const [transferForm] = Form.useForm();
  const [isScrapModalVisible, setIsScrapModalVisible] = useState(false);
  const [scrapForm] = Form.useForm();

  // 明细项结构与状态（用于四类新增弹窗的“选择明细”）
  type DetailItem = {
    code: string;
    name: string;
    specification: string;
    brand?: string;
    supplier?: string;
    unit: string;
    warehouse: string;
    location: string;
    unitPrice: number;
    quantity: number;
    amount: number;
    batchNumber?: string;
  };
  const [detailItems, setDetailItems] = useState<DetailItem[]>([]);

  // 设备类型最小结构（来自设备类型管理），用于联动展示
  type EquipmentTypeItem = {
    id: string;
    name: string;
    category: '设备' | '低值易耗品';
    form: '独立设备' | '附属设备';
    isAsset: boolean;
    attributes: any[];
    assetCount: number;
  };

  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentTypeItem[]>([]);
  const [selectedEquipmentTypeKey, setSelectedEquipmentTypeKey] = useState<string>('all');
  const [equipmentTypeSearchText, setEquipmentTypeSearchText] = useState<string>('');

  // 设备类型关联资产结构（来自设备类型管理）
  type AssetInfo = {
    id: string;
    name: string;
    code: string;
    status: '在用' | '闲置' | '维修中' | '报废';
    department: string;
    purchaseDate: string;
    batchNumber: string;
    location: string;
    borrower: string;
    borrowTime: string;
    specification: string;
    unit: string;
    warehouse: string;
    unitPrice: number;
    brand?: string;
    supplier?: string;
    attributes: Record<string, string>;
  };
  const [assetsByType, setAssetsByType] = useState<Record<string, AssetInfo[]>>({});
  const [assetFiltered, setAssetFiltered] = useState<AssetInfo[]>([]);

  // 当本地没有设备类型资产数据时的兜底高保真数据（与设备类型管理页一致）
  const defaultAssetsByType: Record<string, AssetInfo[]> = {
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
        attributes: { '功率': '7.5kW', '流量': '50m³/h' },
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
        attributes: { '功率': '11kW', '流量': '80m³/h' },
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
        attributes: { '功率': '5.5kW', '流量': '30m³/h' },
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
        attributes: { '换热面积': '200m²' },
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
        attributes: { '换热面积': '150m²' },
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
        attributes: { '检验合格证': '有效', '使用登记证': '有效' },
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
        attributes: { '检验合格证': '有效', '使用登记证': '有效' },
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
        attributes: { '功率': '5.5kW', '流量': '40m³/h' },
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
        attributes: { '功率': '7.5kW', '流量': '55m³/h' },
      },
    ],
  };

  // 模拟数据
  const mockData: StockInfo[] = [
      {
        id: '1',
        itemCode: 'IT001',
        itemName: '联想ThinkPad笔记本',
        specification: 'T14 Gen3 i5-1235U 16G 512G',
        unit: '台',
        category: '办公设备',
        warehouse: '总仓',
        location: 'A-01-01',
        currentStock: 25,
        safetyStock: 10,
        maxStock: 50,
        unitPrice: 6500,
        totalValue: 162500,
        lastInDate: '2024-01-15',
        lastOutDate: '2024-01-20',
        brand: '联想',
        supplier: '联想科技有限公司',
        status: 'normal',
        statusText: '正常',
        batchCount: 3,
        ageInDays: 15,
        turnoverRate: 2.5,
        abc: 'A',
        frozen: false,
      },
      {
        id: '2',
        itemCode: 'OF001',
        itemName: 'A4复印纸',
        specification: '70g 500张/包',
        unit: '包',
        category: '办公用品',
        warehouse: '总仓',
        location: 'B-02-03',
        currentStock: 5,
        safetyStock: 20,
        maxStock: 100,
        unitPrice: 25,
        totalValue: 125,
        lastInDate: '2024-01-10',
        lastOutDate: '2024-01-22',
        brand: '晨光',
        supplier: '晨光文具股份有限公司',
        status: 'low',
        statusText: '库存不足',
        batchCount: 1,
        ageInDays: 25,
        turnoverRate: 4.2,
        abc: 'B',
        frozen: false,
      },
      {
        id: '3',
        itemCode: 'EL001',
        itemName: 'LED显示器',
        specification: '24寸 1080P IPS',
        unit: '台',
        category: '电子设备',
        warehouse: '分仓A',
        location: 'C-01-05',
        currentStock: 0,
        safetyStock: 5,
        maxStock: 30,
        unitPrice: 1200,
        totalValue: 0,
        lastInDate: '2024-01-05',
        lastOutDate: '2024-01-23',
        brand: '戴尔',
        supplier: '戴尔科技有限公司',
        status: 'out',
        statusText: '缺货',
        batchCount: 0,
        ageInDays: 0,
        turnoverRate: 3.8,
        abc: 'A',
        frozen: false,
      },
      {
        id: '4',
        itemCode: 'FU001',
        itemName: '办公桌椅套装',
        specification: '1.2m桌+人体工学椅',
        unit: '套',
        category: '办公家具',
        warehouse: '总仓',
        location: 'D-03-01',
        currentStock: 80,
        safetyStock: 10,
        maxStock: 50,
        unitPrice: 1500,
        totalValue: 120000,
        lastInDate: '2023-12-20',
        lastOutDate: '2024-01-18',
        brand: '震旦',
        supplier: '震旦办公家具',
        status: 'excess',
        statusText: '库存过量',
        batchCount: 2,
        ageInDays: 45,
        turnoverRate: 1.2,
        abc: 'C',
        frozen: false,
      },
      {
        id: '5',
        itemCode: 'ST001',
        itemName: '文件柜',
        specification: '四抽屉钢制文件柜',
        unit: '个',
        category: '办公家具',
        warehouse: '分仓B',
        location: 'E-02-02',
        currentStock: 15,
        safetyStock: 8,
        maxStock: 25,
        unitPrice: 800,
        totalValue: 12000,
        lastInDate: '2024-01-12',
        lastOutDate: '2024-01-21',
        brand: '美时',
        supplier: '美时办公家具',
        status: 'normal',
        statusText: '正常',
        batchCount: 1,
        ageInDays: 20,
        turnoverRate: 2.1,
        abc: 'B',
        frozen: true,
      },
    ];

  useEffect(() => {
    loadData();
  }, []);

  // 加载设备类型的关联资产数据
  useEffect(() => {
    const loadAssets = () => {
      try {
        const saved = localStorage.getItem('equipment_type_assets');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === 'object') {
            // 兼容旧版本地数据：补齐缺失字段；单价缺失用同类型平均价，若无则使用默认值1000
            const normalized: Record<string, AssetInfo[]> = Object.fromEntries(
              Object.entries(parsed as Record<string, any[]>).map(([typeId, arr]) => {
                const list = (arr || []);
                const prices = list
                  .map((x: any) => Number(x?.unitPrice))
                  .filter((v: number) => Number.isFinite(v) && v > 0);
                const avg = prices.length ? prices.reduce((s: number, v: number) => s + v, 0) / prices.length : 0;
                const fallback = avg > 0 ? avg : 1000; // 若无有效价格，则给一个合理的默认估值
                return [
                  typeId,
                  list.map((a: any) => {
                    const brand = (a?.brand ?? '').trim() || pickBrandByCode(a?.code || a?.id || '');
                    const supplier = (a?.supplier ?? '').trim() || pickSupplierForBrand(brand);
                    return {
                      ...a,
                      specification: a?.specification ?? '',
                      unit: a?.unit ?? '',
                      warehouse: a?.warehouse ?? '',
                      location: a?.location ?? '',
                      brand,
                      supplier,
                      unitPrice: (Number.isFinite(Number(a?.unitPrice)) && Number(a?.unitPrice) > 0)
                        ? Number(a?.unitPrice)
                        : fallback,
                    };
                  }),
                ];
              })
            );
            setAssetsByType(normalized);
            try {
              localStorage.setItem('equipment_type_assets', JSON.stringify(normalized));
              window.dispatchEvent(new CustomEvent('equipmentAssetsUpdated'));
            } catch {}
          }
        } else {
          // 本地没有资产数据时，写入兜底高保真数据
          const filledDefault: Record<string, AssetInfo[]> = Object.fromEntries(
            Object.entries(defaultAssetsByType).map(([typeId, arr]) => [
              typeId,
              (arr || []).map((a) => {
                const brand = (a.brand ?? '').trim() || pickBrandByCode(a.code);
                const supplier = (a.supplier ?? '').trim() || pickSupplierForBrand(brand);
                return { ...a, brand, supplier };
              }),
            ])
          );
          localStorage.setItem('equipment_type_assets', JSON.stringify(filledDefault));
          setAssetsByType(filledDefault);
          window.dispatchEvent(new CustomEvent('equipmentAssetsUpdated'));
        }
      } catch (e) {
        // 解析失败时启用兜底数据
        const filledDefault: Record<string, AssetInfo[]> = Object.fromEntries(
          Object.entries(defaultAssetsByType).map(([typeId, arr]) => [
            typeId,
            (arr || []).map((a) => {
              const brand = (a.brand ?? '').trim() || pickBrandByCode(a.code);
              const supplier = (a.supplier ?? '').trim() || pickSupplierForBrand(brand);
              return { ...a, brand, supplier };
            }),
          ])
        );
        localStorage.setItem('equipment_type_assets', JSON.stringify(filledDefault));
        setAssetsByType(filledDefault);
        window.dispatchEvent(new CustomEvent('equipmentAssetsUpdated'));
      }
    };
    loadAssets();
    const handler = () => loadAssets();
    window.addEventListener('equipmentAssetsUpdated', handler);
    return () => window.removeEventListener('equipmentAssetsUpdated', handler);
  }, []);

  // 加载设备类型，并监听设备类型管理页的更新事件
  useEffect(() => {
    const loadEquipmentTypes = () => {
      try {
        const saved = localStorage.getItem('equipment_types');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setEquipmentTypes(parsed as EquipmentTypeItem[]);
          }
        } else {
          // 本地无设备类型缓存时的兜底：提供四个默认类型
          const defaults: EquipmentTypeItem[] = [
            { id: '1', name: '主设备', category: '设备', form: '独立设备', isAsset: true, attributes: [], assetCount: 0 },
            { id: '2', name: '附属设备', category: '设备', form: '附属设备', isAsset: true, attributes: [], assetCount: 0 },
            { id: '3', name: '特种设备', category: '设备', form: '独立设备', isAsset: true, attributes: [], assetCount: 0 },
            { id: '4', name: '非特种设备', category: '设备', form: '独立设备', isAsset: true, attributes: [], assetCount: 0 },
          ];
          setEquipmentTypes(defaults);
        }
      } catch (e) {
        // 忽略解析错误
      }
    };
    loadEquipmentTypes();
    const handler = () => loadEquipmentTypes();
    window.addEventListener('equipmentTypesUpdated', handler);
    return () => window.removeEventListener('equipmentTypesUpdated', handler);
  }, []);

  const loadData = () => {
    setLoading(true);
    // 模拟API调用
    setTimeout(() => {
      setData(mockData);
      setFilteredData(mockData);
      setLoading(false);
    }, 1000);
  };

  // 已移除物料分类树，统一由设备类型树展示

  // 设备类型树（来自设备类型管理）：父级“全部设备类型”，子级为各类型平级
  const getFilteredEquipmentTypeTree = () => {
    const q = equipmentTypeSearchText.trim().toLowerCase();
    const children = equipmentTypes
      .map(t => ({ key: `type:${t.id}`, title: t.name }))
      .filter(n => !q || n.title.toLowerCase().includes(q));
    return [
      { key: 'all', title: '全部设备类型', children },
    ];
  };

  // 递归转换为 Antd Tree 结构
  interface TreeNode {
    key: string;
    title: string;
    children?: TreeNode[];
  }

  const toTreeData = (
    nodes: { key: string; title: string; children?: { key: string; title: string; children?: any[] }[] }[]
  ): TreeNode[] =>
    nodes.map(node => ({
      title: node.title,
      key: node.key,
      children: node.children ? toTreeData(node.children) : undefined,
    }));

  const getAssetStatusColor = (status: string) => {
    const map: Record<string, string> = {
      '在用': 'green',
      '闲置': 'orange',
      '维修中': 'blue',
      '报废': 'red',
    };
    return map[status] || 'default';
  };

  // 搜索功能（资产）
  const handleSearch = (values: any) => {
    let filtered = [...currentAssets];

    if (values.code) {
      filtered = filtered.filter(a => a.code.toLowerCase().includes(values.code.toLowerCase()));
    }
    if (values.name) {
      filtered = filtered.filter(a => a.name.toLowerCase().includes(values.name.toLowerCase()));
    }
    if (values.specification) {
      filtered = filtered.filter(a => (a.specification || '').toLowerCase().includes(values.specification.toLowerCase()));
    }
    if (values.unit) {
      filtered = filtered.filter(a => a.unit === values.unit);
    }
    if (values.warehouse) {
      filtered = filtered.filter(a => a.warehouse === values.warehouse);
    }
    if (values.location) {
      filtered = filtered.filter(a => (a.location || '').toLowerCase().includes(values.location.toLowerCase()));
    }
    if (values.status) {
      filtered = filtered.filter(a => a.status === values.status);
    }
    if (values.batchNumber) {
      filtered = filtered.filter(a => (a.batchNumber || '').toLowerCase().includes(values.batchNumber.toLowerCase()));
    }
    const min = values.unitPriceMin ?? undefined;
    const max = values.unitPriceMax ?? undefined;
    if (min !== undefined) {
      filtered = filtered.filter(a => Number.isFinite(a.unitPrice) && Number(a.unitPrice) >= min);
    }
    if (max !== undefined) {
      filtered = filtered.filter(a => Number.isFinite(a.unitPrice) && Number(a.unitPrice) <= max);
    }

    setAssetFiltered(filtered);
  };

  // 重置搜索（资产）
  const handleReset = () => {
    form.resetFields();
    setAssetFiltered(currentAssets);
  };

  // 查看详情
  const handleViewDetail = (record: StockInfo) => {
    setSelectedRecord(record);
    setIsDetailModalVisible(true);
  };

  // 导出数据
  const handleExport = () => {
    message.success('导出成功');
  };

  // 打印
  const handlePrint = () => {
    message.success('打印成功');
  };

  // 选择与跳转
  // 去除对物料分类的过滤，直接使用查询后的数据集
  const getVisibleList = () => assetFiltered;
  const getSelectedItems = () => getVisibleList().filter(item => selectedRowKeys.includes(item.code));

  const ensureSelection = (actionName: string) => {
    const selected = getSelectedItems();
    if (selected.length === 0) {
      message.warning(`请先选择库存物料后再执行${actionName}`);
      return null;
    }
    return selected;
  };

  // 从当前选择同步明细并计算汇总
  const buildDetailFromSelection = () => {
    const sel = getSelectedItems();
    const map = new Map<string, DetailItem>();
    sel.forEach(a => {
      if (!map.has(a.code)) {
        const price = Number.isFinite(a.unitPrice) ? Number(a.unitPrice) : 0;
        map.set(a.code, {
          code: a.code,
          name: a.name,
          specification: a.specification || '',
          brand: (a as any).brand || '',
          supplier: (a as any).supplier || '',
          unit: a.unit || '',
          warehouse: a.warehouse || '',
          location: a.location || '',
          unitPrice: price,
          quantity: 1,
          amount: price,
          batchNumber: a.batchNumber,
        });
      }
    });
    const items = Array.from(map.values());
    setDetailItems(items);
    return items;
  };

  const calculateTotals = (items: DetailItem[]) => {
    const totalItems = items.length;
    const totalQuantity = items.reduce((s, i) => s + (Number(i.quantity) || 0), 0);
    const totalAmount = items.reduce((s, i) => s + ((Number(i.unitPrice) || 0) * (Number(i.quantity) || 0)), 0);
    return { totalItems, totalQuantity, totalAmount };
  };

  const updateDetailQuantity = (code: string, qty: number) => {
    setDetailItems(prev => {
      const next = prev.map(i => i.code === code ? { ...i, quantity: qty, amount: (Number(i.unitPrice) || 0) * (Number(qty) || 0) } : i);
      if (isOutModalVisible) {
        const t = calculateTotals(next);
        outForm.setFieldsValue({ totalItems: t.totalItems, totalQuantity: t.totalQuantity, totalAmount: t.totalAmount });
      }
      if (isTransferModalVisible) {
        const t = calculateTotals(next);
        transferForm.setFieldsValue({ totalItems: t.totalItems, totalQuantity: t.totalQuantity });
      }
      if (isScrapModalVisible) {
        const t = calculateTotals(next);
        scrapForm.setFieldsValue({ totalItems: t.totalItems, totalQuantity: t.totalQuantity, totalValue: t.totalAmount });
      }
      return next;
    });
  };

  const removeDetailItem = (code: string) => {
    setDetailItems(prev => {
      const next = prev.filter(i => i.code !== code);
      if (isOutModalVisible) {
        const t = calculateTotals(next);
        outForm.setFieldsValue({ totalItems: t.totalItems, totalQuantity: t.totalQuantity, totalAmount: t.totalAmount });
      }
      if (isTransferModalVisible) {
        const t = calculateTotals(next);
        transferForm.setFieldsValue({ totalItems: t.totalItems, totalQuantity: t.totalQuantity });
      }
      if (isScrapModalVisible) {
        const t = calculateTotals(next);
        scrapForm.setFieldsValue({ totalItems: t.totalItems, totalQuantity: t.totalQuantity, totalValue: t.totalAmount });
      }
      return next;
    });
    setSelectedRowKeys(prev => (prev as string[]).filter(k => k !== code));
  };

  // 打开各类新增弹窗
  const openOutModal = () => {
    const selected = ensureSelection('出库');
    if (!selected) return;
    const items = buildDetailFromSelection();
    const s = calculateTotals(items);
    outForm.resetFields();
    outForm.setFieldsValue({ totalItems: s.totalItems, totalQuantity: s.totalQuantity, totalAmount: s.totalAmount });
    setIsOutModalVisible(true);
  };
  const openInModal = () => {
    const selected = ensureSelection('入库');
    if (!selected) return;
    buildDetailFromSelection();
    inForm.resetFields();
    setIsInModalVisible(true);
  };
  const openTransferModal = () => {
    const selected = ensureSelection('调拨');
    if (!selected) return;
    const items = buildDetailFromSelection();
    const s = calculateTotals(items);
    transferForm.resetFields();
    transferForm.setFieldsValue({ totalItems: s.totalItems, totalQuantity: s.totalQuantity });
    setIsTransferModalVisible(true);
  };
  const openScrapModal = () => {
    const selected = ensureSelection('报损报废');
    if (!selected) return;
    const items = buildDetailFromSelection();
    const s = calculateTotals(items);
    scrapForm.resetFields();
    scrapForm.setFieldsValue({ totalItems: s.totalItems, totalQuantity: s.totalQuantity, totalValue: s.totalAmount });
    setIsScrapModalVisible(true);
  };

  // 提交各类新增弹窗
  const submitOut = async () => {
    try {
      await outForm.validateFields();
      if (!detailItems.length) { message.warning('请在“选择明细”中添加资产'); return; }
      const codes = detailItems.map(i => i.code);
      if (new Set(codes).size !== codes.length) { message.error('存在重复资产编码，请检查明细'); return; }
      message.success('已创建出库单');
      setIsOutModalVisible(false);
      outForm.resetFields();
    } catch {}
  };
  const submitIn = async () => {
    try {
      await inForm.validateFields();
      if (!detailItems.length) { message.warning('请在“选择明细”中添加资产'); return; }
      const codes = detailItems.map(i => i.code);
      if (new Set(codes).size !== codes.length) { message.error('存在重复资产编码，请检查明细'); return; }
      message.success('已创建入库单');
      setIsInModalVisible(false);
      inForm.resetFields();
    } catch {}
  };
  const submitTransfer = async () => {
    try {
      await transferForm.validateFields();
      if (!detailItems.length) { message.warning('请在“选择明细”中添加资产'); return; }
      const codes = detailItems.map(i => i.code);
      if (new Set(codes).size !== codes.length) { message.error('存在重复资产编码，请检查明细'); return; }
      message.success('已创建调拨单');
      setIsTransferModalVisible(false);
      transferForm.resetFields();
    } catch {}
  };
  const submitScrap = async () => {
    try {
      await scrapForm.validateFields();
      if (!detailItems.length) { message.warning('请在“选择明细”中添加资产'); return; }
      const codes = detailItems.map(i => i.code);
      if (new Set(codes).size !== codes.length) { message.error('存在重复资产编码，请检查明细'); return; }
      message.success('已创建报损报废单');
      setIsScrapModalVisible(false);
      scrapForm.resetFields();
    } catch {}
  };

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'green';
      case 'low': return 'orange';
      case 'out': return 'red';
      case 'excess': return 'blue';
      default: return 'default';
    }
  };

  // 获取ABC分类颜色
  const getAbcColor = (abc: string) => {
    switch (abc) {
      case 'A': return 'red';
      case 'B': return 'orange';
      case 'C': return 'green';
      default: return 'default';
    }
  };

  // 表格列定义
  const columns: ColumnsType<StockInfo> = [
    {
      title: '物料编码',
      dataIndex: 'itemCode',
      key: 'itemCode',
      width: 120,
      fixed: 'left',
    },
    {
      title: '物料名称',
      dataIndex: 'itemName',
      key: 'itemName',
      width: 200,
      fixed: 'left',
    },
    {
      title: '规格型号',
      dataIndex: 'specification',
      key: 'specification',
      width: 180,
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      width: 60,
      align: 'center',
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
    },
    {
      title: '仓库',
      dataIndex: 'warehouse',
      key: 'warehouse',
      width: 100,
    },
    {
      title: '库位',
      dataIndex: 'location',
      key: 'location',
      width: 100,
    },
    {
      title: '当前库存',
      dataIndex: 'currentStock',
      key: 'currentStock',
      width: 100,
      align: 'right',
      render: (value, record) => (
        <span style={{ 
          color: record.status === 'low' || record.status === 'out' ? '#ff4d4f' : 
                 record.status === 'excess' ? '#1890ff' : '#000',
          fontWeight: 'bold'
        }}>
          {value}
        </span>
      ),
    },
    {
      title: '安全库存',
      dataIndex: 'safetyStock',
      key: 'safetyStock',
      width: 100,
      align: 'right',
    },
    {
      title: '最大库存',
      dataIndex: 'maxStock',
      key: 'maxStock',
      width: 100,
      align: 'right',
    },
    {
      title: '单价',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 100,
      align: 'right',
      render: (value) => Number(value).toLocaleString(),
    },
    {
      title: '库存金额',
      dataIndex: 'totalValue',
      key: 'totalValue',
      width: 120,
      align: 'right',
      render: (value) => Number(value).toLocaleString(),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (value, record) => (
        <Tag color={getStatusColor(value)}>{record.statusText}</Tag>
      ),
    },
    {
      title: 'ABC分类',
      dataIndex: 'abc',
      key: 'abc',
      width: 80,
      align: 'center',
      render: (value) => (
        <Tag color={getAbcColor(value)}>{value}</Tag>
      ),
    },
    {
      title: '批次数',
      dataIndex: 'batchCount',
      key: 'batchCount',
      width: 80,
      align: 'center',
    },
    {
      title: '库龄(天)',
      dataIndex: 'ageInDays',
      key: 'ageInDays',
      width: 100,
      align: 'right',
    },
    {
      title: '周转率',
      dataIndex: 'turnoverRate',
      key: 'turnoverRate',
      width: 100,
      align: 'right',
      render: (value) => value.toFixed(1),
    },
    {
      title: '冻结',
      dataIndex: 'frozen',
      key: 'frozen',
      width: 80,
      align: 'center',
      render: (value) => (
        <Tag color={value ? 'red' : 'green'}>
          {value ? '已冻结' : '正常'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
        </Space>
      ),
    },
  ];

  // 计算统计数据
  const totalItems = assetFiltered.length;
  const totalValue = assetFiltered.reduce((sum, a) => (
    Number.isFinite(a.unitPrice) ? sum + Number(a.unitPrice) : sum
  ), 0);
  const inUseCount = assetFiltered.filter(a => a.status === '在用').length;
  const maintCount = assetFiltered.filter(a => a.status === '维修中').length;

  // 当前选中设备类型的关联资产与列定义
  const selectedTypeId = selectedEquipmentTypeKey.startsWith('type:')
    ? selectedEquipmentTypeKey.split(':')[1]
    : '';
  const selectedType = equipmentTypes.find(t => t.id === selectedTypeId);
  // 当选择“全部设备类型”时，汇总所有子级资产
  const currentAssets: AssetInfo[] = selectedTypeId
    ? (assetsByType[selectedTypeId] || [])
    : Object.values(assetsByType).reduce<AssetInfo[]>((acc, list) => acc.concat(list || []), []);
  
  // 当类型或数据变化时，重置资产过滤结果
  useEffect(() => {
    setAssetFiltered(currentAssets);
  }, [selectedTypeId, assetsByType]);

  const assetColumns: ColumnsType<AssetInfo> = [
    { title: '资产编码', dataIndex: 'code', key: 'code', width: 140, fixed: 'left' },
    { title: '资产名称', dataIndex: 'name', key: 'name', width: 160 },
    { title: '规格型号', dataIndex: 'specification', key: 'specification', width: 140 },
    { title: '品牌', dataIndex: 'brand', key: 'brand', width: 120 },
    { title: '供应商', dataIndex: 'supplier', key: 'supplier', width: 160 },
    { title: '单位', dataIndex: 'unit', key: 'unit', width: 80 },
    { title: '所在仓库', dataIndex: 'warehouse', key: 'warehouse', width: 140 },
    { title: '库位', dataIndex: 'location', key: 'location', width: 140 },
    { title: '单价', dataIndex: 'unitPrice', key: 'unitPrice', width: 100, render: (v: any) => (Number.isFinite(v) ? Number(v).toLocaleString() : '-') },
    { title: '状态', dataIndex: 'status', key: 'status', width: 100, render: (s: string) => <Tag color={getAssetStatusColor(s)}>{s}</Tag> },
    { title: '批次号', dataIndex: 'batchNumber', key: 'batchNumber', width: 160 },
    { title: '使用部门', dataIndex: 'department', key: 'department', width: 140 },
    { title: '购置日期', dataIndex: 'purchaseDate', key: 'purchaseDate', width: 120 },
    { title: '借用人', dataIndex: 'borrower', key: 'borrower', width: 100 },
    { title: '借用时间', dataIndex: 'borrowTime', key: 'borrowTime', width: 140 },
  ];

  const detailColumns: ColumnsType<DetailItem> = [
    { title: '资产编码', dataIndex: 'code', key: 'code', width: 140, fixed: 'left' },
    { title: '资产名称', dataIndex: 'name', key: 'name', width: 160 },
    { title: '规格型号', dataIndex: 'specification', key: 'specification', width: 140 },
    { title: '品牌', dataIndex: 'brand', key: 'brand', width: 120 },
    { title: '供应商', dataIndex: 'supplier', key: 'supplier', width: 160 },
    { title: '单位', dataIndex: 'unit', key: 'unit', width: 80 },
    { title: '所在仓库', dataIndex: 'warehouse', key: 'warehouse', width: 140 },
    { title: '库位', dataIndex: 'location', key: 'location', width: 120 },
    { title: '单价', dataIndex: 'unitPrice', key: 'unitPrice', width: 100, render: (v: number) => (Number.isFinite(v) ? Number(v).toLocaleString() : '-') },
    { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 120, render: (v: number, record) => (
      <InputNumber min={1} value={v} onChange={(val) => updateDetailQuantity(record.code, Number(val) || 1)} />
    ) },
    { title: '金额', dataIndex: 'amount', key: 'amount', width: 120, render: (v: number) => (Number.isFinite(v) ? Number(v).toLocaleString() : '-') },
    { title: '操作', key: 'action', width: 100, fixed: 'right', render: (_, record) => (
      <Button type="link" danger onClick={() => removeDetailItem(record.code)}>移除</Button>
    ) },
  ];

  return (
    <Layout>
      <Sider width={260} style={{ background: '#fff', padding: 16 }}>
        <div style={{ marginBottom: 12, fontWeight: 600 }}>设备类型</div>
        <Input
          placeholder="搜索设备类型"
          value={equipmentTypeSearchText}
          onChange={(e) => setEquipmentTypeSearchText(e.target.value)}
          style={{ marginBottom: 8 }}
        />
        <Tree
          defaultExpandedKeys={['all']}
          treeData={toTreeData(getFilteredEquipmentTypeTree())}
          onSelect={(keys) => setSelectedEquipmentTypeKey((keys[0] as string) || 'all')}
        />
        {/* 移除左侧关联资产统计卡片 */}
      </Sider>
      <Content style={{ padding: 16 }}>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="资产总数"
              value={totalItems}
              suffix="项"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="资产总值"
              value={totalValue}
              precision={0}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="在用数量"
              value={inUseCount}
              suffix="项"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="维修中数量"
              value={maintCount}
              suffix="项"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="资产列表" extra={
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => window.dispatchEvent(new CustomEvent('equipmentAssetsUpdated'))}>刷新</Button>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>
            导出
          </Button>
          <Button icon={<PrinterOutlined />} onClick={handlePrint}>
            打印
          </Button>
          <Button 
            icon={<BarChartOutlined />} 
            onClick={() => window.open('/inventory/age-analysis', '_blank')}
          >
            库龄分析
          </Button>
        </Space>
      }>
        {/* 搜索表单（资产） */}
        <Form
          form={form}
          layout="inline"
          onFinish={handleSearch}
          style={{ marginBottom: 16 }}
        >
          <Form.Item name="code" label="资产编号">
            <Input placeholder="请输入资产编号" style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="name" label="资产名称">
            <Input placeholder="请输入资产名称" style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="specification" label="规格型号">
            <Input placeholder="请输入规格型号" style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="unit" label="单位">
            <Select placeholder="请选择单位" style={{ width: 120 }} allowClear>
              <Option value="台">台</Option>
              <Option value="套">套</Option>
              <Option value="个">个</Option>
            </Select>
          </Form.Item>
          <Form.Item name="warehouse" label="所在仓库">
            <Select placeholder="请选择仓库" style={{ width: 160 }} allowClear>
              <Option value="设备库房">设备库房</Option>
              <Option value="特种设备仓库">特种设备仓库</Option>
              <Option value="一号换热站主机房">一号换热站主机房</Option>
              <Option value="二号换热站主机房">二号换热站主机房</Option>
            </Select>
          </Form.Item>
          <Form.Item name="location" label="库位">
            <Input placeholder="请输入库位" style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择状态" style={{ width: 120 }} allowClear>
              <Option value="在用">在用</Option>
              <Option value="闲置">闲置</Option>
              <Option value="维修中">维修中</Option>
              <Option value="报废">报废</Option>
            </Select>
          </Form.Item>
          <Form.Item name="batchNumber" label="批次号">
            <Input placeholder="请输入批次号" style={{ width: 160 }} />
          </Form.Item>
          <Form.Item label="单价区间" style={{ marginRight: 0 }}>
            <Space>
              <Form.Item name="unitPriceMin" noStyle>
                <InputNumber placeholder="最小" style={{ width: 100 }} min={0} />
              </Form.Item>
              <Form.Item name="unitPriceMax" noStyle>
                <InputNumber placeholder="最大" style={{ width: 100 }} min={0} />
              </Form.Item>
            </Space>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                搜索
              </Button>
              <Button onClick={handleReset}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>

        {/* 操作与数据表格 */}
        <Space style={{ marginBottom: 12 }}>
          <Button type="primary" icon={<ExportOutlined />} onClick={openOutModal}>出库</Button>
          <Button type="primary" icon={<ImportOutlined />} onClick={openInModal}>入库</Button>
          <Button type="primary" icon={<SwapOutlined />} onClick={openTransferModal}>调拨</Button>
          <Button danger icon={<DeleteOutlined />} onClick={openScrapModal}>报损报废</Button>
        </Space>
        <Table
          columns={assetColumns}
          dataSource={assetFiltered}
          rowKey="code"
          loading={loading}
          scroll={{ x: 1600 }}
          rowSelection={{
            type: selectionMode === 'single' ? 'radio' : 'checkbox',
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(Array.from(new Set(keys as React.Key[]))),
          }}
          pagination={{
            total: assetFiltered.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      {/* 新增出库单弹窗 */}
      <Modal
        title="新增出库单"
        open={isOutModalVisible}
        onCancel={() => setIsOutModalVisible(false)}
        onOk={submitOut}
        width={800}
      >
        <Form form={outForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="type" label="出库类型" rules={[{ required: true, message: '请选择出库类型' }]}> 
                <Select placeholder="请选择出库类型">
                  <Option value="normal">普通出库</Option>
                  <Option value="transfer">调拨出库</Option>
                  <Option value="return">退库出库</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="warehouse" label="仓库" rules={[{ required: true, message: '请选择仓库' }]}> 
                <Select placeholder="请选择仓库">
                  <Option value="主仓库">主仓库</Option>
                  <Option value="分仓库">分仓库</Option>
                  <Option value="临时仓库">临时仓库</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.type !== cur.type}>
            {({ getFieldValue }) => getFieldValue('type') === 'transfer' ? (
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="targetWarehouse" label="目标仓库" rules={[{ required: true, message: '请选择目标仓库' }]}> 
                    <Select placeholder="请选择目标仓库">
                      <Option value="主仓库">主仓库</Option>
                      <Option value="分仓库">分仓库</Option>
                      <Option value="临时仓库">临时仓库</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="targetWarehouseName" label="目标库位"> 
                    <Input placeholder="请输入目标库位" />
                  </Form.Item>
                </Col>
              </Row>
            ) : null}
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="applicant" label="申请人" rules={[{ required: true, message: '请输入申请人' }]}> 
                <Input placeholder="请输入申请人" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="department" label="部门"> 
                <Input placeholder="请输入部门" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="purpose" label="用途"> 
                <Input placeholder="请输入用途" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="applyDate" label="申请日期" rules={[{ required: true, message: '请选择申请日期' }]}> 
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="outboundDate" label="出库日期"> 
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="totalItems" label="物料种类"> 
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="totalQuantity" label="总数量"> 
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="totalAmount" label="总金额"> 
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="remarks" label="备注"> 
            <Input.TextArea rows={2} placeholder="请输入备注信息" />
          </Form.Item>
          <Divider orientation="left">选择明细</Divider>
          <Table
            columns={detailColumns}
            dataSource={detailItems}
            rowKey="code"
            size="small"
            pagination={false}
            scroll={{ x: 1000 }}
          />
        </Form>
      </Modal>

      {/* 新增入库单弹窗 */}
      <Modal
        title="新增入库单"
        open={isInModalVisible}
        onCancel={() => setIsInModalVisible(false)}
        onOk={submitIn}
        width={800}
      >
        <Form form={inForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="type" label="入库类型" rules={[{ required: true, message: '请选择入库类型' }]}> 
                <Select placeholder="请选择入库类型">
                  <Option value="purchase">采购入库</Option>
                  <Option value="transfer">调拨入库</Option>
                  <Option value="return">退库入库</Option>
                  <Option value="other">其他入库</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="sourceNo" label="来源单号"> 
                <Input placeholder="请输入来源单号" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="warehouse" label="仓库" rules={[{ required: true, message: '请选择仓库' }]}> 
                <Select placeholder="请选择仓库">
                  <Option value="主仓库">主仓库</Option>
                  <Option value="分仓库">分仓库</Option>
                  <Option value="临时仓库">临时仓库</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="warehouseName" label="库位"> 
                <Input placeholder="请输入库位" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="applicant" label="申请人" rules={[{ required: true, message: '请输入申请人' }]}> 
                <Input placeholder="请输入申请人" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="priority" label="优先级"> 
                <Select placeholder="请选择优先级">
                  <Option value="low">低</Option>
                  <Option value="medium">中</Option>
                  <Option value="high">高</Option>
                  <Option value="urgent">紧急</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="applyDate" label="申请日期" rules={[{ required: true, message: '请选择申请日期' }]}> 
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="inboundDate" label="入库日期"> 
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="remarks" label="备注"> 
            <Input.TextArea rows={2} placeholder="请输入备注信息" />
          </Form.Item>
          <Divider orientation="left">选择明细</Divider>
          <Table
            columns={detailColumns}
            dataSource={detailItems}
            rowKey="code"
            size="small"
            pagination={false}
            scroll={{ x: 1000 }}
          />
        </Form>
      </Modal>

      {/* 新增调拨单弹窗 */}
      <Modal
        title="新增调拨单"
        open={isTransferModalVisible}
        onCancel={() => setIsTransferModalVisible(false)}
        onOk={submitTransfer}
        width={800}
      >
        <Form form={transferForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="fromWarehouse" label="调出仓库" rules={[{ required: true, message: '请选择调出仓库' }]}> 
                <Select placeholder="请选择调出仓库">
                  <Option value="主仓库">主仓库</Option>
                  <Option value="分仓库">分仓库</Option>
                  <Option value="临时仓库">临时仓库</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="toWarehouse" label="调入仓库" rules={[{ required: true, message: '请选择调入仓库' }]}> 
                <Select placeholder="请选择调入仓库">
                  <Option value="主仓库">主仓库</Option>
                  <Option value="分仓库">分仓库</Option>
                  <Option value="临时仓库">临时仓库</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="applicant" label="申请人" rules={[{ required: true, message: '请输入申请人' }]}> 
                <Input placeholder="请输入申请人" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="department" label="部门"> 
                <Input placeholder="请输入部门" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="applyDate" label="申请日期" rules={[{ required: true, message: '请选择申请日期' }]}> 
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="priority" label="优先级"> 
                <Select placeholder="请选择优先级">
                  <Option value="low">低</Option>
                  <Option value="medium">中</Option>
                  <Option value="high">高</Option>
                  <Option value="urgent">紧急</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="purpose" label="调拨目的"> 
                <Input placeholder="请输入调拨目的" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="totalItems" label="物料种类"> 
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="totalQuantity" label="总数量"> 
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="remarks" label="备注"> 
            <Input.TextArea rows={2} placeholder="请输入备注信息" />
          </Form.Item>
          <Divider orientation="left">选择明细</Divider>
          <Table
            columns={detailColumns}
            dataSource={detailItems}
            rowKey="code"
            size="small"
            pagination={false}
            scroll={{ x: 1000 }}
          />
        </Form>
      </Modal>

      {/* 新增报损报废单弹窗 */}
      <Modal
        title="新增报损报废单"
        open={isScrapModalVisible}
        onCancel={() => setIsScrapModalVisible(false)}
        onOk={submitScrap}
        width={800}
      >
        <Form form={scrapForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="type" label="类型" rules={[{ required: true, message: '请选择类型' }]}> 
                <Select placeholder="请选择类型">
                  <Option value="damage">报损</Option>
                  <Option value="scrap">报废</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="warehouse" label="仓库" rules={[{ required: true, message: '请选择仓库' }]}> 
                <Select placeholder="请选择仓库">
                  <Option value="主仓库">主仓库</Option>
                  <Option value="分仓库">分仓库</Option>
                  <Option value="临时仓库">临时仓库</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="applicant" label="申请人" rules={[{ required: true, message: '请输入申请人' }]}> 
                <Input placeholder="请输入申请人" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="applyDate" label="申请日期" rules={[{ required: true, message: '请选择申请日期' }]}> 
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="totalItems" label="物料种类"> 
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="totalQuantity" label="总数量"> 
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="totalValue" label="总金额"> 
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="reason" label="原因" rules={[{ required: true, message: '请输入原因' }]}> 
            <Input.TextArea rows={2} placeholder="请输入报损报废原因" />
          </Form.Item>
          <Form.Item name="remarks" label="备注"> 
            <Input.TextArea rows={2} placeholder="请输入备注信息" />
          </Form.Item>
          <Form.Item name="attachments" label="附件"> 
            <Upload>
              <Button icon={<UploadOutlined />}>上传附件</Button>
            </Upload>
          </Form.Item>
          <Divider orientation="left">选择明细</Divider>
          <Table
            columns={detailColumns}
            dataSource={detailItems}
            rowKey="code"
            size="small"
            pagination={false}
            scroll={{ x: 1000 }}
          />
        </Form>
      </Modal>

      {/* 已移除右侧设备类型关联资产展示卡片与抽屉 */}

      {/* 抽屉已删除，资产列表改为右侧主列表 */}

      {/* 详情模态框 */}
      <Modal
        title="库存详情"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedRecord && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="物料编码">{selectedRecord.itemCode}</Descriptions.Item>
              <Descriptions.Item label="物料名称">{selectedRecord.itemName}</Descriptions.Item>
              <Descriptions.Item label="规格型号" span={2}>{selectedRecord.specification}</Descriptions.Item>
              <Descriptions.Item label="单位">{selectedRecord.unit}</Descriptions.Item>
              <Descriptions.Item label="分类">{selectedRecord.category}</Descriptions.Item>
              <Descriptions.Item label="仓库">{selectedRecord.warehouse}</Descriptions.Item>
              <Descriptions.Item label="库位">{selectedRecord.location}</Descriptions.Item>
              <Descriptions.Item label="当前库存">
                <span style={{ 
                  color: selectedRecord.status === 'low' || selectedRecord.status === 'out' ? '#ff4d4f' : 
                         selectedRecord.status === 'excess' ? '#1890ff' : '#000',
                  fontWeight: 'bold'
                }}>
                  {selectedRecord.currentStock}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="安全库存">{selectedRecord.safetyStock}</Descriptions.Item>
              <Descriptions.Item label="最大库存">{selectedRecord.maxStock}</Descriptions.Item>
              <Descriptions.Item label="单价">{Number(selectedRecord.unitPrice).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="库存金额">{Number(selectedRecord.totalValue).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={getStatusColor(selectedRecord.status)}>{selectedRecord.statusText}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="ABC分类">
                <Tag color={getAbcColor(selectedRecord.abc)}>{selectedRecord.abc}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="批次数量">{selectedRecord.batchCount}</Descriptions.Item>
              <Descriptions.Item label="库龄">{selectedRecord.ageInDays} 天</Descriptions.Item>
              <Descriptions.Item label="周转率">{selectedRecord.turnoverRate.toFixed(1)}</Descriptions.Item>
              <Descriptions.Item label="冻结状态">
                <Tag color={selectedRecord.frozen ? 'red' : 'green'}>
                  {selectedRecord.frozen ? '已冻结' : '正常'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="最后入库日期">{selectedRecord.lastInDate}</Descriptions.Item>
              <Descriptions.Item label="最后出库日期">{selectedRecord.lastOutDate}</Descriptions.Item>
              <Descriptions.Item label="品牌">{selectedRecord.brand}</Descriptions.Item>
              <Descriptions.Item label="主要供应商" span={2}>{selectedRecord.supplier}</Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
      </Content>
    </Layout>
  );
};

export default InventoryStock;