/*
 * File Path: src/services/api.js
 * Module: API Client Service
 * Easy Explanation: Connects the React frontend to the Spring Boot backend REST API.
 * Base URL: http://localhost:8081/api
 * Features:
 *  - Automatically attaches secret JWT login tokens to HTTP headers.
 *  - Automatically handles 401 unauthorized errors if login expires.
 *  - Exposes helper functions for Authentication, Members, Trainers, Plans, Requests, and Razorpay Payments.
 */
import axios from 'axios';

// Base API URL configuration (defaults to local Spring Boot port 8081)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

// Create central Axios instance with JSON content type
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Request Interceptor
 * Easy Explanation: Runs BEFORE every outgoing HTTP request to attach the JWT login token from browser memory.
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hcms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor
 * Easy Explanation: Runs AFTER every incoming HTTP response to catch expired token errors (HTTP 401/403).
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem('hcms_token');
      localStorage.removeItem('hcms_user');
    }
    return Promise.reject(error);
  }
);

/**
 * Authentication API Service
 */
export const authApi = {
  login: (credentials) => apiClient.post('/auth/login', credentials).then((res) => res.data),
  register: (payload) => apiClient.post('/auth/register', payload).then((res) => res.data),
  resetPassword: (payload) => apiClient.post('/auth/reset-password', payload).then((res) => res.data)
};

/**
 * Member Management API Service
 */
export const membersApi = {
  getAll: () => apiClient.get('/members').then((res) => res.data),
  getOne: (id) => apiClient.get(`/members/${id}`).then((res) => res.data),
  create: (data) => apiClient.post('/members', data).then((res) => res.data),
  update: (id, data) => apiClient.put(`/members/${id}`, data).then((res) => res.data),
  delete: (id) => apiClient.delete(`/members/${id}`).then((res) => res.data),
  updateWorkoutPlan: (id, dayKey, dayPlan) => apiClient.put(`/members/${id}/workout-plan`, { memberName: '', dayKey, dayPlan }).then((res) => res.data),
  updateDietPlan: (id, dietPlan) => apiClient.put(`/members/${id}/diet-plan`, { memberName: '', dietPlan }).then((res) => res.data),
  purchasePlan: (id, planData) => apiClient.post(`/members/${id}/purchase-plan`, planData).then((res) => res.data)
};

/**
 * Trainer Management API Service
 */
export const trainersApi = {
  getAll: () => apiClient.get('/trainers').then((res) => res.data),
  getOne: (id) => apiClient.get(`/trainers/${id}`).then((res) => res.data),
  create: (data) => apiClient.post('/trainers', data).then((res) => res.data),
  update: (id, data) => apiClient.put(`/trainers/${id}`, data).then((res) => res.data),
  delete: (id) => apiClient.delete(`/trainers/${id}`).then((res) => res.data)
};

/**
 * Membership Plans API Service
 */
export const plansApi = {
  getAll: () => apiClient.get('/plans').then((res) => res.data),
  getOne: (id) => apiClient.get(`/plans/${id}`).then((res) => res.data),
  create: (data) => apiClient.post('/plans', data).then((res) => res.data),
  update: (id, data) => apiClient.put(`/plans/${id}`, data).then((res) => res.data),
  delete: (id) => apiClient.delete(`/plans/${id}`).then((res) => res.data)
};

/**
 * Trainer Request API Service
 */
export const trainerRequestsApi = {
  getAll: () => apiClient.get('/trainer-requests').then((res) => res.data),
  create: (data) => apiClient.post('/trainer-requests', data).then((res) => res.data),
  updateStatus: (id, status) => apiClient.put(`/trainer-requests/${id}/status`, { status }).then((res) => res.data)
};

/**
 * Razorpay Payments API Service
 * Handles Razorpay order creation, payment signature verification, and transaction histories.
 */
export const paymentsApi = {
  createOrder: (payload) => apiClient.post('/payments/create-order', payload).then((res) => res.data),
  verifyPayment: (payload) => apiClient.post('/payments/verify', payload).then((res) => res.data),
  getMemberPayments: (memberId) => apiClient.get(`/payments/member/${memberId}`).then((res) => res.data),
  getAdminPayments: () => apiClient.get('/payments/admin').then((res) => res.data)
};

/**
 * Executive Admin Dashboard Summary API Service
 */
export const dashboardApi = {
  getSummary: () => apiClient.get('/admin/dashboard').then((res) => res.data)
};

export default {
  auth: authApi,
  members: membersApi,
  trainers: trainersApi,
  plans: plansApi,
  trainerRequests: trainerRequestsApi,
  payments: paymentsApi,
  dashboard: dashboardApi
};
