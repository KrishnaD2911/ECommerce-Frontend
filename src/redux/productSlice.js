import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import productService from '../services/productService.js';
import toast from 'react-hot-toast';

// Initial state
const initialState = {
  products: [],
  product: null,
  stats: null,
  loading: false,
  error: null,
  totalProducts: 0,
  page: 1,
  pages: 1,
  filters: {
    search: '',
    status: '',
    category: '',
    sort: '-createdAt',
    dateFrom: '',
    dateTo: '',
    deleted: '',
  },
};

// Async Thunks

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { filters, page } = getState().products;
      
      // Build query string
      const queryParams = new URLSearchParams();
      queryParams.append('page', page);
      queryParams.append('limit', 12);
      
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.sort) queryParams.append('sort', filters.sort);
      if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);
      if (filters.deleted) queryParams.append('deleted', filters.deleted);

      const data = await productService.getProducts(queryParams.toString());
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchProduct = createAsyncThunk(
  'products/fetchProduct',
  async (id, { rejectWithValue }) => {
    try {
      const data = await productService.getProduct(id);
      return data.product;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchProductStats = createAsyncThunk(
  'products/fetchProductStats',
  async (_, { rejectWithValue }) => {
    try {
      const data = await productService.getProductStats();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addProduct = createAsyncThunk(
  'products/addProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const data = await productService.createProduct(productData);
      toast.success('Product created successfully');
      return data.product;
    } catch (error) {
      toast.error(error.message || 'Failed to create product');
      return rejectWithValue(error.message);
    }
  }
);

export const editProduct = createAsyncThunk(
  'products/editProduct',
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      const data = await productService.updateProduct(id, productData);
      toast.success('Product updated successfully');
      return data.product;
    } catch (error) {
      toast.error(error.message || 'Failed to update product');
      return rejectWithValue(error.message);
    }
  }
);

export const removeProduct = createAsyncThunk(
  'products/removeProduct',
  async (id, { rejectWithValue }) => {
    try {
      await productService.deleteProduct(id);
      toast.success('Product soft deleted');
      return id;
    } catch (error) {
      toast.error(error.message || 'Failed to delete product');
      return rejectWithValue(error.message);
    }
  }
);

export const restoreProduct = createAsyncThunk(
  'products/restoreProduct',
  async (id, { rejectWithValue }) => {
    try {
      const data = await productService.restoreProduct(id);
      toast.success('Product restored');
      return data.product;
    } catch (error) {
      toast.error(error.message || 'Failed to restore product');
      return rejectWithValue(error.message);
    }
  }
);

export const bulkRemoveProducts = createAsyncThunk(
  'products/bulkRemoveProducts',
  async (ids, { rejectWithValue }) => {
    try {
      await productService.bulkDeleteProducts(ids);
      toast.success(`${ids.length} products deleted`);
      return ids;
    } catch (error) {
      toast.error(error.message || 'Failed to bulk delete');
      return rejectWithValue(error.message);
    }
  }
);

export const bulkPriceUpdate = createAsyncThunk(
  'products/bulkPriceUpdate',
  async ({ ids, percentage }, { rejectWithValue }) => {
    try {
      await productService.bulkPriceUpdate(ids, percentage);
      toast.success(`Prices updated for ${ids.length} products`);
      return { ids, percentage };
    } catch (error) {
      toast.error(error.message || 'Failed to update prices');
      return rejectWithValue(error.message);
    }
  }
);

export const bulkStatusUpdate = createAsyncThunk(
  'products/bulkStatusUpdate',
  async ({ ids, status }, { rejectWithValue }) => {
    try {
      await productService.bulkStatusUpdate(ids, status);
      toast.success(`Status updated for ${ids.length} products`);
      return { ids, status };
    } catch (error) {
      toast.error(error.message || 'Failed to update status');
      return rejectWithValue(error.message);
    }
  }
);

export const bulkStockUpdate = createAsyncThunk(
  'products/bulkStockUpdate',
  async ({ ids, stock }, { rejectWithValue }) => {
    try {
      await productService.bulkStockUpdate(ids, stock);
      toast.success(`Stock updated for ${ids.length} products`);
      return { ids, stock };
    } catch (error) {
      toast.error(error.message || 'Failed to update stock');
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.page = 1; // Reset to page 1 on filter change
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.page = 1;
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearProduct: (state) => {
      state.product = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchProducts
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.totalProducts = action.payload.totalProducts;
        state.pages = action.payload.pages;
        state.page = action.payload.page;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // fetchProduct
      .addCase(fetchProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
      })
      .addCase(fetchProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchProductStats
      .addCase(fetchProductStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchProductStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // addProduct
      .addCase(addProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(addProduct.fulfilled, (state) => {
        state.loading = false;
        // Don't modify products array directly; it will be re-fetched by the component
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // editProduct
      .addCase(editProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(editProduct.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(editProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // removeProduct
      .addCase(removeProduct.fulfilled, (state, action) => {
        // Just remove from current view if it's there
        state.products = state.products.filter(p => p._id !== action.payload);
        state.totalProducts -= 1;
      })

      // restoreProduct
      .addCase(restoreProduct.fulfilled, (state, action) => {
        // If the view includes the restored item, we could add it, but usually a refetch is better
      })

      // bulkRemoveProducts
      .addCase(bulkRemoveProducts.fulfilled, (state, action) => {
        state.products = state.products.filter(p => !action.payload.includes(p._id));
        state.totalProducts -= action.payload.length;
      })

      // bulkPriceUpdate
      .addCase(bulkPriceUpdate.fulfilled, (state, action) => {
        // We'll let the component refetch
      })
      
      // bulkStatusUpdate
      .addCase(bulkStatusUpdate.fulfilled, (state, action) => {
         // We'll let the component refetch
      })
      
      // bulkStockUpdate
      .addCase(bulkStockUpdate.fulfilled, (state, action) => {
         // We'll let the component refetch
      });
  }
});

export const { setFilters, clearFilters, setPage, clearError, clearProduct } = productSlice.actions;
export default productSlice.reducer;
