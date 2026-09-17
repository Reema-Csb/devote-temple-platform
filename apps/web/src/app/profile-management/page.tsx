"use client";

import { useState, useEffect, useCallback } from "react";
import AppShell from "@/components/layout/AppShell";
import { useLanguage } from "@/context/LanguageContext";
import { Camera } from "lucide-react";
import Cropper from "react-easy-crop";

const AUTH_URL =
  process.env.NEXT_PUBLIC_AUTH_SERVICE_URL ?? "http://127.0.0.1:3006";

const API_GATEWAY_URL =
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ?? "http://127.0.0.1:3005";

function getInitials(firstName: string, lastName: string) {
  const f = firstName.trim();
  const l = lastName.trim();
  if (!f && !l) return "?";
  if (!l) return f[0].toUpperCase();
  return (f[0] + l[0]).toUpperCase();
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", reject);
    image.src = url;
  });
}

async function getCroppedImageFile(
  imageSrc: string,
  crop: { x: number; y: number; width: number; height: number },
): Promise<File> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("Canvas not supported");

  canvas.width = crop.width;
  canvas.height = crop.height;

  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    crop.width,
    crop.height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Failed to crop image"));
        return;
      }

      resolve(new File([blob], "profile-image.jpg", { type: "image/jpeg" }));
    }, "image/jpeg");
  });
}

