"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Landmark } from "lucide-react";

const AUTH_SERVICE_URL =
  process.env.NEXT_PUBLIC_AUTH_SERVICE_URL ?? "http://127.0.0.1:3002";

export default function AdminOtpVerificationPage() {
  const router = useRouter();

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60);

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

    if (value && index < 3) {
      const nextInput = e.currentTarget.parentElement?.children[
        index + 1
      ] as HTMLInputElement;

      nextInput?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const otpValue = otp.join("");

    if (otpValue.length !== 4) {
      setError("Please enter the 4-digit OTP.");
      return;
    }

    const emailOrPhone = localStorage.getItem("adminResetUser");

    if (!emailOrPhone) {
      setError("Please request an OTP again.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${AUTH_SERVICE_URL}/users/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrPhone, otp: otpValue }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.error?.message ?? "Invalid OTP.");
        return;
      }

      router.push("/reset-password");
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F1E7] px-4 text-[#2D1F0E]">
      <div className="w-full max-w-md rounded-[28px] bg-white p-10 shadow-xl">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F3E9D7]">
            <Landmark className="h-8 w-8 text-[#C8602A]" />
          </div>

          <h1 className="text-3xl font-bold text-[#2D1F0E]">Enter OTP</h1>

          <p className="mt-2 text-center text-[#8A6D4B]">
            We&apos;ve sent a 4-digit code to your registered email.
          </p>
        </div>

        <form onSubmit={handleVerify}>
          <div className="mb-4 flex justify-center gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value, e)}
                maxLength={1}
                className="h-14 w-14 rounded-xl border border-[#E3D3BA] bg-[#FBF6EE] text-center text-xl text-[#2D1F0E] outline-none focus:border-[#C8602A]"
              />
            ))}
          </div>

          <p className="mb-6 text-center text-sm text-[#8A6D4B]">
            OTP expires in{" "}
            <span className="font-semibold text-red-600">
              {Math.floor(timeLeft / 60)}:
              {(timeLeft % 60).toString().padStart(2, "0")}
            </span>
          </p>

          {error && (
            <p className="mb-4 text-center text-sm font-semibold text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-[#2D1F0E] py-4 text-lg font-semibold text-white transition hover:bg-[#2C1A0D] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Verifying..." : "Verify OTP"}
          </button>

          <p className="mt-6 text-center text-sm text-[#8A6D4B]">
            <Link href="/forgot-password" className="font-semibold text-[#C8602A]">
              Back
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
