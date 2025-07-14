import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { SIZETABLE_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const SizeTableMasterApi = createApi({
    reducerPath: "sizeTableMaster",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ["SizeTableMaster"],
    endpoints: (builder) => ({
        getSizeTableMaster: builder.query({
            query: ({ params, searchParams }) => {
                if (searchParams) {
                    return {
                        url: SIZETABLE_API + "/search/" + searchParams,
                        method: "GET",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        params
                    };
                }
                return {
                    url: SIZETABLE_API,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
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
    useDeleteSizeTableMasterMutation,
} = SizeTableMasterApi;

export default SizeTableMasterApi;
