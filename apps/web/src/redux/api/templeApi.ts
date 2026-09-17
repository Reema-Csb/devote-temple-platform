import { apiSlice, ApiTags } from "./apiSlice";

export interface Temple {
  id: string;

  name: string;

  description: string;

  deity?: string;

  location?: string;

  image?: string;

  imageUrl?: string;

  imageUrls?: string[];

  tags?: string[];

  isActive?: boolean;

  deleted?: boolean;

  revenue?: number;

  // OFFERINGS RELATION
  templeOfferings?: any[];

  // LOCATION RELATION
  templeLocation?: {
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
}

export const templeApi = apiSlice.injectEndpoints({
  endpoints: (builder: any) => ({
    getTemples: builder.query({
      query: (search = "") => {
        const value = search.trim();

        return {
          url: "/temples",

          method: "GET",

          params: {
            filter: JSON.stringify({
              limit: 100,
              order: "name ASC",

              where: {
                deleted: false,

                ...(value && {
                  or: [
                    { name: { ilike: `%${value}%` } },
                    { description: { ilike: `%${value}%` } },
                    { deity: { ilike: `%${value}%` } },
                    { location: { ilike: `%${value}%` } },
                  ],
                }),
              },
            }),
          },
        };
      },

      providesTags: [ApiTags.TEMPLES],
    }),
  }),
});

export const { useGetTemplesQuery } = templeApi;
