import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
import giftCardService from '../services/giftCardService';

export const applyGiftCard = createAsyncThunk('cart/applyGiftCard', async ({ code, cartTotal }, { rejectWithValue }) => {
  try {
    const data = await giftCardService.applyGiftCard(code, cartTotal);
    return data.data;
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      'Invalid gift card';
    return rejectWithValue(message);
  }
});

export const checkout = createAsyncThunk('cart/checkout', async (_, { getState, rejectWithValue }) => {
  const { cart, auth } = getState();
  if (!auth.token) return rejectWithValue('Please login to checkout');

  try {
    const body = {
      items: cart.items,
      totalPrice: cart.totalBeforeDiscount || cart.totalPrice,
    };

    // Include gift card code if applied
    if (cart.appliedGiftCard) {
      body.giftCardCode = cart.appliedGiftCard.code;
    }

    const res = await fetch('/api/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.token}`,
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Checkout failed');
    return data;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

// Load cart from local storage
const storedCart = localStorage.getItem('cartItems');
const initialItems = storedCart ? JSON.parse(storedCart) : [];

const calculateTotals = (items, giftCardDiscount = 0) => {
  const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.05); // 5% tax
  const totalBeforeDiscount = Math.round(subtotal + tax);
  const discount = Math.round(Math.min(giftCardDiscount, totalBeforeDiscount));
  const totalPrice = Math.round(totalBeforeDiscount - discount);
  return { totalQuantity, subtotal, tax, totalPrice, totalBeforeDiscount };
};

const totals = calculateTotals(initialItems);

const initialState = {
  items: initialItems,
  ...totals,
  appliedGiftCard: null, // { code, balance, discount }
  loading: false,
  giftCardLoading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action) {
      const product = action.payload;
      const existingItem = state.items.find((item) => item.product === product._id);

      if (existingItem) {
        if (existingItem.quantity < product.stock) {
          existingItem.quantity += 1;
          toast.success(`Increased ${product.name} quantity`);
        } else {
          toast.error(`Cannot add more. Only ${product.stock} in stock.`);
        }
      } else {
        if (product.stock > 0) {
          state.items.push({
            product: product._id,
            name: product.name,
            price: product.price,
            image: product.image?.url || '',
            quantity: 1,
            stock: product.stock,
          });
          toast.success(`${product.name} added to cart!`);
        } else {
          toast.error('Product is out of stock');
        }
      }

      const discount = state.appliedGiftCard ? state.appliedGiftCard.discount : 0;
      Object.assign(state, calculateTotals(state.items, discount));
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },
    removeFromCart(state, action) {
      const productId = action.payload;
      state.items = state.items.filter((item) => item.product !== productId);
      const discount = state.appliedGiftCard ? state.appliedGiftCard.discount : 0;
      Object.assign(state, calculateTotals(state.items, discount));
      localStorage.setItem('cartItems', JSON.stringify(state.items));
      toast.success('Item removed from cart');
    },
    updateQuantity(state, action) {
      const { id, quantity } = action.payload;
      const item = state.items.find((i) => i.product === id);
      if (item) {
        if (quantity > 0 && quantity <= item.stock) {
          item.quantity = quantity;
        }
      }
      const discount = state.appliedGiftCard ? state.appliedGiftCard.discount : 0;
      Object.assign(state, calculateTotals(state.items, discount));
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },
    clearCart(state) {
      state.items = [];
      state.appliedGiftCard = null;
      Object.assign(state, calculateTotals(state.items));
      localStorage.removeItem('cartItems');
    },
    removeGiftCard(state) {
      state.appliedGiftCard = null;
      Object.assign(state, calculateTotals(state.items, 0));
      toast.success('Gift card removed');
    },
  },
  extraReducers: (builder) => {
    builder
      // Apply Gift Card
      .addCase(applyGiftCard.pending, (state) => {
        state.giftCardLoading = true;
      })
      .addCase(applyGiftCard.fulfilled, (state, action) => {
        state.giftCardLoading = false;
        const { code, balance, discount } = action.payload;
        state.appliedGiftCard = { code, balance, discount };
        Object.assign(state, calculateTotals(state.items, discount));
        toast.success(`Gift card ${code} applied! -₹${discount.toLocaleString('en-IN')}`);
      })
      .addCase(applyGiftCard.rejected, (state, action) => {
        state.giftCardLoading = false;
        state.appliedGiftCard = null;
        Object.assign(state, calculateTotals(state.items, 0));
        toast.error(action.payload);
      })
      // Checkout
      .addCase(checkout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkout.fulfilled, (state) => {
        state.loading = false;
        state.items = [];
        state.appliedGiftCard = null;
        Object.assign(state, calculateTotals(state.items));
        localStorage.removeItem('cartItems');
        toast.success('Order placed successfully!');
      })
      .addCase(checkout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, removeGiftCard } = cartSlice.actions;
export default cartSlice.reducer;
