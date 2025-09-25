import React, { useState } from 'react';
import { Card, Row, Col, Typography, Progress, Table, List, Avatar, Button, Modal, Descriptions, Tag } from 'antd';
import { Line, Column, Pie } from '@ant-design/plots';
import {
  ShoppingCartOutlined,
  FileTextOutlined,
  TeamOutlined,
  ToolOutlined,
  BellOutlined,
  UserOutlined,
  EyeOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  // 订单详情弹窗状态
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // 显示订单详情
  const showOrderDetails = (order: any) => {
    setSelectedOrder(order);
    setIsModalVisible(true);
  };

  // 关闭订单详情弹窗
  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedOrder(null);
  };

  // 趋势分析数据
  const trendData = [
    { month: '第一季', value: 3000 },
    { month: '第二季', value: 4000 },
    { month: '第三季', value: 3500 },
    { month: '第四季', value: 5000 },
  ];

  // 柱状图数据
  const columnData = [
    { category: '办公用品', value: 4200 },
    { category: '设备采购', value: 4800 },
    { category: '原材料', value: 5600 },
    { category: '服务外包', value: 6200 },
  ];

  // 饼图数据 - 修复数据缺失问题
  const pieData = [
    { type: '办公用品', value: 27, percentage: '27%' },
    { type: '设备采购', value: 25, percentage: '25%' },
    { type: '原材料', value: 18, percentage: '18%' },
    { type: '服务外包', value: 15, percentage: '15%' },
    { type: '其他', value: 15, percentage: '15%' },
  ];

  // 供应商对比数据
  const supplierData = [
    { supplier: '供应商A', value: 4500 },
    { supplier: '供应商B', value: 4200 },
    { supplier: '供应商C', value: 3800 },
    { supplier: '供应商D', value: 3200 },
    { supplier: '供应商E', value: 2800 },
    { supplier: '供应商F', value: 2200 },
  ];

  // 表格数据
  const tableData = [
    {
      key: '1',
      orderNo: 'PO-2024-001',
      supplier: '东方科技有限公司',
      category: '办公设备',
      amount: '¥ 125,000',
      status: '进行中',
      date: '2024/1/15',
      contact: '张经理',
      phone: '138-0000-1234',
      address: '北京市朝阳区科技园区',
      items: '笔记本电脑 x10, 打印机 x5',
      remark: '紧急采购，需要加急处理',
    },
    {
      key: '2',
      orderNo: 'PO-2024-002',
      supplier: '华联商贸',
      category: '办公用品',
      amount: '¥ 85,000',
      status: '已完成',
      date: '2024/1/12',
      contact: '李总',
      phone: '139-0000-5678',
      address: '上海市浦东新区商务区',
      items: '办公纸张 x100箱, 文具用品若干',
      remark: '常规采购订单',
    },
    {
      key: '3',
      orderNo: 'PO-2024-003',
      supplier: '鑫源设备',
      category: '生产设备',
      amount: '¥ 450,000',
      status: '待审核',
      date: '2024/1/10',
      contact: '王工程师',
      phone: '137-0000-9012',
      address: '广州市天河区工业园',
      items: '生产线设备 x1套, 配套工具',
      remark: '大额采购，需要技术评审',
    },
    {
      key: '4',
      orderNo: 'PO-2024-004',
      supplier: '绿色环保材料',
      category: '原材料',
      amount: '¥ 220,000',
      status: '进行中',
      date: '2024/1/8',
      contact: '陈主任',
      phone: '136-0000-3456',
      address: '深圳市南山区科技园',
      items: '环保材料 x500kg, 辅助材料',
      remark: '环保认证材料，质量要求高',
    },
  ];

  const columns = [
    { 
      title: '订单编号', 
      dataIndex: 'orderNo', 
      key: 'orderNo',
      width: 120,
    },
    { 
      title: '供应商', 
      dataIndex: 'supplier', 
      key: 'supplier',
      width: 150,
      ellipsis: true,
    },
    { 
      title: '类别', 
      dataIndex: 'category', 
      key: 'category',
      width: 100,
    },
    { 
      title: '金额', 
      dataIndex: 'amount', 
      key: 'amount',
      width: 100,
    },
    { 
      title: '状态', 
      dataIndex: 'status', 
      key: 'status',
      width: 80,
      render: (status: string) => {
        let color = 'default';
        if (status === '已完成') color = 'success';
        else if (status === '进行中') color = 'processing';
        else if (status === '待审核') color = 'warning';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    { 
      title: '日期', 
      dataIndex: 'date', 
      key: 'date',
      width: 100,
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: any, record: any) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => showOrderDetails(record)}
        >
          详情
        </Button>
      ),
    },
  ];

  // 通知数据
  const notifications = [
    {
      title: '采购申请',
      description: '新的采购申请等待审批',
      time: '2分钟前',
      type: 'warning',
    },
    {
      title: '库存预警',
      description: '办公用品库存不足',
      time: '5分钟前',
      type: 'error',
    },
    {
      title: '订单完成',
      description: 'PO-2024-001订单已完成',
      time: '10分钟前',
      type: 'success',
    },
    {
      title: '供应商评价',
      description: '请对华联商贸进行评价',
      time: '15分钟前',
      type: 'info',
    },
  ];

  return (
    <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Title level={2} style={{ marginBottom: '24px', color: '#1890ff' }}>
        趋势分析与统计
      </Title>

      {/* 顶部图表区域 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={12}>
          <Card title="采购金额趋势" style={{ height: '380px' }}>
            <div style={{ height: '300px', padding: '15px', overflow: 'hidden' }}>
              <Line
                data={trendData}
                xField="month"
                yField="value"
                smooth={true}
                color="#1890ff"
                point={{ size: 5, shape: 'diamond' }}
                height={270}
                autoFit={true}
                padding={[20, 20, 50, 50]}
              />
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="各类别采购金额" style={{ height: '380px' }}>
            <div style={{ height: '300px', padding: '15px', overflow: 'hidden' }}>
              <Column
                data={columnData}
                xField="category"
                yField="value"
                color="#1890ff"
                columnWidthRatio={0.6}
                height={270}
                autoFit={true}
                padding={[20, 20, 50, 50]}
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* 中间图表区域 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={12}>
          <Card title="采购分类占比" style={{ height: '380px' }}>
            <div style={{ height: '300px', padding: '15px', overflow: 'hidden' }}>
              <Pie
                data={pieData}
                angleField="value"
                colorField="type"
                radius={0.6}
                innerRadius={0.3}
                label={{
                  offset: '-50%',
                  content: '{value}%',
                  style: {
                    textAlign: 'center',
                    fontSize: 12,
                    fill: '#fff',
                  },
                }}
                legend={{
                  position: 'right',
                  offsetX: -20,
                  itemName: {
                    style: {
                      fontSize: 12,
                    },
                  },
                }}
                height={270}
                autoFit={true}
                padding={[20, 20, 20, 20]}
              />
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="主要供应商对比" style={{ height: '380px' }}>
            <div style={{ height: '300px', padding: '15px', overflow: 'hidden' }}>
              <Column
                data={supplierData}
                xField="supplier"
                yField="value"
                color="#52c41a"
                columnWidthRatio={0.5}
                height={270}
                autoFit={true}
                padding={[20, 20, 50, 50]}
                meta={{
                  supplier: {
                    alias: '供应商',
                  },
                  value: {
                    alias: '采购金额',
                  },
                }}
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* 统计卡片和环形图区域 */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col span={15}>
          <Row gutter={[16, 16]}>
            <Col span={6}>
              <Card style={{ 
                height: '120px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid #f0f0f0'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  height: '100%'
                }}>
                  <div style={{ 
                    width: '60px', 
                    height: '60px', 
                    borderRadius: '50%', 
                    backgroundColor: '#e6f7ff', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    marginRight: '16px',
                    flexShrink: 0
                  }}>
                    <ShoppingCartOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <Text strong style={{ fontSize: '28px', display: 'block', lineHeight: '1.2', color: '#262626' }}>10</Text>
                    <Text type="secondary" style={{ fontSize: '14px', marginTop: '4px' }}>合同数量</Text>
                  </div>
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card style={{ 
                height: '120px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid #f0f0f0'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  height: '100%'
                }}>
                  <div style={{ 
                    width: '60px', 
                    height: '60px', 
                    borderRadius: '50%', 
                    backgroundColor: '#fff2e8', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    marginRight: '16px',
                    flexShrink: 0
                  }}>
                    <FileTextOutlined style={{ fontSize: '24px', color: '#fa8c16' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <Text strong style={{ fontSize: '28px', display: 'block', lineHeight: '1.2', color: '#262626' }}>1137</Text>
                    <Text type="secondary" style={{ fontSize: '14px', marginTop: '4px' }}>待审核</Text>
                  </div>
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card style={{ 
                height: '120px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid #f0f0f0'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  height: '100%'
                }}>
                  <div style={{ 
                    width: '60px', 
                    height: '60px', 
                    borderRadius: '50%', 
                    backgroundColor: '#f6ffed', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    marginRight: '16px',
                    flexShrink: 0
                  }}>
                    <TeamOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <Text strong style={{ fontSize: '28px', display: 'block', lineHeight: '1.2', color: '#262626' }}>1000</Text>
                    <Text type="secondary" style={{ fontSize: '14px', marginTop: '4px' }}>人员数量</Text>
                  </div>
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card style={{ 
                height: '120px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid #f0f0f0'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  height: '100%'
                }}>
                  <div style={{ 
                    width: '60px', 
                    height: '60px', 
                    borderRadius: '50%', 
                    backgroundColor: '#f9f0ff', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    marginRight: '16px',
                    flexShrink: 0
                  }}>
                    <ToolOutlined style={{ fontSize: '24px', color: '#722ed1' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <Text strong style={{ fontSize: '28px', display: 'block', lineHeight: '1.2', color: '#262626' }}>5000</Text>
                    <Text type="secondary" style={{ fontSize: '14px', marginTop: '4px' }}>生产数量</Text>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </Col>
        <Col span={9}>
          <Row gutter={[16, 16]} style={{ marginTop: '-16px' }}>
            <Col span={12}>
              <Card style={{ 
                height: '120px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid #f0f0f0'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  height: '100%'
                }}>
                  <div style={{ 
                    width: '60px', 
                    height: '60px', 
                    marginRight: '16px',
                    flexShrink: 0
                  }}>
                    <Progress
                      type="circle"
                      percent={75}
                      size={60}
                      strokeColor="#52c41a"
                      strokeWidth={6}
                      format={() => ''}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <Text type="secondary" style={{ fontSize: '14px', display: 'block', marginBottom: '4px' }}>完成率</Text>
                    <Text strong style={{ fontSize: '28px', display: 'block', lineHeight: '1.2', color: '#262626' }}>75%</Text>
                    <Text type="secondary" style={{ fontSize: '12px', marginTop: '2px' }}>30个项目</Text>
                  </div>
                </div>
              </Card>
            </Col>
            <Col span={12}>
              <Card style={{ 
                height: '120px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid #f0f0f0'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  height: '100%'
                }}>
                  <div style={{ 
                    width: '60px', 
                    height: '60px', 
                    marginRight: '16px',
                    flexShrink: 0
                  }}>
                    <Progress
                      type="circle"
                      percent={85}
                      size={60}
                      strokeColor="#1890ff"
                      strokeWidth={6}
                      format={() => ''}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <Text type="secondary" style={{ fontSize: '14px', display: 'block', marginBottom: '4px' }}>库存周转率</Text>
                    <Text strong style={{ fontSize: '28px', display: 'block', lineHeight: '1.2', color: '#262626' }}>85%</Text>
                    <Text type="secondary" style={{ fontSize: '12px', marginTop: '2px' }}>1000次/年</Text>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* 底部数据表格和通知区域 */}
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="最近采购订单" style={{ height: '400px' }}>
            <Table
              dataSource={tableData}
              columns={columns}
              pagination={{ pageSize: 5 }}
              size="small"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card title="系统通知" style={{ height: '400px', overflow: 'hidden' }}>
            <div style={{ height: '340px', overflowY: 'auto', padding: '8px 0' }}>
              <List
                itemLayout="horizontal"
                dataSource={notifications.slice(0, 4)}
                split={false}
                renderItem={(item, index) => (
                  <List.Item 
                    style={{ 
                      padding: '8px 0', 
                      borderBottom: index < 3 ? '1px solid #f0f0f0' : 'none',
                      margin: '0 8px'
                    }}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          icon={<BellOutlined />} 
                          size={28}
                          style={{ 
                            backgroundColor: item.type === 'warning' ? '#faad14' : 
                                           item.type === 'error' ? '#ff4d4f' :
                                           item.type === 'success' ? '#52c41a' : '#1890ff'
                          }}
                        />
                      }
                      title={
                        <Text 
                          style={{ 
                            fontSize: '13px', 
                            fontWeight: 500,
                            lineHeight: '1.2',
                            display: 'block',
                            marginBottom: '2px'
                          }}
                        >
                          {item.title}
                        </Text>
                      }
                      description={
                        <div style={{ lineHeight: '1.3' }}>
                          <div style={{ 
                            fontSize: '12px', 
                            color: '#666',
                            marginBottom: '2px',
                            wordBreak: 'break-all'
                          }}>
                            {item.description}
                          </div>
                          <Text type="secondary" style={{ fontSize: '11px' }}>
                            {item.time}
                          </Text>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card title="快捷操作" style={{ height: '400px' }}>
            <div style={{ padding: '10px 0' }}>
              <Row gutter={[8, 8]}>
                <Col span={24}>
                  <Card 
                    size="small" 
                    style={{ 
                      textAlign: 'center', 
                      backgroundColor: '#f0f9ff',
                      border: '1px solid #91d5ff',
                      cursor: 'pointer'
                    }}
                    styles={{ body: { padding: '12px' } }}
                  >
                    <ShoppingCartOutlined style={{ fontSize: '20px', color: '#1890ff', marginBottom: '8px' }} />
                    <div style={{ fontSize: '12px', fontWeight: 'bold' }}>新建采购订单</div>
                  </Card>
                </Col>
                <Col span={24}>
                  <Card 
                    size="small" 
                    style={{ 
                      textAlign: 'center', 
                      backgroundColor: '#f6ffed',
                      border: '1px solid #b7eb8f',
                      cursor: 'pointer'
                    }}
                    styles={{ body: { padding: '12px' } }}
                  >
                    <TeamOutlined style={{ fontSize: '20px', color: '#52c41a', marginBottom: '8px' }} />
                    <div style={{ fontSize: '12px', fontWeight: 'bold' }}>供应商管理</div>
                  </Card>
                </Col>
                <Col span={24}>
                  <Card 
                    size="small" 
                    style={{ 
                      textAlign: 'center', 
                      backgroundColor: '#fff2e8',
                      border: '1px solid #ffd591',
                      cursor: 'pointer'
                    }}
                    styles={{ body: { padding: '12px' } }}
                  >
                    <FileTextOutlined style={{ fontSize: '20px', color: '#fa8c16', marginBottom: '8px' }} />
                    <div style={{ fontSize: '12px', fontWeight: 'bold' }}>库存盘点</div>
                  </Card>
                </Col>
                <Col span={24}>
                  <Card 
                    size="small" 
                    style={{ 
                      textAlign: 'center', 
                      backgroundColor: '#f9f0ff',
                      border: '1px solid #d3adf7',
                      cursor: 'pointer'
                    }}
                    styles={{ body: { padding: '12px' } }}
                  >
                    <ToolOutlined style={{ fontSize: '20px', color: '#722ed1', marginBottom: '8px' }} />
                    <div style={{ fontSize: '12px', fontWeight: 'bold' }}>资产维护</div>
                  </Card>
                </Col>
              </Row>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 订单详情弹窗 */}
      <Modal
        title="采购订单详情"
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={[
          <Button key="close" onClick={handleModalClose}>
            关闭
          </Button>,
        ]}
        width={600}
      >
        {selectedOrder && (
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="订单编号" span={2}>
              <strong>{selectedOrder.orderNo}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="供应商">
              {selectedOrder.supplier}
            </Descriptions.Item>
            <Descriptions.Item label="联系人">
              {selectedOrder.contact}
            </Descriptions.Item>
            <Descriptions.Item label="联系电话">
              {selectedOrder.phone}
            </Descriptions.Item>
            <Descriptions.Item label="供应商地址" span={1}>
              {selectedOrder.address}
            </Descriptions.Item>
            <Descriptions.Item label="采购类别">
              {selectedOrder.category}
            </Descriptions.Item>
            <Descriptions.Item label="采购金额">
              <strong style={{ color: '#1890ff', fontSize: '16px' }}>
                {selectedOrder.amount}
              </strong>
            </Descriptions.Item>
            <Descriptions.Item label="订单状态">
              {selectedOrder.status === '已完成' && <Tag color="success">已完成</Tag>}
              {selectedOrder.status === '进行中' && <Tag color="processing">进行中</Tag>}
              {selectedOrder.status === '待审核' && <Tag color="warning">待审核</Tag>}
            </Descriptions.Item>
            <Descriptions.Item label="创建日期">
              {selectedOrder.date}
            </Descriptions.Item>
            <Descriptions.Item label="采购物品" span={2}>
              {selectedOrder.items}
            </Descriptions.Item>
            <Descriptions.Item label="备注说明" span={2}>
              {selectedOrder.remark}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default Dashboard;