import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Modal, Form, Input, Select, DatePicker, Space, Tag, message, Descriptions, Row, Col } from 'antd';
import { EyeOutlined, CheckOutlined, FileTextOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useLocation, useNavigate } from 'react-router-dom';
import { useInquiry } from '@/contexts/InquiryContext';

const { Option } = Select;
const { RangePicker } = DatePicker;

// 筛选条件组件
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
      <Row gutter={[16, 16]} style={{ width: '100%' }}>
        <Col span={6}>
          <Form.Item name="requestNo" label="询价单号">
            <Input placeholder="请输入询价单号" />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="title" label="询价标题">
            <Input placeholder="请输入询价标题" />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="department" label="申请部门">
            <Input placeholder="请输入申请部门" />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="requisitionNumber" label="申请单号">
            <Input placeholder="请输入申请单号" />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="applicant" label="申请人">
            <Input placeholder="请输入申请人" />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="status" label="询价状态">
            <Select placeholder="请选择状态" allowClear>
              <Option value="draft">草稿</Option>
              <Option value="inquiring">询价中</Option>
              <Option value="quoted">已报价</Option>
              <Option value="compared">已比价</Option>
              <Option value="selected">已选定</Option>
              <Option value="completed">已完成</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="requestDate" label="申请日期">
            <RangePicker placeholder={['开始日期', '结束日期']} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="deadline" label="截止日期">
            <RangePicker placeholder={['开始日期', '结束日期']} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="quotationDate" label="报价日期">
            <RangePicker placeholder={['开始日期', '结束日期']} />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="supplier" label="供应商">
            <Select placeholder="请选择供应商" allowClear>
              <Option value="北京科技有限公司">北京科技有限公司</Option>
              <Option value="上海设备制造厂">上海设备制造厂</Option>
              <Option value="广州电子科技">广州电子科技</Option>
              <Option value="深圳智能设备">深圳智能设备</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="quotationStatus" label="报价状态">
            <Select placeholder="请选择报价状态" allowClear>
              <Option value="pending">待报价</Option>
              <Option value="submitted">已提交</Option>
              <Option value="selected">已选定</Option>
              <Option value="rejected">已拒绝</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="totalAmountRange" label="总金额范围">
            <Space.Compact>
              <Input
                style={{ width: '45%' }}
                placeholder="最小金额"
                type="number"
              />
              <Input
                style={{ width: '10%', textAlign: 'center', pointerEvents: 'none' }}
                placeholder="~"
                disabled
              />
              <Input
                style={{ width: '45%' }}
                placeholder="最大金额"
                type="number"
              />
            </Space.Compact>
          </Form.Item>
        </Col>
        <Col span={4}>
          <Form.Item name="quotationCountRange" label="报价数量">
            <Space.Compact>
              <Input
                style={{ width: '45%' }}
                placeholder="最少"
                type="number"
              />
              <Input
                style={{ width: '10%', textAlign: 'center', pointerEvents: 'none' }}
                placeholder="~"
                disabled
              />
              <Input
                style={{ width: '45%' }}
                placeholder="最多"
                type="number"
              />
            </Space.Compact>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="description" label="询价说明">
            <Input placeholder="请输入询价说明关键词" />
          </Form.Item>
        </Col>
        <Col span={24} className="text-right">
          <Space>
            <Button type="primary" htmlType="submit">
              查询
            </Button>
            <Button onClick={onReset}>
              重置
            </Button>
          </Space>
        </Col>
      </Row>
    </Form>
  );
};

// 询价单接口
interface QuotationRequest {
  id: string;
  requestNo: string;
  title: string;
  department: string;
  requestDate: string;
  deadline: string;
  status: 'inquiring' | 'quoted' | 'completed' | 'compared' | 'selected' | 'draft';
  statusText: string;
  description: string;
  items: QuotationItem[];
  quotations: Quotation[];
  // 关联的采购申请信息
  procurementRequisition?: {
    id: number;
    requisitionNumber: string;
    applicant: string;
    department: string;
    applicationDate: string;
    description: string;
  };
}

// 询价项目接口
interface QuotationItem {
  id: string;
  name: string;
  specification: string;
  unit: string;
  quantity: number;
  estimatedPrice: number;
}

