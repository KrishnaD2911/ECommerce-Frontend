import axios from 'axios';
import authService from './authService.js';

const API_URL = '/api/v1/giftcards';

const api = axios.create({
  baseURL: API_URL,
});

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

// Create a new gift card
const createGiftCard = async (giftCardData) => {
  const response = await api.post('/', giftCardData);
  return response.data;
};

// Get all gift cards (Admin)
const getGiftCards = async (params = '') => {
  const response = await api.get(`/${params}`);
  return response.data;
};

// Get a single gift card
const getGiftCardById = async (id) => {
  const response = await api.get(`/${id}`);
  return response.data;
};

// Update a gift card
const updateGiftCard = async (id, giftCardData) => {
  const response = await api.put(`/${id}`, giftCardData);
  return response.data;
};

// Delete a gift card
const deleteGiftCard = async (id) => {
  const response = await api.delete(`/${id}`);
  return response.data;
};

// Bulk status update
const bulkStatusUpdate = async (ids, status) => {
  const response = await api.post('/bulk-status-update', { ids, status });
  return response.data;
};

// Apply gift card
const applyGiftCard = async (code, cartTotal) => {
  const response = await api.post('/apply', { code, cartTotal });
  return response.data;
};

// Purchase gift card (Customer)
const purchaseGiftCard = async (purchaseData) => {
  const response = await api.post('/purchase', purchaseData);
  return response.data;
};

// Get gift card stats (Admin)
const getGiftCardStats = async () => {
  const response = await api.get('/stats');
  return response.data;
};

// Get my gift cards (Customer)
const getMyGiftCards = async () => {
  const response = await api.get('/my');
  return response.data;
};

const giftCardService = {
  createGiftCard,
  getGiftCards,
  getGiftCardById,
  updateGiftCard,
  deleteGiftCard,
  bulkStatusUpdate,
  applyGiftCard,
  purchaseGiftCard,
  getGiftCardStats,
  getMyGiftCards,
};

export default giftCardService;
