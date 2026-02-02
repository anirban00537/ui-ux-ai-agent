import { combineReducers, configureStore } from "@reduxjs/toolkit";
import userReducer from "@/store/slices/userSlice";
import subscriptionReducer from "@/store/slices/subscriptionSlice";

const rootReducer = combineReducers({
  user: userReducer,
  subscription: subscriptionReducer,
});

const store = configureStore({
  reducer: rootReducer,
});
export { store };
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

