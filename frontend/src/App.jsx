import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
//import { studentRoutes, staffRoutes, adminRoutes } from './routes';
import { publicRoutes, studentRoutes, staffRoutes, adminRoutes } from './routes';
import { Chatbot } from './components/common';

const renderRoutes = (routes) =>
  routes.map(({ path, element, children }) => (
    <Route key={path} path={path} element={element}>
      {children?.map((child, index) =>
        child.path ? (
          <Route key={`${child.path}-${index}`} path={child.path} element={child.element} />
        ) : (
          <Route key={`index-${index}`} index element={child.element} />
        ),
      )}
    </Route>
  ));

const App = () => (
  <div className="app">
    <Routes>
      {renderRoutes(publicRoutes)}
      {renderRoutes(studentRoutes)}
      {renderRoutes(staffRoutes)}
      {renderRoutes(adminRoutes)}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    
    {/* Chatbot - Hiển thị khi đã đăng nhập */}
    <Chatbot />
  </div>
);

export default App;
