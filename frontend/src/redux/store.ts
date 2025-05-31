import { configureStore } from '@reduxjs/toolkit';
import memorapperReducer from './memorapperSlice';

export const store = configureStore({
  reducer: {
    memorapper: memorapperReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;