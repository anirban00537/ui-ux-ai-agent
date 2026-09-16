import { useQuery } from "@tanstack/react-query";
import { getPosts, getPost, getBlogCategories } from "@/services/blog";

export const usePosts = (params: any) => {
  return useQuery({
    queryKey: ["posts", params],
    queryFn: () => getPosts(params),
  });
};

export const usePost = (slug: string) => {
  return useQuery({
    queryKey: ["post", slug],
    queryFn: () => getPost(slug),
    enabled: !!slug,
  });
};

export const useBlogCategories = () => {
  return useQuery({
    queryKey: ["blog-categories"],
    queryFn: getBlogCategories,
  });
};
