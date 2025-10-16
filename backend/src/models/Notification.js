import React, { useState, useEffect } from 'react';
import { List, Badge, Button, Tabs, Empty, Spin, message, Popconfirm } from 'antd';
import { BellOutlined, CheckOutlined, DeleteOutlined } from '@ant-design/icons';
import { apiClient } from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';

const { TabPane } = Tabs;

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const { getCurrentUser } = useAuth();
  const [currentUser, setCurrentUser] = useState(null);

  // Fetch user data and notifications
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
        
        // In production, uncomment the API call
        // const response = await apiClient.get(`/notifications/user/${user.id}`);
        // setNotifications(response.data);
        
        // Mock data for development
        setNotifications([
          {
            id: '1',
            title: 'Certificate Request Approved',
            message: 'Your request for Student Confirmation certificate has been approved.',
            createdAt: '2023-06-15T10:30:00Z',
            read: false,
            type: 'certificate'
          },
          {
            id: '2',
            title: 'New Announcement',
            message: 'Important: Registration for the next semester starts on July 1st.',
            createdAt: '2023-06-14T08:15:00Z',
            read: true,
            type: 'announcement'
          },
          {
            id: '3',
            title: 'Dormitory Application',
            message: 'Your dormitory application has been received and is under review.',
            createdAt: '2023-06-10T14:45:00Z',
            read: false,
            type: 'dormitory'
          },
          {
            id: '4',
            title: 'Tuition Payment Reminder',
            message: 'Please complete your tuition payment by June 30th to avoid late fees.',
            createdAt: '2023-06-05T09:20:00Z',
            read: true,
            type: 'payment'
          }
        ]);
      } catch (error) {
        message.error('Failed to fetch notifications');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Set up WebSocket connection for real-time notifications
    // This is just a placeholder - you would implement actual WebSocket logic
    const setupWebSocket = () => {
      // const ws = new WebSocket('ws://your-websocket-server/notifications');
      
      // ws.onmessage = (event) => {
      //   const newNotification = JSON.parse(event.data);
      //   setNotifications(prev => [newNotification, ...prev]);
      //   message.info(`New notification: ${newNotification.title}`);
      // };
      
      // ws.onerror = (error) => {
      //   console.error('WebSocket error:', error);
      // };
      
      // return () => {
      //   ws.close();
      // };
    };
    
    const cleanup = setupWebSocket();
    return cleanup;
  }, [getCurrentUser]);

  // Mark notification as read
  const markAsRead = async (id) => {
    try {
      // In production, uncomment the API call
      // await apiClient.put(`/notifications/${id}/read`);
      
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
    } catch (error) {
      message.error('Failed to mark notification as read');
      console.error(error);
    }
  };

  // Delete notification
  const deleteNotification = async (id) => {
    try {
      // In production, uncomment the API call
      // await apiClient.delete(`/notifications/${id}`);
      
      setNotifications(prev => prev.filter(notification => notification.id !== id));
      message.success('Notification deleted');
    } catch (error) {
      message.error('Failed to delete notification');
      console.error(error);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get unread count
  const getUnreadCount = () => {
    return notifications.filter(notification => !notification.read).length;
  };

  // Filter notifications by type
  const getNotificationsByType = (type) => {
    return type === 'all' 
      ? notifications 
      : notifications.filter(notification => notification.type === type);
  };

  // Render notification item
  const renderNotificationItem = (item) => (
    <List.Item
      actions={[
        !item.read && (
          <Button 
            icon={<CheckOutlined />} 
            size="small" 
            onClick={() => markAsRead(item.id)}
            title="Mark as read"
          />
        ),
        <Popconfirm
          title="Are you sure you want to delete this notification?"
          onConfirm={() => deleteNotification(item.id)}
          okText="Yes"
          cancelText="No"
        >
          <Button 
            icon={<DeleteOutlined />} 
            size="small" 
            danger
            title="Delete"
          />
        </Popconfirm>
      ]}
    >
      <List.Item.Meta
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {!item.read && <Badge status="processing" style={{ marginRight: 8 }} />}
            <span>{item.title}</span>
          </div>
        }
        description={
          <>
            <div>{item.message}</div>
            <div style={{ fontSize: '0.8em', color: '#888', marginTop: 5 }}>
              {formatDate(item.createdAt)}
            </div>
          </>
        }
      />
    </List.Item>
  );

  return (
    <div className="notifications-container">
      <div className="page-header">
        <h2>
          Notifications 
          {getUnreadCount() > 0 && (
            <Badge count={getUnreadCount()} style={{ marginLeft: 8 }} />
          )}
        </h2>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <Tabs defaultActiveKey="all">
          <TabPane 
            tab={
              <span>
                All
                {getUnreadCount() > 0 && (
                  <Badge count={getUnreadCount()} style={{ marginLeft: 8 }} />
                )}
              </span>
            } 
            key="all"
          >
            {notifications.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={getNotificationsByType('all')}
                renderItem={renderNotificationItem}
              />
            ) : (
              <Empty description="No notifications" />
            )}
          </TabPane>
          
          <TabPane 
            tab="Certificate" 
            key="certificate"
          >
            {getNotificationsByType('certificate').length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={getNotificationsByType('certificate')}
                renderItem={renderNotificationItem}
              />
            ) : (
              <Empty description="No certificate notifications" />
            )}
          </TabPane>
          
          <TabPane 
            tab="Announcements" 
            key="announcement"
          >
            {getNotificationsByType('announcement').length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={getNotificationsByType('announcement')}
                renderItem={renderNotificationItem}
              />
            ) : (
              <Empty description="No announcements" />
            )}
          </TabPane>
          
          <TabPane 
            tab="Others" 
            key="others"
          >
            {getNotificationsByType('others').length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={getNotificationsByType('others')}
                renderItem={renderNotificationItem}
              />
            ) : (
              <Empty description="No other notifications" />
            )}
          </TabPane>
        </Tabs>
      )}
    </div>
  );
};

export default Notification;