import axios from "axios";

const request = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    apisecretkeycheck: process.env.NEXT_PUBLIC_API_SECRET,
  },
});

request.interceptors.request.use((config: any) => {
  return config;
});
request.interceptors.response.use((response: any) => {
  return response;
});

export function apiRequest(base: any, query: any | null) {
  if (query === null) {
    return request(base);
  } else {
    return axios.get(base + query);
  }
}
export default request;