// 报价接口
interface Quotation {
  id: string;
  supplierId: string;
  supplierName: string;
  quotationDate: string;
  validUntil: string;
  totalAmount: number;
  status: 'pending' | 'submitted' | 'selected' | 'rejected';
  items: QuotationItemPrice[];
  remarks: string;
}

// 报价项目价格接口
interface QuotationItemPrice {
  itemId: string;
  unitPrice: number;
  totalPrice: number;
  deliveryTime: string;
  remarks: string;
}



const QuotationComparison: React.FC = () => {
  // 使用全局状态管理
  const { quotationRequests, updateQuotationRequest } = useInquiry();
  
  // 获取路由参数
  const location = useLocation();
  const navigate = useNavigate();
  const { requisitionNumber, openComparison } = location.state || {};
  
  const [filteredData, setFilteredData] = useState<QuotationRequest[]>([]);
  const [loading] = useState(false);

  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isComparisonModalVisible, setIsComparisonModalVisible] = useState(false);

  const [selectedRecord, setSelectedRecord] = useState<QuotationRequest | null>(null);
  
  // 比价弹窗按钮状态
  const [isConfirmed, setIsConfirmed] = useState(false); // 是否已确定选择
  const [canConfirm, setCanConfirm] = useState(false); // 是否可以确定（已选定供应商）

  useEffect(() => {
    // 使用全局状态中的询价单数据
    setFilteredData(quotationRequests);
  }, [quotationRequests]);

  // 处理从采购申请页面跳转过来的自动匹配和打开比价对话框
  useEffect(() => {
    console.log('自动打开useEffect执行:', {
      requisitionNumber,
      openComparison,
      quotationRequestsLength: quotationRequests.length,
      quotationRequests: quotationRequests.map(r => ({
        id: r.id,
        requestNo: r.requestNo,
        procurementRequisition: r.procurementRequisition
      }))
    });
    
    if (requisitionNumber && openComparison && quotationRequests.length > 0) {
      console.log('开始查找匹配的询价单...');
      // 查找匹配申请单号的询价单
      const matchedRecord = quotationRequests.find(
        request => request.procurementRequisition?.requisitionNumber === requisitionNumber
      );
      
      console.log('匹配结果:', matchedRecord);
      
      if (matchedRecord) {
        console.log('找到匹配的询价单，准备打开比价对话框');
        // 自动打开比价对话框
        handleCompare(matchedRecord);
        message.success(`已自动匹配申请单号 ${requisitionNumber} 并打开比价对话框`);
      } else {
        console.log('未找到匹配的询价单');
        message.warning(`未找到申请单号 ${requisitionNumber} 对应的询价单`);
      }
    } else {
      console.log('条件不满足，不执行自动打开逻辑');
    }
  }, [requisitionNumber, openComparison, quotationRequests]);

  const handleView = (record: QuotationRequest) => {
    setSelectedRecord(record);
    setIsDetailModalVisible(true);
  };

  const handleCompare = (record: QuotationRequest) => {
    setSelectedRecord(record);
    setIsComparisonModalVisible(true);
    
    // 检查是否已有选定的供应商
    const hasSelectedQuotation = record.quotations.some(q => q.status === 'selected');
    const hasSubmittedQuotation = record.quotations.some(q => q.status === 'submitted');
    
    setCanConfirm(hasSelectedQuotation || hasSubmittedQuotation);
    setIsConfirmed(record.status === 'completed');
  };

  const handleSelectQuotation = (quotationId: string) => {
    if (!selectedRecord) return;
    
    const updatedRecord = {
      ...selectedRecord,
      quotations: selectedRecord.quotations.map(q => ({
        ...q,
        status: q.id === quotationId ? 'selected' as const : 'rejected' as const
      }))
    };
    
    setSelectedRecord(updatedRecord);
    setCanConfirm(true);
    message.success('报价选定成功，请点击确定按钮完成询价');
  };

  // 确定按钮处理函数
  const handleConfirmSelection = () => {
    if (!selectedRecord) return;
    
    const updatedRecord = {
      ...selectedRecord,
      status: 'completed' as const,
      statusText: '已完成'
    };
    
    updateQuotationRequest(updatedRecord.id, updatedRecord);
    setSelectedRecord(updatedRecord);
    setIsConfirmed(true);
    message.success('询价单已完成');
  };

  // 取消按钮处理函数
  const handleCancelComparison = () => {
    setIsComparisonModalVisible(false);
    setIsConfirmed(false);
    setCanConfirm(false);
  };

  // 生成订单按钮处理函数
  const handleGenerateOrder = () => {
    if (!selectedRecord) return;
    
    // 跳转到采购订单页面并传递询价单数据
    message.success('正在跳转到采购订单页面...');
    setIsComparisonModalVisible(false);
    
    // 使用React Router的navigate跳转到采购订单页面，并传递询价单编号
    navigate('/procurement/order', {
      state: {
        fromQuotation: true,
        quotationRequestId: selectedRecord.id,
        quotationRequestNo: selectedRecord.requestNo
      }
    });
  };

















  // 筛选处理
  const handleFilter = (values: any) => {
    let filtered = quotationRequests;

    // 询价单号筛选
    if (values.requestNo) {
      filtered = filtered.filter(item =>
        item.requestNo.toLowerCase().includes(values.requestNo.toLowerCase())
      );
    }

    // 询价标题筛选
    if (values.title) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(values.title.toLowerCase())
      );
    }

    // 申请部门筛选
    if (values.department) {
      filtered = filtered.filter(item =>
        item.department.toLowerCase().includes(values.department.toLowerCase())
      );
    }

    // 申请单号筛选
    if (values.requisitionNumber) {
      filtered = filtered.filter(item =>
        item.procurementRequisition?.requisitionNumber?.toLowerCase().includes(values.requisitionNumber.toLowerCase())
      );
    }

    // 申请人筛选
    if (values.applicant) {
      filtered = filtered.filter(item =>
        item.procurementRequisition?.applicant?.toLowerCase().includes(values.applicant.toLowerCase())
      );
    }

    // 状态筛选
    if (values.status) {
      filtered = filtered.filter(item => item.status === values.status);
    }

    // 申请日期筛选
    if (values.requestDate && values.requestDate.length === 2) {
      const [startDate, endDate] = values.requestDate;
      filtered = filtered.filter(item => {
        const itemDate = dayjs(item.requestDate);
        return itemDate.isAfter(startDate.startOf('day')) && itemDate.isBefore(endDate.endOf('day'));
      });
    }

    // 截止日期筛选
    if (values.deadline && values.deadline.length === 2) {
      const [startDate, endDate] = values.deadline;
      filtered = filtered.filter(item => {
        const itemDate = dayjs(item.deadline);
        return itemDate.isAfter(startDate.startOf('day')) && itemDate.isBefore(endDate.endOf('day'));
      });
    }

    // 报价日期筛选
    if (values.quotationDate && values.quotationDate.length === 2) {
      const [startDate, endDate] = values.quotationDate;
      filtered = filtered.filter(item => {
        return item.quotations.some(q => {
          const quotationDate = dayjs(q.quotationDate);
          return quotationDate.isAfter(startDate.startOf('day')) && quotationDate.isBefore(endDate.endOf('day'));
        });
      });
    }

    // 供应商筛选
    if (values.supplier) {
      filtered = filtered.filter(item =>
        item.quotations.some(q => q.supplierName === values.supplier)
      );
    }

    // 报价状态筛选
    if (values.quotationStatus) {
      filtered = filtered.filter(item =>
        item.quotations.some(q => q.status === values.quotationStatus)
      );
    }

    // 总金额范围筛选
    if (values.totalAmountRange) {
      const minAmount = parseFloat(values.totalAmountRange[0]);
      const maxAmount = parseFloat(values.totalAmountRange[1]);
      
      if (!isNaN(minAmount) || !isNaN(maxAmount)) {
        filtered = filtered.filter(item => {
          return item.quotations.some(q => {
            if (!isNaN(minAmount) && q.totalAmount < minAmount) return false;
            if (!isNaN(maxAmount) && q.totalAmount > maxAmount) return false;
            return true;
          });
        });
      }
    }

    // 报价数量范围筛选
    if (values.quotationCountRange) {
      const minCount = parseInt(values.quotationCountRange[0]);
      const maxCount = parseInt(values.quotationCountRange[1]);
      
      if (!isNaN(minCount)) {
        filtered = filtered.filter(item => item.quotations.length >= minCount);
      }
      
      if (!isNaN(maxCount)) {
        filtered = filtered.filter(item => item.quotations.length <= maxCount);
      }
    }

    // 询价说明筛选
    if (values.description) {
      filtered = filtered.filter(item =>
        item.description.toLowerCase().includes(values.description.toLowerCase())
      );
    }

    setFilteredData(filtered);
  };

  // 状态快速筛选
  const handleQuickFilter = (status: string) => {
    if (status === 'all') {
      setFilteredData(quotationRequests);
    } else {
      setFilteredData(quotationRequests.filter(item => item.status === status));
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      inquiring: 'processing',
      quoted: 'warning',
      completed: 'success',
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const columns: ColumnsType<QuotationRequest> = [
    {
      title: '序号',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: '询价单号',
      dataIndex: 'requestNo',
      key: 'requestNo',
      width: 120,
    },
    {
      title: '询价标题',
      dataIndex: 'title',
      key: 'title',
      width: 200,
    },
    {
      title: '申请部门',
      dataIndex: 'department',
      key: 'department',
      width: 100,
    },
    {
      title: '申请单号',
      key: 'requisitionNumber',
      width: 120,
      render: (_, record) => record.procurementRequisition?.requisitionNumber || '-',
    },
    {
      title: '询价日期',
      dataIndex: 'requestDate',
      key: 'requestDate',
      width: 100,
    },
    {
      title: '截止日期',
      dataIndex: 'deadline',
      key: 'deadline',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'statusText',
      key: 'status',
      width: 80,
      render: (text, record) => (
        <Tag color={getStatusColor(record.status)}>{text}</Tag>
      ),
    },
    {
      title: '报价数量',
      key: 'quotationCount',
      width: 80,
      render: (_, record) => record.quotations.length,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            详情
          </Button>
          {record.quotations.length > 1 && record.status === 'quoted' && (
            <Button
              type="link"
              size="small"
              icon={<FileTextOutlined />}
              onClick={() => handleCompare(record)}
            >
              比价
            </Button>
          )}

        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
        <Card>
          <FilterBar onFilter={handleFilter} />
          
          <div className="mb-4 flex justify-between items-center">
            <div className="flex gap-2">
              <Button onClick={() => handleQuickFilter('all')}>全部</Button>
              <Button onClick={() => handleQuickFilter('inquiring')}>询价中</Button>
              <Button onClick={() => handleQuickFilter('quoted')}>已报价</Button>
              <Button onClick={() => handleQuickFilter('completed')}>已完成</Button>
            </div>
          </div>

          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="id"
            loading={loading}
            scroll={{ x: 1200 }}
            pagination={{
              total: filteredData.length,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`,
            }}
          />
        </Card>



        {/* 详情模态框 */}
        <Modal
        title="询价单详情"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={null}
        width={1000}
      >
        {selectedRecord && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="询价单号">{selectedRecord.requestNo}</Descriptions.Item>
              <Descriptions.Item label="申请单号">{selectedRecord.procurementRequisition?.requisitionNumber || '无关联申请'}</Descriptions.Item>
              <Descriptions.Item label="询价标题">{selectedRecord.title}</Descriptions.Item>
              <Descriptions.Item label="申请部门">{selectedRecord.department}</Descriptions.Item>
              <Descriptions.Item label="询价日期">{selectedRecord.requestDate}</Descriptions.Item>
              <Descriptions.Item label="截止日期">{selectedRecord.deadline}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={getStatusColor(selectedRecord.status)}>{selectedRecord.statusText}</Tag>
              </Descriptions.Item>

              <Descriptions.Item label="询价说明" span={2}>{selectedRecord.description}</Descriptions.Item>
            </Descriptions>

            <div className="mt-4">
              <h4>询价项目</h4>
              <Table
                size="small"
                dataSource={selectedRecord.items}
                rowKey="id"
                pagination={false}
                columns={[
                  { title: '项目名称', dataIndex: 'name', key: 'name' },
                  { title: '规格型号', dataIndex: 'specification', key: 'specification' },
                  { title: '单位', dataIndex: 'unit', key: 'unit', width: 60 },
                  { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 80 },
                  { title: '预估单价', dataIndex: 'estimatedPrice', key: 'estimatedPrice', width: 100, render: (value) => `¥${value}` },
                ]}
              />
            </div>

            <div className="mt-4">
              <h4>供应商报价</h4>
              {selectedRecord.quotations.map(quotation => (
                <Card key={quotation.id} size="small" className="mb-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{quotation.supplierName}</span>
                    <div>
                      <Tag color={quotation.status === 'selected' ? 'success' : quotation.status === 'rejected' ? 'error' : 'default'}>
                        {quotation.status === 'selected' ? '已选定' : quotation.status === 'rejected' ? '已拒绝' : '待处理'}
                      </Tag>
                      <span className="ml-2 text-lg font-bold text-red-500">¥{quotation.totalAmount}</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    报价日期：{quotation.quotationDate} | 有效期至：{quotation.validUntil}
                  </div>
                  {quotation.remarks && (
                    <div className="text-sm text-gray-600 mt-1">备注：{quotation.remarks}</div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}
        </Modal>

        {/* 比价模态框 */}
        <Modal
        title="报价比较"
        open={isComparisonModalVisible}
        onCancel={handleCancelComparison}
        footer={[
          <Button key="cancel" onClick={handleCancelComparison}>
            取消
          </Button>,
          <Button 
            key="confirm" 
            type="primary" 
            disabled={!canConfirm || isConfirmed}
            onClick={handleConfirmSelection}
          >
            确定
          </Button>,
          <Button 
            key="generate" 
            type="primary" 
            disabled={!isConfirmed}
            onClick={handleGenerateOrder}
            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
          >
            生成订单
          </Button>
        ]}
        width={1200}
      >
        {selectedRecord && (
          <div>
            <div className="mb-4">
              <h4>{selectedRecord.title} - 报价比较</h4>
            </div>
            
            {selectedRecord.quotations.map(quotation => (
              <Card 
                key={quotation.id} 
                className="mb-4"
                title={
                  <div className="flex justify-between items-center">
                    <span>{quotation.supplierName}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-red-500">总价：¥{quotation.totalAmount}</span>
                      {quotation.status === 'submitted' && (
                        <Button
                          type="primary"
                          size="small"
                          icon={<CheckOutlined />}
                          onClick={() => handleSelectQuotation(quotation.id)}
                        >
                          选定此报价
                        </Button>
                      )}
                      {quotation.status === 'selected' && (
                        <Tag color="success">已选定</Tag>
                      )}
                      {quotation.status === 'rejected' && (
                        <Tag color="error">已拒绝</Tag>
                      )}
                    </div>
                  </div>
                }
              >
                <div className="mb-2 text-sm text-gray-600">
                  报价日期：{quotation.quotationDate} | 有效期至：{quotation.validUntil}
                </div>
                <Table
                  size="small"
                  dataSource={quotation.items}
                  rowKey="itemId"
                  pagination={false}
                  columns={[
                    { 
                      title: '项目名称', 
                      key: 'itemName',
                      render: (_, record) => {
                        const item = selectedRecord.items.find(i => i.id === record.itemId);
                        return item?.name;
                      },
                    },
                    { title: '单价', dataIndex: 'unitPrice', key: 'unitPrice', render: (value) => `¥${value}` },
                    { title: '总价', dataIndex: 'totalPrice', key: 'totalPrice', render: (value) => `¥${value}` },
                    { title: '交货期', dataIndex: 'deliveryTime', key: 'deliveryTime' },
                    { title: '备注', dataIndex: 'remarks', key: 'remarks' },
                  ]}
                />
                {quotation.remarks && (
                  <div className="mt-2 text-sm">
                    <strong>供应商备注：</strong> {quotation.remarks}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
        </Modal>


      </div>
    );
  };
  
  export default QuotationComparison;