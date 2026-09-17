"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FaBars,
  FaUser,
  FaBell,
  FaHome,
  FaReceipt,
  FaCog,
  FaPlaceOfWorship,
  FaMoneyBillWave,
  FaSignOutAlt,
} from "react-icons/fa";
import NotificationDropdown from "@/components/common/NotificationDropdown";
import LogoutModal from "@/components/common/LogoutModal";
import { useNotification } from "@/context/NotificationContext";

type AdminUser = {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  userImage?: string | null;
};

export default function AdminShell({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [adminRole, setAdminRole] = useState<string | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [profileImage, setProfileImage] = useState("");

  useEffect(() => {
    const loadStoredUser = () => {
      const role = sessionStorage.getItem("adminRole");
      const storedUser =
        localStorage.getItem("currentUser") ??
        sessionStorage.getItem("adminUser");

      setAdminRole(role);

      if (!storedUser) {
        setAdminUser(null);
        setProfileImage("");
        return;
      }

      try {
        const user = JSON.parse(storedUser) as AdminUser;

        setAdminUser(user);
        setProfileImage(user.userImage ?? "");
      } catch (error) {
        console.error("Failed to read stored admin user:", error);
      }
    };

    loadStoredUser();

    const handleProfileUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<AdminUser>;
      const updatedUser = customEvent.detail;

      if (updatedUser) {
        setAdminUser(updatedUser);
        setProfileImage(updatedUser.userImage ?? "");
        return;
      }

      loadStoredUser();
    };

    window.addEventListener("admin-profile-updated", handleProfileUpdate);

    return () => {
      window.removeEventListener("admin-profile-updated", handleProfileUpdate);
    };
  }, []);

  const { notifications } = useNotification();

  const pageTitle =
    title ||
    (pathname === "/dashboard"
      ? "Dashboard"
      : pathname === "/temple"
        ? "Temples"
        : pathname === "/temple-detail"
          ? adminRole === "temple_admin"
            ? "My Temple"
            : "Temple Detail"
          : pathname === "/create"
            ? "Create Temple"
            : pathname === "/transactions"
              ? "Transactions"
              : pathname === "/payouts"
                ? "Payouts"
                : pathname === "/settings"
                  ? "Settings"
                  : "Devote Admin");

  const superAdminNavItems = [
    { href: "/dashboard", label: "Dashboard", icon: FaHome },
    { href: "/temple", label: "Temples", icon: FaPlaceOfWorship },
    { href: "/transactions", label: "Transactions", icon: FaReceipt },
    { href: "/payouts", label: "Payouts", icon: FaMoneyBillWave },
    { href: "/festivals", label: "Events & Festivals", icon: FaReceipt },
    { href: "/settings", label: "Settings", icon: FaCog },
  ];

  const templeAdminNavItems = [
    { href: "/dashboard", label: "Dashboard", icon: FaHome },
    { href: "/temple-detail", label: "My Temple", icon: FaPlaceOfWorship },
    { href: "/transactions", label: "Transactions", icon: FaReceipt },
    { href: "/festivals", label: "Events & Festivals", icon: FaReceipt },
    { href: "/settings", label: "Settings", icon: FaCog },
  ];

  const navItems =
    adminRole === "temple_admin" ? templeAdminNavItems : superAdminNavItems;

  const handleLogout = () => {
    sessionStorage.clear();
    setLogoutModalOpen(false);
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#F7F0E6] text-[#2D1F0E]">
      {/* SIDEBAR */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[260px] flex-col border-r border-[#E5D5B5] bg-white shadow-xl transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[80px] items-center gap-3 border-b border-[#E5D5B5] px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3E9D7] text-[#C8602A]">
            <FaPlaceOfWorship className="text-[18px]" />
          </div>

          <div>
            <h2 className="text-[22px] font-semibold italic text-[#2D1F0E]">
              Devote
            </h2>
            <span className="rounded bg-[#2D1F0E] px-2 py-0.5 text-[10px] font-bold text-white">
              ADMIN PORTAL
            </span>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-6 text-[14px] text-[#8B7355]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              (adminRole === "temple_admin" &&
                item.href === "/temple-detail" &&
                pathname.startsWith("/temple-detail"));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 rounded-xl px-5 py-4 ${
                  active
                    ? "bg-[#2D1F0E] font-semibold text-white"
                    : "hover:bg-[#F5EFE6]"
                }`}
              >
                <Icon className="text-[16px]" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[#E5D5B5] p-4">
          <button
            type="button"
            onClick={() => setLogoutModalOpen(true)}
            className="flex w-full items-center gap-4 rounded-xl px-5 py-4 text-[14px] font-semibold text-red-500 transition hover:bg-red-50"
          >
            <FaSignOutAlt className="text-[16px]" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <LogoutModal
        open={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />

      {/* HEADER + CONTENT WRAPPER */}
      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? "ml-[260px]" : "ml-0"
        }`}
      >
        {/* HEADER */}
        <header className="sticky top-0 z-40 flex h-[72px] w-full items-center justify-between border-b border-[#E5D5B5] bg-white px-8">
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-[#8B7355] transition hover:text-[#2D1F0E]"
            >
              <FaBars className="cursor-pointer text-[20px]" />
            </button>

            <span className="text-[20px] font-semibold text-[#2D1F0E]">
              {pageTitle}
            </span>
          </div>

          <div className="flex items-center gap-5">
            <div className="h-[36px] w-px bg-[#E5D5B5]" />

            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="text-[#8B7355] transition hover:text-[#2D1F0E]"
              >
                <FaBell className="cursor-pointer text-[20px]" />
              </button>

              {notifications.length > 0 && (
                <span className="absolute -right-2 -top-2 rounded-full bg-[#EF4444] px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                  {notifications.length}
                </span>
              )}

              {notificationOpen && <NotificationDropdown />}
            </div>

            <button
              type="button"
              onClick={() => router.push("/settings")}
              className="flex items-center gap-3 rounded-xl p-1 transition hover:bg-[#F5EFE6]"
              aria-label="Open profile settings"
            >
              <div className="hidden flex-col text-right md:flex">
                <span className="text-[14px] font-semibold text-[#2D1F0E]">
                  {adminUser
                    ? `${adminUser.firstName ?? ""} ${adminUser.lastName ?? ""}`.trim()
                    : adminRole === "super_admin"
                      ? "Super Admin"
                      : adminRole === "temple_admin"
                        ? "Temple Admin"
                        : ""}
                </span>

                <span className="text-[12px] text-[#8B7355]">
                  {adminRole === "super_admin"
                    ? "Admin"
                    : adminRole === "temple_admin"
                      ? "Temple Access"
                      : ""}
                </span>
              </div>

              <div className="flex h-[44px] w-[44px] items-center justify-center overflow-hidden rounded-full bg-[#C8602A] text-[18px] text-white">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Admin profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <FaUser />
                )}
              </div>
            </button>
          </div>
        </header>

        <main>{children}</main>
      </div>
    </div>
  );
}
