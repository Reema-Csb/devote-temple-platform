import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const TEMPLE_SERVICE_URL = process.env.NEXT_PUBLIC_TEMPLE_SERVICE_URL;

export type EventFestival = {
  id: string;
  templeId: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  imageUrl?: string;
  location?: string;
  isFeatured?: boolean;
  status: "upcoming" | "ongoing" | "completed";
  specialSevaCount?: number;
  isActive?: boolean;
};

export type FestivalSeva = {
  id: string;
  festivalId: string;
  templeId: string;
  name: string;
  isSelected?: boolean;
  isActive?: boolean;
};

export type CreateFestivalSevaDto = Omit<FestivalSeva, "id">;

export type CreateEventFestivalDto = Omit<EventFestival, "id">;

export const eventFestivalApi = createApi({
  reducerPath: "eventFestivalApi",
  baseQuery: fetchBaseQuery({
    baseUrl: TEMPLE_SERVICE_URL,
  }),
  tagTypes: ["EventFestivals", "FestivalSevas"],
  endpoints: (builder) => ({
    getEventFestivals: builder.query<EventFestival[], void>({
      query: () => "/event-festivals",
      providesTags: ["EventFestivals"],
    }),

    createEventFestival: builder.mutation<
      EventFestival,
      CreateEventFestivalDto
    >({
      query: (body) => ({
        url: "/event-festivals",
        method: "POST",
        body,
      }),
      invalidatesTags: ["EventFestivals"],
    }),

    updateEventFestival: builder.mutation<
      void,
      { id: string; body: Partial<CreateEventFestivalDto> }
    >({
      query: ({ id, body }) => ({
        url: `/event-festivals/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["EventFestivals"],
    }),

    deleteEventFestival: builder.mutation<void, string>({
      query: (id) => ({
        url: `/event-festivals/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["EventFestivals"],
    }),

    getFestivalSevasByFestival: builder.query<FestivalSeva[], string>({
      query: (festivalId) => `/festival-sevas/festival/${festivalId}`,
      providesTags: (_result, _error, festivalId) => [
        { type: "FestivalSevas", id: festivalId },
      ],
    }),

    createFestivalSevasBulk: builder.mutation<
      FestivalSeva[],
      CreateFestivalSevaDto[]
    >({
      query: (body) => ({
        url: "/festival-sevas/bulk",
        method: "POST",
        body,
      }),
      invalidatesTags: ["FestivalSevas"],
    }),

    deleteFestivalSevasByFestival: builder.mutation<void, string>({
      query: (festivalId) => ({
        url: `/festival-sevas/festival/${festivalId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, festivalId) => [
        { type: "FestivalSevas", id: festivalId },
      ],
    }),
  }),
});

export const {
  useGetEventFestivalsQuery,
  useCreateEventFestivalMutation,
  useUpdateEventFestivalMutation,
  useDeleteEventFestivalMutation,
  useLazyGetFestivalSevasByFestivalQuery,
  useCreateFestivalSevasBulkMutation,
  useDeleteFestivalSevasByFestivalMutation,
} = eventFestivalApi;
