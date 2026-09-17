export const AuthServiceDataSourceConfig = {
  name: 'authService',
  connector: 'rest',
  baseURL: process.env.AUTH_SERVICE_URL,
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
        url: `${process.env.AUTH_SERVICE_URL}/users/{userId}/fcm-tokens`,
        headers: {accept: 'application/json'},
      },
      functions: {
        getFcmTokens: ['userId'],
      },
    },
    {
      template: {
        method: 'POST',
        url: `${process.env.AUTH_SERVICE_URL}/notifications`,
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
        },
        body: '{notificationData}',
      },
      functions: {
        createNotification: ['notificationData'],
      },
    },
  ],
};
