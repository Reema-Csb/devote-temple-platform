"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import AppShell from "@/components/layout/AppShell";
import Link from "next/link";
import { FaSearch } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { getTemples, type TempleCard } from "@/lib/temple-api";
import { useLanguage } from "@/context/LanguageContext";

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL;

async function getPresignedImageUrl(image?: string) {
  if (!image) return "";

  let imageKey = image;

  if (image.startsWith("https://s3.amazonaws.com/devotee-app-assets/")) {
    imageKey = image.replace(
      "https://s3.amazonaws.com/devotee-app-assets/",
      "",
    );
  }

  if (!imageKey.startsWith("temples/")) return image;

  if (!API_GATEWAY_URL) {
    console.error("NEXT_PUBLIC_API_GATEWAY_URL is missing");
    return "";
  }

  const response = await fetch(
    `${API_GATEWAY_URL}/upload/presigned-url?key=${encodeURIComponent(imageKey)}`,
  );

  if (!response.ok) {
    console.error("Presigned URL failed:", imageKey);
    return "";
  }

  const data = await response.json();
  return data.url ?? "";
}

const DEFAULT_SEARCHES = [
  "Kashi Vishwanath",
  "Tirupati Balaji",
  "Meenakshi",
  "Somnath Temple",
];

export default function TemplesPage() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [searchedValue, setSearchedValue] = useState("");
  const [allTemples, setAllTemples] = useState<TempleCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window === "undefined") return DEFAULT_SEARCHES;
    const saved = localStorage.getItem("recentTempleSearches");
    return saved ? JSON.parse(saved) : DEFAULT_SEARCHES;
  });

  const temples: TempleCard[] = allTemples.filter((temple) => {
    if (temple.deleted) return false;
    if (temple.isActive === false) return false;
    if (!searchedValue) return true;
    const value = searchedValue.toLowerCase();
    return (
      temple.name?.toLowerCase().includes(value) ||
      temple.deity?.toLowerCase().includes(value) ||
      temple.description?.toLowerCase().includes(value) ||
      temple.templeLocation?.city?.toLowerCase().includes(value) ||
      temple.templeLocation?.state?.toLowerCase().includes(value) ||
      temple.templeLocation?.country?.toLowerCase().includes(value)
    );
  });

  useEffect(() => {
    localStorage.setItem(
      "recentTempleSearches",
      JSON.stringify(recentSearches),
    );
  }, [recentSearches]);
  useEffect(() => {
    async function loadTemples() {
      try {
        setIsLoading(true);
        const data = await getTemples();

        const dataWithImages = await Promise.all(
          data.map(async (temple) => ({
            ...temple,
            image: await getPresignedImageUrl(
              temple.imageUrls?.[0] || temple.imageUrl || temple.image,
            ),
          })),
        );

        setAllTemples(dataWithImages);
        setError(false);
      } catch (err) {
        console.error("Explore temples failed:", err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    }

    loadTemples();
  }, []);

  const handleSearch = () => {
    const value = search.trim();
    if (!value) {
      setSearchedValue("");
      return;
    }
    setSearchedValue(value);
    setRecentSearches((prev) => {
      const filtered = prev.filter(
        (item) => item.toLowerCase() !== value.toLowerCase(),
      );
      return [value, ...filtered].slice(0, 8);
    });
  };

  const handleRecentSearch = (item: string) => {
    setSearch(item);
    setSearchedValue(item);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-semibold">{t.loadingTemplesText}</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-red-500 text-2xl">{t.failedToLoadTemples}</h1>
      </div>
    );
  }

  function getTempleImage(temple: TempleCard): string {
    return (
      temple.imageUrls?.[0] ||
      temple.imageUrl ||
      temple.image ||
      "/placeholder-temple.svg"
    );
  }

  return (
    <AppShell title={t.homeScreen}>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl p-8 shadow-md mb-8">
          <div className="flex justify-center">
            <div className="relative w-full max-w-2xl">
              <span className="absolute left-4 top-1/2 -translate-y-1/2">
                <FaSearch
                  className="text-xl text-gray-700"
                  aria-hidden="true"
                />
              </span>

              <input
                value={search}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearch(value);

                  if (!value.trim()) {
                    setSearchedValue("");
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
                placeholder="Search temples..."
                aria-label="Search temples"
                className="w-full pl-12 pr-28 py-4 rounded-2xl border-2 border-[#7a2e0e]
                hover:border-[#e09728] bg-[#f5efe6] text-gray-800
                focus:outline-none focus:ring-1 focus:ring-orange-400"
              />

              <button
                onClick={handleSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2
                bg-gradient-to-r from-[#7a2e0e] to-[#e09728]
                hover:from-[#5a200a] hover:to-[#c87c1a]
                text-white px-6 py-2 rounded-xl
                transition-all duration-300 cursor-pointer"
              >
                {t.searchBtn}
              </button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-white p-4 rounded-xl shadow h-fit">
            <h3 className="text-sm font-semibold mb-3 text-gray-500">
              {t.recentSearchesLabel}
            </h3>

            {recentSearches.length === 0 ? (
              <p className="text-sm text-gray-400">{t.noRecentSearches}</p>
            ) : (
              recentSearches.map((item, i) => (
                <div
                  key={i}
                  className="group flex justify-between items-center text-sm py-2 px-2 rounded-lg
                  border-b transition-all duration-200
                  hover:bg-gray-100 hover:text-[#e09728]"
                >
                  <span
                    onClick={() => handleRecentSearch(item)}
                    className="font-medium cursor-pointer flex-1"
                  >
                    {item}
                  </span>

                  <button
                    onClick={() =>
                      setRecentSearches((prev) =>
                        prev.filter((_, index) => index !== i),
                      )
                    }
                    className="opacity-0 group-hover:opacity-100 transition cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="md:col-span-3">
            {!searchedValue ? (
              <>
                <h2 className="mb-4 font-semibold text-xl">
                  {t.mostSearchedTemples}
                </h2>

                <div className="grid md:grid-cols-3 gap-6">
                  {temples.slice(0, 6).map((temple) => (
                    <div
                      key={temple.id}
                      className="bg-white rounded-xl p-4 shadow
                      hover:shadow-xl hover:-translate-y-1 transition"
                    >
                      {getTempleImage(temple) ? (
                        <Image
                          src={temple.image}
                          width={420}
                          height={128}
                          unoptimized
                          alt={`${temple.name} temple`}
                          className="h-32 w-full object-cover rounded mb-3"
                        />
                      ) : (
                        <div className="h-32 w-full rounded bg-[#e7dcc8] mb-3 flex items-center justify-center">
                          No Image
                        </div>
                      )}

                      <h3 className="font-semibold">{temple.name}</h3>

                      <p className="text-sm text-gray-500 mb-3 flex items-center gap-2">
                        <FaLocationDot
                          className="text-gray-500"
                          aria-hidden="true"
                        />
                        {[
                          temple.templeLocation?.city,
                          temple.templeLocation?.state,
                          temple.templeLocation?.country,
                        ]
                          .filter(Boolean)
                          .join(", ") || "Unknown Location"}
                      </p>

                      <Link href={`/temples/${temple.id}`}>
                        <button
                          className="w-full border border-gray-400 text-black py-2 rounded-lg
                          hover:border-[#e09728] hover:text-[#e09728] transition"
                        >
                          {t.viewTemple} →
                        </button>
                      </Link>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h2 className="mb-4 font-semibold text-xl">
                  {t.searchResultsFor} &quot;{searchedValue}&quot;
                </h2>

                {temples.length === 0 ? (
                  <p className="text-gray-500">{t.noTemplesFound}</p>
                ) : (
                  <div className="grid md:grid-cols-3 gap-6">
                    {temples.map((temple) => (
                      <div
                        key={temple.id}
                        className="bg-white rounded-xl p-4 shadow
                        hover:shadow-xl hover:-translate-y-1 transition"
                      >
                        {getTempleImage(temple) ? (
                          <Image
                            src={temple.image}
                            width={420}
                            height={128}
                            unoptimized
                            alt={`${temple.name} temple`}
                            className="h-32 w-full object-cover rounded mb-3"
                          />
                        ) : (
                          <div className="h-32 w-full rounded bg-[#e7dcc8] mb-3 flex items-center justify-center">
                            No Image
                          </div>
                        )}

                        <h3 className="font-semibold">{temple.name}</h3>

                        <p className="text-sm text-gray-500 mb-3 flex items-center gap-2">
                          <FaLocationDot
                            className="text-gray-500"
                            aria-hidden="true"
                          />
                          {[
                            temple.templeLocation?.city,
                            temple.templeLocation?.state,
                            temple.templeLocation?.country,
                          ]
                            .filter(Boolean)
                            .join(", ") || "Unknown Location"}
                        </p>

                        <Link href={`/temples/${temple.id}`}>
                          <button
                            className="w-full border border-gray-400 text-black py-2 rounded-lg
                            hover:border-[#e09728] hover:text-[#e09728] transition"
                          >
                            {t.viewTemple} →
                          </button>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
