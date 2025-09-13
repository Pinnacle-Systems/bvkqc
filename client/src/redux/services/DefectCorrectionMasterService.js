import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { DEFECT_CORRECTION_API} from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const defectCorrectionMasterApi = createApi({
  reducerPath: "defectCorrectionMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["defectCorrection"],
  endpoints: (builder) => ({
    getdefectCorrection: builder.query({
      query: ({params, searchParams}) => {
        if(searchParams){
          return {
            url: DEFECT_CORRECTION_API +"/search/"+searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: DEFECT_CORRECTION_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["defectCorrection"],
    }),
    getdefectCorrectionById: builder.query({
      query: (id) => {
        return {
          url: `${DEFECT_CORRECTION_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["defectCorrection"],
    }),
    adddefectCorrection: builder.mutation({
      query: (payload) => ({
        url: DEFECT_CORRECTION_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["defectCorrection"],
    }),
    updatedefectCorrection: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${DEFECT_CORRECTION_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["defectCorrection"],
    }),
    deletedefectCorrection: builder.mutation({
      query: (id) => ({
        url: `${DEFECT_CORRECTION_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["defectCorrection"],
    }),
  }),
});

export const {
  useGetdefectCorrectionQuery,
  useGetdefectCorrectionByIdQuery,
  useAdddefectCorrectionMutation,
  useUpdatedefectCorrectionMutation,
  useDeletedefectCorrectionMutation,
} = defectCorrectionMasterApi;

export default defectCorrectionMasterApi;
