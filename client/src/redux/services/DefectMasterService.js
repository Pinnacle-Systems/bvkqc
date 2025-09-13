import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { DEFECT_API} from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const defectMasterApi = createApi({
  reducerPath: "defectMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["Defect"],
  endpoints: (builder) => ({
    getDefect: builder.query({
      query: ({params, searchParams}) => {
        if(searchParams){
          return {
            url: DEFECT_API +"/search/"+searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: DEFECT_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["Defect"],
    }),
    getDefectById: builder.query({
      query: (id) => {
        return {
          url: `${DEFECT_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["Defect"],
    }),
    addDefect: builder.mutation({
      query: (payload) => ({
        url: DEFECT_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["Defect"],
    }),
    updateDefect: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${DEFECT_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["Defect"],
    }),
    deleteDefect: builder.mutation({
      query: (id) => ({
        url: `${DEFECT_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Defect"],
    }),
  }),
});

export const {
  useGetDefectQuery,
  useGetDefectByIdQuery,
  useAddDefectMutation,
  useUpdateDefectMutation,
  useDeleteDefectMutation,
} = defectMasterApi;

export default defectMasterApi;
