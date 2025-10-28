import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Select, DatePicker, Button, Space, Tag, Progress, Tooltip } from 'antd';
import { BarChartOutlined, PieChartOutlined, LineChartOutlined, DownloadOutlined } from '@ant-design/icons';
import { Bar, Pie, Line } from '@ant-design/plots';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

// 库龄分析数据接口
interface AgeAnalysisData {
  id: string;
  itemCode: string;
  itemName: string;
  specification: string;
  category: string;
  warehouse: string;
  currentStock: number;
  unitPrice: number;
  totalValue: number;
  firstInDate: string;
  lastInDate: string;
  lastOutDate: string;
  ageInDays: number;
  ageCategory: 'fresh' | 'normal' | 'aging' | 'stagnant';
  ageCategoryText: string;
  turnoverRate: number;
  riskLevel: 'low' | 'medium' | 'high';
  riskLevelText: string;
}

// 库龄统计接口
interface AgeStatistics {
  ageRange: string;
  itemCount: number;
  totalValue: number;
  percentage: number;
}

// 周转率统计接口
interface TurnoverStatistics {
  month: string;
  turnoverRate: number;
  totalValue: number;
}

const AgeAnalysis: React.FC = () => {
  const [data, setData] = useState<AgeAnalysisData[]>([]);
  const [filteredData, setFilteredData] = useState<AgeAnalysisData[]>([]);
  const [ageStats, setAgeStats] = useState<AgeStatistics[]>([]);
  const [turnoverStats, setTurnoverStats] = useState<TurnoverStatistics[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);

  // 模拟数据
  const mockData: AgeAnalysisData[] = [
    {
      id: '1',
      itemCode: 'M001',
      itemName: '钢材',
      specification: 'Q235 20*30mm',
      category: '原材料',
      warehouse: '主仓库',
      currentStock: 75,
      unitPrice: 50,
      totalValue: 3750,
      firstInDate: '2024-01-15',
      lastInDate: '2024-01-15',
      lastOutDate: '2024-01-25',
      ageInDays: 15,
      ageCategory: 'fresh',
      ageCategoryText: '新鲜库存',
      turnoverRate: 2.5,
      riskLevel: 'low',
      riskLevelText: '低风险'
    },
    {
      id: '2',
      itemCode: 'C001',
      itemName: '化学试剂A',
      specification: '分析纯 500ml',
      category: '化学品',
      warehouse: '主仓库',
      currentStock: 30,
      unitPrice: 120,
      totalValue: 3600,
      firstInDate: '2024-01-20',
      lastInDate: '2024-01-20',
      lastOutDate: '2024-01-28',
      ageInDays: 10,
      ageCategory: 'fresh',
      ageCategoryText: '新鲜库存',
      turnoverRate: 3.0,
      riskLevel: 'low',
      riskLevelText: '低风险'
    },
    {
      id: '3',
      itemCode: 'O001',
      itemName: '办公用品A',
      specification: '标准规格',
      category: '办公用品',
      warehouse: '主仓库',
      currentStock: 100,
      unitPrice: 15,
      totalValue: 1500,
      firstInDate: '2023-11-15',
      lastInDate: '2023-12-20',
      lastOutDate: '2024-01-10',
      ageInDays: 75,
      ageCategory: 'normal',
      ageCategoryText: '正常库存',
      turnoverRate: 1.8,
      riskLevel: 'low',
      riskLevelText: '低风险'
    },
    {
      id: '4',
      itemCode: 'E001',
      itemName: '电子元件',
      specification: '集成电路 IC-001',
      category: '电子器件',
      warehouse: '主仓库',
      currentStock: 50,
      unitPrice: 25,
      totalValue: 1250,
      firstInDate: '2023-09-10',
      lastInDate: '2023-10-15',
      lastOutDate: '2023-12-20',
      ageInDays: 140,
      ageCategory: 'aging',
      ageCategoryText: '老化库存',
      turnoverRate: 0.8,
      riskLevel: 'medium',
      riskLevelText: '中风险'
    },
    {
      id: '5',
      itemCode: 'F001',
      itemName: '过时设备',
      specification: '旧型号设备',
      category: '设备',
      warehouse: '主仓库',
      currentStock: 5,
      unitPrice: 500,
      totalValue: 2500,
      firstInDate: '2023-06-01',
      lastInDate: '2023-06-01',
      lastOutDate: '2023-08-15',
      ageInDays: 240,
      ageCategory: 'stagnant',
      ageCategoryText: '呆滞库存',
      turnoverRate: 0.2,
      riskLevel: 'high',
      riskLevelText: '高风险'
    }
  ];

  // 模拟库龄统计数据
  const mockAgeStats: AgeStatistics[] = [
    { ageRange: '0-30天', itemCount: 15, totalValue: 45000, percentage: 35 },
    { ageRange: '31-60天', itemCount: 12, totalValue: 38000, percentage: 30 },
    { ageRange: '61-90天', itemCount: 8, totalValue: 25000, percentage: 20 },
    { ageRange: '91-180天', itemCount: 5, totalValue: 15000, percentage: 12 },
    { ageRange: '180天以上', itemCount: 3, totalValue: 5000, percentage: 3 }
  ];

  // 模拟周转率统计数据
  const mockTurnoverStats: TurnoverStatistics[] = [
    { month: '2023-07', turnoverRate: 1.2, totalValue: 120000 },
    { month: '2023-08', turnoverRate: 1.5, totalValue: 135000 },
    { month: '2023-09', turnoverRate: 1.8, totalValue: 150000 },
    { month: '2023-10', turnoverRate: 2.1, totalValue: 165000 },
    { month: '2023-11', turnoverRate: 2.3, totalValue: 180000 },
    { month: '2023-12', turnoverRate: 2.0, totalValue: 175000 },
    { month: '2024-01', turnoverRate: 2.2, totalValue: 185000 }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    setTimeout(() => {
      setData(mockData);
      setFilteredData(mockData);
      setAgeStats(mockAgeStats);
      setTurnoverStats(mockTurnoverStats);
      setLoading(false);
    }, 1000);
  };

  const handleFilter = () => {
    let filtered = data;

    if (selectedCategory) {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    if (selectedWarehouse) {
      filtered = filtered.filter(item => item.warehouse === selectedWarehouse);
    }

    if (dateRange && dateRange.length === 2) {
      const [start, end] = dateRange;
      filtered = filtered.filter(item => {
        const firstInDate = dayjs(item.firstInDate);
        return firstInDate.isAfter(start) && firstInDate.isBefore(end);
      });
    }

    setFilteredData(filtered);
  };

  const handleReset = () => {
    setSelectedCategory('');
    setSelectedWarehouse('');
    setDateRange([null, null]);
    setFilteredData(data);
  };

  const getAgeCategoryColor = (category: string) => {
    const colors = {
      fresh: 'success',
      normal: 'processing',
      aging: 'warning',
      stagnant: 'error',
    };
    return colors[category as keyof typeof colors] || 'default';
  };

  const getRiskLevelColor = (level: string) => {
    const colors = {
      low: 'success',
      medium: 'warning',
      high: 'error',
    };
    return colors[level as keyof typeof colors] || 'default';
  };

  const getTurnoverRateColor = (rate: number) => {
    if (rate >= 2) return '#52c41a';
    if (rate >= 1) return '#faad14';
    return '#ff4d4f';
  };

  // 计算统计数据
  const totalItems = filteredData.length;
  const totalValue = filteredData.reduce((sum, item) => sum + item.totalValue, 0);
  const freshItems = filteredData.filter(item => item.ageCategory === 'fresh').length;
  const stagnantItems = filteredData.filter(item => item.ageCategory === 'stagnant').length;
  const avgTurnoverRate = totalItems > 0 ? filteredData.reduce((sum, item) => sum + (item.turnoverRate || 0), 0) / totalItems : 0;

  // 图表配置
  const barConfig = {
    data: ageStats,
    xField: 'ageRange',
    yField: 'totalValue',
    color: '#1890ff',
    label: {
      position: 'middle' as const,
      style: {
        fill: '#FFFFFF',
        opacity: 0.6,
      },
      formatter: (v: any) => {
        if (typeof v.totalValue === 'number') {
          return `¥${v.totalValue.toLocaleString()}`;
        }
        return '';
      },
    },
    meta: {
      ageRange: { alias: '库龄范围' },
      totalValue: {
        alias: '库存金额',
        formatter: (v: number) => `¥${v.toLocaleString()}`,
      },
    },
  };

  const pieConfig = {
    data: ageStats,
    angleField: 'percentage',
    colorField: 'ageRange',
    radius: 0.8,
    label: {
      type: 'outer' as const,
      content: '{name} {percentage}%',
    },
    interactions: [{ type: 'element-active' }],
  };

  const lineConfig = {
    data: turnoverStats,
    xField: 'month',
    yField: 'turnoverRate',
    point: {
      size: 5,
      shape: 'diamond',
    },
    label: {
      style: {
        fill: '#aaa',
      },
    },
    meta: {
      month: { alias: '月份' },
      turnoverRate: { alias: '周转率' },
    },
  };

  const columns: ColumnsType<AgeAnalysisData> = [
    {
      title: '序号',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: '物料编码',
      dataIndex: 'itemCode',
      key: 'itemCode',
      width: 100,
    },
    {
      title: '物料名称',
      dataIndex: 'itemName',
      key: 'itemName',
      width: 150,
    },
    {
      title: '规格型号',
      dataIndex: 'specification',
      key: 'specification',
      width: 200,
      ellipsis: true,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
    },
    {
      title: '仓库',
      dataIndex: 'warehouse',
      key: 'warehouse',
      width: 100,
    },
    {
      title: '当前库存',
      dataIndex: 'currentStock',
      key: 'currentStock',
      width: 80,
      align: 'right',
    },
    {
      title: '库存金额',
      dataIndex: 'totalValue',
      key: 'totalValue',
      width: 100,
      align: 'right',
      render: (value) => `¥${value.toLocaleString()}`,
    },
    {
      title: '首次入库',
      dataIndex: 'firstInDate',
      key: 'firstInDate',
      width: 100,
    },
    {
      title: '最后出库',
      dataIndex: 'lastOutDate',
      key: 'lastOutDate',
      width: 100,
    },
    {
      title: '库龄(天)',
      dataIndex: 'ageInDays',
      key: 'ageInDays',
      width: 80,
      align: 'right',
      render: (value) => (
        <span style={{ 
          color: value <= 30 ? '#52c41a' : value <= 90 ? '#faad14' : '#ff4d4f',
          fontWeight: 'bold'
        }}>
          {value}
        </span>
      ),
    },
    {
      title: '库龄分类',
      dataIndex: 'ageCategoryText',
      key: 'ageCategory',
      width: 100,
      render: (text, record) => (
        <Tag color={getAgeCategoryColor(record.ageCategory)}>{text}</Tag>
      ),
    },
    {
      title: '周转率',
      dataIndex: 'turnoverRate',
      key: 'turnoverRate',
      width: 80,
      align: 'right',
      render: (value) => (
        <span style={{ color: getTurnoverRateColor(value), fontWeight: 'bold' }}>
          {value.toFixed(1)}
        </span>
      ),
    },
    {
      title: '风险等级',
      dataIndex: 'riskLevelText',
      key: 'riskLevel',
      width: 80,
      render: (text, record) => (
        <Tag color={getRiskLevelColor(record.riskLevel)}>{text}</Tag>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* 统计卡片 */}
      <Row gutter={16} className="mb-4">
        <Col span={6}>
          <Card>
            <Statistic
              title="库存品种数"
              value={totalItems}
              suffix="种"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="库存总金额"
              value={totalValue}
              precision={0}
              prefix="¥"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="新鲜库存"
              value={freshItems}
              suffix="种"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="呆滞库存"
              value={stagnantItems}
              suffix="种"
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 筛选条件 */}
      <Card className="mb-4">
        <Space size="middle" wrap>
          <span>分类：</span>
          <Select
            value={selectedCategory}
            onChange={setSelectedCategory}
            placeholder="请选择分类"
            style={{ width: 120 }}
            allowClear
          >
            <Option value="原材料">原材料</Option>
            <Option value="化学品">化学品</Option>
            <Option value="办公用品">办公用品</Option>
            <Option value="电子器件">电子器件</Option>
            <Option value="设备">设备</Option>
          </Select>
          
          <span>仓库：</span>
          <Select
            value={selectedWarehouse}
            onChange={setSelectedWarehouse}
            placeholder="请选择仓库"
            style={{ width: 120 }}
            allowClear
          >
            <Option value="主仓库">主仓库</Option>
            <Option value="分仓库">分仓库</Option>
            <Option value="临时仓库">临时仓库</Option>
          </Select>
          
          <span>入库日期：</span>
          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates || [null, null])}
            style={{ width: 240 }}
          />
          
          <Button type="primary" onClick={handleFilter}>
            筛选
          </Button>
          <Button onClick={handleReset}>
            重置
          </Button>
          <Button icon={<DownloadOutlined />}>
            导出
          </Button>
        </Space>
      </Card>

      {/* 图表区域 */}
      <Row gutter={16} className="mb-4">
        <Col span={8}>
          <Card title={<><BarChartOutlined /> 库龄分布金额</>}>
            <Bar {...barConfig} height={200} />
          </Card>
        </Col>
        <Col span={8}>
          <Card title={<><PieChartOutlined /> 库龄分布占比</>}>
            <Pie {...pieConfig} height={200} />
          </Card>
        </Col>
        <Col span={8}>
          <Card title={<><LineChartOutlined /> 周转率趋势</>}>
            <Line {...lineConfig} height={200} />
          </Card>
        </Col>
      </Row>

      {/* 平均周转率指标 */}
      <Row gutter={16} className="mb-4">
        <Col span={24}>
          <Card title="平均周转率">
            <Row gutter={16}>
              <Col span={6}>
                <Statistic
                  title="整体平均周转率"
                  value={avgTurnoverRate}
                  precision={2}
                  suffix="次/月"
                  valueStyle={{ color: getTurnoverRateColor(avgTurnoverRate) }}
                />
              </Col>
              <Col span={18}>
                <div style={{ marginTop: 16 }}>
                  <span>周转率评级：</span>
                  <Progress
                    percent={Math.min(avgTurnoverRate * 50, 100)}
                    status={avgTurnoverRate >= 2 ? 'success' : avgTurnoverRate >= 1 ? 'active' : 'exception'}
                    strokeColor={getTurnoverRateColor(avgTurnoverRate)}
                  />
                  <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                    <Tag color="success">优秀: ≥2.0</Tag>
                    <Tag color="warning">良好: 1.0-2.0</Tag>
                    <Tag color="error">较差: &lt;1.0</Tag>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* 详细数据表格 */}
      <Card title="库龄分析明细">
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1400 }}
          pagination={{
            total: filteredData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>
    </div>
  );
};

export default AgeAnalysis;