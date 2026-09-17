"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Landmark } from "lucide-react";

const AUTH_SERVICE_URL =
  process.env.NEXT_PUBLIC_AUTH_SERVICE_URL ?? "http://127.0.0.1:3002";

export default function AdminResetPasswordPage() {
  const router = useRouter();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!newPassword || !confirmPassword) {
      setError("Please fill in both fields.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const emailOrPhone = localStorage.getItem("adminResetUser");

    if (!emailOrPhone) {
      setError("Please request an OTP again.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${AUTH_SERVICE_URL}/users/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            emailOrPhone,
            newPassword,
            confirmPassword,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data?.error?.message ?? "Failed to reset password.");
        return;
      }

      localStorage.removeItem("adminResetUser");
      setSuccess(true);
      setTimeout(() => router.push("/"), 2000);
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
            Reset Password
          </h1>

          <p className="mt-2 text-center text-[#8A6D4B]">
            Create a new password for your admin account.
          </p>
        </div>

        {success ? (
          <p className="rounded-xl bg-[#EAF7EE] px-5 py-4 text-center font-semibold text-[#1E7A3C]">
            Password reset successful. Redirecting to login...
          </p>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div className="mb-5">
              <label className="mb-2 block font-semibold text-[#2D1F0E]">
                New Password
              </label>

              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter new password"
                  className="w-full rounded-xl border border-[#E3D3BA] bg-[#FBF6EE] px-5 py-4 pr-14 text-[#2D1F0E] placeholder:text-[#B99F7D] outline-none focus:border-[#C8602A]"
                />

                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9C7D58]"
                >
                  {showNewPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label className="mb-2 block font-semibold text-[#2D1F0E]">
                Confirm Password
              </label>

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Re-enter new password"
                  className="w-full rounded-xl border border-[#E3D3BA] bg-[#FBF6EE] px-5 py-4 pr-14 text-[#2D1F0E] placeholder:text-[#B99F7D] outline-none focus:border-[#C8602A]"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9C7D58]"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={22} />
                  ) : (
                    <Eye size={22} />
                  )}
                </button>
              </div>
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
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
