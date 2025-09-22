import React from 'react';
import { Row, Col, Card, Statistic, Table, Progress, List } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, UserOutlined, ShoppingOutlined, FileOutlined, TeamOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';

interface DataType {
  key: string;
  name: string;
  progress: number;
  status: string;
}

const columns: ColumnsType<DataType> = [
  {
    title: '项目名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '进度',
    dataIndex: 'progress',
    key: 'progress',
    render: (progress: number) => <Progress percent={progress} size="small" />,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    render: (status: string) => {
      const color = status === '进行中' ? 'blue' : status === '已完成' ? 'green' : 'volcano';
      return <span style={{ color }}>{status}</span>;
    },
  },
];

const data: DataType[] = [
  {
    key: '1',
    name: '产品设计',
    progress: 90,
    status: '进行中',
  },
  {
    key: '2',
    name: '开发任务',
    progress: 70,
    status: '进行中',
  },
  {
    key: '3',
    name: '测试任务',
    progress: 50,
    status: '进行中',
  },
  {
    key: '4',
    name: '上线准备',
    progress: 30,
    status: '进行中',
  },
  {
    key: '5',
    name: '市场推广',
    progress: 100,
    status: '已完成',
  },
];

const notificationData = [
  {
    title: '系统更新通知',
    description: '系统将于今晚22:00-23:00进行例行维护更新',
    time: '10分钟前',
  },
  {
    title: '新用户注册',
    description: '今日新增注册用户10人',
    time: '30分钟前',
  },
  {
    title: '服务器告警',
    description: '数据库服务器CPU使用率超过80%',
    time: '1小时前',
  },
  {
    title: '任务完成',
    description: '数据备份任务已完成',
    time: '2小时前',
  },
];

const Dashboard: React.FC = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">仪表盘</h2>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="用户总数"
              value={1128}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
            <div className="mt-2 text-sm text-green-500">
              <ArrowUpOutlined /> 较昨日增长 12%
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="订单数量"
              value={93}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
            <div className="mt-2 text-sm text-red-500">
              <ArrowDownOutlined /> 较昨日下降 5%
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="文章数量"
              value={56}
              prefix={<FileOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
            <div className="mt-2 text-sm text-green-500">
              <ArrowUpOutlined /> 较昨日增长 8%
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="团队成员"
              value={25}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <div className="mt-2 text-sm text-blue-500">
              <ArrowUpOutlined /> 较上月增长 2%
            </div>
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]} className="mt-6">
        <Col xs={24} lg={16}>
          <Card title="项目进度" className="h-full">
            <Table 
              columns={columns} 
              dataSource={data} 
              pagination={false} 
              size="middle"
              scroll={{ x: 600 }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="系统通知" className="h-full">
            <List
              itemLayout="horizontal"
              dataSource={notificationData}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={item.title}
                    description={item.description}
                  />
                  <div className="text-gray-400 text-sm">{item.time}</div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;