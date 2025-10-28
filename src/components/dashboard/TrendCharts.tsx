import React from 'react';
import { Row, Col, Card, Select } from 'antd';
import { Line, Column, Pie, Area } from '@ant-design/plots';

const { Option } = Select;

interface TrendChartsProps {
  timeRange: 'today' | 'week' | 'month' | 'quarter';
}

const TrendCharts: React.FC<TrendChartsProps> = ({ timeRange }) => {
  // 采购趋势数据
  const getProcurementTrendData = () => {
    const data = {
      today: [
        { date: '09:00', orders: 12, amount: 180000 },
        { date: '12:00', orders: 8, amount: 120000 },
        { date: '15:00', orders: 15, amount: 225000 },
        { date: '18:00', orders: 10, amount: 150000 }
      ],
      week: [
        { date: '周一', orders: 12, amount: 156000 },
        { date: '周二', orders: 15, amount: 189000 },
        { date: '周三', orders: 18, amount: 234000 },
        { date: '周四', orders: 14, amount: 178000 },
        { date: '周五', orders: 16, amount: 203000 },
        { date: '周六', orders: 8, amount: 98000 },
        { date: '周日', orders: 5, amount: 67000 }
      ],
      month: [
        { date: '第1周', orders: 78, amount: 1250000 },
        { date: '第2周', orders: 85, amount: 1380000 },
        { date: '第3周', orders: 92, amount: 1456000 },
        { date: '第4周', orders: 88, amount: 1324000 }
      ],
      quarter: [
        { date: '1月', orders: 320, amount: 5610000 },
        { date: '2月', orders: 285, amount: 4980000 },
        { date: '3月', orders: 365, amount: 6420000 }
      ]
    };
    return data[timeRange] || data.month;
  };

  // 分类占比数据
  const getCategoryData = () => {
    return [
      { category: 'IT设备', value: 4300000, percentage: 76.6 },
      { category: '安防设备', value: 960000, percentage: 17.1 },
      { category: '办公用品', value: 350000, percentage: 6.3 }
    ];
  };

  // 供应商对比数据
  const getSupplierComparisonData = () => {
    return [
      { supplier: '华为技术', thisMonth: 2500000, lastMonth: 2200000 },
      { supplier: '联想集团', thisMonth: 1800000, lastMonth: 1650000 },
      { supplier: '海康威视', thisMonth: 960000, lastMonth: 1100000 },
      { supplier: '得力集团', thisMonth: 350000, lastMonth: 320000 }
    ];
  };

  // 库存周转趋势数据
  const getInventoryTurnoverData = () => {
    return [
      { month: '1月', turnover: 3.8, target: 4.0 },
      { month: '2月', turnover: 4.1, target: 4.0 },
      { month: '3月', turnover: 4.2, target: 4.0 },
      { month: '4月', turnover: 3.9, target: 4.0 },
      { month: '5月', turnover: 4.3, target: 4.0 },
      { month: '6月', turnover: 4.2, target: 4.0 }
    ];
  };

  const procurementTrendData = getProcurementTrendData();
  const categoryData = getCategoryData();
  const supplierData = getSupplierComparisonData();
  const inventoryData = getInventoryTurnoverData();

  // 采购趋势图配置
  const trendConfig = {
    data: procurementTrendData.map(item => ({
      ...item,
      amount: item.amount || 0
    })),
    xField: 'date',
    yField: 'amount',
    smooth: true,
    color: '#1890ff',
    point: {
      size: 4,
      shape: 'circle',
    },
    tooltip: {
      formatter: (datum: any) => {
        return {
          name: '采购金额',
          value: `￥${((datum.amount || 0) / 10000).toFixed(1)}万`
        };
      }
    },
    yAxis: {
      label: {
        formatter: (v: string) => `￥${(parseInt(v || '0') / 10000).toFixed(0)}万`
      }
    }
  };

  // 订单数量柱状图配置
  const orderConfig = {
    data: procurementTrendData.map(item => ({
      ...item,
      orders: item.orders || 0
    })),
    xField: 'date',
    yField: 'orders',
    color: '#52c41a',
    columnWidthRatio: 0.6,
    tooltip: {
      formatter: (datum: any) => {
        return {
          name: '订单数量',
          value: `${datum.orders || 0}个`
        };
      }
    }
  };

  // 分类饼图配置
  const pieConfig = {
    data: categoryData.map(item => ({
      ...item,
      value: item.value || 0,
      percentage: item.percentage || 0
    })),
    angleField: 'value',
    colorField: 'category',
    radius: 0.8,
    innerRadius: 0.4,
    label: {
      offset: '-30%',
      content: ({ percentage }: any) => `${((percentage || 0) * 100).toFixed(1)}%`,
      style: {
        fontSize: 12,
        textAlign: 'center',
      },
    },
    legend: {
      position: 'bottom',
    },
    tooltip: {
      formatter: (datum: any) => {
        return {
          name: datum.category,
          value: `￥${((datum.value || 0) / 10000).toFixed(1)}万`
        };
      }
    },
    color: ['#1890ff', '#52c41a', '#faad14']
  };

  // 供应商对比图配置
  const supplierConfig = {
    data: supplierData.flatMap(item => [
      { supplier: item.supplier, period: '本月', value: item.thisMonth || 0 },
      { supplier: item.supplier, period: '上月', value: item.lastMonth || 0 }
    ]).filter(item => item.supplier && item.value !== undefined && !isNaN(item.value)),
    xField: 'supplier',
    yField: 'value',
    seriesField: 'period',
    isGroup: true,
    columnWidthRatio: 0.6,
    color: ['#1890ff', '#faad14'],
    tooltip: {
      formatter: (datum: any) => {
        return {
          name: datum.period,
          value: `￥${((datum.value || 0) / 10000).toFixed(1)}万`
        };
      }
    },
    yAxis: {
      label: {
        formatter: (v: string) => `￥${(parseInt(v || '0') / 10000).toFixed(0)}万`
      }
    }
  };

  // 库存周转率趋势图配置
  const inventoryConfig = {
    data: inventoryData.flatMap(item => [
      { month: item.month, type: '实际值', value: item.turnover || 0 },
      { month: item.month, type: '目标值', value: item.target || 0 }
    ]).filter(item => item.month && item.value !== undefined && !isNaN(item.value)),
    xField: 'month',
    yField: 'value',
    seriesField: 'type',
    smooth: true,
    color: ['#1890ff', '#ff4d4f'],
    point: {
      size: 4,
      shape: 'circle',
    },
    tooltip: {
      formatter: (datum: any) => {
        return {
          name: datum.type,
          value: `${(datum.value || 0).toFixed(1)}次/年`
        };
      }
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">趋势分析与对比</h3>
      
      <Row gutter={[16, 16]}>
        {/* 采购金额趋势 */}
        <Col xs={24} lg={12}>
          <Card title="采购金额趋势" size="small">
            <Line {...trendConfig} height={250} />
          </Card>
        </Col>

        {/* 订单数量趋势 */}
        <Col xs={24} lg={12}>
          <Card title="订单数量趋势" size="small">
            <Column {...orderConfig} height={250} />
          </Card>
        </Col>

        {/* 采购分类占比 */}
        <Col xs={24} lg={12}>
          <Card title="采购分类占比" size="small">
            <Pie {...pieConfig} height={250} />
          </Card>
        </Col>

        {/* 供应商对比 */}
        <Col xs={24} lg={12}>
          <Card title="主要供应商对比" size="small">
            <Column {...supplierConfig} height={250} />
          </Card>
        </Col>

        {/* 库存周转率趋势 */}
        <Col xs={24}>
          <Card title="库存周转率趋势" size="small">
            <Line {...inventoryConfig} height={200} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TrendCharts;