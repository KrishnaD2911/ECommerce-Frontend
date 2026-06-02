import axios from 'axios';
import authService from './authService.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
const PRODUCTS_URL = `${API_BASE_URL.replace(/\/$/, '')}/products`;

// Create an axios instance
const api = axios.create({
  baseURL: PRODUCTS_URL,
});

const toProductPayload = (productData) => {
  if (!productData?.imageFile) {
    return productData;
  }

  const formData = new FormData();
  Object.entries(productData).forEach(([key, value]) => {
    if (key === 'imageFile') return;
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });
  formData.append('image', productData.imageFile);
  return formData;
};

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

// Add a response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();

    // Optionally show a toast for every error, or handle them specifically
    // toast.error(message);
    
    return Promise.reject(new Error(message));
  }
);

/**
 * Get all products (with query params for search, filter, sort, pagination)
 */
const getProducts = async (query = '') => {
  const response = await api.get(`/?${query}`);
  return response.data;
};

/**
 * Get single product by ID
 */
const getProduct = async (id) => {
  const response = await api.get(`/${id}`);
  return response.data;
};

/**
 * Get product statistics
 */
const getProductStats = async () => {
  const response = await api.get('/stats');
  return response.data;
};

/**
 * Create new product
 */
const createProduct = async (productData) => {
  const response = await api.post('/', toProductPayload(productData));
  return response.data;
};

/**
 * Update product
 */
const updateProduct = async (id, productData) => {
  const response = await api.put(`/${id}`, toProductPayload(productData));
  return response.data;
};

/**
 * Soft delete product
 */
const deleteProduct = async (id) => {
  const response = await api.delete(`/${id}`);
  return response.data;
};

/**
 * Restore soft deleted product
 */
const restoreProduct = async (id) => {
  const response = await api.put(`/${id}/restore`);
  return response.data;
};

/**
 * Bulk delete products
 */
const bulkDeleteProducts = async (ids) => {
  const response = await api.post('/bulk-delete', { ids });
  return response.data;
};

/**
 * Bulk price update
 */
const bulkPriceUpdate = async (ids, percentage) => {
  const response = await api.post('/bulk-price-update', { ids, percentage });
  return response.data;
};

/**
 * Bulk status update
 */
const bulkStatusUpdate = async (ids, status) => {
  const response = await api.post('/bulk-status-update', { ids, status });
  return response.data;
};

/**
 * Bulk stock update
 */
const bulkStockUpdate = async (ids, stock) => {
  const response = await api.post('/bulk-stock-update', { ids, stock });
  return response.data;
};

const productService = {
  getProducts,
  getProduct,
  getProductStats,
  createProduct,
  updateProduct,
  deleteProduct,
  restoreProduct,
  bulkDeleteProducts,
  bulkPriceUpdate,
  bulkStatusUpdate,
  bulkStockUpdate,
};

export default productService;
