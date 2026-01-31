import { ImageContentSchema, type ImageContent } from "@/types";

export const createImageContent = (imageUrl: string = "", alt?: string, attribution?: { name: string; link: string }): ImageContent => ({
  type: "image",
  imageUrl,
  alt: alt || "",
  caption: "",
  objectFit: "cover",
  attribution,
});

export const normalizeImageContent = (content: any): ImageContent => {
  const result = ImageContentSchema.safeParse(content);
  if (result.success) {
    return result.data;
  }
  
  return {
    type: "image",
    imageUrl: typeof content?.imageUrl === "string" ? content.imageUrl : "",
    alt: typeof content?.alt === "string" ? content.alt : "",
    caption: typeof content?.caption === "string" ? content.caption : "",
    width: typeof content?.width === "number" ? content.width : undefined,
    height: typeof content?.height === "number" ? content.height : undefined,
    objectFit: ["cover", "contain", "fill"].includes(content?.objectFit) ? content.objectFit : "cover",
    attribution: content?.attribution ? {
      name: typeof content.attribution.name === "string" ? content.attribution.name : "Unsplash",
      link: typeof content.attribution.link === "string" ? content.attribution.link : "https://unsplash.com",
    } : undefined,
  };
};
