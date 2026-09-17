"use client";

import {
  districtOptionsByState,
  locationOptions,
  postalCodeSuggestionsByStateDistrict,
  statePostalCodeFallbacks,
} from "@/data/location-options";
import {
  Gift,
  ImageIcon,
  Landmark,
  MapPin,
  Plus,
  Trash2,
  ArrowLeft,
  ChevronDown,
  Check,
  Search,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import AdminShell from "@/components/layout/AdminShell";

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL;

async function getPresignedImageUrl(image?: string) {
  if (!image) return "";

  if (
    image.startsWith("http") ||
    image.startsWith("blob:") ||
    image.startsWith("/")
  ) {
    return image;
  }

  if (!API_GATEWAY_URL) return "";

  const response = await fetch(
    `${API_GATEWAY_URL}/upload/presigned-url?key=${encodeURIComponent(image)}`,
  );

  if (!response.ok) return "";

  const data = await response.json();
  return data.url ?? "";
}

const API_URL =
  process.env.NEXT_PUBLIC_TEMPLE_API_URL ?? "http://127.0.0.1:3001";

const AUTH_SERVICE_URL = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const offeringCategories = [
  "Health",
  "Wealth",
  "Marriage",
  "Studies",
  "Protection",
  "Peace",
  "Removing Obstacles",
  "Business",
  "Family",
  "Devotion",
];
const donationOptions = [
  {
    name: "Annadhanam",
    description: "Food offering",
  },
  {
    name: "Deepam",
    description: "Lighting lamps",
  },
  {
    name: "Goseva",
    description: "Cow care",
  },
  {
    name: "Temple Maintenance",
    description: "Temple upkeep",
  },
  {
    name: "General Donation",
    description: "Temple support",
  },
];

type OfferingForm = {
  id?: string;
  name: string;
  description: string;
  price: string;
  currency: string;
  archana: boolean;
  isActive: boolean;
  categories: string[];
  donationTypes: string[];
};

const createEmptyOffering = (): OfferingForm => ({
  name: "",
  description: "",
  price: "",
  currency: "INR",
  archana: false,
  isActive: true,
  categories: [],
  donationTypes: [],
});

const UPLOAD_API_URL =
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ?? "http://127.0.0.1:3005";

async function uploadTempleImages(files: File[]) {
  if (!files.length) return [];

  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await fetch(`${UPLOAD_API_URL}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload temple images");
  }

  const data = await response.json();

  return Array.isArray(data.keys) ? data.keys : [];
}

function getPreviewImageUrl(image: string) {
  if (!image) return "/placeholder-temple.jpg";

  if (
    image.startsWith("http") ||
    image.startsWith("blob:") ||
    image.startsWith("/")
  ) {
    return image;
  }

  return `https://s3.amazonaws.com/devotee-app-assets/${image}`;
}

export default function AddTemplePage() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    deity: "",
    adminEmail: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    country: "India",
    postal_code: "",
    isActive: true,
  });

  const [bankDetails, setBankDetails] = useState({
    beneficiaryName: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifscCode: "",
    accountType: "Savings",
    panNumber: "",
    gstin: "",
    payoutSchedule: "Daily",
  });

  const [offerings, setOfferings] = useState<OfferingForm[]>([
    createEmptyOffering(),
  ]);

  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  const [selectedDonationTypes, setSelectedDonationTypes] = useState<string[]>(
    [],
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [openOfferingTypeIndex, setOpenOfferingTypeIndex] = useState<
    number | null
  >(null);

  const [stateSearch, setStateSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");

  const stateDropdownRef = useRef<HTMLDivElement>(null);
  const cityDropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const params = useParams();

  const searchParams = useSearchParams();

  const templeId = searchParams.get("id");

  const isEditMode = Boolean(templeId);
  const stateOptions = locationOptions[formData.country] ?? [];

  const filteredStates = stateOptions.filter((state) =>
    state.toLowerCase().includes(stateSearch.toLowerCase()),
  );

  const cityOptions = districtOptionsByState[formData.state] ?? [];

  const filteredCities = cityOptions.filter((city) =>
    city.toLowerCase().includes(citySearch.toLowerCase()),
  );
  useEffect(() => {
    if (!templeId) return;

    const fetchTemple = async () => {
      try {
        const templeResponse = await fetch(`${API_URL}/temples/${templeId}`);

        if (!templeResponse.ok) {
          throw new Error("Failed to fetch temple");
        }

        const temple = await templeResponse.json();

        const locationResponse = await fetch(
          `${API_URL}/temple-locations?filter[where][templeId]=${templeId}`,
        );

        const locations = locationResponse.ok
          ? await locationResponse.json()
          : [];

        const location = Array.isArray(locations) ? locations[0] : null;

        setFormData({
          name: temple.name || "",
          description: temple.description || "",
          deity: temple.deity || "",
          adminEmail: "",
          address_line1: location?.addressLine1 || "",
          address_line2: location?.addressLine2 || "",
          city: location?.city || "",
          state: location?.state || "",
          country: location?.country || "India",
          postal_code: location?.postalCode || "",
          isActive: temple.isActive ?? true,
        });

        const imageResponse = await fetch(
          `${API_URL}/temple-images?filter[where][templeId]=${templeId}`,
        );

        const imageData = imageResponse.ok ? await imageResponse.json() : [];

        const templeImageUrls = Array.isArray(imageData)
          ? imageData.map((item: any) => item.imageUrl).filter(Boolean)
          : [];

        const existingImages = [
          ...(Array.isArray(temple.imageUrls) ? temple.imageUrls : []),
          ...(temple.imageUrl ? [temple.imageUrl] : []),
          ...templeImageUrls,
        ].filter(Boolean);

        const signedPreviews = await Promise.all(
          [...new Set(existingImages)].map((image) =>
            getPresignedImageUrl(String(image)),
          ),
        );

        setPhotoPreviews(signedPreviews.filter(Boolean));

        const offeringsResponse = await fetch(
          `${API_URL}/temple-offerings?filter[where][templeId]=${templeId}`,
        );

        const offeringsData = offeringsResponse.ok
          ? await offeringsResponse.json()
          : [];

        const formattedOfferings = Array.isArray(offeringsData)
          ? offeringsData.map((offering: any) => ({
              id: offering.id,
              name: offering.name || "",
              description: offering.description || "",
              price: String(offering.price || ""),
              currency: offering.currency || "INR",
              archana: offering.archana ?? true,
              isActive: offering.isActive ?? true,
              categories: [],
              donationTypes: [],
            }))
          : [];

        const donationOfferings = formattedOfferings.filter(
          (offering: any) => offering.archana === false,
        );

        const archanaOfferings = formattedOfferings.filter(
          (offering: any) => offering.archana === true,
        );

        setSelectedDonationTypes(
          donationOfferings.map((offering: any) => offering.name),
        );

        setOfferings(
          archanaOfferings.length > 0
            ? archanaOfferings
            : [createEmptyOffering()],
        );
      } catch (error) {
        console.error(error);
        alert("Failed to load temple");
      }
    };

    fetchTemple();
  }, [templeId]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        stateDropdownRef.current &&
        !stateDropdownRef.current.contains(target)
      ) {
        setIsStateDropdownOpen(false);
      }

      if (
        cityDropdownRef.current &&
        !cityDropdownRef.current.contains(target)
      ) {
        setIsCityDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const toggleDonationType = (type: string) => {
    setSelectedDonationTypes((prev) =>
      prev.includes(type)
        ? prev.filter((item) => item !== type)
        : [...prev, type],
    );
  };

  const inputClass =
    "h-12 w-full rounded-xl border border-[#d6b982] bg-white px-4 text-sm text-[#2d1606] outline-none placeholder:text-[#b9aa95] focus:border-[#c8651d]";
  const labelClass = "mb-2 block text-sm font-semibold text-[#2d1606]";
  const errorClass = "mt-1 text-xs font-semibold text-red-600";
  const requiredStar = <span className="ml-1 text-red-600">*</span>;

  const getInputClass = (field: string) =>
    `${inputClass} ${fieldErrors[field] ? "border-red-500 bg-red-50" : ""}`;
  const sectionClass =
    "rounded-2xl border border-[#d8a950] bg-[#fffaf2] p-6 shadow-sm";
  const cardClass =
    "rounded-xl border border-[#d8a950] bg-[#f8efe2] p-5 shadow-sm";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleBankChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    let newValue = value;

    if (name === "accountNumber" || name === "confirmAccountNumber") {
      newValue = value.replace(/\D/g, "");
    }

    setBankDetails((prev) => {
      const updated = {
        ...prev,
        [name]: newValue,
      };

      if (
        updated.confirmAccountNumber &&
        updated.accountNumber !== updated.confirmAccountNumber
      ) {
        setFieldErrors((errors) => ({
          ...errors,
          confirmAccountNumber: "Account numbers do not match.",
        }));
      } else {
        setFieldErrors((errors) => ({
          ...errors,
          accountNumber: "",
          confirmAccountNumber: "",
        }));
      }

      return updated;
    });
  };

  const handleLocationChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    setFieldErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setFormData((prev) => {
      if (name === "state") {
        return {
          ...prev,
          state: value,
          city: "",
          postal_code: statePostalCodeFallbacks[value] ?? "",
        };
      }

      if (name === "city") {
        return {
          ...prev,
          city: value,
          postal_code:
            postalCodeSuggestionsByStateDistrict[prev.state]?.[value] ??
            statePostalCodeFallbacks[prev.state] ??
            "",
        };
      }

      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleOfferingChange = (
    index: number,
    field: keyof OfferingForm,
    value: string | string[] | boolean,
  ) => {
    setOfferings((prev) =>
      prev.map((offering, i) =>
        i === index ? { ...offering, [field]: value } : offering,
      ),
    );
  };

  const toggleCategory = (offeringIndex: number, category: string) => {
    setOfferings((prev) =>
      prev.map((offering, index) => {
        if (index !== offeringIndex) return offering;

        return {
          ...offering,
          categories: offering.categories.includes(category)
            ? offering.categories.filter((item) => item !== category)
            : [...offering.categories, category],
        };
      }),
    );
  };

  const addOffering = () => {
    setOfferings((prev) => [...prev, createEmptyOffering()]);
  };

  const removeOffering = (index: number) => {
    setOfferings((prev) =>
      prev.length > 1
        ? prev.filter((_, offeringIndex) => offeringIndex !== index)
        : [createEmptyOffering()],
    );
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);

    setPhotoFiles((prev) => [...prev, ...files]);

    setPhotoPreviews((prev) => [
      ...prev,
      ...files.map((file) => URL.createObjectURL(file)),
    ]);
    e.target.value = "";
  };

  const removePhoto = (indexToRemove: number) => {
    const preview = photoPreviews[indexToRemove];

    if (preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);

      const blobIndex = photoPreviews
        .slice(0, indexToRemove)
        .filter((item) => item.startsWith("blob:")).length;

      setPhotoFiles((prev) => prev.filter((_, index) => index !== blobIndex));
    }

    setPhotoPreviews((prev) =>
      prev.filter((_, index) => index !== indexToRemove),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) errors.name = "Please enter the Temple Name.";

    if (!formData.deity.trim())
      errors.deity = "Please enter the Primary Deity.";

    if (!isEditMode) {
      if (!formData.adminEmail.trim()) {
        errors.adminEmail = "Please enter the Temple Admin Email.";
      } else if (!EMAIL_REGEX.test(formData.adminEmail.trim())) {
        errors.adminEmail = "Please enter a valid email address.";
      }
    }

    if (!formData.description.trim())
      errors.description = "Please enter the Description.";

    if (!formData.address_line1.trim())
      errors.address_line1 = "Please enter Address Line 1.";

    if (!formData.address_line2.trim())
      errors.address_line2 = "Please enter Address Line 2.";

    if (!formData.state.trim()) errors.state = "Please select the State.";

    if (!formData.city.trim()) errors.city = "Please select the City.";

    if (photoPreviews.length === 0 && photoFiles.length === 0) {
      errors.templeImages = "Please upload at least one temple image";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});

    const filledOfferings = offerings.filter(
      (offering) =>
        offering.name ||
        offering.description ||
        offering.price ||
        offering.categories.length > 0,
    );

    const hasIncompleteOffering = filledOfferings.some(
      (offering) =>
        !offering.name.trim() ||
        !offering.description.trim() ||
        !offering.price.trim(),
    );

    if (hasIncompleteOffering) {
      alert("Please fill all offering fields");
      return;
    }

    const hasEmptyCategory = filledOfferings.some(
      (offering) => offering.categories.length === 0,
    );

    if (hasEmptyCategory) {
      alert("Please select at least one category for every offering");
      return;
    }

    const hasInvalidPrice = filledOfferings.some((offering) => {
      const price = Number(offering.price);

      return !Number.isFinite(price) || price < 100;
    });

    if (hasInvalidPrice) {
      alert("Offering price must be greater than ₹100");
      return;
    }

    setIsSubmitting(true);

    try {
      const newPhotoUrls = await uploadTempleImages(photoFiles);
      const existingPhotoUrls = photoPreviews.filter(
        (preview) => !preview.startsWith("blob:"),
      );

      const uploadedPhotoUrls = [...existingPhotoUrls, ...newPhotoUrls];

      if (uploadedPhotoUrls.length === 0) {
        alert("Please upload at least one temple image");
        setIsSubmitting(false);
        return;
      }
      const templeResponse = await fetch(
        isEditMode ? `${API_URL}/temples/${templeId}` : `${API_URL}/temples`,
        {
          method: isEditMode ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description,
            deity: formData.deity,
            isActive: formData.isActive,
            imageUrl: uploadedPhotoUrls[0] ?? "",
            imageUrls: uploadedPhotoUrls,
          }),
        },
      );

      if (!templeResponse.ok) {
        throw new Error(
          (await templeResponse.text()) || "Failed to create temple",
        );
      }

      const temple = isEditMode
        ? { id: templeId }
        : ((await templeResponse.json()) as { id: string });

      if (!isEditMode) {
        const templeAdminResponse = await fetch(
          `${AUTH_SERVICE_URL}/users/create-temple-admin`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: formData.adminEmail.trim(),
              templeId: temple.id,
              templeName: formData.name,
            }),
          },
        );

        if (!templeAdminResponse.ok) {
          throw new Error(
            (await templeAdminResponse.text()) ||
              "Failed to create temple admin account",
          );
        }
      }

      const existingLocationResponse = await fetch(
        `${API_URL}/temple-locations?filter[where][templeId]=${temple.id}`,
      );

      const existingLocations = await existingLocationResponse.json();

      const existingLocation = existingLocations[0];

      const locationResponse = await fetch(
        existingLocation
          ? `${API_URL}/temple-locations/${existingLocation.id}`
          : `${API_URL}/temple-locations`,
        {
          method: existingLocation ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            templeId: temple.id,
            addressLine1: formData.address_line1,
            addressLine2: formData.address_line2,
            city: formData.city,
            state: formData.state,
            country: formData.country,
            postalCode: formData.postal_code,
          }),
        },
      );

      if (!locationResponse.ok) {
        throw new Error(
          (await locationResponse.text()) || "Failed to save location",
        );
      }
      if (isEditMode && templeId) {
        const existingOfferingsResponse = await fetch(
          `${API_URL}/temple-offerings?filter[where][templeId]=${templeId}`,
        );

        const existingOfferingsResult = await existingOfferingsResponse.json();

        const existingOfferings = Array.isArray(existingOfferingsResult)
          ? existingOfferingsResult
          : existingOfferingsResult.data || [];

        const currentOfferingIds = filledOfferings
          .filter((offering: any) => offering.id)
          .map((offering: any) => offering.id);

        const removedOfferings = existingOfferings.filter(
          (offering: any) => !currentOfferingIds.includes(offering.id),
        );

        for (const removedOffering of removedOfferings) {
          // DELETE CATEGORY MAPPINGS
          const mappingsResponse = await fetch(
            `${API_URL}/offering-category-mappings?filter[where][offeringId]=${removedOffering.id}`,
          );

          const mappingsResult = await mappingsResponse.json();

          const mappings = Array.isArray(mappingsResult)
            ? mappingsResult
            : mappingsResult.data || [];

          for (const mapping of mappings) {
            await fetch(`${API_URL}/offering-category-mappings/${mapping.id}`, {
              method: "DELETE",
            });
          }

          // DELETE OFFERING
          await fetch(`${API_URL}/temple-offerings/${removedOffering.id}`, {
            method: "DELETE",
          });
        }
      }
      // SAVE SELECTED DONATIONS
      for (const donationName of selectedDonationTypes) {
        await fetch(`${API_URL}/temple-offerings`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            templeId: temple.id,
            name: donationName,
            description: "Donation",
            price: 0,
            currency: "INR",
            archana: false,
            isActive: true,
          }),
        });
      }
      for (const offering of filledOfferings) {
        const isExistingOffering = Boolean(offering.id);

        if (isExistingOffering) {
          const mappingsResponse = await fetch(
            `${API_URL}/offering-category-mappings?filter[where][offeringId]=${offering.id}`,
          );

          const mappingsResult = await mappingsResponse.json();

          const mappings = Array.isArray(mappingsResult)
            ? mappingsResult
            : mappingsResult.data || [];

          for (const mapping of mappings) {
            await fetch(`${API_URL}/offering-category-mappings/${mapping.id}`, {
              method: "DELETE",
            });
          }

          const deleteOfferingResponse = await fetch(
            `${API_URL}/temple-offerings/${offering.id}`,
            {
              method: "DELETE",
            },
          );

          if (!deleteOfferingResponse.ok) {
            throw new Error(await deleteOfferingResponse.text());
          }
        }

        const response = await fetch(`${API_URL}/temple-offerings`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            templeId: temple.id,
            name: offering.name,
            description: offering.description,
            price: Number(offering.price),
            currency: offering.currency,
            archana: offering.archana,
            isActive: offering.isActive,
          }),
        });

        if (!response.ok) {
          throw new Error((await response.text()) || "Failed to save offering");
        }

        const createdOffering = await response.json();

        for (const category of offering.categories) {
          const mappingResponse = await fetch(
            `${API_URL}/offering-category-mappings`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                templeId: temple.id,
                offeringId: createdOffering.id,
                categoryName: category,
              }),
            },
          );

          if (!mappingResponse.ok) {
            throw new Error(
              (await mappingResponse.text()) ||
                "Failed to save category mapping",
            );
          }
        }
      }
      if (!isEditMode) {
        if (
          !bankDetails.beneficiaryName ||
          !bankDetails.accountNumber ||
          !bankDetails.confirmAccountNumber ||
          !bankDetails.ifscCode
        ) {
          throw new Error("Please fill all bank details");
        }

        if (bankDetails.accountNumber !== bankDetails.confirmAccountNumber) {
          throw new Error(
            "Account number and confirm account number do not match",
          );
        }
        if (
          !bankDetails.accountNumber ||
          bankDetails.accountNumber.length < 9
        ) {
          alert("Please enter a valid bank account number");
          return;
        }

        if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(bankDetails.ifscCode)) {
          alert("Please enter a valid IFSC code");
          return;
        }
        const bankResponse = await fetch(`${API_URL}/temple-bank-details`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            templeId: temple.id,
            beneficiaryName: bankDetails.beneficiaryName,
            accountNumber: bankDetails.accountNumber,
            ifscCode: bankDetails.ifscCode,
            accountType: bankDetails.accountType,
            panNumber: bankDetails.panNumber,
            gstin: bankDetails.gstin,
            payoutSchedule: bankDetails.payoutSchedule,
          }),
        });

        if (!bankResponse.ok) {
          throw new Error(
            (await bankResponse.text()) ||
              "Failed to save Razorpay bank details",
          );
        }
      }

      alert(
        isEditMode
          ? "Temple updated successfully"
          : "Temple added successfully",
      );

      const adminRole = sessionStorage.getItem("adminRole");

      if (isEditMode && adminRole === "temple_admin") {
        router.push("/temple-detail");
      } else if (isEditMode) {
        router.push(`/temple-detail?id=${temple.id}`);
      } else {
        router.push("/temple");
      }

      router.refresh();
      setFormData({
        name: "",
        description: "",
        deity: "",
        adminEmail: "",
        address_line1: "",
        address_line2: "",
        city: "",
        state: "",
        country: "India",
        postal_code: "",
        isActive: true,
      });
      setOfferings([createEmptyOffering()]);
      setPhotoFiles([]);
      setPhotoPreviews([]);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error adding temple");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminShell title={isEditMode ? "Edit Temple" : "Create Temple"}>
      <main className="min-h-screen bg-[#f4eadc] p-8 text-[#2d1606]">
        {/* TOP */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const adminRole = sessionStorage.getItem("adminRole");

                if (adminRole === "temple_admin") {
                  router.push("/temple-detail");
                } else {
                  router.push("/temple");
                }
              }}
              className="rounded-lg border border-[#E5D5B5] bg-white p-2"
            >
              <ArrowLeft size={18} />
            </button>

            <div>
              <h1 className="text-2xl font-bold text-[#2d1606]">
                {isEditMode ? "Edit Temple" : "Create Temple"}
              </h1>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="mx-auto max-w-5xl space-y-6">
          <section className={sectionClass}>
            <div className="mb-5 flex items-center gap-3">
              <Landmark className="h-5 w-5 text-[#c8651d]" />
              <h2 className="text-xl font-bold">Temple Details</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>Temple Name{requiredStar}</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Guruvayur Temple"
                  className={getInputClass("name")}
                />
                {fieldErrors.name && (
                  <p className={errorClass}>{fieldErrors.name}</p>
                )}
              </div>

              <div>
                <label className={labelClass}>
                  Primary Deity{requiredStar}
                </label>
                <input
                  name="deity"
                  value={formData.deity}
                  onChange={handleChange}
                  placeholder="e.g. Lord Krishna"
                  className={getInputClass("deity")}
                />
                {fieldErrors.deity && (
                  <p className={errorClass}>{fieldErrors.deity}</p>
                )}
              </div>

              {!isEditMode && (
                <div>
                  <label className={labelClass}>
                    Temple Admin Email{requiredStar}
                  </label>
                  <input
                    name="adminEmail"
                    type="email"
                    value={formData.adminEmail}
                    onChange={handleChange}
                    placeholder="e.g. admin@gmail.com"
                    className={getInputClass("adminEmail")}
                  />
                  <p className="mt-1 text-xs text-[#7d6040]">
                    A secure link to set up their password will be emailed to
                    this address.
                  </p>
                  {fieldErrors.adminEmail && (
                    <p className={errorClass}>{fieldErrors.adminEmail}</p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#2d1606]">
                Description{requiredStar}
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter temple description..."
                className={`min-h-32 w-full rounded-xl border bg-white px-4 py-3 text-sm text-[#2d1606] outline-none placeholder:text-[#b9aa95] focus:border-[#c8651d] ${
                  fieldErrors.description
                    ? "border-red-500 bg-red-50"
                    : "border-[#d6b982]"
                }`}
              />
              {fieldErrors.description && (
                <p className={errorClass}>{fieldErrors.description}</p>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between rounded-xl border border-[#d6b982] bg-[#f8efe2] px-4 py-3">
              <div>
                <p className="text-sm font-bold">Active Status</p>
                <p className="text-sm text-[#7d6040]">
                  Make this temple visible to devotees.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, isActive: !prev.isActive }))
                }
                className={`flex h-5 w-10 items-center rounded-full px-1 transition ${
                  formData.isActive ? "bg-[#22c55e]" : "bg-[#c9b69d]"
                }`}
              >
                <span
                  className={`h-4 w-4 rounded-full bg-white transition ${
                    formData.isActive ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="mt-4">
              <label className={labelClass}>Temple Images{requiredStar}</label>
              <div className="flex flex-wrap gap-3">
                {photoPreviews.map((preview, index) => (
                  <div
                    key={preview}
                    className="relative h-24 w-28 overflow-hidden rounded-xl border border-dashed border-[#C8B99A] bg-white"
                  >
                    <Image
                      src={getPreviewImageUrl(preview)}
                      alt="Temple image"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-white text-[#9b4815] shadow"
                      aria-label="Remove image"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}

                <label className="grid h-24 w-28 cursor-pointer place-items-center rounded-xl border border-dashed border-[#C8B99A] bg-[#fffaf2] text-center text-sm font-semibold text-[#7d6040] hover:bg-[#f8efe2]">
                  <span>
                    <ImageIcon className="mx-auto mb-1 h-5 w-5" />
                    {photoPreviews.length ? "Add More" : "Main Image"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
              </div>
              {fieldErrors.templeImages && (
                <p className={errorClass}>{fieldErrors.templeImages}</p>
              )}
            </div>
          </section>

          <section className={sectionClass}>
            <div className="mb-5 flex items-center gap-3">
              <MapPin className="h-5 w-5 text-[#ec4899]" />
              <h2 className="text-xl font-bold">Location</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-4 md:grid-cols-2 md:col-span-2">
                {/* Address Line 1 */}
                <div>
                  <label className={labelClass}>
                    Address Line 1{requiredStar}
                  </label>

                  <input
                    name="address_line1"
                    value={formData.address_line1}
                    onChange={handleChange}
                    placeholder="e.g. East Nada"
                    className={getInputClass("address_line1")}
                  />

                  {fieldErrors.address_line1 && (
                    <p className={errorClass}>{fieldErrors.address_line1}</p>
                  )}
                </div>

                {/* Address Line 2 */}
                <div>
                  <label className={labelClass}>
                    Address Line 2{requiredStar}
                  </label>

                  <input
                    name="address_line2"
                    value={formData.address_line2}
                    onChange={handleChange}
                    placeholder="e.g. Near Bus Stand"
                    className={getInputClass("address_line2")}
                  />

                  {fieldErrors.address_line2 && (
                    <p className={errorClass}>{fieldErrors.address_line2}</p>
                  )}
                </div>
              </div>

              <div>
                <label className={labelClass}>State{requiredStar}</label>

                <div ref={stateDropdownRef} className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsStateDropdownOpen((current) => !current);
                      setIsCityDropdownOpen(false);
                    }}
                    className={`flex h-12 w-full items-center justify-between rounded-xl border bg-white px-4 text-left transition ${
                      fieldErrors.state
                        ? "border-red-500 bg-red-50"
                        : isStateDropdownOpen
                          ? "border-[#c8651d] ring-4 ring-[#c8651d]/10"
                          : "border-[#d6b982] hover:border-[#c89554]"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <MapPin size={18} className="shrink-0 text-[#b56b32]" />

                      <span
                        className={`truncate text-sm ${
                          formData.state
                            ? "font-semibold text-[#2d1606]"
                            : "text-[#b9aa95]"
                        }`}
                      >
                        {formData.state || "Select State"}
                      </span>
                    </div>

                    <ChevronDown
                      size={19}
                      className={`shrink-0 text-[#765b3e] transition-transform ${
                        isStateDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isStateDropdownOpen && (
                    <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-xl border border-[#e5d8c5] bg-white p-2 shadow-xl">
                      <div className="relative mb-2">
                        <Search
                          size={17}
                          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9b8469]"
                        />

                        <input
                          value={stateSearch}
                          onChange={(event) =>
                            setStateSearch(event.target.value)
                          }
                          placeholder="Search state..."
                          autoFocus
                          className="h-10 w-full rounded-lg border border-[#eadfce] bg-[#faf7f2] pl-10 pr-3 text-sm outline-none focus:border-[#c8651d]"
                        />
                      </div>

                      <div className="max-h-56 space-y-1 overflow-y-auto">
                        {filteredStates.length > 0 ? (
                          filteredStates.map((state) => {
                            const isSelected = formData.state === state;

                            return (
                              <button
                                key={state}
                                type="button"
                                onClick={() => {
                                  setFormData((previous) => ({
                                    ...previous,
                                    state,
                                    city: "",
                                    postal_code:
                                      statePostalCodeFallbacks[state] ?? "",
                                  }));

                                  setFieldErrors((previous) => ({
                                    ...previous,
                                    state: "",
                                    city: "",
                                  }));

                                  setStateSearch("");
                                  setCitySearch("");
                                  setIsStateDropdownOpen(false);
                                }}
                                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition ${
                                  isSelected
                                    ? "bg-[#fff1e7] font-semibold text-[#c05e20]"
                                    : "text-[#493725] hover:bg-[#faf4eb]"
                                }`}
                              >
                                <span className="truncate">{state}</span>

                                {isSelected && (
                                  <Check
                                    size={17}
                                    className="shrink-0 text-[#c05e20]"
                                  />
                                )}
                              </button>
                            );
                          })
                        ) : (
                          <div className="px-3 py-6 text-center text-sm text-[#8a6a45]">
                            No states found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {fieldErrors.state && (
                  <p className={errorClass}>{fieldErrors.state}</p>
                )}
              </div>

              <div>
                <label className={labelClass}>City{requiredStar}</label>

                <div ref={cityDropdownRef} className="relative">
                  <button
                    type="button"
                    disabled={!formData.state}
                    onClick={() => {
                      if (!formData.state) return;

                      setIsCityDropdownOpen((current) => !current);
                      setIsStateDropdownOpen(false);
                    }}
                    className={`flex h-12 w-full items-center justify-between rounded-xl border px-4 text-left transition ${
                      !formData.state
                        ? "cursor-not-allowed border-[#e2d6c4] bg-[#f5efe6] text-[#a99680]"
                        : fieldErrors.city
                          ? "border-red-500 bg-red-50"
                          : isCityDropdownOpen
                            ? "border-[#c8651d] bg-white ring-4 ring-[#c8651d]/10"
                            : "border-[#d6b982] bg-white hover:border-[#c89554]"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <MapPin size={18} className="shrink-0 text-[#b56b32]" />

                      <span
                        className={`truncate text-sm ${
                          formData.city
                            ? "font-semibold text-[#2d1606]"
                            : "text-[#b9aa95]"
                        }`}
                      >
                        {formData.city ||
                          (formData.state
                            ? "Select City"
                            : "Select State first")}
                      </span>
                    </div>

                    <ChevronDown
                      size={19}
                      className={`shrink-0 text-[#765b3e] transition-transform ${
                        isCityDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isCityDropdownOpen && formData.state && (
                    <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-xl border border-[#e5d8c5] bg-white p-2 shadow-xl">
                      <div className="relative mb-2">
                        <Search
                          size={17}
                          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9b8469]"
                        />

                        <input
                          value={citySearch}
                          onChange={(event) =>
                            setCitySearch(event.target.value)
                          }
                          placeholder="Search city..."
                          autoFocus
                          className="h-10 w-full rounded-lg border border-[#eadfce] bg-[#faf7f2] pl-10 pr-3 text-sm outline-none focus:border-[#c8651d]"
                        />
                      </div>

                      <div className="max-h-56 space-y-1 overflow-y-auto">
                        {filteredCities.length > 0 ? (
                          filteredCities.map((city) => {
                            const isSelected = formData.city === city;

                            return (
                              <button
                                key={city}
                                type="button"
                                onClick={() => {
                                  setFormData((previous) => ({
                                    ...previous,
                                    city,
                                    postal_code:
                                      postalCodeSuggestionsByStateDistrict[
                                        previous.state
                                      ]?.[city] ??
                                      statePostalCodeFallbacks[
                                        previous.state
                                      ] ??
                                      "",
                                  }));

                                  setFieldErrors((previous) => ({
                                    ...previous,
                                    city: "",
                                  }));

                                  setCitySearch("");
                                  setIsCityDropdownOpen(false);
                                }}
                                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition ${
                                  isSelected
                                    ? "bg-[#fff1e7] font-semibold text-[#c05e20]"
                                    : "text-[#493725] hover:bg-[#faf4eb]"
                                }`}
                              >
                                <span className="truncate">{city}</span>

                                {isSelected && (
                                  <Check
                                    size={17}
                                    className="shrink-0 text-[#c05e20]"
                                  />
                                )}
                              </button>
                            );
                          })
                        ) : (
                          <div className="px-3 py-6 text-center text-sm text-[#8a6a45]">
                            No cities found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {fieldErrors.city && (
                  <p className={errorClass}>{fieldErrors.city}</p>
                )}
              </div>

              <div>
                <label className={labelClass}>Country</label>
                <input
                  value="India"
                  readOnly
                  className={`${inputClass} bg-[#f7f1e8]`}
                />
              </div>

              <div>
                <label className={labelClass}>Postal Code</label>
                <input
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={handleLocationChange}
                  placeholder="e.g. 680101"
                  className={getInputClass("postal_code")}
                />
              </div>
            </div>
          </section>
          {!isEditMode && (
            <>
              {/* BANK & PAYOUT DETAILS */}
              <section className="mt-8 rounded-2xl border border-[#ead3aa] bg-[#fffaf2] p-6 shadow-sm">
                <div className="mb-6 flex items-start justify-between">
                  <div>
                    <h2 className="flex items-center gap-2 text-xl font-bold text-[#2d1606]">
                      🏦 Bank & Payout Details
                    </h2>
                    <p className="mt-1 text-sm text-[#8B7355]">
                      A Razorpay vendor account will be created so payouts can
                      be sent to this temple.
                    </p>
                  </div>

                  <span className="rounded-full bg-[#f4eadb] px-4 py-2 text-xs font-semibold text-[#8b5a1f]">
                    🟠 Vendor not created
                  </span>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#2d1606]">
                      Beneficiary Name (as per bank records) {requiredStar}
                    </label>
                    <input
                      name="beneficiaryName"
                      value={bankDetails.beneficiaryName}
                      onChange={handleBankChange}
                      type="text"
                      placeholder="e.g. Guruvayur Devaswom"
                      className="w-full rounded-xl border border-[#dec79f] bg-white px-4 py-3 outline-none focus:border-[#c8641f]"
                    />
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#2d1606]">
                        Account Number {requiredStar}
                      </label>
                      <input
                        name="accountNumber"
                        value={bankDetails.accountNumber}
                        onChange={handleBankChange}
                        type="text"
                        placeholder="Account Number"
                        className="w-full rounded-xl border border-[#dec79f] bg-white px-4 py-3 outline-none focus:border-[#c8641f]"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#2d1606]">
                        Re-enter Account Number {requiredStar}
                      </label>
                      <input
                        name="confirmAccountNumber"
                        value={bankDetails.confirmAccountNumber}
                        onChange={handleBankChange}
                        onPaste={(e) => e.preventDefault()}
                        onCopy={(e) => e.preventDefault()}
                        placeholder="Re-enter Account Number"
                        className={getInputClass("confirmAccountNumber")}
                      />

                      {fieldErrors.confirmAccountNumber && (
                        <p className={errorClass}>
                          {fieldErrors.confirmAccountNumber}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#2d1606]">
                        IFSC Code {requiredStar}
                      </label>
                      <input
                        name="ifscCode"
                        value={bankDetails.ifscCode}
                        onChange={handleBankChange}
                        type="text"
                        placeholder="e.g. SBIN0001234"
                        className="w-full rounded-xl border border-[#dec79f] bg-white px-4 py-3 outline-none focus:border-[#c8641f]"
                      />
                      <p className="mt-1 text-xs text-[#8B7355]">
                        Bank & branch will be auto-filled from IFSC
                      </p>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#2d1606]">
                        Account Type
                      </label>
                      <select
                        name="accountType"
                        value={bankDetails.accountType}
                        onChange={handleBankChange}
                        className="w-full rounded-xl border border-[#dec79f] bg-white px-4 py-3 outline-none focus:border-[#c8641f]"
                      >
                        <option value="Savings">Savings</option>
                        <option value="Current">Current</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#2d1606]">
                        PAN Number {requiredStar}
                      </label>
                      <input
                        name="panNumber"
                        value={bankDetails.panNumber}
                        onChange={handleBankChange}
                        type="text"
                        placeholder="ABCDE1234F"
                        className="w-full rounded-xl border border-[#dec79f] bg-white px-4 py-3 outline-none focus:border-[#c8641f]"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#2d1606]">
                        GSTIN{" "}
                        <span className="font-normal text-[#8B7355]">
                          (optional)
                        </span>
                      </label>
                      <input
                        name="gstin"
                        value={bankDetails.gstin}
                        onChange={handleBankChange}
                        type="text"
                        placeholder="Optional"
                        className="w-full rounded-xl border border-[#dec79f] bg-white px-4 py-3 outline-none focus:border-[#c8641f]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-3 block text-sm font-semibold text-[#2d1606]">
                      Payout Schedule
                    </label>

                    <div className="grid gap-3 md:grid-cols-3">
                      {[
                        ["Instant", "After each transaction"],
                        ["Daily", "Settled next business day"],
                        ["Manual", "Admin initiates payout"],
                      ].map(([title, desc]) => (
                        <button
                          key={title}
                          type="button"
                          onClick={() =>
                            setBankDetails((prev) => ({
                              ...prev,
                              payoutSchedule: title,
                            }))
                          }
                          className={`rounded-xl border p-4 text-left transition hover:border-[#c8641f] ${
                            bankDetails.payoutSchedule === title
                              ? "border-[#c8641f] bg-white"
                              : "border-[#dec79f] bg-white"
                          }`}
                        >
                          <h4 className="font-semibold text-[#2d1606]">
                            {title}
                          </h4>
                          <p className="mt-1 text-xs text-[#8B7355]">{desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}

          <section className={sectionClass}>
            <div className="mb-5 flex items-center gap-3">
              <Gift className="h-5 w-5 text-[#ea580c]" />
              <h2 className="text-xl font-bold">Offerings & Archanas</h2>
            </div>
            <div className="mb-6">
              <p className="mb-3 text-sm font-semibold text-[#7d6040]">
                Donation Options
              </p>

              <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-5">
                {donationOptions.map((option) => {
                  const selected = selectedDonationTypes.includes(option.name);

                  return (
                    <button
                      key={option.name}
                      type="button"
                      onClick={() => toggleDonationType(option.name)}
                      className={`rounded-2xl border p-4 text-left transition-all ${
                        selected
                          ? "border-[#c8651d] bg-[#c8651d] text-white shadow-md"
                          : "border-[#d6b982] bg-white hover:border-[#c8651d] hover:shadow-sm"
                      }`}
                    >
                      <p
                        className={`text-base font-bold ${selected ? "text-white" : "text-[#2d1606]"}`}
                      >
                        {option.name}
                      </p>

                      <p
                        className={`mt-1 text-sm ${selected ? "text-orange-100" : "text-[#c8651d]"}`}
                      >
                        {option.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-4">
              {" "}
              {offerings.map((offering, index) => (
                <div key={index} className={cardClass}>
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-bold">Offering #{index + 1}</p>

                    <button
                      type="button"
                      onClick={() => removeOffering(index)}
                      className="text-[#9b4815] hover:text-red-600"
                      aria-label="Remove offering"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid gap-3 md:grid-cols-[1fr_180px]">
                    <div>
                      <label className={labelClass}>Name {requiredStar}</label>
                      <input
                        value={offering.name}
                        onChange={(e) =>
                          handleOfferingChange(index, "name", e.target.value)
                        }
                        placeholder="Archana"
                        className={inputClass}
                      />
                    </div>

                    {offering.archana && (
                      <div>
                        <label className={labelClass}>
                          Amount {requiredStar}
                        </label>

                        <div className="relative">
                          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#7d6040]">
                            ₹
                          </span>

                          <input
                            type="text"
                            inputMode="numeric"
                            value={offering.price}
                            onChange={(event) => {
                              const value = event.target.value.replace(
                                /\D/g,
                                "",
                              );
                              handleOfferingChange(index, "price", value);
                            }}
                            placeholder="100"
                            className={`${inputClass} pl-9`}
                          />
                        </div>

                        <p className="mt-1 text-xs font-medium text-[#9b4815]">
                          Minimum amount: ₹100
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {/* Description */}
                    <div>
                      <label className={labelClass}>
                        Description {requiredStar}
                      </label>

                      <input
                        value={offering.description}
                        onChange={(e) =>
                          handleOfferingChange(
                            index,
                            "description",
                            e.target.value,
                          )
                        }
                        placeholder="Special pooja"
                        className={inputClass}
                      />
                    </div>

                    {/* Offering Type */}
                    <div>
                      <label className={labelClass}>
                        Offering Type {requiredStar}
                      </label>

                      <div className="relative mt-2">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenOfferingTypeIndex((current) =>
                              current === index ? null : index,
                            )
                          }
                          className={`flex h-12 w-full items-center justify-between rounded-xl border bg-white px-4 text-left transition ${
                            openOfferingTypeIndex === index
                              ? "border-[#c8651d] ring-4 ring-[#c8651d]/10"
                              : "border-[#d6b982] hover:border-[#c89554]"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Gift size={18} className="text-[#b56b32]" />

                            <span className="text-sm font-semibold text-[#2d1606]">
                              {offering.archana ? "Archana" : "Donation"}
                            </span>
                          </div>

                          <ChevronDown
                            size={19}
                            className={`text-[#765b3e] transition-transform ${
                              openOfferingTypeIndex === index
                                ? "rotate-180"
                                : ""
                            }`}
                          />
                        </button>

                        {openOfferingTypeIndex === index && (
                          <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-xl border border-[#e5d8c5] bg-white p-2 shadow-xl">
                            <button
                              type="button"
                              onClick={() => {
                                handleOfferingChange(index, "archana", false);
                                setOpenOfferingTypeIndex(null);
                              }}
                              className={`flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm transition ${
                                !offering.archana
                                  ? "bg-[#fff1e7] font-semibold text-[#c05e20]"
                                  : "text-[#493725] hover:bg-[#faf4eb]"
                              }`}
                            >
                              <div>
                                <p className="font-semibold">Donation</p>
                                <p className="mt-1 text-xs text-[#8a6a45]">
                                  General donation offering
                                </p>
                              </div>

                              {!offering.archana && (
                                <Check size={17} className="text-[#c05e20]" />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                handleOfferingChange(index, "archana", true);
                                setOpenOfferingTypeIndex(null);
                              }}
                              className={`mt-1 flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm transition ${
                                offering.archana
                                  ? "bg-[#fff1e7] font-semibold text-[#c05e20]"
                                  : "text-[#493725] hover:bg-[#faf4eb]"
                              }`}
                            >
                              <div>
                                <p className="font-semibold">Archana</p>
                                <p className="mt-1 text-xs text-[#8a6a45]">
                                  Fixed-price temple seva
                                </p>
                              </div>

                              {offering.archana && (
                                <Check size={17} className="text-[#c05e20]" />
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <p className="mb-2 text-sm font-semibold text-[#7d6040]">
                      Categories (Purpose)
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {offeringCategories.map((category) => {
                        const selected = offering.categories.includes(category);

                        return (
                          <button
                            key={category}
                            type="button"
                            onClick={() => toggleCategory(index, category)}
                            className={`rounded-full border px-3 py-1 text-sm font-semibold transition ${
                              selected
                                ? "border-[#c8651d] bg-[#c8651d] text-white"
                                : "border-[#d6b982] bg-white text-[#7d6040] hover:border-[#c8651d]"
                            }`}
                          >
                            {category}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addOffering}
              className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#C8B99A] bg-[#fffaf2] text-sm font-bold text-[#c8651d] hover:bg-[#f8efe2]"
            >
              <Plus className="h-4 w-4" />
              Add Archana Offering
            </button>
          </section>

          <div className="flex justify-end pb-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-[#c8651d] px-6 py-3 text-sm font-bold text-white shadow hover:bg-[#a84f15] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? isEditMode
                  ? "Updating..."
                  : "Adding..."
                : isEditMode
                  ? "Update Temple"
                  : "Add Temple"}{" "}
            </button>
          </div>
        </form>
      </main>
    </AdminShell>
  );
}
