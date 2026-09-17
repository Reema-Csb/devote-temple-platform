"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Eye,
  EyeOff,
  Landmark,
  HandCoins,
  Lock,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const { t } = useLanguage();
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    agree: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (type !== "checkbox") {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    let isValid = true;

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
      isValid = false;
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
      isValid = false;
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
      isValid = false;
    } else if (!/^\d+$/.test(formData.phone)) {
      newErrors.phone = "Phone number must contain only digits";
      isValid = false;
    } else if (formData.phone.length < 10) {
      newErrors.phone = "Phone number must be at least 10 digits";
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
      isValid = false;
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Confirm password is required";
      isValid = false;
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleGoogleRegister = () => {
    alert("Google sign up will be connected later.");
  };

  const handleRegister = async () => {
    if (!formData.agree) {
      alert("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }

    const isValid = validateForm();
    if (!isValid) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_AUTH_SERVICE_URL}/users/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
            email: formData.email,
            password: formData.password,
            confirmPassword: formData.confirmPassword,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data?.error?.message || "Register failed";

        if (errorMessage.includes("Email")) {
          setErrors((prev) => ({
            ...prev,
            email: errorMessage,
          }));
        } else if (errorMessage.includes("Phone")) {
          setErrors((prev) => ({
            ...prev,
            phone: errorMessage,
          }));
        } else {
          alert(errorMessage);
        }

        return;
      }

      localStorage.setItem("devoteUser", JSON.stringify(data.user));

      alert("Register successful");
      router.push("/login");
    } catch (error) {
      console.error("Register error:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f4efe6] flex items-center justify-center px-6 py-8">
      <main className="w-full max-w-[920px]">
        <div className="w-full">
          <div className="bg-white rounded-[34px] overflow-hidden flex shadow-[0_15px_35px_rgba(60,35,10,0.14)]">
            {/* Left panel */}
            <div className="w-[42%] bg-gradient-to-b from-[#4d1d06] to-[#7b2b0a] text-white flex flex-col px-10 pt-10 pb-10">
              <div>
                <h2 className="text-[58px] leading-none font-serif italic">
                  {t.appName}
                </h2>

                <p className="mt-3 text-[17px] leading-[1.45] max-w-[280px]">
                  {t.beginJourney}
                </p>
              </div>

              <div className="mt-auto space-y-5">
                <FeatureItem
                  icon={<Landmark size={18} />}
                  title={t.templesText}
                  subtitle={t.templesSubText}
                />
                <FeatureItem
                  icon={<HandCoins size={18} />}
                  title={t.digitalSevas}
                  subtitle={t.digitalSevasSubText}
                />
                <FeatureItem
                  icon={<Lock size={18} />}
                  title={t.securePayments}
                  subtitle={t.securePaymentsSubText}
                />
              </div>
            </div>

            {/* Right panel */}
            <div className="w-[58%] bg-white px-10 pt-8 pb-7">
              <h3 className="text-center text-[24px] font-semibold text-[#1d140d]">
                {t.createAccount}
              </h3>

              {/* Google button */}
              <button
                onClick={handleGoogleRegister}
                className="mt-5 w-full h-[52px] rounded-[16px] border border-[#dfd4c3] bg-white flex items-center justify-center gap-3 text-[15px] font-medium text-[#1d140d]"
              >
                <span className="text-[24px] font-semibold text-[#4285F4]">
                  G
                </span>
                {t.signUpWithGoogle}
              </button>

              {/* Divider */}
              <div className="mt-5 mb-5 flex items-center">
                <div className="flex-1 h-px bg-[#dcccb0]" />
                <span className="px-5 text-[14px] text-[#9c7a50] font-medium">
                  {t.orText}
                </span>
                <div className="flex-1 h-px bg-[#dcccb0]" />
              </div>

              <div className="space-y-3">
                {/* First name + last name */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      name="firstName"
                      placeholder={t.firstName}
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full h-[50px] rounded-[14px] border border-[#cdbb9f] bg-[#e9dfcf] px-5 text-[15px] text-[#7d6746] placeholder:text-[#9d8460] outline-none"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-[12px] text-red-500">
                        {errors.firstName}
                      </p>
                    )}
                  </div>

                  <div>
                    <input
                      type="text"
                      name="lastName"
                      placeholder={t.lastName}
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full h-[50px] rounded-[14px] border border-[#cdbb9f] bg-[#e9dfcf] px-5 text-[15px] text-[#7d6746] placeholder:text-[#9d8460] outline-none"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-[12px] text-red-500">
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <input
                    type="text"
                    name="phone"
                    placeholder={t.phone}
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full h-[50px] rounded-[14px] border border-[#cdbb9f] bg-[#e9dfcf] px-5 text-[15px] text-[#7d6746] placeholder:text-[#9d8460] outline-none"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-[12px] text-red-500">
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder={t.emailAddress}
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full h-[50px] rounded-[14px] border border-[#cdbb9f] bg-[#e9dfcf] px-5 text-[15px] text-[#7d6746] placeholder:text-[#9d8460] outline-none"
                  />
                  {errors.email && (
                    <p className="mt-1 text-[12px] text-red-500">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password + confirm password */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder={t.password}
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full h-[50px] rounded-[14px] border border-[#cdbb9f] bg-[#e9dfcf] px-5 pr-10 text-[15px] text-[#7d6746] placeholder:text-[#9d8460] outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a2855d]"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-[12px] text-red-500">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder={t.confirmPassword}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full h-[50px] rounded-[14px] border border-[#cdbb9f] bg-[#e9dfcf] px-5 pr-10 text-[15px] text-[#7d6746] placeholder:text-[#9d8460] outline-none"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a2855d]"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-[12px] text-red-500">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                {/* Checkbox */}
                <label className="flex items-start gap-3 text-[14px] text-[#6b5a43]">
                  <input
                    type="checkbox"
                    name="agree"
                    checked={formData.agree}
                    onChange={handleChange}
                    className="mt-1 h-5 w-5 accent-[#d66a2d]"
                  />
                  <span>
                    {t.agreeText}{" "}
                    <Link
                      href="/terms-privacy"
                      className="text-[#d66a2d] font-medium"
                    >
                      {t.termsOfService}
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/terms-privacy"
                      className="text-[#d66a2d] font-medium"
                    >
                      {t.privacyPolicy}
                    </Link>
                  </span>
                </label>

                {/* Register button */}
                <button
                  onClick={handleRegister}
                  className="w-full h-[52px] rounded-[14px] bg-gradient-to-r from-[#d66a2d] to-[#dfa20a] text-white text-[15px] font-semibold shadow-sm"
                >
                  {t.createAccountBtn}
                </button>

                {/* Login link */}
                <p className="text-center text-[14px] text-[#2c1d12]">
                  {t.alreadyHaveAccount}{" "}
                  <Link href="/login" className="text-[#e06b1c] font-semibold">
                    {t.loginBtn}
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

function FeatureItem({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-11 w-11 rounded-xl bg-white/10 flex items-center justify-center text-[#f4c98a] shrink-0">
        {icon}
      </div>

      <div>
        <p className="text-[15px] font-semibold">{title}</p>
        <p className="text-[12px] text-white/90">{subtitle}</p>
      </div>
    </div>
  );
}
