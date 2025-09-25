import React, { useState } from 'react';
import { Row, Col, Card, Statistic, Select, Tabs, Progress } from 'antd';
import { 
  ShoppingCartOutlined, 
  DollarOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
  AlertOutlined,
  TeamOutlined,
  ShopOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { TabPane } = Tabs;

interface DetailedStatsProps {
  timeRange: 'today' | 'week' | 'month' | 'quarter';
  onTimeRangeChange: (range: 'today' | 'week' | 'month' | 'quarter') => void;
}

const DetailedStats: React.FC<DetailedStatsProps> = ({ timeRange, onTimeRangeChange }) => {
  const [activeTab, setActiveTab] = useState('overview');

  // 模拟不同时间维度的数据
  const getStatsData = () => {
    const data = {
      today: {
        orders: { value: 12, growth: 8.3, target: 15 },
        amount: { value: 156000, growth: 12.5, target: 200000 },
        pending: { value: 3, growth: -25.0, target: 2 },
        completed: { value: 9, growth: 28.6, target: 13 },
        avgProcessTime: { value: 2.5, growth: -15.2, target: 2.0 },
        supplierResponse: { value: 85.6, growth: 5.2, target: 90.0 }
      },
      week: {
        orders: { value: 78, growth: 15.6, target: 85 },
        amount: { value: 1250000, growth: 18.2, target: 1400000 },
        pending: { value: 8, growth: -20.0, target: 5 },
        completed: { value: 65, growth: 22.6, target: 75 },
        avgProcessTime: { value: 2.8, growth: -12.5, target: 2.5 },
        supplierResponse: { value: 88.2, growth: 3.8, target: 90.0 }
      },
      month: {
        orders: { value: 320, growth: 25.8, target: 350 },
        amount: { value: 5610000, growth: 15.6, target: 6000000 },
        pending: { value: 25, growth: -18.5, target: 20 },
        completed: { value: 275, growth: 28.2, target: 300 },
        avgProcessTime: { value: 3.2, growth: -8.6, target: 3.0 },
        supplierResponse: { value: 86.5, growth: 2.1, target: 90.0 }
      },
      quarter: {
        orders: { value: 890, growth: 22.4, target: 1000 },
        amount: { value: 16800000, growth: 19.8, target: 18000000 },
        pending: { value: 45, growth: -22.4, target: 35 },
        completed: { value: 795, growth: 26.8, target: 900 },
        avgProcessTime: { value: 3.5, growth: -11.2, target: 3.0 },
        supplierResponse: { value: 87.8, growth: 4.5, target: 90.0 }
      }
    };
    return data[timeRange];
  };

  const stats = getStatsData();

  const formatCurrency = (amount: number) => {
    if (amount >= 10000) {
      return `￥${(amount / 10000).toFixed(1)}万`;
    }
    return `￥${amount.toLocaleString()}`;
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />;
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? '#3f8600' : '#cf1322';
  };

  const getProgressColor = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 90) return '#52c41a';
    if (percentage >= 70) return '#faad14';
    return '#ff4d4f';
  };

  const getTimeRangeLabel = () => {
    const labels = {
      today: '今日',
      week: '本周',
      month: '本月',
      quarter: '本季度'
    };
    return labels[timeRange];
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">详细统计 - {getTimeRangeLabel()}</h3>
        <Select value={timeRange} onChange={onTimeRangeChange} style={{ width: 120 }}>
          <Option value="today">今日</Option>
          <Option value="week">本周</Option>
          <Option value="month">本月</Option>
          <Option value="quarter">本季度</Option>
        </Select>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="核心指标" key="overview">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="订单数量"
                  value={stats.orders.value}
                  prefix={<ShoppingCartOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
                <div className="mt-2">
                  <div className="text-sm" style={{ color: getGrowthColor(stats.orders.growth) }}>
                    {getGrowthIcon(stats.orders.growth)} {Math.abs(stats.orders.growth)}%
                  </div>
                  <Progress 
                    percent={(stats.orders.value / stats.orders.target) * 100} 
                    size="small" 
                    strokeColor={getProgressColor(stats.orders.value, stats.orders.target)}
                    format={() => `${stats.orders.value}/${stats.orders.target}`}
                  />
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="采购金额"
                  value={formatCurrency(stats.amount.value)}
                  prefix={<DollarOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
                <div className="mt-2">
                  <div className="text-sm" style={{ color: getGrowthColor(stats.amount.growth) }}>
                    {getGrowthIcon(stats.amount.growth)} {Math.abs(stats.amount.growth)}%
                  </div>
                  <Progress 
                    percent={(stats.amount.value / stats.amount.target) * 100} 
                    size="small" 
                    strokeColor={getProgressColor(stats.amount.value, stats.amount.target)}
                    format={() => `${((stats.amount.value / stats.amount.target) * 100).toFixed(1)}%`}
                  />
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="待处理订单"
                  value={stats.pending.value}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
                <div className="mt-2">
                  <div className="text-sm" style={{ color: getGrowthColor(stats.pending.growth) }}>
                    {getGrowthIcon(stats.pending.growth)} {Math.abs(stats.pending.growth)}%
                  </div>
                  <div className="text-xs text-gray-500">
                    目标: ≤{stats.pending.target}
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="已完成订单"
                  value={stats.completed.value}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
                <div className="mt-2">
                  <div className="text-sm" style={{ color: getGrowthColor(stats.completed.growth) }}>
                    {getGrowthIcon(stats.completed.growth)} {Math.abs(stats.completed.growth)}%
                  </div>
                  <div className="text-xs text-green-500">
                    完成率: {((stats.completed.value / (stats.completed.value + stats.pending.value)) * 100).toFixed(1)}%
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="效率指标" key="efficiency">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Card>
                <Statistic
                  title="平均处理时间"
                  value={stats.avgProcessTime.value}
                  suffix="天"
                  prefix={<LineChartOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
                <div className="mt-2">
                  <div className="text-sm" style={{ color: getGrowthColor(stats.avgProcessTime.growth) }}>
                    {getGrowthIcon(stats.avgProcessTime.growth)} {Math.abs(stats.avgProcessTime.growth)}%
                  </div>
                  <Progress 
                    percent={Math.min((stats.avgProcessTime.target / stats.avgProcessTime.value) * 100, 100)} 
                    size="small" 
                    strokeColor={stats.avgProcessTime.value <= stats.avgProcessTime.target ? '#52c41a' : '#ff4d4f'}
                    format={() => `目标: ${stats.avgProcessTime.target}天`}
                  />
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12}>
              <Card>
                <Statistic
                  title="供应商响应率"
                  value={stats.supplierResponse.value}
                  suffix="%"
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#13c2c2' }}
                />
                <div className="mt-2">
                  <div className="text-sm" style={{ color: getGrowthColor(stats.supplierResponse.growth) }}>
                    {getGrowthIcon(stats.supplierResponse.growth)} {Math.abs(stats.supplierResponse.growth)}%
                  </div>
                  <Progress 
                    percent={(stats.supplierResponse.value / stats.supplierResponse.target) * 100} 
                    size="small" 
                    strokeColor={getProgressColor(stats.supplierResponse.value, stats.supplierResponse.target)}
                    format={() => `目标: ${stats.supplierResponse.target}%`}
                  />
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default DetailedStats;