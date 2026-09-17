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
  offeringsCount: number;
  revenue: number;
  templeOfferings: TempleOffering[];
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

const TEMPLE_API_URL =
  process.env.NEXT_PUBLIC_TEMPLE_API_URL ;
const API_GATEWAY_URL =
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ;

const PLACEHOLDER_IMAGE = "/placeholder-temple.svg";

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

async function resolveTempleImage(image?: string): Promise<string | undefined> {
  if (!image) return undefined;

  if (
    image.startsWith("http") ||
    image.startsWith("blob:") ||
    image.startsWith("data:") ||
    image.startsWith("/")
  ) {
    return image;
  }

  try {
    const response = await fetch(
      `${API_GATEWAY_URL}/upload/presigned-url?key=${encodeURIComponent(image)}`,
    );

    if (!response.ok) return undefined;

    const data = await response.json();
    return data.url || undefined;
  } catch {
    return undefined;
  }
}

async function mapTemple(temple: ApiTemple): Promise<TempleCard> {
  const location = buildLocation(temple);

  const images = [
    ...(Array.isArray(temple.imageUrls) ? temple.imageUrls : []),
    ...(temple.imageUrl ? [temple.imageUrl] : []),
  ].filter(Boolean);

  const uniqueImages = Array.from(new Set(images));
  const resolvedImages = (
    await Promise.all(uniqueImages.map((image) => resolveTempleImage(image)))
  ).filter((image): image is string => Boolean(image));

  const primaryImage = resolvedImages[0] ?? PLACEHOLDER_IMAGE;

  const offerings = temple.templeOfferings ?? temple.offerings ?? [];

  const tags = [temple.name, temple.deity, location]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase());

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

export async function getTemples(): Promise<TempleCard[]> {
  const response = await fetch(`${TEMPLE_API_URL}/temples`, {
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(`Failed to load temples: ${response.status} ${errorText}`);
  }

  const temples = (await response.json()) as ApiTemple[];

  const sortedTemples = temples
    .filter((temple) => temple.deleted !== true)
    .sort((a, b) => {
      const firstDate = a.createdOn ? new Date(a.createdOn).getTime() : 0;
      const secondDate = b.createdOn ? new Date(b.createdOn).getTime() : 0;
      return secondDate - firstDate;
    });

  return Promise.all(sortedTemples.map((temple) => mapTemple(temple)));
}

export async function getTempleById(id: string): Promise<TempleCard> {
  const response = await fetch(`${TEMPLE_API_URL}/temples/${id}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to load temple: ${response.status} ${errorText}`);
  }

  const temple = (await response.json()) as ApiTemple;

  if (temple.deleted) {
    throw new Error("Temple not found");
  }

  return mapTemple(temple);
}
