import React from 'react';
import { Navigate } from 'react-router-dom';
// Update these paths to wherever your components live
import { Login, LoginRoleSelector } from '../components/auth';

export const publicRoutes = [
  { path: '/', element: <LoginRoleSelector /> },        //root shows selector
  { path: '/choose-role', element: <LoginRoleSelector /> }, //alias
  { path: '/login', element: <Login /> },
];