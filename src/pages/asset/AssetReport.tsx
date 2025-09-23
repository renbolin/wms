import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Select, DatePicker, Button, Table, Statistic, Progress, Divider, Space, message, Tabs, Alert } from 'antd';
import { BarChartOutlined, PieChartOutlined, LineChartOutlined, FileExcelOutlined, FilePdfOutlined, PrinterOutlined } from '@ant-design/icons';
import { Column, Pie, Line } from '@ant-design/plots';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

// 报表数据接口
interface AssetSummary {
  category: string;
  totalCount: number;
  totalValue: number;
  normalCount: number;
  repairCount: number;
  scrapCount: number;
  utilizationRate: number;
}

interface AssetTrend {
  month: string;
  newAssets: number;
  scrapAssets: number;
  totalAssets: number;
  totalValue: number;
}

interface AssetDistribution {
  department: string;
  count: number;
  value: number;
  percentage: number;
}

interface AssetAging {
  ageRange: string;
  count: number;
  percentage: number;
}

interface AssetMaintenance {
  assetCode: string;
  assetName: string;
  category: string;
  department: string;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  maintenanceCost: number;
  status: string;
}

const AssetReport: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('summary');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(1, 'year'),
    dayjs()
  ]);
  const [department, setDepartment] = useState<string>('all');
  const [category, setCategory] = useState<string>('all');
  
  // 报表数据
  const [summaryData, setSummaryData] = useState<AssetSummary[]>([]);
  const [trendData, setTrendData] = useState<AssetTrend[]>([]);
  const [distributionData, setDistributionData] = useState<AssetDistribution[]>([]);
  const [agingData, setAgingData] = useState<AssetAging[]>([]);
  const [maintenanceData, setMaintenanceData] = useState<AssetMaintenance[]>([]);

  // 模拟数据
  const mockSummaryData: AssetSummary[] = [
    {
      category: '电子设备',
      totalCount: 156,
      totalValue: 2850000,
      normalCount: 142,
      repairCount: 12,
      scrapCount: 2,
      utilizationRate: 91.0,
    },
    {
      category: '办公设备',
      totalCount: 89,
      totalValue: 450000,
      normalCount: 82,
      repairCount: 5,
      scrapCount: 2,
      utilizationRate: 92.1,
    },
    {
      category: '办公家具',
      totalCount: 234,
      totalValue: 680000,
      normalCount: 220,
      repairCount: 10,
      scrapCount: 4,
      utilizationRate: 94.0,
    },
    {
      category: '生产设备',
      totalCount: 67,
      totalValue: 5200000,
      normalCount: 58,
      repairCount: 8,
      scrapCount: 1,
      utilizationRate: 86.6,
    },
    {
      category: '车辆设备',
      totalCount: 12,
      totalValue: 1800000,
      normalCount: 11,
      repairCount: 1,
      scrapCount: 0,
      utilizationRate: 91.7,
    },
  ];

  const mockTrendData: AssetTrend[] = [
    { month: '2023-01', newAssets: 15, scrapAssets: 2, totalAssets: 520, totalValue: 9500000 },
    { month: '2023-02', newAssets: 8, scrapAssets: 1, totalAssets: 527, totalValue: 9650000 },
    { month: '2023-03', newAssets: 12, scrapAssets: 3, totalAssets: 536, totalValue: 9800000 },
    { month: '2023-04', newAssets: 6, scrapAssets: 2, totalAssets: 540, totalValue: 9850000 },
    { month: '2023-05', newAssets: 18, scrapAssets: 1, totalAssets: 557, totalValue: 10200000 },
    { month: '2023-06', newAssets: 10, scrapAssets: 4, totalAssets: 563, totalValue: 10300000 },
    { month: '2023-07', newAssets: 7, scrapAssets: 2, totalAssets: 568, totalValue: 10400000 },
    { month: '2023-08', newAssets: 14, scrapAssets: 3, totalAssets: 579, totalValue: 10650000 },
    { month: '2023-09', newAssets: 9, scrapAssets: 1, totalAssets: 587, totalValue: 10750000 },
    { month: '2023-10', newAssets: 11, scrapAssets: 2, totalAssets: 596, totalValue: 10900000 },
    { month: '2023-11', newAssets: 13, scrapAssets: 4, totalAssets: 605, totalValue: 11100000 },
    { month: '2023-12', newAssets: 16, scrapAssets: 2, totalAssets: 619, totalValue: 11350000 },
  ];

  const mockDistributionData: AssetDistribution[] = [
    { department: '技术部', count: 185, value: 3200000, percentage: 29.9 },
    { department: '生产部', count: 156, value: 4800000, percentage: 25.2 },
    { department: '行政部', count: 98, value: 1200000, percentage: 15.8 },
    { department: '销售部', count: 76, value: 980000, percentage: 12.3 },
    { department: '财务部', count: 45, value: 650000, percentage: 7.3 },
    { department: '后勤部', count: 59, value: 520000, percentage: 9.5 },
  ];

  const mockAgingData: AssetAging[] = [
    { ageRange: '1年以内', count: 156, percentage: 25.2 },
    { ageRange: '1-3年', count: 198, percentage: 32.0 },
    { ageRange: '3-5年', count: 142, percentage: 22.9 },
    { ageRange: '5-8年', count: 89, percentage: 14.4 },
    { ageRange: '8年以上', count: 34, percentage: 5.5 },
  ];

  const mockMaintenanceData: AssetMaintenance[] = [
    {
      assetCode: 'FA001',
      assetName: '激光打印机',
      category: '办公设备',
      department: '行政部',
      lastMaintenanceDate: '2023-10-15',
      nextMaintenanceDate: '2024-04-15',
      maintenanceCost: 1200,
      status: '正常',
    },
    {
      assetCode: 'FA002',
      assetName: '生产线设备A',
      category: '生产设备',
      department: '生产部',
      lastMaintenanceDate: '2023-11-20',
      nextMaintenanceDate: '2024-02-20',
      maintenanceCost: 8500,
      status: '待维护',
    },
    {
      assetCode: 'FA003',
      assetName: '服务器',
      category: '电子设备',
      department: '技术部',
      lastMaintenanceDate: '2023-12-01',
      nextMaintenanceDate: '2024-06-01',
      maintenanceCost: 3200,
      status: '正常',
    },
    {
      assetCode: 'FA004',
      assetName: '公务车',
      category: '车辆设备',
      department: '后勤部',
      lastMaintenanceDate: '2023-09-10',
      nextMaintenanceDate: '2024-01-10',
      maintenanceCost: 2800,
      status: '逾期',
    },
  ];

  useEffect(() => {
    setSummaryData(mockSummaryData);
    setTrendData(mockTrendData);
    setDistributionData(mockDistributionData);
    setAgingData(mockAgingData);
    setMaintenanceData(mockMaintenanceData);
  }, []);

  const handleQuery = () => {
    setLoading(true);
    // 模拟查询
    setTimeout(() => {
      setLoading(false);
      message.success('报表数据已更新');
    }, 1000);
  };

  const handleExport = (format: 'excel' | 'pdf') => {
    message.success(`正在导出${format.toUpperCase()}格式报表...`);
  };

  const handlePrint = () => {
    window.print();
  };

  // 资产汇总表格列
  const summaryColumns: ColumnsType<AssetSummary> = [
    {
      title: '资产类别',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: '总数量',
      dataIndex: 'totalCount',
      key: 'totalCount',
      render: (value) => value.toLocaleString(),
    },
    {
      title: '总价值(元)',
      dataIndex: 'totalValue',
      key: 'totalValue',
      render: (value) => `¥${value.toLocaleString()}`,
    },
    {
      title: '正常',
      dataIndex: 'normalCount',
      key: 'normalCount',
      render: (value) => value.toLocaleString(),
    },
    {
      title: '维修中',
      dataIndex: 'repairCount',
      key: 'repairCount',
      render: (value) => value.toLocaleString(),
    },
    {
      title: '已报废',
      dataIndex: 'scrapCount',
      key: 'scrapCount',
      render: (value) => value.toLocaleString(),
    },
    {
      title: '利用率',
      dataIndex: 'utilizationRate',
      key: 'utilizationRate',
      render: (value) => (
        <div>
          <Progress percent={value} size="small" />
          <span>{value}%</span>
        </div>
      ),
    },
  ];

  // 维护报表列
  const maintenanceColumns: ColumnsType<AssetMaintenance> = [
    {
      title: '资产编码',
      dataIndex: 'assetCode',
      key: 'assetCode',
    },
    {
      title: '资产名称',
      dataIndex: 'assetName',
      key: 'assetName',
    },
    {
      title: '资产类别',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: '所属部门',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: '上次维护',
      dataIndex: 'lastMaintenanceDate',
      key: 'lastMaintenanceDate',
    },
    {
      title: '下次维护',
      dataIndex: 'nextMaintenanceDate',
      key: 'nextMaintenanceDate',
    },
    {
      title: '维护费用',
      dataIndex: 'maintenanceCost',
      key: 'maintenanceCost',
      render: (value) => `¥${value.toLocaleString()}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          '正常': 'success',
          '待维护': 'warning',
          '逾期': 'error',
        };
        return <span style={{ color: colors[status as keyof typeof colors] || 'default' }}>{status}</span>;
      },
    },
  ];

  // 柱状图配置
  const columnConfig = {
    data: summaryData,
    xField: 'category',
    yField: 'totalValue',
    label: {
      position: 'middle' as const,
      style: {
        fill: '#FFFFFF',
        opacity: 0.6,
      },
    },
    meta: {
      category: { alias: '资产类别' },
      totalValue: { alias: '总价值' },
    },
  };

  // 饼图配置
  const pieConfig = {
    data: distributionData,
    angleField: 'count',
    colorField: 'department',
    radius: 0.8,
    label: {
      type: 'outer' as const,
      content: '{name} {percentage}',
    },
    interactions: [{ type: 'element-active' }],
  };

  // 折线图配置
  const lineConfig = {
    data: trendData,
    xField: 'month',
    yField: 'totalAssets',
    point: {
      size: 5,
      shape: 'diamond',
    },
    label: {},
    meta: {
      month: { alias: '月份' },
      totalAssets: { alias: '资产总数' },
    },
  };

  // 计算总计数据
  const totalAssets = summaryData.reduce((sum, item) => sum + item.totalCount, 0);
  const totalValue = summaryData.reduce((sum, item) => sum + item.totalValue, 0);
  const normalAssets = summaryData.reduce((sum, item) => sum + item.normalCount, 0);
  const avgUtilization = summaryData.length > 0 
    ? summaryData.reduce((sum, item) => sum + item.utilizationRate, 0) / summaryData.length 
    : 0;

  return (
    <div className="p-6">
      {/* 查询条件 */}
      <Card className="mb-4">
        <Row gutter={16} align="middle">
          <Col span={4}>
            <Select
              value={reportType}
              onChange={setReportType}
              style={{ width: '100%' }}
              placeholder="选择报表类型"
            >
              <Option value="summary">资产汇总报表</Option>
              <Option value="trend">资产趋势报表</Option>
              <Option value="distribution">资产分布报表</Option>
              <Option value="aging">资产老化报表</Option>
              <Option value="maintenance">维护报表</Option>
            </Select>
          </Col>
          <Col span={6}>
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={3}>
            <Select
              value={department}
              onChange={setDepartment}
              style={{ width: '100%' }}
              placeholder="选择部门"
            >
              <Option value="all">全部部门</Option>
              <Option value="技术部">技术部</Option>
              <Option value="生产部">生产部</Option>
              <Option value="行政部">行政部</Option>
              <Option value="销售部">销售部</Option>
              <Option value="财务部">财务部</Option>
              <Option value="后勤部">后勤部</Option>
            </Select>
          </Col>
          <Col span={3}>
            <Select
              value={category}
              onChange={setCategory}
              style={{ width: '100%' }}
              placeholder="选择类别"
            >
              <Option value="all">全部类别</Option>
              <Option value="电子设备">电子设备</Option>
              <Option value="办公设备">办公设备</Option>
              <Option value="办公家具">办公家具</Option>
              <Option value="生产设备">生产设备</Option>
              <Option value="车辆设备">车辆设备</Option>
            </Select>
          </Col>
          <Col span={8}>
            <Space>
              <Button type="primary" onClick={handleQuery} loading={loading}>
                查询
              </Button>
              <Button icon={<FileExcelOutlined />} onClick={() => handleExport('excel')}>
                导出Excel
              </Button>
              <Button icon={<FilePdfOutlined />} onClick={() => handleExport('pdf')}>
                导出PDF
              </Button>
              <Button icon={<PrinterOutlined />} onClick={handlePrint}>
                打印
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 统计卡片 */}
      <Row gutter={16} className="mb-4">
        <Col span={6}>
          <Card>
            <Statistic
              title="资产总数"
              value={totalAssets}
              suffix="件"
              valueStyle={{ color: '#1890ff' }}
              prefix={<BarChartOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="资产总值"
              value={totalValue}
              precision={0}
              formatter={(value) => `¥${Number(value).toLocaleString()}`}
              valueStyle={{ color: '#52c41a' }}
              prefix={<LineChartOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="正常资产"
              value={normalAssets}
              suffix="件"
              valueStyle={{ color: '#fa8c16' }}
              prefix={<PieChartOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均利用率"
              value={avgUtilization}
              precision={1}
              suffix="%"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 报表内容 */}
      <Card>
        <Tabs defaultActiveKey="summary" activeKey={reportType} onChange={setReportType}>
          <TabPane tab="资产汇总" key="summary">
            <div>
              <Alert
                message="资产汇总报表"
                description="按资产类别统计资产数量、价值和利用率情况"
                type="info"
                showIcon
                className="mb-4"
              />
              <Table
                columns={summaryColumns}
                dataSource={summaryData}
                rowKey="category"
                pagination={false}
                summary={() => (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0}><strong>合计</strong></Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                      <strong>{totalAssets.toLocaleString()}</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2}>
                      <strong>¥{totalValue.toLocaleString()}</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={3}>
                      <strong>{normalAssets.toLocaleString()}</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={4}>
                      <strong>{summaryData.reduce((sum, item) => sum + item.repairCount, 0).toLocaleString()}</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={5}>
                      <strong>{summaryData.reduce((sum, item) => sum + item.scrapCount, 0).toLocaleString()}</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={6}>
                      <strong>{avgUtilization.toFixed(1)}%</strong>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                )}
              />
              <Divider />
              <div style={{ height: 400 }}>
                <Column {...columnConfig} />
              </div>
            </div>
          </TabPane>

          <TabPane tab="资产趋势" key="trend">
            <div>
              <Alert
                message="资产趋势报表"
                description="显示资产数量和价值的月度变化趋势"
                type="info"
                showIcon
                className="mb-4"
              />
              <div style={{ height: 400 }}>
                <Line {...lineConfig} />
              </div>
            </div>
          </TabPane>

          <TabPane tab="资产分布" key="distribution">
            <div>
              <Alert
                message="资产分布报表"
                description="按部门统计资产分布情况"
                type="info"
                showIcon
                className="mb-4"
              />
              <Row gutter={16}>
                <Col span={12}>
                  <div style={{ height: 400 }}>
                    <Pie {...pieConfig} />
                  </div>
                </Col>
                <Col span={12}>
                  <Table
                    columns={[
                      { title: '部门', dataIndex: 'department', key: 'department' },
                      { title: '数量', dataIndex: 'count', key: 'count' },
                      { title: '价值', dataIndex: 'value', key: 'value', render: (value) => `¥${value.toLocaleString()}` },
                      { title: '占比', dataIndex: 'percentage', key: 'percentage', render: (value) => `${value}%` },
                    ]}
                    dataSource={distributionData}
                    rowKey="department"
                    pagination={false}
                    size="small"
                  />
                </Col>
              </Row>
            </div>
          </TabPane>

          <TabPane tab="资产老化" key="aging">
            <div>
              <Alert
                message="资产老化报表"
                description="按使用年限统计资产老化情况"
                type="info"
                showIcon
                className="mb-4"
              />
              <Table
                columns={[
                  { title: '使用年限', dataIndex: 'ageRange', key: 'ageRange' },
                  { title: '数量', dataIndex: 'count', key: 'count' },
                  { title: '占比', dataIndex: 'percentage', key: 'percentage', render: (value) => `${value}%` },
                  {
                    title: '占比图',
                    key: 'chart',
                    render: (_, record) => (
                      <Progress percent={record.percentage} size="small" showInfo={false} />
                    ),
                  },
                ]}
                dataSource={agingData}
                rowKey="ageRange"
                pagination={false}
              />
            </div>
          </TabPane>

          <TabPane tab="维护报表" key="maintenance">
            <div>
              <Alert
                message="维护报表"
                description="显示资产维护计划和执行情况"
                type="info"
                showIcon
                className="mb-4"
              />
              <Table
                columns={maintenanceColumns}
                dataSource={maintenanceData}
                rowKey="assetCode"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total) => `共 ${total} 条记录`,
                }}
              />
            </div>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default AssetReport;