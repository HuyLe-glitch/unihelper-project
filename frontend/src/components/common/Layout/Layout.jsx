import React from 'react';
import Sidebar from '../Sidebar';
import './Layout.css';

const Layout = ({ userRole = 'student', children }) => (
  <div className={`layout ${userRole}-layout`}>
    <Sidebar userRole={userRole} />
    <div className="main-content">{children}</div>
  </div>
);

export default Layout;
