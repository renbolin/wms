// FIFO批次管理工具函数

// 批次信息接口
export interface BatchInfo {
  id: string;
  batchNo: string;
  itemCode: string;
  itemName: string;
  warehouse: string;
  location: string;
  inboundDate: string;
  productionDate?: string;
  expiryDate?: string;
  currentQuantity: number;
  unitPrice: number;
  status: 'normal' | 'warning' | 'expired' | 'exhausted';
  supplier?: string;
  remarks?: string;
}

// 批次分配结果接口
export interface BatchAllocation {
  batchNo: string;
  batchId: string;
  allocatedQuantity: number;
  remainingQuantity: number;
  unitPrice: number;
  location: string;
  inboundDate: string;
  expiryDate?: string;
  isRecommended: boolean; // 是否为系统推荐
}

// 批次选择结果接口
export interface FIFOResult {
  success: boolean;
  allocations: BatchAllocation[];
  totalAllocated: number;
  shortageQuantity: number;
  message: string;
}

/**
 * 根据FIFO原则选择批次
 * @param itemCode 物料编码
 * @param warehouse 仓库
 * @param requestQuantity 需求数量
 * @param availableBatches 可用批次列表
 * @returns FIFO选择结果
 */
export function selectBatchesByFIFO(
  itemCode: string,
  warehouse: string,
  requestQuantity: number,
  availableBatches: BatchInfo[]
): FIFOResult {
  // 过滤符合条件的批次
  const validBatches = availableBatches.filter(batch => 
    batch.itemCode === itemCode &&
    batch.warehouse === warehouse &&
    batch.currentQuantity > 0 &&
    batch.status !== 'expired' &&
    batch.status !== 'exhausted'
  );

  if (validBatches.length === 0) {
    return {
      success: false,
      allocations: [],
      totalAllocated: 0,
      shortageQuantity: requestQuantity,
      message: '没有可用的批次'
    };
  }

  // 按FIFO原则排序：入库日期升序，生产日期升序
  const sortedBatches = validBatches.sort((a, b) => {
    // 首先按入库日期排序
    const inboundDateA = new Date(a.inboundDate).getTime();
    const inboundDateB = new Date(b.inboundDate).getTime();
    
    if (inboundDateA !== inboundDateB) {
      return inboundDateA - inboundDateB;
    }
    
    // 入库日期相同时，按生产日期排序
    if (a.productionDate && b.productionDate) {
      const productionDateA = new Date(a.productionDate).getTime();
      const productionDateB = new Date(b.productionDate).getTime();
      return productionDateA - productionDateB;
    }
    
    // 最后按批次号排序确保稳定性
    return a.batchNo.localeCompare(b.batchNo);
  });

  const allocations: BatchAllocation[] = [];
  let remainingQuantity = requestQuantity;
  let totalAllocated = 0;

  // 按FIFO顺序分配批次
  for (const batch of sortedBatches) {
    if (remainingQuantity <= 0) break;

    const allocatedQuantity = Math.min(remainingQuantity, batch.currentQuantity);
    
    allocations.push({
      batchNo: batch.batchNo,
      batchId: batch.id,
      allocatedQuantity,
      remainingQuantity: batch.currentQuantity - allocatedQuantity,
      unitPrice: batch.unitPrice,
      location: batch.location,
      inboundDate: batch.inboundDate,
      expiryDate: batch.expiryDate,
      isRecommended: true
    });

    remainingQuantity -= allocatedQuantity;
    totalAllocated += allocatedQuantity;
  }

  const success = remainingQuantity === 0;
  const message = success 
    ? `成功按FIFO原则分配${allocations.length}个批次`
    : `部分分配成功，还缺少${remainingQuantity}个单位`;

  return {
    success,
    allocations,
    totalAllocated,
    shortageQuantity: remainingQuantity,
    message
  };
}

/**
 * 检查批次是否即将过期
 * @param expiryDate 过期日期
 * @param warningDays 预警天数，默认30天
 * @returns 是否即将过期
 */
export function isBatchExpiringSoon(expiryDate?: string, warningDays: number = 30): boolean {
  if (!expiryDate) return false;
  
  const expiry = new Date(expiryDate);
  const today = new Date();
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays <= warningDays && diffDays > 0;
}

/**
 * 检查批次是否已过期
 * @param expiryDate 过期日期
 * @returns 是否已过期
 */
export function isBatchExpired(expiryDate?: string): boolean {
  if (!expiryDate) return false;
  
  const expiry = new Date(expiryDate);
  const today = new Date();
  
  return expiry < today;
}

/**
 * 计算批次库龄（天数）
 * @param inboundDate 入库日期
 * @returns 库龄天数
 */
export function calculateBatchAge(inboundDate: string): number {
  const inbound = new Date(inboundDate);
  const today = new Date();
  const diffTime = today.getTime() - inbound.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
}

/**
 * 获取批次状态
 * @param batch 批次信息
 * @returns 批次状态和状态文本
 */
export function getBatchStatus(batch: BatchInfo): { status: string; statusText: string; color: string } {
  if (batch.currentQuantity <= 0) {
    return { status: 'exhausted', statusText: '已用完', color: 'default' };
  }
  
  if (batch.expiryDate && isBatchExpired(batch.expiryDate)) {
    return { status: 'expired', statusText: '已过期', color: 'error' };
  }
  
  if (batch.expiryDate && isBatchExpiringSoon(batch.expiryDate)) {
    return { status: 'warning', statusText: '即将过期', color: 'warning' };
  }
  
  return { status: 'normal', statusText: '正常', color: 'success' };
}

/**
 * 模拟获取物料的可用批次数据
 * @param itemCode 物料编码
 * @param warehouse 仓库
 * @returns 可用批次列表
 */
export function getMockBatchesForItem(itemCode: string, warehouse: string): BatchInfo[] {
  // 这里是模拟数据，实际应该从API获取
  const mockBatches: BatchInfo[] = [
    {
      id: '1',
      batchNo: 'B20240101001',
      itemCode: 'M001',
      itemName: '钢材',
      warehouse: '主仓库',
      location: 'A01-01-01',
      inboundDate: '2024-01-15',
      productionDate: '2024-01-10',
      expiryDate: '2025-01-10',
      currentQuantity: 75,
      unitPrice: 50,
      status: 'normal',
      supplier: '钢铁有限公司',
      remarks: '质量良好'
    },
    {
      id: '2',
      batchNo: 'B20240120001',
      itemCode: 'M001',
      itemName: '钢材',
      warehouse: '主仓库',
      location: 'A01-01-02',
      inboundDate: '2024-01-20',
      productionDate: '2024-01-18',
      expiryDate: '2025-01-18',
      currentQuantity: 50,
      unitPrice: 52,
      status: 'normal',
      supplier: '钢铁有限公司',
      remarks: '新批次'
    },
    {
      id: '3',
      batchNo: 'B20240110001',
      itemCode: 'M001',
      itemName: '钢材',
      warehouse: '主仓库',
      location: 'A01-01-03',
      inboundDate: '2024-01-10',
      productionDate: '2024-01-08',
      expiryDate: '2025-01-08',
      currentQuantity: 25,
      unitPrice: 48,
      status: 'normal',
      supplier: '钢铁有限公司',
      remarks: '早期批次'
    }
  ];

  return mockBatches.filter(batch => 
    batch.itemCode === itemCode && batch.warehouse === warehouse
  );
}