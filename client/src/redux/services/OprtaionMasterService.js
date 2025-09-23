import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { OPERATION_API} from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const operationmaterApi = createApi({
  reducerPath: "operationmater",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["Operation"],
  endpoints: (builder) => ({
    getOperation: builder.query({
      query: ({params, searchParams}) => {
        if(searchParams){
          return {
            url: OPERATION_API +"/search/"+searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: OPERATION_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["Operation"],
    }),
    getOperationById: builder.query({
      query: (id) => {
        return {
          url: `${OPERATION_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["Operation"],
    }),
    addOperation: builder.mutation({
      query: (payload) => ({
        url: OPERATION_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["Operation"],
    }),
    updateOperation: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${OPERATION_API}/${id}`,
          method: "PUT",
           body: payload,
        };
      },
      invalidatesTags: ["Operation"],
    }),
    deleteOperation: builder.mutation({
      query: () => ({
        url: `${OPERATION_API}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Operation"],
    }),
  }),
});

export const {
  useGetOperationQuery,
  useGetOperationByIdQuery,
  useAddOperationMutation,
  useUpdateOperationMutation,
  useDeleteOperationMutation,
} = operationmaterApi;

export default operationmaterApi;
