import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
//import { studentRoutes, staffRoutes, adminRoutes } from './routes';
import { publicRoutes, studentRoutes, staffRoutes, adminRoutes } from './routes';

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
      {/* Remove this line: <Route path="/" element={<Navigate to="/choose-role" replace />} /> */}
      <Route path="/" element={<Navigate to="/choose-role" replace />} />
      {renderRoutes(publicRoutes)}
      {renderRoutes(studentRoutes)}
      {renderRoutes(staffRoutes)}
      {renderRoutes(adminRoutes)}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </div>
);

export default App;
