import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import { getSubscriptionStatus, getCreditBalance, type SubscriptionStatus, type CreditBalance } from "@/services/subscription";

export interface SubscriptionState {
  status: SubscriptionStatus | null;
  creditBalance: CreditBalance | null;
  isLoading: boolean;
  isError: boolean;
  lastUpdated: number | null;
}

const initialState: SubscriptionState = {
  status: null,
  creditBalance: null,
  isLoading: false,
  isError: false,
  lastUpdated: null,
};

// Async thunk to fetch subscription status
export const fetchSubscriptionInfo = createAsyncThunk(
  "subscription/fetchInfo",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getSubscriptionStatus();
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.message);
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch subscription info");
    }
  }
);

// Async thunk to fetch credit balance
export const fetchCreditBalance = createAsyncThunk(
  "subscription/fetchCredits",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCreditBalance();
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.message);
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch credit balance");
    }
  }
);

const subscriptionSlice = createSlice({
  name: "subscription",
  initialState,
  reducers: {
    setSubscriptionStatus(state, action: PayloadAction<SubscriptionStatus>) {
      state.status = action.payload;
      state.lastUpdated = Date.now();
    },
    setCreditBalance(state, action: PayloadAction<CreditBalance>) {
      state.creditBalance = action.payload;
      state.lastUpdated = Date.now();
    },
    clearSubscriptionInfo(state) {
      state.status = null;
      state.creditBalance = null;
      state.lastUpdated = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscriptionInfo.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(fetchSubscriptionInfo.fulfilled, (state, action) => {
        state.isLoading = false;
        state.status = action.payload;
        // If the status API also returns credit balance, update it
        if (action.payload.creditBalance) {
          state.creditBalance = action.payload.creditBalance;
        }
        state.lastUpdated = Date.now();
      })
      .addCase(fetchSubscriptionInfo.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
      })
      .addCase(fetchCreditBalance.fulfilled, (state, action) => {
        state.creditBalance = action.payload;
        state.lastUpdated = Date.now();
      });
  },
});

export const { setSubscriptionStatus, setCreditBalance, clearSubscriptionInfo } = subscriptionSlice.actions;

// Selectors
export const selectSubscriptionStatus = (state: RootState) => state.subscription.status;
export const selectSubscription = (state: RootState) => state.subscription.status?.subscription;
export const selectCreditBalance = (state: RootState) => state.subscription.creditBalance || state.subscription.status?.creditBalance;
export const selectIsSubscribed = (state: RootState) => state.subscription.status?.isActive || false;
export const selectSubscriptionLoading = (state: RootState) => state.subscription.isLoading;

export default subscriptionSlice.reducer;
