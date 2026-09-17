export type TempleOffering = {
  id?: string;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  isActive?: boolean;
  archana?: boolean;
};

export type TempleLocation = {
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
};

export type TempleCard = {
  offeringsCount: any;
  revenue: number;
  templeOfferings: any;
  imageUrls?: string[];
  id: string;
  name: string;
  description: string;
  deity?: string;
  imageUrl?: string;
  isActive?: boolean;
  deleted?: boolean;
  location: string;
  latitude?: number;
  longitude?: number;
  image: string;
  images: string[];
  tags: string[];
  templeLocation?: TempleLocation;
  offerings: TempleOffering[];
};

type ApiTemple = {
  id: string;
  name: string;
  description?: string;
  deity?: string;
  imageUrl?: string;
  imageUrls?: string[];
  isActive?: boolean;
  deleted?: boolean;
  createdOn?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  templeLocation?: TempleLocation;
  offerings?: TempleOffering[];
  templeOfferings?: TempleOffering[];
};

type TempleImage = {
  id?: string;
  templeId?: string;
  imageUrl: string;
};

const TEMPLE_API_URL =
  process.env.NEXT_PUBLIC_TEMPLE_API_URL ?? "http://127.0.0.1:3001";

const PLACEHOLDER_IMAGE = "/placeholder-temple.jpg";

function buildLocation(temple: ApiTemple) {
  if (temple.location) return temple.location;

  return [
    temple.templeLocation?.city,
    temple.templeLocation?.state,
    temple.templeLocation?.country,
  ]
    .filter(Boolean)
    .join(", ");
}

function resolveTempleImage(image?: string) {
  if (!image) return image;

  try {
    const url = new URL(image);

    if (
      url.hostname.endsWith("amazonaws.com") &&
      url.pathname.startsWith("/temples/")
    ) {
      return `/api/uploaded-image?key=${encodeURIComponent(
        url.pathname.slice(1),
      )}`;
    }
  } catch {
    return image;
  }

  return image;
}

function mapTemple(temple: ApiTemple): TempleCard {
  const location = buildLocation(temple);

  const images = [
    ...(Array.isArray(temple.imageUrls) ? temple.imageUrls : []),
    ...(temple.imageUrl ? [temple.imageUrl] : []),
  ].filter(Boolean);

  const finalImages =
    images.length > 0 ? Array.from(new Set(images)) : [PLACEHOLDER_IMAGE];

  const resolvedImages = finalImages.map(
    (image) => resolveTempleImage(image) ?? PLACEHOLDER_IMAGE,
  );

  const primaryImage = resolvedImages[0] ?? PLACEHOLDER_IMAGE;

  const tags = [temple.name, temple.deity, location]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase());
  const offerings = temple.templeOfferings ?? temple.offerings ?? [];
  return {
    id: temple.id,
    name: temple.name,
    description: temple.description ?? "",
    deity: temple.deity,
    isActive: temple.isActive,
    deleted: temple.deleted ?? false,
    location: location || "Location not added",
    latitude: temple.latitude ?? temple.templeLocation?.latitude,
    longitude: temple.longitude ?? temple.templeLocation?.longitude,
    image: primaryImage,
    imageUrl: primaryImage,
    imageUrls: resolvedImages,
    images: resolvedImages,
    tags,
    templeLocation: temple.templeLocation,
    offerings,
    templeOfferings: offerings,
    offeringsCount: offerings.length,
    revenue: 0,
  };
}

function templeChildFilter(id: string) {
  return encodeURIComponent(
    JSON.stringify({
      where: {
        templeId: id,
      },
    }),
  );
}

async function fetchTempleChildren(id: string) {
  const filter = templeChildFilter(id);

  const [locationResponse, offeringsResponse, imagesResponse] =
    await Promise.all([
      fetch(`${TEMPLE_API_URL}/temple-locations?filter=${filter}`, {
        cache: "no-store",
      }),
      fetch(`${TEMPLE_API_URL}/temple-offerings?filter=${filter}`, {
        cache: "no-store",
      }),
      fetch(`${TEMPLE_API_URL}/temple-images?filter=${filter}`, {
        cache: "no-store",
      }),
    ]);

  const templeLocation = locationResponse.ok
    ? ((await locationResponse.json()) as TempleLocation[])[0]
    : undefined;

  const offerings = offeringsResponse.ok
    ? ((await offeringsResponse.json()) as TempleOffering[])
    : [];

  const templeImages = imagesResponse.ok
    ? ((await imagesResponse.json()) as TempleImage[])
    : [];

  return {
    templeLocation,
    offerings,
    imageUrls: templeImages.map((image) => image.imageUrl).filter(Boolean),
  };
}

async function enrichTemple(temple: ApiTemple): Promise<ApiTemple> {
  const { templeLocation, offerings, imageUrls } = await fetchTempleChildren(
    temple.id,
  );

  return {
    ...temple,
    templeLocation: temple.templeLocation ?? templeLocation,
    offerings: temple.offerings ?? offerings,
    imageUrls:
      Array.isArray(temple.imageUrls) && temple.imageUrls.length > 0
        ? temple.imageUrls
        : imageUrls,
  };
}

export async function getTemples(): Promise<TempleCard[]> {
  const filter = encodeURIComponent(
    JSON.stringify({
      where: {
        deleted: false,
      },
    }),
  );

  const response = await fetch(`${TEMPLE_API_URL}/temples?filter=${filter}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to load temples");
  }

  const temples = (await response.json()) as ApiTemple[];

  const enrichedTemples = await Promise.all(
    temples.map((temple) => enrichTemple(temple)),
  );

  return enrichedTemples
    .filter((temple) => temple.deleted !== true)
    .sort((a, b) => {
      const firstDate = a.createdOn ? new Date(a.createdOn).getTime() : 0;
      const secondDate = b.createdOn ? new Date(b.createdOn).getTime() : 0;

      return secondDate - firstDate;
    })
    .map((temple) => mapTemple(temple));
}

export async function getTempleById(id: string): Promise<TempleCard> {
  const filter = encodeURIComponent(
    JSON.stringify({
      include: [
        { relation: "templeLocation" },
        { relation: "templeOfferings" },
      ],
    }),
  );

  const response = await fetch(
    `${TEMPLE_API_URL}/temples/${id}?filter=${filter}`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to load temple");
  }

  const temple = (await response.json()) as ApiTemple;

  if (temple.deleted) {
    throw new Error("Temple not found");
  }

  const enrichedTemple = await enrichTemple(temple);

  return mapTemple(enrichedTemple);
}
