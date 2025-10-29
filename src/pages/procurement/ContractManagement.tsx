import React, { useEffect, useMemo, useState } from 'react';
import { Card, Table, Button, Form, Input, Select, Modal, Space, Tag, message, Descriptions, Row, Col, Upload, Alert, Checkbox } from 'antd';
import { EyeOutlined, SearchOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload/interface';
import { useProcurementOrder } from '@/contexts/ProcurementOrderContext';
import { mockSuppliers } from '@/data/procurementData';
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
  const [supplierNames, setSupplierNames] = useState<string[]>([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [previewType, setPreviewType] = useState<'image' | 'pdf' | 'other'>('other');
  const [searchForm] = Form.useForm();
  const [contractForm] = Form.useForm();
  const { orders, updateOrder } = useProcurementOrder();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOrderSelectVisible, setIsOrderSelectVisible] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  // 附件列表弹窗与预览
  const [isAttachmentsVisible, setIsAttachmentsVisible] = useState(false);
  const [attachmentsForList, setAttachmentsForList] = useState<UploadFile[]>([]);
  const [attachmentsTitle, setAttachmentsTitle] = useState<string>('附件列表');
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
        attachments: [
          { uid: 'att-2024-001-1', name: 'HT-2024-001-合同扫描件.pdf', status: 'done', url: 'https://file-examples.com/storage/fe9d1348c9a9e312fa8f8a5/2017/10/file-sample_150kB.pdf' } as UploadFile,
          { uid: 'att-2024-001-2', name: 'HT-2024-001-签署页.png', status: 'done', url: 'https://via.placeholder.com/640x360.png?text=Contract+Signature' } as UploadFile,
        ],
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
        attachments: [
          { uid: 'att-2024-005-1', name: 'HT-2024-005-合同正文.pdf', status: 'done', url: 'https://file-examples.com/storage/fe9d1348c9a9e312fa8f8a5/2017/10/file-sample_150kB.pdf' } as UploadFile,
        ],
        remarks: '一次性采购',
      },
      {
        id: 'C-2024-003',
        contractNo: 'HT-2024-010',
        supplierId: '3',
        supplierName: '深圳设备服务有限公司',
        title: '设备维保服务合同',
        startDate: '2024-03-01',
        endDate: '2024-09-30',
        amount: 65000,
        currency: 'CNY',
        status: 'terminated',
        statusText: '已终止',
        attachments: [
          { uid: 'att-2024-010-1', name: 'HT-2024-010-终止说明.pdf', status: 'done', url: 'https://file-examples.com/storage/fe9d1348c9a9e312fa8f8a5/2017/10/file-sample_150kB.pdf' } as UploadFile,
          { uid: 'att-2024-010-2', name: 'HT-2024-010-往来函件.png', status: 'done', url: 'https://via.placeholder.com/640x360.png?text=Letter' } as UploadFile,
        ],
        remarks: '违约终止，待重新签订',
      },
      {
        id: 'C-2024-004',
        contractNo: 'HT-2024-011',
        supplierId: '4',
        supplierName: '广州办公用品有限公司',
        title: '办公耗材采购合同',
        startDate: '2024-11-01',
        endDate: '2025-10-31',
        amount: 12000,
        currency: 'CNY',
        status: 'draft',
        statusText: '草稿',
        attachments: [
          { uid: 'att-2024-011-1', name: 'HT-2024-011-草稿版.docx', status: 'done', url: 'https://via.placeholder.com/640x360.png?text=Draft+Doc' } as UploadFile,
        ],
        remarks: '草稿合同，待审批',
      },
    ];
    const recomputed = recomputeStatuses(mock);
    setData(recomputed);
    setFilteredData(recomputed);
    try { localStorage.setItem('contractsData', JSON.stringify(recomputed)); } catch {}
    setLoading(false);
  }, []);

  // 读取供应商名称列表（来自 basic-info/supplier 页面）
  useEffect(() => {
    try {
      const raw = localStorage.getItem('supplierList');
      let names: string[] = [];
      if (raw) {
        const arr = JSON.parse(raw) as string[];
        names = Array.from(new Set(arr.filter(Boolean)));
      }
      if (!names || names.length === 0) {
        names = Array.from(new Set((mockSuppliers || []).map(s => s.name).filter(Boolean)));
      }
      setSupplierNames(names);
    } catch {}
  }, []);

  // 根据结束日期自动计算状态与“即将到期”标识（30天内）
  const recomputeStatuses = (list: Contract[]): Contract[] => {
    const today = new Date();
    return list.map((c): Contract => {
      try {
        const end = new Date(c.endDate);
        if (c.status !== 'terminated') {
          if (end < today) {
            return { ...c, status: 'expired' as Contract['status'], statusText: '已到期', dueSoon: false } as Contract;
          }
          const diffDays = Math.floor((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          const dueSoon = diffDays >= 0 && diffDays <= 30;
          return { ...c, dueSoon } as Contract;
        }
      } catch {}
      return c as Contract;
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
    { title: '附件数', key: 'attachments', width: 90, align: 'center', render: (_, r) => (
      <Button type="link" size="small" onClick={() => {
        setAttachmentsForList(r.attachments || []);
        setAttachmentsTitle(`附件列表 - ${r.contractNo}`);
        setIsAttachmentsVisible(true);
      }}>
        {r.attachments?.length || 0}
      </Button>
    ) },
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
      if (!selectedOrderIds || selectedOrderIds.length === 0) {
        message.error('请先关联采购订单后再保存');
        return;
      }
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
      try {
        selectedOrderIds.forEach(id => {
          const found = orders.find(o => o.id === id);
          if (found) {
            updateOrder({ ...found, contractId: newItem.id, contractNo: newItem.contractNo });
          }
        });
      } catch {}
      setIsCreateVisible(false);
      setSelectedOrderIds([]);
      message.success('合同已创建');
    }).catch(() => message.error('请完善合同表单'));
  };

  // 读取本地合同数据（如果有），并自动计算状态
  useEffect(() => {
    try {
      const raw = localStorage.getItem('contractsData');
      if (raw) {
        let list = JSON.parse(raw) as Contract[];
        let recomputed = recomputeStatuses(list);

        // 若本地存储缺少某些状态，补充示例数据以覆盖四种状态
        const hasStatus = (s: Contract['status']) => recomputed.some(c => c.status === s);
        const seedSamples: Contract[] = [
          {
            id: 'SEED-ACTIVE',
            contractNo: 'SEED-HT-ACTIVE',
            supplierName: '示例供应商A',
            title: '执行中合同示例',
            startDate: '2025-01-01',
            endDate: '2026-01-01',
            amount: 10000,
            currency: 'CNY',
            status: 'active',
            statusText: '执行中',
            attachments: [
              { uid: 'seed-active-1', name: '执行中-合同扫描件.pdf', status: 'done', url: 'https://file-examples.com/storage/fe9d1348c9a9e312fa8f8a5/2017/10/file-sample_150kB.pdf' } as UploadFile,
            ],
            remarks: '用于展示执行中状态'
          },
          {
            id: 'SEED-EXPIRED',
            contractNo: 'SEED-HT-EXPIRED',
            supplierName: '示例供应商B',
            title: '已到期合同示例',
            startDate: '2023-01-01',
            endDate: '2023-12-31',
            amount: 20000,
            currency: 'CNY',
            status: 'expired',
            statusText: '已到期',
            attachments: [
              { uid: 'seed-expired-1', name: '到期-归档文件.pdf', status: 'done', url: 'https://file-examples.com/storage/fe9d1348c9a9e312fa8f8a5/2017/10/file-sample_150kB.pdf' } as UploadFile,
              { uid: 'seed-expired-2', name: '到期-通知函.png', status: 'done', url: 'https://via.placeholder.com/640x360.png?text=Notice' } as UploadFile,
            ],
            remarks: '用于展示到期状态'
          },
          {
            id: 'SEED-TERMINATED',
            contractNo: 'SEED-HT-TERMINATED',
            supplierName: '示例供应商C',
            title: '已终止合同示例',
            startDate: '2024-03-01',
            endDate: '2024-09-30',
            amount: 30000,
            currency: 'CNY',
            status: 'terminated',
            statusText: '已终止',
            attachments: [
              { uid: 'seed-terminated-1', name: '终止-说明书.pdf', status: 'done', url: 'https://file-examples.com/storage/fe9d1348c9a9e312fa8f8a5/2017/10/file-sample_150kB.pdf' } as UploadFile,
            ],
            remarks: '用于展示终止状态'
          },
          {
            id: 'SEED-DRAFT',
            contractNo: 'SEED-HT-DRAFT',
            supplierName: '示例供应商D',
            title: '草稿合同示例',
            startDate: '2025-11-01',
            endDate: '2026-10-31',
            amount: 12000,
            currency: 'CNY',
            status: 'draft',
            statusText: '草稿',
            attachments: [
              { uid: 'seed-draft-1', name: '草稿-版本v1.docx', status: 'done', url: 'https://via.placeholder.com/640x360.png?text=Draft' } as UploadFile,
            ],
            remarks: '用于展示草稿状态'
          },
        ];
        const allStatuses: Contract['status'][] = ['active', 'expired', 'terminated', 'draft'];
        allStatuses.forEach(s => {
          if (!hasStatus(s)) {
            const sample = seedSamples.find(x => x.status === s)!;
            recomputed = [sample, ...recomputed];
          }
        });

        // 为没有附件的合同补充示例附件
        const withAttachments = recomputed.map((c, idx) => {
          if (c.attachments && c.attachments.length > 0) return c;
          const base = c.contractNo || c.title || `合同-${idx + 1}`;
          const sample: UploadFile[] = [
            { uid: `${c.id}-auto-1`, name: `${base}-扫描件.pdf`, status: 'done', url: 'https://file-examples.com/storage/fe9d1348c9a9e312fa8f8a5/2017/10/file-sample_150kB.pdf' } as UploadFile,
          ];
          return { ...c, attachments: sample };
        });

        setData(withAttachments);
        setFilteredData(withAttachments);
        try { localStorage.setItem('contractsData', JSON.stringify(withAttachments)); } catch {}
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
      {/* 状态总览 */}
      {useMemo(() => {
        const totalActive = data.filter(d => d.status === 'active').length;
        const totalExpired = data.filter(d => d.status === 'expired').length;
        const totalTerminated = data.filter(d => d.status === 'terminated').length;
        const totalDraft = data.filter(d => d.status === 'draft').length;
        return (
          <Space className="mb-4">
            <Tag color={statusColor('active')}>执行中：{totalActive}</Tag>
            <Tag color={statusColor('expired')}>已到期：{totalExpired}</Tag>
            <Tag color={statusColor('terminated')}>已终止：{totalTerminated}</Tag>
            <Tag color={statusColor('draft')}>草稿：{totalDraft}</Tag>
          </Space>
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

      {/* 附件列表弹窗 */}
      <Modal
        title={attachmentsTitle}
        open={isAttachmentsVisible}
        onCancel={() => setIsAttachmentsVisible(false)}
        footer={null}
        width={700}
      >
        <Table
          size="small"
          rowKey={(f) => (f as any).uid || (f as any).name}
          pagination={false}
          dataSource={attachmentsForList}
          columns={[
            {
              title: '文件名',
              dataIndex: 'name',
              key: 'name',
              render: (_: any, file: UploadFile) => (
                <Button type="link" onClick={() => {
                  const url = (file as any).url || (file as any).thumbUrl || (file as any).originFileObj ? URL.createObjectURL((file as any).originFileObj as Blob) : (file as any).url || '';
                  const name = (file.name || '').toLowerCase();
                  const type: 'image' | 'pdf' | 'other' = name.endsWith('.pdf') ? 'pdf' : (name.match(/\.png|\.jpg|\.jpeg|\.gif|\.bmp|\.webp/) ? 'image' : 'other');
                  setPreviewUrl(url);
                  setPreviewType(type);
                  setPreviewVisible(true);
                }}>
                  {file.name}
                </Button>
              )
            },
            { title: '大小/状态', key: 'info', render: (_: any, file: UploadFile) => `${(file.size || 0) > 0 ? `${Math.round((file.size || 0)/1024)} KB` : ''} ${file.status || ''}` },
          ]}
        />
      </Modal>

      {/* 附件预览弹窗 */}
      <Modal
        title="附件预览"
        open={previewVisible}
        onCancel={() => {
          // 清理临时URL
          try { if (previewUrl && previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl); } catch {}
          setPreviewVisible(false);
        }}
        footer={null}
        width={900}
      >
        {previewType === 'image' && (
          <img src={previewUrl} alt="预览" style={{ maxWidth: '100%' }} />
        )}
        {previewType === 'pdf' && (
          <iframe src={previewUrl} style={{ width: '100%', height: 600, border: 0 }} title="PDF预览" />
        )}
        {previewType === 'other' && (
          <div>
            <Alert type="info" message="该文件类型无法内嵌预览，您可以下载查看。" />
            <div style={{ marginTop: 12 }}>
              <Button type="primary" onClick={() => {
                if (previewUrl) {
                  const a = document.createElement('a');
                  a.href = previewUrl;
                  a.download = '附件';
                  a.click();
                }
              }}>下载附件</Button>
            </div>
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
              <Form.Item name="supplierName" label="供应商" rules={[{ required: true, message: '请选择供应商' }]}>                
                <Select
                  placeholder="请选择供应商"
                  allowClear
                  showSearch
                  filterOption={(input, option) => {
                    const label = String(option?.children ?? option?.value ?? '');
                    return label.toLowerCase().includes(input.toLowerCase());
                  }}
                >
                  {supplierNames.map(name => (
                    <Option key={name} value={name}>{name}</Option>
                  ))}
                </Select>
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

          <Card size="small" title="关联采购订单" style={{ marginBottom: 16 }}>
            <Space style={{ marginBottom: 8 }}>
              <Tag color={selectedOrderIds.length > 0 ? 'green' : 'default'}>
                已选择：{selectedOrderIds.length} 条订单
              </Tag>
              <Button type="primary" onClick={() => setIsOrderSelectVisible(true)}>关联采购订单</Button>
            </Space>
            {selectedOrderIds.length > 0 && (
              <Table
                size="small"
                pagination={false}
                rowKey="id"
                dataSource={orders.filter(o => selectedOrderIds.includes(o.id))}
                columns={[
                  { title: '采购单号', dataIndex: 'orderNumber', key: 'orderNumber', width: 140 },
                  { title: '订单标题', dataIndex: 'title', key: 'title' },
                  { title: '供应商', dataIndex: 'supplier', key: 'supplier', width: 180 },
                  { title: '状态', dataIndex: 'statusText', key: 'statusText', width: 100 },
                ]}
              />
            )}
          </Card>

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

      {/* 选择关联采购订单 */}
      <Modal
        title="选择关联采购订单"
        open={isOrderSelectVisible}
        onCancel={() => setIsOrderSelectVisible(false)}
        onOk={() => setIsOrderSelectVisible(false)}
        okText="完成选择"
        width={900}
        destroyOnHidden
      >
        <Table
          rowKey="id"
          dataSource={orders}
          pagination={{ pageSize: 8 }}
          rowSelection={{
            type: 'checkbox',
            selectedRowKeys: selectedOrderIds,
            onChange: (keys) => setSelectedOrderIds(keys as string[])
          }}
          columns={[
            { title: '采购单号', dataIndex: 'orderNumber', key: 'orderNumber', width: 160 },
            { title: '订单标题', dataIndex: 'title', key: 'title' },
            { title: '供应商', dataIndex: 'supplier', key: 'supplier', width: 180 },
            { title: '状态', dataIndex: 'statusText', key: 'statusText', width: 120 },
            { title: '下单日期', dataIndex: 'orderDate', key: 'orderDate', width: 140 },
            { title: '金额', dataIndex: 'totalAmount', key: 'totalAmount', width: 120, align: 'right', render: (v: number) => `¥${Number(v || 0).toLocaleString()}` },
          ]}
        />
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