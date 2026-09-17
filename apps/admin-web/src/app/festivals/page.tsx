// festival page

"use client";

import AdminShell from "@/components/layout/AdminShell";
import { useEffect, useRef, useState } from "react";
import {
  ImageIcon,
  Trash2,
  MoreVertical,
  Pencil,
  ChevronDown,
  Check,
  Search,
  CalendarDays,
  MapPin,
  Landmark,
} from "lucide-react";
import DatePicker from "@/components/common/DatePicker";
import { useGetTemplesQuery } from "@/store/api/templeApi";
import {
  type EventFestival,
  useCreateEventFestivalMutation,
  useCreateFestivalSevasBulkMutation,
  useDeleteEventFestivalMutation,
  useDeleteFestivalSevasByFestivalMutation,
  useGetEventFestivalsQuery,
  useLazyGetFestivalSevasByFestivalQuery,
  useUpdateEventFestivalMutation,
} from "@/store/api/eventFestivalApi";
import Image from "next/image";
import { useRouter } from "next/navigation";
const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL;

async function uploadFestivalImage(file: File): Promise<string> {
  if (!API_GATEWAY_URL) {
    throw new Error("NEXT_PUBLIC_API_GATEWAY_URL is missing");
  }

  const formData = new FormData();
  formData.append("files", file);

  const response = await fetch(`${API_GATEWAY_URL}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(
      (await response.text()) || "Failed to upload festival image",
    );
  }

  const data = await response.json();
  const uploadedKeys = Array.isArray(data.keys) ? data.keys : [];

  return uploadedKeys[0] ?? "";
}
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
    console.error("Presigned festival image request failed:", error);
    return "";
  }
}

export default function FestivalsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [festivalName, setFestivalName] = useState("");
  const [adminRole, setAdminRole] = useState<string | null>(null);
  const [assignedTempleId, setAssignedTempleId] = useState<string | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const { data: temples = [] } = useGetTemplesQuery("");
  const [templeId, setTempleId] = useState("");
  const [isTempleDropdownOpen, setIsTempleDropdownOpen] = useState(false);
  const [templeSearch, setTempleSearch] = useState("");
  const templeDropdownRef = useRef<HTMLDivElement>(null);
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingFestival, setEditingFestival] = useState<EventFestival | null>(
    null,
  );
  const [festivalImageUrls, setFestivalImageUrls] = useState<
    Record<string, string>
  >({});

  const [isFeatured, setIsFeatured] = useState(false);
  const [festivalImage, setFestivalImage] = useState<File | null>(null);
  const [festivalImagePreview, setFestivalImagePreview] = useState("");
  const [createEventFestival, { isLoading: isCreating }] =
    useCreateEventFestivalMutation();
  const [updateEventFestival, { isLoading: isUpdating }] =
    useUpdateEventFestivalMutation();

  const [deleteEventFestival, { isLoading: isDeleting }] =
    useDeleteEventFestivalMutation();

  const [loadFestivalSevas] = useLazyGetFestivalSevasByFestivalQuery();

  const [createFestivalSevasBulk] = useCreateFestivalSevasBulkMutation();

  const [deleteFestivalSevasByFestival] =
    useDeleteFestivalSevasByFestivalMutation();

  const [festivalToDelete, setFestivalToDelete] =
    useState<EventFestival | null>(null);

  const [newSevaName, setNewSevaName] = useState("");
  const [specialSevas, setSpecialSevas] = useState<string[]>([]);
  const [selectedSevas, setSelectedSevas] = useState<string[]>([]);
  const [showSevaInput, setShowSevaInput] = useState(false);

  const [selectedFilter, setSelectedFilter] = useState<
    "All" | "Upcoming" | "Ongoing" | "Completed"
  >("All");

  const { data: festivals = [] } = useGetEventFestivalsQuery();

  useEffect(() => {
    const role = sessionStorage.getItem("adminRole");
    const loggedInTempleId = sessionStorage.getItem("templeId");

    setAdminRole(role);
    setAssignedTempleId(loggedInTempleId);
    setSessionLoaded(true);
  }, []);

  useEffect(() => {
    let isActive = true;

    const loadFestivalImages = async () => {
      const entries = await Promise.all(
        festivals.map(async (festival) => {
          if (!festival.id || !festival.imageUrl) {
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

  const [searchTerm, setSearchTerm] = useState("");

  const selectedTemple = temples.find((temple) => temple.id === templeId);

  const filteredTemples = temples.filter((temple) =>
    temple.name.toLowerCase().includes(templeSearch.toLowerCase()),
  );

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        templeDropdownRef.current &&
        !templeDropdownRef.current.contains(event.target as Node)
      ) {
        setIsTempleDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleFestivalImageChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file");
      event.target.value = "";
      return;
    }

    const maximumSize = 5 * 1024 * 1024;

    if (file.size > maximumSize) {
      alert("Festival image must be smaller than 5 MB");
      event.target.value = "";
      return;
    }

    if (festivalImagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(festivalImagePreview);
    }

    setFestivalImage(file);
    setFestivalImagePreview(URL.createObjectURL(file));
    event.target.value = "";
  };

  const removeFestivalImage = () => {
    if (festivalImagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(festivalImagePreview);
    }

    setFestivalImage(null);
    setFestivalImagePreview("");
  };

  const resetFestivalForm = () => {
    if (festivalImagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(festivalImagePreview);
    }

    setFestivalName("");
    setStartDate("");
    setEndDate("");
    setDescription("");
    setIsFeatured(false);
    setFestivalImage(null);
    setFestivalImagePreview("");
    setNewSevaName("");
    setSpecialSevas([]);
    setSelectedSevas([]);
    setShowSevaInput(false);
    setEditingFestival(null);

    if (adminRole === "temple_admin" && assignedTempleId) {
      handleTempleChange(assignedTempleId);
    } else {
      setTempleId("");
      setLocation("");
    }
  };

  const openCreateFestivalModal = () => {
    resetFestivalForm();
    setShowCreateModal(true);
  };

  const openEditFestivalModal = async (festival: EventFestival) => {
    resetFestivalForm();

    setEditingFestival(festival);
    setFestivalName(festival.name);
    setTempleId(festival.templeId);
    setLocation(festival.location ?? "");
    setStartDate(new Date(festival.startDate).toISOString().slice(0, 10));
    setEndDate(new Date(festival.endDate).toISOString().slice(0, 10));
    setDescription(festival.description ?? "");
    setIsFeatured(Boolean(festival.isFeatured));
    setFestivalImagePreview(festivalImageUrls[festival.id] ?? "");
    setShowCreateModal(true);

    try {
      const savedSevas = await loadFestivalSevas(festival.id).unwrap();

      setSpecialSevas(savedSevas.map((seva) => seva.name));

      setSelectedSevas(
        savedSevas.filter((seva) => seva.isSelected).map((seva) => seva.name),
      );
    } catch (error) {
      console.error("LOAD FESTIVAL SEVAS ERROR:", error);
      setSpecialSevas([]);
      setSelectedSevas([]);
    }
  };

  const closeFestivalModal = () => {
    setShowCreateModal(false);
    resetFestivalForm();
  };

  const handleTempleChange = (selectedTempleId: string) => {
    setTempleId(selectedTempleId);
    setSelectedSevas([]);

    if (!selectedTempleId) {
      setLocation("");
      return;
    }

    const selectedTemple = temples.find(
      (temple) => temple.id === selectedTempleId,
    );

    const templeLocation = selectedTemple?.templeLocation;

    const fullLocation = [
      templeLocation?.addressLine1,
      templeLocation?.addressLine2,
      templeLocation?.city,
      templeLocation?.state,
      templeLocation?.country,
      templeLocation?.postalCode,
    ]
      .filter(Boolean)
      .join(", ");

    setLocation(fullLocation || selectedTemple?.location || "");
  };

  useEffect(() => {
    if (!sessionLoaded) return;

    if (adminRole !== "temple_admin") return;

    if (!assignedTempleId) return;

    if (temples.length === 0) return;

    handleTempleChange(assignedTempleId);
  }, [sessionLoaded, adminRole, assignedTempleId, temples]);
  const handleAddSeva = () => {
    const sevaName = newSevaName.trim();

    if (!sevaName) return;

    const alreadyExists = specialSevas.some(
      (seva) => seva.toLowerCase() === sevaName.toLowerCase(),
    );

    if (alreadyExists) {
      alert("This seva is already added");
      return;
    }

    setSpecialSevas((current) => [...current, sevaName]);

    // Automatically select the newly added seva

    setSelectedSevas((current) => [...current, sevaName]);
    setNewSevaName("");
    setShowSevaInput(false);
  };

  const toggleManualSeva = (sevaName: string) => {
    setSelectedSevas((current) =>
      current.includes(sevaName)
        ? current.filter((seva) => seva !== sevaName)
        : [...current, sevaName],
    );
  };

  const handleRemoveSeva = (sevaName: string) => {
    setSpecialSevas((current) => current.filter((seva) => seva !== sevaName));

    setSelectedSevas((current) => current.filter((seva) => seva !== sevaName));
  };

  const saveFestivalSevas = async (
    festivalId: string,
    selectedTempleId: string,
  ) => {
    if (specialSevas.length === 0) return;

    await createFestivalSevasBulk(
      specialSevas.map((sevaName) => ({
        festivalId,
        templeId: selectedTempleId,
        name: sevaName,
        isSelected: selectedSevas.includes(sevaName),
        isActive: true,
      })),
    ).unwrap();
  };

  const handleSaveFestival = async () => {
    if (!festivalName.trim() || !templeId || !startDate || !endDate) {
      alert("Please fill Festival Name, Temple, Start Date and End Date");
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      alert("End Date cannot be earlier than Start Date");
      return;
    }

    if (!editingFestival && !festivalImage) {
      alert("Please upload a festival image");
      return;
    }

    try {
      const uploadedImageKey = festivalImage
        ? await uploadFestivalImage(festivalImage)
        : editingFestival?.imageUrl;

      if (!uploadedImageKey && !editingFestival) {
        throw new Error("Festival image upload did not return an image key");
      }

      const status = getFestivalStatus(
        new Date(startDate).toISOString(),
        new Date(endDate).toISOString(),
      );

      const body = {
        name: festivalName.trim(),
        templeId,
        description: description.trim(),
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        imageUrl: uploadedImageKey,
        location: location.trim(),
        isFeatured,
        status,
        specialSevaCount: selectedSevas.length,
        isActive: true,
      };

      if (editingFestival) {
        await updateEventFestival({
          id: editingFestival.id,
          body,
        }).unwrap();

        // Remove the old saved sevas.
        await deleteFestivalSevasByFestival(editingFestival.id).unwrap();

        // Save the current seva list again.
        await saveFestivalSevas(editingFestival.id, templeId);
      } else {
        const createdFestival = await createEventFestival(body).unwrap();

        await saveFestivalSevas(createdFestival.id, templeId);
      }

      closeFestivalModal();
    } catch (error) {
      console.error("SAVE FESTIVAL ERROR:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to save festival. Please try again.",
      );
    }
  };

  const handleDeleteFestival = async () => {
    if (!festivalToDelete) return;

    try {
      await deleteEventFestival(festivalToDelete.id).unwrap();

      setFestivalToDelete(null);
      setOpenMenuId(null);
    } catch (error) {
      console.error("DELETE FESTIVAL ERROR:", error);

      alert("Failed to delete the festival. Please try again.");
    }
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
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  const roleBasedFestivals =
    adminRole === "temple_admin"
      ? festivals.filter((festival) => festival.templeId === assignedTempleId)
      : festivals;

  const festivalStats = roleBasedFestivals.reduce(
    (acc, festival) => {
      const status = getFestivalStatus(festival.startDate, festival.endDate);

      if (status === "upcoming") acc.upcoming += 1;
      if (status === "ongoing") acc.ongoing += 1;
      if (status === "completed") acc.completed += 1;

      acc.specialSevas += festival.specialSevaCount ?? 0;

      return acc;
    },
    {
      upcoming: 0,
      ongoing: 0,
      completed: 0,
      specialSevas: 0,
    },
  );

  const statusOrder = {
    ongoing: 1,
    upcoming: 2,
    completed: 3,
  };

  const searchedFestivals = roleBasedFestivals
    .filter((festival) => {
      const search = searchTerm.trim().toLowerCase();

      const matchesSearch =
        !search ||
        festival.name.toLowerCase().includes(search) ||
        festival.location?.toLowerCase().includes(search);

      const status = getFestivalStatus(festival.startDate, festival.endDate);

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

  return (
    <AdminShell>
      <main className="min-h-screen bg-[#f7efe4] p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-[28px] font-semibold text-[#2D1F0E]">
              Events & Festivals
            </h1>
            <p className="mt-1 text-sm text-[#8B7355]">
              Create and manage temple festivals, events, and special
              celebrations.
            </p>
          </div>

          <button
            onClick={openCreateFestivalModal}
            className="rounded-xl bg-[#C8602A] px-5 py-3 text-sm font-semibold text-white shadow-sm"
          >
            + Create Festival
          </button>
        </div>
        <div className="mb-7 grid grid-cols-1 gap-5 md:grid-cols-4">
          {[
            {
              label: "UPCOMING",
              value: festivalStats.upcoming,
              valueColor: "text-orange-600",
            },
            {
              label: "ONGOING",
              value: festivalStats.ongoing,
              valueColor: "text-green-600",
            },
            {
              label: "COMPLETED",
              value: festivalStats.completed,
              valueColor: "text-[#2D1F0E]",
            },
            {
              label: "SPECIAL SEVAS",
              value: festivalStats.specialSevas,
              valueColor: "text-[#2D1F0E]",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-[#e2cfae] bg-white p-6 shadow-sm"
            >
              <p className="text-xs font-bold tracking-wide text-[#8B7355]">
                {item.label}
              </p>

              <h2 className={`mt-3 text-2xl font-bold ${item.valueColor}`}>
                {item.value}
              </h2>
            </div>
          ))}
        </div>
        <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-center">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search festivals..."
            className="w-full rounded-xl border border-[#E5D5B5] bg-white px-4 py-3 text-sm outline-none md:max-w-xl"
          />

          <div className="flex gap-3">
            {["All", "Upcoming", "Ongoing", "Completed"].map((filter) => (
              <button
                key={filter}
                onClick={() =>
                  setSelectedFilter(
                    filter as "All" | "Upcoming" | "Ongoing" | "Completed",
                  )
                }
                className={`rounded-xl border px-5 py-3 text-sm font-semibold transition-colors ${
                  selectedFilter === filter
                    ? "border-[#C8602A] bg-[#C8602A] text-white"
                    : "border-[#E5D5B5] bg-white text-[#8B7355]"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
        {searchedFestivals.length === 0 ? (
          <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 xl:grid-cols-3">
            {" "}
            <div className="flex min-h-[260px] items-center justify-center rounded-lg border border-dashed border-[#d9c3a0] bg-white">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-[#2D1F0E]">
                  No Festivals Found
                </h3>
                <p className="mt-2 text-sm text-[#8B7355]">
                  Click <strong>Create Festival</strong> to add your first
                  festival.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {searchedFestivals.map((festival) => {
              const status = getFestivalStatus(
                festival.startDate,
                festival.endDate,
              );

              const temple = temples.find((t) => t.id === festival.templeId);

              return (
                <div
                  key={festival.id}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#E5D5B5] bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative h-32 overflow-hidden bg-gradient-to-r from-[#8b3515] to-[#321907]">
                    {" "}
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
                        <span className="text-5xl">🛕</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/10" />
                    {festival.isFeatured && (
                      <span className="absolute left-4 top-4 z-10 rounded-full bg-[#e4a514] px-3 py-1 text-xs font-semibold text-white shadow-sm">
                        ☆ Featured
                      </span>
                    )}
                    <span
                      className={`absolute right-4 top-4 z-10 rounded-full px-3 py-1 text-xs font-semibold text-white shadow-sm ${
                        status === "upcoming"
                          ? "bg-orange-500"
                          : status === "ongoing"
                            ? "bg-green-500"
                            : "bg-slate-500"
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex-1">
                      <h3 className="line-clamp-1 text-lg font-bold text-[#2D1F0E]">
                        {festival.name}
                      </h3>

                      <div className="mt-2 space-y-1">
                        <p className="flex items-center gap-2 text-sm text-[#8B7355]">
                          <span>📍</span>
                          <span className="line-clamp-1">
                            {temple?.name || "Temple not found"}
                          </span>
                        </p>

                        <p className="flex items-center gap-2 text-sm font-semibold text-[#C8602A]">
                          <span>📅</span>
                          <span>
                            {formatFestivalDate(festival.startDate)}
                            {festival.endDate &&
                              ` – ${formatFestivalDate(festival.endDate)}`}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-[#E5D5B5] pt-3">
                      <span className="text-sm text-[#8B7355]">
                        🎟 {festival.specialSevaCount ?? 0} Sevas
                      </span>

                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenMenuId(
                              openMenuId === festival.id ? null : festival.id,
                            )
                          }
                          className="grid h-9 w-9 place-items-center rounded-full bg-[#f5efe6] transition-colors hover:bg-[#E5D5B5]"
                          aria-label="Festival options"
                        >
                          <MoreVertical className="h-5 w-5 text-[#8B7355]" />
                        </button>

                        {openMenuId === festival.id && (
                          <div className="absolute bottom-full right-0 z-50 mb-2 w-44 overflow-hidden rounded-xl border border-[#E5D5B5] bg-white shadow-xl">
                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuId(null);
                                openEditFestivalModal(festival);
                              }}
                              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-[#2D1F0E] transition-colors hover:bg-[#f8f3eb]"
                            >
                              <Pencil className="h-4 w-4" />
                              Edit
                            </button>

                            <div className="border-t border-[#efe2cf]" />

                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuId(null);
                                setFestivalToDelete(festival);
                              }}
                              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}{" "}
          </div>
        )}

        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl">
              <div className="flex items-start justify-between border-b border-[#E5D5B5] p-6">
                <div>
                  <h2 className="text-xl font-bold text-[#2D1F0E]">
                    {editingFestival
                      ? "Edit Festival / Event"
                      : "Create Festival / Event"}
                  </h2>
                  <p className="mt-1 text-sm text-[#8B7355]">
                    Schedule a celebration and its special sevas.
                  </p>
                </div>

                <button
                  onClick={closeFestivalModal}
                  className="text-2xl text-[#8B7355]"
                >
                  ×
                </button>
              </div>

              <div className="space-y-5 p-6">
                <div>
                  <label className="text-sm font-semibold text-[#2D1F0E]">
                    Festival Name
                  </label>
                  <input
                    value={festivalName}
                    onChange={(e) => setFestivalName(e.target.value)}
                    placeholder="e.g. Maha Shivaratri"
                    className="mt-2 w-full rounded-xl border border-[#C8B99A] bg-[#fbf5ec] px-4 py-3 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {adminRole !== "temple_admin" ? (
                    <div>
                      <label className="text-sm font-semibold text-[#2f1c0f]">
                        Temple
                      </label>

                      <div ref={templeDropdownRef} className="relative mt-2">
                        <button
                          type="button"
                          onClick={() =>
                            setIsTempleDropdownOpen((current) => !current)
                          }
                          className={`flex h-14 w-full items-center justify-between rounded-lg border bg-white px-4 text-left shadow-sm transition-all duration-200 ${
                            isTempleDropdownOpen
                              ? "border-[#c06b2c] ring-4 ring-[#c06b2c]/10"
                              : "border-[#d9c3a0] hover:border-[#c89554]"
                          }`}
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <Landmark
                              size={19}
                              className="shrink-0 text-[#b56b32]"
                            />

                            <div className="min-w-0">
                              <p className="text-[11px] font-medium text-[#8a6a45]">
                                Select Temple
                              </p>

                              <p
                                className={`truncate text-sm font-semibold ${
                                  selectedTemple
                                    ? "text-[#2f1c0f]"
                                    : "text-[#9c8b77]"
                                }`}
                              >
                                {selectedTemple?.name ?? "Choose a temple"}
                              </p>
                            </div>
                          </div>

                          <ChevronDown
                            size={20}
                            className={`shrink-0 text-[#765b3e] transition-transform duration-200 ${
                              isTempleDropdownOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {isTempleDropdownOpen && (
                          <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-50 overflow-hidden rounded-lg border border-[#e5d8c5] bg-white p-2 shadow-[0_20px_50px_rgba(69,45,22,0.18)]">
                            <div className="relative mb-2">
                              <Search
                                size={17}
                                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9b8469]"
                              />

                              <input
                                value={templeSearch}
                                onChange={(event) =>
                                  setTempleSearch(event.target.value)
                                }
                                placeholder="Search temple..."
                                autoFocus
                                className="h-11 w-full rounded-xl border border-[#eadfce] bg-[#faf7f2] pl-10 pr-3 text-sm text-[#2f1c0f] outline-none transition focus:border-[#c06b2c] focus:ring-3 focus:ring-[#c06b2c]/10"
                              />
                            </div>

                            <div className="max-h-60 space-y-1 overflow-y-auto">
                              {filteredTemples.length > 0 ? (
                                filteredTemples.map((temple) => {
                                  const isSelected = temple.id === templeId;

                                  return (
                                    <button
                                      key={temple.id}
                                      type="button"
                                      onClick={() => {
                                        handleTempleChange(temple.id);
                                        setTempleSearch("");
                                        setIsTempleDropdownOpen(false);
                                      }}
                                      className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition ${
                                        isSelected
                                          ? "bg-[#fff1e7] text-[#c05e20]"
                                          : "text-[#493725] hover:bg-[#faf4eb]"
                                      }`}
                                    >
                                      <div className="flex min-w-0 items-center gap-3">
                                        <div
                                          className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
                                            isSelected
                                              ? "bg-white"
                                              : "bg-[#f4eadc]"
                                          }`}
                                        >
                                          <Landmark size={17} />
                                        </div>

                                        <span className="truncate text-sm font-semibold">
                                          {temple.name}
                                        </span>
                                      </div>

                                      {isSelected && (
                                        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#c06b2c]/10">
                                          <Check
                                            size={17}
                                            className="text-[#c06b2c]"
                                          />
                                        </div>
                                      )}
                                    </button>
                                  );
                                })
                              ) : (
                                <div className="px-4 py-8 text-center text-sm text-[#8a6a45]">
                                  No temples found
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="text-sm font-semibold text-[#2f1c0f]">
                        Temple
                      </label>

                      <div className="mt-2 flex h-14 w-full items-center gap-3 rounded-lg border border-[#d9c3a0] bg-[#f8f3eb] px-4">
                        <Landmark size={18} className="text-[#b56b32]" />

                        <span className="font-medium text-[#2f1c0f]">
                          {selectedTemple?.name ?? "Assigned Temple"}
                        </span>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-semibold text-[#2D1F0E]">
                      Location
                    </label>

                    <div className="relative mt-2">
                      <MapPin
                        size={19}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#b56b32]"
                      />

                      <input
                        value={location}
                        readOnly
                        placeholder="Temple location"
                        className="h-14 w-full cursor-not-allowed rounded-lg border border-[#d9c3a0] bg-white pl-12 pr-4 text-sm font-semibold text-[#2f1c0f] shadow-sm outline-none transition-all hover:border-[#c89554]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold text-[#2D1F0E]">
                      Start Date
                    </label>

                    <DatePicker
                      value={startDate}
                      placeholder="Select start date"
                      onChange={(value) => {
                        setStartDate(value);

                        if (endDate && endDate < value) {
                          setEndDate("");
                        }
                      }}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-[#2D1F0E]">
                      End Date
                    </label>

                    <DatePicker
                      value={endDate}
                      placeholder="Select end date"
                      minDate={startDate || undefined}
                      disabled={!startDate}
                      onChange={setEndDate}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-[#2D1F0E]">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="A night dedicated to Lord Shiva..."
                    rows={4}
                    className="mt-2 w-full rounded-xl border border-[#C8B99A] bg-[#fbf5ec] px-4 py-3 outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-[#2D1F0E]">
                    Festival Image
                  </label>

                  <div className="mt-2 flex flex-wrap gap-3">
                    {festivalImagePreview && (
                      <div className="relative h-32 w-52 overflow-hidden rounded-xl border border-[#C8B99A] bg-white">
                        <Image
                          src={festivalImagePreview}
                          alt="Festival image preview"
                          fill
                          unoptimized
                          className="object-cover"
                        />

                        <button
                          type="button"
                          onClick={removeFestivalImage}
                          className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-white text-[#9b4815] shadow"
                          aria-label="Remove festival image"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    {!festivalImagePreview && (
                      <label className="grid h-32 w-52 cursor-pointer place-items-center rounded-xl border border-dashed border-[#C8B99A] bg-[#fffaf2] text-center text-sm font-semibold text-[#7d6040] hover:bg-[#f8efe2]">
                        <span>
                          <ImageIcon className="mx-auto mb-2 h-6 w-6" />
                          Upload Festival Image
                          <small className="mt-1 block font-normal text-[#9a8268]">
                            PNG, JPG or WEBP
                          </small>
                        </span>

                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={handleFestivalImageChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-[#2D1F0E]">
                    Special Sevas & Offerings for this festival
                  </label>

                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    {specialSevas.map((seva) => {
                      const isSelected = selectedSevas.includes(seva);

                      return (
                        <div key={seva} className="group relative">
                          <button
                            type="button"
                            onClick={() => toggleManualSeva(seva)}
                            className={`rounded-full border px-4 py-2 pr-9 text-sm font-semibold transition-colors ${
                              isSelected
                                ? "border-[#C8602A] bg-[#C8602A] text-white"
                                : "border-[#C8B99A] bg-white text-[#8B7355] hover:border-[#C8602A]"
                            }`}
                          >
                            {seva}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRemoveSeva(seva)}
                            className={`absolute right-2 top-1/2 grid h-5 w-5 -translate-y-1/2 place-items-center rounded-full text-xs ${
                              isSelected
                                ? "bg-white/20 text-white hover:bg-white/30"
                                : "bg-[#f4eadc] text-[#9b4815] hover:bg-[#ead9c4]"
                            }`}
                            aria-label={`Remove ${seva}`}
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}

                    {!showSevaInput && (
                      <button
                        type="button"
                        onClick={() => setShowSevaInput(true)}
                        className="grid h-10 w-10 place-items-center rounded-full border border-dashed border-[#C8602A] bg-white text-xl font-semibold text-[#C8602A] transition-colors hover:bg-[#fff4ed]"
                        aria-label="Add special seva"
                      >
                        +
                      </button>
                    )}
                  </div>

                  {showSevaInput && (
                    <div className="mt-4 flex gap-3">
                      <input
                        type="text"
                        value={newSevaName}
                        onChange={(e) => setNewSevaName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddSeva();
                          }

                          if (e.key === "Escape") {
                            setNewSevaName("");
                            setShowSevaInput(false);
                          }
                        }}
                        autoFocus
                        placeholder="Enter seva name"
                        className="w-full rounded-xl border border-[#C8B99A] bg-[#fbf5ec] px-4 py-3 outline-none"
                      />

                      <button
                        type="button"
                        onClick={handleAddSeva}
                        className="rounded-xl bg-[#C8602A] px-5 py-3 font-semibold text-white"
                      >
                        Add
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setNewSevaName("");
                          setShowSevaInput(false);
                        }}
                        className="rounded-xl border border-[#C8B99A] px-5 py-3 font-semibold text-[#8B7355]"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {selectedSevas.length > 0 && (
                    <p className="mt-3 text-sm text-[#8B7355]">
                      {selectedSevas.length} seva
                      {selectedSevas.length === 1 ? "" : "s"} selected
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-[#E5D5B5] bg-[#fbf5ec] p-6">
                <button
                  onClick={closeFestivalModal}
                  className="rounded-xl border border-[#C8B99A] px-6 py-3 font-semibold text-[#8B7355]"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSaveFestival}
                  disabled={isCreating || isUpdating}
                  className="rounded-xl bg-[#C8602A] px-6 py-3 font-semibold text-white disabled:opacity-60"
                >
                  {isCreating || isUpdating
                    ? "Saving..."
                    : editingFestival
                      ? "Save Festival"
                      : "Create Festival"}
                </button>
              </div>
            </div>
          </div>
        )}

        {festivalToDelete && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 px-4">
            <div className="w-full max-w-md rounded-lg border border-[#ead9c0] bg-white p-6 shadow-2xl">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-red-50">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>

              <div className="mt-4 text-center">
                <h2 className="text-xl font-bold text-[#2D1F0E]">
                  Delete Festival?
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#8B7355]">
                  Are you sure you want to delete{" "}
                  <strong>{festivalToDelete.name}</strong>?
                </p>

                <p className="mt-1 text-sm text-[#9a8268]">
                  This action cannot be undone.
                </p>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setFestivalToDelete(null)}
                  disabled={isDeleting}
                  className="rounded-xl border border-[#C8B99A] px-5 py-2.5 font-semibold text-[#8B7355] disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDeleteFestival}
                  disabled={isDeleting}
                  className="rounded-xl bg-red-600 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </AdminShell>
  );
}
