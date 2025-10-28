import React from 'react';
import { Breadcrumb as AntBreadcrumb } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeOutlined, SettingOutlined, UserOutlined, SafetyOutlined, KeyOutlined,
  ShoppingOutlined, InboxOutlined, AppstoreOutlined, FileTextOutlined,
  ShoppingCartOutlined, TeamOutlined, ImportOutlined,
  ExportOutlined, DatabaseOutlined, CheckSquareOutlined, FormOutlined,
  SwapOutlined, ToolOutlined, DeleteOutlined, AuditOutlined,
  TagOutlined, EnvironmentOutlined
} from '@ant-design/icons';

const routeConfig: Record<string, { title: string; icon?: React.ReactNode }> = {
  '/': { title: '首页', icon: <HomeOutlined /> },
  
  // 基础信息管理
  '/basic-info': { title: '基础信息管理', icon: <DatabaseOutlined /> },
  '/basic-info/warehouse': { title: '仓库管理', icon: <DatabaseOutlined /> },
  '/basic-info/supplier': { title: '供应商管理', icon: <TeamOutlined /> },
  '/basic-info/equipment-type': { title: '设备类型管理', icon: <AppstoreOutlined /> },
  '/basic-info/equipment-model': { title: '设备型号管理', icon: <TagOutlined /> },
  '/basic-info/brand': { title: '品牌管理', icon: <TagOutlined /> },
  
  // 采购管理
  '/procurement': { title: '采购管理', icon: <ShoppingOutlined /> },
  '/procurement/requisition': { title: '采购申请', icon: <FormOutlined /> },
  '/procurement/order': { title: '采购订单', icon: <ShoppingCartOutlined /> },
  '/procurement/delivery-notes': { title: '到货单管理', icon: <InboxOutlined /> },
  '/procurement/receiving': { title: '入库处理', icon: <ImportOutlined /> },
  '/procurement/approval-workflow': { title: '审批流程配置', icon: <AuditOutlined /> },
  
  // 库存管理
  '/inventory': { title: '库存管理', icon: <InboxOutlined /> },
  '/inventory/in': { title: '入库管理', icon: <ImportOutlined /> },
  '/inventory/out': { title: '出库管理', icon: <ExportOutlined /> },
  '/inventory/stock': { title: '库存查询', icon: <DatabaseOutlined /> },
  '/inventory/check': { title: '库存盘点', icon: <CheckSquareOutlined /> },
  
  // 固定资产管理
  '/asset': { title: '固定资产', icon: <AppstoreOutlined /> },
  '/asset/register': { title: '资产档案', icon: <FormOutlined /> },
  '/asset/transfer': { title: '资产调拨', icon: <SwapOutlined /> },
  '/asset/maintenance': { title: '资产维护', icon: <ToolOutlined /> },
  '/asset/retirement': { title: '资产报废', icon: <DeleteOutlined /> },
  
  // 设备档案（顶级菜单）
  '/equipment-archive': { title: '设备档案', icon: <FileTextOutlined /> },
  
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
          {config.icon && React.cloneElement(config.icon as React.ReactElement<any>, { style: { marginRight: 4 } })}
          {config.title}
        </span>
      ) : (
        <Link to={url}>
          {config.icon && React.cloneElement(config.icon as React.ReactElement<any>, { style: { marginRight: 4 } })}
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