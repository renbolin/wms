import React, { useEffect, useMemo, useState } from 'react';
import { Card, Table, Button, Form, Input, Select, Modal, Space, Tag, message, Descriptions, Row, Col, Upload, Alert, Checkbox } from 'antd';
import { EyeOutlined, SearchOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload/interface';
import { useProcurementOrder } from '@/contexts/ProcurementOrderContext';
import { useNavigate, useLocation } from 'react-router-dom';

const { Option } = Select;
const { TextArea } = Input;

interface Contract {
  id: string;
  contractNo: string;
  supplierId?: string;
  supplierName: string;
  title: string;
  startDate: string;
  endDate: string;
  amount: number;
  currency?: string;
  status: 'active' | 'expired' | 'terminated' | 'draft';
  statusText: string;
  attachments: UploadFile[];
  remarks?: string;
  // 30天内到期提示
  dueSoon?: boolean;
}

const ContractManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Contract[]>([]);
  const [filteredData, setFilteredData] = useState<Contract[]>([]);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [isCreateVisible, setIsCreateVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<Contract | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [previewType, setPreviewType] = useState<'image' | 'pdf' | 'other'>('other');
  const [searchForm] = Form.useForm();
  const [contractForm] = Form.useForm();
  const { orders } = useProcurementOrder();
  const navigate = useNavigate();
  const location = useLocation();
  const associatedOrders = useMemo(() => {
    if (!selectedRecord) return [] as any[];
    return orders.filter(o => o.contractId === selectedRecord.id || o.contractNo === selectedRecord.contractNo);
  }, [orders, selectedRecord]);

  // 根据URL参数（contractId/contractNo）自动筛选与打开详情
  useEffect(() => {
    try {
      const sp = new URLSearchParams(location.search || '');
      const contractId = sp.get('contractId') || undefined;
      const contractNo = sp.get('contractNo') || undefined;
      if ((contractId || contractNo) && data.length > 0) {
        const found = data.find(d => (contractId && d.id === contractId) || (contractNo && d.contractNo === contractNo));
        if (found) {
          setSelectedRecord(found);
          setIsDetailVisible(true);
        }
        if (contractNo) {
          searchForm.setFieldsValue({ keyword: contractNo });
          const filtered = data.filter(d => d.contractNo.includes(contractNo) || d.title.includes(contractNo));
          setFilteredData(filtered);
        }
      }
    } catch {}
  }, [location.search, data]);

  // 初始化模拟合同数据
  useEffect(() => {
    setLoading(true);
    const mock: Contract[] = [
      {
        id: 'C-2024-001',
        contractNo: 'HT-2024-001',
        supplierId: '1',
        supplierName: '上海电子设备有限公司',
        title: '采购台式电脑及外设',
        startDate: '2024-01-10',
        endDate: '2024-12-31',
        amount: 43000,
        currency: 'CNY',
        status: 'active',
        statusText: '执行中',
        attachments: [],
        remarks: '年度框架采购合同',
      },
      {
        id: 'C-2024-002',
        contractNo: 'HT-2024-005',
        supplierId: '2',
        supplierName: '北京办公用品有限公司',
        title: '办公椅采购合同',
        startDate: '2024-01-20',
        endDate: '2024-06-30',
        amount: 15000,
        currency: 'CNY',
        status: 'expired',
        statusText: '已到期',
        attachments: [],
        remarks: '一次性采购',
      },
    ];
    const recomputed = recomputeStatuses(mock);
    setData(recomputed);
    setFilteredData(recomputed);
    try { localStorage.setItem('contractsData', JSON.stringify(recomputed)); } catch {}
    setLoading(false);
  }, []);

  // 根据结束日期自动计算状态与“即将到期”标识（30天内）
  const recomputeStatuses = (list: Contract[]) => {
    const today = new Date();
    return list.map(c => {
      try {
        const end = new Date(c.endDate);
        if (c.status !== 'terminated') {
          if (end < today) {
            return { ...c, status: 'expired', statusText: '已到期', dueSoon: false };
          }
          const diffDays = Math.floor((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          const dueSoon = diffDays >= 0 && diffDays <= 30;
          return { ...c, dueSoon };
        }
      } catch {}
      return c;
    });
  };

  const statusColor = (s: Contract['status']) => {
    switch (s) {
      case 'active': return 'green';
      case 'expired': return 'orange';
      case 'terminated': return 'red';
      case 'draft': return 'blue';
      default: return 'default';
    }
  };

  const columns: ColumnsType<Contract> = [
    { title: '合同编号', dataIndex: 'contractNo', key: 'contractNo', width: 140 },
    { title: '合同名称', dataIndex: 'title', key: 'title', width: 220, ellipsis: true },
    { title: '供应商', dataIndex: 'supplierName', key: 'supplierName', width: 200 },
    { title: '开始日期', dataIndex: 'startDate', key: 'startDate', width: 120 },
    { title: '结束日期', dataIndex: 'endDate', key: 'endDate', width: 120 },
    { title: '金额', dataIndex: 'amount', key: 'amount', width: 100, align: 'right', render: (v: number) => `¥${v.toLocaleString()}` },
    { title: '状态', dataIndex: 'statusText', key: 'status', width: 160, render: (text, record) => (
      <Space size="small">
        <Tag color={statusColor(record.status)}>{text}</Tag>
        {record.dueSoon && record.status !== 'expired' && (
          <Tag color="gold">即将到期</Tag>
        )}
      </Space>
    ) },
    { title: '附件数', key: 'attachments', width: 90, align: 'center', render: (_, r) => r.attachments?.length || 0 },
    {
      title: '操作', key: 'action', fixed: 'right', width: 130,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleView(record)}>详情</Button>
        </Space>
      )
    }
  ];

  const handleSearch = () => {
    const values = searchForm.getFieldsValue();
    const filtered = data.filter(d => {
      const kw = (values.keyword || '').trim();
      const status = values.status as Contract['status'] | undefined;
      const supplier = (values.supplier || '').trim();
      const dueSoonOnly = !!values.dueSoonOnly;
      const matchKw = kw ? (d.contractNo.includes(kw) || d.title.includes(kw)) : true;
      const matchStatus = status ? d.status === status : true;
      const matchSupplier = supplier ? d.supplierName.includes(supplier) : true;
      const matchDueSoon = dueSoonOnly ? !!d.dueSoon && d.status !== 'expired' : true;
      return matchKw && matchStatus && matchSupplier && matchDueSoon;
    });
    setFilteredData(filtered);
  };

  const handleReset = () => {
    searchForm.resetFields();
    setFilteredData(data);
  };

  const handleView = (record: Contract) => {
    setSelectedRecord(record);
    setIsDetailVisible(true);
  };

  const handleCreate = () => {
    setFileList([]);
    contractForm.resetFields();
    setIsCreateVisible(true);
  };

  const handleCreateSubmit = () => {
    contractForm.validateFields().then(values => {
      const newItem: Contract = {
        id: `C-${Date.now()}`,
        contractNo: values.contractNo,
        supplierName: values.supplierName,
        title: values.title,
        startDate: values.startDate,
        endDate: values.endDate,
        amount: Number(values.amount || 0),
        currency: values.currency || 'CNY',
        status: (values.status || 'draft') as Contract['status'],
        statusText: (
          values.status === 'active' ? '执行中' :
          values.status === 'expired' ? '已到期' :
          values.status === 'terminated' ? '已终止' : '草稿'
        ),
        attachments: fileList,
        remarks: values.remarks,
      };
      const next = [newItem, ...data];
      setData(next);
      setFilteredData(next);
      try { localStorage.setItem('contractsData', JSON.stringify(next)); } catch {}
      setIsCreateVisible(false);
      message.success('合同已创建');
    }).catch(() => message.error('请完善合同表单'));
  };

  // 读取本地合同数据（如果有），并自动计算状态
  useEffect(() => {
    try {
      const raw = localStorage.getItem('contractsData');
      if (raw) {
        const list = JSON.parse(raw) as Contract[];
        const recomputed = recomputeStatuses(list);
        setData(recomputed);
        setFilteredData(recomputed);
        try { localStorage.setItem('contractsData', JSON.stringify(recomputed)); } catch {}
      }
    } catch {}
  }, []);

  return (
    <div className="p-6">
      {/* 到期提醒 */}
      {useMemo(() => {
        const expiredCount = data.filter(d => d.status === 'expired').length;
        const dueSoonCount = data.filter(d => d.dueSoon && d.status !== 'expired').length;
        return (
          <div className="mb-4">
            {expiredCount > 0 && (
              <Alert type="warning" message={`有 ${expiredCount} 条合同已到期，请及时处理`} showIcon className="mb-2" />
            )}
            {dueSoonCount > 0 && (
              <Alert type="info" message={`有 ${dueSoonCount} 条合同将在30天内到期`} showIcon />
            )}
          </div>
        );
      }, [data])}
      <Card>
        <Form form={searchForm} layout="inline" className="mb-4">
          <Form.Item name="keyword" label="关键词">
            <Input placeholder="合同编号/名称" style={{ width: 200 }} />
          </Form.Item>
          <Form.Item name="supplier" label="供应商">
            <Input placeholder="供应商名称" style={{ width: 180 }} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择" style={{ width: 140 }} allowClear>
              <Option value="active">执行中</Option>
              <Option value="expired">已到期</Option>
              <Option value="terminated">已终止</Option>
              <Option value="draft">草稿</Option>
            </Select>
          </Form.Item>
          <Form.Item name="dueSoonOnly" valuePropName="checked">
            <Checkbox>仅看30天内到期</Checkbox>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>搜索</Button>
              <Button onClick={handleReset}>重置</Button>
              <Button type="dashed" icon={<PlusOutlined />} onClick={handleCreate}>新建合同</Button>
            </Space>
          </Form.Item>
        </Form>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1000 }}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `共 ${t} 条记录` }}
        />
      </Card>

      {/* 合同详情 */}
      <Modal
        title="合同详情"
        open={isDetailVisible}
        onCancel={() => setIsDetailVisible(false)}
        footer={null}
        width={800}
      >
        {selectedRecord && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="合同编号">{selectedRecord.contractNo}</Descriptions.Item>
              <Descriptions.Item label="合同名称">{selectedRecord.title}</Descriptions.Item>
              <Descriptions.Item label="供应商">{selectedRecord.supplierName}</Descriptions.Item>
              <Descriptions.Item label="金额">¥{selectedRecord.amount.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="开始日期">{selectedRecord.startDate}</Descriptions.Item>
              <Descriptions.Item label="结束日期">{selectedRecord.endDate}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={statusColor(selectedRecord.status)}>{selectedRecord.statusText}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="备注" span={2}>{selectedRecord.remarks || '-'}</Descriptions.Item>
            </Descriptions>

            {/* 关联订单统计与跳转 */}
            <Card size="small" title="关联订单" style={{ marginTop: 16 }}>
              <Space style={{ marginBottom: 8 }}>
                <Tag color={associatedOrders.length > 0 ? 'green' : 'default'}>
                  已关联订单：{associatedOrders.length}
                </Tag>
                <Button type="link" onClick={() => navigate(`/procurement/order?contractId=${selectedRecord.id}`)}>跳转到采购订单列表</Button>
              </Space>
              {associatedOrders.length > 0 && (
                <Table
                  size="small"
                  pagination={false}
                  rowKey="id"
                  dataSource={associatedOrders.slice(0, 5)}
                  columns={[
                    { title: '采购单号', dataIndex: 'orderNumber', key: 'orderNumber', width: 140 },
                    { title: '订单标题', dataIndex: 'title', key: 'title' },
                    { title: '供应商', dataIndex: 'supplier', key: 'supplier', width: 180 },
                    { title: '状态', dataIndex: 'statusText', key: 'statusText', width: 100 },
                  ]}
                />
              )}
            </Card>

            <Card size="small" title="合同附件" style={{ marginTop: 16 }}>
              <Upload
                fileList={selectedRecord.attachments}
                onChange={({ fileList }) => {
                  const next = data.map(d => d.id === selectedRecord.id ? { ...d, attachments: fileList } : d);
                  setData(next);
                  setFilteredData(next);
                  setSelectedRecord(prev => prev ? { ...prev, attachments: fileList } : prev);
                  try { localStorage.setItem('contractsData', JSON.stringify(next)); } catch {}
                }}
                beforeUpload={() => false}
                showUploadList={{ showPreviewIcon: true, showRemoveIcon: true, showDownloadIcon: true }}
                onPreview={(file) => {
                  const url = (file as any).url || (file as any).thumbUrl || (file as any).originFileObj ? URL.createObjectURL((file as any).originFileObj as Blob) : '';
                  const name = file.name?.toLowerCase() || '';
                  const type: 'image' | 'pdf' | 'other' = name.endsWith('.pdf') ? 'pdf' : (name.match(/\.png|\.jpg|\.jpeg|\.gif|\.bmp|\.webp/) ? 'image' : 'other');
                  setPreviewUrl(url);
                  setPreviewType(type);
                  setPreviewVisible(true);
                }}
                onDownload={(file) => {
                  const url = (file as any).url || (file as any).thumbUrl || (file as any).originFileObj ? URL.createObjectURL((file as any).originFileObj as Blob) : '';
                  if (url) {
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = file.name || '附件';
                    a.click();
                    setTimeout(() => URL.revokeObjectURL(url), 1000);
                  }
                }}
              >
                <Button icon={<UploadOutlined />}>上传附件</Button>
              </Upload>
            </Card>
          </div>
        )}
      </Modal>

      {/* 新建合同 */}
      <Modal
        title="新建合同"
        open={isCreateVisible}
        onCancel={() => setIsCreateVisible(false)}
        onOk={handleCreateSubmit}
        okText="保存"
        width={700}
      >
        <Form form={contractForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="contractNo" label="合同编号" rules={[{ required: true, message: '请输入合同编号' }]}>
                <Input placeholder="合同编号" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="supplierName" label="供应商" rules={[{ required: true, message: '请输入供应商名称' }]}>
                <Input placeholder="供应商名称" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="title" label="合同名称" rules={[{ required: true, message: '请输入合同名称' }]}>
            <Input placeholder="合同名称" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="startDate" label="开始日期" rules={[{ required: true, message: '请输入开始日期' }]}>
                <Input placeholder="YYYY-MM-DD" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="endDate" label="结束日期" rules={[{ required: true, message: '请输入结束日期' }]}>
                <Input placeholder="YYYY-MM-DD" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="amount" label="金额" rules={[{ required: true, message: '请输入合同金额' }]}>
                <Input type="number" placeholder="金额" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="status" label="状态">
                <Select placeholder="请选择">
                  <Option value="active">执行中</Option>
                  <Option value="expired">已到期</Option>
                  <Option value="terminated">已终止</Option>
                  <Option value="draft">草稿</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="currency" label="币种">
                <Input placeholder="如：CNY" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="remarks" label="备注">
            <TextArea rows={3} placeholder="合同备注" />
          </Form.Item>

          <Card size="small" title="附件">
            <Upload
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              beforeUpload={() => false}
              showUploadList={{ showPreviewIcon: true, showRemoveIcon: true, showDownloadIcon: true }}
              onPreview={(file) => {
                const url = (file as any).url || (file as any).thumbUrl || (file as any).originFileObj ? URL.createObjectURL((file as any).originFileObj as Blob) : '';
                const name = file.name?.toLowerCase() || '';
                const type: 'image' | 'pdf' | 'other' = name.endsWith('.pdf') ? 'pdf' : (name.match(/\.png|\.jpg|\.jpeg|\.gif|\.bmp|\.webp/) ? 'image' : 'other');
                setPreviewUrl(url);
                setPreviewType(type);
                setPreviewVisible(true);
              }}
              onDownload={(file) => {
                const url = (file as any).url || (file as any).thumbUrl || (file as any).originFileObj ? URL.createObjectURL((file as any).originFileObj as Blob) : '';
                if (url) {
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = file.name || '附件';
                  a.click();
                  setTimeout(() => URL.revokeObjectURL(url), 1000);
                }
              }}
            >
              <Button icon={<UploadOutlined />}>上传附件</Button>
            </Upload>
          </Card>
        </Form>
      </Modal>

      {/* 附件预览 */}
      <Modal
        title="附件预览"
        open={previewVisible}
        onCancel={() => {
          setPreviewVisible(false);
          if (previewUrl.startsWith('blob:')) {
            try { URL.revokeObjectURL(previewUrl); } catch {}
          }
          setPreviewUrl('');
        }}
        footer={null}
        width={900}
      >
        {previewType === 'image' && previewUrl && (
          <img src={previewUrl} alt="预览" style={{ maxWidth: '100%' }} />
        )}
        {previewType === 'pdf' && previewUrl && (
          <iframe src={previewUrl} style={{ width: '100%', height: 600 }} />
        )}
        {previewType === 'other' && previewUrl && (
          <a href={previewUrl} target="_blank" rel="noreferrer">在新窗口打开</a>
        )}
      </Modal>
    </div>
  );
};

export default ContractManagement;