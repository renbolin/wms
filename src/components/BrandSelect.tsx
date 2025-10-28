import React, { useEffect, useMemo, useState } from 'react';
import { Select } from 'antd';

interface BrandOption {
  value: string; // brandCode
  label: string; // brandName
  manufacturer?: string;
}

interface Props {
  value?: string;
  onChange?: (code: string, meta?: { brandName: string; manufacturer?: string }) => void;
  style?: React.CSSProperties;
  allowClear?: boolean;
  placeholder?: string;
}

const STORAGE_KEY = 'basic_brand_dict';

const BrandSelect: React.FC<Props> = ({ value, onChange, style, allowClear = true, placeholder = '选择品牌' }) => {
  const [options, setOptions] = useState<BrandOption[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const arr = JSON.parse(raw) as any[];
      const enabled = arr.filter(b => b.status === 'enabled');
      setOptions(enabled.map(b => ({ value: b.brandCode, label: b.brandName, manufacturer: b.manufacturer })));
    } catch {
      // ignore
    }
  }, []);

  const handleChange = (code: string) => {
    const found = options.find(o => o.value === code);
    onChange?.(code, found ? { brandName: found.label, manufacturer: found.manufacturer } : undefined);
  };

  return (
    <Select
      showSearch
      allowClear={allowClear}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      options={options}
      style={style}
      filterOption={(input, option) => {
        const label = (option?.label as string) || '';
        const val = (option?.value as string) || '';
        return label.toLowerCase().includes(input.toLowerCase()) || val.toLowerCase().includes(input.toLowerCase());
      }}
    />
  );
};

export default BrandSelect;