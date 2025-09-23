import React from 'react';
import { Table, Tag, Button, Space, Tooltip } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import { ProcurementOrder } from '../../types/procurement';

interface ProcurementOrderListProps {
  orders: ProcurementOrder[];
  loading?: boolean;
  onView?: (order: ProcurementOrder) => void;
  onEdit?: (order: ProcurementOrder) => void;
  onDelete?: (order: ProcurementOrder) => void;
}

const ProcurementOrderList: React.FC<ProcurementOrderListProps> = ({
  orders,
  loading = false,
  onView,
  onEdit,
  onDelete
}) => {
  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: 'orange',
      approved: 'blue',
      ordered: 'cyan',
      received: 'green',
      completed: 'success',
      cancelled: 'red'
    };
    return statusColors[status] || 'default';
  };

  const getStatusText = (status: string) => {
    const statusTexts: Record<string, string> = {
      pending: '待审批',
      approved: '已审批',
      ordered: '已下单',
      received: '已收货',
      completed: '已完成',
      cancelled: '已取消'
    };
    return statusTexts[status] || status;
  };

  const formatCurrency = (amount: number) => {
    return `￥${amount.toLocaleString()}`;
  };

  const columns: ColumnsType<ProcurementOrder> = [
    {
      title: '订单编号',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      width: 120,
      fixed: 'left',
      render: (text: string) => (
        <span className="font-mono text-blue-600">{text}</span>
      )
    },
    {
      title: '供应商',
      dataIndex: 'supplierName',
      key: 'supplierName',
      width: 150,
      ellipsis: {
        showTitle: false,
      },
      render: (text: string) => (
        <Tooltip placement="topLeft" title={text}>
          {text}
        </Tooltip>
      )
    },
    {
      title: '订单金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      align: 'right',
      render: (amount: number) => (
        <span className="font-semibold text-green-600">
          {formatCurrency(amount)}
        </span>
      ),
      sorter: (a, b) => a.totalAmount - b.totalAmount
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
      filters: [
        { text: '待审批', value: 'pending' },
        { text: '已审批', value: 'approved' },
        { text: '已下单', value: 'ordered' },
        { text: '已收货', value: 'received' },
        { text: '已完成', value: 'completed' },
        { text: '已取消', value: 'cancelled' }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: '创建日期',
      dataIndex: 'createdDate',
      key: 'createdDate',
      width: 110,
      render: (date: string) => new Date(date).toLocaleDateString('zh-CN'),
      sorter: (a, b) => new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime()
    },
    {
      title: '预计交货',
      dataIndex: 'expectedDelivery',
      key: 'expectedDelivery',
      width: 110,
      render: (date: string) => new Date(date).toLocaleDateString('zh-CN')
    },
    {
      title: '审批人',
      dataIndex: 'approvedBy',
      key: 'approvedBy',
      width: 100,
      render: (text: string) => text || '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => onView?.(record)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => onEdit?.(record)}
              disabled={record.status === 'completed' || record.status === 'cancelled'}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => onDelete?.(record)}
              disabled={record.status === 'completed'}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <Table
      columns={columns}
      dataSource={orders}
      rowKey="id"
      loading={loading}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => 
          `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`
      }}
      scroll={{ x: 1200 }}
      size="middle"
    />
  );
};

export default ProcurementOrderList;