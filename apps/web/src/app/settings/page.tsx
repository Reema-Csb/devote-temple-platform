"use client";

import AppShell from "@/components/layout/AppShell";
import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

type Preferences = {
  notification: boolean;
  donation: boolean;
  festival: boolean;
  temple: boolean;
  promo: boolean;
};

type ToggleProps = {
  label: string;
  desc: string;
  value: boolean;
  onClick: () => void;
  disabled?: boolean;
};

function Toggle({
  label,
  desc,
  value,
  onClick,
  disabled = false,
}: ToggleProps) {
  return (
    <div
      className={`flex items-center justify-between rounded-2xl p-5 border transition-all duration-300 ${
        disabled
          ? "bg-[#f4efe7] border-[#eadfce] opacity-70"
          : "bg-white border-[#e6d7c3]"
      }`}
    >
      <div>
        <h3 className="font-semibold text-lg text-black">{label}</h3>
        <p className="text-sm text-[#9a7b57] mt-1">{desc}</p>
      </div>

      <button
        disabled={disabled}
        role="switch"
        aria-checked={value}
        onClick={onClick}
        className={`w-14 h-8 flex items-center rounded-full p-1 transition-all duration-300 ${
          disabled
            ? "bg-gray-300 cursor-not-allowed"
            : value
              ? "bg-[#c95f22] cursor-pointer hover:scale-105"
              : "bg-[#dfcfad] cursor-pointer hover:scale-105"
        }`}
      >
        <div
          className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-all duration-300 ${
            value ? "translate-x-6" : ""
          }`}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const { t } = useLanguage();
  const userId = "123";
  const API_URL =
    process.env.NEXT_PUBLIC_AUTH_API_URL || "http://127.0.0.1:3002";

  const [preferences, setPreferences] = useState<Preferences>({
    notification: true,
    donation: true,
    festival: true,
    temple: true,
    promo: true,
  });

  const [loading, setLoading] = useState(true);

  const getUserId = () => {
    const stored = localStorage.getItem("devoteUser");
    if (!stored) return "";
    const user = JSON.parse(stored);
    return user?.id || "";
  };

  const fetchPreferences = async () => {
    const userId = getUserId();
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/users/${userId}/notification-preferences`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch preferences");
      }

      let data = await response.json();

      if (!data) {
        const createRes = await fetch(
          `${API_URL}/users/${userId}/notification-preferences`,
          {
            method: "POST",
          },
        );

        data = await createRes.json();
      }

      setPreferences({
        notification: data.pushNotifications ?? true,
        donation: data.donationAlerts ?? true,
        festival: data.festivalReminders ?? true,
        temple: data.templeUpdates ?? true,
        promo: data.promotions ?? true,
      });
    } catch (error) {
      console.error("FETCH_PREFERENCES_ERROR", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, []);

  const updatePreference = async (
    key: keyof Preferences,
    apiKey: string,
    value: boolean,
  ) => {
    const userId = getUserId();
    if (!userId) return;

    const previous = preferences;

    const next = {
      ...preferences,
      [key]: value,
    };

    setPreferences(next);

    try {
      await fetch(`${API_URL}/users/${userId}/notification-preferences`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [apiKey]: value }),
      });
    } catch (error) {
      console.error("UPDATE_PREFERENCE_ERROR", error);
      setPreferences(previous);
    }
  };

  const handleNotificationToggle = async () => {
    const userId = getUserId();
    if (!userId) return;

    const newValue = !preferences.notification;
    const previous = preferences;

    const next = {
      notification: newValue,
      donation: newValue,
      festival: newValue,
      temple: newValue,
      promo: newValue,
    };

    setPreferences(next);

    try {
      await fetch(`${API_URL}/users/${userId}/notification-preferences`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pushNotifications: newValue,
          donationAlerts: newValue,
          festivalReminders: newValue,
          templeUpdates: newValue,
          promotions: newValue,
        }),
      });
    } catch (error) {
      console.error("MASTER_NOTIFICATION_ERROR", error);
      setPreferences(previous);
    }
  };

  if (loading) {
    return (
      <AppShell title="Notification Settings">
        <div className="min-h-screen bg-[#f5efe6] flex items-center justify-center">
          <p className="text-[#7a2e0e] font-medium">Loading preferences...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Notification Settings">
      <div className="min-h-screen bg-[#f5efe6] p-6">
        <div className="max-w-xl mx-auto">
          <h1 className="text-2xl font-bold text-[#2d1606] mb-6">
            Notification Settings
          </h1>

          <div className="space-y-4">
            <Toggle
              label="Push Notifications"
              desc="Master toggle for all notifications"
              value={preferences.notification}
              onClick={handleNotificationToggle}
            />

            <Toggle
              label="Donation Alerts"
              desc="Get notified about donation confirmations"
              value={preferences.donation}
              onClick={() =>
                updatePreference(
                  "donation",
                  "donationAlerts",
                  !preferences.donation,
                )
              }
              disabled={!preferences.notification}
            />

            <Toggle
              label="Festival Reminders"
              desc="Reminders for upcoming festivals and events"
              value={preferences.festival}
              onClick={() =>
                updatePreference(
                  "festival",
                  "festivalReminders",
                  !preferences.festival,
                )
              }
              disabled={!preferences.notification}
            />

            <Toggle
              label="Temple Updates"
              desc="News and updates from your followed temples"
              value={preferences.temple}
              onClick={() =>
                updatePreference("temple", "templeUpdates", !preferences.temple)
              }
              disabled={!preferences.notification}
            />

            <Toggle
              label="Promotions"
              desc="Special offers and promotional content"
              value={preferences.promo}
              onClick={() =>
                updatePreference("promo", "promotions", !preferences.promo)
              }
              disabled={!preferences.notification}
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
