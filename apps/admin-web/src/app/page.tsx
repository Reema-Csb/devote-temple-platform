"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Landmark } from "lucide-react";

const AUTH_SERVICE_URL =
  process.env.NEXT_PUBLIC_AUTH_SERVICE_URL ?? "http://127.0.0.1:3002";

const ADMIN_ROLES = new Set(["super_admin", "temple_admin"]);

type LoginResponse = {
  message?: string;
  token?: string;
  requires2FA?: boolean;
  userId?: string;
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    phone?: string;
    role: string;
    templeId?: string | null;
    userImage?: string | null;
  };
  error?: {
    message?: string;
  };
};

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      alert("Please enter your email and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${AUTH_SERVICE_URL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = (await response.json()) as LoginResponse;

      if (!response.ok) {
        throw new Error(
          data.error?.message ?? data.message ?? "Invalid email or password",
        );
      }

      if (data.requires2FA) {
        alert(
          "This account has two-factor authentication enabled. Admin portal 2FA verification is not implemented yet.",
        );
        return;
      }

      const user = data.user;

      if (!user?.id || !user.role) {
        throw new Error("User details are missing in the login response.");
      }

      if (!ADMIN_ROLES.has(user.role)) {
        throw new Error("You are not authorized to access the admin portal.");
      }

      sessionStorage.setItem("adminUser", JSON.stringify(user));
      sessionStorage.setItem("adminUserId", user.id);
      sessionStorage.setItem("adminRole", user.role);

      localStorage.setItem("currentUser", JSON.stringify(user));

      if (data.token) {
        sessionStorage.setItem("adminToken", data.token);
      }

      if (user.templeId) {
        sessionStorage.setItem("templeId", user.templeId);
      } else {
        sessionStorage.removeItem("templeId");
      }

      if (user.role === "temple_admin") {
        sessionStorage.setItem("templeAdminEmail", user.email);
      } else {
        sessionStorage.removeItem("templeAdminEmail");
      }

      router.push("/dashboard");
    } catch (error) {
      console.error("Admin login failed:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Unable to login. Please try again.",
      );
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

          <h1 className="text-4xl font-bold text-[#2D1F0E]">Devote Admin</h1>

          <p className="mt-2 text-[#8A6D4B]">Temple Management Portal</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="mb-5">
            <label className="mb-2 block font-semibold text-[#2D1F0E]">
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              autoComplete="email"
              required
              className="w-full rounded-xl border border-[#E3D3BA] bg-[#FBF6EE] px-5 py-4 text-[#2D1F0E] placeholder:text-[#B99F7D] outline-none focus:border-[#C8602A]"
            />
          </div>

          <div className="mb-8">
            <div className="mb-2 flex items-center justify-between">
              <label className="font-semibold text-[#2D1F0E]">Password</label>

              <Link
                href="/forgot-password"
                className="text-sm font-semibold text-[#C8602A] hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
                required
                className="w-full rounded-xl border border-[#E3D3BA] bg-[#FBF6EE] px-5 py-4 pr-14 text-[#2D1F0E] placeholder:text-[#B99F7D] outline-none focus:border-[#C8602A]"
              />

              <button
                type="button"
                onClick={() => setShowPassword((previous) => !previous)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9C7D58]"
              >
                {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-[#2D1F0E] py-4 text-lg font-semibold text-white transition hover:bg-[#2C1A0D] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Signing In..." : "Sign In to Admin"}
          </button>
        </form>
      </div>
    </main>
  );
}
