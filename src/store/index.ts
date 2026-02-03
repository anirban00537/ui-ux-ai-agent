import { combineReducers, configureStore } from "@reduxjs/toolkit";
import userReducer from "@/store/slices/userSlice";
import subscriptionReducer from "@/store/slices/subscriptionSlice";
import designEditorReducer from "@/store/slices/designEditorSlice";

const rootReducer = combineReducers({
  user: userReducer,
  subscription: subscriptionReducer,
  designEditor: designEditorReducer,
});

const store = configureStore({
  reducer: rootReducer,
});

export { store };
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
