import React, { useState } from 'react';
import { Button, Table, Modal, Form, Input, Select, InputNumber, Row, Col, Descriptions, Upload, DatePicker, Space, Tag, message } from 'antd';
import { UploadOutlined, FileTextOutlined, EyeOutlined, EditOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';

const { Option } = Select;

// 合同接口
interface Contract {
  id: string;
  contractNo: string;
  supplierName: string;
  contractName: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: 'active' | 'expired' | 'terminated';
  statusText: string;
  attachments: string[];
  remarks: string;
}

interface Supplier {
  id: number;
  name: string;
  category: string;
  contactPerson: string;
  contactPhone: string;
  address: string;
  email: string;
  bankName: string;
  bankAccountNumber: string;
  purchaseCount: number;
  totalContracts: number; // 合同总量
  activeContracts: number; // 进行中合同量
  contracts: Contract[]; // 合同列表
}

const FilterBar = ({ onFilter }: { onFilter: (values: any) => void }) => {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    onFilter(values);
  };

  const onReset = () => {
    form.resetFields();
    onFilter({});
  };

  return (
    <Form form={form} onFinish={onFinish} layout="inline" style={{ marginBottom: 16 }}>
      <Row gutter={16}>
        <Col>
          <Form.Item label="供应商名称" name="name">
            <Input placeholder="请输入供应商名称" />
          </Form.Item>
        </Col>
        <Col>
          <Form.Item label="分类" name="category">
            <Select placeholder="请选择分类" style={{ width: 120 }} allowClear>
              <Option value="电子产品">电子产品</Option>
              <Option value="互联网服务">互联网服务</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col>
          <Form.Item label="联系人" name="contactPerson">
            <Input placeholder="请输入联系人" />
          </Form.Item>
        </Col>
        <Col>
          <Form.Item label="联系电话" name="contactPhone">
            <Input placeholder="请输入联系电话" />
          </Form.Item>
        </Col>
        <Col>
          <Form.Item label="地址" name="address">
            <Input placeholder="请输入地址" />
          </Form.Item>
        </Col>
        <Col>
          <Form.Item label="采购次数" name="purchaseCount">
            <InputNumber placeholder="请输入采购次数" style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col>
          <Form.Item>
            <Button type="primary" htmlType="submit">查询</Button>
            <Button style={{ marginLeft: 8 }} onClick={onReset}>重置</Button>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

const SupplierManagement: React.FC = () => {
  // 模拟合同数据
  const mockContracts: Contract[] = [
    {
      id: '1',
      contractNo: 'HT202401001',
      supplierName: '华为技术有限公司',
      contractName: '华为设备采购合同',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      totalAmount: 5000000,
      status: 'active',
      statusText: '进行中',
      attachments: ['华为设备采购合同.pdf'],
      remarks: '年度设备采购框架合同'
    },
    {
      id: '2',
      contractNo: 'HT202401002',
      supplierName: '华为技术有限公司',
      contractName: '华为服务合同',
      startDate: '2023-06-01',
      endDate: '2024-05-31',
      totalAmount: 2000000,
      status: 'active',
      statusText: '进行中',
      attachments: ['华为服务合同.pdf'],
      remarks: '技术服务合同'
    },
    {
      id: '3',
      contractNo: 'HT202301003',
      supplierName: '华为技术有限公司',
      contractName: '华为历史合同',
      startDate: '2023-01-01',
      endDate: '2023-12-31',
      totalAmount: 3000000,
      status: 'expired',
      statusText: '已到期',
      attachments: ['华为历史合同.pdf'],
      remarks: '已完成的历史合同'
    },
    {
      id: '4',
      contractNo: 'HT202401004',
      supplierName: '小米科技有限责任公司',
      contractName: '小米产品采购合同',
      startDate: '2024-02-01',
      endDate: '2025-01-31',
      totalAmount: 3500000,
      status: 'active',
      statusText: '进行中',
      attachments: ['小米产品采购合同.pdf'],
      remarks: '小米产品年度采购合同'
    },
    {
      id: '5',
      contractNo: 'HT202401005',
      supplierName: '阿里巴巴集团控股有限公司',
      contractName: '阿里云服务合同',
      startDate: '2024-01-15',
      endDate: '2025-01-14',
      totalAmount: 1200000,
      status: 'active',
      statusText: '进行中',
      attachments: ['阿里云服务合同.pdf'],
      remarks: '云服务年度合同'
    },
    {
      id: '6',
      contractNo: 'HT202401006',
      supplierName: '阿里巴巴集团控股有限公司',
      contractName: '钉钉企业服务合同',
      startDate: '2024-03-01',
      endDate: '2025-02-28',
      totalAmount: 800000,
      status: 'active',
      statusText: '进行中',
      attachments: ['钉钉企业服务合同.pdf'],
      remarks: '企业协作平台服务合同'
    }
  ];

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const initialSuppliers = [
      { 
        id: 1, 
        name: '华为技术有限公司', 
        category: '电子产品', 
        contactPerson: '余承东', 
        contactPhone: '18688886666', 
        address: '广东省深圳市龙岗区坂田华为基地', 
        email: 'yuchengdong@huawei.com', 
        bankName: '中国工商银行深圳分行', 
        bankAccountNumber: '4000023409008888888', 
        contracts: mockContracts.filter(c => c.supplierName === '华为技术有限公司')
      },
      { 
        id: 2, 
        name: '小米科技有限责任公司', 
        category: '电子产品', 
        contactPerson: '雷军', 
        contactPhone: '18500080008', 
        address: '北京市海淀区清河中街68号华润五彩城购物中心', 
        email: 'leijun@xiaomi.com', 
        bankName: '招商银行北京分行', 
        bankAccountNumber: '1109088888888888', 
        contracts: mockContracts.filter(c => c.supplierName === '小米科技有限责任公司')
      },
      { 
        id: 3, 
        name: '阿里巴巴集团控股有限公司', 
        category: '互联网服务', 
        contactPerson: '张勇', 
        contactPhone: '13957188888', 
        address: '浙江省杭州市余杭区文一西路969号', 
        email: 'zhangyong@alibaba-inc.com', 
        bankName: '中国建设银行杭州分行', 
        bankAccountNumber: '33001616888053008888', 
        contracts: mockContracts.filter(c => c.supplierName === '阿里巴巴集团控股有限公司')
      },
    ];
    
    // 自动计算采购次数、合同总量和进行中合同量
    return initialSuppliers.map(supplier => ({
      ...supplier,
      purchaseCount: supplier.contracts.length, // 采购次数 = 合同总数
      totalContracts: supplier.contracts.length,
      activeContracts: supplier.contracts.filter(c => c.status === 'active').length
    }));
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [contractsVisible, setContractsVisible] = useState(false);
  const [contractUpdateVisible, setContractUpdateVisible] = useState(false);
  const [selectedContracts, setSelectedContracts] = useState<any[]>([]);
  const [contractType, setContractType] = useState<'all' | 'active'>('all');
  const [contractEditVisible, setContractEditVisible] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [form] = Form.useForm();
  const [contractForm] = Form.useForm();
  const [filters, setFilters] = useState({});

  const handleAdd = () => {
    setEditingSupplier(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    form.setFieldsValue(supplier);
    setIsModalVisible(true);
  };

  const handleDelete = (id: number) => {
    setSuppliers(suppliers.filter(supplier => supplier.id !== id));
  };

  const handleOk = () => {
    form.validateFields().then(values => {
      if (editingSupplier) {
        setSuppliers(
          suppliers.map(supplier =>
            supplier.id === editingSupplier.id ? { ...supplier, ...values } : supplier
          )
        );
      } else {
        // 新增供应商时，初始化合同相关字段
        const newSupplier = {
          id: Date.now(),
          ...values,
          purchaseCount: 0, // 采购次数初始化为0
          totalContracts: 0,
          activeContracts: 0,
          contracts: []
        };
        setSuppliers([
          ...suppliers,
          newSupplier,
        ]);
      }
      setIsModalVisible(false);
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleDetails = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setDetailsVisible(true);
  };

  const handleViewContracts = (supplierId: number, type: 'all' | 'active') => {
    const supplier = suppliers.find(s => s.id === supplierId);
    if (supplier) {
      let contracts = supplier.contracts || [];
      if (type === 'active') {
        contracts = contracts.filter(c => c.status === 'active');
      }
      setSelectedContracts(contracts);
      setContractType(type);
      setContractsVisible(true);
    }
  };

  const handleUpdateContract = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    contractForm.resetFields();
    setContractUpdateVisible(true);
  };

  const handleContractUpload = (info: any) => {
    if (info.file.status === 'done') {
      message.success(`${info.file.name} 文件上传成功`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} 文件上传失败`);
    }
  };

  const handleContractSubmit = () => {
    contractForm.validateFields().then(_values => {
      // 这里可以添加实际的合同更新逻辑
      message.success('合同更新成功');
      setContractUpdateVisible(false);
    });
  };

  const handleViewContractDetail = (contract: Contract) => {
    // 显示合同详情
    Modal.info({
      title: '合同详情',
      width: 600,
      content: (
        <Descriptions bordered column={1}>
          <Descriptions.Item label="合同编号">{contract.contractNo}</Descriptions.Item>
          <Descriptions.Item label="合同名称">{contract.contractName}</Descriptions.Item>
          <Descriptions.Item label="供应商">{contract.supplierName}</Descriptions.Item>
          <Descriptions.Item label="开始日期">{contract.startDate}</Descriptions.Item>
          <Descriptions.Item label="结束日期">{contract.endDate}</Descriptions.Item>
          <Descriptions.Item label="合同金额">¥{contract.totalAmount.toLocaleString()}</Descriptions.Item>
          <Descriptions.Item label="状态">{contract.statusText}</Descriptions.Item>
          <Descriptions.Item label="备注">{contract.remarks}</Descriptions.Item>
          <Descriptions.Item label="附件">
            {contract.attachments.map((file, index) => (
              <div key={index}>
                <FileTextOutlined style={{ marginRight: 8 }} />
                {file}
              </div>
            ))}
          </Descriptions.Item>
        </Descriptions>
      ),
    });
  };

  const handleEditContract = (contract: Contract) => {
    setEditingContract(contract);
    contractForm.setFieldsValue({
      contractNo: contract.contractNo,
      contractName: contract.contractName,
      startDate: contract.startDate,
      endDate: contract.endDate,
      totalAmount: contract.totalAmount,
      status: contract.status,
      remarks: contract.remarks
    });
    setContractEditVisible(true);
  };

  const handleContractEditOk = () => {
    contractForm.validateFields().then(values => {
      if (editingContract) {
        // 更新合同数据
        const updatedContract = { ...editingContract, ...values };
        
        // 更新供应商的合同列表，并重新计算相关统计数据
        setSuppliers(suppliers.map(supplier => {
          const updatedContracts = supplier.contracts.map(contract => 
            contract.id === editingContract.id ? updatedContract : contract
          );
          return {
            ...supplier,
            contracts: updatedContracts,
            purchaseCount: updatedContracts.length, // 重新计算采购次数
            totalContracts: updatedContracts.length,
            activeContracts: updatedContracts.filter(c => c.status === 'active').length
          };
        }));

        // 如果当前显示的是合同列表，也需要更新
        if (contractsVisible && selectedContracts.length > 0) {
          setSelectedContracts(selectedContracts.map(contract => 
            contract.id === editingContract.id ? updatedContract : contract
          ));
        }

        message.success('合同更新成功');
        setContractEditVisible(false);
        setEditingContract(null);
        contractForm.resetFields();
      }
    }).catch(info => {
      console.log('验证失败:', info);
    });
  };

  const handleContractEditCancel = () => {
    setContractEditVisible(false);
    setEditingContract(null);
    contractForm.resetFields();
  };

  const columns: TableProps<Supplier>['columns'] = [
    { title: '序号', key: 'index', render: (_text, _record, index) => `${index + 1}` },
    {
      title: '供应商名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
    },
    { title: '联系人', dataIndex: 'contactPerson', key: 'contactPerson' },
    { title: '联系电话', dataIndex: 'contactPhone', key: 'contactPhone' },
    { title: '地址', dataIndex: 'address', key: 'address' },
    {
      title: '合同总量',
      dataIndex: 'totalContracts',
      key: 'totalContracts',
      sorter: (a, b) => a.totalContracts - b.totalContracts,
      render: (value: number, record: Supplier) => (
        <Button 
          type="link" 
          onClick={() => handleViewContracts(record.id, 'all')}
          style={{ padding: 0 }}
        >
          {value}
        </Button>
      ),
    },
    {
      title: '进行中合同量',
      dataIndex: 'activeContracts',
      key: 'activeContracts',
      sorter: (a, b) => a.activeContracts - b.activeContracts,
      render: (value: number, record: Supplier) => (
        <Button 
          type="link" 
          onClick={() => handleViewContracts(record.id, 'active')}
          style={{ padding: 0 }}
        >
          {value}
        </Button>
      ),
    },
    {
      title: '采购次数',
      dataIndex: 'purchaseCount',
      key: 'purchaseCount',
      sorter: (a, b) => a.purchaseCount - b.purchaseCount,
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 200,
      render: (_: any, record: Supplier) => (
        <span>
          <Button type="link" onClick={() => handleDetails(record)}>详情</Button>
          <Button type="link" onClick={() => handleEdit(record)}>编辑</Button>
          <Button type="link" onClick={() => handleUpdateContract(record)}>更新合同</Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>删除</Button>
        </span>
      ),
    },
  ];

  const filteredSuppliers = suppliers.filter(supplier => {
    const { name, category, contactPerson, contactPhone, address, purchaseCount } = filters as any;
    if (name && !supplier.name.includes(name)) {
      return false;
    }
    if (category && supplier.category !== category) {
      return false;
    }
    if (contactPerson && !supplier.contactPerson.includes(contactPerson)) {
      return false;
    }
    if (contactPhone && !supplier.contactPhone.includes(contactPhone)) {
      return false;
    }
    if (address && !supplier.address.includes(address)) {
      return false;
    }
    if (purchaseCount && supplier.purchaseCount !== purchaseCount) {
      return false;
    }
    return true;
  });

  return (
    <div>
      <FilterBar onFilter={setFilters} />
      <Button type="primary" onClick={handleAdd} style={{ marginBottom: 16 }}>
        新增供应商
      </Button>
      <Table columns={columns} dataSource={filteredSuppliers} rowKey="id" scroll={{ x: 1200 }} />
      <Modal
        title={editingSupplier ? '编辑供应商' : '新增供应商'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="供应商名称" name="name" rules={[{ required: true, message: '请输入供应商名称！' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="分类" name="category" rules={[{ required: true, message: '请选择分类！' }]}>
            <Select>
              <Option value="电子产品">电子产品</Option>
              <Option value="互联网服务">互联网服务</Option>
            </Select>
          </Form.Item>
          <Form.Item label="联系人" name="contactPerson" rules={[{ required: true, message: '请输入联系人！' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="联系电话" name="contactPhone" rules={[{ required: true, message: '请输入联系电话！' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="地址" name="address">
            <Input />
          </Form.Item>
          <Form.Item label="电子邮箱" name="email">
            <Input />
          </Form.Item>
          <Form.Item label="开户行" name="bankName">
            <Input />
          </Form.Item>
          <Form.Item label="银行账号" name="bankAccountNumber">
            <Input />
          </Form.Item>
          <Form.Item label="采购次数" name="purchaseCount">
            <Input disabled style={{ width: '100%' }} placeholder="系统自动计算" />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="供应商详情"
        visible={detailsVisible}
        onCancel={() => setDetailsVisible(false)}
        footer={[
          <Button key="back" onClick={() => setDetailsVisible(false)}>
            关闭
          </Button>,
        ]}
        width={800}
      >
        {selectedSupplier && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="供应商名称">{selectedSupplier.name}</Descriptions.Item>
            <Descriptions.Item label="分类">{selectedSupplier.category}</Descriptions.Item>
            <Descriptions.Item label="联系人">{selectedSupplier.contactPerson}</Descriptions.Item>
            <Descriptions.Item label="联系电话">{selectedSupplier.contactPhone}</Descriptions.Item>
            <Descriptions.Item label="地址" span={2}>{selectedSupplier.address}</Descriptions.Item>
            <Descriptions.Item label="电子邮箱">{selectedSupplier.email}</Descriptions.Item>
            <Descriptions.Item label="采购次数">{selectedSupplier.purchaseCount}</Descriptions.Item>
            <Descriptions.Item label="开户行" span={2}>{selectedSupplier.bankName}</Descriptions.Item>
            <Descriptions.Item label="银行账号" span={2}>{selectedSupplier.bankAccountNumber}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* 合同查看Modal */}
      <Modal
        title={`${contractType === 'all' ? '全部' : '进行中'}合同列表`}
        visible={contractsVisible}
        onCancel={() => setContractsVisible(false)}
        footer={[
          <Button key="back" onClick={() => setContractsVisible(false)}>
            关闭
          </Button>,
        ]}
        width={1000}
      >
        <Table
          dataSource={selectedContracts}
          rowKey="id"
          columns={[
            { title: '合同编号', dataIndex: 'contractNo', key: 'contractNo' },
            { title: '合同名称', dataIndex: 'contractName', key: 'contractName' },
            { title: '开始日期', dataIndex: 'startDate', key: 'startDate' },
            { title: '结束日期', dataIndex: 'endDate', key: 'endDate' },
            { 
              title: '合同金额', 
              dataIndex: 'totalAmount', 
              key: 'totalAmount',
              render: (amount: number) => `¥${amount.toLocaleString()}`
            },
            { 
              title: '状态', 
              dataIndex: 'statusText', 
              key: 'statusText',
              render: (text: string, record: any) => {
                const color = record.status === 'active' ? 'green' : 
                             record.status === 'expired' ? 'red' : 'orange';
                return <Tag color={color}>{text}</Tag>;
              }
            },
            {
              title: '操作',
              key: 'action',
              render: (_: any, record: Contract) => (
                <Space>
                  <Button 
                    type="link" 
                    icon={<EyeOutlined />}
                    onClick={() => handleViewContractDetail(record)}
                  >
                    查看
                  </Button>
                  <Button 
                    type="link" 
                    icon={<EditOutlined />}
                    onClick={() => handleEditContract(record)}
                  >
                    编辑
                  </Button>
                </Space>
              ),
            },
          ]}
          pagination={{ pageSize: 5 }}
        />
      </Modal>

      {/* 合同更新Modal */}
      <Modal
        title="更新合同"
        visible={contractUpdateVisible}
        onOk={handleContractSubmit}
        onCancel={() => setContractUpdateVisible(false)}
        width={600}
      >
        <Form form={contractForm} layout="vertical">
          <Form.Item 
            label="合同文件" 
            name="contractFile"
            rules={[{ required: true, message: '请上传合同文件！' }]}
          >
            <Upload
              beforeUpload={() => false}
              onChange={handleContractUpload}
              accept=".pdf,.doc,.docx"
            >
              <Button icon={<UploadOutlined />}>选择文件</Button>
            </Upload>
          </Form.Item>
          <Form.Item 
            label="合同开始日期" 
            name="startDate"
            rules={[{ required: true, message: '请选择开始日期！' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item 
            label="合同结束日期" 
            name="endDate"
            rules={[{ required: true, message: '请选择结束日期！' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="合同金额" name="amount">
            <InputNumber 
              style={{ width: '100%' }} 
              formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value!.replace(/¥\s?|(,*)/g, '')}
            />
          </Form.Item>
          <Form.Item label="备注" name="remark">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 合同编辑Modal */}
      <Modal
        title="编辑合同"
        visible={contractEditVisible}
        onOk={handleContractEditOk}
        onCancel={handleContractEditCancel}
        width={600}
        okText="保存"
        cancelText="取消"
      >
        <Form form={contractForm} layout="vertical">
          <Form.Item 
            label="合同编号" 
            name="contractNo"
            rules={[{ required: true, message: '请输入合同编号！' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item 
            label="合同名称" 
            name="contractName"
            rules={[{ required: true, message: '请输入合同名称！' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item 
            label="合同开始日期" 
            name="startDate"
            rules={[{ required: true, message: '请选择开始日期！' }]}
          >
            <Input type="date" />
          </Form.Item>
          <Form.Item 
            label="合同结束日期" 
            name="endDate"
            rules={[{ required: true, message: '请选择结束日期！' }]}
          >
            <Input type="date" />
          </Form.Item>
          <Form.Item 
            label="合同金额" 
            name="totalAmount"
            rules={[{ required: true, message: '请输入合同金额！' }]}
          >
            <InputNumber 
              style={{ width: '100%' }} 
              formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => (Number(value!.replace(/¥\s?|(,*)/g, '')) || 0) as any}
              min={0}
            />
          </Form.Item>
          <Form.Item 
            label="合同状态" 
            name="status"
            rules={[{ required: true, message: '请选择合同状态！' }]}
          >
            <Select>
              <Select.Option value="active">进行中</Select.Option>
              <Select.Option value="completed">已完成</Select.Option>
              <Select.Option value="terminated">已终止</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="备注" name="remarks">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SupplierManagement;