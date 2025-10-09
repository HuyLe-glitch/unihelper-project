import React from 'react';
import { Layout } from '../../components/common';
import './StudentLayout.css';

const StudentLayout = ({ children }) => {
  return (
    <Layout userRole="student">
      {children}
    </Layout>
  );
};

export default StudentLayout;