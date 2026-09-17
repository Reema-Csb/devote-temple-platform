// temple id page code
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";

import {
  getTempleById,
  type TempleCard,
  type TempleOffering,
} from "@/lib/temple-api";

import type { IconType } from "react-icons";

import {
  FaArrowLeft,
  FaHandHoldingHeart,
  FaSearch,
  FaStar,
} from "react-icons/fa";
import {
  FaBowlFood,
  FaCow,
  FaFireFlameCurved,
  FaHammer,
  FaHandsPraying,
  FaLocationDot,
  FaOm,
} from "react-icons/fa6";
import {
  FaBook,
  FaBriefcase,
  FaDove,
  FaHeartPulse,
  FaPeopleGroup,
  FaShieldHeart,
} from "react-icons/fa6";

import { GiDiamondRing, GiMoneyStack, GiStonePath } from "react-icons/gi";
import AppShell from "@/components/layout/AppShell";

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL;

const defaultDonations = [
  {
    id: "annadhanam",
    title: "Annadhanam",
    desc: "Food offering",
  },
  {
    id: "deepam",
    title: "Deepam",
    desc: "Lighting lamps",
  },
  {
    id: "goshala",
    title: "Goseva",
    desc: "Cow care",
  },
  {
    id: "maintenance",
    title: "Temple Maintenance",
    desc: "Temple upkeep",
  },
  {
    id: "general-donation",
    title: "General Donation",
    desc: "Temple support",
  },
];

type DonationOption = {
  id: string;
  title: string;
  desc?: string;
  price?: number;
  currency?: string;
  archana?: boolean;
  category?: string;
  categories?: string[] | string;
  donationTypes?: string[];
};
type TempleOfferingWithCategories = TempleOffering & {
  category?: string;
  categories?: string[] | string;
};

function getOfferingIcon(offering: Pick<DonationOption, "title" | "desc">) {
  const value = `${offering.title} ${offering.desc ?? ""}`.toLowerCase();

  if (/(annadhan|prasadam|food|meal)/.test(value)) {
    return FaBowlFood;
  }

  if (/(deep|lamp|light|jyoti)/.test(value)) {
    return FaFireFlameCurved;
  }

  if (/(go ?shala|cow)/.test(value)) {
    return FaCow;
  }

  if (/(maintenance|repair|upkeep)/.test(value)) {
    return FaHammer;
  }

  if (/(archana|abhishekam|pooja|puja|seva)/.test(value)) {
    return FaHandsPraying;
  }

  if (/(om|deity|temple)/.test(value)) {
    return FaOm;
  }

  return FaHandHoldingHeart;
}
function getCategoryIcon(category?: string) {
  const value = category?.toLowerCase() ?? "";

  if (value.includes("health")) return FaHeartPulse;

  if (value.includes("wealth")) return GiMoneyStack;

  if (value.includes("marriage")) return GiDiamondRing;

  if (value.includes("studies")) return FaBook;

  if (value.includes("protection")) return FaShieldHeart;

  if (value.includes("peace")) return FaDove;

  if (value.includes("removing obstacles")) return GiStonePath;

  if (value.includes("business")) return FaBriefcase;

  if (value.includes("family")) return FaPeopleGroup;

  if (value.includes("devotion")) return FaHandsPraying;

  return FaHandHoldingHeart;
}

