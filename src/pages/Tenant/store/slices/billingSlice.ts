import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { billingService, Invoice, Coupon, BillingAddress } from '../../../../services/billingService';

// Re-export types from service
export type { Invoice, Coupon, BillingAddress } from '../../../../services/billingService';

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
      const invoices = await billingService.getInvoices();

      // Apply client-side filtering if needed
      let filteredInvoices = invoices;
      if (params.status) {
        filteredInvoices = invoices.filter(invoice => invoice.status === params.status);
      }

      // Apply pagination if needed
      if (params.page && params.limit) {
        const startIndex = (params.page - 1) * params.limit;
        const endIndex = startIndex + params.limit;
        filteredInvoices = filteredInvoices.slice(startIndex, endIndex);
      }

      return filteredInvoices;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch invoices');
    }
  }
);

export const fetchInvoiceById = createAsyncThunk(
  'billing/fetchInvoiceById',
  async (invoiceId: string, { rejectWithValue }) => {
    try {
      const invoice = await billingService.getInvoice(invoiceId);
      return invoice;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch invoice');
    }
  }
);

export const downloadInvoicePDF = createAsyncThunk(
  'billing/downloadInvoicePDF',
  async (invoiceId: string, { rejectWithValue }) => {
    try {
      const invoice = await billingService.getInvoice(invoiceId);

      // Handle PDF download
      if (invoice.pdf_url) {
        window.open(invoice.pdf_url, '_blank');
      } else {
        throw new Error('PDF URL not available for this invoice');
      }

      return invoice;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to download invoice PDF');
    }
  }
);

export const validateCoupon = createAsyncThunk(
  'billing/validateCoupon',
  async (couponCode: string, { rejectWithValue }) => {
    try {
      const coupon = await billingService.validateCoupon(couponCode);
      return coupon;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to validate coupon');
    }
  }
);

export const updateBillingAddress = createAsyncThunk(
  'billing/updateBillingAddress',
  async (billingAddress: BillingAddress, { rejectWithValue }) => {
    try {
      const updatedAddress = await billingService.updateBillingAddress(billingAddress);
      return updatedAddress;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update billing address');
    }
  }
);

export const fetchBillingAddress = createAsyncThunk(
  'billing/fetchBillingAddress',
  async (_, { rejectWithValue }) => {
    try {
      const billingAddress = await billingService.getBillingAddress();
      return billingAddress;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch billing address');
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