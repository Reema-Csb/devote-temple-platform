import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const DEFAULT_PAYMENT_SERVICE_URL = "http://127.0.0.1:3003";
const DEFAULT_API_GATEWAY_URL = "http://127.0.0.1:3005";

export interface CreateOrderRequest {
  amount: number;
  currency?: string;
  orderId: string;
  templeId?: string;
  offeringId?: string;
  userId?: string;
  devoteeName?: string;
  nakshatra?: string;
  gotra?: string;
  offeringType?: string;
  remarks?: string;
  offeringDate?: string;
}

export type CreateOrderResponse = {
  amount: number;
  currency: string;
  razorpayOrderId: string;
  orderId: string;
};

export type VerifyPaymentRequest = {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  orderId: string;
  amount: number;
  currency: string;
  templeId: string;
};

export type VerifyPaymentResponse = {
  success: boolean;
  transaction?: {
    paymentMethod?: string;
    [key: string]: unknown;
  };
};

export type PaymentTransaction = {
  userId: any;
  paymentStatus: string;
  id: string;
  templeId?: string;
  templeName?: string;
  offeringId?: string;
  remarks?: string;
  transactionId?: string;
  paymentMethod?: string;
  paymentDate?: string;
  createdOn?: string;
  amount: number;
  status: string;
};

export type TransactionOfferingMetadata = {
  id: string;
  userId: string;
  templeId: string;
  paymentTransactionId?: string;
  devoteeName: string;
  nakshatra?: string;
  gotra?: string;
  offeringType: string;
  offeringDate: string;
};

export type Payout = {
  id?: string;
  templeId: string;
  totalCollected: number;
  commissionAmount: number;
  platformCommissionAmount?: number;
  gstAmount?: number;
  gatewayChargeAmount?: number;
  payoutAmount: number;
  transactionCount: number;
  payoutMethod?: string;
  payoutStatus?: string;
  remarks?: string;
  paidOn?: string;
};

export type MarkPayoutPaidRequest = {
  templeId: string;
  remarks?: string;
};

// Handles create-order and verify-payment directly with payment service
export const paymentServiceApi = createApi({
  reducerPath: "paymentServiceApi",
  baseQuery: fetchBaseQuery({
    baseUrl:
      process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL ??
      DEFAULT_PAYMENT_SERVICE_URL,
    timeout: 10000,
  }),
  endpoints: (builder) => ({
    createOrder: builder.mutation<CreateOrderResponse, CreateOrderRequest>({
      query: (body) => ({
        url: "/payment-transactions/create-order",
        method: "POST",
        body,
      }),
    }),

    verifyPayment: builder.mutation<
      VerifyPaymentResponse,
      VerifyPaymentRequest
    >({
      query: (body) => ({
        url: "/payment-transactions/verify-payment",
        method: "POST",
        body,
      }),
    }),
  }),
});

// Handles transaction and payout list through API gateway
export const transactionApi = createApi({
  reducerPath: "transactionApi",
  baseQuery: fetchBaseQuery({
    baseUrl:
      process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL ??
      DEFAULT_PAYMENT_SERVICE_URL,
    timeout: 10000,
    prepareHeaders: (headers) => {
      const token =
        typeof window !== "undefined"
          ? sessionStorage.getItem("adminToken")
          : null;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getTransactions: builder.query<PaymentTransaction[], void>({
      query: () => "/payment-transactions",
    }),

    getTransactionOfferingMetadata: builder.query<
      TransactionOfferingMetadata[],
      void
    >({
      query: () => "/transaction-offering-metadata",
    }),

    getPayouts: builder.query<Payout[], void>({
      query: () => "/payouts",
    }),

    getPendingPayout: builder.query<Payout, string>({
      query: (templeId) => `/payouts/pending/${templeId}`,
    }),

    markPayoutPaid: builder.mutation<any, MarkPayoutPaidRequest>({
      query: (body) => ({
        url: "/payouts/mark-paid",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useCreateOrderMutation, useVerifyPaymentMutation } =
  paymentServiceApi;

export const {
  useGetTransactionsQuery,
  useGetTransactionOfferingMetadataQuery,
  useGetPayoutsQuery,
  useGetPendingPayoutQuery,
  useMarkPayoutPaidMutation,
} = transactionApi;
