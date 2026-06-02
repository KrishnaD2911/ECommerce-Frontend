import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import giftCardService from '../services/giftCardService';

export const fetchGiftCards = createAsyncThunk(
  'giftCards/fetchAll',
  async (params, thunkAPI) => {
    try {
      return await giftCardService.getGiftCards(params);
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const createGiftCard = createAsyncThunk(
  'giftCards/create',
  async (giftCardData, thunkAPI) => {
    try {
      return await giftCardService.createGiftCard(giftCardData);
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const updateGiftCard = createAsyncThunk(
  'giftCards/update',
  async ({ id, giftCardData }, thunkAPI) => {
    try {
      return await giftCardService.updateGiftCard(id, giftCardData);
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const deleteGiftCard = createAsyncThunk(
  'giftCards/delete',
  async (id, thunkAPI) => {
    try {
      await giftCardService.deleteGiftCard(id);
      return id;
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const bulkStatusUpdate = createAsyncThunk(
  'giftCards/bulkStatusUpdate',
  async ({ ids, status }, thunkAPI) => {
    try {
      await giftCardService.bulkStatusUpdate(ids, status);
      return { ids, status };
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const purchaseGiftCard = createAsyncThunk(
  'giftCards/purchase',
  async (purchaseData, thunkAPI) => {
    try {
      return await giftCardService.purchaseGiftCard(purchaseData);
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchGiftCardStats = createAsyncThunk(
  'giftCards/fetchStats',
  async (_, thunkAPI) => {
    try {
      return await giftCardService.getGiftCardStats();
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchMyGiftCards = createAsyncThunk(
  'giftCards/fetchMy',
  async (_, thunkAPI) => {
    try {
      return await giftCardService.getMyGiftCards();
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const initialState = {
  giftCards: [],
  loading: false,
  purchaseLoading: false,
  error: null,
  totalGiftCards: 0,
  page: 1,
  pages: 1,
  filters: {
    search: '',
    status: '',
    sort: '',
  },
  activeTab: 'all', // 'all' | 'admin' | 'purchased'
  stats: null,
  statsLoading: false,
  myGiftCards: [],
  myGiftCardsLoading: false,
};

const giftCardSlice = createSlice({
  name: 'giftCard',
  initialState,
  reducers: {
    clearGiftCardError: (state) => {
      state.error = null;
    },
    setGiftCardFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.page = 1;
    },
    setGiftCardPage: (state, action) => {
      state.page = action.payload;
    },
    clearGiftCardFilters: (state) => {
      state.filters = { search: '', status: '', sort: '' };
      state.page = 1;
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
      state.page = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchGiftCards
      .addCase(fetchGiftCards.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchGiftCards.fulfilled, (state, action) => {
        state.loading = false;
        state.giftCards = action.payload.data;
        state.totalGiftCards = action.payload.filteredCount;
        state.pages = action.payload.totalPages;
        state.page = action.payload.currentPage;
      })
      .addCase(fetchGiftCards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // createGiftCard
      .addCase(createGiftCard.pending, (state) => {
        state.loading = true;
      })
      .addCase(createGiftCard.fulfilled, (state, action) => {
        state.loading = false;
        state.giftCards.unshift(action.payload.data);
        state.totalGiftCards += 1;
      })
      .addCase(createGiftCard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // updateGiftCard
      .addCase(updateGiftCard.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateGiftCard.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.giftCards.findIndex((g) => g._id === action.payload.data._id);
        if (index !== -1) {
          state.giftCards[index] = action.payload.data;
        }
      })
      .addCase(updateGiftCard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // deleteGiftCard
      .addCase(deleteGiftCard.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteGiftCard.fulfilled, (state, action) => {
        state.loading = false;
        state.giftCards = state.giftCards.filter((g) => g._id !== action.payload);
        state.totalGiftCards -= 1;
      })
      .addCase(deleteGiftCard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // bulkStatusUpdate
      .addCase(bulkStatusUpdate.pending, (state) => {
        state.loading = true;
      })
      .addCase(bulkStatusUpdate.fulfilled, (state, action) => {
        state.loading = false;
        const { ids, status } = action.payload;
        state.giftCards = state.giftCards.map((g) => {
          if (ids.includes(g._id)) {
            return { ...g, status };
          }
          return g;
        });
      })
      .addCase(bulkStatusUpdate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // purchaseGiftCard
      .addCase(purchaseGiftCard.pending, (state) => {
        state.purchaseLoading = true;
        state.error = null;
      })
      .addCase(purchaseGiftCard.fulfilled, (state) => {
        state.purchaseLoading = false;
      })
      .addCase(purchaseGiftCard.rejected, (state, action) => {
        state.purchaseLoading = false;
        state.error = action.payload;
      })
      // fetchGiftCardStats
      .addCase(fetchGiftCardStats.pending, (state) => {
        state.statsLoading = true;
      })
      .addCase(fetchGiftCardStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload.data;
      })
      .addCase(fetchGiftCardStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.error = action.payload;
      })
      // fetchMyGiftCards
      .addCase(fetchMyGiftCards.pending, (state) => {
        state.myGiftCardsLoading = true;
      })
      .addCase(fetchMyGiftCards.fulfilled, (state, action) => {
        state.myGiftCardsLoading = false;
        state.myGiftCards = action.payload.data;
      })
      .addCase(fetchMyGiftCards.rejected, (state, action) => {
        state.myGiftCardsLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearGiftCardError, setGiftCardFilters, setGiftCardPage, clearGiftCardFilters, setActiveTab } = giftCardSlice.actions;
export default giftCardSlice.reducer;
