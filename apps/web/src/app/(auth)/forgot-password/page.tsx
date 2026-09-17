"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [error, setError] = useState("");

  const handleSendOtp = async () => {
    if (!emailOrPhone.trim()) {
      setError("Email or Phone Number is required");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_AUTH_SERVICE_URL}/users/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            emailOrPhone,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data?.error?.message || "Failed to send OTP");
        return;
      }

      localStorage.setItem("resetUser", emailOrPhone);

      alert("OTP sent successfully");

      router.push("/otp-verification");
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-[#f4efe6] flex items-center justify-center px-6 py-8">
      <main className="w-full max-w-[860px]">
        <div className="bg-white rounded-[34px] overflow-hidden border border-[#eadfcd] flex min-h-[560px]">
          {/* Left Panel */}
          <div className="w-[50%] bg-gradient-to-b from-[#4c1b05] to-[#7b2b0a] text-white flex flex-col px-12 pt-12 pb-10">
            <div>
              <h2 className="text-[58px] leading-none font-serif italic">
                {t.appName}
              </h2>

              <p className="mt-4 text-[18px] leading-[1.45] max-w-[320px] font-semibold">
                {t.recoverText}
              </p>
            </div>

            <div className="mt-auto flex items-center gap-4">
              <div className="h-[48px] w-[48px] rounded-[14px] bg-white/10 flex items-center justify-center text-[#f3c886]">
                <ShieldCheck size={22} />
              </div>

              <p className="text-[15px] font-semibold">{t.secureRecovery}</p>
            </div>
          </div>

          {/* Right Panel */}
          <div className="w-[50%] bg-white px-14 pt-14 pb-10 flex flex-col justify-center">
            <h3 className="text-center text-[28px] font-semibold text-[#1d140d]">
              {t.resetPassword}
            </h3>

            <p className="mt-4 text-center text-[14px] text-[#7d6746]">
              {t.forgotPasswordDescription}
            </p>

            <div className="mt-10 space-y-4">
              <div>
                <input
                  type="text"
                  placeholder={t.emailOrPhone}
                  value={emailOrPhone}
                  onChange={(e) => {
                    setEmailOrPhone(e.target.value);
                    setError("");
                  }}
                  className="w-full h-[58px] rounded-[16px] bg-[#e9dfcf] px-6 text-[16px] text-[#7d6746] placeholder:text-[#9d8460] outline-none"
                />

                {error && (
                  <p className="mt-2 text-[13px] text-red-500">{error}</p>
                )}
              </div>

              <button
                onClick={handleSendOtp}
                className="w-full h-[58px] rounded-[16px] bg-gradient-to-r from-[#d66a2d] to-[#dfa20a] text-white text-[16px] font-semibold shadow-sm"
              >
                {t.sendOtp}
              </button>

              <p className="text-center text-[14px] text-[#2c1d12] pt-1">
                {t.rememberPassword}{" "}
                <Link href="/login" className="text-[#e06b1c] font-semibold">
                  {t.backToLogin}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
