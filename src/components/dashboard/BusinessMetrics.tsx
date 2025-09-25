import React from 'react';
import { Row, Col, Card, Statistic, Progress, Tag, Tooltip } from 'antd';
import { 
  SyncOutlined, 
  FundOutlined, 
  StarOutlined, 
  AlertOutlined,
  TrophyOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';

interface BusinessMetricsProps {
  timeRange: 'today' | 'week' | 'month' | 'quarter';
}

const BusinessMetrics: React.FC<BusinessMetricsProps> = ({ timeRange }) => {
  // 模拟业务指标数据
  const getBusinessMetrics = () => {
    return {
      inventory: {
        turnoverRate: 4.2, // 库存周转率
        turnoverTarget: 5.0,
        stockoutRate: 2.3, // 缺货率
        stockoutTarget: 1.5,
        avgStockDays: 87, // 平均库存天数
        avgStockTarget: 72,
        warehouseUtilization: 78.5, // 仓库利用率
        warehouseTarget: 85.0
      },
      assets: {
        utilizationRate: 82.3, // 资产利用率
        utilizationTarget: 90.0,
        maintenanceCost: 156000, // 维护成本
        maintenanceBudget: 200000,
        downtime: 12.5, // 停机时间(小时)
        downtimeTarget: 8.0,
        roi: 15.8, // 投资回报率
        roiTarget: 18.0
      },
      suppliers: {
        avgRating: 4.3, // 平均评分
        ratingTarget: 4.5,
        onTimeDelivery: 89.2, // 准时交付率
        deliveryTarget: 95.0,
        qualityScore: 92.1, // 质量评分
        qualityTarget: 95.0,
        responseTime: 2.8, // 响应时间(小时)
        responseTarget: 2.0
      },
      financial: {
        costSavings: 285000, // 成本节约
        savingsTarget: 300000,
        budgetVariance: -5.2, // 预算差异(%)
        varianceTarget: 0,
        paymentTerms: 28.5, // 平均付款周期
        paymentTarget: 30.0,
        discountUtilization: 76.8 // 折扣利用率
      }
    };
  };

  const metrics = getBusinessMetrics();

  const formatCurrency = (amount: number) => {
    return `￥${(amount / 10000).toFixed(1)}万`;
  };

  const getPerformanceColor = (current: number, target: number, isReverse = false) => {
    const ratio = current / target;
    if (isReverse) {
      if (ratio <= 0.8) return '#52c41a';
      if (ratio <= 1.0) return '#faad14';
      return '#ff4d4f';
    } else {
      if (ratio >= 0.9) return '#52c41a';
      if (ratio >= 0.7) return '#faad14';
      return '#ff4d4f';
    }
  };

  const getPerformanceTag = (current: number, target: number, isReverse = false) => {
    const ratio = current / target;
    if (isReverse) {
      if (ratio <= 0.8) return <Tag color="green">优秀</Tag>;
      if (ratio <= 1.0) return <Tag color="orange">良好</Tag>;
      return <Tag color="red">需改进</Tag>;
    } else {
      if (ratio >= 0.9) return <Tag color="green">优秀</Tag>;
      if (ratio >= 0.7) return <Tag color="orange">良好</Tag>;
      return <Tag color="red">需改进</Tag>;
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">业务关键指标</h3>
      
      {/* 库存管理指标 */}
      <Card title="库存管理" className="mb-4" size="small">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title={
                  <span>
                    库存周转率
                    <Tooltip title="年度销售成本除以平均库存价值">
                      <InfoCircleOutlined className="ml-1 text-gray-400" />
                    </Tooltip>
                  </span>
                }
                value={metrics.inventory.turnoverRate}
                suffix="次/年"
                prefix={<SyncOutlined />}
                valueStyle={{ color: getPerformanceColor(metrics.inventory.turnoverRate, metrics.inventory.turnoverTarget) }}
              />
              <div className="mt-2">
                {getPerformanceTag(metrics.inventory.turnoverRate, metrics.inventory.turnoverTarget)}
                <Progress 
                  percent={(metrics.inventory.turnoverRate / metrics.inventory.turnoverTarget) * 100} 
                  size="small" 
                  strokeColor={getPerformanceColor(metrics.inventory.turnoverRate, metrics.inventory.turnoverTarget)}
                />
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="缺货率"
                value={metrics.inventory.stockoutRate}
                suffix="%"
                prefix={<AlertOutlined />}
                valueStyle={{ color: getPerformanceColor(metrics.inventory.stockoutRate, metrics.inventory.stockoutTarget, true) }}
              />
              <div className="mt-2">
                {getPerformanceTag(metrics.inventory.stockoutRate, metrics.inventory.stockoutTarget, true)}
                <div className="text-xs text-gray-500">目标: ≤{metrics.inventory.stockoutTarget}%</div>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="平均库存天数"
                value={metrics.inventory.avgStockDays}
                suffix="天"
                prefix={<FundOutlined />}
                valueStyle={{ color: getPerformanceColor(metrics.inventory.avgStockDays, metrics.inventory.avgStockTarget, true) }}
              />
              <div className="mt-2">
                {getPerformanceTag(metrics.inventory.avgStockDays, metrics.inventory.avgStockTarget, true)}
                <div className="text-xs text-gray-500">目标: ≤{metrics.inventory.avgStockTarget}天</div>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="仓库利用率"
                value={metrics.inventory.warehouseUtilization}
                suffix="%"
                prefix={<ArrowUpOutlined />}
                valueStyle={{ color: getPerformanceColor(metrics.inventory.warehouseUtilization, metrics.inventory.warehouseTarget) }}
              />
              <div className="mt-2">
                {getPerformanceTag(metrics.inventory.warehouseUtilization, metrics.inventory.warehouseTarget)}
                <Progress 
                  percent={(metrics.inventory.warehouseUtilization / metrics.inventory.warehouseTarget) * 100} 
                  size="small" 
                  strokeColor={getPerformanceColor(metrics.inventory.warehouseUtilization, metrics.inventory.warehouseTarget)}
                />
              </div>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* 资产管理指标 */}
      <Card title="资产管理" className="mb-4" size="small">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="资产利用率"
                value={metrics.assets.utilizationRate}
                suffix="%"
                prefix={<TrophyOutlined />}
                valueStyle={{ color: getPerformanceColor(metrics.assets.utilizationRate, metrics.assets.utilizationTarget) }}
              />
              <div className="mt-2">
                {getPerformanceTag(metrics.assets.utilizationRate, metrics.assets.utilizationTarget)}
                <Progress 
                  percent={(metrics.assets.utilizationRate / metrics.assets.utilizationTarget) * 100} 
                  size="small" 
                  strokeColor={getPerformanceColor(metrics.assets.utilizationRate, metrics.assets.utilizationTarget)}
                />
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="维护成本"
                value={formatCurrency(metrics.assets.maintenanceCost)}
                prefix={<ArrowDownOutlined />}
                valueStyle={{ color: getPerformanceColor(metrics.assets.maintenanceCost, metrics.assets.maintenanceBudget, true) }}
              />
              <div className="mt-2">
                <div className="text-xs text-gray-500">
                  预算: {formatCurrency(metrics.assets.maintenanceBudget)}
                </div>
                <Progress 
                  percent={(metrics.assets.maintenanceCost / metrics.assets.maintenanceBudget) * 100} 
                  size="small" 
                  strokeColor={getPerformanceColor(metrics.assets.maintenanceCost, metrics.assets.maintenanceBudget, true)}
                />
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="停机时间"
                value={metrics.assets.downtime}
                suffix="小时"
                prefix={<AlertOutlined />}
                valueStyle={{ color: getPerformanceColor(metrics.assets.downtime, metrics.assets.downtimeTarget, true) }}
              />
              <div className="mt-2">
                {getPerformanceTag(metrics.assets.downtime, metrics.assets.downtimeTarget, true)}
                <div className="text-xs text-gray-500">目标: ≤{metrics.assets.downtimeTarget}小时</div>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="投资回报率"
                value={metrics.assets.roi}
                suffix="%"
                prefix={<ArrowUpOutlined />}
                valueStyle={{ color: getPerformanceColor(metrics.assets.roi, metrics.assets.roiTarget) }}
              />
              <div className="mt-2">
                {getPerformanceTag(metrics.assets.roi, metrics.assets.roiTarget)}
                <div className="text-xs text-gray-500">目标: ≥{metrics.assets.roiTarget}%</div>
              </div>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* 供应商绩效指标 */}
      <Card title="供应商绩效" className="mb-4" size="small">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="平均评分"
                value={metrics.suppliers.avgRating}
                suffix="/5.0"
                prefix={<StarOutlined />}
                valueStyle={{ color: getPerformanceColor(metrics.suppliers.avgRating, metrics.suppliers.ratingTarget) }}
              />
              <div className="mt-2">
                {getPerformanceTag(metrics.suppliers.avgRating, metrics.suppliers.ratingTarget)}
                <Progress 
                  percent={(metrics.suppliers.avgRating / 5.0) * 100} 
                  size="small" 
                  strokeColor={getPerformanceColor(metrics.suppliers.avgRating, metrics.suppliers.ratingTarget)}
                />
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="准时交付率"
                value={metrics.suppliers.onTimeDelivery}
                suffix="%"
                prefix={<TrophyOutlined />}
                valueStyle={{ color: getPerformanceColor(metrics.suppliers.onTimeDelivery, metrics.suppliers.deliveryTarget) }}
              />
              <div className="mt-2">
                {getPerformanceTag(metrics.suppliers.onTimeDelivery, metrics.suppliers.deliveryTarget)}
                <Progress 
                  percent={(metrics.suppliers.onTimeDelivery / metrics.suppliers.deliveryTarget) * 100} 
                  size="small" 
                  strokeColor={getPerformanceColor(metrics.suppliers.onTimeDelivery, metrics.suppliers.deliveryTarget)}
                />
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="质量评分"
                value={metrics.suppliers.qualityScore}
                suffix="%"
                prefix={<StarOutlined />}
                valueStyle={{ color: getPerformanceColor(metrics.suppliers.qualityScore, metrics.suppliers.qualityTarget) }}
              />
              <div className="mt-2">
                {getPerformanceTag(metrics.suppliers.qualityScore, metrics.suppliers.qualityTarget)}
                <Progress 
                  percent={(metrics.suppliers.qualityScore / metrics.suppliers.qualityTarget) * 100} 
                  size="small" 
                  strokeColor={getPerformanceColor(metrics.suppliers.qualityScore, metrics.suppliers.qualityTarget)}
                />
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="响应时间"
                value={metrics.suppliers.responseTime}
                suffix="小时"
                prefix={<SyncOutlined />}
                valueStyle={{ color: getPerformanceColor(metrics.suppliers.responseTime, metrics.suppliers.responseTarget, true) }}
              />
              <div className="mt-2">
                {getPerformanceTag(metrics.suppliers.responseTime, metrics.suppliers.responseTarget, true)}
                <div className="text-xs text-gray-500">目标: ≤{metrics.suppliers.responseTarget}小时</div>
              </div>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* 财务指标 */}
      <Card title="财务指标" size="small">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="成本节约"
                value={formatCurrency(metrics.financial.costSavings)}
                prefix={<ArrowUpOutlined />}
                valueStyle={{ color: getPerformanceColor(metrics.financial.costSavings, metrics.financial.savingsTarget) }}
              />
              <div className="mt-2">
                {getPerformanceTag(metrics.financial.costSavings, metrics.financial.savingsTarget)}
                <Progress 
                  percent={(metrics.financial.costSavings / metrics.financial.savingsTarget) * 100} 
                  size="small" 
                  strokeColor={getPerformanceColor(metrics.financial.costSavings, metrics.financial.savingsTarget)}
                />
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="预算差异"
                value={Math.abs(metrics.financial.budgetVariance)}
                suffix="%"
                prefix={metrics.financial.budgetVariance >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                valueStyle={{ 
                  color: Math.abs(metrics.financial.budgetVariance) <= 5 ? '#52c41a' : '#ff4d4f' 
                }}
              />
              <div className="mt-2">
                <Tag color={Math.abs(metrics.financial.budgetVariance) <= 5 ? 'green' : 'red'}>
                  {metrics.financial.budgetVariance >= 0 ? '超支' : '节约'}
                </Tag>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="平均付款周期"
                value={metrics.financial.paymentTerms}
                suffix="天"
                prefix={<SyncOutlined />}
                valueStyle={{ color: getPerformanceColor(metrics.financial.paymentTerms, metrics.financial.paymentTarget, true) }}
              />
              <div className="mt-2">
                <div className="text-xs text-gray-500">目标: ≤{metrics.financial.paymentTarget}天</div>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="折扣利用率"
                value={metrics.financial.discountUtilization}
                suffix="%"
                prefix={<TrophyOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
              <div className="mt-2">
                <Progress 
                  percent={metrics.financial.discountUtilization} 
                  size="small" 
                  strokeColor="#1890ff"
                />
              </div>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default BusinessMetrics;