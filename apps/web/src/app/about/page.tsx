"use client";

import { FaInstagram, FaTwitter, FaFacebookF, FaYoutube } from "react-icons/fa";
import AppShell from "@/components/layout/AppShell";
import { useLanguage } from "@/context/LanguageContext";

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <AppShell title={t.aboutDevote}>
      <div className="min-h-screen bg-[#f5efe6]">
        <div className="p-6">
          <div className="flex items-center justify-center">
            <div className="w-full max-w-3xl bg-[#f7f3ee] rounded-3xl shadow-md p-10 text-center">
              <h1 className="text-5xl font-serif text-[#c4632e] font-semibold">
                Devote
              </h1>

              <span className="inline-block mt-2 px-4 py-1 text-sm rounded-full bg-[#e6d7c3] text-[#7a5c3e]">
                {t.versionLabel}
              </span>

              <p className="mt-6 text-lg text-gray-700 max-w-xl mx-auto">
                &ldquo;{t.aboutTagline}&rdquo;
              </p>

              <div className="mt-10">
                <p className="text-xs tracking-widest text-gray-500 mb-6">
                  {t.ourLeadershipTeam}
                </p>

                <div className="flex justify-center gap-10 flex-wrap">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-b from-orange-500 to-orange-700 mx-auto mb-3"></div>
                    <p className="font-semibold">Senior Developers </p>
                    <p className="text-sm text-gray-500">{t.managerRole} </p>
                  </div>

                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-b from-yellow-500 to-orange-500 mx-auto mb-3"></div>
                    <p className="font-semibold">BNB </p>
                    <p className="text-sm text-gray-500">{t.headOfOpsRole}</p>
                  </div>

                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-[#5a2d0c] mx-auto mb-3"></div>
                    <p className="font-semibold">BNB Team</p>
                    <p className="text-sm text-gray-500">{t.developersRole}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-6 mt-10 text-[#7a5c3e]">
                <a
                  href="https://www.instagram.com/bytesnbinary?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                  className="p-3 bg-[#e6d7c3] rounded-full cursor-pointer hover:scale-110 transition"
                >
                  <FaInstagram />
                </a>

                <a
                  href="#"
                  className="p-3 bg-[#e6d7c3] rounded-full cursor-pointer hover:scale-110 transition"
                >
                  <FaTwitter />
                </a>

                <a
                  href="#"
                  className="p-3 bg-[#e6d7c3] rounded-full cursor-pointer hover:scale-110 transition"
                >
                  <FaFacebookF />
                </a>

                <a
                  href="#"
                  className="p-3 bg-[#e6d7c3] rounded-full cursor-pointer hover:scale-110 transition"
                >
                  <FaYoutube />
                </a>
              </div>

              <div className="mt-10 border-t pt-4 text-xs text-gray-500">
                {t.footerRights}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
