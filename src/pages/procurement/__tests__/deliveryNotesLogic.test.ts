import { describe, it, expect } from 'vitest';
import dayjs from 'dayjs';
import type { DeliveryNote, DeliveryItem } from '../../../types/procurement';
import {
  getStatusColor,
  validateHeaderForm,
  validateReceiveItems,
  validateAmountRange,
  filterDeliveryNotes,
  canReceive,
  canWarehouse,
  computeStats,
} from '../deliveryNotesLogic';

function makeItem(partial?: Partial<DeliveryItem>): DeliveryItem {
  return {
    id: partial?.id || 'item-1',
    itemName: partial?.itemName || '测试物料',
    specification: partial?.specification || '规格A',
    unit: partial?.unit || '件',
    orderedQuantity: partial?.orderedQuantity ?? 10,
    deliveredQuantity: partial?.deliveredQuantity ?? 8,
    receivedQuantity: partial?.receivedQuantity ?? 0,
    unitPrice: partial?.unitPrice ?? 100,
    totalPrice: partial?.totalPrice ?? 1000,
    remarks: partial?.remarks || '',
    batchNo: partial?.batchNo,
    expiryDate: partial?.expiryDate,
  };
}

function makeNote(partial?: Partial<DeliveryNote>): DeliveryNote {
  return {
    id: partial?.id || 'dn-1',
    deliveryNo: partial?.deliveryNo || 'DN202401001',
    purchaseOrderNo: partial?.purchaseOrderNo || 'PO202401001',
    purchaseOrderId: partial?.purchaseOrderId || 'po_001',
    supplierName: partial?.supplierName || '北京科技有限公司',
    supplierId: partial?.supplierId || 'sup_001',
    supplierContact: partial?.supplierContact || '张经理',
    supplierPhone: partial?.supplierPhone || '13800138000',
    deliveryDate: partial?.deliveryDate || '2024-01-25',
    receivedDate: partial?.receivedDate,
    receiver: partial?.receiver,
    department: partial?.department,
    status: partial?.status || 'pending',
    statusText: partial?.statusText || '待接收',
    totalAmount: partial?.totalAmount ?? 10000,
    items: partial?.items || [makeItem()],
    orderItems: partial?.orderItems,
    attachments: partial?.attachments || [],
    remarks: partial?.remarks || '',
    transportInfo: partial?.transportInfo,
    qualityCheckRequired: partial?.qualityCheckRequired,
    qualityCheckStatus: partial?.qualityCheckStatus,
  };
}

describe('getStatusColor', () => {
  it('maps statuses to expected colors', () => {
    expect(getStatusColor('pending')).toBe('orange');
    expect(getStatusColor('received')).toBe('blue');
    expect(getStatusColor('partial')).toBe('yellow');
    expect(getStatusColor('completed')).toBe('green');
    expect(getStatusColor('rejected')).toBe('red');
  });
});

describe('validateHeaderForm', () => {
  it('returns errors when required fields missing', () => {
    const errors = validateHeaderForm({});
    expect(errors.length).toBeGreaterThan(0);
  });

  it('passes with valid values', () => {
    const errors = validateHeaderForm({
      receivedDate: dayjs(),
      receiver: '张三',
      department: '采购部',
    });
    expect(errors.length).toBe(0);
  });
});

