importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyAZ9dS6VW47GM9K6IM07PMCdxkCuhmU1HI",
  authDomain: "devote-ba294.firebaseapp.com",
  projectId: "devote-ba294",
  storageBucket: "devote-ba294.firebasestorage.app",
  messagingSenderId: "543103542168",
  appId: "1:543103542168:web:1293cba8f5b4422f9001ed",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {

  self.registration.showNotification(
    payload.notification?.title || "DEVOTE",
    {
      body: payload.notification?.body || "You have a new notification",
      icon: "/favicon.ico",
      badge: "/favicon.ico",
    }
  );
});