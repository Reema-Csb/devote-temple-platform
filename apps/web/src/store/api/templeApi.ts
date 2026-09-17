import { ApiFilter } from "@/types/api.type";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const DEFAULT_TEMPLE_SERVICE_URL = "http://127.0.0.1:3001";

export type TempleLocation = {
  id?: string;
  templeId: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
};

export type TempleOffering = {
  id: string;
  templeId: string;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  isActive?: boolean;
};

export type Temple = {
  imageUrl?: string;
  isActive: boolean;
  deleted?: boolean;
  id: string;
  name: string;
  description: string;
  deity?: string;
  location?: string;
  image?: string;
  imageUrls?: string[];
  tags?: string[];
  templeLocation?: TempleLocation;
  templeOfferings?: TempleOffering[];
  revenue?: number;
};

export type TempleDetails = {
  id: string;
  name: string;
  description?: string;
  deity?: string;
  isActive: boolean;
  templeLocation?: TempleLocation;
  templeOfferings: TempleOffering[];
  createdOn: string;
  modifiedOn: string;
  createdBy?: string | null;
  modifiedBy?: string | null;
  deleted?: boolean;
  deletedOn?: string | null;
  deletedBy?: string | null;
};

export const templeApi = createApi({
  reducerPath: "templeApi",
  baseQuery: fetchBaseQuery({
    baseUrl:
      process.env.NEXT_PUBLIC_TEMPLE_API_URL ?? DEFAULT_TEMPLE_SERVICE_URL,
    timeout: 10000,
  }),
  endpoints: (builder) => ({
    getTemples: builder.query<Temple[], string>({
      query: (search = "") => {
        const value = search.trim();
        return {
          url: "/temples",
          method: "GET",
          params: {
            filter: JSON.stringify({
              limit: 100,
              order: "name ASC",
              ...(value && {
                where: {
                  or: [
                    { name: { ilike: `%${value}%` } },
                    { description: { ilike: `%${value}%` } },
                    { deity: { ilike: `%${value}%` } },
                    { location: { ilike: `%${value}%` } },
                  ],
                },
              }),
            }),
          },
        };
      },
    }),
    getTempleById: builder.query<
      TempleDetails,
      { id: string; filter?: ApiFilter<TempleDetails> }
    >({
      query: ({ id, filter }) => {
        const filterParams = encodeURIComponent(JSON.stringify(filter));
        return `/temples/${id}?filter=${filterParams.toString()}`;
      },
    }),
  }),
});

export const { useGetTemplesQuery, useGetTempleByIdQuery } = templeApi;
