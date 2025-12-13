import { apiClient } from './api';

export const departmentService = {
  // Get departments with optional staffType filter
  getDepartments: async (staffType) => {
    const params = staffType ? { staffType } : {};
    const response = await apiClient.get('/departments', { params });
    return response.data;
  },

  // Create new department
  createDepartment: async (departmentData) => {
    const response = await apiClient.post('/departments', departmentData);
    return response.data;
  },

  // Get department by ID
  getDepartmentById: async (id) => {
    const response = await apiClient.get(`/departments/${id}`);
    return response.data;
  },

  // Update department
  updateDepartment: async (id, updateData) => {
    const response = await apiClient.put(`/departments/${id}`, updateData);
    return response.data;
  },

  // Delete department
  deleteDepartment: async (id) => {
    const response = await apiClient.delete(`/departments/${id}`);
    return response.data;
  }
};
