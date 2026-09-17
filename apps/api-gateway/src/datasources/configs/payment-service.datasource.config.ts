export const PaymentServiceDataSourceConfig = {
  name: 'paymentService',
  connector: 'rest',
  baseURL: process.env.PAYMENT_SERVICE_URL ?? 'http://127.0.0.1:3003',
  crud: false,

  options: {
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
    },
  },

  operations: [
    {
      template: {
        method: 'GET',
        url: `${process.env.PAYMENT_SERVICE_URL ?? 'http://127.0.0.1:3003'}/transaction-offering-metadata`,
        headers: {
          accept: 'application/json',
        },
      },
      functions: {
        getTransactionOfferingMetadata: [],
      },
    },

    {
      template: {
        method: 'POST',
        url: `${process.env.PAYMENT_SERVICE_URL ?? 'http://127.0.0.1:3003'}/payment-transactions/webhook`,
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          'x-razorpay-signature': '{signature}',
        },
        body: '{body}',
      },
      functions: {
        forwardRazorpayWebhook: ['body', 'signature'],
      },
    },

    {
      template: {
        method: 'GET',
        url: `${process.env.PAYMENT_SERVICE_URL ?? 'http://127.0.0.1:3003'}/payment-transactions/by-user/{userId}`,
        headers: {
          accept: 'application/json',
        },
      },
      functions: {
        findTransactionsByUserId: ['userId'],
      },
    },
  ],
};
