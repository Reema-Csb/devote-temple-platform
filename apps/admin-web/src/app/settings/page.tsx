"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/layout/AdminShell";
import { Camera } from "lucide-react";
import { DEFAULT_CURRENCY } from "@/constants/app";
import ProfileImageCropModal from "@/components/ProfileImageCropModal";

const AUTH_SERVICE_URL =
  process.env.NEXT_PUBLIC_AUTH_SERVICE_URL ?? "http://127.0.0.1:3002";

type AdminUser = {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  templeId?: string | null;
  userImage?: string | null;
};

export default function AdminSettingsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [croppedImage, setCroppedImage] = useState("");
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  useEffect(() => {
    async function loadAdminProfile() {
      try {
        const storedUser =
          localStorage.getItem("currentUser") ??
          sessionStorage.getItem("adminUser");

        const storedUserId = sessionStorage.getItem("adminUserId");

        const parsedUser: AdminUser | null = storedUser
          ? JSON.parse(storedUser)
          : null;

        const userId = parsedUser?.id ?? storedUserId;

        if (!userId) {
          console.warn("Admin user ID was not found");
          return;
        }

        const response = await fetch(`${AUTH_SERVICE_URL}/users/${userId}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load admin profile");
        }

        const user = (await response.json()) as AdminUser;

        setAdminUser(user);
        setProfileImage(user.userImage ?? "");

        sessionStorage.setItem("adminUser", JSON.stringify(user));
        sessionStorage.setItem("adminUserId", user.id);
        localStorage.setItem("currentUser", JSON.stringify(user));

        window.dispatchEvent(
          new CustomEvent("admin-profile-updated", {
            detail: user,
          }),
        );
      } catch (error) {
        console.error("Failed to load admin profile:", error);
      }
    }

    void loadAdminProfile();
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);
    e.target.value = "";
  };

  const handleSaveCrop = (image: string) => {
    setCroppedImage(image);
    setProfileImage(image);
    setSelectedImage(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSaveChanges = async () => {
    if (!adminUser?.id) {
      setSuccessMessage("Logged-in admin details were not found");
      return;
    }

    if (!croppedImage) {
      setSuccessMessage("No new profile image selected");

      window.setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

      return;
    }

    setIsSaving(true);

    try {
      const imageResponse = await fetch(croppedImage);
      const imageBlob = await imageResponse.blob();

      const formData = new FormData();

      // The auth-service controller expects the field name "file".
      formData.append("file", imageBlob, "profile-image.jpg");

      const uploadResponse = await fetch(
        `${AUTH_SERVICE_URL}/users/${adminUser.id}/profile-image`,
        {
          method: "POST",
          body: formData,
        },
      );

      const uploadResult = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(
          uploadResult?.error?.message ?? "Failed to upload profile image",
        );
      }

      // Upload API returns the S3 key. Call GET user to receive
      // the displayable presigned URL.
      const profileResponse = await fetch(
        `${AUTH_SERVICE_URL}/users/${adminUser.id}`,
        {
          cache: "no-store",
        },
      );

      if (!profileResponse.ok) {
        throw new Error("Image uploaded, but profile refresh failed");
      }

      const updatedUser = (await profileResponse.json()) as AdminUser;

      setAdminUser(updatedUser);
      setProfileImage(updatedUser.userImage ?? "");
      setCroppedImage("");

      sessionStorage.setItem("adminUser", JSON.stringify(updatedUser));
      sessionStorage.setItem("adminUserId", updatedUser.id);
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));

      window.dispatchEvent(
        new CustomEvent("admin-profile-updated", {
          detail: updatedUser,
        }),
      );

      setSuccessMessage("Profile image updated successfully");
    } catch (error) {
      console.error("Profile update failed:", error);

      setSuccessMessage(
        error instanceof Error ? error.message : "Failed to update profile",
      );
    } finally {
      setIsSaving(false);

      window.setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    }
  };

  const handleDeleteImage = async () => {
    if (!adminUser?.id) return;

    const confirmed = window.confirm(
      "Are you sure you want to remove the profile image?",
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${AUTH_SERVICE_URL}/users/${adminUser.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userImage: "",
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to remove profile image");
      }

      const updatedUser = {
        ...adminUser,
        userImage: "",
      };

      setAdminUser(updatedUser);
      setProfileImage("");
      setCroppedImage("");

      sessionStorage.setItem("adminUser", JSON.stringify(updatedUser));
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));

      window.dispatchEvent(
        new CustomEvent("admin-profile-updated", {
          detail: updatedUser,
        }),
      );

      setSuccessMessage("Profile image removed successfully");
    } catch (error) {
      console.error("Delete profile image failed:", error);
      setSuccessMessage("Failed to remove profile image");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      window.setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    }
  };
  return (
    <AdminShell>
      <main className="min-h-screen bg-[#f5efe6] p-6">
        <div className="mb-6">
          <h1 className="text-[28px] font-semibold text-[#2D1F0E]">Settings</h1>
          <p className="mt-1 text-sm text-[#8B7355]">
            Manage admin account and platform preferences.
          </p>
        </div>

        <div className="max-w-5xl overflow-hidden rounded-2xl border border-[#E5D5B5] bg-white shadow-sm">
          <section className="p-6">
            {successMessage && (
              <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-green-700">
                {successMessage}
              </div>
            )}
            <h2 className="mb-5 text-lg font-semibold text-[#2D1F0E]">
              Account Settings
            </h2>

            {/* Profile Image */}
            <div className="mb-8 flex items-center gap-5">
              <div className="relative h-24 w-24 overflow-hidden rounded-full border border-[#E5D5B5] bg-[#faf7f2]">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Admin profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl font-semibold text-[#c86428]">
                    A
                  </div>
                )}
              </div>

              <div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 rounded-full bg-[#c86428] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
                  >
                    <Camera size={16} />
                    Upload Profile Image
                  </button>

                  {profileImage && (
                    <button
                      type="button"
                      onClick={handleDeleteImage}
                      className="rounded-full border border-red-500 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      Delete Image
                    </button>
                  )}
                </div>

                <p className="mt-2 text-xs text-[#8B7355]">
                  JPG, PNG or WebP image supported.
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#5f4630]">
                  Admin Name
                </label>
                <input
                  value={
                    adminUser
                      ? `${adminUser.firstName ?? ""} ${adminUser.lastName ?? ""}`.trim()
                      : ""
                  }
                  readOnly
                  className="h-12 w-full rounded-xl border border-[#E5D5B5] bg-[#faf7f2] px-4 text-sm text-[#2D1F0E] outline-none focus:border-[#c86428]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#5f4630]">
                  Email Address
                </label>
                <input
                  value={adminUser?.email ?? ""}
                  readOnly
                  className="h-12 w-full rounded-xl border border-[#E5D5B5] bg-[#faf7f2] px-4 text-sm text-[#2D1F0E] outline-none focus:border-[#c86428]"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                router.push(
                  `/set-password?email=${encodeURIComponent(adminUser?.email ?? "")}`,
                )
              }
              className="mt-5 text-sm font-medium text-[#c86428] hover:underline"
            >
              Change Password
            </button>
          </section>

          <section className="border-t border-[#eee3d3] p-6">
            <h2 className="mb-4 text-lg font-semibold text-[#2D1F0E]">
              Notifications
            </h2>

            <div className="space-y-3">
              <label className="flex items-center gap-3 text-sm text-[#5f4630]">
                <input type="checkbox" defaultChecked className="h-4 w-4" />
                Email alerts for new temple registrations
              </label>

              <label className="flex items-center gap-3 text-sm text-[#5f4630]">
                <input type="checkbox" defaultChecked className="h-4 w-4" />
                Daily transaction summary email
              </label>

              <label className="flex items-center gap-3 text-sm text-[#5f4630]">
                <input type="checkbox" className="h-4 w-4" />
                Alert on failed transactions
              </label>
            </div>
          </section>

          <section className="border-t border-[#eee3d3] p-6">
            <h2 className="mb-5 text-lg font-semibold text-[#2D1F0E]">
              Payment Settings
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <select
                value={DEFAULT_CURRENCY}
                disabled
                className="h-12 w-full rounded-xl border border-[#e7d8c2] bg-[#faf7f2] px-4 text-sm text-[#2f1c0f]"
              >
                <option value={DEFAULT_CURRENCY}>{DEFAULT_CURRENCY} (₹)</option>
              </select>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#5f4630]">
                  GST Percentage
                </label>
                <input
                  defaultValue="0"
                  className="h-12 w-full rounded-xl border border-[#E5D5B5] bg-[#faf7f2] px-4 text-sm text-[#2D1F0E] outline-none focus:border-[#c86428]"
                />
              </div>
            </div>
          </section>
        </div>

        <div className="mt-8 flex max-w-5xl justify-end">
          <button
            type="button"
            onClick={handleSaveChanges}
            disabled={isSaving || !croppedImage}
            className="rounded-full bg-gradient-to-r from-[#d46d24] to-[#d89b10] px-8 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </main>

      {selectedImage && (
        <ProfileImageCropModal
          imageSrc={selectedImage}
          onCancel={() => setSelectedImage(null)}
          onSave={handleSaveCrop}
        />
      )}
    </AdminShell>
  );
}
