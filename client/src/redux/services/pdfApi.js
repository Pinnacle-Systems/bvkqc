import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const pdfApi = createApi({
  reducerPath: 'pdfApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'https://pdfapi.agfqc.pinnaclesystems.co.in',
  }),
  endpoints: (builder) => ({
    extractPageTables: builder.mutation({
      query: (formData) => ({
        url: '/extract-page-tables',
        method: 'POST',
        body: formData,
      }),
    }),
  }),
});
export const { useExtractPageTablesMutation } = pdfApi;
