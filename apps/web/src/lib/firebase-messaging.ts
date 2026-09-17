import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "./firebase";

async function registerServiceWorker() {
    if ("serviceWorker" in navigator) {
        await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    }
}

const AUTH_API_URL =
    process.env.NEXT_PUBLIC_AUTH_SERVICE_URL ?? "http://127.0.0.1:3002";

export async function requestNotificationPermission() {
    try {
        if (!messaging) {
            console.log("Firebase messaging is not available");
            return null;
        }

        const permission = await Notification.requestPermission();

        if (permission !== "granted") {
            console.log("Notification permission not granted");
            return null;
        }

        await registerServiceWorker();

        const token = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        });

        console.log("FCM Token:", token);

        const savedUser = localStorage.getItem("devoteUser");
        const user = savedUser ? JSON.parse(savedUser) : null;

        if (!user?.id) {
            console.log("User id not found. Token not saved.");
            return token;
        }

        await fetch(`${AUTH_API_URL}/notification-tokens`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId: user.id,
                fcmToken: token,
                deviceType: "web",
                deviceId: "web-" + user.id,
            }),
        });

        console.log("FCM token saved to backend");

        return token;
    } catch (error) {
        console.error("Error getting/saving FCM token:", error);
        return null;
    }
}

export function listenForForegroundMessages() {
    if (!messaging) return;

    onMessage(messaging, (payload) => {
        console.log("Foreground notification:", payload);
        alert(
            `${payload.notification?.title}\n${payload.notification?.body}`
        );
    });
}