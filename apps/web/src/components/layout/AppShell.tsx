"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  User,
  UserCog,
  Home,
  ChartPie,
  History,
  Globe,
  Bell,
  Shield,
  Headphones,
  FileText,
  Info,
  LogOut,
  AlertCircle,
  Search,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useNotification } from "@/context/NotificationContext";
import NotificationDropdown from "@/components/common/NotificationDropdown";

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL;

export default function AppShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();

  const tt = t as unknown as Record<string, string>;
  const text = (key: string, fallback: string) => tt[key] || fallback;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [displayName, setDisplayName] = useState("User");
  const [notifOpen, setNotifOpen] = useState(false);
  const { unreadCount } = useNotification();

  const loadUserName = async () => {
    const stored = localStorage.getItem("devoteUser");
    if (!stored) return;

    const parsed = JSON.parse(stored);

    const name =
      parsed.displayName ||
      [parsed.firstName, parsed.lastName].filter(Boolean).join(" ");

    if (name) setDisplayName(name);

    let imageKey = parsed.userImage ?? "";

    if (parsed.id) {
      const userRes = await fetch(
        `${process.env.NEXT_PUBLIC_AUTH_SERVICE_URL ?? "http://127.0.0.1:3002"}/users/${parsed.id}`,
      );

      if (userRes.ok) {
        const user = await userRes.json();
        imageKey = user.userImage ?? imageKey;
        // console.log("Image key:", imageKey);
      }
    }

    if (imageKey && API_GATEWAY_URL) {
      const response = await fetch(
        `${API_GATEWAY_URL}/upload/presigned-url?key=${encodeURIComponent(
          imageKey,
        )}`,
      );

      if (response.ok) {
        const data = await response.json();
        // console.log("Presigned URL:", data);
        setProfileImage(data.url ?? "");
      }
    }
  };
  const [profileImage, setProfileImage] = useState("");
  useEffect(() => {
    loadUserName();
    window.addEventListener("profileUpdated", loadUserName);
    return () => window.removeEventListener("profileUpdated", loadUserName);
  }, []);

  const confirmLogout = () => {
    localStorage.removeItem("devoteUser");
    setShowLogoutPopup(false);
    router.push("/login");
  };

  const menuGroups = [
    {
      section: text("main", "MAIN"),
      items: [
        { label: text("homeScreen", "Home Screen"), href: "/home", icon: Home },
        {
          label: text("searchScreen", "Search Screen"),
          href: "/explore",
          icon: Search,
        },
      ],
    },
    {
      section: text("profileActivity", "PROFILE & ACTIVITY"),
      items: [
        {
          label: text("profileScreen", "Profile Screen"),
          href: "/profile",
          icon: User,
        },
        {
          label: text("profileManagement", "Profile Management"),
          href: "/profile-management",
          icon: UserCog,
        },
        {
          label: text("donationAnalytics", "Donation Analytics"),
          href: "/dashboard/analytics",
          icon: ChartPie,
        },
        {
          label: text("transactionHistory", "Transaction History"),
          href: "/dashboard/transactions",
          icon: History,
        },
      ],
    },
    {
      section: text("settings", "SETTINGS"),
      items: [
        {
          label: text("appLanguageMenu", "App Language"),
          href: "/app-language",
          icon: Globe,
        },
        {
          label: text("notificationPreferences", "Notification Preferences"),
          href: "/settings",
          icon: Bell,
        },
        {
          label: text("securityManagement", "Security Management"),
          href: "/dashboard/security",
          icon: Shield,
        },
      ],
    },
    {
      section: text("supportLegal", "SUPPORT & LEGAL"),
      items: [
        {
          label: text("communicationSupport", "Communication & Support"),
          href: "/dashboard/support",
          icon: Headphones,
        },
        {
          label: text("termsPrivacy", "Terms & Privacy"),
          href: "/terms-privacy",
          icon: FileText,
        },
        {
          label: text("aboutDevote", "About Devote"),
          href: "/about",
          icon: Info,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* SIDEBAR */}
      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-[240px] bg-white border-r border-border transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="px-5 pt-5 pb-5 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-brand-gold flex items-center justify-center text-white text-[15px] font-bold">
                D
              </div>
              <h2 className="text-[22px] italic font-heading font-semibold text-primary">
                {text("appName", "Devote")}
              </h2>
            </div>
          </div>

          {/* Nav */}
          <div className="flex-1 overflow-y-auto px-3 pt-4">
            {menuGroups.map((group) => (
              <div key={group.section} className="mb-6">
                <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  {group.section}
                </p>

                <div className="space-y-[2px]">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.href;

                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors ${
                          active
                            ? "bg-orange-50 text-primary"
                            : "text-foreground hover:bg-surface"
                        }`}
                      >
                        <Icon
                          size={16}
                          strokeWidth={1.8}
                          className={
                            active ? "text-primary" : "text-muted-foreground"
                          }
                        />
                        <span className="leading-tight">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Logout */}
          <div className="border-t border-border px-4 py-4">
            <button
              onClick={() => setShowLogoutPopup(true)}
              className="flex items-center gap-2.5 text-[13px] font-medium text-destructive hover:opacity-80 transition-opacity"
            >
              <LogOut size={15} />
              {text("logout", "Logout")}
            </button>
          </div>
        </div>
      </aside>

      {/* HEADER */}
      <header
        className={`sticky top-0 z-40 h-[72px] bg-white border-b border-border flex items-center justify-between px-8 transition-all duration-300 ${
          sidebarOpen ? "ml-[240px]" : "ml-0"
        }`}
      >
        <div className="flex items-center gap-5">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Menu size={24} />
          </button>

          <h1 className="text-[20px] font-semibold text-foreground">{title}</h1>
        </div>

        <div className="flex items-center gap-5">
          {/* NOTIFICATION BELL */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Bell size={22} />
            </button>

            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-destructive text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                {unreadCount}
              </span>
            )}

            {notifOpen && <NotificationDropdown />}
          </div>

          <div className="h-[36px] w-px bg-border" />

          <div
            onClick={() => router.push("/profile-management")}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="text-right">
              <p className="text-[14px] font-semibold text-foreground leading-none">
                {displayName}
              </p>
              <p className="text-[12px] text-muted-foreground mt-1">
                {text("devotee", "Devotee")}
              </p>
            </div>

            <div className="h-[44px] w-[44px] overflow-hidden rounded-full bg-brand-gold flex items-center justify-center text-white">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <User size={20} />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* PAGE CONTENT */}
      <main
        className={`transition-all duration-300 ${
          sidebarOpen ? "ml-[240px]" : "ml-0"
        }`}
      >
        {children}
      </main>

      {/* LOGOUT POPUP */}
      {showLogoutPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20">
          <div className="w-[400px] rounded-[28px] bg-white px-9 py-9 text-center shadow-[0_25px_60px_rgba(70,50,25,0.25)]">
            <div className="mx-auto flex h-[86px] w-[86px] items-center justify-center rounded-full bg-red-50">
              <AlertCircle size={44} className="text-destructive" />
            </div>

            <h2 className="mt-7 text-[26px] font-semibold text-foreground">
              {t.areYouSure}
            </h2>

            <p className="mx-auto mt-4 max-w-[310px] text-[15px] leading-7 text-muted-foreground">
              {t.logoutConfirmDesc}
            </p>

            <button
              onClick={confirmLogout}
              className="mt-8 h-[52px] w-full rounded-xl bg-destructive text-[16px] font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
            >
              {text("logout", "Logout")}
            </button>

            <button
              onClick={() => setShowLogoutPopup(false)}
              className="mt-3 h-[52px] w-full rounded-xl border border-border bg-white text-[16px] font-semibold text-muted-foreground hover:bg-surface transition-colors"
            >
              {text("cancel", "Cancel")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
