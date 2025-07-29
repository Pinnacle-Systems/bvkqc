// AqlInspectionService.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { AQL_INSPECTION_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

 const AqlInspectionApi = createApi({
  reducerPath: "aqlInspection",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["AqlInspection"],
  endpoints: (builder) => ({
    getAqlInspections: builder.query({
      query: () => ({
        url: AQL_INSPECTION_API,
        method: "GET",
              }),
      providesTags: ["AqlInspection"],
    }),

    // Get single AQL inspection by ID
    getAqlInspectionById: builder.query({
      query: (id) => ({
        url: `${AQL_INSPECTION_API}/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "AqlInspection", id }],
    }),

    // Add new AQL inspection
    addAqlInspection: builder.mutation({
      query: (payload) => ({
        url: AQL_INSPECTION_API,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["AqlInspection"],
    }),

    // Update AQL inspection
    updateAqlInspection: builder.mutation({
      query: ({ id, payload }) => ({
        url: `${AQL_INSPECTION_API}/${id}`,
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "AqlInspection", id }],
    }),

    // Delete AQL inspection
    deleteAqlInspection: builder.mutation({
      query: (id) => ({
        url: `${AQL_INSPECTION_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [{ type: "AqlInspection", id }],
    }),
  }),
});

export const {
  useGetAqlInspectionsQuery,
  useGetAqlInspectionByIdQuery,
  useAddAqlInspectionMutation,
  useUpdateAqlInspectionMutation,
  useDeleteAqlInspectionMutation,
} = AqlInspectionApi
export default AqlInspectionApi