function formatOfferingAmount(price: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

type SevaTab = "donations" | "archana";

const prayerFilters = [
  "All",
  "Health",
  "Wealth",
  "Marriage",
  "Studies",
  "Protection",
  "Peace",
  "Removing Obstacles",
];
async function getPresignedImageUrl(image?: string) {
  if (!image) return "";

  if (image.startsWith("http")) {
    return image;
  }
  if (!API_GATEWAY_URL) {
    console.error("NEXT_PUBLIC_API_GATEWAY_URL is missing");
    return "";
  }

  let key = image;

  if (image.includes("s3.amazonaws.com/devotee-app-assets/")) {
    key = image.split("s3.amazonaws.com/devotee-app-assets/")[1];
  }

  if (image.includes("devotee-app-assets.s3.us-east-1.amazonaws.com/")) {
    key = image.split("devotee-app-assets.s3.us-east-1.amazonaws.com/")[1];
  }

  if (key.startsWith("http")) return key;

  const response = await fetch(
    `${API_GATEWAY_URL}/upload/presigned-url?key=${encodeURIComponent(key)}`,
  );

  if (!response.ok) {
    console.error("Presigned URL failed:", key);
    return "";
  }

  const data = await response.json();

  return data.url ?? "";
}
export default function TempleDetails() {
  const params = useParams();
  const id = params.id as string;

  const [temple, setTemple] = useState<TempleCard | null>(null);
  const [templeImages, setTempleImages] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [isMissing, setIsMissing] = useState(false);

  useEffect(() => {
    async function loadTemple() {
      try {
        setIsLoading(true);

        const response = await getTempleById(id);
        setTemple(response);

        const templeData = response as TempleCard & {
          imageUrl?: string;
          imageUrls?: string[];
          images?: string[];
          image?: string;
        };

        const images = [
          ...(Array.isArray(templeData.images) ? templeData.images : []),
          ...(Array.isArray(templeData.imageUrls) ? templeData.imageUrls : []),
          ...(templeData.imageUrl ? [templeData.imageUrl] : []),
          ...(templeData.image ? [templeData.image] : []),
        ].filter(Boolean);

        const uniqueImages = Array.from(new Set(images));

        setTempleImages(uniqueImages.filter(Boolean));
      } catch (error) {
        console.warn(error);

        setIsMissing(true);
      } finally {
        setIsLoading(false);
      }
    }

    loadTemple();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f3ece3] overflow-x-hidden">
        <div className="p-6 max-w-6xl mx-auto text-[#2d1606]">
          Loading temple...
        </div>
      </div>
    );
  }

  if (isMissing || !temple) {
    return notFound();
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f3ece3]">
        <div className="p-6 max-w-6xl mx-auto">
          <p className="text-[#7a2e0e] font-medium">
            Loading temple details...
          </p>
        </div>
      </div>
    );
  }

  return <TempleContent temple={temple} templeImages={templeImages} />;
}

const getArchanaEmoji = (name: string) => {
  const value = name.toLowerCase();

  if (value.includes("pushpa") || value.includes("flower")) {
    return "🌺";
  }

  if (value.includes("kumkum")) {
    return "🌷";
  }

  if (value.includes("ashtothara")) {
    return "🪔";
  }

  if (value.includes("sahasra") || value.includes("lalita")) {
    return "🌸";
  }

  if (
    value.includes("paal") ||
    value.includes("ksheera") ||
    value.includes("milk")
  ) {
    return "🥛";
  }

  if (value.includes("panchamrita")) {
    return "🪔";
  }

  if (value.includes("rudra") || value.includes("shiva")) {
    return "🔱";
  }

  if (value.includes("vishnu")) {
    return "🌼";
  }

  if (value.includes("abhishekam")) {
    return "🪔";
  }

  return "🙏";
};

