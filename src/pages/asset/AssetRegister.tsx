import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Upload,
  message,
  Popconfirm,
  Tag,
  Descriptions,
  Row,
  Col,
  Divider,
  Tree,
  Layout,
  Radio,
  Tabs,
  InputNumber,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UploadOutlined,
  QrcodeOutlined,
  SearchOutlined,
  ReloadOutlined,
  FolderOutlined,
  FileOutlined,
  ExportOutlined,
  ImportOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { DataNode } from 'antd/es/tree';
import dayjs from 'dayjs';

const { Option } = Select;
const { Sider, Content } = Layout;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { TreeNode } = Tree;

// 设备类型树节点接口
interface DeviceTypeNode {
  key: string;
  title: string;
  parentKey?: string;
  level: number;
  deviceType: 'main' | 'auxiliary' | 'spare' | 'special' | 'general'; // 主设备、附属设备、备品备件、特种设备、一般设备
  description: string;
  children?: DeviceTypeNode[];
}

// 资产档案接口定义
interface AssetRecord {
  id: string;
  assetCode: string; // 唯一编号
  assetName: string;
  deviceTypeKey: string; // 设备类型
  deviceTypeName: string;
  deviceType: 'main' | 'auxiliary' | 'spare' | 'special' | 'general';
  specification: string;
  model: string;
  brand: string;
  manufacturer: string; // 生产厂商
  supplier: string;
  purchaseDate: string; // 购买日期
  storageDate: string; // 入库日期
  usageYears: number; // 使用年限
  location: string;
  maintenanceCycle: string; // 检修周期
  warrantyPeriod: number; // 保修期（月）
  warrantyYears: number; // 保修年限
  warrantyExpiry: string;
  serialNumber: string;
  qrCode: string;
  description: string;
  attachments: string[];
  createUser: string;
  createDate: string;
  updateUser: string;
  updateDate: string;
}

