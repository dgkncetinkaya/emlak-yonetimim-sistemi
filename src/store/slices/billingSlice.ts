import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiFetch, ApiError } from '../../lib/api';

// Types
export interface Invoice {
  id: string;
  subscription_id: string;
  invoice_number: string;
  amount: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  due_date: string;
  paid_at?: string;
  pdf_url?: string;
  description?: string;
  line_items: InvoiceLineItem[];
  created_at: string;
  updated_at: string;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  period_start?: string;
  period_end?: string;
}

export interface Coupon {
  id: string;
  code: string;
  name: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  currency?: string;
  max_redemptions?: number;
  times_redeemed: number;
  valid_from: string;
  valid_until?: string;
  is_active: boolean;
  applies_to: 'all' | 'specific_plans';
  plan_ids?: string[];
}

export interface BillingAddress {
  company_name?: string;
  tax_id?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
}

interface BillingState {
  invoices: Invoice[];
  currentInvoice: Invoice | null;
  coupons: Coupon[];
  billingAddress: BillingAddress | null;
  loading: boolean;
  error: string | null;
  couponValidation: {
    isValid: boolean;
    coupon: Coupon | null;
    loading: boolean;
    error: string | null;
  };
}

const initialState: BillingState = {
  invoices: [],
  currentInvoice: null,
  coupons: [],
  billingAddress: null,
  loading: false,
  error: null,
  couponValidation: {
    isValid: false,
    coupon: null,
    loading: false,
    error: null,
  },
};

// Async Thunks
export const fetchInvoices = createAsyncThunk(
  'billing/fetchInvoices',
  async (params: { page?: number; limit?: number; status?: string } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.status) queryParams.append('status', params.status);

      const response = await apiFetch(`/api/subscription/invoices?${queryParams}`, {
        method: 'GET'
      }) as { success: boolean; data: Invoice[] };
      
      // Ensure we always return an array
      const invoices = response?.data ?? [];
      return Array.isArray(invoices) ? invoices : [];
    } catch (error) {
      if (error instanceof ApiError) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const fetchInvoiceById = createAsyncThunk(
  'billing/fetchInvoiceById',
  async (invoiceId: string, { rejectWithValue }) => {
    try {
      const response = await apiFetch(`/api/subscription/invoices/${invoiceId}`, {
        method: 'GET'
      }) as { success: boolean; data: Invoice };
      
      return response?.data || null;
    } catch (error) {
      if (error instanceof ApiError) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const downloadInvoicePDF = createAsyncThunk(
  'billing/downloadInvoicePDF',
  async (invoiceId: string, { rejectWithValue }) => {
    try {
      // For now, return a mock success since PDF endpoint doesn't exist yet
      console.warn('PDF download endpoint not implemented yet');
      return { success: true, message: 'PDF download will be available soon' };
    } catch (error) {
      if (error instanceof ApiError) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const validateCoupon = createAsyncThunk(
  'billing/validateCoupon',
  async (couponCode: string, { rejectWithValue }) => {
    try {
      const response = await apiFetch('/api/subscription/coupons/validate', {
        method: 'POST',
        body: JSON.stringify({ coupon_code: couponCode })
      });
      return response as Coupon;
    } catch (error) {
      if (error instanceof ApiError) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const updateBillingAddress = createAsyncThunk(
  'billing/updateBillingAddress',
  async (billingAddress: BillingAddress, { rejectWithValue }) => {
    try {
      const response = await apiFetch('/api/subscription/billing-address', {
        method: 'PUT',
        body: JSON.stringify(billingAddress)
      }) as { success: boolean; data: BillingAddress };
      
      return response?.data || null;
    } catch (error) {
      if (error instanceof ApiError) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const fetchBillingAddress = createAsyncThunk(
  'billing/fetchBillingAddress',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiFetch('/api/subscription/billing-address', {
        method: 'GET'
      }) as { success: boolean; data: BillingAddress };
      
      return response?.data || null;
    } catch (error) {
      if (error instanceof ApiError) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// Slice
const billingSlice = createSlice({
  name: 'billing',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCouponValidation: (state) => {
      state.couponValidation = {
        isValid: false,
        coupon: null,
        loading: false,
        error: null,
      };
    },
    setCurrentInvoice: (state, action: PayloadAction<Invoice | null>) => {
      state.currentInvoice = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Invoices
      .addCase(fetchInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = action.payload;
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Invoice by ID
      .addCase(fetchInvoiceById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoiceById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentInvoice = action.payload;
      })
      .addCase(fetchInvoiceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Download Invoice PDF
      .addCase(downloadInvoicePDF.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(downloadInvoicePDF.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(downloadInvoicePDF.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Validate Coupon
      .addCase(validateCoupon.pending, (state) => {
        state.couponValidation.loading = true;
        state.couponValidation.error = null;
      })
      .addCase(validateCoupon.fulfilled, (state, action) => {
        state.couponValidation.loading = false;
        state.couponValidation.isValid = true;
        state.couponValidation.coupon = action.payload;
      })
      .addCase(validateCoupon.rejected, (state, action) => {
        state.couponValidation.loading = false;
        state.couponValidation.isValid = false;
        state.couponValidation.coupon = null;
        state.couponValidation.error = action.payload as string;
      })
      // Update Billing Address
      .addCase(updateBillingAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBillingAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.billingAddress = action.payload;
      })
      .addCase(updateBillingAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Billing Address
      .addCase(fetchBillingAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBillingAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.billingAddress = action.payload;
      })
      .addCase(fetchBillingAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCouponValidation, setCurrentInvoice } = billingSlice.actions;
export default billingSlice.reducer;