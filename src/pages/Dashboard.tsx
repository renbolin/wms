import React from 'react';
import { Row, Col, Card } from 'antd';
import ProcurementStatsComponent from '../components/procurement/ProcurementStats';
import ProcurementOrderList from '../components/procurement/ProcurementOrderList';
import TopSuppliers from '../components/procurement/TopSuppliers';
import ProcurementNotifications from '../components/procurement/ProcurementNotifications';
import { 
  mockProcurementStats, 
  mockProcurementOrders, 
  mockProcurementNotifications 
} from '../data/procurementData';
import { ProcurementOrder, ProcurementNotification } from '../types/procurement';

const Dashboard: React.FC = () => {
  const handleViewOrder = (order: ProcurementOrder) => {
    console.log('查看订单:', order);
    // 这里可以添加查看订单详情的逻辑
  };

  const handleEditOrder = (order: ProcurementOrder) => {
    console.log('编辑订单:', order);
    // 这里可以添加编辑订单的逻辑
  };

  const handleDeleteOrder = (order: ProcurementOrder) => {
    console.log('删除订单:', order);
    // 这里可以添加删除订单的逻辑
  };

  const handleNotificationClick = (notification: ProcurementNotification) => {
    console.log('点击通知:', notification);
    // 这里可以添加处理通知点击的逻辑
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">采购管理仪表盘</h2>
      
      {/* 采购统计卡片 */}
      <div className="mb-6">
        <ProcurementStatsComponent stats={mockProcurementStats} />
      </div>
      
      <Row gutter={[16, 16]}>
        {/* 采购订单列表 */}
        <Col xs={24} xl={16}>
          <Card title="最近采购订单" className="h-full">
            <ProcurementOrderList
              orders={mockProcurementOrders}
              onView={handleViewOrder}
              onEdit={handleEditOrder}
              onDelete={handleDeleteOrder}
            />
          </Card>
        </Col>
        
        {/* 右侧信息面板 */}
        <Col xs={24} xl={8}>
          <div className="space-y-4">
            {/* 顶级供应商 */}
            <Card title="顶级供应商" size="small">
              <TopSuppliers 
                suppliers={mockProcurementStats.topSuppliers}
                totalAmount={mockProcurementStats.totalAmount}
              />
            </Card>
            
            {/* 采购通知 */}
            <Card title="采购通知" size="small">
              <ProcurementNotifications
                notifications={mockProcurementNotifications}
                onNotificationClick={handleNotificationClick}
              />
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;