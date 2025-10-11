import React from 'react';
import { Outlet } from 'react-router-dom';
import { Layout } from '../../components/common';
import './StaffLayout.css';

const StaffLayout = () => (
  <Layout userRole="staff">
    <Outlet />
  </Layout>
);

export default StaffLayout;
