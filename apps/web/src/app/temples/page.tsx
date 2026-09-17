"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { getTemples, type TempleCard } from "@/lib/temple-api";
import Image from "next/image";
import Link from "next/link";
import { FaSearch } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { useLanguage } from "@/context/LanguageContext";

function ExploreContent() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [temples, setTemples] = useState<TempleCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    async function loadTemples() {
      try {
        const data = await getTemples();

        const activeTemples = data.filter(
          (temple: TempleCard) =>
            temple.isActive !== false && temple.deleted !== true,
        );

        setTemples(activeTemples);
      } catch (error) {
        console.warn(error);
        setTemples([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadTemples();
  }, []);

  const filteredTemples = temples.filter((temple: TempleCard) => {
    const value = search.trim().toLowerCase();
    if (!value) return true;

    return (
      temple.name.toLowerCase().includes(value) ||
      temple.location.toLowerCase().includes(value) ||
      temple.description.toLowerCase().includes(value) ||
      temple.tags.some((tag) => tag.toLowerCase().includes(value)) ||
      Boolean(temple.deity?.toLowerCase().includes(value))
    );
  });

  return (
    <AppShell title={t.exploreTemples}>
      <div className="mx-auto max-w-6xl p-6">
        <div className="relative mb-6">
          <FaSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            aria-hidden="true"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchTemplesPlaceholder}
            aria-label="Search temples"
            className="w-full rounded-xl border border-gray-400 py-3 pl-10 pr-4"
          />
        </div>

        {isLoading ? (
          <div className="rounded-xl bg-white p-6 text-gray-500 shadow">
            {t.loadingTemplesText}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {filteredTemples.map((temple) => (
              <div
                key={temple.id}
                className="cursor-pointer rounded-xl bg-white p-4 shadow transition hover:-translate-y-1 hover:shadow-xl"
              >
                {temple.image ? (
                  <Image
                    src={temple.image}
                    width={420}
                    height={160}
                    unoptimized
                    alt={`${temple.name} temple`}
                    className="mb-3 h-40 w-full rounded-xl object-cover"
                  />
                ) : (
                  <div className="mb-3 flex h-40 w-full items-center justify-center rounded-xl bg-[#e7dcc8] text-[#7b5b3e]">
                    {t.noImageText}
                  </div>
                )}

                <h4 className="mb-2 text-lg font-semibold text-[#2d1606]">
                  {temple.name}
                </h4>

                <p className="mb-4 flex items-center gap-2 text-sm text-gray-500">
                  <FaLocationDot aria-hidden="true" />
                  {temple.location}
                </p>

                <Link href={`/temples/${temple.id}`}>
                  <button
                    className="w-full rounded-lg border py-2 transition hover:border-[#e09728] hover:text-[#e09728]"
                    aria-label={`View details of ${temple.name}`}
                  >
                    {t.viewTemple}
                  </button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default function ExplorePage() {
  return <ExploreContent />;
}
