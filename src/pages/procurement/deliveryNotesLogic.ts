import dayjs from 'dayjs';
import type { DeliveryNote, DeliveryItem } from '../../types/procurement';

export type ReceiveStatus = 'pending' | 'received' | 'rejected' | undefined;

export interface ReceiveFormValues {
  deliveryNo?: string;
  receivedDate?: any; // dayjs instance
  receiver?: string;
  department?: string;
  remarks?: string;
}

export function getStatusColor(status: DeliveryNote['status']): string {
  const colorMap: Record<DeliveryNote['status'], string> = {
    pending_receive: 'orange',      // 待接收
    pending_inspection: 'cyan',     // 待验收
    pending_archive: 'purple',      // 待建档
    pending_warehouse: 'blue',      // 待入库/分配
    completed: 'green',             // 已完成
    rejected: 'red',                // 已拒绝
  } as const;
  return colorMap[status] || 'default';
}

function normalize(str?: string): string {
  return (str || '').toLowerCase().trim();
}

export function validateHeaderForm(values: ReceiveFormValues): string[] {
  const errors: string[] = [];
  if (!values.receivedDate || !dayjs(values.receivedDate).isValid()) {
    errors.push('接收日期无效或未填写');
  }
  if (!values.receiver || values.receiver.trim() === '') {
    errors.push('接收人不能为空');
  }
  if (!values.department || values.department.trim() === '') {
    errors.push('部门不能为空');
  }
  return errors;
}

export interface ReceiveValidationResult {
  errors: string[];
  updatedItems: DeliveryItem[];
  summary: {
    receivedCount: number;
    rejectedCount: number;
  };
}

export function validateReceiveItems(
  record: DeliveryNote,
  itemReceiveQuantities: Record<string, number>,
  itemReceiveStatus: Record<string, ReceiveStatus>
): ReceiveValidationResult {
  const errors: string[] = [];
  const updatedItems: DeliveryItem[] = [];
  let receivedCount = 0;
  let rejectedCount = 0;

  for (const item of record.items || []) {
    const qty = Number(itemReceiveQuantities[item.id] ?? 0);
    const status = itemReceiveStatus[item.id];

    if (!status) {
      errors.push(`【${item.itemName}】未选择接收状态`);
      continue;
    }
    if (qty < 0 || Number.isNaN(qty)) {
      errors.push(`【${item.itemName}】接收数量无效`);
      continue;
    }
    if (status === 'received') {
      if (qty === 0) {
        errors.push(`【${item.itemName}】选择“接收”时数量必须大于0`);
        continue;
      }
      if (qty > (item.deliveredQuantity || 0)) {
        errors.push(`【${item.itemName}】接收数量不能超过到货数量(${item.deliveredQuantity || 0})`);
        continue;
      }
    }
    if (status === 'rejected') {
      if (qty !== 0) {
        errors.push(`【${item.itemName}】选择“拒收”时数量必须为0`);
        continue;
      }
    }

    const updated: DeliveryItem = {
      ...item,
      receivedQuantity: status === 'received' ? qty : 0,
    };
    updatedItems.push(updated);
    if (status === 'received') receivedCount++;
    if (status === 'rejected') rejectedCount++;
  }

  return { errors, updatedItems, summary: { receivedCount, rejectedCount } };
}

export interface FilterValues {
  deliveryNo?: string;
  purchaseOrderNo?: string;
  supplierName?: string;
  supplierContact?: string;
  supplierPhone?: string;
  receiver?: string;
  department?: string;
  status?: DeliveryNote['status'];
  deliveryDateRange?: [any, any];
  receivedDateRange?: [any, any];
  totalAmountRange?: [number | undefined, number | undefined];
  carrier?: string;
  trackingNo?: string;
  remarks?: string;
}

export function validateAmountRange(min?: number, max?: number): string | null {
  if (min != null && min < 0) return '最小金额不能为负数';
  if (max != null && max < 0) return '最大金额不能为负数';
  if (min != null && max != null && min > max) return '金额范围不合法：最小金额大于最大金额';
  return null;
}

