// home page

"use client";

import Image from "next/image";
import Link from "next/link";
import { FaLocationDot } from "react-icons/fa6";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays } from "lucide-react";
import {
  requestNotificationPermission,
  listenForForegroundMessages,
} from "@/lib/firebase-messaging";
import { getTemples, type TempleCard } from "@/lib/temple-api";
import AppShell from "@/components/layout/AppShell";
import { useLanguage } from "@/context/LanguageContext";

type HomeFestival = {
  id: string;
  templeId: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  imageUrl?: string;
  location?: string;
  status: "upcoming" | "ongoing" | "completed";
  specialSevaCount?: number;
  isActive?: boolean;
  deleted?: boolean;
  temple?: {
    id: string;
    name: string;
  };
};

const API_GATEWAY_URL =
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ?? "http://127.0.0.1:3005";

const TEMPLE_SERVICE_URL =
  process.env.NEXT_PUBLIC_TEMPLE_SERVICE_URL ?? "http://127.0.0.1:3001";

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
    console.error("Festival presigned URL error:", error);
    return "";
  }
}

async function getFestivalSevas(festivalId: string) {
  const response = await fetch(
    `${TEMPLE_SERVICE_URL}/festival-sevas/festival/${festivalId}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch festival sevas");
  }

  return response.json();
}

export default function HomePage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [temples, setTemples] = useState<TempleCard[]>([]);
  const [featuredTemple, setFeaturedTemple] = useState<TempleCard | null>(null);
  const [festivals, setFestivals] = useState<HomeFestival[]>([]);
  const [festivalsLoading, setFestivalsLoading] = useState(true);
  const [festivalImageUrls, setFestivalImageUrls] = useState<
    Record<string, string>
  >({});

  const [selectedFestival, setSelectedFestival] = useState<HomeFestival | null>(
    null,
  );

  const [festivalSevas, setFestivalSevas] = useState<any[]>([]);
  const [selectedSevas, setSelectedSevas] = useState<string[]>([]);
  const [showSevaModal, setShowSevaModal] = useState(false);
  useEffect(() => {
    async function fetchTemples() {
      try {
        const data = await getTemples();

        const activeTemples = data.filter(
          (temple) => temple.isActive !== false && temple.deleted !== true,
        );
        console.log(
          activeTemples.map((temple) => ({
            name: temple.name,
            image: temple.image,
            imageUrl: temple.imageUrl,
            imageUrls: temple.imageUrls,
          })),
        );

        setTemples(activeTemples);
        const meenakshiTemple = activeTemples.find(
          (temple) => temple.name === "Meenakshi Temple",
        );

        setFeaturedTemple(activeTemples[0] || null);
      } catch (error) {
        console.error("Temple API error:", error);
        setTemples([]);
      }
    }

    fetchTemples();
  }, []);

  useEffect(() => {
    requestNotificationPermission();
    listenForForegroundMessages();
  }, []);

  useEffect(() => {
    async function fetchUpcomingFestivals() {
      try {
        setFestivalsLoading(true);

        const response = await fetch(`${TEMPLE_SERVICE_URL}/event-festivals`);

        if (!response.ok) {
          throw new Error(`Failed to load festivals: ${response.status}`);
        }

        const data: HomeFestival[] = await response.json();

        const statusOrder = {
          ongoing: 1,
          upcoming: 2,
          completed: 3,
        };

        const visibleFestivals = data
          .filter((festival) => {
            const status = getFestivalStatus(
              festival.startDate,
              festival.endDate,
            );

            return (
              festival.isActive !== false &&
              festival.deleted !== true &&
              status !== "completed"
            );
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

            const statusDifference =
              statusOrder[firstStatus] - statusOrder[secondStatus];

            if (statusDifference !== 0) {
              return statusDifference;
            }

            return (
              new Date(firstFestival.startDate).getTime() -
              new Date(secondFestival.startDate).getTime()
            );
          });

        setFestivals(visibleFestivals);
      } catch (error) {
        console.error("Festival API error:", error);
        setFestivals([]);
      } finally {
        setFestivalsLoading(false);
      }
    }

    fetchUpcomingFestivals();
  }, []);

  useEffect(() => {
    let isActive = true;

    const loadFestivalImages = async () => {
      const entries = await Promise.all(
        festivals.map(async (festival) => {
          if (!festival.imageUrl) {
            return [festival.id, ""] as const;
          }

          const signedUrl = await getPresignedFestivalImageUrl(
            festival.imageUrl,
          );

          return [festival.id, signedUrl] as const;
        }),
      );

      if (isActive) {
        setFestivalImageUrls(Object.fromEntries(entries));
      }
    };

    loadFestivalImages();

    return () => {
      isActive = false;
    };
  }, [festivals]);

  const formatFestivalDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    });
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

  const handleFestivalClick = async (festival: HomeFestival) => {
    try {
      const sevas = await getFestivalSevas(festival.id);


      if (sevas.length === 1) {
        router.push(
          `/dashboard/donation?` +
            new URLSearchParams({
              templeId: festival.templeId,
              templeName: festival.temple?.name ?? "",
              templeLocation: festival.location ?? "",
              festivalId: festival.id,
              festivalName: festival.name,
              festivalImageUrl: festival.imageUrl ?? "",
              offeringType: "festival",
              offeringDate: festival.startDate,

              // Notice the names here
              sevaIds: sevas[0].id,
              sevaNames: sevas[0].name,
            }).toString(),
        );
      } else {
        setSelectedFestival(festival);
        setFestivalSevas(sevas);
        setSelectedSevas([]); // Reset previous selections
        setShowSevaModal(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleContinue = () => {
    if (!selectedFestival || selectedSevas.length === 0) return;

    const selectedSevaNames = festivalSevas
      .filter((seva: any) => selectedSevas.includes(seva.id))
      .map((seva: any) => seva.name);

    router.push(
      `/dashboard/donation?` +
        new URLSearchParams({
          templeId: selectedFestival.templeId,
          templeName: selectedFestival.temple?.name ?? "",
          templeLocation: selectedFestival.location ?? "",
          festivalId: selectedFestival.id,
          festivalName: selectedFestival.name,
          festivalImageUrl: selectedFestival.imageUrl ?? "",
          offeringType: "festival",
          offeringDate: selectedFestival.startDate,
          sevaIds: selectedSevas.join(","),
          sevaNames: selectedSevaNames.join(","),
        }).toString(),
    );
  };

  return (
    <AppShell title={t.homeScreen}>
      <div className="min-h-screen bg-[#f5efe6]">
        <div className="p-6 max-w-6xl mx-auto">
          <div className="bg-gradient-to-r from-[#1e0b02] to-[#7a2508] text-white p-8 md:p-12 rounded-[32px] mb-8 shadow-xl min-h-[220px] flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 bg-[#d99510] px-4 py-2 rounded-full text-sm font-semibold mb-4 w-fit">
              ✦ {t.featuredTemple}
            </div>

            <h2 className="text-3xl md:text-4xl font-bold mb-3 leading-tight">
              {featuredTemple?.name || t.loadingTemple}
            </h2>

            <div className="text-sm md:text-base text-gray-200 leading-6 max-w-2xl mb-6">
              {featuredTemple?.description ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: featuredTemple.description,
                  }}
                />
              ) : (
                t.templeDetailsLoading
              )}
            </div>

            {featuredTemple && (
              <Link href={`/temples/${featuredTemple.id}`}>
                <button className="bg-gradient-to-r from-[#d46d24] to-[#d89b10] px-8 py-3 rounded-full text-base font-semibold hover:opacity-90 transition cursor-pointer w-fit">
                  {t.offerSevaBtn}
                </button>
              </Link>
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">
                  {t.mostOfferedTemples}
                </h3>

                <Link
                  href="/temples"
                  className="inline-flex items-center gap-2 text-[#ba7104] font-medium hover:underline cursor-pointer"
                >
                  {t.viewAll}
                </Link>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {temples.slice(0, 4).map((temple) => (
                  <Link key={temple.id} href={`/temples/${temple.id}`}>
                    <div className="bg-white rounded-2xl p-4 shadow hover:shadow-xl hover:-translate-y-1 transition cursor-pointer">
                      {temple.image ? (
                        <Image
                          src={temple.image}
                          width={520}
                          height={160}
                          unoptimized
                          className="h-48 w-full object-cover rounded-xl mb-3"
                          alt={temple.name}
                        />
                      ) : (
                        <div className="mb-3 flex h-48 w-full items-center justify-center rounded-xl bg-[#e7dcc8] text-[#7b5b3e]">
                          No Image
                        </div>
                      )}

                      <h4 className="font-semibold">{temple.name}</h4>

                      <p className="text-sm text-gray-500 mb-3 flex items-center gap-2">
                        <FaLocationDot /> {temple.location || "India"}
                      </p>

                      <button className="w-full border py-2 rounded-lg hover:border-[#e09728] hover:text-[#e09728]">
                        {t.viewTemple}
                      </button>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-lg">{t.upcomingFestivals}</h3>

                <Link
                  href="/festivals"
                  className="inline-flex items-center gap-1 text-sm font-medium text-[#ba7104] transition hover:underline"
                >
                  {t.viewAll}
                </Link>
              </div>

              <div className="space-y-3">
                {festivalsLoading ? (
                  <div className="rounded-xl bg-white p-5 text-center text-sm text-gray-500 shadow">
                    Loading festivals...
                  </div>
                ) : festivals.length === 0 ? (
                  <div className="rounded-xl bg-white p-5 text-center text-sm text-gray-500 shadow">
                    No ongoing or upcoming festivals.{" "}
                  </div>
                ) : (
                  festivals.slice(0, 4).map((festival) => {
                    const status = getFestivalStatus(
                      festival.startDate,
                      festival.endDate,
                    );

                    return (
                      <div
                        key={festival.id}
                        onClick={() => handleFestivalClick(festival)}
                        className="flex min-h-[76px] cursor-pointer items-center justify-between gap-3 rounded-xl border border-[#eadcc8] bg-white px-3 py-2 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#d89b10] hover:shadow-md"
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          {" "}
                          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-[#efe4d2]">
                            {" "}
                            {festivalImageUrls[festival.id] ? (
                              <Image
                                src={festivalImageUrls[festival.id]}
                                alt={festival.name}
                                fill
                                unoptimized
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[#ba7104] font-bold">
                                {festival.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4 className="truncate text-base font-semibold text-[#2f1c0f]">
                              {" "}
                              {festival.name}
                            </h4>

                            <p className="truncate text-xs text-gray-500">
                              {" "}
                              {festival.temple?.name || festival.location}
                            </p>

                            {festival.specialSevaCount ? (
                              <p className="mt-1 text-xs font-medium text-[#8a6a45]">
                                {festival.specialSevaCount} Special Seva
                                {festival.specialSevaCount > 1 ? "s" : ""}
                              </p>
                            ) : null}
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-col items-end gap-2">
                          <span className="inline-flex min-w-[68px] items-center justify-center whitespace-nowrap rounded-full bg-[#f6ebda] px-3 py-1.5 text-xs font-semibold text-[#d06d22]">
                            {formatFestivalDate(festival.startDate)}
                          </span>

                          <span
                            className={`inline-flex rounded-full px-2.5 py-[2px] text-[11px] font-medium ${
                              status === "ongoing"
                                ? "bg-green-100 text-green-700"
                                : "bg-orange-100 text-orange-600"
                            }`}
                          >
                            {status === "ongoing" ? "Ongoing" : "Upcoming"}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {showSevaModal && selectedFestival && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">
            {/* Heading */}
            <h2 className="text-center text-3xl font-bold text-[#2f1c0f]">
              Select Special Sevas
            </h2>

            {/* Festival */}
            <div className="mt-5 text-center">
              <h3 className="text-xl font-semibold text-[#2f1c0f]">
                {selectedFestival.name}
              </h3>

              <div className="mt-3 flex items-center justify-center gap-2 text-[#7a5c3e]">
                <FaLocationDot className="text-[#d46d24]" />
                <span>{selectedFestival.temple?.name}</span>
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
            <div className="mt-6 space-y-3">
              {festivalSevas.map((seva: any) => (
                <div
                  key={seva.id}
                  onClick={() => {
                    setSelectedSevas((prev) =>
                      prev.includes(seva.id)
                        ? prev.filter((id) => id !== seva.id)
                        : [...prev, seva.id],
                    );
                  }}
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
              ))}
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
