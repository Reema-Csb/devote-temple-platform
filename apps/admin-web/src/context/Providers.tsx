"use client";

import { ReactNode } from "react";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import { LanguageProvider } from "./LanguageContext";
import { NotificationProvider } from "./NotificationContext";
import { PreferenceProvider } from "./PreferenceContext";
import NotificationListener from "@/components/NotificationListener";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <LanguageProvider>
        <NotificationProvider>
          <PreferenceProvider>
            <NotificationListener />
            {children}
          </PreferenceProvider>
        </NotificationProvider>
      </LanguageProvider>
    </Provider>
  );
}
