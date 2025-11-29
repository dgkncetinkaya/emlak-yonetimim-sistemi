import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { billingService, PaymentMethod } from '../../../../services/billingService';

// Re-export types from service
export type { PaymentMethod } from '../../../../services/billingService';

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'succeeded' | 'canceled';
  client_secret: string;
  payment_method_id?: string;
  subscription_id?: string;
  invoice_id?: string;
  created_at: string;
}

export interface PaymentHistory {
  id: string;
  subscription_id: string;
  invoice_id?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'canceled' | 'refunded';
  payment_method_id: string;
  payment_method: PaymentMethod;
  provider_transaction_id?: string;
  failure_reason?: string;
  refund_amount?: number;
  refunded_at?: string;
  created_at: string;
  updated_at: string;
}

interface PaymentState {
  paymentMethods: PaymentMethod[];
  defaultPaymentMethod: PaymentMethod | null;
  paymentHistory: PaymentHistory[];
  currentPaymentIntent: PaymentIntent | null;
  loading: boolean;
  error: string | null;
  setupIntent: {
    client_secret: string | null;
    loading: boolean;
    error: string | null;
  };
}

const initialState: PaymentState = {
  paymentMethods: [],
  defaultPaymentMethod: null,
  paymentHistory: [],
  currentPaymentIntent: null,
  loading: false,
  error: null,
  setupIntent: {
    client_secret: null,
    loading: false,
    error: null,
  },
};

// Async Thunks
export const fetchPaymentMethods = createAsyncThunk(
  'payment/fetchPaymentMethods',
  async (_, { rejectWithValue }) => {
    try {
      const paymentMethods = await billingService.getPaymentMethods();
      return paymentMethods;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch payment methods');
    }
  }
);

export const createSetupIntent = createAsyncThunk(
  'payment/createSetupIntent',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/subscription/setup-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to create setup intent');
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const addPaymentMethod = createAsyncThunk(
  'payment/addPaymentMethod',
  async (paymentMethodData: {
    provider_payment_method_id: string;
    provider: 'stripe' | 'iyzico';
    is_default?: boolean;
  }, { rejectWithValue }) => {
    try {
      const paymentMethod = await billingService.addPaymentMethod(paymentMethodData);
      return paymentMethod;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to add payment method');
    }
  }
);

export const updatePaymentMethod = createAsyncThunk(
  'payment/updatePaymentMethod',
  async ({
    paymentMethodId,
    updates,
  }: {
    paymentMethodId: string;
    updates: { is_default?: boolean };
  }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/subscription/payment-methods/${paymentMethodId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        throw new Error('Failed to update payment method');
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const deletePaymentMethod = createAsyncThunk(
  'payment/deletePaymentMethod',
  async (paymentMethodId: string, { rejectWithValue }) => {
    try {
      await billingService.deletePaymentMethod(paymentMethodId);
      return paymentMethodId;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete payment method');
    }
  }
);

export const fetchPaymentHistory = createAsyncThunk(
  'payment/fetchPaymentHistory',
  async (params: { page?: number; limit?: number; status?: string } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.status) queryParams.append('status', params.status);

      const response = await fetch(`/api/subscription/payment-history?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch payment history');
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const createPaymentIntent = createAsyncThunk(
  'payment/createPaymentIntent',
  async (paymentData: {
    amount: number;
    currency: string;
    payment_method_id?: string;
    subscription_id?: string;
    invoice_id?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/subscription/payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(paymentData),
      });
      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const confirmPaymentIntent = createAsyncThunk(
  'payment/confirmPaymentIntent',
  async ({
    paymentIntentId,
    paymentMethodId,
  }: {
    paymentIntentId: string;
    paymentMethodId: string;
  }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/subscription/payment-intent/${paymentIntentId}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ payment_method_id: paymentMethodId }),
      });
      if (!response.ok) {
        throw new Error('Failed to confirm payment intent');
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// Slice
const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSetupIntent: (state) => {
      state.setupIntent = {
        client_secret: null,
        loading: false,
        error: null,
      };
    },
    setCurrentPaymentIntent: (state, action: PayloadAction<PaymentIntent | null>) => {
      state.currentPaymentIntent = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Payment Methods
      .addCase(fetchPaymentMethods.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentMethods.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentMethods = action.payload;
        state.defaultPaymentMethod = action.payload.find((pm: PaymentMethod) => pm.is_default) || null;
      })
      .addCase(fetchPaymentMethods.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Setup Intent
      .addCase(createSetupIntent.pending, (state) => {
        state.setupIntent.loading = true;
        state.setupIntent.error = null;
      })
      .addCase(createSetupIntent.fulfilled, (state, action) => {
        state.setupIntent.loading = false;
        state.setupIntent.client_secret = action.payload.client_secret;
      })
      .addCase(createSetupIntent.rejected, (state, action) => {
        state.setupIntent.loading = false;
        state.setupIntent.error = action.payload as string;
      })
      // Add Payment Method
      .addCase(addPaymentMethod.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addPaymentMethod.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentMethods.push(action.payload);
        if (action.payload.is_default) {
          state.defaultPaymentMethod = action.payload;
        }
      })
      .addCase(addPaymentMethod.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Payment Method
      .addCase(updatePaymentMethod.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePaymentMethod.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.paymentMethods.findIndex(pm => pm.id === action.payload.id);
        if (index !== -1) {
          state.paymentMethods[index] = action.payload;
          if (action.payload.is_default) {
            state.defaultPaymentMethod = action.payload;
          }
        }
      })
      .addCase(updatePaymentMethod.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete Payment Method
      .addCase(deletePaymentMethod.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePaymentMethod.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentMethods = state.paymentMethods.filter(pm => pm.id !== action.payload);
        if (state.defaultPaymentMethod?.id === action.payload) {
          state.defaultPaymentMethod = null;
        }
      })
      .addCase(deletePaymentMethod.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Payment History
      .addCase(fetchPaymentHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentHistory = action.payload;
      })
      .addCase(fetchPaymentHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Payment Intent
      .addCase(createPaymentIntent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPaymentIntent.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPaymentIntent = action.payload;
      })
      .addCase(createPaymentIntent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Confirm Payment Intent
      .addCase(confirmPaymentIntent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(confirmPaymentIntent.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPaymentIntent = action.payload;
      })
      .addCase(confirmPaymentIntent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearSetupIntent, setCurrentPaymentIntent } = paymentSlice.actions;
export default paymentSlice.reducer;