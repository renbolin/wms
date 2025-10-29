import { bench } from 'vitest';
import type { DeliveryNote, DeliveryItem } from '../../../types/procurement';
import { filterDeliveryNotes } from '../deliveryNotesLogic';

function makeItem(i: number): DeliveryItem {
  return {
    id: `item-${i}`,
    itemName: `物料-${i}`,
    specification: '规格',
    unit: '件',
    orderedQuantity: 10,
    deliveredQuantity: 8,
    receivedQuantity: 0,
    unitPrice: 100,
    totalPrice: 1000,
    remarks: ''
  };
}

function makeNote(i: number): DeliveryNote {
  const suppliers = ['北京科技有限公司', '上海制造厂', '广州电子'];
  const statuses: DeliveryNote['status'][] = ['pending_receive', 'pending_warehouse', 'completed'];
  return {
    id: `dn-${i}`,
    deliveryNo: `DN${String(i).padStart(6, '0')}`,
    purchaseOrderNo: `PO${String(i).padStart(6, '0')}`,
    purchaseOrderId: `po_${i}`,
    supplierName: suppliers[i % suppliers.length],
    supplierId: `sup_${i % suppliers.length}`,
    supplierContact: '联系人',
    supplierPhone: '13800138000',
    deliveryDate: '2024-01-25',
    status: statuses[i % statuses.length],
    statusText: '状态',
    totalAmount: (i % 200) * 100,
    items: [makeItem(i)],
    attachments: [],
    remarks: ''
  };
}

const dataset: DeliveryNote[] = Array.from({ length: 5000 }, (_, i) => makeNote(i + 1));

bench('filter supplier fuzzy', () => {
  filterDeliveryNotes(dataset, { supplierName: '北京' });
});

bench('filter amount range', () => {
  filterDeliveryNotes(dataset, { totalAmountRange: [5000, 20000] });
});