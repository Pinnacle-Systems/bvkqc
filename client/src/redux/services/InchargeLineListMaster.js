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
        getlineAllocationMaster: builder.query({
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
        getlineAllocationMasterById: builder.query({
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
        addlineAllocationMaster: builder.mutation({
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
        updatelineAllocationMaster: builder.mutation({
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
        deletelineAllocationMaster: builder.mutation({
            query: (id) => ({
                url: `${LINE_ALLOCATION_API}/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["lineAllocationMaster"],
        }),
    }),
});

export const {
    useGetlineAllocationMasterQuery,
    useGetlineAllocationMasterByIdQuery,
    useAddlineAllocationMasterMutation,
    useUpdatelineAllocationMasterMutation,
    useDeletelineAllocationMasterMutation,
} = lineAllocationMasterApi;

export default lineAllocationMasterApi;
