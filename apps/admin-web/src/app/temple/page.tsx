"use client";

import { useRouter } from "next/navigation";

import {
  MoreVertical,
  Plus,
  Search,
  Filter,
  Pencil,
  Trash2,
} from "lucide-react";
import { getTemples, type TempleCard } from "@/lib/temple-api";
import { useEffect, useMemo, useRef, useState } from "react";
import { useGetTransactionsQuery } from "@/store/api/paymentApi";
import AdminShell from "@/components/layout/AdminShell";

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

  const response = await fetch(
    `${API_GATEWAY_URL}/upload/presigned-url?key=${encodeURIComponent(imageKey)}`,
  );

  if (!response.ok) return "";

  const data = await response.json();
  return data.url ?? "";
}

const API_URL =
  process.env.NEXT_PUBLIC_TEMPLE_API_URL ?? "http://127.0.0.1:3000";

export default function AdminTemplePage() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);

  const [tempState, setTempState] = useState<string[]>([]);
  const [tempStatus, setTempStatus] = useState("All");

  const [selectedState, setSelectedState] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [tempDeity, setTempDeity] = useState<string[]>([]);
  const [selectedDeity, setSelectedDeity] = useState<string[]>([]);

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [deletedTempleIds, setDeletedTempleIds] = useState<string[]>([]);
  const [allTemples, setAllTemples] = useState<TempleCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const { data: transactions = [] } = useGetTransactionsQuery();

  // FETCH TEMPLES
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
        console.error("Admin temples failed:", err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    }

    loadTemples();
  }, []);
  const stateOptions = useMemo<string[]>(() => {
    const states: string[] = allTemples
      .map((temple) => temple.templeLocation?.state)
      .filter((state: any): state is string => Boolean(state));

    return ["All", ...Array.from(new Set<string>(states))];
  }, [allTemples]);
  const deityOptions = useMemo<string[]>(() => {
    const deities: string[] = allTemples
      .map((temple) => temple.deity)
      .filter((deity: any): deity is string => Boolean(deity));

    return ["All", ...Array.from(new Set<string>(deities))];
  }, [allTemples]);
  // FILTER TEMPLES
  const temples: TempleCard[] = useMemo(() => {
    const visibleTemples = allTemples.filter(
      (temple) => !temple.deleted && !deletedTempleIds.includes(temple.id),
    );

    const value = search.toLowerCase();

    return visibleTemples.filter((temple) => {
      const matchesSearch =
        !search.trim() ||
        temple.name?.toLowerCase().includes(value) ||
        temple.deity?.toLowerCase().includes(value) ||
        temple.templeLocation?.city?.toLowerCase().includes(value) ||
        temple.templeLocation?.state?.toLowerCase().includes(value);

      const matchesState =
        selectedState.length === 0 ||
        selectedState.includes("All") ||
        selectedState.includes(temple.templeLocation?.state || "");
      const matchesDeity =
        selectedDeity.length === 0 ||
        selectedDeity.includes("All") ||
        selectedDeity.includes(temple.deity || "");

      const matchesStatus =
        selectedStatus === "All" ||
        (selectedStatus === "Active" && temple.isActive) ||
        (selectedStatus === "Inactive" && !temple.isActive);

      return matchesSearch && matchesState && matchesStatus && matchesDeity;
    });
  }, [allTemples, search, selectedState, selectedStatus, deletedTempleIds]);
  const templeRevenueMap = useMemo(() => {
    const map = new Map<string, number>();

    transactions
      .filter((tx) => tx.status === "Success" || tx.paymentStatus === "success")
      .forEach((tx) => {
        if (!tx.templeId) return;

        map.set(
          tx.templeId,
          (map.get(tx.templeId) || 0) + Number(tx.amount || 0),
        );
      });

    return map;
  }, [transactions]);
  // DELETE TEMPLE
  const handleDeleteTemple = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this temple?",
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`${API_URL}/temples/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      setDeletedTempleIds((prev) => [...prev, id]);
      setOpenMenu(null);

      alert("Temple permanently deleted");
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to delete temple");
    }
  };

  // LOADING
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f1e8]">
        <h1 className="text-2xl font-semibold text-[#2c1810]">
          Loading temples...
        </h1>
      </div>
    );
  }

  // ERROR
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f1e8]">
        <h1 className="text-2xl text-red-500">Failed to load temples</h1>
      </div>
    );
  }

  return (
    <AdminShell>
      <div
        className="min-h-screen bg-[#f7f1e8] p-8"
        onClick={() => {
          setOpenMenu(null);
          setShowFilter(false);
        }}
      >
        {" "}
        {/* HEADER */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-[#2c1810]">
              Temples Directory
            </h1>

            <p className="mt-2 text-[#8B7355]">
              Manage all temples on the platform.
            </p>
          </div>

          {/* CREATE BUTTON */}
          <button
            onClick={() => router.push("/create")}
            className="flex items-center gap-2 rounded-xl bg-[#c86428] px-6 py-4 font-semibold text-white transition hover:bg-[#b45820]"
          >
            <Plus size={20} />
            Create New Temple
          </button>
        </div>
        {/* TABLE CARD */}
        <div className="overflow-visible rounded-2xl border border-[#E5D5B5] bg-white shadow-sm">
          {" "}
          {/* SEARCH */}
          <div className="relative flex items-center gap-4 border-b border-[#eee2cf] p-5">
            {" "}
            <div className="relative w-[450px]">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B7355]"
                size={18}
              />

              <input
                type="text"
                placeholder="Search temples..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-12 w-full rounded-xl border border-[#dcc9a9] bg-[#faf6ef] pl-12 pr-4 outline-none focus:border-[#c86428]"
              />
            </div>
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFilter(!showFilter);
                }}
                className="flex h-12 items-center gap-2 rounded-xl border border-[#dcc9a9] px-5 text-[#2c1810] transition hover:bg-[#faf6ef]"
              >
                <Filter size={18} />
                Filter
              </button>

              {showFilter && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute left-0 top-14 z-[9999] w-[240px] rounded-xl border border-[#E5D5B5] bg-white p-4 shadow-lg"
                >
                  <div className="absolute -top-3 left-8 h-6 w-6 rotate-45 border-l border-t border-[#E5D5B5] bg-white"></div>

                  <h3 className="mb-4 text-base font-semibold text-[#2c1810]">
                    {" "}
                    Filter Temples
                  </h3>

                  <div className="mb-4">
                    <label className="mb-2 block font-semibold text-[#2c1810]">
                      Location (State)
                    </label>

                    <div className="max-h-32 space-y-2 overflow-y-auto rounded-xl border border-[#dcc9a9] bg-[#faf6ef] p-3">
                      {stateOptions.map((state) => (
                        <label
                          key={state}
                          className="flex items-center gap-2 text-sm text-[#2c1810]"
                        >
                          <input
                            type="checkbox"
                            checked={tempState.includes(state)}
                            onChange={() => {
                              if (state === "All") {
                                setTempState(["All"]);
                              } else {
                                setTempState((prev) =>
                                  prev.includes(state)
                                    ? prev.filter((item) => item !== state)
                                    : [
                                        ...prev.filter(
                                          (item) => item !== "All",
                                        ),
                                        state,
                                      ],
                                );
                              }
                            }}
                          />

                          {state}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="mb-2 block font-semibold text-[#2c1810]">
                      Deity
                    </label>

                    <div className="max-h-32 space-y-2 overflow-y-auto rounded-xl border border-[#dcc9a9] bg-[#faf6ef] p-3">
                      {deityOptions.map((deity) => (
                        <label
                          key={deity}
                          className="flex items-center gap-2 text-sm text-[#2c1810]"
                        >
                          <input
                            type="checkbox"
                            checked={tempDeity.includes(deity)}
                            onChange={() => {
                              if (deity === "All") {
                                setTempDeity(["All"]);
                              } else {
                                setTempDeity((prev) =>
                                  prev.includes(deity)
                                    ? prev.filter((item) => item !== deity)
                                    : [
                                        ...prev.filter(
                                          (item) => item !== "All",
                                        ),
                                        deity,
                                      ],
                                );
                              }
                            }}
                          />

                          {deity}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="mb-5">
                    <label className="mb-2 block font-semibold text-[#2c1810]">
                      Status
                    </label>

                    <div className="space-y-2 rounded-xl border border-[#dcc9a9] bg-[#faf6ef] p-3">
                      {["All", "Active", "Inactive"].map((status) => (
                        <label
                          key={status}
                          className="flex items-center gap-2 text-sm text-[#2c1810]"
                        >
                          <input
                            type="radio"
                            name="status"
                            checked={tempStatus === status}
                            onChange={() => setTempStatus(status)}
                          />

                          {status === "All" ? "All Status" : status}
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedState(tempState);
                      setSelectedStatus(tempStatus);
                      setSelectedDeity(tempDeity);
                      setShowFilter(false);
                    }}
                    className="h-11 w-full rounded-xl bg-[#c86428] text-sm font-semibold text-white hover:bg-[#b45820]"
                  >
                    Apply Filter
                  </button>
                </div>
              )}
            </div>
          </div>
          {/* TABLE */}
          <div className="overflow-x-visible">
            <table className="w-full">
              <thead className="bg-[#f8f3eb]">
                <tr className="text-left text-sm uppercase tracking-wide text-[#8B7355]">
                  <th className="px-6 py-5">Temple</th>
                  <th className="px-6 py-5">Location</th>
                  <th className="px-6 py-5">Deity</th>
                  <th className="px-6 py-5">Offerings</th>
                  <th className="px-6 py-5">Revenue</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {temples.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-gray-500">
                      No temples found
                    </td>
                  </tr>
                ) : (
                  temples.map((temple) => (
                    <tr
                      key={temple.id}
                      onClick={() =>
                        router.push(`/temple-detail?id=${temple.id}`)
                      }
                      className="cursor-pointer border-t border-[#f1e6d5] transition hover:bg-[#fcfaf7]"
                    >
                      {/* TEMPLE */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          {/* IMAGE */}
                          {temple.image ? (
                            <img
                              src={temple.image}
                              alt={temple.name}
                              className="h-14 w-14 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="h-14 w-14 rounded-xl bg-[#e7dcc8]" />
                          )}

                          <div>
                            <p className="font-semibold text-[#2c1810]">
                              {temple.name}
                            </p>

                            <p className="text-sm text-[#8B7355]">
                              {temple.description?.slice(0, 40) ||
                                "No description"}
                              ...
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* LOCATION */}
                      <td className="px-6 py-5 text-[#8B7355]">
                        {[
                          temple.templeLocation?.city,
                          temple.templeLocation?.state,
                          temple.templeLocation?.country,
                        ]
                          .filter(Boolean)
                          .join(", ") || "Unknown"}
                      </td>

                      {/* DEITY */}
                      <td className="px-6 py-5 text-[#2c1810]">
                        {temple.deity || "N/A"}
                      </td>

                      {/* OFFERINGS */}
                      <td className="px-6 py-5 font-semibold text-[#2c1810]">
                        {temple.templeOfferings?.length ??
                          temple.offeringsCount ??
                          0}{" "}
                      </td>

                      {/* REVENUE */}
                      <td className="px-6 py-5 font-semibold text-[#2c1810]">
                        ₹
                        {Number(
                          templeRevenueMap.get(temple.id) || 0,
                        ).toLocaleString("en-IN")}{" "}
                      </td>

                      {/* STATUS */}
                      <td className="px-6 py-5">
                        <span
                          className={`rounded-full px-4 py-1 text-sm font-medium ${
                            temple.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {temple.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td className="relative overflow-visible px-6 py-5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();

                            setOpenMenu(
                              openMenu === temple.id ? null : temple.id,
                            );
                          }}
                          className="rounded-lg p-2 transition hover:bg-[#f5eee4]"
                        >
                          <MoreVertical size={18} className="text-[#8B7355]" />
                        </button>

                        {openMenu === temple.id && (
                          <div className="absolute right-10 top-12 z-[9999] w-44 overflow-visible rounded-xl border border-[#E5D5B5] bg-white shadow-2xl">
                            {/* EDIT */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/create?id=${temple.id}`);
                              }}
                              className="flex w-full items-center gap-3 px-4 py-3 text-sm transition hover:bg-[#f8f3eb]"
                            >
                              <Pencil size={16} />
                              Edit Temple
                            </button>

                            {/* DELETE */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTemple(temple.id);
                              }}
                              className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 transition hover:bg-red-50"
                            >
                              <Trash2 size={16} />
                              Remove Temple
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
