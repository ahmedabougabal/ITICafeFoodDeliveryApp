import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import orderService from '../services/orderService';

// Fetch active orders
export const fetchActiveOrders = createAsyncThunk(
  'orders/fetchActive',
  async (_, { rejectWithValue }) => {
    try {
      const response = await orderService.getActiveOrders();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

// Create a new order
export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await orderService.createOrder(orderData);
      console.log('API Response for creating order:', response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Accept an order
export const acceptOrder = createAsyncThunk(
  'orders/acceptOrder',
  async ({ id, preparationTime }, { rejectWithValue }) => {
    try {
      const response = await orderService.acceptOrder(id, preparationTime);
      console.log('API Response for accepting order:', response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Reject an order
export const rejectOrder = createAsyncThunk(
  'orders/rejectOrder',
  async (id, { rejectWithValue }) => {
    try {
      const response = await orderService.rejectOrder(id);
      console.log('API Response for rejecting order:', response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch pending orders
export const fetchPendingOrders = createAsyncThunk(
  'orders/fetchPending',
  async (_, { rejectWithValue }) => {
    try {
      const response = await orderService.getPendingOrders();
      console.log('API Response for pending orders:', response);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Complete an order
export const completeOrder = createAsyncThunk(
  'orders/completeOrder',
  async (id, { rejectWithValue }) => {
    try {
      const response = await orderService.markAsCompleted(id);
      console.log('API Response for completing order:', response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    allOrders: [],
    pendingOrders: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    clearPendingOrders: (state) => {
      state.pendingOrders = [];
      console.log('Cleared pending orders');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActiveOrders.pending, (state) => {
        state.status = 'loading';
        state.error = null;
        console.log('Fetching active orders...');
      })
      .addCase(fetchActiveOrders.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.allOrders = action.payload;
        state.error = null;
        console.log('Fetched active orders:', action.payload);
      })
      .addCase(fetchActiveOrders.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Unknown error occurred';
        console.error('Error fetching active orders:', action.payload);
      })
      .addCase(fetchPendingOrders.pending, (state) => {
        state.status = 'loading';
        state.error = null;
        console.log('Fetching pending orders...');
      })
      .addCase(fetchPendingOrders.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.pendingOrders = action.payload;
        state.error = null;
        console.log('Fetched pending orders:', action.payload);
      })
      .addCase(fetchPendingOrders.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Unknown error occurred';
        console.error('Error fetching pending orders:', action.payload);
      })
      .addCase(acceptOrder.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.pendingOrders = state.pendingOrders.filter(order => order.id !== action.payload.id);
        console.log('Order accepted:', action.payload);
      })
      .addCase(rejectOrder.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.pendingOrders = state.pendingOrders.filter(order => order.id !== action.payload.id);
        console.log('Order rejected:', action.payload);
      })
      .addCase(completeOrder.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.allOrders = state.allOrders.map(order =>
          order.id === action.payload.id ? { ...order, status: 'completed' } : order
        );
        console.log('Order completed:', action.payload);
      });
  },
});

export const { clearPendingOrders } = orderSlice.actions;
export default orderSlice.reducer;
