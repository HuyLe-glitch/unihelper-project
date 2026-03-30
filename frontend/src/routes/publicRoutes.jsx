import React from 'react';
import { Navigate } from 'react-router-dom';
// Update these paths to wherever your components live
import { Login } from '../components/auth';

export const publicRoutes = [
  { path: '/', element: <Login /> },        // root goes directly to login
  { path: '/login', element: <Login /> },
];