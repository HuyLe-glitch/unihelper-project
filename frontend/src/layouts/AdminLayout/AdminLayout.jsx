import React from 'react';
import { Outlet } from 'react-router-dom';
import { Layout } from '../../components/common';
import './AdminLayout.css';

const AdminLayout = () => (
  <Layout userRole="admin">
    <Outlet />
  </Layout>
);

export default AdminLayout;
