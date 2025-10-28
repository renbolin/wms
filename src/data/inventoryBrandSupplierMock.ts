// 热设备行业品牌与供应商 Mock 数据
// 可用于库存管理页在缺失品牌/供应商时进行自动填充

export const heatEquipmentBrands: string[] = [
  '海尔Haier',
  '美的Midea',
  '格力Gree',
  '博世Bosch',
  '西门子Siemens',
  '林内Rinnai',
  '万和Vanward',
  '万家乐Macro',
  'A.O.史密斯AOSmith',
  '阿里斯顿Ariston',
  '威能Vaillant',
  '日立Hitachi',
  '东芝Toshiba',
  '菲斯曼Viessmann',
  '大金Daikin',
];

export type HeatSupplier = {
  supplierName: string;
  relatedBrands: string[];
};

export const heatEquipmentSuppliers: HeatSupplier[] = [
  { supplierName: '北京远大锅炉设备有限公司', relatedBrands: ['博世Bosch', '菲斯曼Viessmann'] },
  { supplierName: '上海阳光太阳能热水器有限公司', relatedBrands: ['阿里斯顿Ariston'] },
  { supplierName: '广东万和热力工程有限公司', relatedBrands: ['万和Vanward', '万家乐Macro'] },
  { supplierName: '浙江西门子暖通设备有限公司', relatedBrands: ['西门子Siemens'] },
  { supplierName: '山东格力热泵设备有限公司', relatedBrands: ['格力Gree', '美的Midea', '大金Daikin'] },
  { supplierName: '四川林内热泵设备有限公司', relatedBrands: ['林内Rinnai'] },
  { supplierName: '重庆美的暖气片设备有限公司', relatedBrands: ['美的Midea', '格力Gree'] },
  { supplierName: '河南海尔管道系统有限公司', relatedBrands: ['海尔Haier', '西门子Siemens'] },
  { supplierName: '湖北威能锅炉设备有限公司', relatedBrands: ['威能Vaillant'] },
  { supplierName: '河北阿里斯顿太阳能热水器有限公司', relatedBrands: ['阿里斯顿Ariston', 'A.O.史密斯AOSmith', '林内Rinnai'] },
  { supplierName: '天津A.O.史密斯暖气片设备有限公司', relatedBrands: ['A.O.史密斯AOSmith', '阿里斯顿Ariston'] },
  { supplierName: '福建菲斯曼锅炉设备有限公司', relatedBrands: ['博世Bosch', '菲斯曼Viessmann', '威能Vaillant'] },
  { supplierName: '安徽万家乐暖气片设备有限公司', relatedBrands: ['海尔Haier', '万和Vanward', '万家乐Macro'] },
  { supplierName: '辽宁东芝热泵设备有限公司', relatedBrands: ['日立Hitachi', '东芝Toshiba', '大金Daikin'] },
  { supplierName: '吉林日立热泵设备有限公司', relatedBrands: ['日立Hitachi', '东芝Toshiba', '大金Daikin'] },
  { supplierName: '云南西门子管道系统有限公司', relatedBrands: ['西门子Siemens'] },
  { supplierName: '陕西格力暖气片设备有限公司', relatedBrands: ['格力Gree'] },
  { supplierName: '山西美的管道系统有限公司', relatedBrands: ['美的Midea'] },
  { supplierName: '广西海尔太阳能热水器有限公司', relatedBrands: ['海尔Haier'] },
  { supplierName: '黑龙江阿里斯顿锅炉设备有限公司', relatedBrands: ['阿里斯顿Ariston', 'A.O.史密斯AOSmith', '林内Rinnai'] },
  { supplierName: '内蒙古威能管道系统有限公司', relatedBrands: ['威能Vaillant', '菲斯曼Viessmann', '博世Bosch'] },
  { supplierName: '宁夏万和太阳能热水器有限公司', relatedBrands: ['万和Vanward', '万家乐Macro'] },
  { supplierName: '海南林内暖气片设备有限公司', relatedBrands: ['林内Rinnai', 'A.O.史密斯AOSmith'] },
  { supplierName: '青海大金热泵设备有限公司', relatedBrands: ['日立Hitachi', '东芝Toshiba', '大金Daikin'] },
];

// 根据资产编码稳定选择一个品牌
export const pickBrandByCode = (code: string): string => {
  const hash = [...(code || 'CODE')].reduce((h, c) => (h * 33 + c.charCodeAt(0)) >>> 0, 5381);
  return heatEquipmentBrands[hash % heatEquipmentBrands.length];
};

// 为指定品牌选择一个授权供应商
export const pickSupplierForBrand = (brand: string): string => {
  const candidates = heatEquipmentSuppliers.filter(s => s.relatedBrands.includes(brand));
  if (candidates.length > 0) return candidates[0].supplierName;
  // 若没有明确授权关系，回退到稳定选择
  const hash = [...(brand || 'BRAND')].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 1315423911);
  return heatEquipmentSuppliers[hash % heatEquipmentSuppliers.length].supplierName;
};