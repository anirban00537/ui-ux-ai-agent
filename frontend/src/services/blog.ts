import request from "@/lib/request";
import axios from "axios";

export const getPosts = async (params: any) => {
  const response = await request.get("/blog/posts", { params });
  return response.data;
};

export const getPost = async (slug: string) => {
  const response = await request.get(`/blog/posts/${slug}`);
  return response.data;
};

export const getBlogCategories = async () => {
  const response = await request.get("/blog/categories");
  return response.data;
};

// SSR Functions (Bypass request interceptors that use js-cookie)
const getApiUrl = () => {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    console.error("[Blog SSR] CRITICAL: NEXT_PUBLIC_API_URL is not set!");
  }
  return url || "";
};

const getApiSecret = () => {
  return process.env.NEXT_PUBLIC_API_SECRET || "";
};


export const getPostsSSR = async (params: any) => {
  const API_URL = getApiUrl();
  const API_SECRET = getApiSecret();
  
  if (!API_URL) {
    console.error("[getPostsSSR] Cannot fetch: API_URL is empty");
    return null;
  }
  
  const fullUrl = `${API_URL}/blog/posts`;
  console.log("[getPostsSSR] Fetching from:", fullUrl);
  
  try {
    const { data: response } = await axios.get(fullUrl, {
      params,
      headers: {
        "Content-Type": "application/json",
        "apisecretkeycheck": API_SECRET
      },
      timeout: 10000 // 10 second timeout
    });
    
    console.log("[getPostsSSR] Response success:", response?.success, "Posts count:", response?.data?.posts?.length || 0);
    // ResponseModel: { success, message, data: { posts, total } }
    return response;
  } catch (error: any) {
    console.error("[getPostsSSR] ERROR:", error?.response?.status || "No status", error?.message);
    console.error("[getPostsSSR] Request URL:", fullUrl);
    console.error("[getPostsSSR] Response data:", error?.response?.data);
    return null;
  }
};

export const getPostSSR = async (slug: string) => {
  const API_URL = getApiUrl();
  const API_SECRET = getApiSecret();
  
  if (!API_URL) {
    console.error("[getPostSSR] Cannot fetch: API_URL is empty");
    return null;
  }
  
  const fullUrl = `${API_URL}/blog/posts/${slug}`;
  console.log("[getPostSSR] Fetching from:", fullUrl);
  
  try {
    const { data: response } = await axios.get(fullUrl, {
      headers: {
        "Content-Type": "application/json",
        "apisecretkeycheck": API_SECRET
      },
      timeout: 10000
    });
    
    console.log("[getPostSSR] Response success:", response?.success);
    // ResponseModel: { success, message, data: post }
    if (response?.success && response?.data) {
      return response.data;
    }
    return null;
  } catch (error: any) {
    console.error("[getPostSSR] ERROR:", error?.response?.status || "No status", error?.message);
    console.error("[getPostSSR] Request URL:", fullUrl);
    console.error("[getPostSSR] Response data:", error?.response?.data);
    return null;
  }
};
