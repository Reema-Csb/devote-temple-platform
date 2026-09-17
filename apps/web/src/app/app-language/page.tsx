"use client";

import { Check } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { useLanguage } from "@/context/LanguageContext";

const languages = [
  { english: "English", native: "English" },
  { english: "Hindi", native: "हिंदी" },
  { english: "Tamil", native: "தமிழ்" },
  { english: "Telugu", native: "తెలుగు" },
  { english: "Malayalam", native: "മലയാളം" },
  { english: "Kannada", native: "ಕನ್ನಡ" },
  { english: "Bengali", native: "বাংলা" },
  { english: "Marathi", native: "मराठी" },
  { english: "Gujarati", native: "ગુજરાતી" },
];

export default function AppLanguagePage() {
  const { lang, setLang, t } = useLanguage();

  return (
    <AppShell title={t.appLanguage}>
      <div className="min-h-[calc(100vh-88px)] bg-[#f5f0e8] px-6 py-6">
        <div className="max-w-[1200px] mx-auto flex justify-center">
          <div className="w-[420px] rounded-[24px] border border-[#e7dbc9] bg-white p-6 shadow-sm">
            <h2 className="text-[22px] font-semibold text-[#1d140d]">
              {t.appLanguage}
            </h2>

            <p className="mt-1 text-[13px] text-[#9c7a50]">
              {t.selectLanguage}
            </p>

            <div className="mt-5 grid grid-cols-3 gap-3">
              {languages.map((item) => {
                const isSelected = lang === item.english;

                return (
                  <button
                    key={item.english}
                    type="button"
                    onClick={() =>
                      setLang(
                        item.english as keyof typeof import("@/lib/translations").translations,
                      )
                    }
                    className={`relative rounded-[12px] border px-4 py-4 text-left transition ${
                      isSelected
                        ? "border-[#d66a2d] bg-[#fff8f3]"
                        : "border-[#dcccb0] bg-white hover:bg-[#fbf6ef]"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#d66a2d] text-white">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}

                    <p
                      className={`text-[15px] font-medium ${
                        isSelected ? "text-[#d66a2d]" : "text-[#1d140d]"
                      }`}
                    >
                      {item.english}
                    </p>

                    <p className="mt-1 text-[13px] text-[#9c7a50]">
                      {item.native}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
