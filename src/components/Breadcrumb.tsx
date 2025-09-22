import React from 'react';
import { Breadcrumb as AntBreadcrumb } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeOutlined, SettingOutlined, UserOutlined, SafetyOutlined, KeyOutlined,
  ShoppingOutlined, InboxOutlined, AppstoreOutlined, FileTextOutlined,
  ShoppingCartOutlined, TeamOutlined, ImportOutlined,
  ExportOutlined, DatabaseOutlined, CheckSquareOutlined, FormOutlined,
  SwapOutlined, ToolOutlined, DeleteOutlined, AuditOutlined
} from '@ant-design/icons';

const routeConfig: Record<string, { title: string; icon?: React.ReactNode }> = {
  '/': { title: '首页', icon: <HomeOutlined /> },
  
  // 采购管理
  '/procurement': { title: '采购管理', icon: <ShoppingOutlined /> },
  '/procurement/requisition': { title: '采购申请', icon: <FileTextOutlined /> },
  '/procurement/order': { title: '采购订单', icon: <ShoppingCartOutlined /> },
  '/procurement/supplier': { title: '供应商管理', icon: <TeamOutlined /> },
  '/procurement/approval-workflow': { title: '审批流程配置', icon: <AuditOutlined /> },

  
  // 库存管理
  '/inventory': { title: '库存管理', icon: <InboxOutlined /> },
  '/inventory/in': { title: '入库管理', icon: <ImportOutlined /> },
  '/inventory/out': { title: '出库管理', icon: <ExportOutlined /> },
  '/inventory/stock': { title: '库存查询', icon: <DatabaseOutlined /> },
  '/inventory/check': { title: '库存盘点', icon: <CheckSquareOutlined /> },
  
  // 固定资产管理
  '/asset': { title: '固定资产', icon: <AppstoreOutlined /> },
  '/asset/register': { title: '资产登记', icon: <FormOutlined /> },
  '/asset/transfer': { title: '资产调拨', icon: <SwapOutlined /> },
  '/asset/maintenance': { title: '资产维护', icon: <ToolOutlined /> },
  '/asset/retirement': { title: '资产报废', icon: <DeleteOutlined /> },
  
  // 系统管理
  '/system': { title: '系统管理', icon: <SettingOutlined /> },
  '/system/users': { title: '用户管理', icon: <UserOutlined /> },
  '/system/roles': { title: '角色管理', icon: <SafetyOutlined /> },
  '/system/permissions': { title: '权限管理', icon: <KeyOutlined /> },
};

const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const pathSnippets = location.pathname.split('/').filter(i => i);

  const homeItem = {
    key: '/',
    title: (
      <Link to="/">
        <HomeOutlined style={{ marginRight: 4 }} />
        首页
      </Link>
    ),
  };

  const extraBreadcrumbItems = pathSnippets.map((_, index) => {
    const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
    const config = routeConfig[url];
    if (!config) {
      return null;
    }
    const isLast = index === pathSnippets.length - 1;

    return {
      key: url,
      title: isLast ? (
        <span>
          {config.icon && React.cloneElement(config.icon as React.ReactElement, { style: { marginRight: 4 } })}
          {config.title}
        </span>
      ) : (
        <Link to={url}>
          {config.icon && React.cloneElement(config.icon as React.ReactElement, { style: { marginRight: 4 } })}
          {config.title}
        </Link>
      ),
    };
  }).filter((item): item is NonNullable<typeof item> => item !== null);


  const breadcrumbItems = [homeItem, ...extraBreadcrumbItems];

  return (
    <div style={{ 
      borderBottom: '1px solid #f0f0f0',
      marginBottom: '16px'
    }}>
      <AntBreadcrumb 
        items={breadcrumbItems}
        style={{ fontSize: '14px' }}
      />
    </div>
  );
};

export default Breadcrumb;