import { apiClient } from './api';

export const reportsService = {
  getRecentActivities: () => api.get('/reports/activities'),
  getRequestsByMonth: () => api.get('/reports/requests-by-month'),
  getUsersByRole: () => api.get('/reports/users-by-role')
};