function TempleContent({
  temple,
  templeImages,
}: {
  temple: TempleCard;
  templeImages: string[];
}) {
  const router = useRouter();
  const [selectedDonations, setSelectedDonations] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<SevaTab>("donations");

  const [selectedArchanas, setSelectedArchanas] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedPrayer, setSelectedPrayer] = useState("All");
  const [showMoreArchanas, setShowMoreArchanas] = useState(false);
  const [isStoryOpen, setIsStoryOpen] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);

  const toggleDonation = (id: string) => {
    setSelectedDonations((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const toggleArchana = (id: string) => {
    setSelectedArchanas((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleProceed = () => {
    const selectedItems =
      activeTab === "donations"
        ? donationOptions.filter((d) => selectedDonations.includes(d.id))
        : archanaOptions.filter((a) => selectedArchanas.includes(a.id));

    if (selectedItems.length === 0) return;

    const firstItem = selectedItems[0];
    const offeringNames = selectedItems.map((i) => i.title).join(", ");
    const offeringDesc = selectedItems
      .map((i) => i.desc ?? "")
      .filter(Boolean)
      .join(", ");

    const params = new URLSearchParams({
      templeId: temple.id,
      templeName: temple.name,
      templeLocation: temple.location,
      offeringId: firstItem.id,
      offeringName: offeringNames,
      offeringDesc,
      offeringType: activeTab,
      fixedAmount: String(firstItem.price ?? 0),
    });

    router.push(`/dashboard/donation?${params.toString()}`);
  };

  /* =========================
   DONATIONS
========================= */

  const donationOptions: DonationOption[] = temple.offerings
    .filter(
      (offering) => offering.isActive !== false && offering.archana === false,
    )
    .map((offering: TempleOfferingWithCategories) => ({
      id: offering.id ?? offering.name,
      title: offering.name,
      desc: offering.description || "Donation offering",
      price: offering.price,
      currency: offering.currency,
      archana: offering.archana,
      category: Array.isArray(offering.categories)
        ? offering.categories.join(", ")
        : offering.categories || offering.category || "General",
    }));
  /* =========================
   ARCHANAS
========================= */

  const archanaOptions: DonationOption[] = temple.offerings
    .filter(
      (offering) => offering.isActive !== false && offering.archana === true,
    )
    .map((offering: TempleOfferingWithCategories) => ({
      id: offering.id ?? offering.name,
      title: offering.name,
      desc: offering.description,
      price: offering.price,
      currency: offering.currency,
      archana: offering.archana,

      category: Array.isArray(offering.categories)
        ? offering.categories.join(", ")
        : offering.categories || offering.category || "General",
    }));
  const filteredArchanas =
    selectedPrayer === "All"
      ? archanaOptions
      : archanaOptions.filter((item) => item.category === selectedPrayer);

  /* =========================
     SAFE IMAGE HANDLING
  ========================= */

  const fallbackImage = "https://placehold.co/800x500/png?text=Temple+Image";

  const displayImages =
    templeImages.length > 0
      ? templeImages
      : temple.image
        ? [temple.image]
        : [fallbackImage];
  useEffect(() => {
    if (displayImages.length > 0) {
      setSelectedImage(displayImages[0]);
      setSelectedIdx(0);
    }
  }, [displayImages[0]]);
  const shouldCollapseStory = temple.description.length > 220;

  const storyText =
    isStoryOpen || !shouldCollapseStory
      ? temple.description
      : `${temple.description.slice(0, 220).trim()}...`;
  return (
    <AppShell title="Temple Detail Screen">
      <div className="p-4 md:p-6 max-w-6xl mx-auto w-full">
        <Link
          href="/home"
          className="inline-flex items-center gap-2 mb-6 text-[#ba7104] font-medium hover:underline"
        >
          <FaArrowLeft />
          Back to Home
        </Link>

        <div className="grid md:grid-cols-2 gap-6 md:gap-10">
          <div>
            <Image
              priority
              src={selectedImage || displayImages[0]}
              width={640}
              height={350}
              unoptimized
              alt={temple.name}
              className="w-full max-h-[350px] object-cover rounded-3xl shadow-md"
            />

            <div className="flex gap-4 mt-4 overflow-x-auto pb-2">
              {displayImages.map((image, i) => (
                <button
                  key={`${image}-${i}`}
                  type="button"
                  onClick={() => {
                    setSelectedIdx(i);
                    setSelectedImage(image);
                  }}
                  className={`shrink-0 rounded-xl overflow-hidden border-4 transition ${
                    selectedIdx === i
                      ? "border-[#cf6427]"
                      : "border-transparent"
                  }`}
                >
                  <Image
                    src={image}
                    width={96}
                    height={80}
                    unoptimized
                    alt={`Temple Thumbnail ${i + 1}`}
                    className="w-24 h-20 object-cover shadow"
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-[#2d1606]">{temple.name}</h1>

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${temple.name} ${
                  temple.latitude ?? ""
                },${temple.longitude ?? ""}`,
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#e09728] mt-2 font-medium flex items-center gap-2 hover:underline"
            >
              <FaLocationDot />
              {temple.location}
            </a>

            <div className="bg-white p-5 rounded-2xl shadow mt-6">
              <h2 className="mb-2 font-semibold">Temple Story</h2>

              <div className="text-sm leading-relaxed text-gray-600">
                {storyText ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: storyText,
                    }}
                  />
                ) : (
                  "No temple story available."
                )}
              </div>

              {shouldCollapseStory && (
                <button
                  type="button"
                  onClick={() => setIsStoryOpen((prev) => !prev)}
                  className="mt-3 text-sm font-semibold text-[#ba7104] hover:underline"
                >
                  {isStoryOpen ? "Show Less" : "View Story"}
                </button>
              )}
            </div>

            {/* OFFERINGS */}
            <h2 className="mt-6 font-semibold text-base">
              Ways to Offer Your Seva
            </h2>
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={() => setActiveTab("donations")}
                className={`px-4 py-2 rounded-lg font-medium ${
                  activeTab === "donations"
                    ? "bg-[#cf5d25] text-white"
                    : "bg-white text-[#9c5a1a]"
                }`}
              >
                Donations
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("archana")}
                className={`px-4 py-2 rounded-lg font-medium ${
                  activeTab === "archana"
                    ? "bg-[#cf5d25] text-white"
                    : "bg-white text-[#9c5a1a]"
                }`}
              >
                Archana
              </button>
            </div>

            {activeTab === "donations" && (
              <>
                {donationOptions.length === 0 ? (
                  <div className="mt-4 rounded-xl bg-white p-5 text-sm text-[#8b6f47]">
                    No donation options available for this temple.
                  </div>
                ) : (
                  <div className="grid gap-3 mt-4 sm:grid-cols-2">
                    {donationOptions.map((donation) => {
                      const isSelected = selectedDonations.includes(
                        donation.id,
                      );
                      const OfferingIcon: IconType = getOfferingIcon(donation);

                      return (
                        <button
                          key={donation.id}
                          type="button"
                          onClick={() => toggleDonation(donation.id)}
                          className={`flex items-center gap-4 rounded-xl border p-4 text-left shadow transition ${
                            isSelected
                              ? "border-[#cf6427] bg-orange-50"
                              : "border-transparent bg-white hover:shadow-lg"
                          }`}
                        >
                          {/* ICON */}
                          <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                              isSelected
                                ? "bg-[#cf6427] text-white"
                                : "bg-[#f6eadb] text-[#bf4f1f]"
                            }`}
                          >
                            <OfferingIcon className="text-xl" />
                          </div>

                          {/* CONTENT */}
                          <div className="flex-1">
                            <h3 className="font-semibold text-[#1f1408]">
                              {donation.title}
                            </h3>

                            <p className="mt-1 text-sm text-[#bf4f1f]">
                              {donation.desc}
                            </p>

                            {donation.donationTypes?.length ? (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {donation.donationTypes.map((type) => (
                                  <span
                                    key={type}
                                    className="rounded-full bg-[#f5eadc] px-2 py-1 text-[10px] font-medium text-[#cf5d25]"
                                  >
                                    {type}
                                  </span>
                                ))}
                              </div>
                            ) : null}
                          </div>

                          {/* PRICE */}
                          {donation.archana && donation.price ? (
                            <span className="shrink-0 text-sm font-semibold text-[#7a2e0e]">
                              {formatOfferingAmount(
                                donation.price,
                                donation.currency,
                              )}
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {activeTab === "archana" && (
              <div className="mt-5">
                <div className="relative">
                  <FaSearch className="absolute left-4 top-3.5 text-gray-400 text-sm" />
                  <input
                    type="text"
                    placeholder="Search archanas..."
                    className="w-full border border-[#e0c8a5] rounded-lg py-3 pl-10 pr-4 text-sm outline-none bg-white"
                  />
                </div>

                <p className="text-[11px] uppercase text-[#9c6b3a] font-bold mt-4">
                  What are you praying for?
                </p>

                <div className="flex flex-wrap gap-2 mt-2">
                  {prayerFilters.map((item) => (
                    <button
                      key={item}
                      onClick={() => {
                        setSelectedPrayer(item);
                        setShowMoreArchanas(false);
                      }}
                      className={`px-3 py-1 rounded-full border text-xs transition ${
                        selectedPrayer === item
                          ? "bg-[#cf5d25] text-white border-[#cf5d25]"
                          : "bg-white text-[#9c5a1a] border-[#e0c8a5]"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>

                <h3 className="text-sm font-bold mt-6 text-[#2d1606]">
                  All Archanas
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  {" "}
                  {(showMoreArchanas
                    ? filteredArchanas
                    : filteredArchanas.slice(0, 4)
                  ).map((item) => {
                    return (
                      <button
                        key={item.id}
                        onClick={() => toggleArchana(item.id)}
                        className={`min-h-[112px] rounded-2xl border px-5 py-4 flex items-center gap-4 text-left transition hover:shadow-md overflow-hidden ${
                          selectedArchanas.includes(item.id)
                            ? "border-[#cf5d25] ring-1 ring-[#cf5d25] bg-orange-50 shadow-sm"
                            : "border-[#eee3d3] bg-white shadow-sm"
                        }`}
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          {" "}
                          <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl transition ${
                              selectedArchanas.includes(item.id)
                                ? "bg-[#cf5d25]"
                                : "bg-[#f5eadc]"
                            }`}
                          >
                            {getArchanaEmoji(item.title)}
                          </div>
                          <div className="min-w-0">
                            <h4 className="truncate text-base font-bold text-[#2d1606]">
                              {item.title}
                            </h4>

                            <p className="truncate text-xs text-[#8f8a83]">
                              {item.desc}
                            </p>

                            <p className="mt-1 truncate text-xs font-medium text-[#cf5d25]">
                              For{" "}
                              {(item.category ?? "devotion").toLowerCase()}{" "}
                            </p>
                          </div>
                        </div>

                        {item.price ? (
                          <span className="shrink-0 rounded-full bg-[#f5eadc] px-3 py-1 text-xs font-bold text-[#cf5d25]">
                            {" "}
                            {formatOfferingAmount(item.price, item.currency)}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>

                {filteredArchanas.length > 4 && (
                  <button
                    type="button"
                    onClick={() => setShowMoreArchanas((prev) => !prev)}
                    className="w-full mt-4 border border-[#cf5d25] text-[#cf5d25] rounded-lg py-3 text-sm font-medium"
                  >
                    {showMoreArchanas ? "View less" : "Show more archanas"}
                  </button>
                )}
              </div>
            )}

            <button
              onClick={handleProceed}
              disabled={
                activeTab === "donations"
                  ? selectedDonations.length === 0
                  : selectedArchanas.length === 0
              }
              className={`w-full h-15 mt-10 px-5 py-2 rounded-lg text-white font-medium transition duration-300 ${
                (
                  activeTab === "donations"
                    ? selectedDonations.length > 0
                    : selectedArchanas.length > 0
                )
                  ? "bg-gradient-to-r from-[#b86c18] to-[#e8a151] hover:shadow-lg cursor-pointer"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              {activeTab === "donations"
                ? selectedDonations.length > 0
                  ? "Proceed with Donation"
                  : "Select Donation"
                : selectedArchanas.length > 0
                  ? "Proceed with Archana"
                  : "Select Archana"}{" "}
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
