import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export enum ApiTags {
  TEMPLES = "Temples",
}

export const apiSlice = createApi({
  reducerPath: "api",

  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3000",
  }),

  tagTypes: Object.values(ApiTags),

  endpoints: () => ({}),
});
