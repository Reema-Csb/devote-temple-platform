"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, ShieldCheck, User } from "lucide-react";

const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL ?? "http://127.0.0.1:3006";

export default function TwoFAVerifyPage() {
  const router = useRouter();
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Guard: if no pending 2FA session, send back to login
    if (!sessionStorage.getItem("pending2FAUserId")) {
      router.replace("/login");
    }
    inputRefs.current[0]?.focus();
  }, [router]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const updated = [...digits];
    updated[index] = value.slice(-1);
    setDigits(updated);
    if (error) setError("");
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const updated = Array(6).fill("");
    pasted.split("").forEach((ch, i) => { updated[i] = ch; });
    setDigits(updated);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerify = async () => {
    const code = digits.join("");
    if (code.length !== 6) {
      setError("Please enter all 6 digits.");
      return;
    }

    const userId = sessionStorage.getItem("pending2FAUserId");
    if (!userId) {
      router.replace("/login");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${AUTH_URL}/users/login/verify-2fa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, token: code }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error?.message ?? "Invalid code. Please try again.");
        setDigits(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        return;
      }

      sessionStorage.removeItem("pending2FAUserId");
      localStorage.setItem("token", data.token);
      localStorage.setItem("sessionId", data.sessionId ?? "");
      localStorage.setItem("devoteUser", JSON.stringify(data.user));

      router.push("/home");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4efe6] overflow-x-hidden">
      {/* Header */}
      <header className="h-[86px] bg-white border-b border-[#e5d9c5] flex items-center justify-between px-10">
        <div className="flex items-center gap-6">
          <button className="text-[#9c7a50]">
            <Menu size={30} />
          </button>
          <h1 className="text-[20px] font-semibold text-[#1d140d]">
            Two-Factor Verification
          </h1>
        </div>

        <div className="flex items-center">
          <Link
            href="/login"
            className="h-[54px] px-8 rounded-full border-2 border-[#ccb28a] text-[#9c7a50] text-[14px] font-medium bg-white flex items-center justify-center"
          >
            Back to Login
          </Link>
          <div className="h-[56px] w-px bg-[#dec8a5] mx-7" />
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[14px] font-semibold text-[#1d140d] leading-none">Devotee</p>
              <p className="text-[12px] text-[#9c7a50] mt-1">User</p>
            </div>
            <div className="h-[50px] w-[50px] rounded-full bg-[#d98b12] flex items-center justify-center text-white">
              <User size={22} />
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="px-6 py-7 bg-[#f4efe6]">
        <div className="max-w-[1110px] mx-auto">
          <div className="bg-white rounded-[34px] overflow-hidden border border-[#eadfcd] flex min-h-[680px]">

            {/* Left Panel */}
            <div className="w-[50%] bg-gradient-to-b from-[#4c1b05] to-[#7b2b0a] text-white flex flex-col px-12 pt-14 pb-12">
              <div>
                <h2 className="text-[72px] leading-none font-serif italic">Devote</h2>
                <p className="mt-5 text-[19px] leading-[1.45] max-w-[360px]">
                  Your account is protected with two-factor authentication.
                </p>
              </div>
              <div className="mt-auto">
                <p className="text-[16px] italic leading-[1.5] max-w-[420px] text-white/95">
                  Open Google Authenticator and enter the 6-digit code shown for Devote.
                </p>
              </div>
            </div>

            {/* Right Panel */}
            <div className="w-[50%] bg-white px-14 pt-14 pb-10 flex flex-col items-center">

              <div className="w-[72px] h-[72px] rounded-full bg-[#fef0e6] flex items-center justify-center mb-6">
                <ShieldCheck size={36} className="text-[#e06b1c]" />
              </div>

              <h3 className="text-center text-[28px] font-semibold text-[#1d140d] mb-2">
                Authenticator Code
              </h3>
              <p className="text-center text-[15px] text-[#9c7a50] mb-10 max-w-[320px]">
                Enter the 6-digit code from your Google Authenticator app to complete sign-in.
              </p>

              {/* 6-digit boxes */}
              <div className="flex gap-3 mb-6" onPaste={handlePaste}>
                {digits.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="w-[52px] h-[62px] rounded-[14px] bg-[#e9dfcf] text-center text-[22px] font-bold text-[#1d140d] outline-none focus:ring-2 focus:ring-[#e06b1c] transition-all"
                  />
                ))}
              </div>

              {error && (
                <p className="text-[13px] text-red-500 mb-4">{error}</p>
              )}

              <button
                onClick={handleVerify}
                disabled={loading || digits.join("").length !== 6}
                className="w-full max-w-[340px] h-[58px] rounded-[16px] bg-gradient-to-r from-[#d66a2d] to-[#dfa20a] text-white text-[16px] font-semibold shadow-sm disabled:opacity-50 transition-opacity"
              >
                {loading ? "Verifying…" : "Verify & Sign In"}
              </button>

              <p className="mt-6 text-center text-[14px] text-[#9c7a50]">
                Lost access to your authenticator?{" "}
                <Link href="/login" className="text-[#e06b1c] font-semibold">
                  Go back to login
                </Link>
              </p>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
