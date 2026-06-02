import axios from 'axios';
import authService from './authService.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
const ORDERS_URL = `${API_BASE_URL.replace(/\/$/, '')}/orders`;

// Create an axios instance
const api = axios.create({
  baseURL: ORDERS_URL,
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
  (config) => {
    const user = authService.getCurrentUser();
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();
    return Promise.reject(new Error(message));
  }
);

/**
 * Get logged in user orders
 */
const getMyOrders = async () => {
  const response = await api.get('/myorders');
  return response.data;
};

const getAllOrders = async () => {
  const response = await api.get('/');
  return response.data;
};

const updateOrderStatus = async (id, status) => {
  const response = await api.put(`/${id}/status`, { status });
  return response.data;
};

const orderService = {
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
};

export default orderService;
