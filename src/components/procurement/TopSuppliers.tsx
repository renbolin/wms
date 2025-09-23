import React from 'react';
import { List, Avatar, Progress } from 'antd';
import { ShopOutlined } from '@ant-design/icons';
import { ProcurementStats } from '../../types/procurement';

interface TopSuppliersProps {
  suppliers: ProcurementStats['topSuppliers'];
  totalAmount: number;
}

const TopSuppliers: React.FC<TopSuppliersProps> = ({ suppliers, totalAmount }) => {
  const formatCurrency = (amount: number) => {
    return `￥${(amount / 10000).toFixed(1)}万`;
  };

  const getPercentage = (amount: number) => {
    return ((amount / totalAmount) * 100).toFixed(1);
  };

  const getAvatarColor = (index: number) => {
    const colors = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae'];
    return colors[index % colors.length];
  };

  return (
    <List
      itemLayout="horizontal"
      dataSource={suppliers}
      renderItem={(item, index) => (
        <List.Item>
          <List.Item.Meta
            avatar={
              <Avatar 
                style={{ backgroundColor: getAvatarColor(index) }}
                icon={<ShopOutlined />}
              />
            }
            title={
              <div className="flex justify-between items-center">
                <span className="font-medium">{item.name}</span>
                <span className="text-sm text-gray-500">
                  {item.orders}单
                </span>
              </div>
            }
            description={
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-green-600 font-semibold">
                    {formatCurrency(item.amount)}
                  </span>
                  <span className="text-xs text-gray-400">
                    占比 {getPercentage(item.amount)}%
                  </span>
                </div>
                <Progress 
                  percent={parseFloat(getPercentage(item.amount))} 
                  size="small" 
                  showInfo={false}
                  strokeColor={getAvatarColor(index)}
                />
              </div>
            }
          />
        </List.Item>
      )}
    />
  );
};

export default TopSuppliers;