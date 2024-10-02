import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios';

// Fetch all orders
export const fetchOrders = createAsyncThunk('orders/fetchOrders', async () => {
  const response = await axios.get('/api/orders/');
  return response.data;
});

// Update order status
export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({id, action}) => {
    const response = await axios.post(`/api/orders/${id}/${action}/`);
    return response.data;
  }
);

// Create a new order
export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData) => {
    const response = await axios.post('/api/create-order/', orderData);
    return response.data;
  }
);

// Accept an order
export const acceptOrder = createAsyncThunk(
  'orders/acceptOrder',
  async ({id, preparationTime}) => {
    const response = await axios.post(`/api/orders/${id}/accept/`, {preparation_time: preparationTime});
    return response.data;
  }
);

// Reject an order
export const rejectOrder = createAsyncThunk(
  'orders/rejectOrder',
  async (id) => {
    const response = await axios.post(`/api/orders/${id}/reject/`)
    return response.data
  })

// Fetch pending orders
export const fetchPendingOrders = createAsyncThunk(
  'orders/fetchPendingOrders',
  async () => {
    const response = await axios.get('/api/orders/pending/')
    return response.data;
  }
);

// Mark an order as completed
export const markOrderAsCompleted = createAsyncThunk(
  'orders/markOrderAsCompleted',
  async (id) => {
    const response = await axios.post(`/api/orders/${id}/complete/`);
    return response.data;
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    orders: [],
    pendingOrders: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.orders = action.payload;
      })
      .addCase(fetchPendingOrders.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Could not fetch pending orders';
        state.pendingOrders = []
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const index = state.orders.findIndex((order) => order.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.orders.push(action.payload);
      })
      .addCase(acceptOrder.fulfilled, (state, action) => {
        const index = state.orders.findIndex((order) => order.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      .addCase(rejectOrder.fulfilled, (state, action) => {
        const index = state.orders.findIndex((order) => order.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      .addCase(fetchPendingOrders.fulfilled, (state, action) => {
  state.pendingOrders = Array.isArray(action.payload) ? action.payload : [];
})
      .addCase(markOrderAsCompleted.fulfilled, (state, action) => {
        const index = state.orders.findIndex((order) => order.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        state.pendingOrders = state.pendingOrders.filter((order) => order.id !== action.payload.id);
      });
  },
});

export default orderSlice.reducer;