export function filterDeliveryNotes(data: DeliveryNote[], values: FilterValues): DeliveryNote[] {
  let filtered = [...data];

  if (values.deliveryNo) {
    const q = normalize(values.deliveryNo);
    filtered = filtered.filter(item => normalize(item.deliveryNo).includes(q));
  }
  if (values.purchaseOrderNo) {
    const q = normalize(values.purchaseOrderNo);
    filtered = filtered.filter(item => normalize(item.purchaseOrderNo).includes(q));
  }
  if (values.supplierName) {
    const q = normalize(values.supplierName);
    filtered = filtered.filter(item => normalize(item.supplierName).includes(q));
  }
  if (values.supplierContact) {
    const q = normalize(values.supplierContact);
    filtered = filtered.filter(item => normalize(item.supplierContact).includes(q));
  }
  if (values.supplierPhone) {
    const q = normalize(values.supplierPhone);
    filtered = filtered.filter(item => normalize(item.supplierPhone).includes(q));
  }
  if (values.receiver) {
    const q = normalize(values.receiver);
    filtered = filtered.filter(item => normalize(item.receiver).includes(q));
  }
  if (values.department) {
    const q = normalize(values.department);
    filtered = filtered.filter(item => normalize(item.department).includes(q));
  }
  if (values.status) {
    filtered = filtered.filter(item => item.status === values.status);
  }

  // 日期范围
  if (values.deliveryDateRange && values.deliveryDateRange.length === 2) {
    const [startDate, endDate] = values.deliveryDateRange;
    if (startDate && endDate && dayjs(endDate).isBefore(startDate)) {
      // 交换，避免用户颠倒
      filtered = filtered.filter(item => {
        const d = dayjs(item.deliveryDate);
        return d.isAfter(dayjs(endDate).startOf('day')) && d.isBefore(dayjs(startDate).endOf('day'));
      });
    } else {
      filtered = filtered.filter(item => {
        const d = dayjs(item.deliveryDate);
        return d.isAfter(dayjs(startDate).startOf('day')) && d.isBefore(dayjs(endDate).endOf('day'));
      });
    }
  }
  if (values.receivedDateRange && values.receivedDateRange.length === 2) {
    const [startDate, endDate] = values.receivedDateRange;
    filtered = filtered.filter(item => {
      if (!item.receivedDate) return false;
      const d = dayjs(item.receivedDate);
      const s = dayjs(startDate);
      const e = dayjs(endDate);
      return d.isAfter(s.startOf('day')) && d.isBefore(e.endOf('day'));
    });
  }

  // 金额范围
  if (values.totalAmountRange && (values.totalAmountRange[0] != null || values.totalAmountRange[1] != null)) {
    const [minAmount, maxAmount] = values.totalAmountRange;
    filtered = filtered.filter(item => {
      if (minAmount != null && item.totalAmount < minAmount) return false;
      if (maxAmount != null && item.totalAmount > maxAmount) return false;
      return true;
    });
  }

  if (values.carrier) {
    const q = normalize(values.carrier);
    filtered = filtered.filter(item => normalize(item.transportInfo?.carrier).includes(q));
  }
  if (values.trackingNo) {
    const q = normalize(values.trackingNo);
    filtered = filtered.filter(item => normalize(item.transportInfo?.trackingNo).includes(q));
  }
  if (values.remarks) {
    const q = normalize(values.remarks);
    filtered = filtered.filter(item => normalize(item.remarks).includes(q));
  }

  return filtered;
}

export function canReceive(record: DeliveryNote): boolean {
  return record.status === 'pending_receive';
}

export function canInspect(record: DeliveryNote): boolean {
  return record.status === 'pending_inspection';
}

export function canArchive(record: DeliveryNote): boolean {
  return record.status === 'pending_archive' && record.qualityCheckStatus === 'passed';
}

export function canWarehouseOrAllocate(record: DeliveryNote): boolean {
  return record.status === 'pending_warehouse';
}

export function computeStats(data: DeliveryNote[]) {
  return {
    total: data.length,
    pending_receive: data.filter(i => i.status === 'pending_receive').length,
    pending_inspection: data.filter(i => i.status === 'pending_inspection').length,
    pending_archive: data.filter(i => i.status === 'pending_archive').length,
    pending_warehouse: data.filter(i => i.status === 'pending_warehouse').length,
    completed: data.filter(i => i.status === 'completed').length,
    totalAmount: data.reduce((sum, i) => sum + (i.totalAmount || 0), 0),
  };
}