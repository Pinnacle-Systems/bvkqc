// services/pdfApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const pdfApi = createApi({
  reducerPath: "pdfApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/" }), 
  endpoints: (builder) => ({
    extractPageTables: builder.mutation({
      query: (payload) => ({
        url: "extract-page-tables",
        method: "POST",
        body: payload,
      }),
    }),
  }),
});

export const { useExtractPageTablesMutation } = pdfApi;
