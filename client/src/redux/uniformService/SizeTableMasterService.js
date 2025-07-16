import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { SIZETABLE_API,ALLOCATION_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const SizeTableMasterApi = createApi({
  reducerPath: "sizeTableMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["SizeTableMaster"],
  endpoints: (builder) => ({
    getSizeTableMaster: builder.query({
      query: ({ productReference }) => ({
        url: SIZETABLE_API,
        method: "GET",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
        params: {
          productReference, 
        },
      }),
      providesTags: ["SizeTableMaster"],
    }),

    addSizeTableMaster: builder.mutation({
      query: (payload) => ({
        url: SIZETABLE_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["SizeTableMaster"],
    }),
      addAllocationMaster: builder.mutation({
      query: (payload) => ({
        url: ALLOCATION_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["SizeTableMaster"],
    }),


    deleteSizeTableMaster: builder.mutation({
      query: (id) => ({
        url: `${SIZETABLE_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SizeTableMaster"],
    }),
  }),
});
export const {
  useGetSizeTableMasterQuery,
  useAddSizeTableMasterMutation,
  useAddAllocationMasterMutation,
  useDeleteSizeTableMasterMutation,
} = SizeTableMasterApi;

export default SizeTableMasterApi;
