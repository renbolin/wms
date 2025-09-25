import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Form, Input, Select, DatePicker, InputNumber, Row, Col, Descriptions, Tag, Upload, message, Space, Card, Popconfirm } from 'antd';
import { PlusOutlined, EyeOutlined, UploadOutlined, PaperClipOutlined, FileTextOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';
import dayjs from 'dayjs';
import { useProcurementOrder } from '@/contexts/ProcurementOrderContext';
import { useInquiry } from '@/contexts/InquiryContext';
import { useLocation, useNavigate } from 'react-router-dom';

const { Option } = Select;

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
    <Form form={form} onFinish={onFinish} style={{ marginBottom: 16 }}>
      <Row gutter={24}>
        <Col span={8}>
          <Form.Item label="订单号" name="orderNumber">
            <Input placeholder="请输入订单号" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="订单标题" name="title">
            <Input placeholder="请输入订单标题" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="供应商" name="supplier">
            <Input placeholder="请输入供应商" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="供应商联系人" name="supplierContact">
            <Input placeholder="请输入供应商联系人" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="供应商电话" name="supplierPhone">
            <Input placeholder="请输入供应商电话" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="创建人" name="creator">
            <Input placeholder="请输入创建人" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="部门" name="department">
            <Input placeholder="请输入部门" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="收货人" name="recipient">
            <Input placeholder="请输入收货人" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="收货人电话" name="recipientPhone">
            <Input placeholder="请输入收货人电话" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="收货地址" name="deliveryAddress">
            <Input placeholder="请输入收货地址" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="询价单号" name="quotationRequestNo">
            <Input placeholder="请输入询价单号" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="状态" name="status">
            <Select placeholder="请选择状态" allowClear>
              <Option value="draft">草稿</Option>
              <Option value="confirmed">已确认</Option>
              <Option value="in_production">生产中</Option>
              <Option value="shipped">已发货</Option>
              <Option value="delivered">已送达</Option>
              <Option value="completed">已完成</Option>
              <Option value="cancelled">已取消</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="订单日期" name="orderDateRange">
            <DatePicker.RangePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="预期交货日期" name="expectedDeliveryDateRange">
            <DatePicker.RangePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="创建时间" name="createdAtRange">
            <DatePicker.RangePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="更新时间" name="updatedAtRange">
            <DatePicker.RangePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="总金额范围" name="totalAmountRange">
            <Input.Group compact>
              <InputNumber placeholder="最小金额" style={{ width: '50%' }} />
              <InputNumber placeholder="最大金额" style={{ width: '50%' }} />
            </Input.Group>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="备注" name="remarks">
            <Input placeholder="请输入备注关键词" />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col span={24} style={{ textAlign: 'right' }}>
          <Button type="primary" htmlType="submit">查询</Button>
          <Button style={{ marginLeft: 8 }} onClick={onReset}>重置</Button>
        </Col>
      </Row>
    </Form>
  );
};

