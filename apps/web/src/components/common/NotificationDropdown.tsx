"use client";

import { useRouter } from "next/navigation";
import { useNotification } from "@/context/NotificationContext";

export default function NotificationDropdown() {
  const { notifications, unreadCount } = useNotification();
  const router = useRouter();

  const recent = notifications
    .filter((n) => !(n.isRead ?? n.is_read))
    .slice(0, 5);

  return (
    <div className="absolute right-0 top-8 z-50 w-80 rounded-2xl border border-gray-100 bg-white p-4 shadow-xl">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">
          Notifications
          {unreadCount > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </h3>
      </div>

      {recent.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-400">
          No notifications
        </p>
      ) : (
        <ul className="max-h-72 space-y-2 overflow-y-auto">
          {recent.map((n) => (
            <li
              key={n.id}
              className={`rounded-xl p-3 text-sm ${n.isRead ? "bg-gray-50" : "bg-orange-50"}`}
            >
              <p className="font-medium text-gray-800">{n.title}</p>
              <p className="mt-0.5 text-xs text-gray-500">{n.body}</p>
              {n.createdOn && (
                <p className="mt-1 text-xs text-gray-400">
                  {new Date(n.createdOn).toLocaleString()}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={() => router.push("/notifications")}
        className="mt-3 w-full text-xs text-[#d66a2d] font-medium hover:underline"
      >
        View all notifications →
      </button>
    </div>
  );
}
