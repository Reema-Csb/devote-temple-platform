"use client";

import { Button } from "@/components/ui/button";
import { SUPPORT_CHANNELS } from "@/constants/mock.data";
import { useLanguage } from "@/context/LanguageContext";
import AppShell from "@/components/layout/AppShell";

// ── Support channel icons ─────────────────
function SupportIcon({ type }: { type: string }) {
  if (type === "phone") {
    return (
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#C8773A"
        strokeWidth="1.8"
        strokeLinecap="round"
      >
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.81a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    );
  }
  if (type === "chat") {
    return (
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#C8773A"
        strokeWidth="1.8"
        strokeLinecap="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    );
  }
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#C8773A"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

export default function SupportPage() {
  const { t } = useLanguage();

  const CHANNEL_TITLE: Record<string, string> = {
    email: t.emailSupportTitle,
    phone: t.phoneSupportTitle,
    chat: t.liveChatTitle,
  };

  const CHANNEL_BTN: Record<string, string> = {
    email: t.emailSupportBtn,
    phone: t.phoneSupportBtn,
    chat: t.liveChatBtn,
  };

  const CHANNEL_DETAIL: Record<string, string> = {
    chat: t.liveChatDetail,
  };

  const CHANNEL_HREF: Record<string, string> = {
    email: "mailto:adityan.dev8@gmail.com",
    phone: "tel:+918590869895",
  };

  return (
    <AppShell title={t.communicationSupport}>
      <div
        className="min-h-screen bg-[#F5F0E8]"
        style={{ fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif" }}
      >
        {/* ── Main ── */}
        <main className="px-8 py-6 space-y-5">
          {/* ── Hero + 3 Support Cards ── */}
          <div className="bg-white rounded-2xl shadow-sm px-10 py-10">
            <div className="text-center mb-10">
              <h2 className="text-[28px] font-bold text-[#1A0F00] tracking-tight">
                {t.howCanWeHelp}
              </h2>
              <p className="text-[15px] text-[#9C7E5A] mt-2">
                {t.supportAvailDesc}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-5">
              {SUPPORT_CHANNELS.map((channel) => (
                <div
                  key={channel.id}
                  className="bg-[#FAF7F2] rounded-2xl border border-[#EDE8DF] px-7 py-8 flex flex-col items-center text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-[#EDE8DF] flex items-center justify-center mb-5">
                    <SupportIcon type={channel.icon} />
                  </div>
                  <p className="text-[17px] font-bold text-[#1A0F00] mb-1">
                    {CHANNEL_TITLE[channel.icon] ?? channel.title}
                  </p>
                  <p className="text-[14px] text-[#9C7E5A] mb-6">
                    {CHANNEL_DETAIL[channel.icon] ?? channel.detail}
                  </p>
                  {CHANNEL_HREF[channel.icon] ? (
                    <Button
                      asChild
                      variant="outline"
                      className="w-full h-[44px] rounded-xl border-[1.5px] border-[#C8773A] text-[#C8773A] text-[14px] font-semibold bg-white hover:bg-[#FFF5EE] hover:border-[#C8773A] transition-colors"
                    >
                      <a href={CHANNEL_HREF[channel.icon]}>
                        {CHANNEL_BTN[channel.icon] ?? channel.buttonLabel}
                      </a>
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full h-[44px] rounded-xl border-[1.5px] border-[#C8773A] text-[#C8773A] text-[14px] font-semibold bg-white hover:bg-[#FFF5EE] hover:border-[#C8773A] transition-colors"
                    >
                      {CHANNEL_BTN[channel.icon] ?? channel.buttonLabel}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </AppShell>
  );
}
