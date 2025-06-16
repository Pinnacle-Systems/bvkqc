import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { LINE_MASTER} from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const LineMasterApi = createApi({
    reducerPath: "lineMaster",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ["LineMaster"],
    endpoints: (builder) => ({
        getLineMaster: builder.query({
            query: ({ params, searchParams }) => {
                if (searchParams) {
                    return {
                        url: LINE_MASTER + "/search/" + searchParams,
                        method: "GET",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        params
                    };
                }
                return {
                    url: LINE_MASTER,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["LineMaster"],
        }),
        getLineMasterById: builder.query({
            query: (id) => {
                return {
                    url: `${LINE_MASTER}/${id}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["LineMaster"],
        }),
        addLineMaster: builder.mutation({
            query: (payload) => ({
                url: LINE_MASTER,
                method: "POST",
                body: payload,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }),
            invalidatesTags: ["LineMaster"],
        }),
        updateLineMaster: builder.mutation({
            query: (payload) => {
                const { id, ...body } = payload;
                return {
                    url: `${LINE_MASTER}/${id}`,
                    method: "PUT",
                    body,
                };
            },
            invalidatesTags: ["LineMaster"],
        }),
        deleteLineMaster: builder.mutation({
            query: (id) => ({
                url: `${LINE_MASTER}/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["LineMaster"],
        }),
    }),
});

export const {
    useGetLineMasterQuery,
    useGetLineMasterByIdQuery,
    useAddLineMasterMutation,
    useUpdateLineMasterMutation,
    useDeleteLineMasterMutation,
} = LineMasterApi;

export default LineMasterApi;
