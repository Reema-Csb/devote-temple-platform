"use client";

import AppShell from "@/components/layout/AppShell";
import { useEffect, useMemo, useState } from "react";

interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type?: string;
  isRead?: boolean;
  createdOn?: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "read">("all");
  const [loading, setLoading] = useState(true);

  const API_URL =
    process.env.NEXT_PUBLIC_AUTH_API_URL || "http://127.0.0.1:3002";

  const user =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("devoteUser") || "{}")
      : {};

  const userId = user?.id;

  const fetchNotifications = async (status = "all") => {
    if (!userId) return;

    try {
      setLoading(true);

      let url = `${API_URL}/users/${userId}/notifications`;

      if (status !== "all") {
        url += `?status=${status}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const data = await response.json();

      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(activeTab);
  }, [activeTab]);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`${API_URL}/notifications/${id}/read`, {
        method: "PATCH",
      });

      fetchNotifications(activeTab);
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`${API_URL}/users/${userId}/notifications/read-all`, {
        method: "PATCH",
      });

      fetchNotifications(activeTab);
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications],
  );

  return (
    <AppShell title="notifications">
      <div className="min-h-screen bg-[#f6f0e7] p-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-semibold text-[#1d140d]">
            Notifications
          </h1>

          <div className="mt-8 flex flex-wrap gap-3 items-center">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-5 py-2 rounded-lg text-sm font-medium ${
                activeTab === "all"
                  ? "bg-[#d66a2d] text-white"
                  : "bg-white border border-[#e4d3bc]"
              }`}
            >
              All
            </button>

            <button
              onClick={() => setActiveTab("unread")}
              className={`px-5 py-2 rounded-lg text-sm font-medium ${
                activeTab === "unread"
                  ? "bg-[#d66a2d] text-white"
                  : "bg-white border border-[#e4d3bc]"
              }`}
            >
              Unread
            </button>

            <button
              onClick={() => setActiveTab("read")}
              className={`px-5 py-2 rounded-lg text-sm font-medium ${
                activeTab === "read"
                  ? "bg-[#d66a2d] text-white"
                  : "bg-white border border-[#e4d3bc]"
              }`}
            >
              Read
            </button>

            <div className="ml-auto">
              <button
                onClick={markAllAsRead}
                className="bg-[#d66a2d] text-white px-5 py-2 rounded-lg text-sm font-medium"
              >
                ✓ Mark all as read
              </button>
            </div>
          </div>

          <div className="mt-4 text-sm text-[#8b6d4d]">
            Unread Notifications: {unreadCount}
          </div>

          <div className="mt-6 bg-white rounded-2xl border border-[#eadbc5] overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="p-10 text-center text-[#8b6d4d]">
                No notifications found
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() =>
                    !notification.isRead && markAsRead(notification.id)
                  }
                  className={`p-5 border-b border-[#f1e8da] cursor-pointer hover:bg-[#faf7f2] transition ${
                    !notification.isRead ? "bg-[#fff8f0]" : ""
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-[#1d140d]">
                        {notification.title}
                      </h3>

                      <p className="mt-2 text-[#7a654c]">{notification.body}</p>

                      {notification.createdOn && (
                        <p className="mt-3 text-xs text-[#9c7a50]">
                          {new Date(notification.createdOn).toLocaleString()}
                        </p>
                      )}
                    </div>

                    {!notification.isRead && (
                      <span className="h-3 w-3 rounded-full bg-red-500 mt-1" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
