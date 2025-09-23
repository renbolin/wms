import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import { 
  ShoppingCartOutlined, 
  DollarOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons';
import { ProcurementStats } from '../../types/procurement';

interface ProcurementStatsProps {
  stats: ProcurementStats;
}

const ProcurementStatsComponent: React.FC<ProcurementStatsProps> = ({ stats }) => {
  const formatCurrency = (amount: number) => {
    return `￥${(amount / 10000).toFixed(1)}万`;
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />;
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? '#3f8600' : '#cf1322';
  };

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic
            title="总订单数"
            value={stats.totalOrders}
            prefix={<ShoppingCartOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
          <div className="mt-2 text-sm" style={{ color: getGrowthColor(stats.monthlyGrowth) }}>
            {getGrowthIcon(stats.monthlyGrowth)} 较上月{stats.monthlyGrowth >= 0 ? '增长' : '下降'} {Math.abs(stats.monthlyGrowth)}%
          </div>
        </Card>
      </Col>
      
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic
            title="采购总金额"
            value={formatCurrency(stats.totalAmount)}
            prefix={<DollarOutlined />}
            valueStyle={{ color: '#3f8600' }}
          />
          <div className="mt-2 text-sm text-gray-500">
            平均订单金额: {formatCurrency(stats.averageOrderValue)}
          </div>
        </Card>
      </Col>
      
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic
            title="待处理订单"
            value={stats.pendingOrders}
            prefix={<ClockCircleOutlined />}
            valueStyle={{ color: '#faad14' }}
          />
          <div className="mt-2 text-sm text-orange-500">
            需要及时处理
          </div>
        </Card>
      </Col>
      
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic
            title="已完成订单"
            value={stats.completedOrders}
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: '#52c41a' }}
          />
          <div className="mt-2 text-sm text-green-500">
            完成率: {((stats.completedOrders / stats.totalOrders) * 100).toFixed(1)}%
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default ProcurementStatsComponent;