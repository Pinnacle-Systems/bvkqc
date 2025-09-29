import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { SAQL_INSPECTION_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const SAqlInspectionApi = createApi({
  reducerPath: "saqlInspection",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ["SAqlInspection"],
  endpoints: (builder) => ({
    getSAqlInspections: builder.query({
      query: () => ({
        url: SAQL_INSPECTION_API,
        method: "GET",
      }),
      providesTags: ["SAqlInspection"],
    }),

    getSAqlInspectionById: builder.query({
      query: (id) => ({
        url: `${SAQL_INSPECTION_API}/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "SAqlInspection", id }],
    }),

    addSAqlInspection: builder.mutation({
      query: (payload) => ({
        url: SAQL_INSPECTION_API,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["SAqlInspection"],
    }),

    updateSAqlInspection: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: `${SAQL_INSPECTION_API}/${id}`,
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "SAqlInspection", id }],
    }),

    deleteSAqlInspection: builder.mutation({
      query: (id) => ({
        url: `${SAQL_INSPECTION_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [{ type: "SAqlInspection", id }],
    }),

    updateAqlStatusInspection: builder.mutation({   
      query: ({ id, status }) => ({
        url: `${SAQL_INSPECTION_API}/${id}/status`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "SAqlInspection", id }],
    }),
      updateSAqlStatusInspection: builder.mutation({   
          query: ({ id, payload }) => ({
            url: `${SAQL_INSPECTION_API}/${id}/status`,
            method: "PUT",
            body: payload,
          }),
          invalidatesTags: (result, error, { id }) => [{ type: "AqlInspection", id }],
        }),
  }),
});

export const {
  useGetSAqlInspectionsQuery,
  useGetSAqlInspectionByIdQuery,
  useAddSAqlInspectionMutation,
  useUpdateSAqlInspectionMutation,
  useDeleteSAqlInspectionMutation,
  useUpdateAqlStatusInspectionMutation,
  useUpdateSAqlStatusInspectionMutation
} = SAqlInspectionApi;

export default SAqlInspectionApi;