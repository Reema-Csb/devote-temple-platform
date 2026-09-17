import { configureStore } from "@reduxjs/toolkit";
import { templeApi } from "./api/templeApi";
import { paymentServiceApi, transactionApi } from "./api/paymentApi";
import { eventFestivalApi } from "./api/eventFestivalApi";

export const store = configureStore({
  reducer: {
    [templeApi.reducerPath]: templeApi.reducer,
    [paymentServiceApi.reducerPath]: paymentServiceApi.reducer,
    [transactionApi.reducerPath]: transactionApi.reducer,
    [eventFestivalApi.reducerPath]: eventFestivalApi.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      templeApi.middleware,
      paymentServiceApi.middleware,
      transactionApi.middleware,
      eventFestivalApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
