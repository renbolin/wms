import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Form, Input, Select, DatePicker, InputNumber, Row, Col, Descriptions, Tag, Upload, message, Space, Card, Statistic, Popconfirm } from 'antd';
import { PlusOutlined, EyeOutlined, UploadOutlined, PaperClipOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';
import dayjs from 'dayjs';
import { useProcurementOrder } from '@/contexts/ProcurementOrderContext';
import { useInquiry } from '@/contexts/InquiryContext';
import { useLocation } from 'react-router-dom';

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
          <Form.Item label="供应商" name="supplier">
            <Input placeholder="请输入供应商" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="采购员" name="buyer">
            <Input placeholder="请输入采购员" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="订单日期" name="orderDate">
            <DatePicker.RangePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="总金额" name="totalAmount">
            <InputNumber placeholder="请输入总金额" style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="状态" name="status">
            <Select placeholder="请选择状态" allowClear>
              <Option value="待发货">待发货</Option>
              <Option value="已发货">已发货</Option>
              <Option value="已完成">已完成</Option>
            </Select>
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
  const { orders, addOrder, updateOrder, deleteOrder: _deleteOrder } = useProcurementOrder();
  const { quotationRequests } = useInquiry();
  const location = useLocation();

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
  const [inventoryModalVisible, setInventoryModalVisible] = useState(false);
  const [inventoryDetailsModalVisible, setInventoryDetailsModalVisible] = useState(false);
  const [currentInventoryOrder, setCurrentInventoryOrder] = useState<any>(null);
  const [_inputQuantity, _setInputQuantity] = useState<number>(0);
  const [itemQuantities, setItemQuantities] = useState<{[key: string]: number}>({});
  const [inventoryForm] = Form.useForm();

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

  const handleConfirmDelivery = (order: any) => {
    Modal.confirm({
      title: '确认收货',
      content: `确认收到订单 ${order.orderNumber} 的货物吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        const updatedOrder = {
          ...order,
          status: 'completed' as const,
          statusText: '已完成',
          updatedAt: new Date().toISOString()
        };
        updateOrder(updatedOrder);
        message.success('已确认收货，订单已完成');
      },
    });
  };



  const handleInventory = (order: any) => {
    setCurrentInventoryOrder(order);
    inventoryForm.resetFields();
    setItemQuantities({});
    setInventoryModalVisible(true);
  };

  const handleInventoryDetails = (order: any) => {
    setCurrentInventoryOrder(order);
    setInventoryDetailsModalVisible(true);
  };

  const handleInventorySubmit = () => {
    inventoryForm.validateFields().then(values => {
      // 检查是否有物品设置了入库数量
      const hasQuantities = Object.values(itemQuantities).some(qty => qty > 0);
      if (!hasQuantities) {
        message.warning('请至少为一个物品设置入库数量');
        return;
      }

      // 计算每个物品的库存变化
      const itemUpdates = currentInventoryOrder?.items?.map((item: any) => {
        const inputQty = itemQuantities[item.id] || 0;
        const currentStock = item.currentStock || 0;
        const newStock = currentStock + inputQty;
        return {
          ...item,
          inputQuantity: inputQty,
          previousStock: currentStock,
          newStock: newStock
        };
      }).filter((item: any) => item.inputQuantity > 0) || [];

      // 显示入库前后数量对比
      Modal.info({
        title: '入库处理',
        width: 700,
        content: (
          <div>
            <div style={{ marginBottom: 16 }}>
              <h4>订单：{currentInventoryOrder?.orderNumber}</h4>
            </div>
            <div style={{ backgroundColor: '#f5f5f5', padding: 16, borderRadius: 6 }}>
              {itemUpdates.map((item: any, index: number) => (
                <div key={item.id} style={{ marginBottom: index < itemUpdates.length - 1 ? 16 : 0 }}>
                  <h5 style={{ marginBottom: 8 }}>{item.name} - {item.specification}</h5>
                  <Row gutter={16}>
                    <Col span={6}>
                      <Statistic 
                        title="入库前" 
                        value={item.previousStock} 
                        suffix={item.unit}
                        valueStyle={{ color: '#666' }}
                      />
                    </Col>
                    <Col span={6}>
                      <Statistic 
                        title="入库数量" 
                        value={item.inputQuantity} 
                        suffix={item.unit}
                        prefix="+"
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Col>
                    <Col span={6}>
                      <Statistic 
                        title="入库后" 
                        value={item.newStock} 
                        suffix={item.unit}
                        valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
                      />
                    </Col>
                    <Col span={6}>
                      <Statistic 
                        title="库存变化" 
                        value={`+${item.inputQuantity}`} 
                        suffix={item.unit}
                        valueStyle={{ color: '#fa8c16' }}
                      />
                    </Col>
                  </Row>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, padding: 12, backgroundColor: '#e6f7ff', borderRadius: 4 }}>
              <p style={{ margin: 0, color: '#1890ff' }}>
                ✓ 库存已成功更新，共处理 {itemUpdates.length} 个物品项目
              </p>
            </div>
          </div>
        ),
        onOk: () => {
          // 更新订单中每个物品的库存信息
          const updatedItems = currentInventoryOrder?.items?.map((item: any) => {
            const inputQty = itemQuantities[item.id] || 0;
            if (inputQty > 0) {
              return {
                ...item,
                currentStock: (item.currentStock || 0) + inputQty
              };
            }
            return item;
          }) || [];

          // 更新订单状态为已入库，并添加库存信息
          const updatedOrder = {
            ...currentInventoryOrder,
            status: 'inventoried',
            items: updatedItems,
            inventoryInfo: {
              ...values,
              inventoryDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
              operator: values.operator || '当前用户',
              itemUpdates: itemUpdates
            }
          };
          
          updateOrder(updatedOrder);
          setInventoryModalVisible(false);
          setItemQuantities({});
          
          // 显示成功消息
          message.success(`入库处理完成！共更新 ${itemUpdates.length} 个物品的库存`);
        }
      });
    }).catch(error => {
      console.error('表单验证失败:', error);
    });
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

        // 如果是从询价单生成订单
        if (isFromQuotation && selectedQuotationId) {
          const quotationRequest = quotationRequests.find(q => q.id === selectedQuotationId);
          if (quotationRequest) {
            const selectedQuotation = quotationRequest.quotations?.find((q: any) => q.status === 'selected');
            if (selectedQuotation) {
              orderData = {
                ...orderData,
                title: quotationRequest.title,
                supplier: selectedQuotation.supplierName,
                supplierContact: '联系人',
                supplierPhone: '联系电话',
                totalAmount: selectedQuotation.totalAmount,
                quotationRequestId: quotationRequest.id,
                quotationRequestNo: quotationRequest.requestNo,
                selectedQuotationId: selectedQuotation.id,
                items: selectedQuotation.items.map((item: any) => ({
                  id: item.itemId || item.id,
                  name: item.name || '未知物品',
                  specification: item.specification || '未知规格',
                  unit: item.unit || '个',
                  quantity: item.quantity || 1,
                  unitPrice: item.unitPrice,
                  totalPrice: item.totalPrice,
                  deliveryTime: item.deliveryTime,
                  remarks: item.remarks
                }))
              };
            }
          }
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
        const getActionButtons = (status: string) => {
          const baseButtons = [
            <Button key="details" type="link" icon={<EyeOutlined />} onClick={() => handleDetails(record)}>详情</Button>,
            <Button key="attachment" type="link" icon={<PaperClipOutlined />} onClick={() => handleAttachment(record)}>附件</Button>
          ];

          switch (status) {
            case 'shipped':
              return [
                ...baseButtons,
                <Button key="confirm-delivery" type="link" onClick={() => handleConfirmDelivery(record)}>确认收货</Button>
              ];
            case 'completed':
              return [
                ...baseButtons,
                <Button key="inventory" type="link" onClick={() => handleInventory(record)}>入库处理</Button>
              ];
            case 'inventoried':
              return [
                ...baseButtons,
                <Button key="inventory-details" type="link" onClick={() => handleInventoryDetails(record)}>入库详情</Button>
              ];
            default:
              return baseButtons;
          }
        };

        return <Space>{getActionButtons(record.status)}</Space>;
      },
    },
  ];

  const filteredOrders = orders.filter(order => {
    const { orderNumber, supplier, buyer, orderDate, totalAmount, status } = filters as any;
    if (orderNumber && !order.orderNumber.includes(orderNumber)) {
      return false;
    }
    if (supplier && !order.supplier.includes(supplier)) {
      return false;
    }
    if (buyer && !order.creator.includes(buyer)) {
      return false;
    }
    if (status && order.status !== status) {
      return false;
    }
    if (totalAmount && order.totalAmount !== totalAmount) {
      return false;
    }
    if (orderDate && (dayjs(order.orderDate).isBefore(orderDate[0]) || dayjs(order.orderDate).isAfter(orderDate[1]))) {
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
                  <Option value="completed">已完成</Option>
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

      {/* 入库处理对话框 */}
      <Modal
        title="入库处理"
        open={inventoryModalVisible}
        onOk={handleInventorySubmit}
        onCancel={() => setInventoryModalVisible(false)}
        width={600}
        okText="完成入库"
        cancelText="取消"
      >
        {currentInventoryOrder && (
          <div>
            <Descriptions title="订单信息" bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="订单编号">{currentInventoryOrder.orderNumber}</Descriptions.Item>
              <Descriptions.Item label="供应商">{currentInventoryOrder.supplier}</Descriptions.Item>
              <Descriptions.Item label="订单金额">¥{currentInventoryOrder.amount?.toLocaleString()}</Descriptions.Item>
            </Descriptions>
            
            {/* 物品库存信息展示 */}
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ marginBottom: 12, color: '#1890ff' }}>📦 物品库存信息</h4>
              {currentInventoryOrder.items?.map((item: any) => (
                <Card 
                  key={item.id} 
                  size="small" 
                  style={{ marginBottom: 12 }}
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
                        {item.name} ({item.specification})
                      </span>
                      <span style={{ fontSize: '12px', color: '#666' }}>
                        订单数量: {item.quantity} {item.unit}
                      </span>
                    </div>
                  }
                >
                  <Row gutter={16} align="middle">
                    <Col span={6}>
                      <Statistic 
                        title="当前库存" 
                        value={item.currentStock || 0} 
                        suffix={item.unit} 
                        valueStyle={{ color: '#666', fontSize: '18px', fontWeight: 'bold' }}
                      />
                    </Col>
                    <Col span={6}>
                      <div>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: 4 }}>入库数量</div>
                        <InputNumber
                          min={0}
                          max={item.quantity}
                          placeholder="0"
                          style={{ width: '100%' }}
                          value={itemQuantities[item.id] || 0}
                          onChange={(value) => {
                            setItemQuantities(prev => ({
                              ...prev,
                              [item.id]: value || 0
                            }));
                          }}
                        />
                      </div>
                    </Col>
                    <Col span={6}>
                      <Statistic 
                        title="入库后库存" 
                        value={(item.currentStock || 0) + (itemQuantities[item.id] || 0)} 
                        suffix={item.unit} 
                        valueStyle={{ color: '#52c41a', fontSize: '18px', fontWeight: 'bold' }}
                      />
                    </Col>
                    <Col span={6}>
                      <Statistic 
                        title="库存变化" 
                        value={itemQuantities[item.id] || 0} 
                        suffix={item.unit} 
                        prefix="+"
                        valueStyle={{ color: '#1890ff', fontSize: '18px', fontWeight: 'bold' }}
                      />
                    </Col>
                  </Row>
                </Card>
              ))}
            </div>

            <Form form={inventoryForm} layout="vertical">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="入库仓库"
                    name="warehouse"
                    rules={[{ required: true, message: '请选择入库仓库' }]}
                  >
                    <Select placeholder="请选择仓库">
                      <Option value="warehouse1">主仓库</Option>
                      <Option value="warehouse2">分仓库A</Option>
                      <Option value="warehouse3">分仓库B</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="入库人员"
                    name="operator"
                    rules={[{ required: true, message: '请输入入库人员' }]}
                  >
                    <Input placeholder="请输入入库人员姓名" />
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="质检状态"
                    name="qualityStatus"
                    rules={[{ required: true, message: '请选择质检状态' }]}
                  >
                    <Select placeholder="请选择质检状态">
                      <Option value="passed">质检合格</Option>
                      <Option value="failed">质检不合格</Option>
                      <Option value="pending">待质检</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item
                label="备注"
                name="remarks"
              >
                <Input.TextArea
                  rows={3}
                  placeholder="请输入入库备注信息"
                />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>

      {/* 入库详情对话框 */}
      <Modal
        title="入库详情"
        open={inventoryDetailsModalVisible}
        onCancel={() => setInventoryDetailsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setInventoryDetailsModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={700}
      >
        {currentInventoryOrder && currentInventoryOrder.inventoryInfo && (
          <div>
            <Descriptions title="订单信息" bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="订单编号">{currentInventoryOrder.orderNumber}</Descriptions.Item>
              <Descriptions.Item label="供应商">{currentInventoryOrder.supplier}</Descriptions.Item>
              <Descriptions.Item label="订单金额">¥{currentInventoryOrder.amount?.toLocaleString()}</Descriptions.Item>
            </Descriptions>
            
            <Descriptions title="入库信息" bordered size="small">
              <Descriptions.Item label="入库仓库">{currentInventoryOrder.inventoryInfo.warehouse}</Descriptions.Item>
              <Descriptions.Item label="入库数量">{currentInventoryOrder.inventoryInfo.quantity}</Descriptions.Item>
              <Descriptions.Item label="质检状态">
                <Tag color={
                  currentInventoryOrder.inventoryInfo.qualityStatus === 'passed' ? 'green' :
                  currentInventoryOrder.inventoryInfo.qualityStatus === 'failed' ? 'red' : 'orange'
                }>
                  {currentInventoryOrder.inventoryInfo.qualityStatus === 'passed' ? '质检合格' :
                   currentInventoryOrder.inventoryInfo.qualityStatus === 'failed' ? '质检不合格' : '待质检'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="入库人员">{currentInventoryOrder.inventoryInfo.operator}</Descriptions.Item>
              <Descriptions.Item label="入库时间">{currentInventoryOrder.inventoryInfo.inventoryDate}</Descriptions.Item>
              <Descriptions.Item label="备注" span={3}>
                {currentInventoryOrder.inventoryInfo.remarks || '无'}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
        {currentInventoryOrder && !currentInventoryOrder.inventoryInfo && (
          <div style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
            该订单尚未进行入库处理
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProcurementOrder;