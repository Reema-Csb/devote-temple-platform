import { configureStore } from "@reduxjs/toolkit";

import { apiSlice } from "./api/apiSlice";
import { templeApi } from "@/store/api/templeApi";
import { paymentServiceApi, transactionApi } from "@/store/api/paymentApi";

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    [templeApi.reducerPath]: templeApi.reducer,
    [paymentServiceApi.reducerPath]: paymentServiceApi.reducer,
    [transactionApi.reducerPath]: transactionApi.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      apiSlice.middleware,
      templeApi.middleware,
      paymentServiceApi.middleware,
      transactionApi.middleware,
    ),
});

export type RootState = ReturnType<
  typeof store.getState
>;

export type AppDispatch = typeof store.dispatch;
