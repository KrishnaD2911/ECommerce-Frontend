import { configureStore } from '@reduxjs/toolkit';
import productReducer from './productSlice';
import authReducer from './authSlice';
import cartReducer from './cartSlice';
import orderReducer from './orderSlice';
import giftCardReducer from './giftCardSlice';

const store = configureStore({
  reducer: {
    products: productReducer,
    auth: authReducer,
    cart: cartReducer,
    orders: orderReducer,
    giftCards: giftCardReducer,
  },
});

export default store;