const AssetRegister: React.FC = () => {
  const [assetData, setAssetData] = useState<AssetRecord[]>([]);
  const [filteredData, setFilteredData] = useState<AssetRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAssetModalVisible, setIsAssetModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isTypeModalVisible, setIsTypeModalVisible] = useState(false);
  const [editingAsset, setEditingAsset] = useState<AssetRecord | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<AssetRecord | null>(null);
  const [editingType, setEditingType] = useState<DeviceTypeNode | null>(null);
  const [selectedTypeKey, setSelectedTypeKey] = useState<string>('');
  const [typeSearchText, setTypeSearchText] = useState<string>('');
  const [filteredTypeTree, setFilteredTypeTree] = useState<DeviceTypeNode[]>([]);
  const [assetForm] = Form.useForm();
  const [typeForm] = Form.useForm();
  const [searchForm] = Form.useForm();

  // 设备类型树数据
  const [deviceTypeTree, setDeviceTypeTree] = useState<DeviceTypeNode[]>([
    {
      key: 'main',
      title: '主设备',
      level: 1,
      deviceType: 'main',
      description: '主要生产设备',
      children: [
        {
          key: 'heat-exchange',
          title: '换热设备',
          parentKey: 'main',
          level: 2,
          deviceType: 'main',
          description: '换热设备',
          children: [
            {
              key: 'plate-heat-exchanger',
              title: '板式换热器',
              parentKey: 'heat-exchange',
              level: 3,
              deviceType: 'main',
              description: '板式换热器',
            },
            {
              key: 'absorption-heat-unit',
              title: '吸收式换热机组',
              parentKey: 'heat-exchange',
              level: 3,
              deviceType: 'main',
              description: '吸收式换热机组',
            },
            {
              key: 'tube-heat-exchanger',
              title: '管式换热器',
              parentKey: 'heat-exchange',
              level: 3,
              deviceType: 'main',
              description: '管式换热器',
            },
          ],
        },
      ],
    },
    {
      key: 'pump',
      title: '附属设备',
      level: 1,
      deviceType: 'auxiliary',
      description: '各类泵设备',
      children: [
        {
          key: 'circulation-pump',
          title: '循环泵',
          parentKey: 'pump',
          level: 2,
          deviceType: 'auxiliary',
          description: '循环泵',
        },
        {
          key: 'water-supply-pump',
          title: '补水泵',
          parentKey: 'pump',
          level: 2,
          deviceType: 'auxiliary',
          description: '补水泵',
        },
        {
          key: 'pressure-pump',
          title: '加压泵',
          parentKey: 'pump',
          level: 2,
          deviceType: 'auxiliary',
          description: '加压泵',
        },
        {
          key: 'sewage-pump',
          title: '溶污泵',
          parentKey: 'pump',
          level: 2,
          deviceType: 'auxiliary',
          description: '溶污泵',
        },
        {
          key: 'cooling-water-pump',
          title: '冷却水泵',
          parentKey: 'pump',
          level: 2,
          deviceType: 'auxiliary',
          description: '冷却水泵',
        },
        {
          key: 'fire-pump',
          title: '消防泵',
          parentKey: 'pump',
          level: 2,
          deviceType: 'auxiliary',
          description: '消防泵',
        },
        {
          key: 'benefit-pump',
          title: '益泵',
          parentKey: 'pump',
          level: 2,
          deviceType: 'auxiliary',
          description: '益泵',
        },
        {
          key: 'motor',
          title: '电机',
          parentKey: 'pump',
          level: 2,
          deviceType: 'auxiliary',
          description: '电机',
        },
        {
          key: 'pump-body',
          title: '泵体',
          parentKey: 'pump',
          level: 2,
          deviceType: 'auxiliary',
          description: '泵体',
        },
      ],
    },
    {
      key: 'valve',
      title: '备品备件',
      level: 1,
      deviceType: 'spare',
      description: '各类阀门设备',
      children: [
        {
          key: 'sewage-valve-waste',
          title: '排污阀（废）',
          parentKey: 'valve',
          level: 2,
          deviceType: 'spare',
          description: '排污阀（废）',
        },
        {
          key: 'electric-valve',
          title: '电动阀',
          parentKey: 'valve',
          level: 2,
          deviceType: 'spare',
          description: '电动阀',
        },
        {
          key: 'solenoid-valve',
          title: '电磁阀',
          parentKey: 'valve',
          level: 2,
          deviceType: 'spare',
          description: '电磁阀',
        },
        {
          key: 'connecting-valve',
          title: '连通阀',
          parentKey: 'valve',
          level: 2,
          deviceType: 'spare',
          description: '连通阀',
        },
        {
          key: 'manual-control-valve',
          title: '调节阀（手动）',
          parentKey: 'valve',
          level: 2,
          deviceType: 'spare',
          description: '调节阀（手动）',
        },
        {
          key: 'constant-pressure-valve',
          title: '恒压阀',
          parentKey: 'valve',
          level: 2,
          deviceType: 'spare',
          description: '恒压阀',
        },
        {
          key: 'self-acting-pressure-diff-valve',
          title: '自力式压差控制阀',
          parentKey: 'valve',
          level: 2,
          deviceType: 'spare',
          description: '自力式压差控制阀',
        },
        {
          key: 'needle-valve',
          title: '针型阀',
          parentKey: 'valve',
          level: 2,
          deviceType: 'spare',
          description: '针型阀',
        },
        {
          key: 'check-valve',
          title: '止回阀',
          parentKey: 'valve',
          level: 2,
          deviceType: 'spare',
          description: '止回阀',
        },
      ],
    },
    {
      key: 'special',
      title: '特种设备',
      level: 1,
      deviceType: 'special',
      description: '特种作业设备',
      children: [
        {
          key: 'special-pressure',
          title: '压力容器',
          parentKey: 'special',
          level: 2,
          deviceType: 'special',
          description: '压力容器设备',
        },
        {
          key: 'special-lifting',
          title: '起重设备',
          parentKey: 'special',
          level: 2,
          deviceType: 'special',
          description: '起重机械设备',
        },
      ],
    },
    {
      key: 'general',
      title: '一般设备',
      level: 1,
      deviceType: 'general',
      description: '一般通用设备',
      children: [
        {
          key: 'general-tools',
          title: '通用工具',
          parentKey: 'general',
          level: 2,
          deviceType: 'general',
          description: '通用工具设备',
        },
        {
          key: 'general-furniture',
          title: '办公家具',
          parentKey: 'general',
          level: 2,
          deviceType: 'general',
          description: '办公家具设备',
        },
      ],
    },
  ]);

  // 模拟资产档案数据
  const mockAssetData: AssetRecord[] = [
    {
      id: '1',
      assetCode: 'FA001',
      assetName: '板式换热器',
      deviceTypeKey: 'plate-heat-exchanger',
      deviceTypeName: '板式换热器',
      deviceType: 'main',
      specification: 'BR0.5-20-1.0-4/7-Ⅱ',
      model: 'BR0.5-20',
      brand: '阿法拉伐',
      manufacturer: '阿法拉伐集团',
      supplier: '阿法拉伐（上海）有限公司',
      purchaseDate: '2023-01-10',
      storageDate: '2023-01-15',
      usageYears: 15,
      location: '热力车间A区',
      maintenanceCycle: '每年一次',
      warrantyPeriod: 36,
      warrantyYears: 3,
      warrantyExpiry: '2026-01-15',
      serialNumber: 'ALF2023001',
      qrCode: 'QR_FA001',
      description: '主要换热设备，用于热水供应',
      attachments: ['购买发票.pdf', '保修卡.jpg'],
      createUser: '管理员',
      createDate: '2023-01-15 10:30:00',
      updateUser: '张三',
      updateDate: '2023-06-20 14:20:00',
    },
    {
      id: '2',
      assetCode: 'FA002',
      assetName: '循环泵',
      deviceTypeKey: 'circulation-pump',
      deviceTypeName: '循环泵',
      deviceType: 'auxiliary',
      specification: 'ISG50-160',
      model: 'ISG50-160',
      brand: '南方泵业',
      manufacturer: '南方泵业集团',
      supplier: '南方泵业股份有限公司',
      purchaseDate: '2023-02-15',
      storageDate: '2023-02-20',
      usageYears: 10,
      location: '热力车间B区',
      maintenanceCycle: '每半年一次',
      warrantyPeriod: 24,
      warrantyYears: 2,
      warrantyExpiry: '2025-02-20',
      serialNumber: 'NF2023002',
      qrCode: 'QR_FA002',
      description: '热水循环系统主泵',
      attachments: ['购买合同.pdf'],
      createUser: '管理员',
      createDate: '2023-02-20 09:15:00',
      updateUser: '李四',
      updateDate: '2023-05-10 11:30:00',
    },
    {
      id: '3',
      assetCode: 'FA003',
      assetName: '电动调节阀',
      deviceTypeKey: 'electric-valve',
      deviceTypeName: '电动阀',
      deviceType: 'auxiliary',
      specification: 'VB-7000',
      model: 'VB-7000-DN50',
      brand: '霍尼韦尔',
      manufacturer: '霍尼韦尔国际公司',
      supplier: '霍尼韦尔（中国）有限公司',
      purchaseDate: '2023-03-05',
      storageDate: '2023-03-10',
      usageYears: 8,
      location: '热力车间管道系统',
      maintenanceCycle: '每季度一次',
      warrantyPeriod: 24,
      warrantyYears: 2,
      warrantyExpiry: '2025-03-10',
      serialNumber: 'HW2023003',
      qrCode: 'QR_FA003',
      description: '热水系统流量调节阀门',
      attachments: ['设备手册.pdf', '安装图纸.dwg'],
      createUser: '管理员',
      createDate: '2023-03-10 16:45:00',
      updateUser: '王五',
      updateDate: '2023-04-15 09:20:00',
    },
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterTypeTree();
  }, [deviceTypeTree, typeSearchText]);

  // 过滤设备类型树
  const filterTypeTree = () => {
    if (!typeSearchText) {
      setFilteredTypeTree(deviceTypeTree);
      return;
    }

    const filterNodes = (nodes: DeviceTypeNode[]): DeviceTypeNode[] => {
      return nodes.reduce((acc: DeviceTypeNode[], node) => {
        const matchesSearch = node.title.toLowerCase().includes(typeSearchText.toLowerCase()) ||
                             node.description.toLowerCase().includes(typeSearchText.toLowerCase());
        
        let filteredChildren: DeviceTypeNode[] = [];
        if (node.children) {
          filteredChildren = filterNodes(node.children);
        }

        if (matchesSearch || filteredChildren.length > 0) {
          acc.push({
            ...node,
            children: filteredChildren.length > 0 ? filteredChildren : node.children
          });
        }

        return acc;
      }, []);
    };

    setFilteredTypeTree(filterNodes(deviceTypeTree));
  };

  const loadData = () => {
    setLoading(true);
    // 模拟API调用
    setTimeout(() => {
      setAssetData(mockAssetData);
      setFilteredData(mockAssetData);
      setLoading(false);
    }, 1000);
  };

  // 生成资产编号
  const generateAssetCode = (deviceTypeKey: string) => {
    const year = new Date().getFullYear();
    const typeCode = deviceTypeKey.split('-')[0].toUpperCase();
    const sequence = String(assetData.length + 1).padStart(4, '0');
    return `${typeCode}${year}${sequence}`;
  };

  // 搜索功能
  const handleSearch = (values: any) => {
    let filtered = [...assetData];
    
    if (values.assetCode) {
      filtered = filtered.filter(item => 
        item.assetCode.toLowerCase().includes(values.assetCode.toLowerCase())
      );
    }
    
    if (values.assetName) {
      filtered = filtered.filter(item => 
        item.assetName.toLowerCase().includes(values.assetName.toLowerCase())
      );
    }
    
    if (values.deviceTypeName) {
      filtered = filtered.filter(item => 
        item.deviceTypeName.toLowerCase().includes(values.deviceTypeName.toLowerCase())
      );
    }
    
    if (values.deviceType) {
      filtered = filtered.filter(item => item.deviceType === values.deviceType);
    }
    
    if (values.specification) {
      filtered = filtered.filter(item => 
        item.specification.toLowerCase().includes(values.specification.toLowerCase())
      );
    }
    
    if (values.model) {
      filtered = filtered.filter(item => 
        item.model.toLowerCase().includes(values.model.toLowerCase())
      );
    }
    
    if (values.brand) {
      filtered = filtered.filter(item => 
        item.brand.toLowerCase().includes(values.brand.toLowerCase())
      );
    }
    
    if (values.manufacturer) {
      filtered = filtered.filter(item => 
        item.manufacturer.toLowerCase().includes(values.manufacturer.toLowerCase())
      );
    }
    
    if (values.supplier) {
      filtered = filtered.filter(item => 
        item.supplier.toLowerCase().includes(values.supplier.toLowerCase())
      );
    }
    
    if (values.serialNumber) {
      filtered = filtered.filter(item => 
        item.serialNumber.toLowerCase().includes(values.serialNumber.toLowerCase())
      );
    }
    
    if (values.location) {
      filtered = filtered.filter(item => 
        item.location.toLowerCase().includes(values.location.toLowerCase())
      );
    }
    
    if (values.maintenanceCycle) {
      filtered = filtered.filter(item => 
        item.maintenanceCycle.toLowerCase().includes(values.maintenanceCycle.toLowerCase())
      );
    }
    
    if (values.usageYears) {
      filtered = filtered.filter(item => item.usageYears === values.usageYears);
    }
    
    if (values.warrantyYears) {
      filtered = filtered.filter(item => item.warrantyYears === values.warrantyYears);
    }
    
    if (values.storageDate && values.storageDate.length === 2) {
      const [startDate, endDate] = values.storageDate;
      filtered = filtered.filter(item => {
        const itemDate = dayjs(item.storageDate);
        return itemDate.isAfter(startDate.startOf('day')) && itemDate.isBefore(endDate.endOf('day'));
      });
    }
    
    if (values.warrantyExpiry && values.warrantyExpiry.length === 2) {
      const [startDate, endDate] = values.warrantyExpiry;
      filtered = filtered.filter(item => {
        const itemDate = dayjs(item.warrantyExpiry);
        return itemDate.isAfter(startDate.startOf('day')) && itemDate.isBefore(endDate.endOf('day'));
      });
    }
    
    if (values.createUser) {
      filtered = filtered.filter(item => 
        item.createUser.toLowerCase().includes(values.createUser.toLowerCase())
      );
    }
    
    if (values.createDate && values.createDate.length === 2) {
      const [startDate, endDate] = values.createDate;
      filtered = filtered.filter(item => {
        const itemDate = dayjs(item.createDate);
        return itemDate.isAfter(startDate.startOf('day')) && itemDate.isBefore(endDate.endOf('day'));
      });
    }
    
    setFilteredData(filtered);
  };

  const handleAdd = () => {
    setEditingAsset(null);
    assetForm.resetFields();
    setIsAssetModalVisible(true);
  };

  const handleEdit = (record: AssetRecord) => {
    setEditingAsset(record);
    assetForm.setFieldsValue({
      ...record,
      purchaseDate: dayjs(record.purchaseDate),
      warrantyExpiry: dayjs(record.warrantyExpiry),
    });
    setIsAssetModalVisible(true);
  };

  const handleDelete = (id: string) => {
    const newData = assetData.filter(item => item.id !== id);
    setAssetData(newData);
    setFilteredData(newData);
    message.success('删除成功');
  };

  const handleSubmit = async () => {
    try {
      const values = await assetForm.validateFields();
      
      if (editingAsset) {
        // 编辑
        const newData = assetData.map(item => 
          item.id === editingAsset.id 
            ? {
                ...item,
                ...values,
                purchaseDate: values.purchaseDate.format('YYYY-MM-DD'),
                warrantyExpiry: values.warrantyExpiry.format('YYYY-MM-DD'),
                updateUser: '当前用户',
                updateDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
              }
            : item
        );
        setAssetData(newData);
        setFilteredData(newData);
        message.success('修改成功');
      } else {
        // 新增
        const newAsset: AssetRecord = {
          id: String(Date.now()),
          ...values,
          assetCode: generateAssetCode(values.deviceTypeKey),
          purchaseDate: values.purchaseDate.format('YYYY-MM-DD'),
          warrantyExpiry: values.warrantyExpiry.format('YYYY-MM-DD'),
          qrCode: `QR_${generateAssetCode(values.deviceTypeKey)}`,
          attachments: [],
          createUser: '当前用户',
          createDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          updateUser: '当前用户',
          updateDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        };
        
        const newData = [...assetData, newAsset];
        setAssetData(newData);
        setFilteredData(newData);
        message.success('添加成功');
      }
      
      setIsAssetModalVisible(false);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handleDetail = (record: AssetRecord) => {
    setSelectedAsset(record);
    setIsDetailModalVisible(true);
  };

  // 设备类型管理
  const handleTypeSelect = (selectedKeys: React.Key[], info: any) => {
    if (selectedKeys.length > 0) {
      setSelectedTypeKey(selectedKeys[0] as string);
      // 根据选中的类型过滤资产数据
      const filtered = assetData.filter(item => item.deviceTypeKey === selectedKeys[0]);
      setFilteredData(filtered);
    }
  };

  const handleAddType = (parentKey?: string) => {
    setEditingType(null);
    typeForm.resetFields();
    if (parentKey) {
      typeForm.setFieldsValue({ parentKey });
    }
    setIsTypeModalVisible(true);
  };

  const handleEditType = (type: DeviceTypeNode) => {
    setEditingType(type);
    typeForm.setFieldsValue(type);
    setIsTypeModalVisible(true);
  };

  const handleDeleteType = (key: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '删除设备类型将同时删除其下所有子类型，确定要删除吗？',
      onOk: () => {
        const deleteNode = (nodes: DeviceTypeNode[]): DeviceTypeNode[] => {
          return nodes.filter(node => {
            if (node.key === key) {
              return false;
            }
            if (node.children) {
              node.children = deleteNode(node.children);
            }
            return true;
          });
        };
        setDeviceTypeTree(deleteNode(deviceTypeTree));
        message.success('删除成功');
      }
    });
  };

  const handleTypeSubmit = async () => {
    try {
      const values = await typeForm.validateFields();
      
      if (editingType) {
        // 编辑类型
        const updateNode = (nodes: DeviceTypeNode[]): DeviceTypeNode[] => {
          return nodes.map(node => {
            if (node.key === editingType.key) {
              return { ...node, ...values };
            }
            if (node.children) {
              node.children = updateNode(node.children);
            }
            return node;
          });
        };
        setDeviceTypeTree(updateNode(deviceTypeTree));
        message.success('修改成功');
      } else {
        // 新增类型
        const newType: DeviceTypeNode = {
          key: `type-${Date.now()}`,
          title: values.title,
          level: values.parentKey ? 2 : 1,
          deviceType: 'main', // 设置默认值为主设备
          description: values.description || '',
          parentKey: values.parentKey,
        };

        if (values.parentKey) {
          // 添加到父节点下
          const addToParent = (nodes: DeviceTypeNode[]): DeviceTypeNode[] => {
            return nodes.map(node => {
              if (node.key === values.parentKey) {
                return {
                  ...node,
                  children: [...(node.children || []), newType]
                };
              }
              if (node.children) {
                node.children = addToParent(node.children);
              }
              return node;
            });
          };
          setDeviceTypeTree(addToParent(deviceTypeTree));
        } else {
          // 添加为根节点
          setDeviceTypeTree([...deviceTypeTree, newType]);
        }
        message.success('添加成功');
      }
      
      setIsTypeModalVisible(false);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const columns: ColumnsType<AssetRecord> = [
    {
      title: '序号',
      key: 'index',
      width: 60,
      fixed: 'left',
      render: (_, __, index) => index + 1,
    },
    {
      title: '资产编号',
      dataIndex: 'assetCode',
      key: 'assetCode',
      width: 120,
      fixed: 'left',
    },
    {
      title: '资产名称',
      dataIndex: 'assetName',
      key: 'assetName',
      width: 150,
    },
    {
      title: '设备类型',
      dataIndex: 'deviceTypeName',
      key: 'deviceTypeName',
      width: 100,
    },
    {
      title: '规格型号',
      dataIndex: 'specification',
      key: 'specification',
      width: 150,
    },
    {
      title: '品牌',
      dataIndex: 'brand',
      key: 'brand',
      width: 100,
    },
    {
      title: '生产厂商',
      dataIndex: 'manufacturer',
      key: 'manufacturer',
      width: 120,
    },
    {
      title: '使用年限',
      dataIndex: 'usageYears',
      key: 'usageYears',
      width: 100,
      render: (years: number) => `${years}年`,
    },
    {
      title: '检修周期',
      dataIndex: 'maintenanceCycle',
      key: 'maintenanceCycle',
      width: 100,
    },
    {
      title: '保修年限',
      dataIndex: 'warrantyYears',
      key: 'warrantyYears',
      width: 100,
      render: (years: number) => `${years}年`,
    },
    {
      title: '入库日期',
      dataIndex: 'storageDate',
      key: 'storageDate',
      width: 100,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="link" 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => handleDetail(record)}
          >
            详情
          </Button>
          <Button 
            type="link" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button 
            type="link" 
            size="small" 
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  // 渲染设备类型树节点
  const renderTreeNode = (node: DeviceTypeNode) => {
    return (
      <TreeNode
        key={node.key}
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{node.title}</span>
            <div className="tree-actions">
              <Space size="small">
                <Button
                  type="text"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddType(node.key);
                  }}
                  title="添加子类型"
                />
                <Button
                  type="text"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditType(node);
                  }}
                  title="编辑"
                />
                <Button
                  type="text"
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteType(node.key);
                  }}
                  title="删除"
                  danger
                />
              </Space>
            </div>
          </div>
        }
      >
        {node.children?.map(child => renderTreeNode(child))}
      </TreeNode>
    );
  };

  return (
    <div className="asset-register" style={{ padding: '0 4px', maxWidth: '100%', overflow: 'hidden' }}>
      <style>{`
        .tree-node:hover .tree-actions {
          display: block !important;
        }
        .asset-register {
          width: 100%;
          max-width: 100vw;
          box-sizing: border-box;
        }
        .asset-register .ant-row {
          margin: 0 !important;
          width: 100%;
        }
        .asset-register .ant-col {
          padding: 0 4px !important;
        }
        .asset-register .ant-card {
          width: 100%;
          box-sizing: border-box;
        }
        .asset-register .ant-table-wrapper {
          width: 100%;
          overflow: auto;
        }
        @media (max-width: 1400px) {
          .asset-register .ant-col[flex="280px"] {
            flex: 0 0 260px !important;
          }
        }
        @media (max-width: 1200px) {
          .asset-register .ant-col[flex="280px"] {
            flex: 0 0 240px !important;
          }
        }
        @media (max-width: 992px) {
          .asset-register .ant-col[flex="280px"] {
            flex: 0 0 220px !important;
          }
        }
        @media (max-width: 768px) {
          .asset-register .ant-col[flex="280px"] {
            flex: 0 0 200px !important;
          }
        }
      `}</style>
      
      <Row gutter={[8, 8]} style={{ margin: 0, width: '100%' }}>
        {/* 左侧设备类型树 */}
        <Col flex="280px" style={{ minWidth: '240px' }}>
          <Card 
            title="设备类型" 
            size="small"
            extra={
              <Button 
                type="primary" 
                size="small" 
                icon={<PlusOutlined />}
                onClick={() => handleAddType()}
              >
                添加类型
              </Button>
            }
            style={{ height: 'calc(100vh - 200px)' }}
            styles={{ body: { padding: '12px', height: 'calc(100vh - 260px)', overflow: 'auto' } }}
          >
            <div style={{ marginBottom: 8 }}>
              <Input.Search
                placeholder="搜索设备类型"
                value={typeSearchText}
                onChange={(e) => setTypeSearchText(e.target.value)}
                allowClear
                size="small"
              />
            </div>
            <Tree
              showLine
              selectedKeys={selectedTypeKey ? [selectedTypeKey] : []}
              onSelect={handleTypeSelect}
              style={{ minHeight: 300 }}
            >
              {filteredTypeTree.map(node => renderTreeNode(node))}
            </Tree>
          </Card>
        </Col>

        {/* 右侧资产列表 */}
        <Col flex="auto" style={{ minWidth: 0, width: 0 }}>
          <Card 
             style={{ height: 'calc(100vh - 200px)', width: '100%' }} 
             styles={{ body: { padding: '12px', height: 'calc(100vh - 260px)', overflow: 'auto' } }}
           >
            <div style={{ marginBottom: 16 }}>
              <Form form={searchForm} layout="vertical" onFinish={handleSearch}>
                <Row gutter={[8, 6]}>
                  <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                    <Form.Item name="assetCode" label="资产编号" style={{ marginBottom: 8 }}>
                      <Input placeholder="请输入资产编号" size="small" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                    <Form.Item name="assetName" label="资产名称" style={{ marginBottom: 8 }}>
                      <Input placeholder="请输入资产名称" size="small" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                    <Form.Item name="deviceTypeName" label="设备类型" style={{ marginBottom: 8 }}>
                      <Input placeholder="请输入设备类型" size="small" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                    <Form.Item name="deviceType" label="设备分类" style={{ marginBottom: 8 }}>
                      <Select placeholder="请选择设备分类" allowClear size="small">
                        <Option value="main">主设备</Option>
                        <Option value="auxiliary">附属设备</Option>
                        <Option value="spare">备品备件</Option>
                        <Option value="special">特种设备</Option>
                        <Option value="general">一般设备</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={[8, 6]}>
                  <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                    <Form.Item name="specification" label="规格型号" style={{ marginBottom: 8 }}>
                      <Input placeholder="请输入规格型号" size="small" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                    <Form.Item name="brand" label="品牌" style={{ marginBottom: 8 }}>
                      <Input placeholder="请输入品牌" size="small" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                    <Form.Item name="model" label="型号" style={{ marginBottom: 8 }}>
                      <Input placeholder="请输入型号" size="small" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                    <Form.Item name="manufacturer" label="生产厂商" style={{ marginBottom: 8 }}>
                      <Input placeholder="请输入生产厂商" size="small" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                    <Form.Item name="supplier" label="供应商" style={{ marginBottom: 8 }}>
                      <Input placeholder="请输入供应商" size="small" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                    <Form.Item name="location" label="存放位置" style={{ marginBottom: 8 }}>
                      <Input placeholder="请输入存放位置" size="small" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                    <Form.Item name="maintenanceCycle" label="检修周期" style={{ marginBottom: 8 }}>
                      <Input placeholder="请输入检修周期" size="small" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                    <Form.Item name="usageYears" label="使用年限" style={{ marginBottom: 8 }}>
                      <InputNumber placeholder="请输入使用年限" style={{ width: '100%' }} min={0} size="small" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                    <Form.Item name="warrantyYears" label="保修年限" style={{ marginBottom: 8 }}>
                      <InputNumber placeholder="请输入保修年限" style={{ width: '100%' }} min={0} size="small" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                    <Form.Item name="storageDate" label="入库日期" style={{ marginBottom: 8 }}>
                      <DatePicker.RangePicker style={{ width: '100%' }} size="small" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                    <Form.Item name="warrantyExpiry" label="保修到期" style={{ marginBottom: 8 }}>
                      <DatePicker.RangePicker style={{ width: '100%' }} size="small" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                    <Form.Item name="createUser" label="创建人" style={{ marginBottom: 8 }}>
                      <Input placeholder="请输入创建人" size="small" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                    <Form.Item name="createDate" label="创建时间" style={{ marginBottom: 8 }}>
                      <DatePicker.RangePicker style={{ width: '100%' }} size="small" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={24} md={16} lg={12} xl={12}>
                    <Form.Item style={{ marginBottom: 8 }}>
                      <Space>
                        <Button type="primary" htmlType="submit" icon={<SearchOutlined />} size="small">
                          搜索
                        </Button>
                        <Button onClick={() => {
                          searchForm.resetFields();
                          setFilteredData(assetData);
                        }} size="small">
                          重置
                        </Button>
                      </Space>
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </div>

            <div style={{ marginBottom: 16 }}>
              <Space>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} size="small">
                  新增资产
                </Button>
                <Button icon={<ExportOutlined />} size="small">
                  导出Excel
                </Button>
                <Button icon={<ImportOutlined />} size="small">
                  导入Excel
                </Button>
              </Space>
            </div>

            <Table
              columns={columns}
              dataSource={filteredData}
              rowKey="id"
              loading={loading}
              pagination={{
                total: filteredData.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`,
                size: 'small',
              }}
              scroll={{ x: 'max-content', y: 'calc(100vh - 450px)' }}
              size="small"
              style={{ width: '100%' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 新增/编辑模态框 */}
      <Modal
        title={editingAsset ? '编辑资产' : '新增资产'}
        open={isAssetModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsAssetModalVisible(false)}
        width={800}
        okText="确定"
        cancelText="取消"
      >
        <Form form={assetForm} layout="vertical">
          <Tabs defaultActiveKey="basic">
            <TabPane tab="基本信息" key="basic">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item 
                    label="资产名称" 
                    name="assetName"
                    rules={[{ required: true, message: '请输入资产名称' }]}
                  >
                    <Input placeholder="请输入资产名称" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item 
                      label="设备类型" 
                      name="deviceTypeKey"
                      rules={[{ required: true, message: '请选择设备类型' }]}
                    >
                      <Select placeholder="请选择设备类型">
                        {(() => {
                          const getAllDeviceTypes = (nodes: DeviceTypeNode[], prefix = ''): React.ReactElement[] => {
                            const result: React.ReactElement[] = [];
                            nodes.forEach(node => {
                              const displayTitle = prefix ? `${prefix} > ${node.title}` : node.title;
                              result.push(
                                <Option key={node.key} value={node.key}>{displayTitle}</Option>
                              );
                              if (node.children && node.children.length > 0) {
                                result.push(...getAllDeviceTypes(node.children, displayTitle));
                              }
                            });
                            return result;
                          };
                          return getAllDeviceTypes(deviceTypeTree);
                        })()}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item 
                      label="设备类型" 
                      name="deviceType"
                      rules={[{ required: true, message: '请选择设备类型' }]}
                    >
                      <Select placeholder="请选择设备类型">
                        <Option value="main">主设备</Option>
                        <Option value="auxiliary">附属设备</Option>
                        <Option value="spare">备品备件</Option>
                        <Option value="special">特种设备</Option>
                        <Option value="general">一般设备</Option>
                      </Select>
                    </Form.Item>
                  </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="规格型号" name="specification">
                    <Input placeholder="请输入规格型号" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="品牌" name="brand">
                    <Input placeholder="请输入品牌" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="生产厂商" name="manufacturer">
                    <Input placeholder="请输入生产厂商" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="型号" name="model">
                    <Input placeholder="请输入型号" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="序列号" name="serialNumber">
                    <Input placeholder="请输入序列号" />
                  </Form.Item>
                </Col>
              </Row>
            </TabPane>
            
            <TabPane tab="采购信息" key="purchase">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="供应商" name="supplier">
                    <Input placeholder="请输入供应商" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item 
                    label="入库日期" 
                    name="storageDate"
                    rules={[{ required: true, message: '请选择入库日期' }]}
                  >
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="保修期(月)" name="warrantyPeriod">
                    <InputNumber 
                      placeholder="请输入保修期" 
                      style={{ width: '100%' }}
                      min={0}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="保修年限" name="warrantyYears">
                    <InputNumber 
                      placeholder="请输入保修年限" 
                      style={{ width: '100%' }}
                      min={0}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="保修到期日" name="warrantyExpiry">
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
            </TabPane>
            

            
            <TabPane tab="使用信息" key="usage">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="使用年限" name="usageYears">
                    <InputNumber 
                      placeholder="请输入使用年限" 
                      style={{ width: '100%' }}
                      min={0}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="存放位置" name="location">
                    <Input placeholder="请输入存放位置" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="检修周期" name="maintenanceCycle">
                    <Input placeholder="请输入检修周期" />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item label="备注说明" name="description">
                <TextArea rows={4} placeholder="请输入备注说明" />
              </Form.Item>
            </TabPane>
          </Tabs>
        </Form>
      </Modal>

      {/* 详情模态框 */}
      <Modal
        title="资产详情"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            关闭
          </Button>,
          <Button key="print" icon={<PrinterOutlined />}>
            打印
          </Button>,
          <Button key="qr" icon={<QrcodeOutlined />}>
            生成二维码
          </Button>,
        ]}
        width={800}
      >
        {selectedAsset && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="资产编号">{selectedAsset.assetCode}</Descriptions.Item>
            <Descriptions.Item label="资产名称">{selectedAsset.assetName}</Descriptions.Item>
            <Descriptions.Item label="设备类型">{selectedAsset.deviceTypeName}</Descriptions.Item>
            <Descriptions.Item label="设备分类">
              {selectedAsset.deviceType === 'main' ? '主设备' : 
               selectedAsset.deviceType === 'auxiliary' ? '附属设备' : 
               selectedAsset.deviceType === 'spare' ? '备品备件' :
               selectedAsset.deviceType === 'special' ? '特种设备' : '一般设备'}
            </Descriptions.Item>
            <Descriptions.Item label="规格型号">{selectedAsset.specification}</Descriptions.Item>
            <Descriptions.Item label="品牌">{selectedAsset.brand}</Descriptions.Item>
            <Descriptions.Item label="型号">{selectedAsset.model}</Descriptions.Item>
            <Descriptions.Item label="序列号">{selectedAsset.serialNumber}</Descriptions.Item>
            <Descriptions.Item label="生产厂商">{selectedAsset.manufacturer}</Descriptions.Item>
            <Descriptions.Item label="供应商">{selectedAsset.supplier}</Descriptions.Item>
            <Descriptions.Item label="入库日期">{selectedAsset.storageDate}</Descriptions.Item>
            <Descriptions.Item label="保修期">{selectedAsset.warrantyPeriod}月</Descriptions.Item>
            <Descriptions.Item label="保修年限">{selectedAsset.warrantyYears}年</Descriptions.Item>
            <Descriptions.Item label="保修到期">{selectedAsset.warrantyExpiry}</Descriptions.Item>
            <Descriptions.Item label="使用年限">{selectedAsset.usageYears}年</Descriptions.Item>
            <Descriptions.Item label="存放位置">{selectedAsset.location}</Descriptions.Item>
            <Descriptions.Item label="检修周期">{selectedAsset.maintenanceCycle}</Descriptions.Item>
            <Descriptions.Item label="创建人">{selectedAsset.createUser}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{selectedAsset.createDate}</Descriptions.Item>
            <Descriptions.Item label="备注说明" span={2}>{selectedAsset.description}</Descriptions.Item>
          </Descriptions>
        )}
       </Modal>

       {/* 设备类型管理模态框 */}
       <Modal
         title={editingType ? '编辑设备类型' : '新增设备类型'}
         open={isTypeModalVisible}
         onOk={handleTypeSubmit}
         onCancel={() => setIsTypeModalVisible(false)}
         width={600}
         okText="确定"
         cancelText="取消"
       >
         <Form form={typeForm} layout="vertical">
           <Row gutter={16}>
             <Col span={12}>
               <Form.Item 
                 label="类型名称" 
                 name="title"
                 rules={[{ required: true, message: '请输入类型名称' }]}
               >
                 <Input placeholder="请输入类型名称" />
               </Form.Item>
             </Col>
             <Col span={12}>
               <Form.Item label="父级类型" name="parentKey">
                 <Select placeholder="请选择父级类型" allowClear>
                   {deviceTypeTree.map(type => (
                     <Option key={type.key} value={type.key}>{type.title}</Option>
                   ))}
                 </Select>
               </Form.Item>
             </Col>
           </Row>

           <Row gutter={16}>
             <Col span={24}>
               <Form.Item label="描述" name="description">
                 <Input.TextArea 
                   placeholder="请输入类型描述" 
                   rows={3}
                 />
               </Form.Item>
             </Col>
           </Row>
         </Form>
       </Modal>
     </div>
   );
 };
 
 export default AssetRegister;