describe('validateReceiveItems', () => {
  it('error when status missing', () => {
    const note = makeNote({ items: [makeItem({ id: 'a', itemName: 'A' })] });
    const res = validateReceiveItems(note, { a: 0 }, {} as any);
    expect(res.errors[0]).includes('未选择接收状态');
  });

  it('error when received qty is 0', () => {
    const note = makeNote({ items: [makeItem({ id: 'a', itemName: 'A', deliveredQuantity: 5 })] });
    const res = validateReceiveItems(note, { a: 0 }, { a: 'received' });
    expect(res.errors[0]).includes('数量必须大于0');
  });

  it('error when qty exceeds delivered', () => {
    const note = makeNote({ items: [makeItem({ id: 'a', itemName: 'A', deliveredQuantity: 3 })] });
    const res = validateReceiveItems(note, { a: 4 }, { a: 'received' });
    expect(res.errors[0]).includes('不能超过到货数量');
  });

  it('error when rejected but qty not 0', () => {
    const note = makeNote({ items: [makeItem({ id: 'a', itemName: 'A' })] });
    const res = validateReceiveItems(note, { a: 1 }, { a: 'rejected' });
    expect(res.errors[0]).includes('必须为0');
  });

  it('success when valid entries', () => {
    const note = makeNote({ items: [makeItem({ id: 'a', deliveredQuantity: 5 })] });
    const res = validateReceiveItems(note, { a: 3 }, { a: 'received' });
    expect(res.errors.length).toBe(0);
    expect(res.updatedItems[0].receivedQuantity).toBe(3);
  });
});

describe('validateAmountRange', () => {
  it('rejects negative bounds', () => {
    expect(validateAmountRange(-1, 10)).toContain('不能为负数');
    expect(validateAmountRange(1, -10)).toContain('不能为负数');
  });

  it('rejects min greater than max', () => {
    expect(validateAmountRange(20, 10)).toContain('最小金额大于最大金额');
  });

  it('accepts valid ranges', () => {
    expect(validateAmountRange(0, 100)).toBeNull();
    expect(validateAmountRange(undefined, 100)).toBeNull();
  });
});

describe('filterDeliveryNotes', () => {
  const notes: DeliveryNote[] = [
    makeNote({ id: '1', supplierName: '北京科技有限公司', status: 'received', statusText: '已接收', totalAmount: 1000, receivedDate: '2024-01-26' }),
    makeNote({ id: '2', supplierName: '上海制造厂', status: 'pending', statusText: '待接收', totalAmount: 5000 }),
    makeNote({ id: '3', supplierName: '广州电子', status: 'completed', statusText: '已完成', totalAmount: 12000, receivedDate: '2024-02-01' }),
  ];

  it('filters by supplierName fuzzy', () => {
    const res = filterDeliveryNotes(notes, { supplierName: '北京' });
    expect(res.map(n => n.id)).toEqual(['1']);
  });

  it('filters by status', () => {
    const res = filterDeliveryNotes(notes, { status: 'pending' });
    expect(res.map(n => n.id)).toEqual(['2']);
  });

  it('filters by received date range', () => {
    const res = filterDeliveryNotes(notes, { receivedDateRange: [dayjs('2024-01-25'), dayjs('2024-01-27')] });
    expect(res.map(n => n.id)).toEqual(['1']);
  });

  it('filters by total amount range', () => {
    const res = filterDeliveryNotes(notes, { totalAmountRange: [2000, 11000] });
    expect(res.map(n => n.id)).toEqual(['2']);
  });
});

describe('action guards', () => {
  it('canReceive only for pending/partial', () => {
    expect(canReceive(makeNote({ status: 'pending' }))).toBe(true);
    expect(canReceive(makeNote({ status: 'partial' }))).toBe(true);
    expect(canReceive(makeNote({ status: 'received' }))).toBe(false);
  });

  it('canWarehouse only for received', () => {
    expect(canWarehouse(makeNote({ status: 'received' }))).toBe(true);
    expect(canWarehouse(makeNote({ status: 'pending' }))).toBe(false);
  });
});

describe('computeStats', () => {
  it('computes basic stats', () => {
    const res = computeStats([
      makeNote({ status: 'pending', totalAmount: 100 }),
      makeNote({ status: 'completed', totalAmount: 200 }),
    ]);
    expect(res.total).toBe(2);
    expect(res.pending).toBe(1);
    expect(res.completed).toBe(1);
    expect(res.totalAmount).toBe(300);
  });
});