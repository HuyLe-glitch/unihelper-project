import React from 'react';
import { Layout } from '../../components/common';
import './StaffLayout.css';

const StaffLayout = ({ children }) => {
  return (
    <Layout userRole="staff">
      {children}
    </Layout>
  );
};

export default StaffLayout;