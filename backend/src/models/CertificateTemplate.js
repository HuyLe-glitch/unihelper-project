import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Form, Input, Select, Upload, message, List, Spin, Divider } from 'antd';
import { PlusOutlined, UploadOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import { apiClient } from '../../../services/api';

const { Option } = Select;
const { TextArea } = Input;

const CertificateTemplate = () => {
  const [templates, setTemplates] = useState([]);
  const [certificateTypes, setCertificateTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [form] = Form.useForm();

  // Fetch certificate templates and types
  const fetchData = async () => {
    setLoading(true);
    try {
      // In development, use mock data
      // In production, uncomment the API calls
      // const templatesResponse = await apiClient.get('/certificates/templates');
      // const typesResponse = await apiClient.get('/certificates/types');
      // setTemplates(templatesResponse.data);
      // setCertificateTypes(typesResponse.data);
      
      // Mock data for development
      setCertificateTypes([
        { id: '1', name: 'Student Confirmation' },
        { id: '2', name: 'Transcript' },
        { id: '3', name: 'Graduation Certificate' },
      ]);
      
      setTemplates([
        { 
          id: '1', 
          name: 'Standard Student Confirmation', 
          typeId: '1', 
          content: 'This is to certify that {{studentName}} (ID: {{studentId}}) is currently a student at {{university}} in the {{program}} program.',
          previewImage: 'https://via.placeholder.com/400x300?text=Certificate+Preview'
        },
        { 
          id: '2', 
          name: 'Official Transcript', 
          typeId: '2', 
          content: 'This transcript certifies that {{studentName}} (ID: {{studentId}}) has completed the following courses with the grades shown below: {{courseList}}',
          previewImage: 'https://via.placeholder.com/400x300?text=Transcript+Preview'
        },
      ]);
    } catch (error) {
      message.error('Failed to fetch data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      const formData = new FormData();
      Object.keys(values).forEach(key => {
        if (key === 'previewFile' && values.previewFile) {
          formData.append('previewFile', values.previewFile.file.originFileObj);
        } else {
          formData.append(key, values[key]);
        }
      });

      // In production, uncomment the API call
      // await apiClient.post('/certificates/templates', formData, {
      //   headers: { 'Content-Type': 'multipart/form-data' }
      // });
      
      // Mock response for development
      const newTemplate = {
        id: Date.now().toString(),
        name: values.name,
        typeId: values.typeId,
        content: values.content,
        previewImage: values.previewFile ? URL.createObjectURL(values.previewFile.file.originFileObj) : 'https://via.placeholder.com/400x300?text=New+Template'
      };
      
      setTemplates(prev => [...prev, newTemplate]);
      message.success('Template created successfully');
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to create template');
      console.error(error);
    }
  };

  // Delete template
  const handleDelete = async (id) => {
    try {
      // In production, uncomment the API call
      // await apiClient.delete(`/certificates/templates/${id}`);
      
      setTemplates(prev => prev.filter(template => template.id !== id));
      message.success('Template deleted successfully');
    } catch (error) {
      message.error('Failed to delete template');
      console.error(error);
    }
  };

  // Preview template
  const handlePreview = (template) => {
    setPreviewTemplate(template);
    setPreviewVisible(true);
  };

  // Get certificate type name by ID
  const getTypeName = (typeId) => {
    const type = certificateTypes.find(t => t.id === typeId);
    return type ? type.name : 'Unknown Type';
  };

  return (
    <div className="certificate-template-container">
      <div className="page-header">
        <h2>Certificate Templates</h2>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => setModalVisible(true)}
        >
          Create New Template
        </Button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 3, xxl: 4 }}
          dataSource={templates}
          renderItem={template => (
            <List.Item>
              <Card
                cover={<img alt={template.name} src={template.previewImage} style={{ height: 200, objectFit: 'cover' }} />}
                actions={[
                  <Button icon={<EyeOutlined />} onClick={() => handlePreview(template)}>Preview</Button>,
                  <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(template.id)}>Delete</Button>
                ]}
              >
                <Card.Meta
                  title={template.name}
                  description={getTypeName(template.typeId)}
                />
              </Card>
            </List.Item>
          )}
        />
      )}

      {/* Create Template Modal */}
      <Modal
        title="Create Certificate Template"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Template Name"
            rules={[{ required: true, message: 'Please enter template name' }]}
          >
            <Input placeholder="e.g., Standard Student Confirmation" />
          </Form.Item>

          <Form.Item
            name="typeId"
            label="Certificate Type"
            rules={[{ required: true, message: 'Please select certificate type' }]}
          >
            <Select placeholder="Select certificate type">
              {certificateTypes.map(type => (
                <Option key={type.id} value={type.id}>{type.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="content"
            label="Template Content"
            rules={[{ required: true, message: 'Please enter template content' }]}
            extra="Use {{variable}} syntax for dynamic content (e.g., {{studentName}}, {{studentId}})"
          >
            <TextArea rows={6} placeholder="Enter certificate content with placeholders..." />
          </Form.Item>

          <Form.Item
            name="previewFile"
            label="Template Preview Image"
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) return e;
              return e && e.fileList ? [e.fileList[e.fileList.length - 1]] : [];
            }}
          >
            <Upload
              beforeUpload={() => false}
              listType="picture"
              maxCount={1}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />}>Upload Preview Image</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Create Template
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Preview Modal */}
      <Modal
        title="Template Preview"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            Close
          </Button>
        ]}
        width={700}
      >
        {previewTemplate && (
          <>
            <h3>{previewTemplate.name}</h3>
            <p><strong>Type:</strong> {getTypeName(previewTemplate.typeId)}</p>
            <Divider />
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <img 
                src={previewTemplate.previewImage} 
                alt={previewTemplate.name} 
                style={{ maxWidth: '100%', maxHeight: 400 }} 
              />
            </div>
            <Divider />
            <h4>Template Content:</h4>
            <div style={{ 
              padding: 15, 
              border: '1px solid #d9d9d9', 
              borderRadius: 4,
              backgroundColor: '#f5f5f5'
            }}>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {previewTemplate.content}
              </pre>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default CertificateTemplate;