const ProcurementOrder: React.FC = () => {
  const { orders, addOrder, updateOrder, deleteOrder, createOrderFromQuotation } = useProcurementOrder();
  const { quotationRequests } = useInquiry();
  const location = useLocation();
  const navigate = useNavigate();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [form] = Form.useForm();
  const [filters, setFilters] = useState({});
  const [isFromQuotation, setIsFromQuotation] = useState(false);
  const [selectedQuotationId, setSelectedQuotationId] = useState<string>('');
  const [attachmentModalVisible, setAttachmentModalVisible] = useState(false);
  const [currentAttachmentOrder, setCurrentAttachmentOrder] = useState<any>(null);

  const [_inputQuantity, _setInputQuantity] = useState<number>(0);

  const handleAdd = () => {
    setEditingOrder(null);
    setIsFromQuotation(false);
    setSelectedQuotationId('');
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleAddFromQuotation = () => {
    setEditingOrder(null);
    setIsFromQuotation(true);
    setSelectedQuotationId('');
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleCreateFromQuotation = (quotationRequestId: string, selectedQuotationId: string) => {
    form.validateFields().then((values) => {
      // 如果是从询价单生成，使用新的createOrderFromQuotation方法
      if (quotationRequestId && selectedQuotationId) {
        const quotationRequest = quotationRequests.find(q => q.id === quotationRequestId);
        if (quotationRequest) {
          const selectedQuotation = quotationRequest.quotations?.find((q: any) => q.status === 'selected');
          if (selectedQuotation) {
            createOrderFromQuotation({
              inquiryId: quotationRequest.id,
              quotationId: selectedQuotation.id,
              quotationRequestNo: quotationRequest.requestNo,
              selectedQuotation: selectedQuotation,
              quotationComparison: null // comparisonResult属性不存在，暂时设为null
            });
            message.success('从询价结果创建采购订单成功');
            setIsModalVisible(false);
            return;
          }
        }
      }

      // 普通添加订单
      const orderData = {
        ...values,
        id: Date.now().toString(),
        orderNumber: `PO${Date.now().toString().slice(-6)}`,
        orderDate: values.orderDate.format('YYYY-MM-DD'),
        expectedDeliveryDate: values.expectedDeliveryDate.format('YYYY-MM-DD'),
        status: 'draft',
        statusText: '草稿',
        creator: '系统用户',
        department: '采购部',
        contractFiles: [],
        attachmentFiles: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      addOrder(orderData);
      message.success('添加成功');
      setIsModalVisible(false);
    });
  };

  // 处理从询价台账页面跳转过来的情况
  useEffect(() => {
    const { fromQuotation, quotationRequestId, quotationRequestNo } = location.state || {};
    
    if (fromQuotation && quotationRequestId) {
      // 自动打开从询价单生成对话框
      setEditingOrder(null);
      setIsFromQuotation(true);
      setSelectedQuotationId(quotationRequestId);
      form.resetFields();
      
      // 设置表单的询价单选择值
      form.setFieldsValue({
        quotationRequestId: quotationRequestId
      });
      
      setIsModalVisible(true);
      message.success(`已自动选择询价单：${quotationRequestNo}`);
    }
  }, [location.state, form]);

  const handleDetails = (order: any) => {
    setSelectedOrder(order);
    setDetailsVisible(true);
  };

  const handleAttachment = (order: any) => {
    setCurrentAttachmentOrder(order);
    setAttachmentModalVisible(true);
  };











  const handleDeliveryNotes = (order: any) => {
    // 跳转到到货单管理页面，并携带采购订单号参数
    navigate(`/procurement/delivery-notes?orderNumber=${order.orderNumber}`);
  };

  const handleOk = () => {
    form.validateFields().then(values => {
      if (editingOrder) {
        const updatedOrder = {
          ...editingOrder,
          ...values,
          orderDate: values.orderDate.format('YYYY-MM-DD'),
          expectedDeliveryDate: values.expectedDeliveryDate.format('YYYY-MM-DD'),
        };
        updateOrder(updatedOrder);
        message.success('更新成功');
      } else {
        let orderData: any = {
          ...values,
          orderDate: values.orderDate.format('YYYY-MM-DD'),
          expectedDeliveryDate: values.expectedDeliveryDate.format('YYYY-MM-DD'),
          status: 'draft' as const,
          statusText: '草稿',
          creator: '当前用户',
          department: '采购部',
          items: [],
          contractFiles: [],
          attachmentFiles: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        // 如果是从询价单生成订单，使用新的createOrderFromQuotation方法
        if (isFromQuotation && selectedQuotationId) {
          handleCreateFromQuotation(selectedQuotationId, selectedQuotationId);
          return;
        }

        addOrder(orderData);
        message.success('添加成功');
      }
      setIsModalVisible(false);
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'draft': return <Tag color="default">草稿</Tag>;
      case 'confirmed': return <Tag color="processing">已确认</Tag>;
      case 'in_production': return <Tag color="orange">待发货</Tag>;
      case 'shipped': return <Tag color="blue">已发货</Tag>;
      case 'delivered': return <Tag color="cyan">已送达</Tag>;
      case 'completed': return <Tag color="success">已完成</Tag>;
      case 'inventoried': return <Tag color="purple">已入库</Tag>;
      case 'cancelled': return <Tag color="red">已取消</Tag>;
      default: return <Tag>未知</Tag>;
    }
  };

  const columns: TableProps<any>['columns'] = [
    { title: '序号', key: 'index', render: (_text, _record, index) => `${index + 1}` },
    { title: '采购单号', dataIndex: 'orderNumber', key: 'orderNumber' },
    { title: '询价单号', dataIndex: 'quotationRequestNo', key: 'quotationRequestNo', render: (text) => text || '-' },
    { title: '订单标题', dataIndex: 'title', key: 'title' },
    { title: '供应商', dataIndex: 'supplier', key: 'supplier' },
    { title: '下单日期', dataIndex: 'orderDate', key: 'orderDate' },
    { title: '预计交付', dataIndex: 'expectedDeliveryDate', key: 'expectedDeliveryDate' },
    { title: '订单金额', dataIndex: 'totalAmount', key: 'totalAmount', render: (amount) => `¥${amount?.toLocaleString() || 0}` },
    { title: '订单状态', dataIndex: 'status', key: 'status', render: (status) => getStatusTag(status) },
    { title: '创建人', dataIndex: 'creator', key: 'creator' },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 200,
      render: (_: any, record: any) => {
        const getActionButtons = () => {
          const buttons = [
            <Button key="details" type="link" icon={<EyeOutlined />} onClick={() => handleDetails(record)}>详情</Button>,
            <Button key="attachment" type="link" icon={<PaperClipOutlined />} onClick={() => handleAttachment(record)}>附件</Button>
          ];
          
          // 为PO2024005订单添加到货单按钮
          if (record.orderNumber === 'PO2024005') {
            buttons.push(
              <Button key="delivery" type="link" icon={<FileTextOutlined />} onClick={() => handleDeliveryNotes(record)}>到货单</Button>
            );
          }
          
          return buttons;
        };

        return <Space>{getActionButtons()}</Space>;
      },
    },
  ];

  const filteredOrders = orders.filter(order => {
    const { 
      orderNumber, 
      title, 
      supplier, 
      supplierContact, 
      supplierPhone, 
      creator, 
      department, 
      recipient, 
      recipientPhone, 
      deliveryAddress, 
      quotationRequestNo, 
      status, 
      orderDateRange, 
      expectedDeliveryDateRange, 
      createdAtRange, 
      updatedAtRange, 
      totalAmountRange, 
      remarks 
    } = filters as any;

    if (orderNumber && !order.orderNumber.includes(orderNumber)) {
      return false;
    }
    if (title && !order.title.includes(title)) {
      return false;
    }
    if (supplier && !order.supplier.includes(supplier)) {
      return false;
    }
    if (supplierContact && !order.supplierContact.includes(supplierContact)) {
      return false;
    }
    if (supplierPhone && !order.supplierPhone.includes(supplierPhone)) {
      return false;
    }
    if (creator && !order.creator.includes(creator)) {
      return false;
    }
    if (department && !order.department.includes(department)) {
      return false;
    }
    if (recipient && !order.recipient.includes(recipient)) {
      return false;
    }
    if (recipientPhone && !order.recipientPhone.includes(recipientPhone)) {
      return false;
    }
    if (deliveryAddress && !order.deliveryAddress.includes(deliveryAddress)) {
      return false;
    }
    if (quotationRequestNo && order.quotationRequestNo && !order.quotationRequestNo.includes(quotationRequestNo)) {
      return false;
    }
    if (status && order.status !== status) {
      return false;
    }
    if (orderDateRange && orderDateRange.length === 2) {
      const orderDate = dayjs(order.orderDate);
      if (orderDate.isBefore(orderDateRange[0]) || orderDate.isAfter(orderDateRange[1])) {
        return false;
      }
    }
    if (expectedDeliveryDateRange && expectedDeliveryDateRange.length === 2) {
      const expectedDeliveryDate = dayjs(order.expectedDeliveryDate);
      if (expectedDeliveryDate.isBefore(expectedDeliveryDateRange[0]) || expectedDeliveryDate.isAfter(expectedDeliveryDateRange[1])) {
        return false;
      }
    }
    if (createdAtRange && createdAtRange.length === 2) {
      const createdAt = dayjs(order.createdAt);
      if (createdAt.isBefore(createdAtRange[0]) || createdAt.isAfter(createdAtRange[1])) {
        return false;
      }
    }
    if (updatedAtRange && updatedAtRange.length === 2) {
      const updatedAt = dayjs(order.updatedAt);
      if (updatedAt.isBefore(updatedAtRange[0]) || updatedAt.isAfter(updatedAtRange[1])) {
        return false;
      }
    }
    if (totalAmountRange && totalAmountRange.length === 2) {
      const [minAmount, maxAmount] = totalAmountRange;
      if ((minAmount && order.totalAmount < minAmount) || (maxAmount && order.totalAmount > maxAmount)) {
        return false;
      }
    }
    if (remarks && order.remarks && !order.remarks.includes(remarks)) {
      return false;
    }
    return true;
  });

  return (
    <div>
      <FilterBar onFilter={setFilters} />
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增采购订单
          </Button>
          <Button type="default" onClick={handleAddFromQuotation}>
            从询价单生成
          </Button>
        </Space>
      </div>
      <Table columns={columns} dataSource={filteredOrders} rowKey="id" scroll={{ x: 1200 }} />
      <Modal
        title={editingOrder ? '编辑采购订单' : (isFromQuotation ? '从询价单生成采购订单' : '新增采购订单')}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={1000}
      >
        <Form form={form} layout="vertical">
          {isFromQuotation && (
            <Form.Item 
              label="选择询价单" 
              name="quotationRequestId" 
              rules={[{ required: true, message: '请选择询价单！' }]}
            >
              <Select 
                placeholder="请选择已完成的询价单"
                onChange={(value) => setSelectedQuotationId(value)}
              >
                {quotationRequests
                  .filter(q => q.status === 'completed' && q.quotations?.some(quote => quote.status === 'selected'))
                  .map(q => (
                    <Option key={q.id} value={q.id}>
                      {q.requestNo} - {q.title} - {q.department}
                    </Option>
                  ))
                }
              </Select>
            </Form.Item>
          )}
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="订单标题" name="title" rules={[{ required: true, message: '请输入订单标题！' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="供应商" name="supplier" rules={[{ required: true, message: '请输入供应商！' }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="联系人" name="supplierContact">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="联系电话" name="supplierPhone">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="订单金额" name="totalAmount" rules={[{ required: true, message: '请输入订单金额！' }]}>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="下单日期" name="orderDate" rules={[{ required: true, message: '请选择下单日期！' }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="预计交付日期" name="expectedDeliveryDate" rules={[{ required: true, message: '请选择预计交付日期！' }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="订单状态" name="status">
                <Select>
                  <Option value="draft">草稿</Option>
                  <Option value="confirmed">已确认</Option>
                  <Option value="in_production">生产中</Option>
                  <Option value="shipped">已发货</Option>
                  <Option value="delivered">已送达</Option>
                  <Option value="completed">已送达</Option>
                  <Option value="cancelled">已取消</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="部门" name="department">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="收货地址" name="deliveryAddress" rules={[{ required: true, message: '请输入收货地址！' }]}>
                <Input placeholder="请输入详细的收货地址" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="收货人" name="recipient" rules={[{ required: true, message: '请输入收货人！' }]}>
                <Input placeholder="请输入收货人姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="收货人电话" name="recipientPhone" rules={[{ required: true, message: '请输入收货人电话！' }]}>
                <Input placeholder="请输入收货人联系电话" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item label="合同文件" name="contractFiles">
            <Upload
              multiple
              beforeUpload={() => false}
              onChange={(info) => {
                // 处理文件上传
                console.log('合同文件:', info.fileList);
              }}
            >
              <Button icon={<UploadOutlined />}>上传合同</Button>
            </Upload>
          </Form.Item>
          
          <Form.Item label="附件" name="attachmentFiles">
            <Upload
              multiple
              beforeUpload={() => false}
              onChange={(info) => {
                // 处理文件上传
                console.log('附件:', info.fileList);
              }}
            >
              <Button icon={<UploadOutlined />}>上传附件</Button>
            </Upload>
          </Form.Item>
          
          <Form.Item label="备注" name="remarks">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="采购订单详情"
        visible={detailsVisible}
        onCancel={() => setDetailsVisible(false)}
        footer={[
          <Button key="back" onClick={() => setDetailsVisible(false)}>
            关闭
          </Button>,
        ]}
        width={1200}
      >
        {selectedOrder && (
          <div>
            <Card title="基本信息" style={{ marginBottom: 16 }}>
              <Descriptions bordered column={2}>
                <Descriptions.Item label="采购单号">{selectedOrder.orderNumber}</Descriptions.Item>
                <Descriptions.Item label="订单标题">{selectedOrder.title}</Descriptions.Item>
                <Descriptions.Item label="供应商">{selectedOrder.supplier}</Descriptions.Item>
                <Descriptions.Item label="联系人">{selectedOrder.supplierContact}</Descriptions.Item>
                <Descriptions.Item label="联系电话">{selectedOrder.supplierPhone}</Descriptions.Item>
                <Descriptions.Item label="部门">{selectedOrder.department}</Descriptions.Item>
                <Descriptions.Item label="下单日期">{selectedOrder.orderDate}</Descriptions.Item>
                <Descriptions.Item label="预计交付">{selectedOrder.expectedDeliveryDate}</Descriptions.Item>
                <Descriptions.Item label="订单金额">{`¥${selectedOrder.totalAmount?.toLocaleString() || 0}`}</Descriptions.Item>
                <Descriptions.Item label="订单状态">{getStatusTag(selectedOrder.status)}</Descriptions.Item>
                <Descriptions.Item label="创建人">{selectedOrder.creator}</Descriptions.Item>
                <Descriptions.Item label="创建时间">{selectedOrder.createdAt ? dayjs(selectedOrder.createdAt).format('YYYY-MM-DD HH:mm:ss') : '-'}</Descriptions.Item>
                {selectedOrder.quotationRequestNo && (
                  <Descriptions.Item label="关联询价单" span={2}>{selectedOrder.quotationRequestNo}</Descriptions.Item>
                )}
                {selectedOrder.remarks && (
                  <Descriptions.Item label="备注" span={2}>{selectedOrder.remarks}</Descriptions.Item>
                )}
              </Descriptions>
            </Card>

            <Card title="收货信息" style={{ marginBottom: 16 }}>
              <Descriptions bordered column={2}>
                <Descriptions.Item label="收货地址" span={2}>{selectedOrder.deliveryAddress || '-'}</Descriptions.Item>
                <Descriptions.Item label="收货人">{selectedOrder.recipient || '-'}</Descriptions.Item>
                <Descriptions.Item label="收货人电话">{selectedOrder.recipientPhone || '-'}</Descriptions.Item>
              </Descriptions>
            </Card>

            {selectedOrder.items && selectedOrder.items.length > 0 && (
              <Card title="订单项目" style={{ marginBottom: 16 }}>
                <Table
                  dataSource={selectedOrder.items}
                  rowKey="id"
                  pagination={false}
                  size="small"
                  columns={[
                    { title: '序号', key: 'index', render: (_, __, index) => index + 1, width: 60 },
                    { title: '项目名称', dataIndex: 'name', key: 'name' },
                    { title: '规格型号', dataIndex: 'specification', key: 'specification' },
                    { title: '单位', dataIndex: 'unit', key: 'unit', width: 80 },
                    { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 80 },
                    { title: '单价', dataIndex: 'unitPrice', key: 'unitPrice', width: 100, render: (price) => `¥${price?.toLocaleString() || 0}` },
                    { title: '总价', dataIndex: 'totalPrice', key: 'totalPrice', width: 120, render: (price) => `¥${price?.toLocaleString() || 0}` },
                    { title: '交付时间', dataIndex: 'deliveryTime', key: 'deliveryTime', width: 100 },
                    { title: '备注', dataIndex: 'remarks', key: 'remarks' }
                  ]}
                />
              </Card>
            )}

            {((selectedOrder.contractFiles && selectedOrder.contractFiles.length > 0) || 
              (selectedOrder.attachmentFiles && selectedOrder.attachmentFiles.length > 0)) && (
              <Card title="文件附件">
                {selectedOrder.contractFiles && selectedOrder.contractFiles.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <h4>合同文件：</h4>
                    {selectedOrder.contractFiles.map((file: any, index: any) => (
                      <div key={index} style={{ marginLeft: 16 }}>
                        <Button type="link">{file}</Button>
                      </div>
                    ))}
                  </div>
                )}
                {selectedOrder.attachmentFiles && selectedOrder.attachmentFiles.length > 0 && (
                  <div>
                    <h4>附件：</h4>
                    {selectedOrder.attachmentFiles.map((file: any, index: any) => (
                      <div key={index} style={{ marginLeft: 16 }}>
                        <Button type="link">{file}</Button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}
          </div>
        )}
      </Modal>

      {/* 附件管理模态框 */}
      <Modal
        title={`附件管理 - ${currentAttachmentOrder?.orderNumber || ''}`}
        open={attachmentModalVisible}
        onCancel={() => setAttachmentModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setAttachmentModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {currentAttachmentOrder && (
          <div>
            <Card title="当前附件" style={{ marginBottom: 16 }}>
              {currentAttachmentOrder.attachmentFiles && currentAttachmentOrder.attachmentFiles.length > 0 ? (
                <div>
                  {currentAttachmentOrder.attachmentFiles.map((file: any, index: any) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                      <span>{file}</span>
                      <Space>
                        <Button type="link" size="small">下载</Button>
                        <Popconfirm
                          title="确定要删除这个附件吗？"
                          onConfirm={() => {
                            // TODO: 实现删除附件功能
                            message.success('删除成功');
                          }}
                          okText="确定"
                          cancelText="取消"
                        >
                          <Button type="link" danger size="small">删除</Button>
                        </Popconfirm>
                      </Space>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                  暂无附件
                </div>
              )}
            </Card>

            <Card title="上传新附件">
              <Upload
                multiple
                beforeUpload={(file) => {
                  // TODO: 实现文件上传功能
                  message.success(`${file.name} 上传成功`);
                  return false; // 阻止自动上传
                }}
                showUploadList={false}
              >
                <Button icon={<UploadOutlined />}>选择文件</Button>
              </Upload>
              <div style={{ marginTop: 8, color: '#666', fontSize: '12px' }}>
                支持上传多个文件，单个文件大小不超过 10MB
              </div>
            </Card>
          </div>
        )}
      </Modal>




    </div>
  );
};

export default ProcurementOrder;