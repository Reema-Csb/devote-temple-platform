"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [userName, setUserName] = useState("Ganesh Kumar");

  useEffect(() => {
    const saved = localStorage.getItem("devoteUser");
    const parsed = saved ? JSON.parse(saved) : null;
    const name =
      parsed?.displayName ||
      [parsed?.firstName, parsed?.lastName].filter(Boolean).join(" ");
    if (name) setUserName(name);
  }, []);

  const [errors, setErrors] = useState({
    phone: "",
    password: "",
  });

  const validateForm = () => {
    const newErrors = {
      phone: "",
      password: "",
    };

    let isValid = true;

    if (!phone.trim()) {
      newErrors.phone = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(phone)) {
      newErrors.phone = "Enter a valid email address";
      isValid = false;
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleGoogleLogin = () => {
    alert("Google login will be connected later.");
  };

  const handleLogin = async () => {
    const isValid = validateForm();

    if (!isValid) return;

    console.log("Email:", phone);
    console.log("Password:", password);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_AUTH_SERVICE_URL}/users/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: phone,
            password: password,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data?.error?.message || "Invalid email or password");
        return;
      }

      // User has 2FA enabled — redirect to verification step
      if (data.requires2FA) {
        sessionStorage.setItem("pending2FAUserId", data.userId);
        router.push("/2fa-verify");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("sessionId", data.sessionId ?? "");
      localStorage.setItem("devoteUser", JSON.stringify(data.user));

      router.push("/home");
    } catch (error) {
      console.error("Login error:", error);
      alert("Something went wrong. Please try again.");
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

              <p className="mt-4 text-[17px] leading-[1.45] max-w-[320px]">
                {t.leftPanelText}
              </p>
            </div>

            <div className="mt-auto">
              <p className="text-[14px] italic leading-[1.5] max-w-[320px] text-white/95">
                {t.blessingQuote}
              </p>
            </div>
          </div>

          {/* Right Panel */}
          <div className="w-[50%] bg-white px-14 pt-12 pb-10 flex flex-col justify-center">
            <h3 className="text-center text-[28px] font-semibold text-[#1d140d]">
              {t.login}
            </h3>

            {/* Google */}
            <button
              onClick={handleGoogleLogin}
              className="mt-6 w-full h-[58px] rounded-[16px] border border-[#dfd4c3] bg-white flex items-center justify-center gap-3 text-[16px] font-medium text-[#1d140d]"
            >
              <span className="text-[28px] font-semibold text-[#4285F4]">
                G
              </span>
              {t.continueWithGoogle}
            </button>

            {/* Divider */}
            <div className="mt-6 mb-6 flex items-center">
              <div className="flex-1 h-px bg-[#dcccb0]" />
              <span className="px-5 text-[14px] font-medium text-[#9c7a50]">
                {t.orText}
              </span>
              <div className="flex-1 h-px bg-[#dcccb0]" />
            </div>

            <div className="space-y-4">
              {/* Phone */}
              <div>
                <input
                  type="text"
                  placeholder="Email Address"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errors.phone) {
                      setErrors((prev) => ({ ...prev, phone: "" }));
                    }
                  }}
                  className="w-full h-[58px] rounded-[16px] bg-[#e9dfcf] px-5 text-[16px] text-[#7d6746] placeholder:text-[#9d8460] outline-none"
                />
                {errors.phone && (
                  <p className="mt-2 text-[13px] text-red-500">
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder={t.password}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) {
                        setErrors((prev) => ({
                          ...prev,
                          password: "",
                        }));
                      }
                    }}
                    className="w-full h-[58px] rounded-[16px] bg-[#e9dfcf] px-5 pr-14 text-[16px] text-[#7d6746] placeholder:text-[#9d8460] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a2855d]"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-[13px] text-red-500">
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-[14px] font-medium text-[#e06b1c]"
                >
                  {t.forgetPassword}
                </Link>
              </div>

              <button
                onClick={handleLogin}
                className="w-full h-[58px] rounded-[16px] bg-gradient-to-r from-[#d66a2d] to-[#dfa20a] text-white text-[16px] font-semibold shadow-sm"
              >
                {t.loginBtn}
              </button>

              <p className="text-center text-[15px] text-[#2c1d12] pt-2">
                {t.dontHaveAccount}{" "}
                <Link href="/register" className="text-[#e06b1c] font-semibold">
                  {t.register}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
