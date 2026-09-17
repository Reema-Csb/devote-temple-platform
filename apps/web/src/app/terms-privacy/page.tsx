"use client";

import AppShell from "@/components/layout/AppShell";
import { useLanguage } from "@/context/LanguageContext";

export default function TermsPrivacyPage() {
  const { t } = useLanguage();

  return (
    <AppShell title={t.termsPrivacy}>
      <div className="min-h-[calc(100vh-88px)] bg-[#f4efe6] px-6 py-8">
        <div className="max-w-[660px] mx-auto bg-white rounded-[28px] border border-[#e4d7c3] p-9 shadow-sm">
          <h2 className="text-[24px] font-semibold text-[#1d140d] mb-2">
            {t.termsTitle}
          </h2>

          <p className="text-[12px] uppercase tracking-wide text-[#9c7a50] font-semibold mb-8">
            {t.lastUpdated}
          </p>

          <div className="space-y-8 text-[15px] leading-8 text-[#7b6345]">
            <section>
              <h3 className="text-[16px] font-semibold text-[#1d140d] mb-3">
                {t.termsIntroTitle}
              </h3>
              <p>{t.termsIntroText}</p>
            </section>

            <section>
              <h3 className="text-[16px] font-semibold text-[#1d140d] mb-3">
                {t.termsAccountTitle}
              </h3>
              <p>{t.termsAccountText}</p>
            </section>

            <section>
              <h3 className="text-[16px] font-semibold text-[#1d140d] mb-3">
                {t.termsDonationTitle}
              </h3>
              <p>{t.termsDonationText}</p>
            </section>

            <section>
              <h3 className="text-[16px] font-semibold text-[#1d140d] mb-3">
                {t.termsRefundTitle}
              </h3>
              <p>{t.termsRefundText}</p>
            </section>

            <section>
              <h3 className="text-[16px] font-semibold text-[#1d140d] mb-3">
                {t.termsPrivacyTitle}
              </h3>
              <p>{t.termsPrivacyText}</p>
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
