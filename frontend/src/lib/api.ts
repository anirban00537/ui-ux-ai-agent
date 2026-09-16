import request from "./request";
import type { AxiosRequestConfig } from "axios";
import type { ApiResponse } from "@/types/api.types";

export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const handleResponse = <T>(response: any): ApiResponse<T> => {
  const data = response.data;
  if (data && data.success === false) {
    throw new ApiError(data.message || "Operation failed", response.status);
  }
  return data;
};

const handleError = (error: any): never => {
  if (error instanceof ApiError) throw error;
  
  const message = error.response?.data?.message || 
                  error.response?.data?.error || 
                  error.message || 
                  "An unexpected error occurred";
  
  throw new ApiError(message, error.response?.status);
};

export const api = {
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    try {
      const response = await request.get(url, config);
      return handleResponse<T>(response);
    } catch (error) {
      return handleError(error);
    }
  },

  post: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    try {
      const response = await request.post(url, data, config);
      return handleResponse<T>(response);
    } catch (error) {
      return handleError(error);
    }
  },

  put: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    try {
      const response = await request.put(url, data, config);
      return handleResponse<T>(response);
    } catch (error) {
      return handleError(error);
    }
  },

  patch: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    try {
      const response = await request.patch(url, data, config);
      return handleResponse<T>(response);
    } catch (error) {
      return handleError(error);
    }
  },

  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    try {
      const response = await request.delete(url, config);
      return handleResponse<T>(response);
    } catch (error) {
      return handleError(error);
    }
  },
};
