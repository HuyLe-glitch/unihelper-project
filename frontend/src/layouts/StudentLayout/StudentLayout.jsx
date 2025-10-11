import React from 'react';
import { Outlet } from 'react-router-dom';
import { Layout } from '../../components/common';
import './StudentLayout.css';

const StudentLayout = () => (
  <Layout userRole="student">
    <Outlet />
  </Layout>
);

export default StudentLayout;
