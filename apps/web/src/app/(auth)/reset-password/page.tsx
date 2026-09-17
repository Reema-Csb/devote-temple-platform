"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setError("Please fill all fields");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const emailOrPhone = localStorage.getItem("resetUser");

    if (!emailOrPhone) {
      setError("Please request OTP again.");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_AUTH_SERVICE_URL}/users/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            emailOrPhone,
            newPassword,
            confirmPassword,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data?.error?.message || "Failed to reset password");
        return;
      }

      localStorage.removeItem("resetUser");

      alert("Password reset successful");
      router.push("/login");
    } catch (error) {
      console.error("Reset password error:", error);
      setError("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-[#f4efe6] flex items-center justify-center px-6 py-8">
      <main className="w-full max-w-[860px]">
        <div className="w-full">
          <div className="bg-white rounded-[34px] border border-[#e8dcc8] overflow-hidden flex min-h-[520px]">
            {/* Left */}
            <div className="w-[46%] bg-gradient-to-b from-[#4f1c05] to-[#7a2b0a] text-white flex flex-col">
              <div className="px-12 pt-14">
                <h2 className="text-[68px] font-serif italic leading-none">
                  {t.appName}
                </h2>

                <p className="mt-7 text-[22px] leading-[1.45] max-w-[390px]">
                  {t.resetSubtitle}
                </p>
              </div>

              <div className="mt-auto px-12 pb-10 flex items-start gap-4">
                <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center text-[#f4c98a]">
                  <Lock size={24} />
                </div>

                <div>
                  <p className="text-[18px] font-semibold">{t.newPassword}</p>
                  <p className="text-[14px] text-white/90 max-w-[260px]">
                    Create a strong password to protect your account.
                  </p>
                </div>
              </div>
            </div>

            {/* Right */}
            <div className="w-[54%] bg-white px-14 pt-12 pb-8">
              <h3 className="text-center text-[30px] font-semibold text-[#1d140d]">
                {t.resetPasswordTitle}
              </h3>

              <p className="text-center mt-4 text-[16px] leading-7 text-[#7d6746] max-w-[560px] mx-auto">
                {t.resetSubtitle}
              </p>

              <div className="max-w-[700px] mx-auto mt-12 space-y-5">
                {/* New Password */}
                <div>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      placeholder={t.newPassword}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setError("");
                      }}
                      className="w-full h-[64px] rounded-[18px] bg-[#e9dfcf] px-7 pr-14 text-[17px] text-[#7d6746] placeholder:text-[#9d8460] outline-none"
                    />

                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-[#a2855d]"
                    >
                      {showNewPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder={t.confirmPassword}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setError("");
                      }}
                      className="w-full h-[64px] rounded-[18px] bg-[#e9dfcf] px-7 pr-14 text-[17px] text-[#7d6746] placeholder:text-[#9d8460] outline-none"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-[#a2855d]"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="text-center text-[14px] text-red-500">
                    {error}
                  </p>
                )}

                <button
                  onClick={handleResetPassword}
                  className="w-full h-[66px] rounded-[18px] bg-gradient-to-r from-[#d66a2d] to-[#dfa20a] text-white text-[18px] font-semibold shadow-sm"
                >
                  {t.resetBtn}
                </button>

                <p className="text-center text-[15px] text-[#2c1d12]">
                  <Link href="/login" className="text-[#e06b1c] font-semibold">
                    {t.backToLogin}
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
