import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const pdfApi = createApi({
  reducerPath: 'pdfApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: process.env.REACT_APP_PYTHON_URL,
  }),
  endpoints: (builder) => ({
    extractPageTables: builder.mutation({
      query: (formData) => ({
        url: '/extract-page-tables',
        method: 'OPTIONS',
        body: formData,
      }),
    }),
  }),
});
export const { useExtractPageTablesMutation } = pdfApi;
