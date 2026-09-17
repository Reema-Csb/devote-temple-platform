"use client";

import { useNotification } from "@/context/NotificationContext";

export default function NotificationDropdown() {
  const { notifications, markAllRead, clearNotifications } = useNotification();

  return (
    <div className="absolute right-0 top-8 z-50 w-80 rounded-2xl border border-gray-100 bg-white p-4 shadow-xl">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
        {notifications.length > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs text-[#ba7104] hover:underline"
          >
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-400">
          No notifications
        </p>
      ) : (
        <ul className="max-h-72 space-y-2 overflow-y-auto">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`rounded-xl p-3 text-sm ${n.read ? "bg-gray-50" : "bg-orange-50"}`}
            >
              <p className="font-medium text-gray-800">{n.title}</p>
              <p className="mt-0.5 text-xs text-gray-500">{n.message}</p>
              <p className="mt-1 text-xs text-gray-400">{n.time}</p>
            </li>
          ))}
        </ul>
      )}

      {notifications.length > 0 && (
        <button
          onClick={clearNotifications}
          className="mt-3 w-full text-xs text-gray-400 hover:text-red-400"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
