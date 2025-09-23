import React from 'react';
import { List, Badge, Tag, Avatar } from 'antd';
import { 
  ExclamationCircleOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  WarningOutlined 
} from '@ant-design/icons';
import { ProcurementNotification } from '../../types/procurement';

interface ProcurementNotificationsProps {
  notifications: ProcurementNotification[];
  onNotificationClick?: (notification: ProcurementNotification) => void;
}

const ProcurementNotifications: React.FC<ProcurementNotificationsProps> = ({
  notifications,
  onNotificationClick
}) => {
  const getNotificationIcon = (type: string) => {
    const iconMap = {
      approval_needed: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
      delivery_delayed: <ClockCircleOutlined style={{ color: '#ff7875' }} />,
      order_completed: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      supplier_issue: <WarningOutlined style={{ color: '#ff4d4f' }} />
    };
    return iconMap[type as keyof typeof iconMap] || <ExclamationCircleOutlined />;
  };

  const getPriorityColor = (priority: string) => {
    const colorMap = {
      low: 'default',
      medium: 'warning',
      high: 'error',
      urgent: 'error'
    };
    return colorMap[priority as keyof typeof colorMap] || 'default';
  };

  const getPriorityText = (priority: string) => {
    const textMap = {
      low: '低',
      medium: '中',
      high: '高',
      urgent: '紧急'
    };
    return textMap[priority as keyof typeof textMap] || priority;
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now.getTime() - time.getTime();
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 60) {
      return `${minutes}分钟前`;
    } else if (hours < 24) {
      return `${hours}小时前`;
    } else {
      return `${days}天前`;
    }
  };

  return (
    <List
      itemLayout="horizontal"
      dataSource={notifications}
      renderItem={(item) => (
        <List.Item
          className={`cursor-pointer hover:bg-gray-50 transition-colors ${
            !item.isRead ? 'bg-blue-50' : ''
          }`}
          onClick={() => onNotificationClick?.(item)}
        >
          <List.Item.Meta
            avatar={
              <Badge dot={!item.isRead}>
                <Avatar 
                  icon={getNotificationIcon(item.type)}
                  style={{ backgroundColor: '#f5f5f5' }}
                />
              </Badge>
            }
            title={
              <div className="flex justify-between items-start">
                <span className={`${!item.isRead ? 'font-semibold' : ''}`}>
                  {item.title}
                </span>
                <Tag color={getPriorityColor(item.priority)} className="text-xs">
                  {getPriorityText(item.priority)}
                </Tag>
              </div>
            }
            description={
              <div className="space-y-1">
                <div className={`text-sm ${!item.isRead ? 'text-gray-700' : 'text-gray-500'}`}>
                  {item.description}
                </div>
                <div className="text-xs text-gray-400">
                  {formatTime(item.timestamp)}
                </div>
              </div>
            }
          />
        </List.Item>
      )}
    />
  );
};

export default ProcurementNotifications;