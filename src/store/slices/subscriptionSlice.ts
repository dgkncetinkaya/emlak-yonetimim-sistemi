import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface Plan {
  id: string;
  name: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  max_properties: number;
  max_agents: number;
  storage_gb: number;
  esignature_count: number;
  sms_count: number;
  is_popular?: boolean;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  plan: Plan;
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'paused';
  seats: number;
  addons: Record<string, any>;
  start_date: string;
  end_date?: string;
  next_billing_date: string;
  billing_cycle: 'monthly' | 'yearly';
  trial_end?: string;
  cancel_at_period_end: boolean;
}

export interface UsageTracking {
  subscription_id: string;
  feature_name: string;
  current_usage: number;
  limit_value: number;
  period_start: string;
  period_end: string;
}

interface SubscriptionState {
  plans: Plan[];
  currentSubscription: Subscription | null;
  usage: UsageTracking[];
  dunningEvents: any[];
  loading: boolean;
  error: string | null;
}

const initialState: SubscriptionState = {
  plans: [],
  currentSubscription: null,
  usage: [],
  dunningEvents: [],
  loading: false,
  error: null,
};

// Async Thunks
export const fetchPlans = createAsyncThunk(
  'subscription/fetchPlans',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/subscription/plans');
      if (!response.ok) {
        throw new Error('Failed to fetch plans');
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);



export const pauseSubscription = createAsyncThunk(
  'subscription/pauseSubscription',
  async ({ pauseDurationDays, reason }: { pauseDurationDays?: number; reason?: string }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/subscription/subscription/pause', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ pause_duration_days: pauseDurationDays, reason })
      });
      if (!response.ok) {
        throw new Error('Failed to pause subscription');
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const resumeSubscription = createAsyncThunk(
  'subscription/resumeSubscription',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/subscription/subscription/resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to resume subscription');
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const fetchDunningEvents = createAsyncThunk(
  'subscription/fetchDunningEvents',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/subscription/dunning/events', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch dunning events');
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const retryFailedPayment = createAsyncThunk(
  'subscription/retryFailedPayment',
  async (eventId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/subscription/dunning/retry/${eventId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to retry payment');
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const fetchCurrentSubscription = createAsyncThunk(
  'subscription/fetchCurrentSubscription',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/subscription', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch subscription');
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const createSubscription = createAsyncThunk(
  'subscription/createSubscription',
  async (subscriptionData: {
    plan_id: string;
    billing_cycle: 'monthly' | 'yearly';
    seats?: number;
    payment_method_id: string;
    coupon_code?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/subscription/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(subscriptionData),
      });
      if (!response.ok) {
        throw new Error('Failed to create subscription');
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const updateSubscription = createAsyncThunk(
  'subscription/updateSubscription',
  async (updateData: {
    plan_id?: string;
    seats?: number;
    billing_cycle?: 'monthly' | 'yearly';
  }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/subscription/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(updateData),
      });
      if (!response.ok) {
        throw new Error('Failed to update subscription');
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const cancelSubscription = createAsyncThunk(
  'subscription/cancelSubscription',
  async (cancelData: {
    cancel_at_period_end: boolean;
    cancellation_reason?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(cancelData),
      });
      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const fetchUsageTracking = createAsyncThunk(
  'subscription/fetchUsageTracking',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/usage', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch usage tracking');
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// Slice
const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Plans
      .addCase(fetchPlans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlans.fulfilled, (state, action) => {
        state.loading = false;
        state.plans = action.payload;
      })
      .addCase(fetchPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Current Subscription
      .addCase(fetchCurrentSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSubscription = action.payload;
      })
      .addCase(fetchCurrentSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Subscription
      .addCase(createSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSubscription = action.payload;
      })
      .addCase(createSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Subscription
      .addCase(updateSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSubscription = action.payload;
      })
      .addCase(updateSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Cancel Subscription
      .addCase(cancelSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSubscription = action.payload;
      })
      .addCase(cancelSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Usage Tracking
      .addCase(fetchUsageTracking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsageTracking.fulfilled, (state, action) => {
        state.loading = false;
        state.usage = action.payload;
      })
      .addCase(fetchUsageTracking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
       // Pause Subscription
       .addCase(pauseSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(pauseSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSubscription = action.payload;
      })
      .addCase(pauseSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Resume Subscription
      .addCase(resumeSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resumeSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSubscription = action.payload;
      })
      .addCase(resumeSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Dunning Events
      .addCase(fetchDunningEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDunningEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.dunningEvents = action.payload;
      })
      .addCase(fetchDunningEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Retry Failed Payment
      .addCase(retryFailedPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(retryFailedPayment.fulfilled, (state) => {
        state.loading = false;
        // Update dunning events after successful retry
      })
      .addCase(retryFailedPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setLoading } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;