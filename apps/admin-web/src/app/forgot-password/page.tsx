"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Landmark } from "lucide-react";

const AUTH_SERVICE_URL =
  process.env.NEXT_PUBLIC_AUTH_SERVICE_URL ?? "http://127.0.0.1:3002";

export default function AdminForgotPasswordPage() {
  const router = useRouter();

  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!emailOrPhone.trim()) {
      setError("Email or phone number is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${AUTH_SERVICE_URL}/users/admin/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ emailOrPhone: emailOrPhone.trim() }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data?.error?.message ?? "Failed to send OTP.");
        return;
      }

      localStorage.setItem("adminResetUser", emailOrPhone.trim());
      router.push("/otp-verification");
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

          <h1 className="text-3xl font-bold text-[#2D1F0E]">
            Forgot Password
          </h1>

          <p className="mt-2 text-center text-[#8A6D4B]">
            Enter your admin email or phone number and we&apos;ll send you an
            OTP to reset your password.
          </p>
        </div>

        <form onSubmit={handleSendOtp}>
          <div className="mb-6">
            <label className="mb-2 block font-semibold text-[#2D1F0E]">
              Email or Phone
            </label>

            <input
              type="text"
              value={emailOrPhone}
              onChange={(e) => {
                setEmailOrPhone(e.target.value);
                setError("");
              }}
              placeholder="Enter your email or phone"
              autoComplete="username"
              required
              className="w-full rounded-xl border border-[#E3D3BA] bg-[#FBF6EE] px-5 py-4 text-[#2D1F0E] placeholder:text-[#B99F7D] outline-none focus:border-[#C8602A]"
            />
          </div>

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
            {isSubmitting ? "Sending OTP..." : "Send OTP"}
          </button>

          <p className="mt-6 text-center text-sm text-[#8A6D4B]">
            Remembered your password?{" "}
            <Link href="/" className="font-semibold text-[#C8602A]">
              Back to login
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
