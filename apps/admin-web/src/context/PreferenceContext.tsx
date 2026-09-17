"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type PreferencesType = {
  notification: boolean;
  donation: boolean;
  festival: boolean;
  temple: boolean;
  promo: boolean;
  prayer: boolean;
};

const defaultPreferences: PreferencesType = {
  notification: true,
  donation: true,
  festival: true,
  temple: true,
  promo: false,
  prayer: true,
};

type PreferenceContextType = {
  preferences: PreferencesType;
  togglePreference: (key: keyof PreferencesType) => void;
};

const PreferenceContext = createContext<PreferenceContextType | undefined>(undefined);

export const PreferenceProvider = ({ children }: { children: ReactNode }) => {
  const [preferences, setPreferences] = useState<PreferencesType>(() => {
    if (typeof window === "undefined") {
      return defaultPreferences;
    }
    try {
      const saved = localStorage.getItem("preferences");
      if (saved) {
        return { ...defaultPreferences, ...JSON.parse(saved) };
      }
    } catch (err) {
      console.error("Error loading preferences", err);
    }
    return defaultPreferences;
  });

  useEffect(() => {
    localStorage.setItem("preferences", JSON.stringify(preferences));
  }, [preferences]);

  const togglePreference = (key: keyof PreferencesType) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <PreferenceContext.Provider value={{ preferences, togglePreference }}>
      {children}
    </PreferenceContext.Provider>
  );
};

export const usePreferences = () => {
  const context = useContext(PreferenceContext);
  if (!context) {
    throw new Error("usePreferences must be used within PreferenceProvider");
  }
  return context;
};
