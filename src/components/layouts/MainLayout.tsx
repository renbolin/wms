import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Badge } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  DashboardOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined,
  ShoppingOutlined,
  InboxOutlined,
  AppstoreOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import ThemeToggle from '@/components/ThemeToggle';
import Breadcrumb from '@/components/Breadcrumb';

const { Header, Sider, Content } = Layout;

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '仪表盘',
    },
    {
          key: '/procurement',
          icon: <ShoppingOutlined />,
          label: '采购管理',
          children: [
            {
              key: '/procurement/application',
              label: '采购申请',
            },
            {
              key: '/procurement/requisition',
              label: '采购需求',
            },
            {
              key: '/procurement/quotation',
              label: '询价台账',
            },
            {
              key: '/procurement/order',
              label: '采购订单',
            },
            {
              key: '/procurement/delivery-notes',
              label: '到货单管理',
            },
            {
              key: '/procurement/receiving',
              label: '入库处理',
            },
            {
              key: '/procurement/supplier',
              label: '供应商管理',
            },
            {
              key: '/procurement/approval-workflow',
              label: '审批流程配置',
            },
          ],
        },
    {
          key: '/inventory',
          icon: <InboxOutlined />,
          label: '库存管理',
          children: [
            {
              key: '/inventory/in',
              label: '入库管理',
            },
            {
              key: '/inventory/out',
              label: '出库管理',
            },
            {
              key: '/inventory/stock',
              label: '库存查询',
            },
            {
              key: '/inventory/ledger',
              label: '库存台账',
            },
            {
              key: '/inventory/transfer',
              label: '库存调拨',
            },
            {
              key: '/inventory/scrap',
              label: '报损报废',
            },
            {
              key: '/inventory/alert',
              label: '库存预警',
            },
            {
              key: '/inventory/check',
              label: '库存盘点',
            },
            {
              key: '/inventory/mobile-scan',
              label: '移动扫码',
            },
            {
              key: '/inventory/age-analysis',
              label: '库龄分析',
            },
            {
              key: '/inventory/batch-management',
              label: '批次管理',
            },
          ],
        },
    {
      key: '/asset',
      icon: <AppstoreOutlined />,
      label: '固定资产',
      children: [
        {
          key: '/asset/register',
          label: '资产建档',
        },
        {
          key: '/asset/warehouse',
          label: '仓库管理',
        },
        {
          key: '/asset/borrow',
          label: '资产领用',
        },
        {
          key: '/asset/transfer',
          label: '资产调拨',
        },
        {
          key: '/asset/maintenance',
          label: '资产维护',
        },
        {
          key: '/asset/inventory',
          label: '资产盘点',
        },
        {
          key: '/asset/retirement',
          label: '资产报废',
        },
        {
          key: '/asset/report',
          label: '资产报表',
        },
      ],
    },
    {
      key: '/system',
      icon: <SettingOutlined />,
      label: '系统管理',
      children: [
        {
          key: '/system/users',
          label: '用户管理',
        },
        {
          key: '/system/roles',
          label: '角色管理',
        },
        {
          key: '/system/permissions',
          label: '权限管理',
        },
      ],
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '个人设置',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
    },
  ];

  const handleMenuClick = (e: { key: string }) => {
    navigate(e.key);
  };

  const handleUserMenuClick = (e: { key: string }) => {
    if (e.key === 'logout') {
      // 处理登出逻辑
      navigate('/login');
    } else if (e.key === 'profile') {
      navigate('/profile');
    } else if (e.key === 'settings') {
      navigate('/settings');
    }
  };

  // 获取当前选中的菜单项
  const getSelectedKeys = () => {
    const pathname = location.pathname;
    // 如果是子路由，需要找到父路由
    if (pathname.includes('/system/')) {
      return [pathname, '/system'];
    }
    return [pathname];
  };

  return (
    <Layout className="min-h-screen">
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        className="h-screen fixed left-0 top-0 z-10"
        style={{ 
          overflowY: 'auto',
          overflowX: 'hidden'
        }}
      >
        <div className="logo">
          {collapsed ? 'RA' : 'React Admin'}
        </div>
        <div style={{ 
          height: 'calc(100vh - 64px)', 
          overflowY: 'auto',
          overflowX: 'hidden'
        }}>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={getSelectedKeys()}
            defaultOpenKeys={['/system']}
            items={menuItems}
            onClick={handleMenuClick}
            style={{ 
              border: 'none',
              height: '100%'
            }}
          />
        </div>
      </Sider>
      <Layout className={cn("transition-all duration-300", collapsed ? "ml-[80px]" : "ml-[200px]")}>
        <Header className="bg-white p-0 flex justify-between items-center px-4">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="text-lg"
          />
          <div className="flex items-center">
            <Badge count={5}>
              <Button 
                type="text" 
                icon={<BellOutlined />} 
                className="mr-2"
              />
            </Badge>
            <ThemeToggle className="mr-2" />
            <Dropdown
              menu={{
                items: userMenuItems,
                onClick: handleUserMenuClick,
              }}
              placement="bottomRight"
            >
              <div className="flex items-center cursor-pointer">
                <Avatar icon={<UserOutlined />} />
                <span className="ml-2 hidden md:inline">管理员</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content className="p-6">
          <div className="bg-white p-4 mb-4 rounded-md">
            <Breadcrumb />
          </div>
          <div className="bg-white p-6 rounded-md min-h-[calc(100vh-200px)]">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;