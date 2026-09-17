"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaLocationDot } from "react-icons/fa6";
import { CalendarDays } from "lucide-react";
import { useRouter } from "next/navigation";

import AppShell from "@/components/layout/AppShell";
import { useGetTemplesQuery } from "@/store/api/templeApi";
import { useGetEventFestivalsQuery } from "@/store/api/eventFestivalApi";

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL;

type FestivalFilter = "All" | "Upcoming" | "Ongoing";

async function getPresignedFestivalImageUrl(image?: string): Promise<string> {
  if (!image) return "";

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("blob:") ||
    image.startsWith("/")
  ) {
    return image;
  }

  if (!API_GATEWAY_URL) {
    console.error("NEXT_PUBLIC_API_GATEWAY_URL is missing");
    return "";
  }

  try {
    const response = await fetch(
      `${API_GATEWAY_URL}/upload/presigned-url?key=${encodeURIComponent(image)}`,
    );

    if (!response.ok) {
      console.error("Failed to get festival image URL:", response.status);
      return "";
    }

    const data = await response.json();

    return data.url ?? "";
  } catch (error) {
    console.error("Festival image request failed:", error);
    return "";
  }
}

export default function FestivalsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<FestivalFilter>("All");

  const [festivalImageUrls, setFestivalImageUrls] = useState<
    Record<string, string>
  >({});

  const router = useRouter();

  const [selectedFestival, setSelectedFestival] = useState<any>(null);
  const [festivalSevas, setFestivalSevas] = useState<any[]>([]);
  const [selectedSevas, setSelectedSevas] = useState<string[]>([]);
  const [showSevaModal, setShowSevaModal] = useState(false);

  const {
    data: festivals = [],
    isLoading,
    isError,
  } = useGetEventFestivalsQuery();

  const { data: temples = [] } = useGetTemplesQuery("");

  useEffect(() => {
    let isActive = true;

    const loadFestivalImages = async () => {
      const imageEntries = await Promise.all(
        festivals.map(async (festival) => {
          const imageUrl = await getPresignedFestivalImageUrl(
            festival.imageUrl,
          );

          return [festival.id, imageUrl] as const;
        }),
      );

      if (isActive) {
        setFestivalImageUrls(Object.fromEntries(imageEntries));
      }
    };

    loadFestivalImages();

    return () => {
      isActive = false;
    };
  }, [festivals]);

  const openSevaPopup = async (festival: any) => {
    setSelectedFestival(festival);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_TEMPLE_SERVICE_URL}/festival-sevas/festival/${festival.id}`,
      );

      const data = await res.json();

      setFestivalSevas(data.filter((s: any) => s.isActive && !s.deleted));

      setSelectedSevas([]);
      setShowSevaModal(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSevaToggle = (id: string) => {
    setSelectedSevas((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleContinue = () => {
    if (!selectedFestival) return;

    const names = festivalSevas
      .filter((s) => selectedSevas.includes(s.id))
      .map((s) => s.name);

    const params = new URLSearchParams({
      templeId: selectedFestival.templeId,
      templeName: getTempleName(selectedFestival.templeId),
      templeLocation: selectedFestival.location ?? "",
      festivalId: selectedFestival.id,
      festivalName: selectedFestival.name,
      festivalImageUrl: selectedFestival.imageUrl ?? "",
      offeringType: "festival",
      offeringDate: selectedFestival.startDate,
      sevaIds: selectedSevas.join(","),
      sevaNames: names.join(","),
    });

    setShowSevaModal(false);

    router.push(`/dashboard/donation?${params.toString()}`);
    setSelectedFestival(null);
    setFestivalSevas([]);
    setSelectedSevas([]);
  };

  const getFestivalStatus = (
    startDate: string,
    endDate: string,
  ): "upcoming" | "ongoing" | "completed" => {
    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    today.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    if (today < start) return "upcoming";
    if (today > end) return "completed";

    return "ongoing";
  };

  const formatFestivalDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getTempleName = (templeId: string) => {
    const temple = temples.find((item) => item.id === templeId);

    return temple?.name ?? "Temple";
  };

  const filteredFestivals = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return festivals
      .filter((festival) => {
        if (festival.isActive === false) {
          return false;
        }

        const status = getFestivalStatus(festival.startDate, festival.endDate);

        // Do not show completed festivals on the user page.
        if (status === "completed") {
          return false;
        }

        const templeName = getTempleName(festival.templeId);

        const matchesSearch =
          !normalizedSearch ||
          festival.name.toLowerCase().includes(normalizedSearch) ||
          festival.location?.toLowerCase().includes(normalizedSearch) ||
          templeName.toLowerCase().includes(normalizedSearch);

        const matchesFilter =
          selectedFilter === "All" || status === selectedFilter.toLowerCase();

        return matchesSearch && matchesFilter;
      })
      .sort((firstFestival, secondFestival) => {
        const firstStatus = getFestivalStatus(
          firstFestival.startDate,
          firstFestival.endDate,
        );

        const secondStatus = getFestivalStatus(
          secondFestival.startDate,
          secondFestival.endDate,
        );

        if (firstStatus !== secondStatus) {
          return firstStatus === "ongoing" ? -1 : 1;
        }

        return (
          new Date(firstFestival.startDate).getTime() -
          new Date(secondFestival.startDate).getTime()
        );
      });
  }, [festivals, temples, searchTerm, selectedFilter]);

  return (
    <AppShell title="Events & Festivals">
      <main className="min-h-screen bg-[#f7efe4] px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6">
            <h1 className="text-[28px] font-semibold text-[#2f1c0f]">
              Events & Festivals
            </h1>

            <p className="mt-1 text-sm text-[#7a5c3e]">
              Discover upcoming temple festivals and special celebrations.
            </p>
          </div>

          <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-center">
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search festivals or temples..."
              className="w-full rounded-xl border border-[#e2cfae] bg-white px-4 py-3 text-sm text-[#2f1c0f] outline-none focus:border-[#cf5d25] md:max-w-xl"
            />

            <div className="flex flex-wrap gap-3">
              {(["All", "Upcoming", "Ongoing"] as FestivalFilter[]).map(
                (filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setSelectedFilter(filter)}
                    className={`rounded-xl border px-5 py-3 text-sm font-semibold transition-colors ${
                      selectedFilter === filter
                        ? "border-[#cf5d25] bg-[#cf5d25] text-white"
                        : "border-[#e2cfae] bg-white text-[#7a5c3e] hover:border-[#cf5d25]"
                    }`}
                  >
                    {filter}
                  </button>
                ),
              )}
            </div>
          </div>

          {isLoading && (
            <div className="rounded-2xl border border-[#e2cfae] bg-white p-10 text-center">
              <p className="text-sm text-[#8a6a45]">Loading festivals...</p>
            </div>
          )}

          {isError && (
            <div className="rounded-2xl border border-red-200 bg-white p-10 text-center">
              <h2 className="line-clamp-1 text-base font-semibold text-[#2f1c0f]">
                {" "}
                Unable to load festivals
              </h2>

              <p className="mt-2 text-sm text-[#8a6a45]">
                Please refresh the page and try again.
              </p>
            </div>
          )}

          {!isLoading && !isError && filteredFestivals.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[#d9c3a0] bg-white p-12 text-center">
              <div className="text-5xl">🪔</div>

              <h2 className="mt-4 text-lg font-semibold text-[#2f1c0f]">
                No festivals found
              </h2>

              <p className="mt-2 text-sm text-[#8a6a45]">
                There are currently no festivals matching your search.
              </p>
            </div>
          )}

          {!isLoading && !isError && filteredFestivals.length > 0 && (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {" "}
              {filteredFestivals.map((festival) => {
                const status = getFestivalStatus(
                  festival.startDate,
                  festival.endDate,
                );

                const templeName = getTempleName(festival.templeId);

                return (
                  <article
                    key={festival.id}
                    className="group overflow-hidden rounded-[22px] border border-[#e2cfae] bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="relative h-32 overflow-hidden bg-gradient-to-r from-[#8b3515] to-[#321907]">
                      {festivalImageUrls[festival.id] ? (
                        <Image
                          src={festivalImageUrls[festival.id]}
                          alt={festival.name}
                          fill
                          unoptimized
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <span className="text-6xl">🛕</span>
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />

                      {festival.isFeatured && (
                        <span className="absolute left-4 top-4 z-10 rounded-full bg-[#e4a514] px-3 py-1 text-xs font-semibold text-white shadow-sm">
                          ☆ Featured
                        </span>
                      )}

                      <span
                        className={`absolute right-4 top-4 z-10 rounded-full px-3 py-1 text-xs font-semibold text-white shadow-sm ${
                          status === "ongoing"
                            ? "bg-green-500"
                            : "bg-orange-500"
                        }`}
                      >
                        {status === "ongoing" ? "Ongoing" : "Upcoming"}
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col p-4">
                      <div className="flex-1">
                        <h2 className="line-clamp-1 text-xl font-bold text-[#2f1c0f]">
                          {festival.name}
                        </h2>

                        <p className="mt-2 line-clamp-1 text-sm font-semibold text-[#6f4c2f]">
                          🛕 {templeName}
                        </p>

                        <div className="mt-2 space-y-1">
                          <p className="flex items-start gap-2 text-sm text-[#8a6a45]">
                            <span>📍</span>

                            <span className="line-clamp-2">
                              {festival.location || "Temple location"}
                            </span>
                          </p>

                          <p className="flex items-center gap-2 text-sm font-semibold text-[#cf5d25]">
                            <span>📅</span>

                            <span>
                              {formatFestivalDate(festival.startDate)}
                              {festival.endDate &&
                                ` – ${formatFestivalDate(festival.endDate)}`}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-[#eadcc8] pt-2">
                        {" "}
                        <span className="text-sm text-[#8a6a45]">
                          🎟 {festival.specialSevaCount ?? 0} Sevas
                        </span>
                        <button
                          onClick={() => openSevaPopup(festival)}
                          className="rounded-xl bg-[#cf5d25] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#b94d1d]"
                        >
                          Make Donation
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>
      {showSevaModal && selectedFestival && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">
            {/* Heading */}
            <h2 className="text-center text-3xl font-bold text-[#2f1c0f]">
              Select Special Sevas
            </h2>

            {/* Festival Details */}
            <div className="mt-5 text-center">
              <h3 className="text-xl font-semibold text-[#2f1c0f]">
                {selectedFestival.name}
              </h3>

              <div className="mt-3 flex items-center justify-center gap-2 text-[#7a5c3e]">
                <FaLocationDot className="text-[#d46d24]" />
                <span>{getTempleName(selectedFestival.templeId)}</span>
              </div>

              <div className="mt-2 flex items-center justify-center gap-2 text-[#9a8268]">
                <CalendarDays className="h-4 w-4 text-[#d46d24]" />
                <span>
                  {formatFestivalDate(selectedFestival.startDate)} -{" "}
                  {formatFestivalDate(selectedFestival.endDate)}
                </span>
              </div>

              <p className="mt-5 text-center text-sm text-[#8a6a45]">
                Choose one or more special sevas to include with your donation.
              </p>
            </div>

            {/* Sevas */}
            <div className="mt-6 max-h-72 space-y-3 overflow-y-auto">
              {festivalSevas.length === 0 ? (
                <p className="py-6 text-center text-[#8a6a45]">
                  No sevas available.
                </p>
              ) : (
                festivalSevas.map((seva) => (
                  <div
                    key={seva.id}
                    onClick={() => handleSevaToggle(seva.id)}
                    className={`cursor-pointer rounded-xl border p-4 transition ${
                      selectedSevas.includes(seva.id)
                        ? "border-[#d46d24] bg-orange-50"
                        : "border-[#ead9c0] hover:border-[#d46d24]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#2f1c0f]">
                        {seva.name}
                      </span>

                      <input
                        type="checkbox"
                        checked={selectedSevas.includes(seva.id)}
                        readOnly
                        className="h-5 w-5 accent-[#d46d24]"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Selected Count */}
            <p className="mt-5 text-center text-sm text-[#7a5c3e]">
              {selectedSevas.length} seva
              {selectedSevas.length !== 1 ? "s" : ""} selected
            </p>

            {/* Buttons */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowSevaModal(false);
                  setSelectedFestival(null);
                  setFestivalSevas([]);
                  setSelectedSevas([]);
                }}
                className="rounded-xl border border-[#d6c1a3] px-6 py-2 text-[#5b4430] hover:bg-[#faf5ef]"
              >
                Cancel
              </button>

              <button
                onClick={handleContinue}
                disabled={selectedSevas.length === 0}
                className="rounded-xl bg-[#d46d24] px-6 py-2 text-white transition hover:bg-[#b95d1e] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
