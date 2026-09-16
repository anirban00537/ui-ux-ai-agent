import { z } from "zod";

export const CardDesignPatternSchema = z.enum([
  "none",
  "gaussian",
  "fractal",
  "fluid",
  "prism",
  "beams",
  "aurora",
  "nebula",
  "ether",
  "lumina",
  "horizon",
  "pulse",
  "vortex",
  "echo",
  "apex",
  "arch",
]);

export const ThemeSchema = z.object({
  primary: z.string(),
  secondaryColors: z.array(z.string()).optional(),
  headingColor: z.string(),
  bodyColor: z.string(),
  cardBackground: z.string(),
  pageBackground: z.string(),
  fontFamily: z.string().optional(),
  themeType: z.enum(["light", "dark"]).optional(),

  // Card customization
  cardDesignPattern: CardDesignPatternSchema.optional(),
  cardDesignPatternOpacity: z.number().optional(),
  borderColor: z.string().optional(),
  cardBorderRadius: z.string().optional(),
  cardBoxShadow: z.string().optional(),
  cardBorderWidth: z.string().optional(),
  cardBorderStyle: z.string().optional(),
  cardBackdropBlur: z.string().optional(),
  cardOpacity: z.number().optional(),

  // Texture & Overlays
  cardNoiseOpacity: z.number().optional(),
  cardVignetteOpacity: z.number().optional(),
});
