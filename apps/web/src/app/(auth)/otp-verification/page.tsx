"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function OtpVerificationPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleChange = (
    index: number,
    value: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (error) setError("");

    // Move to next input automatically
    if (value && index < 3) {
      const nextInput = e.currentTarget.parentElement?.children[
        index + 1
      ] as HTMLInputElement;

      nextInput?.focus();
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join("");

    if (otpValue.length !== 4) {
      setError(t.otpError);
      return;
    }

    const emailOrPhone = localStorage.getItem("resetUser");

    if (!emailOrPhone) {
      setError("Please request OTP again.");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_AUTH_SERVICE_URL}/users/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            emailOrPhone,
            otp: otpValue,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data?.error?.message || "Invalid OTP");
        return;
      }

      router.push("/reset-password");
    } catch (error) {
      console.error(error);
      setError("Something went wrong");
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
                {t.otpLeftText}
              </p>
            </div>

            <div className="mt-auto flex items-center gap-4">
              <div className="h-[48px] w-[48px] rounded-[14px] bg-white/10 flex items-center justify-center text-[#f3c886]">
                <ShieldCheck size={22} />
              </div>

              <p className="text-[15px] font-semibold">{t.otpSecurityTitle}</p>
            </div>
          </div>

          {/* Right Panel */}
          <div className="w-[50%] bg-white px-14 pt-14 pb-10 flex flex-col justify-center">
            <h3 className="text-center text-[28px] font-semibold text-[#1d140d]">
              {t.otpEnterCode}
            </h3>

            <p className="mt-4 text-center text-[14px] text-[#7d6746]">
              {t.otpSubtitle}
            </p>

            <div className="mt-10 space-y-4">
              <div className="flex justify-center gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value, e)}
                    maxLength={1}
                    className="h-[58px] w-[58px] rounded-[16px] bg-[#e9dfcf] text-center text-[20px] text-[#7d6746] outline-none"
                  />
                ))}
              </div>

              {error && (
                <p className="text-center text-[13px] text-red-500">{error}</p>
              )}

              <p className="text-center text-[13px] text-[#7d6746]">
                OTP expires in{" "}
                <span className="font-semibold text-red-500">
                  {Math.floor(timeLeft / 60)}:
                  {(timeLeft % 60).toString().padStart(2, "0")}
                </span>
              </p>

              <button
                onClick={handleVerify}
                className="w-full h-[58px] rounded-[16px] bg-gradient-to-r from-[#d66a2d] to-[#dfa20a] text-white text-[16px] font-semibold shadow-sm"
              >
                {t.verifyOtp}
              </button>

              <p className="text-center text-[14px] text-[#2c1d12] pt-1">
                {t.otpNotReceived}{" "}
                <button className="text-[#e06b1c] font-semibold">
                  {t.resendOtp}
                </button>
              </p>

              <p className="text-center text-[14px] text-[#2c1d12]">
                <Link
                  href="/forgot-password"
                  className="text-[#e06b1c] font-semibold"
                >
                  {t.back}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
