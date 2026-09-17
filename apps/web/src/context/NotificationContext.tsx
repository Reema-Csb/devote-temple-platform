"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

const API_GATEWAY_URL =
  process.env.NEXT_PUBLIC_AUTH_SERVICE_URL ?? "http://127.0.0.1:3002";

const GATEWAY_URL =
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ?? "http://127.0.0.1:3005";

type Notification = {
  id: string;
  title: string;
  body: string;
  type?: string;
  isRead: boolean;
  is_read?: boolean;
  createdOn?: string;
};

type NotificationContextType = {
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: () => void;
  markAllRead: () => void;
  markAsRead: (id: string) => void;
};

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const getUserId = () => {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem("devoteUser");
    if (!stored) return null;
    return JSON.parse(stored)?.id ?? null;
  };

  const checkFestivalReminders = async () => {
    const userId = getUserId();
    if (!userId) return;

    try {
      await fetch(`${GATEWAY_URL}/festivals/check-reminders/${userId}`);
    } catch (err) {
      console.error("Failed to check festival reminders:", err);
    }
  };

  const fetchNotifications = async () => {
    const userId = getUserId();
    if (!userId) return;

    try {
      const response = await fetch(
        `${API_GATEWAY_URL}/users/${userId}/notifications`,
      );

      if (!response.ok) return;

      const data = await response.json();

      const normalized = data.map((n: Notification) => ({
        ...n,
        isRead: n.isRead ?? n.is_read ?? false,
      }));

      setNotifications(normalized);
      setUnreadCount(normalized.filter((n: Notification) => !n.isRead).length);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch(`${API_GATEWAY_URL}/notifications/${id}/read`, {
        method: "PATCH",
      });

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );

      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    const userId = getUserId();
    if (!userId) return;

    try {
      await fetch(`${API_GATEWAY_URL}/users/${userId}/notifications/read-all`, {
        method: "PATCH",
      });

      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          isRead: true,
        })),
      );

      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    fetchNotifications();
    checkFestivalReminders();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        fetchNotifications,
        markAllRead,
        markAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error("useNotification must be used inside NotificationProvider");
  return ctx;
}
