import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { apiClient } from '../../../services/api';

const CertificateType = () => {
  const [certificateTypes, setCertificateTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);

  // Fetch certificate types
  const fetchCertificateTypes = async () => {
    setLoading(true);
    try {
      // In development, use mock data
      // In production, uncomment the API call
      // const response = await apiClient.get('/certificates/types');
      // setCertificateTypes(response.data);
      
      // Mock data for development
      setCertificateTypes([
        { id: '1', name: 'Student Confirmation', processingTime: '3 days', fee: 20000 },
        { id: '2', name: 'Transcript', processingTime: '5 days', fee: 50000 },
        { id: '3', name: 'Graduation Certificate', processingTime: '7 days', fee: 100000 },
      ]);
    } catch (error) {
      message.error('Failed to fetch certificate types');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificateTypes();
  }, []);

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      if (editingId) {
        // Update existing certificate type
        // await apiClient.put(`/certificates/types/${editingId}`, values);
        setCertificateTypes(prev => 
          prev.map(type => type.id === editingId ? { ...values, id: editingId } : type)
        );
        message.success('Certificate type updated successfully');
      } else {
        // Create new certificate type
        // const response = await apiClient.post('/certificates/types', values);
        const newType = { ...values, id: Date.now().toString() };
        setCertificateTypes(prev => [...prev, newType]);
        message.success('Certificate type created successfully');
      }
      setModalVisible(false);
      form.resetFields();
      setEditingId(null);
    } catch (error) {
      message.error('Operation failed');
      console.error(error);
    }
  };

  // Delete certificate type
  const handleDelete = async (id) => {
    try {
      // await apiClient.delete(`/certificates/types/${id}`);
      setCertificateTypes(prev => prev.filter(type => type.id !== id));
      message.success('Certificate type deleted successfully');
    } catch (error) {
      message.error('Delete failed');
      console.error(error);
    }
  };

  // Edit certificate type
  const handleEdit = (record) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  // Table columns
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Processing Time',
      dataIndex: 'processingTime',
      key: 'processingTime',
    },
    {
      title: 'Fee (VND)',
      dataIndex: 'fee',
      key: 'fee',
      render: (fee) => `${fee.toLocaleString()} VND`,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
            type="primary"
            size="small"
          />
          <Popconfirm
            title="Are you sure you want to delete this certificate type?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button 
              icon={<DeleteOutlined />} 
              danger 
              size="small"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="certificate-type-container">
      <div className="page-header">
        <h2>Certificate Types</h2>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => {
            setEditingId(null);
            form.resetFields();
            setModalVisible(true);
          }}
        >
          Add New Type
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={certificateTypes} 
        rowKey="id" 
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingId ? "Edit Certificate Type" : "Add Certificate Type"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Certificate Name"
            rules={[{ required: true, message: 'Please enter certificate name' }]}
          >
            <Input placeholder="e.g., Student Confirmation" />
          </Form.Item>

          <Form.Item
            name="processingTime"
            label="Processing Time"
            rules={[{ required: true, message: 'Please enter processing time' }]}
          >
            <Input placeholder="e.g., 3 days" />
          </Form.Item>

          <Form.Item
            name="fee"
            label="Fee (VND)"
            rules={[{ required: true, message: 'Please enter fee amount' }]}
          >
            <Input type="number" placeholder="e.g., 20000" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingId ? 'Update' : 'Create'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CertificateType;