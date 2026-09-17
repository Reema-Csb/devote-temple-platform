"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Mail,
  Phone,
  ChartPie,
  History,
  Globe,
  Bell,
  Shield,
  ChevronRight,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";

const AUTH_URL =
  process.env.NEXT_PUBLIC_AUTH_SERVICE_URL ?? "http://127.0.0.1:3002";

const API_GATEWAY_URL =
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ?? "http://127.0.0.1:3005";

export default function ProfilePage() {
  const { t } = useLanguage();

  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [profileImage, setProfileImage] = useState("");

  const loadUser = async () => {
    const saved = localStorage.getItem("devoteUser");
    const parsed = saved ? JSON.parse(saved) : null;
    if (!parsed) return;

    setUserName(
      parsed.displayName ||
        [parsed.firstName, parsed.lastName].filter(Boolean).join(" "),
    );
    setUserEmail(parsed.email ?? "");
    setUserPhone(parsed.phone ?? "");

    const userRes = await fetch(`${AUTH_URL}/users/${parsed.id}`);
    if (!userRes.ok) return;

    const user = await userRes.json();
    const imageKey = user.userImage ?? parsed.userImage ?? "";

    if (!imageKey) return;

    const imageRes = await fetch(
      `${API_GATEWAY_URL}/upload/presigned-url?key=${encodeURIComponent(
        imageKey,
      )}`,
    );

    if (!imageRes.ok) return;

    const imageData = await imageRes.json();
    setProfileImage(imageData.url ?? "");
  };

  useEffect(() => {
    loadUser();
    window.addEventListener("profileUpdated", loadUser);
    return () => window.removeEventListener("profileUpdated", loadUser);
  }, []);

  const displayName = userName || t.profileName;
  const initials = displayName
    .split(" ")
    .map((word: string) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <AppShell title={t.profileScreen}>
      <div className="px-6 py-8 bg-[#f4efe6] min-h-[calc(100vh-88px)]">
        <div className="max-w-[1160px] mx-auto">
          <div className="bg-white rounded-[34px] border border-[#e8dcc8] shadow-sm px-10 py-11 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="h-[118px] w-[118px] overflow-hidden rounded-full bg-[#d98b12] text-white flex items-center justify-center text-[52px] font-semibold border-[5px] border-white shadow-md">
                {profileImage ? (
                  <Image
                    src={profileImage}
                    alt="Profile"
                    width={118}
                    height={118}
                    unoptimized
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>

              <div>
                <h2 className="text-[28px] leading-none font-semibold text-[#1d140d]">
                  {displayName}
                </h2>

                <div className="mt-5 space-y-3">
                  <div className="flex items-center gap-3 text-[#9d7a50]">
                    <Mail size={21} strokeWidth={2} />
                    <span className="text-[16px]">{userEmail}</span>
                  </div>

                  <div className="flex items-center gap-3 text-[#9d7a50]">
                    <Phone size={21} strokeWidth={2} />
                    <span className="text-[16px]">{userPhone}</span>
                  </div>
                </div>
              </div>
            </div>

            <Link
              href="/profile-management"
              className="h-[46px] px-8 rounded-[14px] bg-[#ece1d1] text-[#d66a2d] text-[15px] font-semibold flex items-center justify-center"
            >
              {t.editProfile}
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-10 mt-12">
            <div>
              <h3 className="text-[14px] font-semibold tracking-[0.08em] text-[#9c7a50] uppercase mb-6">
                {t.myDevotionActivity}
              </h3>

              <div className="bg-white rounded-[28px] border border-[#e8dcc8] overflow-hidden shadow-sm">
                <OptionRow
                  icon={<ChartPie size={24} strokeWidth={2} />}
                  title={t.donationAnalytics}
                  subtitle={t.viewOfferingInsights}
                />
                <OptionRow
                  icon={<History size={24} strokeWidth={2} />}
                  title={t.transactionHistory}
                  subtitle={t.trackPastSevas}
                  bordered={false}
                  href="/dashboard/transactions"
                />
              </div>
            </div>

            <div>
              <h3 className="text-[14px] font-semibold tracking-[0.08em] text-[#9c7a50] uppercase mb-6">
                {t.settingsPreferences}
              </h3>

              <div className="bg-white rounded-[28px] border border-[#e8dcc8] overflow-hidden shadow-sm">
                <OptionRow
                  icon={<Globe size={24} strokeWidth={2} />}
                  title={t.appLanguageMenu}
                />
                <OptionRow
                  icon={<Bell size={24} strokeWidth={2} />}
                  title={t.notificationPreferences}
                />
                <OptionRow
                  icon={<Shield size={24} strokeWidth={2} />}
                  title={t.securityManagement}
                  bordered={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function OptionRow({
  icon,
  title,
  subtitle,
  bordered = true,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  bordered?: boolean;
  href?: string;
}) {
  const inner = (
    <div
      className={`flex items-center justify-between px-6 py-6 ${
        bordered ? "border-b border-[#eee4d6]" : ""
      } ${href ? "cursor-pointer hover:bg-[#fdf8f2] transition-colors" : ""}`}
    >
      <div className="flex items-center gap-6">
        <div className="h-[58px] w-[58px] rounded-[16px] bg-[#f2eadf] text-[#b08d63] flex items-center justify-center">
          {icon}
        </div>

        <div>
          <p className="text-[17px] font-semibold text-[#1d140d]">{title}</p>
          {subtitle && (
            <p className="text-[14px] text-[#9c7a50] mt-1">{subtitle}</p>
          )}
        </div>
      </div>

      <ChevronRight size={26} className="text-[#c4aa83]" />
    </div>
  );

  if (href) {
    return <Link href={href}>{inner}</Link>;
  }

  return inner;
}
