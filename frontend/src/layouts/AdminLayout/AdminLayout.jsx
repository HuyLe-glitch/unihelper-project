import React from 'react';
import { Layout } from '../../components/common';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  return (
    <Layout userRole="admin">
      {children}
    </Layout>
  );
};

export default AdminLayout;