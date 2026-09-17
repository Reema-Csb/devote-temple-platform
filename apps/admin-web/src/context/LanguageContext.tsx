"use client";

import { createContext, useContext, useState } from "react";
import { translations } from "@/lib/translations";

type LanguageKey = keyof typeof translations;

type LanguageContextType = {
  lang: LanguageKey;
  setLang: (lang: LanguageKey) => void;
  t: (typeof translations)[LanguageKey];
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LanguageKey>(() => {
    if (typeof window === "undefined") {
      return "English";
    }

    const savedLang = localStorage.getItem("appLanguage");

    if (savedLang && savedLang in translations) {
      return savedLang as LanguageKey;
    }

    localStorage.setItem("appLanguage", "English");
    return "English";
  });

  const setLang = (newLang: LanguageKey) => {
    setLangState(newLang);
    localStorage.setItem("appLanguage", newLang);
  };

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        t: translations[lang] || translations.English,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }

  return context;
}
