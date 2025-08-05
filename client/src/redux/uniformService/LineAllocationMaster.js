import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {  LINE_ALLOCATION_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const lineAllocationMasterApi = createApi({
    reducerPath: "lineAllocationMaster",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ["lineAllocationMaster"],
    endpoints: (builder) => ({
        getSizeMaster: builder.query({
            query: ({ params, searchParams }) => {
                if (searchParams) {
                    return {
                        url: LINE_ALLOCATION_API + "/search/" + searchParams,
                        method: "GET",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        params
                    };
                }
                return {
                    url: LINE_ALLOCATION_API,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["SizeMaster"],
        }),
        getSizeMasterById: builder.query({
            query: (id) => {
                return {
                    url: `${LINE_ALLOCATION_API}/${id}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["lineAllocationMaster"],
        }),
        addSizeMaster: builder.mutation({
            query: (payload) => ({
                url: LINE_ALLOCATION_API,
                method: "POST",
                body: payload,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }),
            invalidatesTags: ["lineAllocationMaster"],
        }),
        updateSizeMaster: builder.mutation({
            query: (payload) => {
                const { id, ...body } = payload;
                return {
                    url: `${LINE_ALLOCATION_API}/${id}`,
                    method: "PUT",
                    body,
                };
            },
            invalidatesTags: ["lineAllocationMaster"],
        }),
        deleteSizeMaster: builder.mutation({
            query: (id) => ({
                url: `${LINE_ALLOCATION_API}/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["lineAllocationMaster"],
        }),
    }),
});

export const {
    useGetSizeMasterQuery,
    useGetSizeMasterByIdQuery,
    useAddSizeMasterMutation,
    useUpdateSizeMasterMutation,
    useDeleteSizeMasterMutation,
} = lineAllocationMasterApi;

export default lineAllocationMasterApi;
