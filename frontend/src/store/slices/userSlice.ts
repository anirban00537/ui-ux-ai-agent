import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/store";

/**
 * User type with serializable fields.
 * Date fields are stored as ISO strings for Redux compatibility.
 */
export type User = {
  id: string;
  email: string;
  name?: string;
  user_name?: string;
  image?: string | null;
  emailVerified?: boolean;
  /** ISO date string */
  createdAt?: string;
  /** ISO date string */
  updatedAt?: string;
  /** Allow additional string-keyed properties with serializable values */
  [key: string]: string | boolean | number | null | undefined;
};

type UserState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};

const initialState: UserState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    clearUser(state) {
      state.user = null;
      state.isAuthenticated = false;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
  },
});

export const { setUser, clearUser, setLoading } = userSlice.actions;

export const selectUser = (state: RootState) => state.user.user;
export const selectIsAuthenticated = (state: RootState) =>
  state.user.isAuthenticated;
export const selectUserLoading = (state: RootState) => state.user.isLoading;

export default userSlice.reducer;
