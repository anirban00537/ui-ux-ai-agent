import { useQuery } from "@tanstack/react-query";
import { getProducts, getProduct, type Product } from "@/services/pricing";

// Query keys
export const pricingKeys = {
  all: ["pricing"] as const,
  products: () => [...pricingKeys.all, "products"] as const,
  product: (id: string) => [...pricingKeys.all, "product", id] as const,
};

// Get all products
export const useProducts = () => {
  return useQuery({
    queryKey: pricingKeys.products(),
    queryFn: async () => {
      const response = await getProducts();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

// Get product by ID
export const useProduct = (productId: string | null) => {
  return useQuery({
    queryKey: productId ? pricingKeys.product(productId) : ["product", "null"],
    queryFn: () => {
      if (!productId) {
        throw new Error("Product ID is required");
      }
      return getProduct(productId);
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