export default function ProfileManagementPage() {
  const { t } = useLanguage();

  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dob: "",
    address: "",
  });

  const [profileImage, setProfileImage] = useState("");
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedImageForCrop, setSelectedImageForCrop] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("devoteUser");
    if (!stored) {
      setLoading(false);
      return;
    }

    const parsed = JSON.parse(stored);
    const id = parsed.id;
    setUserId(id);

    Promise.all([
      fetch(`${AUTH_URL}/users/${id}`).then((r) => (r.ok ? r.json() : null)),
      fetch(`${AUTH_URL}/users/${id}/address`).then((r) =>
        r.ok ? r.json() : null,
      ),
    ])
      .then(async ([user, addr]) => {
        if (user?.userImage) {
          const signedUrl = await getPresignedImageUrl(user.userImage);
          setProfileImage(signedUrl);
        }

        setFormData({
          firstName: user?.firstName ?? parsed.firstName ?? "",
          lastName: user?.lastName ?? parsed.lastName ?? "",
          email: user?.email ?? parsed.email ?? "",
          phone: user?.phone ?? parsed.phone ?? "",
          dob: user?.dob ? user.dob.slice(0, 10) : (parsed.dob ?? ""),
          address: addr?.address ?? parsed.address ?? "",
        });
      })
      .catch(() => {
        setFormData({
          firstName: parsed.firstName ?? "",
          lastName: parsed.lastName ?? "",
          email: parsed.email ?? "",
          phone: parsed.phone ?? "",
          dob: parsed.dob ?? "",
          address: parsed.address ?? "",
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  async function uploadProfileImage(file: File) {
    if (!API_GATEWAY_URL) {
      throw new Error("NEXT_PUBLIC_API_GATEWAY_URL is missing");
    }

    const formData = new FormData();
    formData.append("files", file);
    formData.append("folder", "users");

    const response = await fetch(`${API_GATEWAY_URL}/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload profile image");
    }

    const data = await response.json();

    return data.keys?.[0] ?? "";
  }

  async function getPresignedImageUrl(key: string) {
    if (!key) return "";

    if (key.startsWith("http") || key.startsWith("blob:")) {
      return key;
    }

    const response = await fetch(
      `${API_GATEWAY_URL}/upload/presigned-url?key=${encodeURIComponent(key)}`,
    );

    if (!response.ok) return "";

    const data = await response.json();

    return data.url ?? "";
  }

  const onCropComplete = useCallback(
    (
      _croppedArea: unknown,
      croppedAreaPixelsValue: {
        x: number;
        y: number;
        width: number;
        height: number;
      },
    ) => {
      setCroppedAreaPixels(croppedAreaPixelsValue);
    },
    [],
  );

  function handleProfileImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    const imageUrl = URL.createObjectURL(file);

    setSelectedImageForCrop(imageUrl);
    setCropModalOpen(true);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  }

  const handleRemoveImage = () => {
    setProfileImage("");
    setProfileImageFile(null);
    setSelectedImageForCrop("");
    setCroppedAreaPixels(null);

    const stored = localStorage.getItem("devoteUser");

    if (stored) {
      const parsed = JSON.parse(stored);

      localStorage.setItem(
        "devoteUser",
        JSON.stringify({
          ...parsed,
          userImage: "",
        }),
      );
    }

    window.dispatchEvent(new Event("profileUpdated"));

    setMessage({
      type: "success",
      text: "Profile photo removed. Click Save Changes to apply.",
    });
  };

  const handleSave = async () => {
    if (!userId) {
      setMessage({
        type: "error",
        text: "No user session found. Please log in again.",
      });
      return;
    }

    setSaving(true);
    setMessage(null);

    let uploadedProfileImage = "";

    const stored = localStorage.getItem("devoteUser");
    const parsedUser = stored ? JSON.parse(stored) : {};

    uploadedProfileImage = parsedUser.userImage ?? "";
    if (profileImageFile) {
      uploadedProfileImage = await uploadProfileImage(profileImageFile);
    }

    const payload: Record<string, string> = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email,
      phone: formData.phone,
      userImage: uploadedProfileImage,
    };
    if (formData.dob) payload.dob = new Date(formData.dob).toISOString();

    try {
      const [userRes, addrRes] = await Promise.all([
        fetch(`${AUTH_URL}/users/${userId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }),
        formData.address.trim()
          ? fetch(`${AUTH_URL}/users/${userId}/address`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ address: formData.address.trim() }),
            })
          : Promise.resolve({ ok: true } as Response),
      ]);

      if (!userRes.ok) {
        const errBody = await userRes.text();
        throw new Error(`${userRes.status}: ${errBody}`);
      }
      if (!addrRes.ok) {
        const errBody = await addrRes.text();
        throw new Error(`Address save failed ${addrRes.status}: ${errBody}`);
      }

      const stored = localStorage.getItem("devoteUser");
      const parsed = stored ? JSON.parse(stored) : {};
      localStorage.setItem(
        "devoteUser",
        JSON.stringify({
          ...parsed,
          ...payload,
          userImage: uploadedProfileImage,
          displayName: [formData.firstName, formData.lastName]
            .filter(Boolean)
            .join(" "),
          address: formData.address,
        }),
      );

      window.dispatchEvent(new Event("profileUpdated"));
      setMessage({ type: "success", text: "Profile updated successfully" });
    } catch (err) {
      setMessage({
        type: "error",
        text: `Failed to save: ${err instanceof Error ? err.message : "Unknown error"}`,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppShell title="Profile Management">
        <div className="flex items-center justify-center min-h-screen bg-[#f4efe6]">
          <p className="text-[#9c7a50]">Loading profile...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Profile Management">
      <div className="px-8 py-8 bg-[#f4efe6] min-h-screen">
        <div className="max-w-[680px] mx-auto bg-white rounded-[24px] shadow-sm border border-[#ede3d4] overflow-hidden">
          {/* Profile Photo Section */}
          <div className="px-10 py-8 flex items-center gap-6">
            <div className="relative shrink-0">
              <div className="w-[80px] h-[80px] rounded-full bg-[#c97028] flex items-center justify-center text-white text-[26px] font-bold select-none overflow-hidden">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  getInitials(formData.firstName, formData.lastName)
                )}
              </div>

              <label className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-white border border-[#ddd] flex items-center justify-center shadow-sm cursor-pointer">
                <Camera size={13} className="text-[#6b5240]" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfileImageChange}
                />
              </label>
            </div>

            <div className="flex-1">
              <h2 className="text-[17px] font-semibold text-[#1d140d]">
                Profile Photo
              </h2>

              <p className="text-[13px] text-[#9c7a50] mt-1">
                Upload a new avatar. Large image will be resized automatically.
              </p>

              {profileImage && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="mt-3 text-sm font-medium text-red-600 hover:text-red-700"
                >
                  Remove Photo
                </button>
              )}
            </div>
          </div>

          <hr className="border-[#ede3d4]" />

          {/* Form */}
          <div className="px-10 py-8">
            {message && (
              <div
                className={`mb-6 px-4 py-3 rounded-xl text-sm font-medium ${
                  message.type === "success"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              <Field
                label="FIRST NAME"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
              />

              <Field
                label="LAST NAME"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
              />

              <Field
                label="EMAIL ADDRESS"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />

              <Field
                label="PHONE NUMBER"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />

              <Field
                label="DATE OF BIRTH"
                name="dob"
                type="date"
                value={formData.dob}
                onChange={handleChange}
              />
            </div>

            <div className="mt-5">
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-[#9c7a50] mb-2">
                ADDRESS
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-[#f5ede0] text-[#3d2b1f] text-[14px] outline-none resize-none border border-transparent focus:border-[#c97028] transition"
              />
            </div>

            <div className="flex justify-end items-center gap-3 mt-7">
              <button
                onClick={() => setMessage(null)}
                className="px-7 py-[9px] rounded-full border border-[#d4c4a8] bg-white text-[#6b5240] text-[14px] font-medium hover:bg-[#fdf8f2] transition"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="px-7 py-[9px] rounded-full bg-[#c97028] text-white text-[14px] font-semibold hover:bg-[#b5611f] transition disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
      {cropModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5">
            <h3 className="mb-4 text-lg font-semibold text-[#1d140d]">
              Crop Profile Image
            </h3>

            <div className="relative h-[320px] w-full overflow-hidden rounded-xl bg-black">
              <Cropper
                image={selectedImageForCrop}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium text-[#6b5240]">
                Zoom
              </label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setCropModalOpen(false);
                  setSelectedImageForCrop("");
                }}
                className="rounded-full border border-[#d4c4a8] px-5 py-2 text-sm text-[#6b5240]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={async () => {
                  if (!selectedImageForCrop || !croppedAreaPixels) return;

                  const croppedFile = await getCroppedImageFile(
                    selectedImageForCrop,
                    croppedAreaPixels,
                  );

                  setProfileImageFile(croppedFile);
                  setProfileImage(URL.createObjectURL(croppedFile));
                  setCropModalOpen(false);
                  setSelectedImageForCrop("");
                }}
                className="rounded-full bg-[#c97028] px-5 py-2 text-sm font-semibold text-white"
              >
                Save Crop
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  name: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-widest text-[#9c7a50] mb-2">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 rounded-xl bg-[#f5ede0] text-[#3d2b1f] text-[14px] outline-none border border-transparent focus:border-[#c97028] transition"
      />
    </div>
  );
}
